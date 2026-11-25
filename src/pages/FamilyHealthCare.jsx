import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction.jsx';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import useDepartmentCursorMotion from '../hooks/useDepartmentCursorMotion.js';

const specialistServices = [
  ['Obstetrics & Gynecology', '/images/obstetrics-gynecology.jpg', 'Women’s healthcare consultation'],
  ['Infertility Services', '/images/infertility-services.jpg', 'Infertility consultation'],
  ['General Surgery', '/images/general-surgery.jpg', 'General surgical environment'],
  ['Pediatric Surgery', '/images/pediatric-surgery.jpg', 'Pediatric surgical consultation'],
  ['Pediatric Orthopedics', '/images/pediatric-orthopedics.jpg', 'Pediatric orthopedic consultation'],
  ['Pediatric Neurology', '/images/pediatric-neurology.jpg', 'Pediatric neurological consultation'],
  ['ENT (Ear, Nose & Throat)', '/images/ent-ear-exam.jpg', 'ENT ear examination'],
  ['Plastic Surgery', '/images/plastic-surgery.jpg', 'Plastic surgery consultation'],
  ['General Orthopedics', '/images/orthopedics.jpg', 'Orthopedic consultation'],
  ['Psychiatry', '/images/psychiatry.jpg', 'Mental wellness consultation'],
  ['Psychological Counselling', '/images/psychological-counselling.jpg', 'Psychological counselling consultation'],
];

const accommodationRooms = [
  {
    name: 'AC Rooms',
    image: '/images/ac-hospital-room.jpg',
    imageAlt: 'Hospital patient receiving care in a patient room.',
  },
  {
    name: 'Non-AC Rooms',
    image: '/images/non-ac-hospital-room.jpg',
    imageAlt: 'A bright hospital ward with beds and privacy curtains.',
  },
  {
    name: 'General Rooms',
    image: '/images/general-hospital-room.jpg',
    imageAlt: 'A general hospital room with patient beds and equipment.',
  },
  {
    name: 'Shared Rooms',
    image: '/images/shared-hospital-room.jpg',
    imageAlt: 'A shared hospital ward with multiple patient beds.',
  },
];

export default function FamilyHealthCare() {
  const cursorMotionHandlers = useDepartmentCursorMotion();

  return (
    <main className="cursor-motion-page" {...cursorMotionHandlers}>
      <PageIntro
        eyebrow="Family Health Care"
        title="FAMILY HEALTHCARE"
        description="Specialist services and round-the-clock healthcare support for your family."
        image="/images/family-healthcare.jpg"
        imageAlt="A clinician consulting with a family."
      />
      <section className="section family-healthcare-section">
        <div className="container">
          <SectionHeading
            eyebrow="Our specialist services"
            title="Care for every member of the family."
          />
          <div className="family-care-grid">
            {specialistServices.map(([title, image, alt], index) => (
              <article className="family-care-card" key={title}>
                <img className="family-care-image" src={image} alt={alt} loading="lazy" decoding="async" />
                <span className="family-care-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <Link className="text-link" to="/appointment">Make an enquiry</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="24/7 Emergency & Diagnostic Services"
            title="Medical care around the clock."
            description="Medical emergencies can occur at any time. Our dedicated healthcare team is available around the clock to provide timely and effective medical care."
          />
          <div className="highlight-grid home-highlight-grid">
            {[
              ['24/7 Emergency Services', '/images/emergency-services.jpg', 'Emergency medical care facility'],
              ['24/7 Laboratory Services', '/images/laboratory-services.jpg', 'Laboratory testing facility'],
              ['24/7 Pharmacy', '/images/pharmacy.jpg', 'Hospital pharmacy facility'],
              ['Inpatient Care Facilities', '/images/inpatient-room-care.jpg', 'A patient receiving care in a hospital room'],
            ].map(([facility, image, alt]) => (
              <article className="highlight-card" key={facility}>
                <img className="family-care-image" src={image} alt={alt} loading="lazy" decoding="async" />
                <h3>{facility}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section why-section">
        <div className="container">
          <SectionHeading
            eyebrow="Comfortable Inpatient Accommodation"
            title="A comfortable hospital stay."
          />
          <div className="care-option-grid accommodation-grid">
            {accommodationRooms.map(({ name, image, imageAlt }) => (
              <article className="care-option-card" key={name}>
                <img className="care-option-image" src={image} alt={imageAlt} loading="lazy" decoding="async" />
                <h3>{name}</h3>
              </article>
            ))}
          </div>
          <p style={{ marginTop: '28px', textAlign: 'center' }}>
            At DH Hospitals, we combine modern medical facilities with compassionate care to create
            a healthcare experience where patients feel supported, families feel reassured, and
            every individual receives the attention they deserve.
          </p>
        </div>
      </section>
      <CallToAction eyebrow="Family health enquiries" />
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="DH Hospitals" title="Dedicated to Your Health" />
        </div>
      </section>
    </main>
  );
}
