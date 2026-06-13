import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api.js';

const MAJORS = [
  'BS Information Technology',
  'BS Computer Science',
  'BS Information Systems',
  'BS Entertainment and Multimedia Computing',
];

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    major: MAJORS[0],
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      if (onSignup) onSignup();
      await signup(form.fullName, form.email, form.major, form.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message && err.message.includes('Email already registered')) {
        setError('This email is already in use.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="section page-shell">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Create account</p>
          <h2 className="heading-xl">Join JobReady AI</h2>
          <p className="muted lead-text">Sign up to access mock interviews, resume review, and career prep tools.</p>
        </div>

        {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>⚠️ {error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-group">
            <span>Full Name</span>
            <input
              type="text"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </label>

          <label className="input-group">
            <span>School Email Address</span>
            <input
              type="email"
              placeholder="you@school.edu"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </label>

          <label className="input-group">
            <span>Course / Major</span>
            <select value={form.major} onChange={(e) => handleChange('major', e.target.value)}>
              {MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </label>

          <label className="input-group">
            <span>Confirm Password</span>
            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
            />
          </label>

          <label className="checkbox-group">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={(e) => handleChange('agreed', e.target.checked)}
            />
            <span>I agree to the Terms of Service</span>
          </label>

          <button className="button button-primary w-full" type="submit" disabled={!form.agreed || isSubmitting}>
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="form-footer">
          Already have an account?{' '}
          <Link to="/login" className="inline-link">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
