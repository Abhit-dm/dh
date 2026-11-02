import { NextResponse, type NextRequest } from 'next/server';
import {
  AdminRole,
  AppointmentStatus,
  ContactMessageStatus,
  Prisma,
} from '@/generated/prisma/client';
import type { AuthenticatedAdmin } from '@/lib/auth';
import { ApiError, pageResult, paginatedQuery, readJson } from '@/lib/http';
import { recordAudit } from '@/lib/audit';
import { getPrisma } from '@/lib/prisma';
import { duplicateProtectionKey, hashPassword } from '@/lib/security';
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  appointmentUpdateSchema,
  blogPostSchema,
  contactMessageUpdateSchema,
  dateFromInput,
  departmentSchema,
  doctorSchema,
  galleryImageSchema,
  partialSchema,
  serviceSchema,
  websiteSettingSchema,
} from '@/lib/validation';

const publicAdminUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AdminUserSelect;

const appointmentAdminSelect = {
  id: true,
  reference: true,
  patientName: true,
  parentGuardianName: true,
  phone: true,
  email: true,
  patientAge: true,
  departmentId: true,
  doctorId: true,
  preferredDate: true,
  preferredTime: true,
  message: true,
  privacyConsent: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, slug: true } },
  doctor: { select: { id: true, name: true } },
} satisfies Prisma.AppointmentSelect;

const contactMessageAdminSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  departmentId: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ContactMessageSelect;

async function lockSuperAdminInvariant(transaction: Prisma.TransactionClient) {
  await transaction.$queryRaw`SELECT pg_advisory_xact_lock(684159302, 1)`;
}

const editableResources = new Set([
  'appointments',
  'contact-messages',
  'doctors',
  'departments',
  'services',
  'gallery-images',
  'blog-posts',
  'website-settings',
  'admin-users',
  'audit-logs',
]);

export function assertEditableResource(resource: string) {
  if (!editableResources.has(resource)) {
    throw new ApiError(404, 'NOT_FOUND', 'Administrative resource not found.');
  }
}

export function authorizeResource(
  user: AuthenticatedAdmin,
  resource: string,
) {
  if (resource === 'admin-users' || resource === 'audit-logs') {
    if (user.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to do this.');
    }
    return;
  }

  if (user.role === AdminRole.EDITOR &&
    !['blog-posts', 'gallery-images'].includes(resource)) {
    throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to do this.');
  }
}

function collectionFilter(request: NextRequest, resource: string) {
  const { searchParams } = new URL(request.url);
  if (resource === 'appointments') {
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search')?.trim();
    const where: Prisma.AppointmentWhereInput = {};
    if (status) {
      const parsed = appointmentUpdateSchema.shape.status.unwrap().safeParse(status);
      if (!parsed.success) {
        throw new ApiError(400, 'INVALID_FILTER', 'Appointment status filter is invalid.');
      }
      where.status = parsed.data;
    }
    if (departmentId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(departmentId)) {
        throw new ApiError(400, 'INVALID_FILTER', 'Department filter is invalid.');
      }
      where.departmentId = departmentId;
    }
    const dateFilter: Prisma.DateTimeFilter<'Appointment'> = {};
    for (const [value, key] of [[dateFrom, 'gte'], [dateTo, 'lte']] as const) {
      if (value) {
        const date = new Date(`${value}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.valueOf()) ||
          date.toISOString().slice(0, 10) !== value) {
          throw new ApiError(400, 'INVALID_FILTER', 'Appointment date filter is invalid.');
        }
        if (key === 'lte') date.setUTCHours(23, 59, 59, 999);
        dateFilter[key] = date;
      }
    }
    if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
      throw new ApiError(400, 'INVALID_FILTER', 'The start date must not be after the end date.');
    }
    if (Object.keys(dateFilter).length) where.preferredDate = dateFilter;
    if (search) {
      if (search.length > 100) {
        throw new ApiError(400, 'INVALID_FILTER', 'Search text must be 100 characters or fewer.');
      }
      where.OR = [
        { reference: { contains: search } },
        { patientName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }
    return where;
  }
  if (resource === 'contact-messages') {
    const status = searchParams.get('status');
    if (!status) return {};
    const parsed = contactMessageUpdateSchema.shape.status.safeParse(status);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', 'Contact message status filter is invalid.');
    }
    return { status: parsed.data };
  }
  return {};
}

export async function getDashboardSummary() {
  const prisma = getPrisma();
  const [
    total,
    pending,
    confirmed,
    cancelled,
    completed,
    totalContactMessages,
    recentAppointments,
    recentMessages,
  ] = await prisma.$transaction([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { status: AppointmentStatus.CONFIRMED } }),
      prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
      prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
      prisma.contactMessage.count(),
      prisma.appointment.findMany({
        take: 8,
        select: appointmentAdminSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.findMany({
        take: 8,
        select: contactMessageAdminSelect,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  const counts = {
    total,
    pending,
    confirmed,
    cancelled,
    completed,
  };
  return NextResponse.json(
    { data: { appointments: counts, totalContactMessages, recentAppointments, recentMessages } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function listAdminResource(
  request: NextRequest,
  resource: string,
) {
  assertEditableResource(resource);
  const prisma = getPrisma();
  const { page, pageSize, skip, take } = paginatedQuery(request);
  const filter = collectionFilter(request, resource);
  let data: unknown[];
  let total: number;

  switch (resource) {
    case 'appointments': {
      const where = filter as Prisma.AppointmentWhereInput;
      [data, total] = await prisma.$transaction([
        prisma.appointment.findMany({
          where,
          skip,
          take,
          select: appointmentAdminSelect,
          orderBy: [{ preferredDate: 'desc' }, { preferredTime: 'desc' }],
        }),
        prisma.appointment.count({ where }),
      ]);
      break;
    }
    case 'contact-messages': {
      const where = filter as Prisma.ContactMessageWhereInput;
      [data, total] = await prisma.$transaction([
        prisma.contactMessage.findMany({
          where,
          skip,
          take,
          select: contactMessageAdminSelect,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.contactMessage.count({ where }),
      ]);
      break;
    }
    case 'doctors':
      [data, total] = await prisma.$transaction([
        prisma.doctor.findMany({
          skip,
          take,
          include: { department: { select: { id: true, name: true, slug: true } } },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
        prisma.doctor.count(),
      ]);
      break;
    case 'departments':
      [data, total] = await prisma.$transaction([
        prisma.department.findMany({
          skip,
          take,
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
        prisma.department.count(),
      ]);
      break;
    case 'services':
      [data, total] = await prisma.$transaction([
        prisma.service.findMany({
          skip,
          take,
          include: { department: { select: { id: true, name: true, slug: true } } },
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        }),
        prisma.service.count(),
      ]);
      break;
    case 'gallery-images':
      [data, total] = await prisma.$transaction([
        prisma.galleryImage.findMany({
          skip,
          take,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.galleryImage.count(),
      ]);
      break;
    case 'blog-posts':
      [data, total] = await prisma.$transaction([
        prisma.blogPost.findMany({
          skip,
          take,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.blogPost.count(),
      ]);
      break;
    case 'website-settings':
      [data, total] = await prisma.$transaction([
        prisma.websiteSetting.findMany({
          skip,
          take,
          orderBy: { key: 'asc' },
        }),
        prisma.websiteSetting.count(),
      ]);
      break;
    case 'admin-users':
      [data, total] = await prisma.$transaction([
        prisma.adminUser.findMany({
          skip,
          take,
          select: publicAdminUserSelect,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.adminUser.count(),
      ]);
      break;
    case 'audit-logs':
      [data, total] = await prisma.$transaction([
        prisma.auditLog.findMany({
          skip,
          take,
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count(),
      ]);
      break;
  }

  return NextResponse.json(
    pageResult(data!, total!, page, pageSize),
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function getAdminResource(
  resource: string,
  id: string,
) {
  assertEditableResource(resource);
  const prisma = getPrisma();
  if (resource === 'website-settings') {
    const data = await prisma.websiteSetting.findUnique({ where: { key: id } });
    if (!data) throw new ApiError(404, 'NOT_FOUND', 'Record not found.');
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(400, 'INVALID_ID', 'Record ID must be a UUID.');
  }

  let data: unknown;
  switch (resource) {
    case 'appointments':
      data = await prisma.appointment.findUnique({
        where: { id },
        select: appointmentAdminSelect,
      });
      break;
    case 'contact-messages':
      data = await prisma.contactMessage.findUnique({
        where: { id },
        select: contactMessageAdminSelect,
      });
      break;
    case 'doctors':
      data = await prisma.doctor.findUnique({
        where: { id },
        include: { department: true },
      });
      break;
    case 'departments':
      data = await prisma.department.findUnique({ where: { id } });
      break;
    case 'services':
      data = await prisma.service.findUnique({
        where: { id },
        include: { department: true },
      });
      break;
    case 'gallery-images':
      data = await prisma.galleryImage.findUnique({ where: { id } });
      break;
    case 'blog-posts':
      data = await prisma.blogPost.findUnique({ where: { id } });
      break;
    case 'admin-users':
      data = await prisma.adminUser.findUnique({
        where: { id },
        select: publicAdminUserSelect,
      });
      break;
    case 'audit-logs':
      data = await prisma.auditLog.findUnique({
        where: { id },
        include: { actor: { select: { id: true, name: true, email: true } } },
      });
      break;
  }
  if (!data) throw new ApiError(404, 'NOT_FOUND', 'Record not found.');
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

function mutationFields(input: object) {
  return Object.keys(input).filter((field) => field !== 'password');
}

export async function createAdminResource(
  resource: string,
  request: NextRequest,
  actor: AuthenticatedAdmin,
) {
  assertEditableResource(resource);
  const prisma = getPrisma();
  let data: unknown;

  switch (resource) {
    case 'appointments':
    case 'contact-messages':
    case 'audit-logs':
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'This resource cannot be created here.');
    case 'departments': {
      const input = await readJson(request, departmentSchema);
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.department.create({ data: input });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.id,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'doctors': {
      const input = await readJson(request, doctorSchema);
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.doctor.create({ data: input });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.id,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'services': {
      const input = await readJson(request, serviceSchema);
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.service.create({ data: input });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.id,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'gallery-images': {
      const input = await readJson(request, galleryImageSchema);
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.galleryImage.create({ data: input });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.id,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'blog-posts': {
      const input = await readJson(request, blogPostSchema);
      const isPublished = input.isPublished ?? false;
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.blogPost.create({
          data: {
            ...input,
            isPublished,
            publishedAt: isPublished ? input.publishedAt ?? new Date() : null,
          },
        });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.id,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'website-settings': {
      const input = await readJson(request, websiteSettingSchema);
      const value =
        input.value === null ? Prisma.JsonNull : (input.value as Prisma.InputJsonValue);
      data = await prisma.$transaction(async (transaction) => {
        const created = await transaction.websiteSetting.create({
          data: { ...input, value },
        });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: created.key,
          fields: mutationFields(input),
        });
        return created;
      });
      break;
    }
    case 'admin-users': {
      const input = await readJson(request, adminUserCreateSchema);
      const passwordHash = await hashPassword(input.password);
      const created = await prisma.$transaction(async (transaction) => {
        const user = await transaction.adminUser.create({
          data: {
            email: input.email,
            name: input.name,
            role: input.role ?? AdminRole.ADMIN,
            passwordHash,
          },
          select: publicAdminUserSelect,
        });
        await recordAudit(transaction, {
          actorId: actor.id,
          action: 'CREATE',
          resource,
          resourceId: user.id,
          fields: mutationFields(input),
        });
        return user;
      });
      data = created;
      break;
    }
  }

  return NextResponse.json(
    { data },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
}

function activeSlotKey(appointment: {
  phone: string;
  patientName: string;
  department: { slug: string };
  doctorId: string | null;
  preferredDate: Date;
  preferredTime: string;
}) {
  return duplicateProtectionKey(
    [
      appointment.phone.replace(/[\s()-]/g, '').replace(/^\+?91/, ''),
      appointment.patientName.normalize('NFKC').trim().toLowerCase(),
      appointment.department.slug,
      appointment.doctorId ?? '',
      appointment.preferredDate.toISOString().slice(0, 10),
      appointment.preferredTime,
    ].join('|'),
  );
}

export async function updateAdminResource(
  resource: string,
  id: string,
  request: NextRequest,
  actor: AuthenticatedAdmin,
) {
  assertEditableResource(resource);
  const prisma = getPrisma();

  if (resource === 'appointments') {
    const input = await readJson(request, appointmentUpdateSchema);
    const data = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.appointment.findUnique({
        where: { id },
        include: { department: { select: { slug: true } } },
      });
      if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Record not found.');
      const departmentId = input.departmentId ?? existing.departmentId;
      const department = await transaction.department.findFirst({
        where: { id: departmentId, isActive: true },
        select: { id: true, slug: true },
      });
      if (!department) {
        throw new ApiError(400, 'INVALID_DEPARTMENT', 'Choose an available department.');
      }
      const doctorId = input.doctorId === undefined ? existing.doctorId : input.doctorId;
      if (doctorId) {
        const doctor = await transaction.doctor.findFirst({
          where: { id: doctorId, departmentId, isActive: true },
          select: { id: true },
        });
        if (!doctor) {
          throw new ApiError(400, 'INVALID_DOCTOR', 'Choose an available doctor for this department.');
        }
      }
      const status = input.status ?? existing.status;
      const isActive =
        status !== AppointmentStatus.CANCELLED &&
        status !== AppointmentStatus.COMPLETED;
      const updatedValues = {
        ...existing,
        ...input,
        department: { slug: department.slug },
        departmentId,
        doctorId,
        preferredDate: input.preferredDate
          ? dateFromInput(input.preferredDate)
          : existing.preferredDate,
      };
      const updated = await transaction.appointment.update({
        where: { id },
        data: {
          ...input,
          status,
          departmentId,
          doctorId,
          ...(input.preferredDate
            ? { preferredDate: dateFromInput(input.preferredDate) }
            : {}),
          activeSlotKey: isActive ? activeSlotKey(updatedValues) : null,
        },
        select: appointmentAdminSelect,
      });
      await recordAudit(transaction, {
        actorId: actor.id,
        action: input.status && Object.keys(input).length === 1 ? 'UPDATE_STATUS' : 'UPDATE',
        resource,
        resourceId: id,
        fields: mutationFields(input),
      });
      return updated;
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'contact-messages') {
    const input = await readJson(request, contactMessageUpdateSchema);
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.contactMessage.update({
        where: { id },
        data: input,
        select: contactMessageAdminSelect,
      });
      await recordAudit(transaction, {
        actorId: actor.id,
        action: 'UPDATE_STATUS',
        resource,
        resourceId: id,
        fields: ['status'],
      });
      return updated;
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'admin-users') {
    const input = await readJson(request, adminUserUpdateSchema);
    if (id === actor.id && (input.isActive === false || input.role !== undefined)) {
      throw new ApiError(400, 'SELF_MODIFICATION_NOT_ALLOWED', 'You cannot disable or change your own role.');
    }
    const { password, ...userFields } = input;
    const passwordHash = password ? await hashPassword(password) : undefined;
    const data = await prisma.$transaction(async (transaction) => {
      if (input.role !== undefined || input.isActive !== undefined) {
        await lockSuperAdminInvariant(transaction);
      }
      const existing = await transaction.adminUser.findUnique({ where: { id } });
      if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Record not found.');
      const removesActiveSuperAdmin =
        existing.role === AdminRole.SUPER_ADMIN &&
        existing.isActive &&
        (input.isActive === false ||
          (input.role !== undefined && input.role !== AdminRole.SUPER_ADMIN));
      if (removesActiveSuperAdmin) {
        const activeSuperAdmins = await transaction.adminUser.count({
          where: { role: AdminRole.SUPER_ADMIN, isActive: true },
        });
        if (activeSuperAdmins <= 1) {
          throw new ApiError(409, 'LAST_SUPER_ADMIN', 'At least one active super administrator must remain.');
        }
      }
      const updated = await transaction.adminUser.update({
        where: { id },
        data: { ...userFields, ...(passwordHash ? { passwordHash } : {}) },
        select: publicAdminUserSelect,
      });
      if (passwordHash || input.isActive === false) {
        await transaction.adminSession.deleteMany({ where: { userId: id } });
      }
      await recordAudit(transaction, {
        actorId: actor.id,
        action: 'UPDATE',
        resource,
        resourceId: id,
        fields: mutationFields(input),
      });
      return updated;
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (resource === 'website-settings') {
    const input = await readJson(request, partialSchema(websiteSettingSchema));
    const { value: settingValue, ...fields } = input;
    const value =
      settingValue === undefined
        ? undefined
        : settingValue === null
          ? Prisma.JsonNull
          : (settingValue as Prisma.InputJsonValue);
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.websiteSetting.update({
        where: { key: id },
        data: { ...fields, ...(value === undefined ? {} : { value }) },
      });
      await recordAudit(transaction, {
        actorId: actor.id,
        action: 'UPDATE',
        resource,
        resourceId: id,
        fields: mutationFields(input),
      });
      return updated;
    });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  }

  let input: object;
  switch (resource) {
    case 'departments':
      input = await readJson(request, partialSchema(departmentSchema));
      break;
    case 'doctors':
      input = await readJson(request, partialSchema(doctorSchema));
      break;
    case 'services':
      input = await readJson(request, partialSchema(serviceSchema));
      break;
    case 'gallery-images':
      input = await readJson(request, partialSchema(galleryImageSchema));
      break;
    case 'blog-posts':
      input = await readJson(request, partialSchema(blogPostSchema));
      break;
    default:
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'This resource cannot be updated here.');
  }

  if (
    (resource === 'doctors' || resource === 'services') &&
    'departmentId' in input &&
    typeof input.departmentId === 'string'
  ) {
    const department = await prisma.department.findFirst({
      where: { id: input.departmentId, isActive: true },
      select: { id: true },
    });
    if (!department) {
      throw new ApiError(400, 'INVALID_DEPARTMENT', 'Choose an available department.');
    }
  }

  if (resource === 'blog-posts' && 'isPublished' in input) {
    const blogInput = input as { isPublished?: boolean; publishedAt?: string | null };
    if (blogInput.isPublished && !blogInput.publishedAt) {
      input = { ...input, publishedAt: new Date().toISOString() };
    } else if (blogInput.isPublished === false) {
      input = { ...input, publishedAt: null };
    }
  }

  const data = await prisma.$transaction(async (transaction) => {
    let updated: unknown;
    switch (resource) {
      case 'departments':
        updated = await transaction.department.update({
          where: { id },
          data: input as Prisma.DepartmentUpdateInput,
        });
        break;
      case 'doctors':
        updated = await transaction.doctor.update({
          where: { id },
          data: input as Prisma.DoctorUpdateInput,
        });
        break;
      case 'services':
        updated = await transaction.service.update({
          where: { id },
          data: input as Prisma.ServiceUpdateInput,
        });
        break;
      case 'gallery-images':
        updated = await transaction.galleryImage.update({
          where: { id },
          data: input as Prisma.GalleryImageUpdateInput,
        });
        break;
      case 'blog-posts':
        updated = await transaction.blogPost.update({
          where: { id },
          data: input as Prisma.BlogPostUpdateInput,
        });
        break;
    }
    await recordAudit(transaction, {
      actorId: actor.id,
      action: 'UPDATE',
      resource,
      resourceId: id,
      fields: mutationFields(input),
    });
    return updated;
  });
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function deleteAdminResource(
  resource: string,
  id: string,
  actor: AuthenticatedAdmin,
) {
  assertEditableResource(resource);
  if (resource === 'audit-logs') {
    throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Audit logs are immutable.');
  }
  if (resource !== 'website-settings' &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(400, 'INVALID_ID', 'Record ID must be a UUID.');
  }
  if (resource === 'admin-users' && id === actor.id) {
    throw new ApiError(400, 'SELF_DELETION_NOT_ALLOWED', 'You cannot delete your own account.');
  }

  const prisma = getPrisma();
  await prisma.$transaction(async (transaction) => {
    if (resource === 'admin-users') {
      await lockSuperAdminInvariant(transaction);
      const target = await transaction.adminUser.findUnique({ where: { id } });
      if (!target) throw new ApiError(404, 'NOT_FOUND', 'Record not found.');
      if (target.role === AdminRole.SUPER_ADMIN && target.isActive) {
        const activeSuperAdmins = await transaction.adminUser.count({
          where: { role: AdminRole.SUPER_ADMIN, isActive: true },
        });
        if (activeSuperAdmins <= 1) {
          throw new ApiError(409, 'LAST_SUPER_ADMIN', 'At least one active super administrator must remain.');
        }
      }
      await recordAudit(transaction, {
        actorId: actor.id,
        action: 'DELETE',
        resource,
        resourceId: id,
      });
      await transaction.adminUser.delete({ where: { id } });
      return;
    }

    await recordAudit(transaction, {
      actorId: actor.id,
      action: 'DELETE',
      resource,
      resourceId: id,
    });
    switch (resource) {
      case 'appointments':
        await transaction.appointment.delete({ where: { id } });
        break;
      case 'contact-messages':
        await transaction.contactMessage.delete({ where: { id } });
        break;
      case 'departments':
        await transaction.department.delete({ where: { id } });
        break;
      case 'doctors':
        await transaction.doctor.delete({ where: { id } });
        break;
      case 'services':
        await transaction.service.delete({ where: { id } });
        break;
      case 'gallery-images':
        await transaction.galleryImage.delete({ where: { id } });
        break;
      case 'blog-posts':
        await transaction.blogPost.delete({ where: { id } });
        break;
      case 'website-settings':
        await transaction.websiteSetting.delete({ where: { key: id } });
        break;
      default:
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'This resource cannot be deleted here.');
    }
  });
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
}
