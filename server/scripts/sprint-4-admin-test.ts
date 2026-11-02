import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { NextRequest } from 'next/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createSqliteTestDatabase } from './sqlite-test-database';

const appOrigin = 'http://localhost:3001';
process.env.APP_ORIGIN = appOrigin;
process.env.DATA_HASH_SECRET = 'sprint-4-test-secret-with-at-least-32-bytes';

function request(
  url: string,
  method: string,
  body?: unknown,
  cookie?: string,
  headers: Record<string, string> = {},
) {
  const formData = body instanceof FormData;
  return new NextRequest(url, {
    method,
    headers: {
      ...(body === undefined || formData ? {} : { 'Content-Type': 'application/json' }),
      ...(method !== 'GET' ? { Origin: appOrigin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: formData ? body : JSON.stringify(body) }),
  });
}

const testDatabase = await createSqliteTestDatabase();
const uploadDirectory = await mkdtemp(join(tmpdir(), 'dh-hospitals-sprint4-'));
process.env.UPLOAD_DIR = uploadDirectory;

try {
  const [{ PrismaBetterSqlite3 }, { PrismaClient, AdminRole }, security] = await Promise.all([
    import('@prisma/adapter-better-sqlite3'),
    import('@/generated/prisma/client'),
    import('@/lib/security'),
  ]);
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: testDatabase.url }),
  });

  try {
    const [{ GET, POST, PATCH, DELETE }, authRoutes, mediaUpload, mediaRoute] =
      await Promise.all([
        import('@/app/api/admin/[...path]/route'),
        import('@/app/api/admin/auth/[action]/route'),
        import('@/app/api/admin/media/upload/route'),
        import('@/app/api/media/[id]/route'),
      ]);
    const password = 'Sprint-4-super-admin-password-123!';
    const admin = await prisma.adminUser.create({
      data: {
        email: 'sprint4-admin@example.test',
        name: 'Sprint Four Admin',
        role: AdminRole.SUPER_ADMIN,
        passwordHash: await security.hashPassword(password),
      },
    });
    const department = await prisma.department.create({
      data: { slug: 'sprint4-general', name: 'Sprint 4 General' },
    });
    const appointmentDoctor = await prisma.doctor.create({
      data: {
        name: 'Sprint 4 Appointment Doctor',
        qualifications: 'Verified qualification',
        specialty: 'General care',
        departmentId: department.id,
      },
    });
    const appointmentDate = new Date();
    appointmentDate.setUTCDate(appointmentDate.getUTCDate() + 5);
    const appointment = await prisma.appointment.create({
      data: {
        reference: 'DH-20261105-0123456789',
        patientName: 'Sprint 4 Patient',
        phone: '9876543210',
        departmentId: department.id,
        doctorId: appointmentDoctor.id,
        preferredDate: appointmentDate,
        preferredTime: '10:00',
        privacyConsent: true,
      },
    });
    await prisma.contactMessage.create({
      data: {
        name: 'Sprint 4 Contact',
        phone: '9876543211',
        message: 'Test enquiry',
      },
    });

    const login = await authRoutes.POST(
      request(
        `${appOrigin}/api/admin/auth/login`,
        'POST',
        { email: admin.email, password },
      ),
      { params: Promise.resolve({ action: 'login' }) },
    );
    assert.equal(login.status, 200);
    const cookie = login.headers
      .getSetCookie()
      .find((value) => value.startsWith('dh_admin_session='))
      ?.split(';', 1)[0];
    assert.ok(cookie);

    const privateResponse = await GET(
      request(`${appOrigin}/api/admin/appointments`, 'GET'),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    assert.equal(privateResponse.status, 401);

    const summaryResponse = await GET(
      request(`${appOrigin}/api/admin/dashboard/summary`, 'GET', undefined, cookie),
      { params: Promise.resolve({ path: ['dashboard', 'summary'] }) },
    );
    const summary = (await summaryResponse.json()).data;
    assert.equal(summaryResponse.status, 200);
    assert.deepEqual(summary.appointments, {
      total: 1,
      pending: 1,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    });
    assert.equal(summary.totalContactMessages, 1);
    assert.equal(summary.recentAppointments[0].id, appointment.id);

    const filteredAppointments = await GET(
      request(
        `${appOrigin}/api/admin/appointments?search=sprint%204%20patient&departmentId=${department.id}&dateFrom=${appointmentDate.toISOString().slice(0, 10)}&dateTo=${appointmentDate.toISOString().slice(0, 10)}`,
        'GET',
        undefined,
        cookie,
      ),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    assert.equal(filteredAppointments.status, 200);
    assert.equal((await filteredAppointments.json()).pagination.total, 1);
    const appointmentList = await GET(
      request(
        `${appOrigin}/api/admin/appointments`,
        'GET',
        undefined,
        cookie,
      ),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    const listedAppointment = (await appointmentList.json()).data[0];
    assert.equal(listedAppointment.doctorId, appointmentDoctor.id);
    assert.equal(listedAppointment.doctor.name, appointmentDoctor.name);

    const editedAppointmentResponse = await PATCH(
      request(
        `${appOrigin}/api/admin/appointments/${appointment.id}`,
        'PATCH',
        { patientName: 'Updated Sprint Patient', message: 'Updated request' },
        cookie,
      ),
      { params: Promise.resolve({ path: ['appointments', appointment.id] }) },
    );
    const editedAppointment = (await editedAppointmentResponse.json()).data;
    assert.equal(editedAppointmentResponse.status, 200);
    assert.equal(editedAppointment.patientName, 'Updated Sprint Patient');
    assert.equal(editedAppointment.message, 'Updated request');
    assert.equal(editedAppointment.doctorId, appointmentDoctor.id);
    assert.equal(editedAppointment.doctor.name, appointmentDoctor.name);
    const confirmedResponse = await PATCH(
      request(
        `${appOrigin}/api/admin/appointments/${appointment.id}`,
        'PATCH',
        { status: 'CONFIRMED' },
        cookie,
      ),
      { params: Promise.resolve({ path: ['appointments', appointment.id] }) },
    );
    assert.equal((await confirmedResponse.json()).data.status, 'CONFIRMED');
    for (const status of ['CANCELLED', 'COMPLETED'] as const) {
      const statusResponse = await PATCH(
        request(
          `${appOrigin}/api/admin/appointments/${appointment.id}`,
          'PATCH',
          { status },
          cookie,
        ),
        { params: Promise.resolve({ path: ['appointments', appointment.id] }) },
      );
      assert.equal((await statusResponse.json()).data.status, status);
    }
    const invalidFilter = await GET(
      request(`${appOrigin}/api/admin/appointments?dateFrom=invalid`, 'GET', undefined, cookie),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    assert.equal(invalidFilter.status, 400);

    async function createResource(resource: string, value: unknown) {
      const response = await POST(
        request(`${appOrigin}/api/admin/${resource}`, 'POST', value, cookie),
        { params: Promise.resolve({ path: [resource] }) },
      );
      assert.equal(response.status, 201, `${resource} create: ${JSON.stringify(await response.clone().json())}`);
      const data = (await response.json()).data;
      const resourceId = resource === 'website-settings' ? data.key : data.id;
      const detail = await GET(
        request(`${appOrigin}/api/admin/${resource}/${encodeURIComponent(resourceId)}`, 'GET', undefined, cookie),
        { params: Promise.resolve({ path: [resource, String(resourceId)] }) },
      );
      assert.equal(
        detail.status,
        200,
        `${resource} ${JSON.stringify(data)} detail: ${JSON.stringify(await detail.clone().json())}`,
      );
      const list = await GET(
        request(`${appOrigin}/api/admin/${resource}`, 'GET', undefined, cookie),
        { params: Promise.resolve({ path: [resource] }) },
      );
      assert.equal(list.status, 200, `${resource} list`);
      assert.ok(Array.isArray((await list.json()).data));
      return data;
    }

    async function updateResource(resource: string, id: string, value: unknown) {
      const response = await PATCH(
        request(
          `${appOrigin}/api/admin/${resource}/${encodeURIComponent(id)}`,
          'PATCH',
          value,
          cookie,
        ),
        { params: Promise.resolve({ path: [resource, id] }) },
      );
      assert.equal(response.status, 200, `${resource} update: ${JSON.stringify(await response.clone().json())}`);
      return (await response.json()).data;
    }

    async function deleteResource(resource: string, id: string) {
      const response = await DELETE(
        request(
          `${appOrigin}/api/admin/${resource}/${encodeURIComponent(id)}`,
          'DELETE',
          undefined,
          cookie,
        ),
        { params: Promise.resolve({ path: [resource, id] }) },
      );
      assert.equal(response.status, 200, `${resource} delete`);
    }

    const departmentRecord = await createResource('departments', {
      slug: 'sprint4-test-unit',
      name: 'Sprint 4 Test Unit',
      description: 'Test description',
      isActive: true,
      sortOrder: 3,
    });
    assert.equal(
      (await updateResource('departments', departmentRecord.id, { description: 'Edited' })).description,
      'Edited',
    );

    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const imageForm = new FormData();
    imageForm.set('resource', 'doctors');
    imageForm.set('file', new File([new Uint8Array(signature)], 'doctor.png', { type: 'image/png' }));
    const upload = await mediaUpload.POST(
      request(`${appOrigin}/api/admin/media/upload`, 'POST', imageForm, cookie),
      { params: Promise.resolve({}) },
    );
    const uploaded = (await upload.json()).data;
    assert.equal(upload.status, 201);
    const storedImage = await mediaRoute.GET(
      request(`${appOrigin}${uploaded.url}`, 'GET'),
      { params: Promise.resolve({ id: uploaded.id }) },
    );
    assert.equal(storedImage.status, 200);
    assert.deepEqual(Buffer.from(await storedImage.arrayBuffer()), signature);

    const invalidForm = new FormData();
    invalidForm.set('resource', 'gallery-images');
    invalidForm.set('file', new File([new Uint8Array(Buffer.from('not image data'))], 'invalid.png', { type: 'image/png' }));
    assert.equal(
      (await mediaUpload.POST(
        request(`${appOrigin}/api/admin/media/upload`, 'POST', invalidForm, cookie),
        { params: Promise.resolve({}) },
      )).status,
      400,
    );

    const doctor = await createResource('doctors', {
      name: 'Sprint 4 Test Doctor',
      qualifications: 'MBBS',
      specialty: 'Test specialization',
      bio: 'Test biography',
      departmentId: departmentRecord.id,
      imageUrl: uploaded.url,
      isActive: true,
      sortOrder: 2,
    });
    assert.equal(
      (await updateResource('doctors', doctor.id, { bio: 'Edited biography' })).bio,
      'Edited biography',
    );

    const service = await createResource('services', {
      title: 'Sprint 4 Test Service',
      description: 'Test service details',
      imageUrl: uploaded.url,
      departmentId: departmentRecord.id,
      isActive: true,
      sortOrder: 2,
    });
    assert.equal(
      (await updateResource('services', service.id, { description: 'Edited service' })).description,
      'Edited service',
    );

    const gallery = await createResource('gallery-images', {
      url: `${uploaded.url}?gallery=1`,
      category: 'Sprint 4',
      altText: 'Test image description',
      caption: 'Test image title',
      isActive: true,
      sortOrder: 2,
    });
    assert.equal(gallery.category, 'Sprint 4');
    assert.equal(
      (await updateResource('gallery-images', gallery.id, { category: 'Updated' })).category,
      'Updated',
    );

    const article = await createResource('blog-posts', {
      slug: 'sprint-four-test-article',
      title: 'Sprint 4 Test Article',
      excerpt: 'Test article summary',
      content: 'Test full article',
      coverImage: uploaded.url,
      isPublished: false,
    });
    const published = await updateResource('blog-posts', article.id, { isPublished: true });
    assert.equal(published.isPublished, true);
    assert.ok(published.publishedAt);

    const setting = await createResource('website-settings', {
      key: 'sprint4.testSetting',
      value: 'Original value',
      isPublic: true,
    });
    assert.equal(
      (await updateResource('website-settings', setting.key, { value: 'Changed value' })).value,
      'Changed value',
    );

    const contact = await prisma.contactMessage.findFirstOrThrow();
    const editedContact = await PATCH(
      request(
        `${appOrigin}/api/admin/contact-messages/${contact.id}`,
        'PATCH',
        { status: 'READ' },
        cookie,
      ),
      { params: Promise.resolve({ path: ['contact-messages', contact.id] }) },
    );
    assert.equal((await editedContact.json()).data.status, 'READ');
    const contactList = await GET(
      request(`${appOrigin}/api/admin/contact-messages?status=READ`, 'GET', undefined, cookie),
      { params: Promise.resolve({ path: ['contact-messages'] }) },
    );
    assert.equal((await contactList.json()).pagination.total, 1);
    const deleteContact = await DELETE(
      request(`${appOrigin}/api/admin/contact-messages/${contact.id}`, 'DELETE', undefined, cookie),
      { params: Promise.resolve({ path: ['contact-messages', contact.id] }) },
    );
    assert.equal(deleteContact.status, 200);

    const profileUpdate = await authRoutes.PATCH(
      request(
        `${appOrigin}/api/admin/auth/profile`,
        'PATCH',
        {
          name: 'Updated Sprint Admin',
          currentPassword: password,
          newPassword: 'Sprint-4-new-admin-password-456!',
        },
        cookie,
      ),
      { params: Promise.resolve({ action: 'profile' }) },
    );
    assert.equal(profileUpdate.status, 200);
    assert.equal((await profileUpdate.json()).data.name, 'Updated Sprint Admin');
    assert.equal(await prisma.adminSession.count({ where: { userId: admin.id } }), 1);
    const rejectedPasswordUpdate = await authRoutes.PATCH(
      request(
        `${appOrigin}/api/admin/auth/profile`,
        'PATCH',
        { currentPassword: 'wrong-password', newPassword: 'Another-new-password-456!' },
        cookie,
      ),
      { params: Promise.resolve({ action: 'profile' }) },
    );
    assert.equal(rejectedPasswordUpdate.status, 400);

    const rateWindow = 15 * 60_000;
    const rateBucket = Math.floor(Date.now() / rateWindow) * rateWindow;
    const rateKey = security.duplicateProtectionKey(`admin-login|192.0.2.55|${rateBucket}`);
    await prisma.publicSubmissionRateLimit.create({
      data: {
        key: rateKey,
        attempts: 20,
        expiresAt: new Date(rateBucket + rateWindow),
      },
    });
    const limitedLogin = await authRoutes.POST(
      request(
        `${appOrigin}/api/admin/auth/login`,
        'POST',
        { email: admin.email, password: 'wrong-password' },
        undefined,
        { 'x-real-ip': '192.0.2.55' },
      ),
      { params: Promise.resolve({ action: 'login' }) },
    );
    assert.equal(limitedLogin.status, 429);

    const editor = await prisma.adminUser.create({
      data: {
        email: 'sprint4-editor@example.test',
        name: 'Sprint 4 Editor',
        role: AdminRole.EDITOR,
        passwordHash: await security.hashPassword('Sprint-4-editor-password-123!'),
      },
    });
    const editorToken = security.createOpaqueSessionToken();
    await prisma.adminSession.create({
      data: {
        tokenHash: security.hashSessionToken(editorToken),
        userId: editor.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const editorCookie = `dh_admin_session=${editorToken}`;
    const deniedAppointments = await GET(
      request(`${appOrigin}/api/admin/appointments`, 'GET', undefined, editorCookie),
      { params: Promise.resolve({ path: ['appointments'] }) },
    );
    assert.equal(deniedAppointments.status, 403);
    const deniedUploadForm = new FormData();
    deniedUploadForm.set('resource', 'doctors');
    deniedUploadForm.set('file', new File([new Uint8Array(signature)], 'restricted.png', { type: 'image/png' }));
    const deniedUpload = await mediaUpload.POST(
      request(`${appOrigin}/api/admin/media/upload`, 'POST', deniedUploadForm, editorCookie),
      { params: Promise.resolve({}) },
    );
    assert.equal(deniedUpload.status, 403);

    await deleteResource('services', service.id);
    await deleteResource('gallery-images', gallery.id);
    await deleteResource('blog-posts', article.id);
    await deleteResource('website-settings', setting.key);
    await deleteResource('doctors', doctor.id);
    await deleteResource('departments', departmentRecord.id);
    const logout = await authRoutes.POST(
      request(`${appOrigin}/api/admin/auth/logout`, 'POST', undefined, cookie),
      { params: Promise.resolve({ action: 'logout' }) },
    );
    assert.equal(logout.status, 200);
    assert.ok(logout.headers.getSetCookie().some((value) => value.includes('Max-Age=0')));
    assert.equal(await prisma.adminSession.count({ where: { userId: admin.id } }), 0);
    const afterLogout = await GET(
      request(`${appOrigin}/api/admin/dashboard/summary`, 'GET', undefined, cookie),
      { params: Promise.resolve({ path: ['dashboard', 'summary'] }) },
    );
    assert.equal(afterLogout.status, 401);
    assert.equal(await prisma.auditLog.count(), 27);
    console.log(
      'Sprint 4 admin integration passed: metrics, filters, all appointment statuses, contact updates, CRUD for departments/doctors/services/gallery/blog/settings, secure uploads, profile/password, login/logout, role access, and login rate limits.',
    );
  } finally {
    await prisma.$disconnect();
  }
} finally {
  await testDatabase.cleanup();
  await rm(uploadDirectory, { recursive: true, force: true });
}
