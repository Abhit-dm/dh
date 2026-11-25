import { HeartHandshake, Eye, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import CallToAction from '../components/CallToAction.jsx';
import SpecializationGrid from '../components/SpecializationGrid.jsx';

const hospitalServices = [
  {
    icon: HeartHandshake,
    title: 'Comprehensive Pediatric Care',
    description:
      'Medical care for newborns, infants, and adolescents up to 18 years old. Services include care for skin problems, nebulization, and diet feeding counseling.',
  },
  {
    icon: Eye,
    title: 'Eye Care',
    description:
      'DH Hospitals publishes information about cataract and glaucoma surgery, optic nerve treatments, laser and LASIK procedures.',
  },
  {
    icon: Stethoscope,
    title: 'Dental Services',
    description:
      'Explore the dental services published by DH Hospitals, including general dentistry, dental implants, cosmetic dentistry, and oral surgery.',
  },
];

export default function About() {
  return (
    <>
      <main>
        <PageIntro
          eyebrow="About Us"
          title="About DH Hospitals"
          image="/images/about-family-healthcare.jpg"
          imageAlt="A clinician consulting with older and younger family members."
        />
        <section className="section about-story">
          <div className="container about-story-layout">
            <div>
              <span className="eyebrow">Our hospital</span>
              <h2>Welcome to DH Hospitals</h2>
            </div>
            <div className="about-story-copy">
              <p>
                Welcome to DH Hospitals, established in 2019 by <span className="doctor-name-highlight">Dr. Dinesh Davuluru</span>
                {' '}and <span className="doctor-name-highlight">Dr. Haasitha Chigurupati</span>.
                {' '}Our team also includes <span className="doctor-name-highlight">Dr. Sai Harshitha Sunkavally</span>,
                our Dental Surgeon.
              </p>
              <p>
                Our mission is to provide quality healthcare with compassion, honesty,
                and affordability under one roof. We believe healthcare is about caring
                for people, supporting families, and building lifelong trust.
              </p>
              <p>
                At DH Hospitals, we offer comprehensive healthcare services for children,
                adults, and senior citizens through our specialized departments and visiting consultants.
              </p>
              <p>At DH Hospitals, your family&apos;s health, comfort, and well-being always come first.</p>
              <Link className="text-link" to="/contact">
                Contact DH Hospitals <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
        <SpecializationGrid
          id="about-specializations"
          eyebrow="Departments"
          title="Seven services at DH Hospitals."
          description="Explore department information and appointment enquiries."
        />
        <section className="section about-services">
          <div className="container">
            <SectionHeading
              eyebrow="Hospital services"
              title="Care across three specialties."
              description="Services and information published by DH Hospitals."
            />
            <div className="about-service-grid">
              {hospitalServices.map(({ icon: Icon, title, description }, index) => (
                <article className="about-service-card" key={title}>
                  <span className="about-service-index">0{index + 1}</span>
                  <span className="about-service-icon"><Icon size={25} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section equipment-section">
          <div className="container equipment-layout">
            <div className="equipment-image">
              <img src="/images/hospital-cover.webp" alt="DH Hospitals" loading="lazy" decoding="async" />
            </div>
            <div className="equipment-copy">
              <span className="eyebrow">Hospital information</span>
              <h2>Hospital services and equipment.</h2>
              <p>
                DH Hospitals presents its pediatric, eye, and dental services
                for patients and families. For service details or appointment
                enquiries, contact the hospital directly.
              </p>
              <Link className="button" to="/appointment">
                Make an enquiry <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
        <CallToAction />
      </main>
    </>
  );
}
