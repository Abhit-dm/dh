import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  Eye,
  FileImage,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminRequest } from '../lib/adminApi.js';

const pageSize = 20;

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'departments', label: 'Departments', icon: UsersRound },
  { id: 'services', label: 'Services', icon: Activity },
  { id: 'gallery-images', label: 'Gallery', icon: FileImage },
  { id: 'blog-posts', label: 'Blog Management', icon: BookOpen },
  { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquareText },
  { id: 'website-settings', label: 'Website Settings', icon: Settings },
  { id: 'profile', label: 'Admin Profile', icon: UserRound },
];

const resourceTitles = {
  appointments: 'Appointments',
  doctors: 'Doctors',
  departments: 'Departments',
  services: 'Services',
  'gallery-images': 'Gallery',
  'blog-posts': 'Blog management',
  'contact-messages': 'Contact messages',
  'website-settings': 'Website settings',
};

const createValues = {
  doctors: {
    name: '',
    qualifications: '',
    specialty: '',
    bio: '',
    departmentId: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  },
  departments: { slug: '', name: '', description: '', isActive: true, sortOrder: 0 },
  services: {
    title: '',
    description: '',
    departmentId: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  },
  'gallery-images': {
    url: '',
    category: 'General',
    altText: '',
    caption: '',
    isActive: true,
    sortOrder: 0,
  },
  'blog-posts': {
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    isPublished: false,
  },
  'website-settings': { key: '', value: '""', isPublic: false },
};

const resourceFields = {
  appointments: [
    { name: 'patientName', label: 'Patient name', required: true },
    { name: 'parentGuardianName', label: 'Parent or guardian' },
    { name: 'phone', label: 'Mobile number', required: true },
    { name: 'email', label: 'Email address', type: 'email' },
    { name: 'patientAge', label: 'Patient age', type: 'number' },
    { name: 'departmentId', label: 'Department', type: 'department', required: true },
    { name: 'doctorId', label: 'Doctor', type: 'doctor' },
    { name: 'preferredDate', label: 'Preferred date', type: 'date', required: true },
    { name: 'preferredTime', label: 'Preferred time', type: 'time', required: true },
    { name: 'status', label: 'Status', type: 'appointment-status', required: true },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  doctors: [
    { name: 'name', label: 'Doctor name', required: true },
    { name: 'qualifications', label: 'Qualifications', required: true },
    { name: 'specialty', label: 'Specialization', required: true },
    { name: 'bio', label: 'Biography', type: 'textarea' },
    { name: 'departmentId', label: 'Department', type: 'department', required: true },
    { name: 'imageUrl', label: 'Doctor image', type: 'image', imageResource: 'doctors' },
    { name: 'isActive', label: 'Profile enabled', type: 'checkbox' },
    { name: 'sortOrder', label: 'Display order', type: 'number' },
  ],
  departments: [
    { name: 'name', label: 'Department name', required: true },
    { name: 'slug', label: 'URL slug', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'isActive', label: 'Department enabled', type: 'checkbox' },
    { name: 'sortOrder', label: 'Display order', type: 'number' },
  ],
  services: [
    { name: 'title', label: 'Service name', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'departmentId', label: 'Service category', type: 'department', required: true },
    { name: 'imageUrl', label: 'Service image', type: 'image', imageResource: 'services' },
    { name: 'isActive', label: 'Service visible', type: 'checkbox' },
    { name: 'sortOrder', label: 'Display order', type: 'number' },
  ],
  'gallery-images': [
    { name: 'caption', label: 'Image title' },
    { name: 'category', label: 'Category', required: true },
    { name: 'altText', label: 'Image description', required: true },
    { name: 'url', label: 'Image file', type: 'image', imageResource: 'gallery-images', required: true },
    { name: 'isActive', label: 'Visible in gallery', type: 'checkbox' },
    { name: 'sortOrder', label: 'Display order', type: 'number' },
  ],
  'blog-posts': [
    { name: 'title', label: 'Article title', required: true },
    { name: 'slug', label: 'URL slug', required: true },
    { name: 'excerpt', label: 'Summary', type: 'textarea', required: true },
    { name: 'content', label: 'Article content', type: 'textarea', required: true },
    { name: 'coverImage', label: 'Featured image', type: 'image', imageResource: 'blog-posts' },
    { name: 'isPublished', label: 'Publish article', type: 'checkbox' },
  ],
  'website-settings': [
    { name: 'key', label: 'Setting key', required: true },
    { name: 'value', label: 'Value (JSON)', type: 'textarea', required: true },
    { name: 'logoUpload', label: 'Upload hospital logo or setting image', type: 'image', imageResource: 'website-settings' },
    { name: 'isPublic', label: 'Available on public website', type: 'checkbox' },
  ],
};

function displayDate(value, includeTime = false) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  });
}

function recordLabel(resource, record) {
  if (resource === 'appointments') return `${record.reference} · ${record.patientName}`;
  if (resource === 'contact-messages') return `Enquiry from ${record.name}`;
  if (resource === 'doctors') return record.name;
  if (resource === 'departments') return record.name;
  if (resource === 'services') return record.title;
  if (resource === 'gallery-images') return record.caption || record.altText;
  if (resource === 'blog-posts') return record.title;
  return record.key;
}

function toEditableRecord(resource, record) {
  if (resource === 'appointments') {
    return {
      patientName: record.patientName ?? '',
      parentGuardianName: record.parentGuardianName ?? '',
      phone: record.phone ?? '',
      email: record.email ?? '',
      patientAge: record.patientAge ?? '',
      departmentId: record.departmentId ?? '',
      doctorId: record.doctorId ?? '',
      preferredDate: String(record.preferredDate).slice(0, 10),
      preferredTime: record.preferredTime ?? '',
      message: record.message ?? '',
      status: record.status,
    };
  }
  if (resource === 'website-settings') {
    return { ...record, value: JSON.stringify(record.value, null, 2), logoUpload: '' };
  }
  return { ...record };
}

function preparePayload(resource, values) {
  const payload = { ...values };
  if (resource === 'appointments') {
    payload.patientAge = payload.patientAge === '' ? null : Number(payload.patientAge);
    payload.parentGuardianName = payload.parentGuardianName || null;
    payload.email = payload.email || null;
    payload.doctorId = payload.doctorId || null;
    payload.message = payload.message || null;
  }
  if (resource === 'doctors' || resource === 'services') {
    payload.imageUrl = payload.imageUrl || null;
  }
  if (resource === 'blog-posts') {
    payload.coverImage = payload.coverImage || null;
  }
  if (resource === 'website-settings') {
    payload.value = JSON.parse(payload.value);
  }
  for (const key of ['sortOrder', 'patientAge']) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
      payload[key] = Number(payload[key]);
    }
  }
  return payload;
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <article className={`admin-stat-card admin-stat-${tone}`}>
      <span className="admin-stat-icon"><Icon size={19} aria-hidden="true" /></span>
      <span className="admin-stat-label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ResourceForm({
  resource,
  record,
  departments,
  doctors,
  onClose,
  onSave,
  isSaving,
}) {
  const [values, setValues] = useState(() =>
    record
      ? toEditableRecord(resource, record)
      : { ...createValues[resource] },
  );
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const fields = resourceFields[resource];

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      let nextValues = { ...values };
      if (imageFile) {
        const resourceField = fields.find((field) => field.type === 'image');
        const formData = new FormData();
        formData.set('resource', resourceField.imageResource);
        formData.set('file', imageFile);
        const uploaded = await adminRequest('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        if (resource === 'website-settings') {
          nextValues.value = JSON.stringify(uploaded.data.url);
          delete nextValues.logoUpload;
        } else {
          nextValues[resourceField.name] = uploaded.data.url;
        }
      }
      if (resource === 'website-settings') JSON.parse(nextValues.value);
      await onSave(preparePayload(resource, nextValues));
    } catch (requestError) {
      setError(requestError.message || 'Check the JSON value and try again.');
    }
  }

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-form-title">
        <div className="admin-modal-heading">
          <div>
            <span className="eyebrow">{resourceTitles[resource]}</span>
            <h2 id="admin-form-title">{record ? 'Edit record' : 'Add new record'}</h2>
          </div>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close form"><X size={20} /></button>
        </div>
        <form className="admin-editor-form" onSubmit={submit}>
          <div className="admin-form-grid">
            {fields.map((field) => (
              <label
                className={`admin-field ${field.type === 'textarea' ? 'admin-field-wide' : ''} ${field.type === 'checkbox' ? 'admin-checkbox-field' : ''}`}
                key={field.name}
              >
                {field.type === 'checkbox' ? (
                  <>
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.name])}
                      onChange={(event) => setValue(field.name, event.target.checked)}
                    />
                    <span>{field.label}</span>
                  </>
                ) : (
                  <>
                    <span>{field.label}</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={field.name === 'content' || field.name === 'value' ? 8 : 4}
                        required={field.required}
                        value={values[field.name] ?? ''}
                        onChange={(event) => setValue(field.name, event.target.value)}
                      />
                    ) : field.type === 'department' ? (
                      <select required={field.required} value={values[field.name] ?? ''} onChange={(event) => setValue(field.name, event.target.value)}>
                        <option value="">Select department</option>
                        {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                      </select>
                    ) : field.type === 'doctor' ? (
                      <select value={values[field.name] ?? ''} onChange={(event) => setValue(field.name, event.target.value)}>
                        <option value="">No doctor preference</option>
                        {doctors.filter((doctor) => !values.departmentId || doctor.department.id === values.departmentId).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
                      </select>
                    ) : field.type === 'appointment-status' ? (
                      <select required value={values[field.name] ?? 'PENDING'} onChange={(event) => setValue(field.name, event.target.value)}>
                        <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option><option value="COMPLETED">Completed</option>
                      </select>
                    ) : field.type === 'image' ? (
                      <span className="admin-image-control">
                        {values[field.name] && <img src={values[field.name]} alt="Current uploaded media" />}
                        {values[field.name] && <input value={values[field.name]} readOnly aria-label={`${field.label} URL`} />}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          required={field.required && !values[field.name]}
                          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                        />
                        <small>JPEG, PNG or WebP; maximum 5 MB.</small>
                      </span>
                    ) : (
                      <input
                        type={['number', 'date', 'time', 'email', 'tel'].includes(field.type) ? field.type : 'text'}
                        required={field.required}
                        min={field.type === 'number' ? '-10000' : undefined}
                        max={field.type === 'number' ? '10000' : undefined}
                        value={values[field.name] ?? ''}
                        onChange={(event) => setValue(field.name, event.target.value)}
                      />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="admin-modal-actions">
            <button type="button" className="button button-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="button" disabled={isSaving}>
              <Save size={16} aria-hidden="true" /> {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function RecordDetails({ record, onClose }) {
  if (!record) return null;
  const entries = Object.entries(record).filter(
    ([key]) => !['id', 'departmentId', 'doctorId', 'activeSlotKey', 'duplicateKey', 'passwordHash'].includes(key),
  );
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="admin-modal admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
        <div className="admin-modal-heading">
          <div>
            <span className="eyebrow">Private enquiry details</span>
            <h2 id="admin-detail-title">{record.reference || `Appointment for ${record.patientName}`}</h2>
          </div>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </div>
        <dl className="admin-detail-list">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt>{key.replace(/([A-Z])/g, ' $1')}</dt>
              <dd>{value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function DashboardHome({ summary, onNavigate }) {
  if (!summary) return <div className="admin-loading"><RefreshCw size={18} /> Loading dashboard…</div>;
  const counts = summary.appointments;
  return (
    <div className="admin-dashboard-home">
      <div className="admin-welcome-panel">
        <div>
          <span className="eyebrow">Overview</span>
          <h2>Hospital operations at a glance</h2>
          <p>Review appointment requests and website enquiries in one secure workspace.</p>
        </div>
        <span className="admin-welcome-mark"><Activity size={33} aria-hidden="true" /></span>
      </div>
      <div className="admin-stat-grid">
        <StatCard label="Total appointments" value={counts.total} icon={CalendarDays} tone="purple" />
        <StatCard label="Pending" value={counts.pending} icon={Clock3} tone="orange" />
        <StatCard label="Confirmed" value={counts.confirmed} icon={CheckCheck} tone="purple" />
        <StatCard label="Cancelled" value={counts.cancelled} icon={X} tone="orange" />
        <StatCard label="Completed" value={counts.completed} icon={Check} tone="purple" />
        <StatCard label="Contact enquiries" value={summary.totalContactMessages} icon={MessageSquareText} tone="orange" />
      </div>
      <div className="admin-recent-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><span className="eyebrow">Latest activity</span><h3>Recent appointments</h3></div>
            <button className="admin-text-button" type="button" onClick={() => onNavigate('appointments')}>All appointments <ArrowRight size={15} /></button>
          </div>
          {summary.recentAppointments.length ? summary.recentAppointments.map((item) => (
            <button className="admin-recent-row" type="button" key={item.id} onClick={() => onNavigate('appointments')}>
              <span className="admin-recent-icon"><CalendarDays size={16} /></span>
              <span><strong>{item.patientName}</strong><small>{item.reference} · {item.department.name}</small></span>
              <span className={`admin-status status-${item.status.toLowerCase()}`}>{item.status}</span>
            </button>
          )) : <p className="admin-empty">No appointment requests yet.</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><span className="eyebrow">Inbox</span><h3>Recent enquiries</h3></div>
            <button className="admin-text-button" type="button" onClick={() => onNavigate('contact-messages')}>All enquiries <ArrowRight size={15} /></button>
          </div>
          {summary.recentMessages.length ? summary.recentMessages.map((item) => (
            <button className="admin-recent-row" type="button" key={item.id} onClick={() => onNavigate('contact-messages')}>
              <span className="admin-recent-icon"><MessageSquareText size={16} /></span>
              <span><strong>{item.name}</strong><small>{item.department?.name || 'General enquiry'} · {displayDate(item.createdAt)}</small></span>
              <span className={`admin-status status-${item.status.toLowerCase()}`}>{item.status}</span>
            </button>
          )) : <p className="admin-empty">No contact enquiries yet.</p>}
        </section>
      </div>
    </div>
  );
}

function appointmentFields(appointment) {
  return [
    ['Patient', appointment.patientName],
    ['Reference', appointment.reference],
    ['Mobile', appointment.phone],
    ['Email', appointment.email || '—'],
    ['Department', appointment.department?.name],
    ['Doctor', appointment.doctor?.name || 'No preference'],
    ['Preferred date', displayDate(appointment.preferredDate)],
    ['Preferred time', appointment.preferredTime],
    ['Status', appointment.status],
  ];
}

function genericColumns(resource) {
  const common = {
    doctors: [
      ['name', 'Doctor'],
      ['qualifications', 'Qualifications'],
      ['specialty', 'Specialization'],
      ['department', 'Department'],
      ['isActive', 'Profile'],
    ],
    departments: [['name', 'Department'], ['slug', 'URL slug'], ['description', 'Description'], ['isActive', 'Status']],
    services: [['title', 'Service'], ['department', 'Category'], ['description', 'Description'], ['isActive', 'Status']],
    'gallery-images': [['caption', 'Title'], ['category', 'Category'], ['altText', 'Description'], ['url', 'Image']],
    'blog-posts': [['title', 'Article'], ['slug', 'Slug'], ['isPublished', 'Publication'], ['updatedAt', 'Updated']],
    'contact-messages': [['name', 'Name'], ['phone', 'Phone'], ['department', 'Department'], ['message', 'Message'], ['status', 'Status']],
    'website-settings': [['key', 'Setting'], ['value', 'Value'], ['isPublic', 'Visibility'], ['updatedAt', 'Updated']],
  };
  return common[resource] || [];
}

function formatCell(resource, record, key) {
  const value = record[key];
  if (key === 'department') return value?.name || '—';
  if (key === 'isActive') return value ? 'Enabled' : 'Disabled';
  if (key === 'isPublished') return value ? 'Published' : 'Draft';
  if (key === 'updatedAt') return displayDate(value, true);
  if (key === 'url' || key === 'imageUrl' || key === 'coverImage') {
    return value ? <img className="admin-table-thumbnail" src={value} alt="" /> : 'No image';
  }
  if (key === 'value') {
    const text = JSON.stringify(value);
    return text.length > 78 ? `${text.slice(0, 78)}…` : text;
  }
  if (key === 'status') return <span className={`admin-status status-${String(value).toLowerCase()}`}>{value}</span>;
  return value || '—';
}

function AppointmentsFilter({ filters, setFilters, departments, onApply, onReset }) {
  return (
    <form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <label className="admin-search-field">
        <Search size={17} aria-hidden="true" />
        <input value={filters.search} onChange={(event) => setFilters((state) => ({ ...state, search: event.target.value }))} placeholder="Search name, phone or reference" />
      </label>
      <label><span className="sr-only">Filter by department</span>
        <select value={filters.departmentId} onChange={(event) => setFilters((state) => ({ ...state, departmentId: event.target.value }))}>
          <option value="">All departments</option>
          {departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}
        </select>
      </label>
      <label><span className="sr-only">Filter by status</span>
        <select value={filters.status} onChange={(event) => setFilters((state) => ({ ...state, status: event.target.value }))}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option><option value="COMPLETED">Completed</option>
        </select>
      </label>
      <label className="admin-date-filter"><span className="sr-only">From date</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((state) => ({ ...state, dateFrom: event.target.value }))} /></label>
      <label className="admin-date-filter"><span className="sr-only">To date</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((state) => ({ ...state, dateTo: event.target.value }))} /></label>
      <button className="button button-small" type="submit"><Search size={15} /> Apply</button>
      <button className="button button-small button-outline" type="button" onClick={onReset}>Clear</button>
    </form>
  );
}

function AdminProfile({ user, onUpdated }) {
  const [values, setValues] = useState({ name: user.name, email: user.email, currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await adminRequest('/api/admin/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setValues({ name: data.name, email: data.email, currentPassword: '', newPassword: '' });
      setMessage('Your administrator profile has been updated.');
      onUpdated(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel admin-profile-panel">
      <div className="admin-panel-heading"><div><span className="eyebrow">Account security</span><h3>Administrator profile</h3></div><ShieldCheck size={24} /></div>
      <p className="admin-panel-intro">Update your sign-in details. A password change requires your current password and signs out other active sessions.</p>
      <form className="admin-profile-form" onSubmit={submit}>
        <label className="admin-field"><span>Full name</span><input required maxLength={120} value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} /></label>
        <label className="admin-field"><span>Email address</span><input required type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} /></label>
        <div className="admin-profile-divider"><span>Change password</span></div>
        <label className="admin-field"><span>Current password</span><input autoComplete="current-password" type="password" value={values.currentPassword} onChange={(event) => setValues((current) => ({ ...current, currentPassword: event.target.value }))} /></label>
        <label className="admin-field"><span>New password (minimum 16 characters)</span><input autoComplete="new-password" type="password" minLength={16} maxLength={128} value={values.newPassword} onChange={(event) => setValues((current) => ({ ...current, newPassword: event.target.value }))} /></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        {message && <div className="form-success" role="status">{message}</div>}
        <button className="button" type="submit" disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </section>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [filters, setFilters] = useState({ search: '', departmentId: '', status: '', dateFrom: '', dateTo: '' });
  const [activeFilters, setActiveFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMutating, setIsMutating] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editor, setEditor] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const { user: sessionUser } = await adminRequest('/api/admin/auth/session');
        if (active) {
          setUser(sessionUser);
          setAuthState('signed-in');
          const departmentResponse = await fetch('/api/public/departments');
          if (departmentResponse.ok) {
            const result = await departmentResponse.json();
            if (active) setDepartments(result.data);
          }
          const doctorResponse = await fetch('/api/public/doctors');
          if (doctorResponse.ok) {
            const result = await doctorResponse.json();
            if (active) setDoctors(result.data);
          }
          if (active && sessionUser.role === 'EDITOR') setSection('gallery-images');
        }
      } catch {
        if (active) {
          setAuthState('signed-out');
          navigate('/admin/login', { replace: true });
        }
      }
    }
    void checkSession();
    return () => { active = false; };
  }, [navigate]);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await adminRequest('/api/admin/dashboard/summary');
      setSummary(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    if (!resourceTitles[section]) return;
    setIsLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ page: String(pagination.page), pageSize: String(pageSize) });
      if (section === 'appointments') {
        for (const key of ['search', 'departmentId', 'status', 'dateFrom', 'dateTo']) {
          if (activeFilters[key]) query.set(key, activeFilters[key]);
        }
      } else if (section === 'contact-messages' && activeFilters.status) {
        query.set('status', activeFilters.status);
      }
      const result = await adminRequest(`/api/admin/${section}?${query}`);
      setRecords(result.data);
      setPagination((current) => ({ ...current, ...result.pagination }));
    } catch (requestError) {
      setError(requestError.message);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, pagination.page, section]);

  useEffect(() => {
    if (authState !== 'signed-in') return;
    if (section === 'dashboard') void loadSummary();
    else if (section !== 'profile') void loadRecords();
  }, [authState, loadRecords, loadSummary, refreshKey, section]);

  const heading = useMemo(
    () => navigation.find((item) => item.id === section)?.label ?? 'Dashboard',
    [section],
  );

  async function logout() {
    setError('');
    try {
      await adminRequest('/api/admin/auth/logout', { method: 'POST' });
      navigate('/admin/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function selectSection(id) {
    setSection(id);
    setMobileSidebarOpen(false);
    setError('');
    setPagination((current) => ({ ...current, page: 1 }));
    setActiveFilters({});
  }

  async function saveRecord(payload) {
    setIsSaving(true);
    setError('');
    try {
      const resource = editor.resource;
      const id = resource === 'website-settings'
        ? editor.record?.key
        : editor.record?.id;
      await adminRequest(
        `/api/admin/${resource}${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );
      setEditor(null);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(record) {
    const label = recordLabel(section, record);
    if (!window.confirm(`Delete “${label}”? This action cannot be undone.`)) return;
    setIsMutating(record.id ?? record.key);
    setError('');
    try {
      const id = record.id ?? record.key;
      const resourceId = section === 'website-settings' ? record.key : id;
      await adminRequest(`/api/admin/${section}/${encodeURIComponent(resourceId)}`, { method: 'DELETE' });
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsMutating('');
    }
  }

  async function updateStatus(record, status) {
    setIsMutating(record.id);
    setError('');
    try {
      await adminRequest(`/api/admin/${section}/${record.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsMutating('');
    }
  }

  if (authState === 'signed-out') return <Navigate to="/admin/login" replace />;
  if (authState === 'loading') {
    return <main className="admin-shell-loading"><span className="admin-spinner" />Verifying secure session…</main>;
  }

  const isEditor = user?.role === 'EDITOR';
  const visibleNavigation = isEditor
    ? navigation.filter((item) => ['gallery-images', 'blog-posts', 'profile'].includes(item.id))
    : navigation;
  const columns = genericColumns(section);
  const canCreate = Boolean(createValues[section]);
  const statusOptions = section === 'appointments'
    ? [['PENDING', 'Pending'], ['CONFIRMED', 'Confirmed'], ['CANCELLED', 'Cancelled'], ['COMPLETED', 'Completed']]
    : [['NEW', 'New'], ['READ', 'Read'], ['ARCHIVED', 'Archived']];

  return (
    <div className="admin-app">
      {mobileSidebarOpen && <button className="admin-sidebar-scrim" onClick={() => setMobileSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <a href="/" aria-label="DH Hospitals home"><img src="/images/dh-hospitals-logo.png" alt="DH Hospitals" /></a>
          <span>ADMIN WORKSPACE</span>
        </div>
        <nav className="admin-sidebar-nav" aria-label="Administrator sections">
          <span className="admin-nav-caption">MANAGEMENT</span>
          {visibleNavigation.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`admin-nav-link ${section === id ? 'is-active' : ''}`}
              onClick={() => selectSection(id)}
            >
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
              {section === id && <span className="admin-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
          <div className="admin-user-copy"><strong>{user?.name}</strong><small>{user?.role?.replace('_', ' ')}</small></div>
          <button type="button" className="admin-icon-button admin-logout" onClick={logout} aria-label="Logout"><LogOut size={18} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button className="admin-menu-toggle" type="button" onClick={() => setMobileSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div><span className="admin-topbar-kicker">DH Hospitals / Admin</span><h1>{heading}</h1></div>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-secure-label"><ShieldCheck size={16} /> Secure session</span>
            <button className="admin-refresh-button" type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={isLoading}><RefreshCw size={16} /> Refresh</button>
            <button className="admin-mobile-logout" type="button" onClick={logout} aria-label="Logout"><LogOut size={18} /></button>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="form-error admin-global-error" role="alert">{error}</div>}
          {section === 'dashboard' && <DashboardHome summary={summary} onNavigate={selectSection} />}

          {section === 'profile' && <AdminProfile user={user} onUpdated={setUser} />}

          {section === 'appointments' && (
            <section className="admin-panel admin-list-panel">
              <div className="admin-panel-heading">
                <div><span className="eyebrow">Patient requests</span><h2>Appointment management</h2><p>Requests remain pending until an administrator confirms them.</p></div>
              </div>
              <AppointmentsFilter filters={filters} setFilters={setFilters} departments={departments} onApply={() => { setActiveFilters({ ...filters }); setPagination((current) => ({ ...current, page: 1 })); }} onReset={() => { const empty = { search: '', departmentId: '', status: '', dateFrom: '', dateTo: '' }; setFilters(empty); setActiveFilters({}); setPagination((current) => ({ ...current, page: 1 })); }} />
              <div className="admin-list-meta"><strong>{pagination.total} appointments</strong>{isLoading && <span>Loading records…</span>}</div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead><tr><th>Reference / patient</th><th>Contact</th><th>Department / doctor</th><th>Preferred date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{records.map((appointment) => (
                    <tr key={appointment.id}>
                      <td><strong>{appointment.reference}</strong><small>{appointment.patientName}{appointment.patientAge !== null ? ` · Age ${appointment.patientAge}` : ''}</small></td>
                      <td><a href={`tel:${appointment.phone}`}>{appointment.phone}</a>{appointment.email && <small>{appointment.email}</small>}</td>
                      <td>{appointment.department?.name}<small>{appointment.doctor?.name || 'No doctor preference'}</small></td>
                      <td>{displayDate(appointment.preferredDate)}<small>{appointment.preferredTime}</small></td>
                      <td><select className="admin-status-select" value={appointment.status} disabled={isMutating === appointment.id} aria-label={`Appointment status ${appointment.reference}`} onChange={(event) => updateStatus(appointment, event.target.value)}>{statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
                      <td><div className="admin-row-actions"><button type="button" className="admin-icon-button" onClick={() => setDetails(appointment)} aria-label={`View ${appointment.reference}`}><Eye size={16} /></button><button type="button" className="admin-icon-button" onClick={() => setEditor({ resource: 'appointments', record: appointment })} aria-label={`Edit ${appointment.reference}`}><Pencil size={16} /></button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!records.length && !isLoading && <p className="admin-empty">No appointment requests match these filters.</p>}
              </div>
              <Pagination pagination={pagination} isLoading={isLoading} setPagination={setPagination} />
            </section>
          )}

          {resourceTitles[section] && section !== 'appointments' && (
            <section className="admin-panel admin-list-panel">
              <div className="admin-panel-heading">
                <div><span className="eyebrow">{section === 'contact-messages' ? 'Patient communication' : 'Website content'}</span><h2>{resourceTitles[section]}</h2><p>{section === 'contact-messages' ? 'Review and update submitted contact enquiries.' : 'Manage published information stored in the hospital database.'}</p></div>
                {canCreate && <button className="button button-small" type="button" onClick={() => setEditor({ resource: section, record: null })}><Plus size={16} /> Add new</button>}
              </div>
              {section === 'contact-messages' && (
                <div className="admin-filter-form admin-contact-filter">
                  <label><span className="sr-only">Filter contact messages by status</span><select value={activeFilters.status || ''} onChange={(event) => { setActiveFilters({ status: event.target.value }); setPagination((current) => ({ ...current, page: 1 })); }}><option value="">All statuses</option>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
              )}
              <div className="admin-list-meta"><strong>{pagination.total} records</strong>{isLoading && <span>Loading records…</span>}</div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead>
                  <tbody>{records.map((record) => (
                    <tr key={record.id ?? record.key}>
                      {columns.map(([key]) => (
                        <td key={key}>
                          {section === 'contact-messages' && key === 'status' ? (
                            <select className="admin-status-select" value={record.status} disabled={isMutating === record.id} aria-label={`Message status for ${record.name}`} onChange={(event) => updateStatus(record, event.target.value)}>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                          ) : formatCell(section, record, key)}
                        </td>
                      ))}
                      <td><div className="admin-row-actions">
                        {section === 'contact-messages' && <button type="button" className="admin-icon-button" onClick={() => setDetails(record)} aria-label={`View message from ${record.name}`}><Eye size={16} /></button>}
                        {canCreate && <button type="button" className="admin-icon-button" onClick={() => setEditor({ resource: section, record })} aria-label={`Edit ${recordLabel(section, record)}`}><Pencil size={16} /></button>}
                        {canCreate && <button type="button" className="admin-icon-button admin-delete-button" disabled={isMutating === (record.id ?? record.key)} onClick={() => deleteRecord(record)} aria-label={`Delete ${recordLabel(section, record)}`}><Trash2 size={16} /></button>}
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!records.length && !isLoading && <p className="admin-empty">No records found.</p>}
              </div>
              <Pagination pagination={pagination} isLoading={isLoading} setPagination={setPagination} />
            </section>
          )}
        </div>
      </main>
      {editor && <ResourceForm resource={editor.resource} record={editor.record} departments={departments} doctors={doctors} onClose={() => setEditor(null)} onSave={saveRecord} isSaving={isSaving} />}
      {details && <RecordDetails record={details} onClose={() => setDetails(null)} />}
    </div>
  );
}

function Pagination({ pagination, isLoading, setPagination }) {
  return (
    <div className="admin-pagination">
      <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
      <div>
        <button className="button button-small button-outline" type="button" disabled={pagination.page <= 1 || isLoading} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}><ArrowLeft size={15} /> Previous</button>
        <button className="button button-small button-outline" type="button" disabled={pagination.page >= pagination.totalPages || isLoading} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}
