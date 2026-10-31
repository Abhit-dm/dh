import type { NextRequest } from 'next/server';
import { AdminRole } from '@/generated/prisma/enums';
import type { AdminUser } from '@/generated/prisma/client';
import { ApiError } from '@/lib/http';
import { getPrisma } from '@/lib/prisma';
import { hashSessionToken } from '@/lib/security';

export type AuthenticatedAdmin = Pick<
  AdminUser,
  'id' | 'email' | 'name' | 'role' | 'isActive'
>;

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedAdmin> {
  const token = request.cookies.get('dh_admin_session')?.value;
  if (!token || token.length > 128) {
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Sign in to continue.');
  }

  const now = new Date();
  const session = await getPrisma().adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      expiresAt: true,
      lastUsedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= now || !session.user.isActive) {
    if (session) {
      await getPrisma().adminSession.deleteMany({ where: { id: session.id } });
    }
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Sign in to continue.');
  }

  if (!session.lastUsedAt || now.getTime() - session.lastUsedAt.getTime() > 5 * 60_000) {
    await getPrisma().adminSession.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    });
  }

  return session.user;
}

export function requireRole(
  user: AuthenticatedAdmin,
  allowedRoles: AdminRole[],
) {
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to do this.');
  }
}
