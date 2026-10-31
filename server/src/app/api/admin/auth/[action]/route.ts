import type { NextRequest } from 'next/server';
import { withApiErrors, ApiError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { login, logout, sessionResponse, updateAdminProfile } from '@/lib/auth-api';
import { assertSameOrigin } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withApiErrors(async (request: NextRequest, context) => {
  const { action } = await context.params;
  if (action === 'login') return login(request);
  if (action === 'logout') return logout(request);
  throw new ApiError(404, 'NOT_FOUND', 'Authentication action not found.');
});

export const GET = withApiErrors(async (request: NextRequest, context) => {
  const { action } = await context.params;
  if (action === 'profile') {
    return sessionResponse(await requireAdmin(request));
  }
  if (action !== 'session') {
    throw new ApiError(404, 'NOT_FOUND', 'Authentication action not found.');
  }
  return sessionResponse(await requireAdmin(request));
});

export const PATCH = withApiErrors(async (request: NextRequest, context) => {
  const { action } = await context.params;
  if (action !== 'profile') {
    throw new ApiError(404, 'NOT_FOUND', 'Authentication action not found.');
  }
  assertSameOrigin(request);
  return updateAdminProfile(request, await requireAdmin(request));
});
