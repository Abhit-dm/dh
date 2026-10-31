import { Eye, ScanEye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doctors, eyeServices } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';

export default function EyeCare() {
  return (
    <>
      <main>
        <PageIntro
          eyebrow="Eye Care"
          title="Eye care for clear, confident vision."
          description="Explore eye-care services described by DH Hospitals."
          image="/images/vision-screening.webp"
          imageAlt="Vision screening at DH Eye Hospital"
        />
        <section className="section service-detail-intro">
          <div className="container service-detail-layout">
            <div className="service-detail-copy">
              <span className="eyebrow">DH Eye Hospital</span>
              <h2>Advanced Eye Care</h2>
              <p>
                DH Hospital specializes in cataract and glaucoma surgery, optic
                nerve treatments, laser and LASIK procedures, and offers expert
                consultations for optics and contact lenses.
              </p>
              <Link className="button" to="/appointment?department=Eye%20Care">
                Book Eye Appointment <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="eye-care-feature">
              <div className="eye-care-feature-icon"><Eye size={34} strokeWidth={1.5} /></div>
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
              <h3>Optics consultations</h3>
              <p>Expert consultations for optics.</p>
            </div>
            <div className="eye-point">
              <Sparkles size={24} />
              <h3>Contact lens consultations</h3>
              <p>Expert consultations for contact lenses.</p>
            </div>
          </div>
        </section>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Eye care specialist</span>
              <h2>Meet your ophthalmologist.</h2>
            </div>
            <DoctorCard doctor={doctors[1]} />
          </div>
        </section>
        <CallToAction eyebrow="Eye care appointments" />
      </main>
    </>
  );
}
