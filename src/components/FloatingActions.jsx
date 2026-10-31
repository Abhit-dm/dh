import { ArrowUpRight, Phone, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

export default function FloatingActions() {
  const { contact } = useHospitalSettings();
  const emergencyNumber = contact.emergency.replace(/[^\d+]/g, '');

  return (
    <aside className="floating-actions" aria-label="Quick contact actions">
      <a className="floating-action floating-call" href={`tel:${contact.phoneLink}`}>
        <Phone size={17} aria-hidden="true" />
        <span>Call now</span>
      </a>
      <a
        className="floating-action floating-emergency"
        href={`tel:${emergencyNumber}`}
      >
        <Siren size={17} aria-hidden="true" />
        <span>Emergency</span>
      </a>
      <Link className="floating-action floating-book" to="/appointment">
        <ArrowUpRight size={17} aria-hidden="true" />
        <span>Book appointment</span>
      </Link>
    </aside>
  );
}
