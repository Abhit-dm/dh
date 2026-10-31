import { Baby, HeartHandshake, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { childServices, doctors } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';

const childCareLinks = [
  {
    icon: Baby,
    title: 'Newborns, infants & adolescents',
    description:
      'Pediatric services are described for newborns, infants, and adolescents up to 18 years old.',
  },
  {
    icon: HeartHandshake,
    title: 'Pediatric health services',
    description:
      'Care includes support for skin problems, nebulization, and diet feeding counseling.',
  },
  {
    icon: Stethoscope,
    title: 'Emergency pediatric care support',
    description:
      'The hospital describes prompt medical care support and guidance for children’s health needs.',
  },
];

export default function ChildCare() {
  const doctor = doctors[0];
  return (
    <>
      <main>
        <PageIntro
          eyebrow="Child Care"
          title="Caring for your child’s health."
          description="Experience comprehensive medical care for children at DH Children & Eye Hospitals."
          image="/images/index-about.webp"
          imageAlt="DH Children & Eye Hospitals"
        />
        <section className="section service-detail-intro">
          <div className="container service-detail-layout">
            <div className="service-detail-copy">
              <span className="eyebrow">Our children&apos;s medical services</span>
              <h2>Comprehensive Pediatric Care</h2>
              <p>
                Experience comprehensive medical care for children at DH
                Children &amp; Eye Hospitals. Services cater to newborns,
                infants, and adolescents up to 18 years old. From skin problems
                to nebulization and diet feeding counseling, the hospital
                describes care for children’s health needs.
              </p>
              <Link className="button" to="/appointment?department=Child%20Care">
                Book a child care appointment <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="service-detail-image">
              <img src="/images/hospital-cover.webp" alt="DH Hospitals" loading="lazy" decoding="async" />
              <span className="image-caption">DH Children &amp; Eye Hospitals</span>
            </div>
          </div>
        </section>
        <section className="section care-options-section">
          <div className="container">
            <SectionHeading
              eyebrow="Pediatric services"
              title="Support through every stage of childhood."
              description="Care and service information described by DH Hospitals."
            />
            <div className="care-option-grid">
              {childCareLinks.map(({ icon: Icon, title, description }, index) => (
                <article className="care-option-card" key={title}>
                  <div className="care-option-top">
                    <span className="care-option-icon"><Icon size={24} /></span>
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section service-related">
          <div className="container">
            <SectionHeading
              eyebrow="Children's care"
              title="Care for your child."
              description="Pediatric services listed by DH Children & Eye Hospitals."
            />
            <div className="service-grid">
              {childServices.map((service) => (
                <ServiceCard
                  key={service.title}
                  {...service}
                  to="/appointment?department=Child%20Care"
                />
              ))}
            </div>
          </div>
        </section>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Expert pediatricians</span>
              <h2>Guidance from an experienced pediatrician.</h2>
              <p>
                DH Children &amp; Eye Hospitals describes its pediatricians as
                experienced medical professionals dedicated to specialized
                care for children and their well-being.
              </p>
            </div>
            <DoctorCard doctor={doctor} />
          </div>
        </section>
        <CallToAction eyebrow="Child care appointments" />
      </main>
    </>
  );
}
