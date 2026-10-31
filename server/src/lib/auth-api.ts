import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, readJson } from '@/lib/http';
import { getPrisma } from '@/lib/prisma';
import {
  adminLoginSchema,
} from '@/lib/validation';
import {
  assertSameOrigin,
  clearSessionCookie,
  createOpaqueSessionToken,
  hashPassword,
  hashSessionToken,
  setSessionCookie,
  verifyPassword,
  duplicateProtectionKey,
} from '@/lib/security';
import type { AuthenticatedAdmin } from '@/lib/auth';
import { adminProfileUpdateSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60_000;
const LOGIN_RATE_LIMIT_MAX = 20;

const INVALID_DUMMY_PASSWORD_HASH = 'invalid-scrypt-hash';

export async function login(request: NextRequest) {
  assertSameOrigin(request);
  const now = new Date();
  const bucketStart =
    Math.floor(now.getTime() / LOGIN_RATE_LIMIT_WINDOW_MS) *
    LOGIN_RATE_LIMIT_WINDOW_MS;
  const forwardedIp = request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const rateLimitKey = duplicateProtectionKey(
    `admin-login|${forwardedIp}|${bucketStart}`,
  );
  await getPrisma().publicSubmissionRateLimit.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  const rateLimit = await getPrisma().publicSubmissionRateLimit.upsert({
    where: { key: rateLimitKey },
    create: {
      key: rateLimitKey,
      attempts: 1,
      expiresAt: new Date(bucketStart + LOGIN_RATE_LIMIT_WINDOW_MS),
    },
    update: { attempts: { increment: 1 } },
    select: { attempts: true },
  });
  if (rateLimit.attempts > LOGIN_RATE_LIMIT_MAX) {
    throw new ApiError(
      429,
      'LOGIN_RATE_LIMITED',
      'Too many sign-in attempts. Please wait 15 minutes before trying again.',
    );
  }
  const input = await readJson(request, adminLoginSchema);
  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      passwordHash: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });

  const passwordMatches = await verifyPassword(
    input.password,
    user?.passwordHash ?? INVALID_DUMMY_PASSWORD_HASH,
  );
  const locked = Boolean(user?.lockedUntil && user.lockedUntil > new Date());
  if (!user || !user.isActive || locked || !passwordMatches) {
    if (user && user.isActive && !locked) {
      await prisma.$transaction(async (transaction) => {
        await transaction.adminUser.updateMany({
          where: { id: user.id, failedLoginAttempts: { lt: 8 } },
          data: { failedLoginAttempts: { increment: 1 } },
        });
        const latest = await transaction.adminUser.findUnique({
          where: { id: user.id },
          select: { failedLoginAttempts: true },
        });
        if (latest && latest.failedLoginAttempts >= 8) {
          await transaction.adminUser.update({
            where: { id: user.id },
            data: { lockedUntil: new Date(Date.now() + 15 * 60_000) },
          });
        }
      });
    }
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const token = createOpaqueSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.adminSession.create({
      data: { tokenHash: hashSessionToken(token), userId: user.id, expiresAt },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'LOGIN',
        resource: 'admin-session',
      },
    }),
  ]);

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.headers.append('Set-Cookie', setSessionCookie(token));
  return response;
}

export async function updateAdminProfile(
  request: NextRequest,
  admin: AuthenticatedAdmin,
) {
  const input = await readJson(request, adminProfileUpdateSchema);
  const prisma = getPrisma();
  const existing = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });
  if (!existing) {
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Sign in to continue.');
  }
  if (
    input.newPassword &&
    !(await verifyPassword(input.currentPassword ?? '', existing.passwordHash))
  ) {
    throw new ApiError(400, 'CURRENT_PASSWORD_INVALID', 'Your current password is incorrect.');
  }

  const { currentPassword, newPassword, ...profile } = input;
  const result = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.adminUser.update({
      where: { id: admin.id },
      data: {
        ...profile,
        ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    if (newPassword) {
      const currentToken = request.cookies.get('dh_admin_session')?.value;
      if (currentToken) {
        await transaction.adminSession.deleteMany({
          where: {
            userId: admin.id,
            tokenHash: { not: hashSessionToken(currentToken) },
          },
        });
      } else {
        await transaction.adminSession.deleteMany({ where: { userId: admin.id } });
      }
    }
    await recordAudit(transaction, {
      actorId: admin.id,
      action: 'UPDATE_PROFILE',
      resource: 'admin-profile',
      resourceId: admin.id,
      fields: [
        ...(profile.name ? ['name'] : []),
        ...(profile.email ? ['email'] : []),
        ...(newPassword ? ['password'] : []),
      ],
    });
    return updated;
  });

  return NextResponse.json({ data: result }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function logout(request: NextRequest) {
  assertSameOrigin(request);
  const token = request.cookies.get('dh_admin_session')?.value;
  if (token && token.length <= 128) {
    const tokenHash = hashSessionToken(token);
    const session = await getPrisma().adminSession.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true },
    });
    if (session) {
      await getPrisma().$transaction([
        getPrisma().adminSession.delete({ where: { id: session.id } }),
        getPrisma().auditLog.create({
          data: {
            actorId: session.userId,
            action: 'LOGOUT',
            resource: 'admin-session',
          },
        }),
      ]);
    }
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}

export function sessionResponse(user: AuthenticatedAdmin) {
  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
