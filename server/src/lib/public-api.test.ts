import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/public/[resource]/route';
import { createAppointmentReference } from '@/lib/public-api';

test('creates a compact, date-scoped public appointment reference', () => {
  const first = createAppointmentReference('2026-10-31');
  const second = createAppointmentReference('2026-10-31');

  assert.match(first, /^DH-20261031-[A-F0-9]{10}$/);
  assert.notEqual(first, second);
});

test('rejects appointment honeypot submissions without touching PostgreSQL', async () => {
  const request = new NextRequest('http://localhost:3001/api/public/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Spam',
      phone: '9876543210',
      departmentSlug: 'child-care',
      preferredDate: '2099-12-01',
      preferredTime: '09:30',
      privacyConsent: true,
      website: 'filled by a bot',
    }),
  });
  const response = await POST(request, {
    params: Promise.resolve({ resource: 'appointments' }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.error.code, 'SPAM_DETECTED');
});

test('rejects contact honeypot submissions without touching PostgreSQL', async () => {
  const request = new NextRequest('http://localhost:3001/api/public/contact-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Spam',
      phone: '9876543210',
      message: 'Automated content',
      website: 'filled by a bot',
    }),
  });
  const response = await POST(request, {
    params: Promise.resolve({ resource: 'contact-messages' }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.error.code, 'SPAM_DETECTED');
});
