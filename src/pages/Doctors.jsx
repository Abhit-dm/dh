import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CallToAction from '../components/CallToAction.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';

export default function Doctors() {
  const { doctors, isLoading } = usePublicDoctors();
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
              title="Our hospital doctors."
              description="Explore the published doctor profiles and make an appointment enquiry."
            />
            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.id || doctor.name} />
              ))}
            </div>
            {isLoading && <p className="doctor-photo-note" role="status">Loading doctor profiles…</p>}
            {!isLoading && !doctors.some((doctor) => doctor.imageUrl || doctor.image) && (
              <p className="doctor-photo-note">
                Doctor photographs display when available in their existing profiles.
              </p>
            )}
          </div>
        </section>
        <CallToAction eyebrow="Meet with a specialist" />
      </main>
    </>
  );
}
