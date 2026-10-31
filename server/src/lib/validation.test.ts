import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import {
  appointmentCreateSchema,
  contactMessageCreateSchema,
  phoneSchema,
} from '@/lib/validation';
import { paginatedQuery } from '@/lib/http';

const validAppointment = {
  patientName: '  Patient Name  ',
  phone: '+91 (98765) 43210',
  departmentSlug: 'child-care',
  preferredDate: '2099-12-01',
  preferredTime: '09:30',
  privacyConsent: true,
};

test('accepts and normalizes a valid Indian mobile number', () => {
  assert.equal(phoneSchema.parse('+91 (98765) 43210'), '+91 (98765) 43210');
  assert.equal(phoneSchema.safeParse('1234567890').success, false);
});

test('validates appointment enquiry fields and rejects unrequested clinical data', () => {
  const parsed = appointmentCreateSchema.parse(validAppointment);
  assert.equal(parsed.patientName, 'Patient Name');

  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      preferredDate: '2025-02-31',
    }).success,
    false,
  );
  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      clinicalHistory: 'unnecessary clinical data',
    }).success,
    false,
  );
  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      privacyConsent: false,
    }).success,
    false,
  );
  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      patientAge: 12,
    }).success,
    false,
  );
  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      patientAge: 12,
      parentGuardianName: 'Parent Name',
    }).success,
    true,
  );
  assert.equal(
    appointmentCreateSchema.safeParse({
      ...validAppointment,
      website: 'filled by a spam bot',
    }).success,
    true,
  );
});

test('requires a concise message and rejects invalid departments for contact enquiries', () => {
  const validContact = {
    name: 'Patient Name',
    phone: '9876543210',
    departmentSlug: 'eye-care',
    message: 'Please call me about clinic timings.',
  };
  assert.equal(contactMessageCreateSchema.safeParse(validContact).success, true);
  assert.equal(
    contactMessageCreateSchema.safeParse({ ...validContact, message: ' ' }).success,
    false,
  );
  assert.equal(
    contactMessageCreateSchema.safeParse({ ...validContact, unexpected: true }).success,
    false,
  );
  assert.equal(
    contactMessageCreateSchema.safeParse({ ...validContact, website: 'spam' }).success,
    true,
  );
});

test('enforces bounded one-based pagination', () => {
  const request = new NextRequest(
    'http://localhost:3001/api/admin/doctors?page=2&pageSize=50',
  );
  assert.deepEqual(paginatedQuery(request), {
    page: 2,
    pageSize: 50,
    skip: 50,
    take: 50,
  });

  const invalidRequest = new NextRequest(
    'http://localhost:3001/api/admin/doctors?page=0&pageSize=101',
  );
  assert.throws(() => paginatedQuery(invalidRequest), { code: 'INVALID_PAGINATION' });
});
