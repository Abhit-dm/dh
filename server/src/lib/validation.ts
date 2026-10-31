import { z } from 'zod';

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const normalized = value.trim().toLowerCase();
    return normalized || null;
  },
  z.email().max(320).nullable(),
);

export const phoneSchema = z
  .string()
  .trim()
  .min(10)
  .max(32)
  .refine(
    (value) =>
      /^(?:\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s()-]/g, '')),
    'Enter a valid Indian mobile number.',
  );

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, digits, and hyphens.');

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value.startsWith('/') && !value.startsWith('//')) return true;
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Use a local path or HTTPS URL.');

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for the preferred date.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }, 'Enter a valid calendar date.')
  .refine((value) => value >= todayInHospitalTimezone(), 'Choose today or a future date.');

export function todayInHospitalTimezone() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export const appointmentCreateSchema = z
  .object({
    patientName: z.string().trim().min(1).max(160),
    parentGuardianName: z.string().trim().max(160).optional(),
    phone: phoneSchema,
    email: optionalEmail.optional(),
    patientAge: z.number().int().min(0).max(120).optional(),
    departmentSlug: slugSchema,
    doctorId: z.uuid().optional(),
    preferredDate: isoDateSchema,
    preferredTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid 24-hour time such as 09:30.'),
    message: z.string().trim().max(1000).optional(),
    privacyConsent: z.literal(true, 'Consent is required to submit an appointment request.'),
    website: z.string().max(200).optional(),
  })
  .strict()
  .refine(
    (appointment) =>
      appointment.patientAge === undefined ||
      appointment.patientAge >= 18 ||
      Boolean(appointment.parentGuardianName?.trim()),
    {
      path: ['parentGuardianName'],
      message: 'A parent or guardian name is required for patients under 18.',
    },
  );

export const contactMessageCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    phone: phoneSchema,
    email: optionalEmail.optional(),
    departmentSlug: slugSchema.optional(),
    message: z.string().trim().min(1).max(3000),
    website: z.string().max(200).optional(),
  })
  .strict();

export const adminLoginSchema = z
  .object({
    email: z.email().max(320).transform((value) => value.trim().toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export const adminProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.email().max(320).transform((value) => value.trim().toLowerCase()).optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(16).max(128).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).some((key) => key !== 'currentPassword'), {
    message: 'Provide a profile update.',
  })
  .refine(
    (value) => !value.newPassword || Boolean(value.currentPassword),
    {
      path: ['currentPassword'],
      message: 'Enter your current password to change it.',
    },
  );

export const departmentSchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(-10000).max(10000).optional(),
  })
  .strict();

export const doctorSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    qualifications: z.string().trim().min(1).max(255),
    specialty: z.string().trim().min(1).max(160),
    bio: z.string().trim().max(3000).optional().nullable(),
    imageUrl: imageUrlSchema.optional().nullable(),
    departmentId: z.uuid(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(-10000).max(10000).optional(),
  })
  .strict();

export const serviceSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(3000),
    imageUrl: imageUrlSchema.optional().nullable(),
    departmentId: z.uuid(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(-10000).max(10000).optional(),
  })
  .strict();

export const galleryImageSchema = z
  .object({
    url: imageUrlSchema,
    category: z.string().trim().min(1).max(80).optional(),
    altText: z.string().trim().min(1).max(300),
    caption: z.string().trim().max(300).optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(-10000).max(10000).optional(),
  })
  .strict();

export const blogPostSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1).max(220),
    excerpt: z.string().trim().min(1).max(500),
    content: z.string().trim().min(1).max(100_000),
    coverImage: imageUrlSchema.optional().nullable(),
    isPublished: z.boolean().optional(),
    publishedAt: z.iso.datetime({ offset: true }).optional().nullable(),
  })
  .strict();

export const websiteSettingSchema = z
  .object({
    key: z.string().trim().min(2).max(120).regex(/^[a-zA-Z0-9._-]+$/),
    value: z.json(),
    isPublic: z.boolean().optional(),
  })
  .strict();

export const adminUserCreateSchema = z
  .object({
    email: z.email().max(320).transform((value) => value.trim().toLowerCase()),
    name: z.string().trim().min(1).max(120),
    password: z.string().min(16).max(128),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
  })
  .strict();

export const adminUserUpdateSchema = z
  .object({
    email: z.email().max(320).transform((value) => value.trim().toLowerCase()).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    password: z.string().min(16).max(128).optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');

export const appointmentUpdateSchema = z
  .object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    patientName: z.string().trim().min(1).max(160).optional(),
    parentGuardianName: z.string().trim().max(160).nullable().optional(),
    phone: phoneSchema.optional(),
    email: optionalEmail.optional(),
    patientAge: z.number().int().min(0).max(120).nullable().optional(),
    departmentId: z.uuid().optional(),
    doctorId: z.uuid().nullable().optional(),
    preferredDate: isoDateSchema.optional(),
    preferredTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid 24-hour time such as 09:30.')
      .optional(),
    message: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.')
  .refine(
    (value) => value.patientAge === undefined || value.patientAge === null || value.patientAge >= 18 ||
      Boolean(value.parentGuardianName?.trim()),
    {
      path: ['parentGuardianName'],
      message: 'A parent or guardian name is required for patients under 18.',
    },
  );

export const contactMessageUpdateSchema = z
  .object({ status: z.enum(['NEW', 'READ', 'ARCHIVED']) })
  .strict();

export function partialSchema<T extends z.ZodObject>(schema: T) {
  return schema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });
}
