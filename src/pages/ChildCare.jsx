import { Baby, HeartHandshake, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CHILD_CARE_MAIN_IMAGE, childServices } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';
import useDepartmentCursorMotion from '../hooks/useDepartmentCursorMotion.js';

const childCareLinks = [
  { icon: Baby, title: 'Newborn Care', description: 'Safe, attentive newborn care.', image: '/images/newborn-care.jpg', imageAlt: 'Illustrative photo of a newborn resting in a hospital crib.' },
  { icon: HeartHandshake, title: 'Child Health Consultations', description: 'Consultations for children’s health needs.', image: CHILD_CARE_MAIN_IMAGE, imageAlt: 'A pediatrician examining a young child during a consultation.' },
  { icon: Stethoscope, title: 'Vaccinations & Immunizations', description: 'Recommended immunization care.', image: '/images/pediatric-vaccination.jpg', imageAlt: 'Illustrative photo of a child receiving a vaccination from a healthcare professional.' },
  { icon: Baby, title: 'Growth & Development Monitoring', description: 'Monitoring of healthy growth and development.', image: '/images/child-health-support.jpg', imageAlt: 'Child growth assessment' },
  { icon: HeartHandshake, title: 'Nutritional Counselling', description: 'Guidance for children’s nutrition.', image: '/images/family-healthcare.jpg', imageAlt: 'Pediatric nutrition consultation' },
  { icon: Stethoscope, title: 'Childhood Infection Management', description: 'Assessment and management of childhood infections.', image: '/images/pediatric-infection-care.jpg', imageAlt: 'Illustrative photo of a pediatrician examining a child during a consultation.' },
  { icon: Baby, title: 'Asthma & Allergy Care', description: 'Care for childhood asthma and allergies.', image: '/images/pediatric-asthma-care.jpg', imageAlt: 'Illustrative photo of a child receiving inhalation therapy.' },
  { icon: HeartHandshake, title: 'Adolescent Health Services', description: 'Support for adolescent health concerns.', image: '/images/adolescent-health-consultation.jpg', imageAlt: 'Illustrative photo of a teenager discussing health concerns with a doctor.' },
  { icon: Stethoscope, title: 'Pediatric Emergency Care', description: 'Prompt pediatric emergency care.', image: '/images/pediatric-emergency-care.jpg', imageAlt: 'Pediatric emergency-response training using a child-sized mannequin.' },
  { icon: Baby, title: 'Developmental Assessments', description: 'Age-appropriate developmental assessments.', image: '/images/pediatric-developmental-play.jpg', imageAlt: 'Illustrative photo of a baby practicing hand-eye coordination with building blocks.' },
];

export default function ChildCare() {
  const { doctors } = usePublicDoctors('child-care');
  const cursorMotionHandlers = useDepartmentCursorMotion();
  const doctor = doctors[0];
  return (
    <>
      <main className="department-care-page cursor-motion-page" {...cursorMotionHandlers}>
        <PageIntro
          eyebrow="Child Care"
          title="Caring for your child’s health."
          description="Explore child care information and services at DH Hospitals."
          image={CHILD_CARE_MAIN_IMAGE}
          imageAlt="Child Care at DH Hospitals – Doctor caring for a young patient."
          imageClassName="child-care-page-image"
          imageWidth={1536}
          imageHeight={1024}
        />
        <section className="section service-detail-intro">
          <div className="container service-detail-layout">
            <div className="service-detail-copy">
              <span className="eyebrow">Led by <span className="doctor-name-highlight">Dr. Dinesh Davuluru</span></span>
              <p>
                MBBS, DCH, DNB, PGPN (Boston)<br />
                Consultant Pediatrician &amp; Neonatologist<br />
                14+ Years of Clinical Experience
              </p>
              <Link className="button" to="/appointment?department=Child%20Care">
                Book Child Appointment <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="service-detail-image child-care-detail-image">
              <img
                src="/images/newborn-care.jpg"
                alt="A newborn receiving care in a hospital nursery."
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
              />
              <span className="image-caption">DH Hospitals</span>
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
              {childCareLinks.map(({ icon: Icon, title, description, image, imageAlt }, index) => (
                <article className="care-option-card" key={title}>
                  {image && <img className="care-option-image" src={image} alt={imageAlt} loading="lazy" decoding="async" />}
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
              description="Pediatric services listed by DH Hospitals."
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
        <section className="section care-options-section">
          <div className="container">
            <SectionHeading
              eyebrow="Advanced Facilities"
              title="Critical care support for infants and children."
            />
            <div className="care-option-grid">
              {[
                ['NICU', 'NICU – Neonatal Intensive Care Unit', 'Specialized care and monitoring facilities for newborn babies who require additional medical attention.', '/images/nicu.jpg', 'NICU neonatal intensive care unit'],
                ['PICU', 'PICU – Pediatric Intensive Care Unit', 'Specialized intensive care facilities for children who require close medical monitoring and treatment.', '/images/picu.jpg', 'PICU pediatric intensive care unit'],
                ['CPAP Systems', 'CPAP Systems', 'Respiratory support equipment that helps maintain continuous positive airway pressure.', '/images/cpap-system.jpg', 'CPAP respiratory support system'],
                ['HFNC', 'HFNC – High-Flow Nasal Cannula', 'A respiratory support system that delivers heated, humidified oxygen at controlled flow rates.', '/images/pediatric-emergency-care.jpg', 'High-flow nasal cannula respiratory support'],
                ['Phototherapy', 'Phototherapy Units', 'Specialized light-based equipment used for treating neonatal jaundice under medical supervision.', '/images/phototherapy-unit.jpg', 'Neonatal phototherapy unit'],
                ['Ventilators', 'Neonatal & Pediatric Ventilators', 'Medical respiratory support equipment used for patients who require assisted breathing.', '/images/pediatric-ventilator.jpg', 'Neonatal and pediatric ventilator'],
                ['Monitoring', 'Multiparameter Monitoring Systems', 'Equipment used to monitor heart rate, oxygen saturation, and other clinical measurements.', '/images/multiparameter-monitor.jpg', 'Multiparameter clinical monitor'],
                ['Warmers', 'Infant Warmers', 'Specialized equipment designed to help maintain a newborn baby’s body temperature.', '/images/infant-warmer.jpg', 'Newborn infant warmer'],
              ].map(([key, title, description, image, alt]) => (
                <article className="care-option-card facility-card" key={key}>
                  <img src={image} alt={alt} loading="lazy" decoding="async" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '28px' }}>
              Whether it is a newborn&apos;s first check-up, routine vaccination, or specialized critical care,
              families can trust our pediatric team to provide expert treatment in a safe, caring,
              and child-friendly environment.
            </p>
          </div>
        </section>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Expert pediatricians</span>
              <h2>Guidance from an experienced pediatrician.</h2>
              <p>
                DH Hospitals describes its pediatricians as
                experienced medical professionals dedicated to specialized
                care for children and their well-being.
              </p>
            </div>
            {doctor && <DoctorCard doctor={doctor} />}
          </div>
        </section>
        <CallToAction eyebrow="Child care appointments" />
      </main>
    </>
  );
}
