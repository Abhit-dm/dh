import { NextResponse, type NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { AppointmentStatus, Prisma } from '@/generated/prisma/client';
import { ApiError, readJson } from '@/lib/http';
import { getPrisma } from '@/lib/prisma';
import { duplicateProtectionKey } from '@/lib/security';
import { enforcePublicSubmissionRateLimit } from '@/lib/public-rate-limit';
import { sendAppointmentNotifications } from '@/lib/email';
import {
  appointmentCreateSchema,
  contactMessageCreateSchema,
  dateFromInput,
} from '@/lib/validation';

const publicDoctorSelect = {
  id: true,
  name: true,
  qualifications: true,
  specialty: true,
  imageUrl: true,
  department: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.DoctorSelect;

export async function getPublicResource(request: NextRequest, resource: string) {
  const prisma = getPrisma();
  const { searchParams } = new URL(request.url);
  const departmentSlug = searchParams.get('department');

  if (resource === 'departments') {
    const data = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, description: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'website-settings') {
    const data = await prisma.websiteSetting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true },
      orderBy: { key: 'asc' },
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'doctors') {
    const data = await prisma.doctor.findMany({
      where: {
        isActive: true,
        ...(departmentSlug ? { department: { slug: departmentSlug, isActive: true } } : {}),
      },
      select: publicDoctorSelect,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'services') {
    const data = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(departmentSlug ? { department: { slug: departmentSlug, isActive: true } } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        department: { select: { name: true, slug: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'gallery-images') {
    const data = await prisma.galleryImage.findMany({
      where: { isActive: true },
      select: { id: true, url: true, category: true, altText: true, caption: true },
      take: 100,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'blog-posts') {
    const slug = searchParams.get('slug');
    const data = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        publishedAt: { lte: new Date() },
        ...(slug ? { slug } : {}),
      },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        ...(slug ? { content: true } : {}),
        coverImage: true,
        publishedAt: true,
      },
      take: slug ? 1 : 50,
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  throw new ApiError(404, 'NOT_FOUND', 'Public resource not found.');
}

function normalizedPhone(phone: string) {
  return phone.replace(/[\s()-]/g, '').replace(/^\+?91/, '');
}

export function createAppointmentReference(preferredDate: string) {
  const date = preferredDate.replaceAll('-', '');
  const entropy = randomBytes(5).toString('hex').toUpperCase();
  return `DH-${date}-${entropy}`;
}

export async function createPublicAppointment(request: NextRequest) {
  const input = await readJson(request, appointmentCreateSchema);
  if (input.website?.trim()) {
    throw new ApiError(400, 'SPAM_DETECTED', 'The appointment request could not be accepted.');
  }
  const prisma = getPrisma();

  const department = await prisma.department.findFirst({
    where: { slug: input.departmentSlug, isActive: true },
    select: { id: true, slug: true },
  });
  if (!department) {
    throw new ApiError(400, 'INVALID_DEPARTMENT', 'Choose an available department.');
  }

  if (input.doctorId) {
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: input.doctorId,
        departmentId: department.id,
        isActive: true,
      },
      select: { id: true },
    });
    if (!doctor) {
      throw new ApiError(400, 'INVALID_DOCTOR', 'Choose an available doctor for this department.');
    }
  }

  const preferredDate = dateFromInput(input.preferredDate);
  const activeSlotKey = duplicateProtectionKey(
    [
      normalizedPhone(input.phone),
      input.patientName.normalize('NFKC').trim().toLowerCase(),
      department.slug,
      input.doctorId ?? '',
      input.preferredDate,
      input.preferredTime,
    ].join('|'),
  );

  const existing = await prisma.appointment.findUnique({
    where: { activeSlotKey },
    select: {
      id: true,
      reference: true,
      status: true,
      createdAt: true,
    },
  });
  if (existing) {
    return NextResponse.json(
      { data: existing, duplicate: true, message: 'This appointment request was already received.' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  await enforcePublicSubmissionRateLimit('appointment', input.phone);
  let appointment;
  try {
    appointment = await prisma.appointment.create({
      data: {
        reference: createAppointmentReference(input.preferredDate),
        patientName: input.patientName,
        parentGuardianName: input.parentGuardianName || null,
        phone: input.phone,
        email: input.email || null,
        patientAge: input.patientAge ?? null,
        departmentId: department.id,
        doctorId: input.doctorId ?? null,
        preferredDate,
        preferredTime: input.preferredTime,
        message: input.message || null,
        privacyConsent: input.privacyConsent,
        status: AppointmentStatus.PENDING,
        activeSlotKey,
      },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        department: { select: { name: true } },
        doctor: { select: { name: true } },
      },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      throw error;
    }
    const duplicate = await prisma.appointment.findUnique({
      where: { activeSlotKey },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
      },
    });
    if (!duplicate) throw error;
    return NextResponse.json(
      { data: duplicate, duplicate: true, message: 'This appointment request was already received.' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  await sendAppointmentNotifications({
    reference: appointment.reference,
    patientName: input.patientName,
    parentGuardianName: input.parentGuardianName || null,
    phone: input.phone,
    email: input.email || null,
    department: appointment.department.name,
    doctor: appointment.doctor?.name ?? null,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
  });

  return NextResponse.json(
    { data: appointment, message: 'Appointment request received. The hospital must confirm availability.' },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function createPublicContactMessage(request: NextRequest) {
  const input = await readJson(request, contactMessageCreateSchema);
  if (input.website?.trim()) {
    throw new ApiError(400, 'SPAM_DETECTED', 'The contact enquiry could not be accepted.');
  }
  const prisma = getPrisma();
  let departmentId: string | null = null;
  if (input.departmentSlug) {
    const department = await prisma.department.findFirst({
      where: { slug: input.departmentSlug, isActive: true },
      select: { id: true },
    });
    if (!department) {
      throw new ApiError(400, 'INVALID_DEPARTMENT', 'Choose an available department.');
    }
    departmentId = department.id;
  }

  const bucket = Math.floor(Date.now() / (15 * 60_000));
  const duplicateKey = duplicateProtectionKey(
    [
      normalizedPhone(input.phone),
      input.email ?? '',
      input.name.normalize('NFKC').trim().toLowerCase(),
      input.message.normalize('NFKC').trim().toLowerCase(),
      String(bucket),
    ].join('|'),
  );
  const existing = await prisma.contactMessage.findUnique({
    where: { duplicateKey },
    select: { id: true, status: true, createdAt: true },
  });
  if (existing) {
    return NextResponse.json(
      { data: existing, duplicate: true, message: 'This contact enquiry was already received.' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  await enforcePublicSubmissionRateLimit('contact', input.phone);
  let message;
  try {
    message = await prisma.contactMessage.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        departmentId,
        message: input.message,
        duplicateKey,
      },
      select: { id: true, status: true, createdAt: true },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      throw error;
    }
    const duplicate = await prisma.contactMessage.findUnique({
      where: { duplicateKey },
      select: { id: true, status: true, createdAt: true },
    });
    if (!duplicate) throw error;
    return NextResponse.json(
      { data: duplicate, duplicate: true, message: 'This contact enquiry was already received.' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    { data: message, message: 'Contact enquiry received.' },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
}
