import {
  Baby,
  Ear,
  Eye,
  HeartPulse,
  Scissors,
  Smile,
  Stethoscope,
} from 'lucide-react';

export const specializations = [
  {
    slug: 'child-care',
    name: 'Child Care',
    description: 'Care and appointment information for children and families.',
    icon: Baby,
    image: '/images/child-care-main.png',
    imageAlt: 'A pediatrician examining a young child during a consultation.',
    to: '/child-care',
  },
  {
    slug: 'eye-care',
    name: 'Eye Care',
    description: 'Eye care information and appointment enquiries.',
    icon: Eye,
    image: '/images/vision-screening.webp',
    imageAlt: 'An eye examination during a vision screening.',
    to: '/eye-care',
  },
  {
    slug: 'dental-care',
    name: 'Dental Care',
    description: 'Dental care information and appointment enquiries.',
    icon: Smile,
    image: '/images/general-dentistry.webp',
    imageAlt: 'A dentist providing general dental care.',
    to: '/dental-care',
  },
  {
    slug: 'ent',
    name: 'ENT',
    description: 'Department information and appointment enquiries for ENT care.',
    icon: Ear,
    image: '/images/ent-ear-exam.jpg',
    imageAlt: 'An ENT clinician examining a patient’s ear.',
    to: '/ent',
  },
  {
    slug: 'general-surgeries',
    name: 'General Surgeries',
    description: 'Information and appointment enquiries for general surgery.',
    icon: Scissors,
    image: '/images/general-surgery.jpg',
    imageAlt: 'A surgical team working in an operating theatre.',
    to: '/general-surgeries',
  },
  {
    slug: 'obstetrics-gynecology',
    name: 'Obstetrics & Gynecology',
    description: 'Department information and appointment enquiries.',
    icon: HeartPulse,
    image: '/images/obstetrics-gynecology.jpg',
    imageAlt: 'A clinician consulting with a patient about women’s health.',
    to: '/obstetrics-gynecology',
  },
  {
    slug: 'general-medicine',
    name: 'General Medicine',
    description: 'General medicine department information and appointment enquiries.',
    icon: Stethoscope,
    image: '/images/general-medicine.jpg',
    imageAlt: 'A physician checking a patient’s blood pressure.',
    to: '/general-medicine',
  },
];

export function getSpecializationSlug(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return specializations.find(
    ({ name, slug }) =>
      slug === normalized ||
      name.toLowerCase() === normalized ||
      (slug === 'dental-care' && normalized === 'dental care'),
  )?.slug ?? '';
}
