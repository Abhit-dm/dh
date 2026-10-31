import { useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import usePublicDepartments from '../hooks/usePublicDepartments.js';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  department: '',
  message: '',
  website: '',
};

function isValidIndianMobile(phone) {
  return /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(phone.trim().replace(/[\s-]/g, ''));
}

export default function ContactMessageForm() {
  const { departments } = usePublicDepartments();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submissionInProgress = useRef(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
    setSubmitted(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Enter your name.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Enter a mobile number.';
    } else if (!isValidIndianMobile(form.phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.message.trim()) nextErrors.message = 'Enter a brief message.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/public/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          departmentSlug: form.department || undefined,
          message: form.message.trim(),
          website: form.website,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || 'Your enquiry could not be submitted. Please try again.');
      }
      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Your enquiry could not be submitted. Please try again.',
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="appointment-form contact-message-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          tabIndex="-1"
          autoComplete="off"
          value={form.website}
          onChange={updateField}
        />
      </div>
      <div className="form-grid">
        <label className="form-field">
          <span>Your name <b>*</b></span>
          <input
            autoComplete="name"
            name="name"
            value={form.name}
            onChange={updateField}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-error-name' : undefined}
            placeholder="Enter your name"
          />
          {errors.name && <small id="contact-error-name">{errors.name}</small>}
        </label>
        <label className="form-field">
          <span>Mobile number <b>*</b></span>
          <input
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            value={form.phone}
            onChange={updateField}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'contact-error-phone' : undefined}
            placeholder="+91 98765 43210"
          />
          {errors.phone && <small id="contact-error-phone">{errors.phone}</small>}
        </label>
        <label className="form-field">
          <span>Email address</span>
          <input
            autoComplete="email"
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-error-email' : undefined}
            placeholder="Optional"
          />
          {errors.email && <small id="contact-error-email">{errors.email}</small>}
        </label>
        <label className="form-field">
          <span>Select department</span>
          <select name="department" value={form.department} onChange={updateField}>
            <option value="">General enquiry</option>
            {departments.map((department) => (
              <option value={department.slug} key={department.id || department.slug}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field form-field-wide">
          <span>Message <b>*</b></span>
          <textarea
            name="message"
            rows="4"
            value={form.message}
            onChange={updateField}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'contact-error-message' : undefined}
            placeholder="How can we help?"
          />
          {errors.message && <small id="contact-error-message">{errors.message}</small>}
          <small>Do not include medical history or sensitive health information.</small>
        </label>
      </div>
      <div className="form-submit-row">
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending enquiry…' : 'Send contact enquiry'}
          {!isSubmitting && <ArrowUpRight size={17} aria-hidden="true" />}
        </button>
        <p>Your enquiry is not an emergency service.</p>
      </div>
      {submitError && <div className="form-error" role="alert">{submitError}</div>}
      {submitted && (
        <div className="form-success" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>Your contact enquiry was received by DH Hospitals.</span>
        </div>
      )}
    </form>
  );
}
