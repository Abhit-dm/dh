import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Baby,
  Eye,
  HeartHandshake,
  ScanEye,
  Stethoscope,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';
import {
  childServices,
  dentalServices,
  doctors,
  eyeServices,
  galleryImages,
} from '../data/hospital.js';
import DoctorCard from '../components/DoctorCard.jsx';
import Reveal from '../components/Reveal.jsx';
import CallToAction from '../components/CallToAction.jsx';

const careHighlights = [
  {
    icon: Baby,
    title: 'Care through age 18',
    description:
      'Pediatric care is described for newborns, infants, and adolescents up to 18 years old.',
    to: '/child-care',
  },
  {
    icon: HeartHandshake,
    title: 'Pediatric health support',
    description:
      'Listed pediatric services include care for skin problems, nebulization, and diet feeding counseling.',
    to: '/child-care',
  },
  {
    icon: Eye,
    title: 'Eye services',
    description:
      'DH Hospitals lists vision screening, cataract surgery, LASIK, and related consultations.',
    to: '/eye-care',
  },
  {
    icon: ScanEye,
    title: 'Dental care',
    description:
      'Explore dental services and contact the hospital for information about care.',
    to: '/dental-care',
  },
];

const highlightedDentalServices = [
  dentalServices[0],
  dentalServices[3],
  dentalServices[4],
  dentalServices[6],
];

function CareFeature({ eyebrow, title, description, image, imageAlt, to, link, icon: Icon, reverse = false }) {
  return (
    <section className={`story-section${reverse ? ' story-section-reverse' : ''}`}>
      <div className="container story-layout">
        <Reveal className="story-image-wrap">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
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
  const { contact, homepage } = useHospitalSettings();
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
            DH Children &amp; Eye Hospitals
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
          <span className="eyebrow">A hospital for children &amp; families</span>
          <p>
            Care for children&apos;s health, vision, and dental needs at DH
            Children &amp; Eye Hospitals.
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
              <h2>Care for every family.</h2>
            </Reveal>
            <Reveal>
              <p>
                Explore the pediatric, eye-care, and dental services listed by
                DH Hospitals.
              </p>
            </Reveal>
          </div>
          <div className="service-grid home-service-grid">
            <Reveal delay={0}>
              <article className="service-card">
                <Link
                  to="/child-care"
                  className="service-image-link"
                  aria-label="Explore Child Care"
                >
                  <img
                    src="/images/index-about.webp"
                    alt="Child care services at DH Hospitals"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="service-image-arrow">
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </span>
                </Link>
                <div className="service-card-copy">
                  <span className="service-number">01 / CHILD CARE</span>
                  <h3>Child Care</h3>
                  <p>{childServices[0].description}</p>
                  <Link className="text-link" to="/child-care">
                    Explore child care <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal delay={100}>
              <article className="service-card">
                <Link
                  to="/eye-care"
                  className="service-image-link"
                  aria-label="Explore Eye Care"
                >
                  <img
                    src="/images/vision-screening.webp"
                    alt="Vision screening at DH Eye Hospital"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="service-image-arrow">
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </span>
                </Link>
                <div className="service-card-copy">
                  <span className="service-number">02 / EYE CARE</span>
                  <h3>Eye Care</h3>
                  <p>{eyeServices[0].description}</p>
                  <Link className="text-link" to="/eye-care">
                    Explore eye care <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal delay={200}>
              <article className="service-card">
                <Link
                  to="/dental-care"
                  className="service-image-link"
                  aria-label="Explore Dental Care"
                >
                  <img
                    src={dentalServices[0].image}
                    alt="General dentistry services"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="service-image-arrow">
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </span>
                </Link>
                <div className="service-card-copy">
                  <span className="service-number">03 / DENTAL CARE</span>
                  <h3>Dental Care</h3>
                  <p>{dentalServices[0].description}</p>
                  <Link className="text-link" to="/dental-care">
                    Explore dental care <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <CareFeature
        eyebrow="Child Care"
        title="Caring for every stage of childhood."
        description="Pediatric care at DH Children & Eye Hospitals is described for newborns, infants, and adolescents up to 18 years old. Published services include care for skin problems, nebulization, and diet feeding counseling."
        image="/images/index-about.webp"
        imageAlt="Pediatric care at DH Children & Eye Hospitals"
        to="/child-care"
        link="Discover Child Care"
        icon={Baby}
      />

      <CareFeature
        eyebrow="Eye Care"
        title="Care for clearer vision."
        description="DH Hospitals lists vision screening, cataract surgery, and LASIK, and describes glaucoma surgery, optic nerve treatments, laser procedures, and optics and contact lens consultations."
        image="/images/index-about-2.webp"
        imageAlt="Eye-care services at DH Hospitals"
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
              src="/images/general-dentistry.webp"
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
              <span className="eyebrow">Why DH Hospitals</span>
              <h2>Care informed by your needs.</h2>
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
              alt="Hospital care at DH Children & Eye Hospitals"
              loading="lazy"
              decoding="async"
            />
            <span>DH Children &amp; Eye Hospitals · Poranki</span>
          </Reveal>
          <Reveal className="facilities-copy">
            <span className="eyebrow">Hospital information</span>
            <h2>Services for children&apos;s health and vision.</h2>
            <p>
              DH Hospitals presents pediatric, eye-care, and dental services
              at its Poranki hospital. Contact the team for current details
              about facilities and equipment.
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
              <h2>Meet the care team.</h2>
              <p>Doctors and qualifications listed by DH Hospitals.</p>
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
          <p className="doctor-photo-note">
            Original doctor photographs were not available in the published
            hospital assets.
          </p>
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

      <section className="home-contact-strip">
        <div className="container home-contact-inner">
          <div>
            <span className="eyebrow eyebrow-light">Contact DH Hospitals</span>
            <h2>Care starts with a conversation.</h2>
            <p>{contact.address}</p>
          </div>
          <div className="home-contact-actions">
            <a className="button button-light" href={`tel:${contact.phoneLink}`}>
              Call {contact.phone} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <Link className="button button-outline-light" to="/contact">
              Contact Us <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CallToAction eyebrow="We are here to help" />
    </main>
  );
}
