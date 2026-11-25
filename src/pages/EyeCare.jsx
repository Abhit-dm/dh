import { Eye, ScanEye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eyeServices } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';
import AnimatedCareCharacter from '../components/AnimatedCareCharacter.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';
import useDepartmentCursorMotion from '../hooks/useDepartmentCursorMotion.js';

export default function EyeCare() {
  const { doctors } = usePublicDoctors('eye-care');
  const cursorMotionHandlers = useDepartmentCursorMotion();
  return (
    <>
      <main className="department-care-page cursor-motion-page" {...cursorMotionHandlers}>
        <PageIntro
          eyebrow="Eye Care"
          title="Eye care for clear, confident vision."
          description="Explore eye-care services described by DH Hospitals."
          image="/images/vision-screening.webp"
          imageAlt="Vision screening at DH Hospitals"
        />
        <section className="section service-detail-intro">
          <div className="container service-detail-layout">
            <div className="service-detail-copy">
              <span className="eyebrow">Led by <span className="doctor-name-highlight">Dr. Haasitha Chigurupati</span></span>
              <p>
                MBBS, MS Ophthalmology<br />
                Consultant Ophthalmologist &amp; Cataract Surgeon<br />
                13+ Years of Clinical Experience
              </p>
              <Link className="button" to="/appointment?department=Eye%20Care">
                Book Eye Appointment <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="eye-care-feature">
              <AnimatedCareCharacter type="glasses" />
              <span className="eyebrow">Eye services</span>
              <h3>Screening, surgery &amp; consultation.</h3>
              <p>
                Vision screening, cataract surgery, LASIK, and consultations
                for optics and contact lenses.
              </p>
            </div>
          </div>
        </section>
        <section className="section eye-services-section">
          <div className="container">
            <SectionHeading
              eyebrow="Eye services"
              title="Explore eye care services."
              description="Service information published by DH Hospitals."
            />
            <div className="service-grid service-grid-three">
              {eyeServices.map((service) => (
                <ServiceCard
                  key={service.title}
                  {...service}
                  to="/appointment?department=Eye%20Care"
                />
              ))}
            </div>
          </div>
        </section>
        <section className="section eye-care-points">
          <div className="container eye-care-points-inner">
            <div>
              <span className="eyebrow">Consultations</span>
              <h2>Eye care consultations at DH Hospitals.</h2>
            </div>
            <div className="eye-point">
              <ScanEye size={24} />
              <h3>Complete Optical Services</h3>
              <p>Prescription Glasses · Optical Frames &amp; Lenses · Sunglasses &amp; Vision Accessories</p>
              <p>
                Whether you need a routine eye check-up, cataract surgery, LASIK vision correction,
                or specialized eye care, our team is committed to helping you achieve the best possible visual outcomes.
              </p>
            </div>
            <div className="eye-point">
              <Sparkles size={24} />
              <h3>Contact Lens Care</h3>
              <p>Contact Lens Consultation &amp; Fitting</p>
            </div>
          </div>
        </section>
        <p className="container" style={{ paddingBlock: '34px' }}>
          Our department is equipped with advanced diagnostic equipment, modern operating microscopes,
          and phacoemulsification technology to ensure safe and effective surgical outcomes.
        </p>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Eye care specialist</span>
              <h2>Meet your ophthalmologist.</h2>
            </div>
            {doctors[0] && <DoctorCard doctor={doctors[0]} />}
          </div>
        </section>
        <section className="section testimonials-section">
          <div className="container">
            <SectionHeading
              eyebrow="Eye Care"
              title="Patient feedback"
            />
            <article className="testimonial-placeholder">
              <p>Highly trusted for cataract surgery outcomes and compassionate eye care.</p>
              <span>Eye Care</span>
            </article>
          </div>
        </section>
        <CallToAction eyebrow="Eye care appointments" />
      </main>
    </>
  );
}
