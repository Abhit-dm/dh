import { ArrowUpRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

export default function CallToAction({
  eyebrow = 'We are here to help',
  showPhone = true,
}) {
  const { contact } = useHospitalSettings();
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow eyebrow-light">{eyebrow}</span>
          <h2>Care starts with a conversation.</h2>
          <p>Reach out to DH Hospitals to make an appointment enquiry.</p>
        </div>
        <div className="cta-actions">
          <Link className="button button-light" to="/appointment">
            Book Appointment <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          {showPhone && contact.phoneNumbers.map(({ number, phoneLink }) => (
            <a className="cta-phone" key={phoneLink} href={`tel:${phoneLink}`}>
              <Phone size={17} aria-hidden="true" /> {number}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
