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
  { label: 'YouTube', url: 'https://www.youtube.com/@DHHospitals/' },
];

export const doctors = [
  {
    id: '57c70357-6ec3-4255-9d0d-30f2101fb97a',
    name: 'DR. DINESH DAVULURU',
    qualifications: 'MBBS, DCH, DNB, PGPN (Boston)',
    specialty: 'Consultant Pediatrician & Neonatologist',
    experience: '14+ Years Experience',
    department: 'Child Care',
    image: null,
  },
  {
    id: 'ae9fdf41-f43d-4b6f-a2d4-fb5b86a8668f',
    name: 'DR. HAASITHA CHIGURUPATI',
    qualifications: 'MBBS, MS Ophthalmology',
    specialty: 'Consultant Ophthalmologist & Cataract Surgeon',
    experience: '13+ Years Experience',
    department: 'Eye Care',
    image: null,
  },
  {
    id: 'b5a70390-baab-4ad3-80ea-e604f6e628fc',
    name: 'DR. SAI HARSHITHA SUNKAVALLY',
    qualifications: 'BDS',
    specialty: 'Dental Surgeon',
    experience: '5+ Years Experience',
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

export const CHILD_CARE_MAIN_IMAGE = '/images/child-care-main.webp';

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
    title: 'Comprehensive Eye Examinations',
    description: 'Detailed eye examinations for ongoing vision health.',
    image: '/images/eye-refraction.jpg',
    imageAlt: 'An adult patient receiving a comprehensive eye examination with a phoropter.',
  },
  {
    title: 'Pediatric Eye Care',
    description: 'Eye care support for children.',
    image: '/images/pediatric-eye-care.jpg',
    imageAlt: 'Illustrative photo of a child trying on eyeglasses during an optical fitting.',
  },
  {
    title: 'Vision Testing & Refraction',
    description: 'Testing and refraction for accurate vision assessment.',
    image: '/images/vision-screening.webp',
    imageAlt: 'A child receiving a vision screening with ophthalmic equipment.',
  },
  {
    title: 'Cataract Evaluation & Cataract Surgery',
    description: 'Cataract evaluation and surgical care.',
    image: '/images/cataract-services.webp',
    imageAlt: 'An ophthalmologist performing cataract surgery.',
  },
  {
    title: 'Glaucoma Screening & Management',
    description: 'Glaucoma screening and management.',
    image: '/images/glaucoma-tonometry.jpg',
    imageAlt: 'An eye pressure measurement during glaucoma screening.',
  },
  {
    title: 'Diabetic Retinopathy Screening',
    description: 'Retinal screening for people with diabetes.',
    image: '/images/diabetic-retinopathy.jpg',
    imageAlt: 'A retinal scan used for diabetic retinopathy screening.',
  },
  {
    title: 'LASIK & Refractive Surgery',
    description: 'LASIK and refractive surgery consultations and care.',
    image: '/images/lasik-surgery-content.jpg',
    imageAlt: 'An ophthalmic laser procedure.',
  },
  {
    title: 'Pterygium Surgery',
    description: 'Surgical care for pterygium.',
    image: '/images/laser-procedures.jpg',
    imageAlt: 'An eye surgeon using an operating microscope.',
  },
  {
    title: 'Dry Eye Evaluation & Treatment',
    description: 'Evaluation and treatment for dry-eye symptoms.',
    image: '/images/dry-eye-treatment.jpg',
    imageAlt: 'Eye drops being applied during eye care.',
  },
  {
    title: 'Computer Vision Syndrome Management',
    description: 'Management of eye strain related to screen use.',
    image: '/images/computer-eye-strain.jpg',
    imageAlt: 'A person experiencing eye strain while using a laptop.',
  },
  {
    title: 'Eye Allergy & Infection Treatment',
    description: 'Care for eye allergies and infections.',
    image: '/images/eye-allergy-infection.jpg',
    imageAlt: 'Eye care for irritation and infection.',
  },
  {
    title: 'Retinal Screening & Evaluation',
    description: 'Retinal screening and evaluation.',
    image: '/images/retinal-screening.jpg',
    imageAlt: 'A young patient having an eye examination with optical equipment.',
  },
];

export const dentalServices = [
  {
    title: 'General Dentistry',
    description:
      'Comprehensive oral exams, cleaning, and preventive care to maintain healthy teeth and gums for the whole family.',
    image: '/images/dental-checkup.jpg',
    imageAlt: 'A dentist examining a patient’s teeth.',
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
    image: '/images/dental-crown.jpg',
    imageAlt: 'A dental crown used to restore a tooth.',
  },
  {
    title: 'Dental Implants',
    description:
      'Permanent and natural-looking solutions for missing teeth with advanced dental implant procedures.',
    image: '/images/dental-implants.webp',
    imageAlt: 'A dental implant restoration.',
  },
  {
    title: 'Cosmetic Dentistry',
    description:
      'Smile makeovers, teeth whitening, veneers, and cosmetic corrections to enhance your appearance and confidence.',
    image: '/images/cosmetic-dentistry.webp',
    imageAlt: 'Cosmetic dental treatment.',
  },
  {
    title: 'Pediatric Dentistry',
    description:
      'Gentle and friendly dental care designed specifically for children, ensuring lifelong oral health habits.',
    image: '/images/pediatric-dentistry.jpg',
    imageAlt: 'A child receiving dental care.',
  },
  {
    title: 'Oral Surgery',
    description:
      'Expert surgical solutions for wisdom teeth removal, jaw alignment, and other oral surgical procedures.',
    image: '/images/oral-surgery.webp',
    imageAlt: 'Oral surgery performed by a dental clinician.',
  },
];

export const galleryImages = [
  {
    src: '/images/hospital-cover.webp',
    alt: 'DH Hospitals',
    caption: 'DH Hospitals',
  },
  {
    src: '/images/child-health-support.jpg',
    alt: 'A clinician measuring a young child during a pediatric checkup.',
    caption: 'Children’s care',
  },
  {
    src: '/images/general-medicine.jpg',
    alt: 'A physician checking an adult patient’s blood pressure.',
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
