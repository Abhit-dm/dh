import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { NextRequest } from 'next/server';

const appOrigin = 'http://localhost:3001';
process.env.APP_ORIGIN = appOrigin;
process.env.DATA_HASH_SECRET = 'integration-test-secret-at-least-32-bytes';

async function availablePort() {
  const listener = createServer();
  await new Promise<void>((resolveListen, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolveListen);
  });
  const address = listener.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to allocate an embedded database port.');
  }
  await new Promise<void>((resolveClose, reject) => {
    listener.close((error) => (error ? reject(error) : resolveClose()));
  });
  return address.port;
}

function request(
  url: string,
  method: string,
  body?: unknown,
  cookie?: string,
) {
  return new NextRequest(url, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(method !== 'GET' ? { Origin: appOrigin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const database = new PGlite();
await database.waitReady;
const databaseServer = new PGLiteSocketServer({
  db: database,
  host: '127.0.0.1',
  maxConnections: 4,
  port: await availablePort(),
});

try {
  await databaseServer.start();
  process.env.DATABASE_URL =
    `postgresql://postgres:postgres@${databaseServer.getServerConn()}/postgres`;

  for (const migration of [
    '20261031000000_initial',
    '20261031100000_appointment-reference-consent-rate-limit',
    '20261031120000_dashboard_gallery-category',
  ]) {
    const sql = await readFile(
      resolve('prisma', 'migrations', migration, 'migration.sql'),
      'utf8',
    );
    await database.exec(sql);
  }

  const [{ PrismaPg }, { PrismaClient, AdminRole }, security] =
    await Promise.all([
      import('@prisma/adapter-pg'),
      import('@/generated/prisma/client'),
      import('@/lib/security'),
    ]);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const department = await prisma.department.create({
      data: { slug: 'child-care', name: 'Child Care' },
    });
    const password = 'Integration-test-password-123!';
    await prisma.adminUser.create({
      data: {
        email: 'admin@example.test',
        name: 'Integration Admin',
        role: AdminRole.SUPER_ADMIN,
        passwordHash: await security.hashPassword(password),
      },
    });

    const [{ POST: createPublicRequest }, adminRoutes, authRoutes, validation] =
      await Promise.all([
        import('@/app/api/public/[resource]/route'),
        import('@/app/api/admin/[...path]/route'),
        import('@/app/api/admin/auth/[action]/route'),
        import('@/lib/validation'),
      ]);
    const date = new Date(
      `${validation.todayInHospitalTimezone()}T00:00:00.000Z`,
    );
    date.setUTCDate(date.getUTCDate() + 3);
    const preferredDate = date.toISOString().slice(0, 10);
    const appointmentInput = {
      patientName: 'Test Patient',
      parentGuardianName: 'Test Guardian',
      phone: '9876543210',
      email: 'patient@example.test',
      patientAge: 7,
      departmentSlug: department.slug,
      preferredDate,
      preferredTime: '10:30',
      message: 'Integration workflow test',
      privacyConsent: true,
    };

    const appointmentContext = {
      params: Promise.resolve({ resource: 'appointments' }),
    };
    const appointmentResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/appointments`,
        'POST',
        appointmentInput,
      ),
      appointmentContext,
    );
    assert.equal(appointmentResponse.status, 201);
    const appointmentBody = await appointmentResponse.json();
    assert.match(appointmentBody.data.reference, /^DH-\d{8}-[A-F0-9]{10}$/);
    assert.equal(appointmentBody.data.status, 'PENDING');

    const duplicateAppointmentResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/appointments`,
        'POST',
        appointmentInput,
      ),
      appointmentContext,
    );
    const duplicateAppointmentBody = await duplicateAppointmentResponse.json();
    assert.equal(duplicateAppointmentBody.duplicate, true);
    assert.equal(
      duplicateAppointmentBody.data.id,
      appointmentBody.data.id,
    );
    assert.equal(await prisma.appointment.count(), 1);
    assert.equal(
      (await prisma.appointment.findUniqueOrThrow({
        where: { id: appointmentBody.data.id },
      })).privacyConsent,
      true,
    );

    const invalidAppointmentResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/appointments`,
        'POST',
        { ...appointmentInput, privacyConsent: false },
      ),
      appointmentContext,
    );
    assert.equal(invalidAppointmentResponse.status, 400);

    const contactInput = {
      name: 'Test Enquiry',
      phone: '9123456789',
      email: 'contact@example.test',
      departmentSlug: department.slug,
      message: 'Integration contact enquiry',
    };
    const contactContext = {
      params: Promise.resolve({ resource: 'contact-messages' }),
    };
    const contactResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/contact-messages`,
        'POST',
        contactInput,
      ),
      contactContext,
    );
    assert.equal(contactResponse.status, 201);
    const contactBody = await contactResponse.json();
    assert.equal(contactBody.data.status, 'NEW');

    const duplicateContactResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/contact-messages`,
        'POST',
        contactInput,
      ),
      contactContext,
    );
    const duplicateContactBody = await duplicateContactResponse.json();
    assert.equal(duplicateContactBody.duplicate, true);
    assert.equal(duplicateContactBody.data.id, contactBody.data.id);
    assert.equal(await prisma.contactMessage.count(), 1);

    const loginResponse = await authRoutes.POST(
      request(
        `${appOrigin}/api/admin/auth/login`,
        'POST',
        { email: 'admin@example.test', password },
      ),
      { params: Promise.resolve({ action: 'login' }) },
    );
    assert.equal(loginResponse.status, 200);
    const cookie = loginResponse.headers
      .getSetCookie()
      .find((value) => value.startsWith('dh_admin_session='))
      ?.split(';', 1)[0];
    assert.ok(cookie, 'admin login should issue an HTTP-only session cookie');

    const appointmentsResponse = await adminRoutes.GET(
      request(
        `${appOrigin}/api/admin/appointments`,
        'GET',
        undefined,
        cookie,
      ),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    const appointmentsBody = await appointmentsResponse.json();
    assert.equal(appointmentsResponse.status, 200);
    assert.equal(appointmentsBody.data[0].reference, appointmentBody.data.reference);
    assert.equal(appointmentsBody.data[0].status, 'PENDING');

    const updateAppointmentResponse = await adminRoutes.PATCH(
      request(
        `${appOrigin}/api/admin/appointments/${appointmentBody.data.id}`,
        'PATCH',
        { status: 'CONFIRMED' },
        cookie,
      ),
      {
        params: Promise.resolve({
          path: ['appointments', appointmentBody.data.id],
        }),
      },
    );
    const updatedAppointmentBody = await updateAppointmentResponse.json();
    assert.equal(updateAppointmentResponse.status, 200);
    assert.equal(updatedAppointmentBody.data.status, 'CONFIRMED');

    const updateContactResponse = await adminRoutes.PATCH(
      request(
        `${appOrigin}/api/admin/contact-messages/${contactBody.data.id}`,
        'PATCH',
        { status: 'READ' },
        cookie,
      ),
      {
        params: Promise.resolve({
          path: ['contact-messages', contactBody.data.id],
        }),
      },
    );
    const updatedContactBody = await updateContactResponse.json();
    assert.equal(updateContactResponse.status, 200);
    assert.equal(updatedContactBody.data.status, 'READ');
    assert.equal(await prisma.auditLog.count(), 3);
    console.log(
      'Sprint 3 workflow integration passed: appointment, contact, duplicate protection, consent validation, admin login, lists, and status updates.',
    );
  } finally {
    await prisma.$disconnect();
  }
} finally {
  await databaseServer.stop();
  await database.close();
}
