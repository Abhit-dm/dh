import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import ContactMessageForm from '../components/ContactMessageForm.jsx';

export default function Contact() {
  const { contact } = useHospitalSettings();
  const [searchParams] = useSearchParams();
  const department = searchParams.get('department');
  const initialDepartment = ['Child Care', 'Eye Care', 'Dental Care'].includes(department)
    ? department
    : '';

  return (
    <>
      <main>
        <PageIntro
          eyebrow="Contact Us"
          title="We’re here to help."
          description="Contact DH Hospitals for information or an appointment enquiry."
        />
        <section className="section contact-info-section">
          <div className="container">
            <SectionHeading
              eyebrow="Get in touch"
              title="Contact DH Hospitals."
              description="Reach the hospital using the published contact details below."
            />
            <div className="contact-card-grid">
              <article className="contact-card">
                <span className="contact-card-icon"><MapPin size={22} /></span>
                <h2>Visit us</h2>
                <p>{contact.address}</p>
                <a
                  className="text-link"
                  href="https://www.google.com/maps/search/?api=1&query=DH+Children+and+Eye+Hospital+Poranki+Vijayawada"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps <span aria-hidden="true">↗</span>
                </a>
              </article>
              <article className="contact-card">
                <span className="contact-card-icon"><Phone size={22} /></span>
                <h2>Call us</h2>
                <a href={`tel:${contact.phoneLink}`}>{contact.phone}</a>
                <p>Landline: {contact.landline}</p>
                <a href={`tel:${contact.emergency.replace(/[^\d+]/g, '')}`}>
                  Emergency: {contact.emergency}
                </a>
              </article>
              <article className="contact-card">
                <span className="contact-card-icon"><Mail size={22} /></span>
                <h2>Email us</h2>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                <p>For hospital enquiries.</p>
              </article>
              <article className="contact-card">
                <span className="contact-card-icon"><Clock3 size={22} /></span>
                <h2>Operating hours</h2>
                {contact.hours.map((hours) => (
                  <p key={hours.days}><strong>{hours.days}</strong><br />{hours.time}</p>
                ))}
              </article>
            </div>
          </div>
        </section>
        <section className="section appointment-section" id="appointment">
          <div className="container appointment-layout">
            <div className="appointment-copy">
              <span className="eyebrow">Appointment enquiry</span>
              <h2>Tell us how we can help.</h2>
              <p>
                Complete the form to send an appointment request to the
                hospital. Requests remain pending until DH Hospitals confirms
                availability.
              </p>
              <div className="appointment-direct">
                <Phone size={18} />
                <span>Prefer to call?</span>
                <a href={`tel:${contact.phoneLink}`}>{contact.phone}</a>
              </div>
            </div>
            <AppointmentForm
              key={initialDepartment}
              initialDepartment={initialDepartment}
            />
          </div>
        </section>
        <section className="section contact-message-section">
          <div className="container contact-message-layout">
            <div className="contact-message-copy">
              <span className="eyebrow">Contact enquiry</span>
              <h2>Send us a message.</h2>
              <p>
                For non-urgent questions about the hospital or its services.
                Use the appointment form for scheduling enquiries.
              </p>
            </div>
            <ContactMessageForm />
          </div>
        </section>
        <section className="map-section">
          <div className="map-copy">
            <span className="eyebrow">Find us</span>
            <h2>DH Hospitals, Poranki.</h2>
            <p>{contact.address}</p>
          </div>
          <iframe
            title="Map showing DH Children and Eye Hospital in Poranki, Vijayawada"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.0722785568482!2d80.71756657172612!3d16.471877428539717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fb5263217003%3A0xff254bbe05cb8ecc!2sDH%20Children%20and%20Eye%20Hospital!5e0!3m2!1sen!2sin!4v1707906956048!5m2!1sen!2sin"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </main>
    </>
  );
}
