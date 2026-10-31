import type { NextRequest } from 'next/server';
import { ApiError, withApiErrors } from '@/lib/http';
import {
  createPublicAppointment,
  createPublicContactMessage,
  getPublicResource,
} from '@/lib/public-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiErrors(async (request: NextRequest, context) => {
  const { resource } = await context.params;
  return getPublicResource(request, resource as string);
});

export const POST = withApiErrors(async (request: NextRequest, context) => {
  const { resource } = await context.params;
  if (resource === 'appointments') return createPublicAppointment(request);
  if (resource === 'contact-messages') return createPublicContactMessage(request);
  throw new ApiError(404, 'NOT_FOUND', 'Public resource not found.');
});
