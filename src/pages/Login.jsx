import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/login';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (onLogin) onLogin();
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section page-shell">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Secure access</p>
          <h2>Welcome back</h2>
          <p className="lead-text">Sign in with your school email to continue.</p>
        </div>

        {error && (
          <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
            {error}
          </p>
        )}

        <button type="button" className="button button-secondary w-full" onClick={handleGoogleLogin} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider"><span>or continue with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-group">
            <span>Email address</span>
            <input
              type="email"
              placeholder="you@school.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" className="inline-link" style={{ fontSize: '0.9rem' }}>
              Forgot Password?
            </Link>
          </div>

          <button className="button button-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="form-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="inline-link">
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}
