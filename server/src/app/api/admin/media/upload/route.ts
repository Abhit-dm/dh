import { NextResponse, type NextRequest } from 'next/server';
import { AdminRole } from '@/generated/prisma/enums';
import { requireAdmin } from '@/lib/auth';
import { authorizeResource } from '@/lib/admin-api';
import { ApiError, withApiErrors } from '@/lib/http';
import { MAX_UPLOAD_BYTES, saveUploadedImage } from '@/lib/media';
import { assertSameOrigin } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withApiErrors(async (request: NextRequest) => {
  assertSameOrigin(request);
  const actor = await requireAdmin(request);
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES + 32 * 1024) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Image uploads are limited to 5 MB.');
  }

  const form = await request.formData();
  const resource = form.get('resource');
  if (
    resource !== 'doctors' &&
    resource !== 'services' &&
    resource !== 'gallery-images' &&
    resource !== 'blog-posts' &&
    resource !== 'website-settings'
  ) {
    throw new ApiError(400, 'INVALID_RESOURCE', 'Choose a supported image destination.');
  }
  if (
    actor.role === AdminRole.EDITOR &&
    !['gallery-images', 'blog-posts'].includes(resource)
  ) {
    throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to upload this image.');
  }
  authorizeResource(actor, resource);
  const file = form.get('file');
  if (!(file instanceof File)) {
    throw new ApiError(400, 'IMAGE_REQUIRED', 'Choose an image to upload.');
  }
  return NextResponse.json(
    { data: await saveUploadedImage(file) },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
});
