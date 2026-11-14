import { ArrowUpRight, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatDoctorName, getDoctorDepartmentName } from '../data/hospital.js';
import { getSpecializationSlug } from '../data/specializations.js';
import { PageIntro } from '../components/PageIntro.jsx';
import usePublicDoctors from '../hooks/usePublicDoctors.js';

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { doctors, error, isLoading } = usePublicDoctors();
  const doctor = doctors.find((item) => item.id === doctorId);

  if (isLoading && !doctor) {
    return <main className="doctor-profile-state" role="status">Loading doctor profile…</main>;
  }
  if (!doctor) {
    return (
      <main className="doctor-profile-state">
        <PageIntro
          eyebrow="Our Doctors"
          title="Doctor profile unavailable."
          description={error || 'This doctor profile could not be found.'}
        />
        <div className="container doctor-profile-back">
          <Link className="text-link" to="/doctors">Back to Our Doctors</Link>
        </div>
      </main>
    );
  }

  const department = getDoctorDepartmentName(doctor);
  const departmentSlug = getSpecializationSlug(
    typeof doctor.department === 'object'
      ? doctor.department?.slug || department
      : department,
  );

  return (
    <main>
      <PageIntro
        eyebrow={department}
        title={formatDoctorName(doctor.name)}
        description={doctor.qualifications}
        image={doctor.imageUrl || undefined}
        imageAlt={formatDoctorName(doctor.name)}
      />
      <section className="section doctor-profile-section">
        <div className="container doctor-profile-layout">
          {doctor.imageUrl ? (
            <img className="doctor-profile-photo" src={doctor.imageUrl} alt={formatDoctorName(doctor.name)} />
          ) : (
            <div className="doctor-profile-photo doctor-profile-photo-unavailable" aria-hidden="true">
              <UserRound size={60} strokeWidth={1.25} />
            </div>
          )}
          <div className="doctor-profile-copy">
            <span className="eyebrow">{department}</span>
            <h2>{formatDoctorName(doctor.name)}</h2>
            <p className="doctor-qualification">{doctor.qualifications}</p>
            <p><strong>Designation:</strong> {doctor.specialty}</p>
            {doctor.bio && <p>{doctor.bio}</p>}
            <Link
              className="button"
              to={`/appointment?department=${encodeURIComponent(departmentSlug)}`}
            >
              Book an appointment <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
