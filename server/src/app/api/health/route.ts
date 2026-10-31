import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withApiErrors } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiErrors(async () => {
  await getPrisma().$queryRaw`SELECT 1`;
  return NextResponse.json(
    { status: 'ok', database: 'connected' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
});
