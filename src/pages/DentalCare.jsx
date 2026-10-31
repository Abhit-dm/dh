import { Link } from 'react-router-dom';
import { dentalServices, doctors } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';

export default function DentalCare() {
  return (
    <>
      <main>
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
              <span className="eyebrow">Dental services</span>
              <h2>Care for healthy smiles.</h2>
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
              title="Find the care you need."
              description="Seven dental services listed by DH Hospitals."
            />
            <div className="service-grid service-grid-three">
              {dentalServices.map((service) => (
                <ServiceCard
                  key={service.title}
                  {...service}
                  to="/appointment?department=Dental%20Care"
                />
              ))}
            </div>
          </div>
        </section>
        <section className="section specialist-section">
          <div className="container specialist-layout">
            <div>
              <span className="eyebrow">Dental surgeon</span>
              <h2>Meet your dental care provider.</h2>
            </div>
            <DoctorCard doctor={doctors[2]} />
          </div>
        </section>
        <CallToAction eyebrow="Dental care appointments" />
      </main>
    </>
  );
}
