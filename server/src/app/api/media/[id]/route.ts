import { NextResponse, type NextRequest } from 'next/server';
import { withApiErrors } from '@/lib/http';
import { readUploadedImage } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiErrors(async (_request: NextRequest, context) => {
  const { id } = await context.params;
  const image = await readUploadedImage(id as string);
  return new NextResponse(image.body, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(image.body.byteLength),
      'Content-Type': image.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
