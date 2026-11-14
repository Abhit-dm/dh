export const contact = {
  address:
    'DH Hospitals Road, Behind Chepalakundi, Penamaluru Center, Poranki, Vijayawada - 521137',
  phone: '8886234108',
  email: 'dhreception1@gmail.com',
  hours: [
    { days: 'Monday - Saturday', time: '09:00 - 08:00' },
    { days: 'Sunday', time: '09:00 - 01:00' },
  ],
};

export const socialLinks = [
  { label: 'Facebook', url: 'https://www.facebook.com/Dhclinic28' },
  { label: 'Instagram', url: 'https://www.instagram.com/dhhospitals/' },
];

export const doctors = [
  {
    name: 'DR.DINESH DAVULURU',
    qualifications: 'MBBS, DCH, DNB, PGPN (Boston, USA)',
    specialty: 'Pediatrician & Neonatologist.',
    department: 'Child Care',
    image: null,
  },
  {
    name: 'DR.HAASITHA CHIGURUPATI',
    qualifications: 'MBBS, MS OPHTHAL',
    specialty: 'Ophthalmologist.',
    department: 'Eye Care',
    image: null,
  },
  {
    name: 'DR. SAI HARSHITHA SUNKAVALLY',
    qualifications: 'BDS - Dental Surgeon.',
    specialty: 'Dental Surgeon.',
    department: 'Dental Care',
    image: null,
  },
];

export function formatDoctorName(name) {
  return name.replace(/^(?:DR\.\s*)+/i, 'DR. ').trim();
}

export function getDoctorDepartmentName(doctor) {
  const department = doctor.department;
  if (typeof department === 'string') return department;
  if (department?.slug === 'dental-care') return 'Dental Care';
  return department?.name || '';
}

export const CHILD_CARE_MAIN_IMAGE = '/images/child-care-main.png';

export const childServices = [
  {
    title: 'Comprehensive Pediatric Care',
    description:
      'Medical care for newborns, infants, and adolescents up to 18 years old.',
    image: CHILD_CARE_MAIN_IMAGE,
    imageAlt: 'A pediatrician examining a young child during a consultation.',
    imageWidth: 1536,
    imageHeight: 1024,
  },
  {
    title: 'Child Health Support',
    description:
      'Care for skin problems, nebulization, and diet feeding counseling.',
    image: '/images/child-health-support.jpg',
    imageAlt: 'A clinician measuring a child’s growth during a pediatric checkup.',
  },
  {
    title: 'Emergency Pediatric Care Support',
    description:
      "Prompt medical care support and guidance for your child's health needs.",
    image: '/images/pediatric-emergency-care.jpg',
    imageAlt: 'Pediatric emergency-response training using a child-sized mannequin.',
  },
];

export const eyeServices = [
  {
    title: 'Vision Screening',
    description:
      'Ensure early detection of vision problems with comprehensive screening services at DH Hospitals.',
    image: '/images/vision-screening.webp',
  },
  {
    title: 'Cataract Surgery',
    description:
      'Experience advanced cataract surgery procedures with state-of-the-art technology at DH Hospitals.',
    image: '/images/cataract-services.webp',
  },
  {
    title: 'LASIK Surgery',
    description:
      'DH Hospitals offer LASIK surgery to correct common vision problems and reduce dependence on glasses or contacts.',
    image: '/images/lasik-surgery-content.jpg',
    imageAlt: 'Eye surgery performed using a precision surgical instrument.',
  },
  {
    title: 'Glaucoma & Optic Nerve Care',
    description:
      'DH Hospitals lists glaucoma and optic nerve care information.',
    image: '/images/glaucoma-tonometry.jpg',
    imageAlt: 'A clinician measuring a patient’s eye pressure during an eye exam.',
  },
  {
    title: 'Laser Procedures',
    description:
      'Laser procedures are among the eye-care services listed by DH Hospitals.',
    image: '/images/laser-procedures.jpg',
    imageAlt: 'An ophthalmic laser procedure being performed by a surgeon.',
  },
  {
    title: 'Optics & Contact Lenses',
    description:
      'Expert consultations for optics and contact lenses.',
    image: '/images/hospital-cover.webp',
  },
];

export const dentalServices = [
  {
    title: 'General Dentistry',
    description:
      'Comprehensive oral exams, cleaning, and preventive care to maintain healthy teeth and gums for the whole family.',
    image: '/images/general-dentistry.webp',
  },
  {
    title: 'Orthodontic Treatment',
    description:
      'Expert braces and aligner treatments for perfect smiles and improved dental alignment in children and adults.',
    image: '/images/orthodontic-treatment.jpg',
    imageAlt: 'Dental braces used to align teeth.',
  },
  {
    title: 'Root Canal Therapy',
    description:
      'Advanced pain-free root canal treatments using modern technology to save and restore damaged teeth.',
    image: '/images/oral-surgery.webp',
  },
  {
    title: 'Dental Implants',
    description:
      'Permanent and natural-looking solutions for missing teeth with advanced dental implant procedures.',
    image: '/images/dental-implants.webp',
  },
  {
    title: 'Cosmetic Dentistry',
    description:
      'Smile makeovers, teeth whitening, veneers, and cosmetic corrections to enhance your appearance and confidence.',
    image: '/images/cosmetic-dentistry.webp',
  },
  {
    title: 'Pediatric Dentistry',
    description:
      'Gentle and friendly dental care designed specifically for children, ensuring lifelong oral health habits.',
    image: '/images/general-dentistry.webp',
  },
  {
    title: 'Oral Surgery',
    description:
      'Expert surgical solutions for wisdom teeth removal, jaw alignment, and other oral surgical procedures.',
    image: '/images/oral-surgery.webp',
  },
];

export const galleryImages = [
  {
    src: '/images/hospital-cover.webp',
    alt: 'DH Hospitals',
    caption: 'DH Hospitals',
  },
  {
    src: '/images/index-about.webp',
    alt: 'DH Hospitals care',
    caption: 'Children’s care',
  },
  {
    src: '/images/index-about-2.webp',
    alt: 'DH Hospitals healthcare services',
    caption: 'Healthcare services',
  },
  {
    src: '/images/vision-screening.webp',
    alt: 'Vision screening service at DH Hospitals',
    caption: 'Vision screening',
  },
  {
    src: '/images/cataract-services.webp',
    alt: 'Cataract surgery service',
    caption: 'Eye care',
  },
  {
    src: '/images/general-dentistry.webp',
    alt: 'General dentistry service',
    caption: 'Dental care',
  },
  {
    src: '/images/dental-implants.webp',
    alt: 'Dental implants service',
    caption: 'Dental services',
  },
  {
    src: '/images/lasik-surgery.webp',
    alt: 'LASIK surgery service',
    caption: 'LASIK surgery',
  },
];
