import type { NextRequest } from 'next/server';
import { AdminRole } from '@/generated/prisma/enums';
import { requireAdmin } from '@/lib/auth';
import { assertEditableResource, authorizeResource } from '@/lib/admin-api';
import {
  getDashboardSummary,
  createAdminResource,
  deleteAdminResource,
  getAdminResource,
  listAdminResource,
  updateAdminResource,
} from '@/lib/admin-api';
import { ApiError, withApiErrors } from '@/lib/http';
import { assertSameOrigin } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function parsePath(context: { params: Promise<Record<string, string | string[]>> }) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length < 1 || path.length > 2) {
    throw new ApiError(404, 'NOT_FOUND', 'Administrative resource not found.');
  }
  const [resource, id] = path;
  if (!resource) throw new ApiError(404, 'NOT_FOUND', 'Administrative resource not found.');
  return { resource, id };
}

export const GET = withApiErrors(async (request: NextRequest, context) => {
  const { resource, id } = await parsePath(context);
  if (resource === 'dashboard' && id === 'summary') {
    const user = await requireAdmin(request);
    authorizeResource(user, 'appointments');
    return getDashboardSummary();
  }
  assertEditableResource(resource);
  const user = await requireAdmin(request);
  authorizeResource(user, resource);
  if (
    id &&
    resource !== 'website-settings' &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new ApiError(400, 'INVALID_ID', 'Record ID must be a UUID.');
  }
  return id
    ? getAdminResource(resource, id)
    : listAdminResource(request, resource);
});

export const POST = withApiErrors(async (request: NextRequest, context) => {
  assertSameOrigin(request);
  const { resource, id } = await parsePath(context);
  if (id) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Use the resource collection endpoint.');
  assertEditableResource(resource);
  const user = await requireAdmin(request);
  authorizeResource(user, resource);
  return createAdminResource(resource, request, user);
});

export const PATCH = withApiErrors(async (request: NextRequest, context) => {
  assertSameOrigin(request);
  const { resource, id } = await parsePath(context);
  if (!id) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'A record ID is required.');
  assertEditableResource(resource);
  const user = await requireAdmin(request);
  authorizeResource(user, resource);
  if (
    resource !== 'website-settings' &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new ApiError(400, 'INVALID_ID', 'Record ID must be a UUID.');
  }
  return updateAdminResource(resource, id, request, user);
});

export const DELETE = withApiErrors(async (request: NextRequest, context) => {
  assertSameOrigin(request);
  const { resource, id } = await parsePath(context);
  if (!id) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'A record ID is required.');
  assertEditableResource(resource);
  const user = await requireAdmin(request);
  authorizeResource(user, resource);
  if (resource === 'audit-logs' && user.role !== AdminRole.SUPER_ADMIN) {
    throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to do this.');
  }
  return deleteAdminResource(resource, id, user);
});
