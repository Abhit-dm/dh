import { HeartHandshake, Eye, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import CallToAction from '../components/CallToAction.jsx';

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
      'DH Hospital specializes in cataract and glaucoma surgery, optic nerve treatments, laser and LASIK procedures.',
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
          title="About DH Children & Eye Hospitals"
          description="Caring for your child’s health at DH Children & Eye Hospitals."
          image="/images/index-about.webp"
          imageAlt="DH Hospitals"
        />
        <section className="section about-story">
          <div className="container about-story-layout">
            <div>
              <span className="eyebrow">Our hospital</span>
              <h2>Caring for Every Child&apos;s Health and Vision.</h2>
            </div>
            <div className="about-story-copy">
              <p>
                DH Children &amp; Eye Hospitals provides comprehensive medical
                care for children, eye care, and dental services in Poranki,
                Vijayawada.
              </p>
              <p>
                The hospital’s published pediatric services cater to newborns,
                infants, and adolescents up to 18 years old. Its website also
                describes experienced pediatricians and emergency pediatric
                care support.
              </p>
              <Link className="text-link" to="/contact">
                Contact DH Hospitals <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
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
