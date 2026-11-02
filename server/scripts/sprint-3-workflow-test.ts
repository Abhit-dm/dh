import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createSqliteTestDatabase } from './sqlite-test-database';

const appOrigin = 'http://localhost:3001';
process.env.APP_ORIGIN = appOrigin;
process.env.DATA_HASH_SECRET = 'integration-test-secret-at-least-32-bytes';

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

const testDatabase = await createSqliteTestDatabase();

try {
  const [{ PrismaBetterSqlite3 }, { PrismaClient, AdminRole }, security] =
    await Promise.all([
      import('@prisma/adapter-better-sqlite3'),
      import('@/generated/prisma/client'),
      import('@/lib/security'),
    ]);
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: testDatabase.url }),
  });

  try {
    const { GET: healthCheck } = await import('@/app/api/health/route');
    const healthResponse = await healthCheck(
      request(`${appOrigin}/api/health`, 'GET'),
      { params: Promise.resolve({}) },
    );
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await healthResponse.json(), {
      status: 'ok',
      database: 'connected',
    });

    const department = await prisma.department.create({
      data: { slug: 'child-care', name: 'Child Care' },
    });
    const eyeDepartment = await prisma.department.create({
      data: { slug: 'eye-care', name: 'Eye Care' },
    });
    const doctor = await prisma.doctor.create({
      data: {
        name: 'Registered Test Doctor',
        qualifications: 'Verified qualification',
        specialty: 'Pediatrician',
        departmentId: department.id,
      },
    });
    const eyeDoctor = await prisma.doctor.create({
      data: {
        name: 'Registered Eye Doctor',
        qualifications: 'Verified qualification',
        specialty: 'Ophthalmologist',
        departmentId: eyeDepartment.id,
      },
    });
    const inactiveDoctor = await prisma.doctor.create({
      data: {
        name: 'Inactive Test Doctor',
        qualifications: 'Verified qualification',
        specialty: 'Pediatrician',
        departmentId: department.id,
        isActive: false,
      },
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

    const [{ GET: readPublicRequest, POST: createPublicRequest }, adminRoutes, authRoutes, validation] =
      await Promise.all([
        import('@/app/api/public/[resource]/route'),
        import('@/app/api/admin/[...path]/route'),
        import('@/app/api/admin/auth/[action]/route'),
        import('@/lib/validation'),
      ]);
    const doctorContext = { params: Promise.resolve({ resource: 'doctors' }) };
    const allDoctorsResponse = await readPublicRequest(
      request(`${appOrigin}/api/public/doctors`, 'GET'),
      doctorContext,
    );
    const allDoctors = (await allDoctorsResponse.json()).data;
    assert.deepEqual(
      allDoctors.map((item: { id: string }) => item.id).sort(),
      [doctor.id, eyeDoctor.id].sort(),
    );
    const filteredDoctorsResponse = await readPublicRequest(
      request(`${appOrigin}/api/public/doctors?department=${department.slug}`, 'GET'),
      doctorContext,
    );
    const filteredDoctors = (await filteredDoctorsResponse.json()).data;
    assert.deepEqual(
      filteredDoctors.map((item: { id: string }) => item.id),
      [doctor.id],
    );
    assert.ok(!filteredDoctors.some((item: { id: string }) => item.id === inactiveDoctor.id));

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
      doctorId: doctor.id,
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
    assert.equal(appointmentBody.data.doctor.name, doctor.name);
    const storedAppointment = await prisma.appointment.findUniqueOrThrow({
      where: { id: appointmentBody.data.id },
    });
    assert.equal(storedAppointment.doctorId, doctor.id);

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
    const invalidDoctorResponse = await createPublicRequest(
      request(
        `${appOrigin}/api/public/appointments`,
        'POST',
        { ...appointmentInput, phone: '9876543211', doctorId: eyeDoctor.id },
      ),
      appointmentContext,
    );
    assert.equal(invalidDoctorResponse.status, 400);

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
  await testDatabase.cleanup();
}
