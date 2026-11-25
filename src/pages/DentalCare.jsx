import { Link } from 'react-router-dom';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';
import AnimatedCareCharacter from '../components/AnimatedCareCharacter.jsx';
import useDepartmentCursorMotion from '../hooks/useDepartmentCursorMotion.js';

export default function DentalCare() {
  const { doctors } = usePublicDoctors('dental-care');
  const cursorMotionHandlers = useDepartmentCursorMotion();
  const routineServices = [
    ['Routine Dental Check-ups', '/images/dental-checkup.jpg', 'Dentist examining a patient'],
    ['Pediatric Dentistry', '/images/general-dentistry.webp', 'Gentle pediatric dental care'],
    ['Tooth-Colored Fillings', '/images/tooth-filling.jpg', 'Tooth-colored dental filling treatment'],
    ['Root Canal Treatment (RCT)', '/images/oral-surgery.webp', 'Root canal dental treatment'],
    ['Crowns & Bridges', '/images/dental-crown.jpg', 'Dental crown and bridge care'],
    ['Teeth Cleaning & Scaling', '/images/dental-cleaning.jpg', 'Dental scaling and teeth cleaning'],
    ['Gum Disease Treatment', '/images/gum-treatment.jpg', 'Gum disease dental treatment'],
    ['Tooth Extractions', '/images/oral-surgery.webp', 'Dental tooth extraction consultation'],
    ['Wisdom Tooth Management', '/images/wisdom-tooth.jpg', 'Wisdom tooth dental management'],
  ];
  const cosmeticServices = [
    ['Teeth Whitening', '/images/teeth-whitening.jpg', 'Teeth whitening treatment'],
    ['Smile Designing', '/images/smile-designing.jpg', 'Cosmetic smile design consultation'],
    ['Cosmetic Dentistry', '/images/cosmetic-dentistry.webp', 'Cosmetic dental consultation'],
    ['Dental Veneers', '/images/dental-veneers.jpg', 'Dental veneer cosmetic treatment'],
    ['Gap Closure Procedures', '/images/gap-closure.jpg', 'Dental gap closure procedure'],
    ['Orthodontic Braces', '/images/orthodontic-treatment.jpg', 'Orthodontic braces'],
    ['Clear Aligners', '/images/clear-aligners.jpg', 'Transparent dental aligners'],
    ['Invisalign Treatment', '/images/invisalign-treatment.jpg', 'Invisalign clear aligner treatment'],
  ];
  const implantServices = [
    ['Single Tooth Implants', '/images/dental-implants.webp', 'Single tooth dental implant'],
    ['Multiple Tooth Replacement', '/images/dental-multiple-implants.jpg', 'Multiple tooth dental replacement'],
    ['Implant-Supported Crowns', '/images/dental-implant-crown.jpg', 'Implant-supported dental crown'],
    ['Full Mouth Rehabilitation', '/images/full-mouth-rehabilitation.jpg', 'Full mouth dental rehabilitation'],
  ];
  return (
    <>
      <main className="department-care-page cursor-motion-page" {...cursorMotionHandlers}>
        <PageIntro
          eyebrow="Dental Care"
          title="Dental services for your family."
          description="Explore dental services and care at DH Hospitals."
          image="/images/general-dentistry.webp"
          imageAlt="General dentistry services"
        />
        <section className="section dental-intro">
          <div className="container dental-intro-inner">
            <div>
              <span className="eyebrow">Led by <span className="doctor-name-highlight">Dr. Sai Harshitha Sunkavally</span></span>
              <p>BDS · Dental Surgeon · 5+ Years of Clinical Experience</p>
              <div className="dental-intro-mascot">
                <AnimatedCareCharacter type="tooth" />
              </div>
            </div>
            <p>
              Explore the dental services listed on the DH Hospitals website.
              For information about a service or to make an appointment
              enquiry, contact the hospital.
            </p>
            <Link className="button" to="/appointment?department=Dental%20Care">
              Book Dental Appointment <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <section className="section dental-services-section">
          <div className="container">
            <SectionHeading
              eyebrow="Our dental services"
              title="Complete dental care."
            />
            {[
              ['Routine Dental Services', routineServices],
              ['Cosmetic and Advanced Dental Services', cosmeticServices],
              ['Dental Implant Services', implantServices],
            ].map(([title, services]) => (
              <div key={title} style={{ marginBottom: '44px' }}>
                <h3 style={{ marginBottom: '16px' }}>{title}</h3>
                <div className="care-option-grid">
                  {services.map((service) => {
                    const [name, image, alt] = service;
                    return (
                      <article className="care-option-card" key={name}>
                        {image && <img className="dental-service-image" src={image} alt={alt} loading="lazy" decoding="async" />}
                        <h3>{name}</h3>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
            <p>
              Whether you require routine dental care, cosmetic smile enhancement,
              orthodontic treatment, or dental implants, our team is committed to
              providing exceptional care tailored to your individual needs.
            </p>
          </div>
        </section>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Dental surgeon</span>
              <h2>Meet your dental care provider.</h2>
            </div>
            {doctors[0] && <DoctorCard doctor={doctors[0]} />}
          </div>
        </section>
        <section className="section testimonials-section">
          <div className="container">
            <SectionHeading
              eyebrow="Dental Care"
              title="Patient feedback"
            />
            <article className="testimonial-placeholder">
              <p>Gentle, patient-friendly care, especially with children.</p>
              <span>Dental Care</span>
            </article>
          </div>
        </section>
        <CallToAction eyebrow="Dental care appointments" />
      </main>
    </>
  );
}
