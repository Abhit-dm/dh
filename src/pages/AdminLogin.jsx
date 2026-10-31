import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminRequest } from '../lib/adminApi.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await adminRequest('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="admin-login-logo" to="/" aria-label="DH Hospitals home">
          <img src="/images/dh-hospitals-logo.png" alt="DH Hospitals" />
        </Link>
        <span className="eyebrow">Administrator portal</span>
        <div className="admin-login-icon"><ShieldCheck size={25} aria-hidden="true" /></div>
        <h1>Welcome back</h1>
        <p>Sign in to securely manage DH Hospitals website enquiries and content.</p>
        <form onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Email address</span>
            <input
              autoComplete="username"
              type="email"
              required
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              type="password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
            />
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button admin-login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in securely'}
            {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>
        <Link className="admin-back-link" to="/">Return to DH Hospitals</Link>
      </section>
    </main>
  );
}
