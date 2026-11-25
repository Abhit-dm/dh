import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Baby,
  Eye,
  HeartHandshake,
  Siren,
  ScanLine,
  ScanEye,
  Stethoscope,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';
import {
  childServices,
  dentalServices,
  eyeServices,
  galleryImages,
  CHILD_CARE_MAIN_IMAGE,
} from '../data/hospital.js';
import DoctorCard from '../components/DoctorCard.jsx';
import Reveal from '../components/Reveal.jsx';
import CallToAction from '../components/CallToAction.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';

const careHighlights = [
  {
    icon: Baby,
    title: '25-Bedded Family Hospital',
    description: 'A trusted family hospital providing care for every member of the family.',
    to: '/child-care',
  },
  {
    icon: HeartHandshake,
    title: 'Established in 2019',
    to: '/about',
  },
  {
    icon: ScanLine,
    title: 'Penamaluru, Vijayawada',
    description: 'Serving families in Penamaluru and the surrounding Vijayawada community.',
    to: '/contact',
  },
  {
    icon: Stethoscope,
    title: 'Experienced Medical Specialists',
    description: 'Pediatric, ophthalmology, and dental specialist-led care.',
    to: '/doctors',
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Pediatric, Eye Care & Dental Departments',
    description: 'Specialized departments for children, vision, and dental health.',
    to: '/child-care',
  },
  {
    icon: Eye,
    title: 'Fully Equipped NICU & PICU Facilities',
    description: 'Neonatal and pediatric critical-care facilities.',
    to: '/child-care',
  },
  {
    icon: Stethoscope,
    title: 'Neonatal & Pediatric Critical Care Equipment',
    description: 'Ventilation, monitoring, warming, CPAP, HFNC, and phototherapy support.',
    to: '/child-care',
  },
  {
    icon: ScanEye,
    title: '24/7 Emergency Services',
    description: 'Round-the-clock emergency healthcare support.',
    to: '/family-healthcare',
  },
  {
    icon: Siren,
    title: '24/7 Laboratory Services',
    description: 'Laboratory services available around the clock.',
    to: '/family-healthcare',
  },
  {
    icon: HeartHandshake,
    title: '24/7 Pharmacy',
    description: 'Pharmacy support available around the clock.',
    to: '/family-healthcare',
  },
  {
    icon: Stethoscope,
    title: 'Inpatient Care Facilities',
    description: 'General wards, sharing rooms, non-AC rooms, and private AC rooms.',
    to: '/family-healthcare',
  },
  {
    icon: ScanLine,
    title: 'Affordable & Ethical Healthcare',
    description: 'Quality healthcare delivered with compassion and transparency.',
    to: '/contact',
  },
  {
    icon: Stethoscope,
    title: 'Child-Friendly & Family-Friendly Environment',
    description: 'A caring, welcoming environment for patients and families.',
    to: '/about',
  },
];

const highlightedDentalServices = [
  dentalServices[0],
  dentalServices[3],
  dentalServices[4],
  dentalServices[6],
];

function CareFeature({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imageClassName = '',
  imageWidth,
  imageHeight,
  to,
  link,
  icon: Icon,
  reverse = false,
}) {
  return (
    <section className={`story-section${reverse ? ' story-section-reverse' : ''}`}>
      <div className="container story-layout">
        <Reveal className={`story-image-wrap${imageClassName ? ` ${imageClassName}` : ''}`}>
          <img
            src={image}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            loading="lazy"
            decoding="async"
          />
          <span className="story-image-mark">
            <Icon size={19} aria-hidden="true" />
            DH Hospitals
          </span>
        </Reveal>
        <Reveal className="story-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          <Link className="text-link" to={to}>
            {link} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { homepage } = useHospitalSettings();
  const { doctors } = usePublicDoctors();
  return (
    <main>
      <section className="hero cinematic-hero">
        <img
          className="hero-image"
          src="/images/index-about-2.webp"
          alt=""
          fetchpriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="eyebrow eyebrow-light">
            DH Hospitals
          </span>
          <h1>{homepage.heroTitle}</h1>
          <p>{homepage.heroDescription}</p>
          <div className="hero-actions">
            <Link className="button button-light" to="/appointment">
              Book Appointment <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-outline-light" to="#services">
              Explore Services <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <a className="hero-scroll" href="#services">
          <ArrowDown size={16} aria-hidden="true" /> Scroll to explore
        </a>
        <span className="hero-index">Poranki · Vijayawada</span>
      </section>

      <section className="home-intro-band" aria-label="Hospital introduction">
        <div className="container home-intro-inner">
          <span className="eyebrow">A hospital for families</span>
          <p>
            DH Hospitals is a trusted 25-bedded family hospital in Penamaluru, Vijayawada,
            providing compassionate, affordable, and comprehensive healthcare for every member
            of your family.
          </p>
          <Link className="text-link" to="/about">
            About the hospital <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="section home-services" id="services">
        <div className="container">
          <div className="story-heading-row">
            <Reveal>
              <span className="eyebrow">Our services</span>
              <h2>One Stop Solution for All Family Health Needs</h2>
            </Reveal>
            <Reveal>
              <p>Explore the departments and healthcare services available at DH Hospitals.</p>
            </Reveal>
          </div>
          <div className="service-grid home-service-grid">
            {[
              ['01', 'Child Care', 'Newborn, pediatric, vaccination, and developmental care.', '/child-care', '/images/child-care-main.webp', 'Pediatric consultation at DH Hospitals'],
              ['02', 'Eye Care', 'Comprehensive examinations and vision care.', '/eye-care', '/images/vision-screening.webp', 'Eye examination at DH Hospitals'],
              ['03', 'Dental Care', 'Preventive, restorative, cosmetic, and implant dental care.', '/dental-care', '/images/general-dentistry.webp', 'Dental consultation at DH Hospitals'],
              ['04', 'Obstetrics & Gynecology', 'Women’s healthcare consultation and specialist services.', '/family-healthcare', '/images/obstetrics-gynecology.jpg', 'Women’s healthcare consultation'],
              ['05', 'Infertility Services', 'Information about infertility consultation and specialist support.', '/family-healthcare', '/images/infertility-services.jpg', 'Infertility consultation'],
              ['06', 'General Surgery', 'General surgical consultation and inpatient support.', '/family-healthcare', '/images/general-surgery.jpg', 'General surgical environment'],
              ['07', 'Pediatric Surgery', 'Surgical consultation and care for children.', '/family-healthcare', '/images/pediatric-surgery.jpg', 'Pediatric surgical consultation'],
              ['08', 'Pediatric Orthopedics', 'Bone and joint care for children.', '/family-healthcare', '/images/pediatric-orthopedics.jpg', 'Pediatric orthopedic consultation'],
              ['09', 'Pediatric Neurology', 'Neurological consultation and care for children.', '/family-healthcare', '/images/pediatric-neurology.jpg', 'Pediatric neurological consultation'],
              ['10', 'ENT (Ear, Nose & Throat)', 'ENT examination and specialist consultation.', '/family-healthcare', '/images/ent-ear-exam.jpg', 'ENT ear examination'],
              ['11', 'Plastic Surgery', 'Plastic surgery consultation and specialist services.', '/family-healthcare', '/images/plastic-surgery.jpg', 'Plastic surgery consultation'],
              ['12', 'General Orthopedics', 'Bone, joint, and orthopedic consultation.', '/family-healthcare', '/images/orthopedics.jpg', 'Orthopedic consultation'],
              ['13', 'Psychiatry', 'Professional mental-health consultation and support.', '/family-healthcare', '/images/psychiatry.jpg', 'Mental wellness consultation'],
              ['14', 'Psychological Counselling', 'Confidential psychological counselling support.', '/family-healthcare', '/images/psychological-counselling.jpg', 'Psychological counselling consultation'],
              ['15', 'Emergency Services', 'Round-the-clock emergency medical care.', '/family-healthcare', '/images/emergency-services.jpg', 'Emergency care facility'],
              ['16', 'Laboratory Services', '24/7 laboratory testing and diagnostic support.', '/family-healthcare', '/images/laboratory-services.jpg', 'Laboratory testing'],
              ['17', 'Pharmacy', '24/7 pharmacy and medication support.', '/family-healthcare', '/images/pharmacy.jpg', 'Hospital pharmacy'],
              ['18', 'Inpatient Care', 'Comfortable inpatient accommodation and clinical care.', '/family-healthcare', '/images/inpatient-room-care.jpg', 'A patient receiving care in a hospital room'],
            ].map(([number, title, description, to, image, imageAlt], index) => (
              <Reveal key={title} delay={(index % 6) * 70}>
                <article className="service-card">
                  <Link to={to} className="service-image-link" aria-label={`Explore ${title}`}>
                    <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
                    <span className="service-image-arrow"><ArrowUpRight size={19} aria-hidden="true" /></span>
                  </Link>
                  <div className="service-card-copy">
                    <span className="service-number">{number} / {title.toUpperCase()}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <Link className="text-link" to={to}>Explore service <ArrowUpRight size={15} aria-hidden="true" /></Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CareFeature
        eyebrow="Child Care"
        title="Caring for every stage of childhood."
        description="Pediatric care at DH Hospitals is described for newborns, infants, and adolescents up to 18 years old. Published services include care for skin problems, nebulization, and diet feeding counseling."
        image={CHILD_CARE_MAIN_IMAGE}
        imageAlt="Child Care at DH Hospitals – Doctor caring for a young patient."
        imageClassName="child-care-feature-image"
        imageWidth={1536}
        imageHeight={1024}
        to="/child-care"
        link="Discover Child Care"
        icon={Baby}
      />

      <CareFeature
        eyebrow="Eye Care"
        title="Care for clearer vision."
        description="DH Hospitals lists vision screening, cataract surgery, and LASIK, and describes glaucoma surgery, optic nerve treatments, laser procedures, and optics and contact lens consultations."
        image="/images/glaucoma-tonometry.jpg"
        imageAlt="A clinician measuring a patient’s eye pressure during an eye exam."
        to="/eye-care"
        link="Discover Eye Care"
        icon={Eye}
        reverse
      />

      <section className="section dental-story-section">
        <div className="container dental-story-layout">
          <Reveal className="dental-story-copy">
            <span className="eyebrow">Dental Care</span>
            <h2>Dental services at DH Hospitals.</h2>
            <p>
              Explore the dental service information presented by DH Hospitals
              and contact the hospital with questions.
            </p>
            <div className="dental-service-links">
              {highlightedDentalServices.map((service) => (
                <Link to="/dental-care" key={service.title}>
                  <span>{service.title}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
            <Link className="button" to="/dental-care">
              View dental services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal className="dental-story-image">
            <img
              src="/images/cosmetic-dentistry.webp"
              alt="Dental care services"
              loading="lazy"
              decoding="async"
            />
            <span>Dental Care · DH Hospitals</span>
          </Reveal>
        </div>
      </section>

      <section className="section why-section">
        <div className="container">
          <div className="why-heading">
            <div>
              <span className="eyebrow">Our approach</span>
              <h2>Why DH Hospitals?</h2>
            </div>
            <p>
              Explore the services and information published by DH Hospitals
              in Poranki, Vijayawada.
            </p>
          </div>
          <div className="highlight-grid home-highlight-grid">
            {careHighlights.map(({ icon: Icon, title, description, to }, index) => (
              <Reveal key={title} delay={index * 70}>
                <Link className="highlight-card" to={to}>
                  <span className="highlight-number">0{index + 1}</span>
                  <span className="highlight-icon">
                    <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="highlight-link">
                    Learn more <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section facilities-section">
        <div className="container facilities-layout">
          <Reveal className="facilities-image">
            <img
              src="/images/hospital-cover.webp"
              alt="Hospital care at DH Hospitals"
              loading="lazy"
              decoding="async"
            />
            <span>DH Hospitals · Penamaluru </span>
          </Reveal>
          <Reveal className="facilities-copy">
            <span className="eyebrow">Hospital information</span>
            <h2>Comprehensive family healthcare.</h2>
            <p>
              At DH Hospitals, your family&apos;s health, comfort, and well-being always come first.
            </p>
            <Link className="text-link" to="/about">
              About our hospital <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section doctors-preview">
        <div className="container">
          <div className="section-row-heading">
            <div>
              <span className="eyebrow">Our doctors</span>
              <h2>Meet Our Specialists</h2>
            </div>
            <Link className="text-link doctors-view-all" to="/doctors">
              View all doctors <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="doctor-grid">
            {doctors.map((doctor, index) => (
              <Reveal key={doctor.name} delay={index * 100}>
                <DoctorCard doctor={doctor} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-gallery-section">
        <div className="container">
          <div className="story-heading-row">
            <Reveal>
              <span className="eyebrow">DH Hospitals</span>
              <h2>A look around our services.</h2>
            </Reveal>
            <Link className="text-link" to="/gallery">
              Visit the gallery <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-gallery-grid">
            {galleryImages.slice(0, 3).map((image, index) => (
              <Reveal key={image.src} delay={index * 100}>
                <Link
                  className="home-gallery-item"
                  to="/gallery"
                  aria-label={`View gallery: ${image.caption}`}
                >
                  <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                  <span>{image.caption}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-blog-section">
        <div className="container">
          <div className="story-heading-row">
            <Reveal>
              <span className="eyebrow">Health Guides</span>
              <h2>Information about our services.</h2>
            </Reveal>
            <Link className="text-link" to="/blog">
              Explore all guides <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-guide-grid">
            <Reveal>
              <Link className="home-guide-card" to="/blog">
                <span><Baby size={19} aria-hidden="true" /> Child Care</span>
                <h3>Pediatric services through age 18</h3>
                <p>Read the DH Hospitals service overview.</p>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal delay={90}>
              <Link className="home-guide-card" to="/blog">
                <span><Eye size={19} aria-hidden="true" /> Eye Care</span>
                <h3>Vision screening and eye services</h3>
                <p>Explore the services listed by the hospital.</p>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal delay={180}>
              <Link className="home-guide-card" to="/blog">
                <span><Stethoscope size={19} aria-hidden="true" /> Dental Care</span>
                <h3>Dental service information</h3>
                <p>See the published dental-care overview.</p>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <CallToAction eyebrow="We are here to help" showPhone={false} />
    </main>
  );
}
