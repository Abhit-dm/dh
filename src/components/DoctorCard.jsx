import { ArrowUpRight, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDoctorName, getDoctorDepartmentName } from '../data/hospital.js';
import { getSpecializationSlug } from '../data/specializations.js';

export default function DoctorCard({ doctor }) {
  const image = doctor.imageUrl || doctor.image;
  const departmentName = getDoctorDepartmentName(doctor);
  const departmentSlug = getSpecializationSlug(
    typeof doctor.department === 'object'
      ? doctor.department?.slug || departmentName
      : departmentName,
  );
  return (
    <article className="doctor-card">
      {image ? (
        <img className="doctor-photo" src={image} alt={formatDoctorName(doctor.name)} loading="lazy" decoding="async" />
      ) : (
        <div className="doctor-photo doctor-photo-unavailable">
          <UserRound size={52} strokeWidth={1.25} aria-hidden="true" />
          <span>DH Hospitals specialist</span>
        </div>
      )}
      <div className="doctor-card-copy">
        <span className="doctor-department">{departmentName}</span>
        <h3>
          {doctor.id ? (
            <Link className="doctor-name-highlight" to={`/doctors/${encodeURIComponent(doctor.id)}`}>
              {formatDoctorName(doctor.name)}
            </Link>
          ) : <span className="doctor-name-highlight">{formatDoctorName(doctor.name)}</span>}
        </h3>
        <p className="doctor-qualification">{doctor.qualifications}</p>
        <p><strong>Designation:</strong> {doctor.specialty}</p>
        {(doctor.experience || doctor.bio) && (
          <p><strong>Experience:</strong> {doctor.experience || doctor.bio}</p>
        )}
        <Link className="text-link" to={`/appointment?department=${encodeURIComponent(departmentSlug)}`}>
          Book appointment <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
