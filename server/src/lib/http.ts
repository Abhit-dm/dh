import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { ZodError, type ZodType } from 'zod';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function readJson<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 16_384) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  if (!request.body) {
    throw new ApiError(400, 'INVALID_JSON', 'A JSON request body is required.');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 16_384) {
        await reader.cancel();
        throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'INVALID_JSON', 'The request body could not be read.');
  }

  let payload: unknown;
  try {
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must contain valid JSON.');
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        error.issues
          .map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`)
          .join(' '),
      );
    }
    throw error;
  }
}

export function apiErrorResponse(error: unknown, requestId: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message }, requestId },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_RECORD',
            message: 'A matching record already exists.',
          },
          requestId,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Record not found.' }, requestId },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (error.code === 'P2003' || error.code === 'P2014') {
      return NextResponse.json(
        {
          error: {
            code: 'RELATED_RECORD_EXISTS',
            message: 'This record is still referenced and cannot be removed.',
          },
          requestId,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }
  }

  const prismaCode =
    error instanceof Prisma.PrismaClientInitializationError ? error.errorCode : undefined;
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P1000', 'P1001', 'P1002', 'P1003', 'P1017'].includes(error.code))
  ) {
    console.error('[api]', { requestId, databaseCode: prismaCode ?? 'DATABASE_ERROR' });
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'The service is temporarily unavailable. Please try again later.',
        },
        requestId,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  console.error('[api]', {
    requestId,
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
  return NextResponse.json(
    {
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      requestId,
    },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function withApiErrors(
  handler: (request: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string | string[]>> },
  ) => {
    const requestId = crypto.randomUUID();
    try {
      return await handler(request, context);
    } catch (error) {
      return apiErrorResponse(error, requestId);
    }
  };
}

export function paginatedQuery(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 20);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    throw new ApiError(
      400,
      'INVALID_PAGINATION',
      'Page must be a positive integer and pageSize must be between 1 and 100.',
    );
  }
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function pageResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
