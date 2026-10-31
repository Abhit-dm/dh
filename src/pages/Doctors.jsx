import { doctors } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';

export default function Doctors() {
  return (
    <>
      <main>
        <PageIntro
          eyebrow="Our Doctors"
          title="Meet the DH Hospitals team."
          description="Doctor names and qualifications as listed for DH Hospitals."
          image="/images/hospital-cover.webp"
          imageAlt="DH Hospitals"
        />
        <section className="section doctors-page-section">
          <div className="container">
            <SectionHeading
              eyebrow="Medical team"
              title="Care from experienced specialists."
              description="Explore the published doctor profiles and make an appointment enquiry."
            />
            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.name} />
              ))}
            </div>
            <p className="doctor-photo-note">
              Doctor photographs are not displayed because original profile
              photographs were not available among the accessible official website assets.
            </p>
          </div>
        </section>
        <CallToAction eyebrow="Meet with a specialist" />
      </main>
    </>
  );
}
