import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import usePublicDepartments from '../hooks/usePublicDepartments.js';

const initialForm = {
  patientName: '',
  parentGuardianName: '',
  phone: '',
  email: '',
  department: '',
  doctorId: '',
  patientAge: '',
  date: '',
  time: '',
  message: '',
  privacyConsent: false,
  website: '',
};

function isValidIndianMobile(phone) {
  return /^(?:\+?91)?[6-9]\d{9}$/.test(phone.trim().replace(/[\s()+-]/g, ''));
}

function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function mapValidationErrors(message) {
  const fields = {};
  const matches = message.matchAll(/(?:^|\s)([A-Za-z]+):\s([^]*?)(?=\s[A-Za-z]+:\s|$)/g);
  for (const [, field, detail] of matches) {
    fields[field] = detail.trim();
  }
  return fields;
}

const appointmentStatusLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed by the hospital',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export default function AppointmentForm({ initialDepartment = '' }) {
  const { departments, error: departmentLoadError } = usePublicDepartments();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    department: initialDepartment.toLowerCase().replace(/\s+/g, '-'),
  }));
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorLoadError, setDoctorLoadError] = useState('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const submissionInProgress = useRef(false);
  const today = todayInIndia();

  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      setDoctorLoadError('');
      setIsLoadingDoctors(false);
      return undefined;
    }

    const controller = new AbortController();
    setDoctors([]);
    setDoctorLoadError('');
    setIsLoadingDoctors(true);
    fetch(`/api/public/doctors?department=${encodeURIComponent(form.department)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || 'Doctor list is unavailable.');
        return result;
      })
      .then((result) => setDoctors(result.data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setDoctorLoadError('Doctor choices are unavailable right now. You can continue without selecting one.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDoctors(false);
      });

    return () => controller.abort();
  }, [form.department]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'department' ? { doctorId: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmission(null);
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const nextErrors = {};
    if (!form.patientName.trim()) nextErrors.patientName = 'Enter the patient name.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Enter a mobile number.';
    } else if (!isValidIndianMobile(form.phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.department) nextErrors.department = 'Select a department.';
    if (!form.date) {
      nextErrors.date = 'Choose a preferred appointment date.';
    } else if (form.date < today) {
      nextErrors.date = 'Choose today or a future date.';
    }
    if (!form.time) nextErrors.time = 'Choose a preferred time.';
    if (
      form.patientAge !== '' &&
      Number(form.patientAge) < 18 &&
      !form.parentGuardianName.trim()
    ) {
      nextErrors.parentGuardianName = 'Enter a parent or guardian name for patients under 18.';
    }
    if (!form.privacyConsent) nextErrors.privacyConsent = 'Consent is required to send this request.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName.trim(),
          parentGuardianName: form.parentGuardianName.trim() || undefined,
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          patientAge: form.patientAge === '' ? undefined : Number(form.patientAge),
          departmentSlug: form.department,
          doctorId: form.doctorId || undefined,
          preferredDate: form.date,
          preferredTime: form.time,
          message: form.message.trim() || undefined,
          privacyConsent: form.privacyConsent,
          website: form.website,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const validationErrors = mapValidationErrors(result.error?.message || '');
        setErrors(validationErrors);
        throw new Error(result.error?.message || 'Your request could not be submitted. Please try again.');
      }
      setSubmission(result.data);
      setSubmitError('');
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Your request could not be submitted. Please try again.',
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="appointment-website">Leave this field empty</label>
        <input
          id="appointment-website"
          name="website"
          tabIndex="-1"
          autoComplete="off"
          value={form.website}
          onChange={updateField}
        />
      </div>
      <div className="form-grid">
        <label className="form-field">
          <span>Patient name <b>*</b></span>
          <input
            autoComplete="name"
            name="patientName"
            value={form.patientName}
            onChange={updateField}
            aria-invalid={Boolean(errors.patientName)}
            aria-describedby={errors.patientName ? 'error-patientName' : undefined}
            placeholder="Enter patient name"
            required
          />
          {errors.patientName && <small id="error-patientName">{errors.patientName}</small>}
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
            aria-describedby={errors.phone ? 'error-phone' : undefined}
            placeholder="+91 98765 43210"
            required
          />
          {errors.phone && <small id="error-phone">{errors.phone}</small>}
        </label>
        <label className="form-field">
          <span>Parent or guardian name</span>
          <input
            autoComplete="section-patient additional-name"
            name="parentGuardianName"
            value={form.parentGuardianName}
            onChange={updateField}
            aria-invalid={Boolean(errors.parentGuardianName)}
            aria-describedby={errors.parentGuardianName ? 'error-parentGuardianName' : undefined}
            placeholder="Required for patients under 18"
          />
          {errors.parentGuardianName && <small id="error-parentGuardianName">{errors.parentGuardianName}</small>}
        </label>
        <label className="form-field">
          <span>Patient age</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="120"
            name="patientAge"
            value={form.patientAge}
            onChange={updateField}
            aria-invalid={Boolean(errors.patientAge)}
            aria-describedby={errors.patientAge ? 'error-patientAge' : undefined}
            placeholder="Optional"
          />
          {errors.patientAge && <small id="error-patientAge">{errors.patientAge}</small>}
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
            aria-describedby={errors.email ? 'error-email' : undefined}
            placeholder="Optional"
          />
          {errors.email && <small id="error-email">{errors.email}</small>}
        </label>
        <label className="form-field">
          <span>Select department <b>*</b></span>
          <select
            name="department"
            value={form.department}
            onChange={updateField}
            aria-invalid={Boolean(errors.department)}
            aria-describedby={errors.department ? 'error-department' : undefined}
            required
          >
            <option value="">Choose a department</option>
            {departments.map((department) => (
              <option value={department.slug} key={department.id || department.slug}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.department && <small id="error-department">{errors.department}</small>}
          {departmentLoadError && <small>{departmentLoadError}</small>}
        </label>
        <label className="form-field">
          <span>Preferred date <b>*</b></span>
          <input
            type="date"
            name="date"
            min={today}
            value={form.date}
            onChange={updateField}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'error-date' : undefined}
            required
          />
          {errors.date && <small id="error-date">{errors.date}</small>}
        </label>
        <label className="form-field">
          <span>Preferred time <b>*</b></span>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={updateField}
            aria-invalid={Boolean(errors.time)}
            aria-describedby={errors.time ? 'error-time' : undefined}
            required
          />
          {errors.time && <small id="error-time">{errors.time}</small>}
        </label>
        <label className="form-field">
          <span>Preferred doctor</span>
          <select
            name="doctorId"
            value={form.doctorId}
            onChange={updateField}
            disabled={!form.department || isLoadingDoctors || doctors.length === 0}
          >
            <option value="">{isLoadingDoctors ? 'Loading doctors…' : 'No preference'}</option>
            {doctors.map((doctor) => (
              <option value={doctor.id} key={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          {doctorLoadError && <small>{doctorLoadError}</small>}
        </label>
        <label className="form-field form-field-wide">
          <span>Additional message</span>
          <textarea
            name="message"
            rows="4"
            maxLength="1000"
            value={form.message}
            onChange={updateField}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'error-message' : undefined}
            placeholder="Share brief scheduling details only"
          />
          {errors.message && <small id="error-message">{errors.message}</small>}
          <small>Do not include medical history or sensitive health information.</small>
        </label>
        <label className="form-consent form-field-wide">
          <input
            type="checkbox"
            name="privacyConsent"
            checked={form.privacyConsent}
            onChange={updateField}
            aria-invalid={Boolean(errors.privacyConsent)}
            aria-describedby={errors.privacyConsent ? 'error-privacyConsent' : undefined}
            required
          />
          <span>
            I agree that DH Hospitals may use these details to respond to this appointment request.
            This request is not a confirmed appointment.
            {errors.privacyConsent && <small id="error-privacyConsent">{errors.privacyConsent}</small>}
          </span>
        </label>
      </div>
      <div className="form-submit-row">
        <button className="button" type="submit" disabled={isSubmitting || Boolean(submission)}>
          {isSubmitting ? 'Sending request…' : 'Send appointment request'}
          {!isSubmitting && !submission && <ArrowUpRight size={17} aria-hidden="true" />}
        </button>
        <p>Requests remain pending until confirmed by the hospital.</p>
      </div>
      {submitError && <div className="form-error" role="alert">{submitError}</div>}
      {submission && (
        <div className="form-success" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>
            Request received. Reference: <strong>{submission.reference}</strong>. Status:{' '}
            <strong>{appointmentStatusLabels[submission.status] || submission.status}</strong>.
            {submission.status === 'PENDING'
              ? ' The hospital will contact you to confirm availability.'
              : ' This status reflects the hospital’s latest update.'}
          </span>
        </div>
      )}
    </form>
  );
}
