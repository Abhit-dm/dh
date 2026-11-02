import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { GET } from './route';

test('reports an actionable service error when SQLite is not configured', async () => {
  const previousUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const response = await GET(
      new NextRequest('http://localhost:3001/api/health'),
      { params: Promise.resolve({}) },
    );
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.error.code, 'DATABASE_NOT_CONFIGURED');
  } finally {
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
});
