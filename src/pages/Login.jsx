import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleGoogleLogin = async () => {
    // Placeholder for Google login integration
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Placeholder for login submission
  };

  return (
    <section className="section page-shell">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Secure access</p>
          <h2 className="heading-xl">Welcome back</h2>
          <p className="muted lead-text">Sign in with your school email to continue using JobReady AI.</p>
        </div>

        <button type="button" className="button button-google" onClick={handleGoogleLogin}>
          <span className="google-icon">G</span>
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

          <div className="form-row justify-between">
            <span />
            <Link to="/forgot-password" className="inline-link muted-link">
              Forgot Password?
            </Link>
          </div>

          <button className="button button-primary w-full" type="submit">
            Login
          </button>
        </form>

        <p className="form-footer">
          Don’t have an account?{' '}
          <Link to="/signup" className="inline-link">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
