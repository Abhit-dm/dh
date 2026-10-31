import { ArrowUpRight, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

const departments = ['Child Care', 'Eye Care', 'Dental Care'];

export default function Appointment() {
  const { contact } = useHospitalSettings();
  const [searchParams] = useSearchParams();
  const requestedDepartment = searchParams.get('department');
  const initialDepartment = departments.includes(requestedDepartment)
    ? requestedDepartment
    : '';

  return (
    <main>
      <PageIntro
        eyebrow="Book Appointment"
        title="Start with an appointment enquiry."
        description="Share your preferred details and contact DH Hospitals about an appointment."
        image="/images/hospital-cover.webp"
        imageAlt="A care space at DH Hospitals"
      />
      <section className="section appointment-section">
        <div className="container appointment-layout">
          <div className="appointment-copy">
            <span className="eyebrow">Appointment enquiry</span>
            <h2>Tell us how we can help.</h2>
            <p>
              Choose a department and share a suitable date and time. Your
              request is sent to DH Hospitals and remains pending until the
              hospital confirms availability.
            </p>
            <div className="appointment-direct">
              <Phone size={18} aria-hidden="true" />
              <span>Prefer to call?</span>
              <a href={`tel:${contact.phoneLink}`}>{contact.phone}</a>
            </div>
            <Link className="text-link appointment-contact-link" to="/contact">
              Contact details <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <AppointmentForm
            key={initialDepartment}
            initialDepartment={initialDepartment}
          />
        </div>
      </section>
    </main>
  );
}
