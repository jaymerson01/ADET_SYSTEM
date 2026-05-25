import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.jsx';

export default function Home() {
  return (
    <main className="page-shell page-stack">
      <section className="section hero">
        <div className="hero-copy modern">
          <p className="eyebrow">PUP Parañaque — IT Career Prep</p>
          <h1>
            JobReady AI
            <span className="typing"> — Mock Interviews & Resume Feedback</span>
          </h1>
          <p className="lead-text">An Intelligent Mock Interviewer and Resume Feedback System for IT students.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/dashboard">
              Get Started
            </Link>
            <Link className="button button-secondary" to="/interview">
              Try Mock Interview
            </Link>
            <Link className="button button-secondary" to="/dashboard">
              Upload Resume
            </Link>
          </div>
        </div>
        <div className="hero-panel modern">
          <div className="panel-card modern-card">
            <p className="panel-label">AI Career Companion</p>
            <h2>Practice. Improve. Land the role.</h2>
            <p>Simulated AI feedback for clarity, technical accuracy and confidence — frontend-only demo.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">About</p>
          <h2>AI-driven practice tailored for PUP IT students</h2>
          <p>JobReady AI helps students prepare for interviews by simulating role-specific questions and providing guided resume feedback.</p>
        </div>
        <div className="feature-grid modern-grid">
          <FeatureCard title="Resume Feedback" description="Automated suggestions to refine resume structure and keywords." />
          <FeatureCard title="Mock Interview" description="Role-based questions and instant feedback on your answers." />
          <FeatureCard title="AI Analysis" description="Keyword, formatting, and clarity recommendations." />
          <FeatureCard title="Progress Tracking" description="Visualize improvement across interviews and resume score." />
        </div>
      </section>
    </main>
  );
}
