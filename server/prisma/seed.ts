import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient, AdminRole } from '../src/generated/prisma/client';
import { hashPassword } from '../src/lib/security';
import { adminLoginSchema } from '../src/lib/validation';

function requiredEnvironmentValue(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
}

function officialBrandText(value: string) {
  return value
    .replace(/\bDH\s+Children\s*(?:&|and)\s*Eye\s+Hospitals\b/gi, 'DH Hospitals')
    .replace(/\bDH\s+Children\s+Hospitals\b/gi, 'DH Hospitals')
    .replace(/\bDH\s+Eye\s+Hospital\b/gi, 'DH Hospitals')
    .replace(/\bDH\s+Hospital\b/gi, 'DH Hospitals')
    .replace(/\bDH\s+(?:Child|Eye|Dental)\s+Care(?:\s+Hospitals)?\b/gi, 'DH Hospitals');
}

const databaseUrl = requiredEnvironmentValue('DATABASE_URL');
const adminEmailResult = adminLoginSchema.shape.email.safeParse(
  requiredEnvironmentValue('ADMIN_BOOTSTRAP_EMAIL'),
);
if (!adminEmailResult.success) {
  throw new Error('ADMIN_BOOTSTRAP_EMAIL must be a valid email address.');
}
const adminEmail = adminEmailResult.data;
const adminPassword = requiredEnvironmentValue('ADMIN_BOOTSTRAP_PASSWORD');
if (adminPassword.length < 16 || adminPassword.length > 128) {
  throw new Error('ADMIN_BOOTSTRAP_PASSWORD must contain 16 to 128 characters.');
}
if (Buffer.byteLength(requiredEnvironmentValue('DATA_HASH_SECRET')) < 32) {
  throw new Error('DATA_HASH_SECRET must contain at least 32 bytes.');
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const departments = [
  {
    slug: 'child-care',
    name: 'Child Care',
    description:
      'Pediatric care for newborns, infants, and adolescents up to 18 years old.',
    sortOrder: 1,
  },
  {
    slug: 'eye-care',
    name: 'Eye Care',
    description: 'Eye care information and appointment enquiries.',
    sortOrder: 2,
  },
  {
    slug: 'dental-care',
    name: 'Dental',
    description: 'Dental care information and appointment enquiries.',
    sortOrder: 3,
  },
  {
    slug: 'ent',
    name: 'ENT',
    description: 'Department information and appointment enquiries for ENT care.',
    sortOrder: 4,
  },
  {
    slug: 'general-surgeries',
    name: 'General Surgeries',
    description: 'Information and appointment enquiries for general surgery.',
    sortOrder: 5,
  },
  {
    slug: 'obstetrics-gynecology',
    name: 'Obstetrics & Gynecology',
    description: 'Department information and appointment enquiries.',
    sortOrder: 6,
  },
  {
    slug: 'general-medicine',
    name: 'General Medicine',
    description: 'General medicine department information and appointment enquiries.',
    sortOrder: 7,
  },
];

const hospitalDoctors = [
  {
    name: 'DR.DINESH DAVULURU',
    qualifications: 'MBBS, DCH, DNB, PGPN (Boston, USA)',
    specialty: 'Pediatrician & Neonatologist.',
    slug: 'child-care',
  },
  {
    name: 'DR.HAASITHA CHIGURUPATI',
    qualifications: 'MBBS, MS OPHTHAL',
    specialty: 'Ophthalmologist.',
    slug: 'eye-care',
  },
  {
    name: 'DR. SAI HARSHITHA SUNKAVALLY',
    qualifications: 'BDS - Dental Surgeon.',
    specialty: 'Dental Surgeon.',
    slug: 'dental-care',
  },
];

const hospitalServices = [
  {
    departmentSlug: 'child-care',
    title: 'Comprehensive Pediatric Care',
    description:
      'Medical care for newborns, infants, and adolescents up to 18 years old.',
    imageUrl: '/images/child-care-main.png',
  },
  {
    departmentSlug: 'child-care',
    title: 'Child Health Support',
    description:
      'Care for skin problems, nebulization, and diet feeding counseling.',
    imageUrl: '/images/child-care-main.png',
  },
  {
    departmentSlug: 'child-care',
    title: 'Emergency Pediatric Care Support',
    description:
      "Prompt medical care support and guidance for your child's health needs.",
    imageUrl: '/images/child-care-main.png',
  },
  {
    departmentSlug: 'eye-care',
    title: 'Vision Screening',
    description:
      'Vision screening services at DH Hospitals.',
    imageUrl: '/images/vision-screening.jpg',
  },
  {
    departmentSlug: 'eye-care',
    title: 'Cataract Surgery',
    description:
      'Cataract surgery services at DH Hospitals.',
    imageUrl: '/images/cataract-services.jpg',
  },
  {
    departmentSlug: 'eye-care',
    title: 'LASIK Surgery',
    description: 'LASIK surgery services listed by DH Hospitals.',
    imageUrl: '/images/lasik-surgery.jpg',
  },
  {
    departmentSlug: 'dental-care',
    title: 'General Dentistry',
    description:
      'Comprehensive oral exams, cleaning, and preventive care to maintain healthy teeth and gums for the whole family.',
    imageUrl: '/images/general-dentistry.jpg',
  },
  {
    departmentSlug: 'dental-care',
    title: 'Dental Implants',
    description:
      'Permanent and natural-looking solutions for missing teeth with advanced dental implant procedures.',
    imageUrl: '/images/dental-implants.png',
  },
  {
    departmentSlug: 'dental-care',
    title: 'Cosmetic Dentistry',
    description:
      'Smile makeovers, teeth whitening, veneers, and cosmetic corrections to enhance your appearance and confidence.',
    imageUrl: '/images/cosmetic-dentistry.png',
  },
  {
    departmentSlug: 'dental-care',
    title: 'Oral Surgery',
    description:
      'Expert surgical solutions for wisdom teeth removal, jaw alignment, and other oral surgical procedures.',
    imageUrl: '/images/oral-surgery.png',
  },
];

const galleryImages = [
  { url: '/images/hospital-cover.jpg', altText: 'DH Hospitals', caption: 'DH Hospitals' },
  { url: '/images/index-about.jpg', altText: 'DH Hospitals care', caption: "Children's care" },
  {
    url: '/images/index-about-2.jpg',
    altText: 'DH Hospitals healthcare services',
    caption: 'Healthcare services',
  },
  {
    url: '/images/vision-screening.jpg',
    altText: 'Vision screening service at DH Hospitals',
    caption: 'Vision screening',
  },
  {
    url: '/images/cataract-services.jpg',
    altText: 'Cataract surgery service',
    caption: 'Eye care',
  },
  {
    url: '/images/general-dentistry.jpg',
    altText: 'General dentistry service',
    caption: 'Dental care',
  },
  {
    url: '/images/dental-implants.png',
    altText: 'Dental implants service',
    caption: 'Dental services',
  },
  {
    url: '/images/lasik-surgery.jpg',
    altText: 'LASIK surgery service',
    caption: 'LASIK surgery',
  },
];

const websiteSettings = [
  {
    key: 'contact.address',
    value:
      'DH Hospitals Road, Behind Chepalakundi, Penamaluru Center, Poranki, Vijayawada - 521137',
  },
  { key: 'contact.phone', value: '8886234108' },
  { key: 'contact.email', value: 'dhreception1@gmail.com' },
  {
    key: 'contact.hours',
    value: [
      { days: 'Monday - Saturday', time: '09:00 - 08:00' },
      { days: 'Sunday', time: '09:00 - 01:00' },
    ],
  },
];

async function seed() {
  const passwordHash = await hashPassword(adminPassword);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Administrator',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  for (const department of departments) {
    await prisma.department.upsert({
      where: { slug: department.slug },
      update: {
        name: department.name,
        description: department.description,
        isActive: true,
        sortOrder: department.sortOrder,
      },
      create: department,
    });
  }

  const departmentsBySlug = new Map(
    (await prisma.department.findMany({ select: { id: true, slug: true } })).map(
      (department) => [department.slug, department.id],
    ),
  );

  const dentalDepartmentId = departmentsBySlug.get('dental-care');
  if (!dentalDepartmentId) throw new Error('Missing department dental-care.');
  const dentalDoctors = await prisma.doctor.findMany({
    where: { departmentId: dentalDepartmentId },
    select: { id: true, name: true },
  });
  for (const doctor of dentalDoctors) {
    const name = doctor.name.replace(/^(?:DR\.\s*){2,}/i, 'DR. ');
    if (name === doctor.name) continue;
    const duplicate = await prisma.doctor.findFirst({
      where: { departmentId: dentalDepartmentId, name },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error('A corrected dental doctor record already exists; refusing to alter either record.');
    }
    await prisma.doctor.update({ where: { id: doctor.id }, data: { name } });
  }

  for (const doctor of hospitalDoctors) {
    const departmentId = departmentsBySlug.get(doctor.slug);
    if (!departmentId) throw new Error(`Missing department ${doctor.slug}.`);
    await prisma.doctor.upsert({
      where: {
        name_departmentId: { name: doctor.name, departmentId },
      },
      update: {},
      create: {
        name: doctor.name,
        qualifications: doctor.qualifications,
        specialty: doctor.specialty,
        departmentId,
      },
    });
  }

  for (const service of hospitalServices) {
    const departmentId = departmentsBySlug.get(service.departmentSlug);
    if (!departmentId) throw new Error(`Missing department ${service.departmentSlug}.`);
    await prisma.service.upsert({
      where: {
        title_departmentId: { title: service.title, departmentId },
      },
      update: { imageUrl: service.imageUrl },
      create: {
        title: service.title,
        description: service.description,
        imageUrl: service.imageUrl,
        departmentId,
      },
    });
  }

  for (const [sortOrder, image] of galleryImages.entries()) {
    await prisma.galleryImage.upsert({
      where: { url: image.url },
      update: {},
      create: { ...image, sortOrder },
    });
  }

  for (const service of await prisma.service.findMany({
    select: { id: true, description: true },
  })) {
    const description = officialBrandText(service.description);
    if (description !== service.description) {
      await prisma.service.update({
        where: { id: service.id },
        data: { description },
      });
    }
  }

  for (const image of await prisma.galleryImage.findMany({
    select: { id: true, altText: true, caption: true },
  })) {
    const altText = officialBrandText(image.altText);
    const caption = image.caption ? officialBrandText(image.caption) : image.caption;
    if (altText !== image.altText || caption !== image.caption) {
      await prisma.galleryImage.update({
        where: { id: image.id },
        data: { altText, caption },
      });
    }
  }

  for (const post of await prisma.blogPost.findMany({
    select: { id: true, title: true, excerpt: true, content: true },
  })) {
    const title = officialBrandText(post.title);
    const excerpt = officialBrandText(post.excerpt);
    const content = officialBrandText(post.content);
    if (title !== post.title || excerpt !== post.excerpt || content !== post.content) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { title, excerpt, content },
      });
    }
  }

  for (const setting of websiteSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, isPublic: true },
      create: { ...setting, isPublic: true },
    });
  }
  for (const setting of await prisma.websiteSetting.findMany({
    where: { isPublic: true },
    select: { id: true, value: true },
  })) {
    if (typeof setting.value !== 'string') continue;
    const value = officialBrandText(setting.value);
    if (value !== setting.value) {
      await prisma.websiteSetting.update({
        where: { id: setting.id },
        data: { value },
      });
    }
  }
  await prisma.websiteSetting.deleteMany({
    where: { key: { in: ['contact.landline', 'contact.emergency', 'contact.additionalPhones'] } },
  });
}

try {
  await seed();
  console.info('DH Hospitals departments, verified doctor profiles, published services, gallery images, public contact settings, and initial super administrator are ready.');
} finally {
  await prisma.$disconnect();
}
