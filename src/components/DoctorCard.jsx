import { ArrowUpRight, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      {doctor.image ? (
        <img className="doctor-photo" src={doctor.image} alt={doctor.name} loading="lazy" decoding="async" />
      ) : (
        <div className="doctor-photo doctor-photo-unavailable" aria-hidden="true">
          <UserRound size={52} strokeWidth={1.25} />
        </div>
      )}
      <div className="doctor-card-copy">
        <span className="doctor-department">{doctor.department}</span>
        <h3>{doctor.name}</h3>
        <p className="doctor-qualification">{doctor.qualifications}</p>
        <p>{doctor.specialty}</p>
        <Link className="text-link" to={`/appointment?department=${encodeURIComponent(doctor.department)}`}>
          Book appointment <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
