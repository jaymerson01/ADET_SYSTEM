import { Link } from "react-router-dom";
import { FileText, Target, Bot, BarChart3 } from "lucide-react";

function Home() {
  return (
    <div className="page-stack">
      <section className="section hero">
        <div className="hero-copy">
          <span className="eyebrow">AI-powered career preparation</span>

          <h1>
            Practice smarter. <br />
            Get <span>JobReady</span> faster.
          </h1>

          <p className="lead-text">
            JobReady AI helps IT students prepare for interviews, improve resumes,
            and receive AI-style feedback for better confidence and performance.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard" className="button button-primary">
              Start Practice Now
            </Link>

            <Link to="/interview" className="button button-secondary">
              Try Mock Interview
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card">
            <span className="panel-label">AI Career Companion</span>
            <h2>Resume + Interview Feedback in One Platform</h2>
            <p>
              Upload your resume, choose a target role, answer mock interview
              questions, and review your performance through AI-generated feedback.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">AI</div>
          <h3>95%</h3>
          <p>Interview readiness support</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">CV</div>
          <h3>4x</h3>
          <p>Resume improvement guidance</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">QA</div>
          <h3>24/7</h3>
          <p>Mock interview practice</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">IT</div>
          <h3>10+</h3>
          <p>IT career roles supported</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Features</span>
          <h2>Everything you need to prepare for your next interview</h2>
          <p>
            A clean and simple platform built for IT students who want to improve
            their resume, communication, and confidence.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3>Resume Upload</h3>
            <p>
              Upload your PDF resume and connect it to your interview preparation
              session.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3>Role Selection</h3>
            <p>
              Choose your target IT role such as Frontend Developer, Backend
              Developer, or UI/UX Designer.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3>Mock Interview</h3>
            <p>
              Practice answering interview questions in a realistic AI-style chat
              environment.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3>Evaluation Report</h3>
            <p>
              Review your performance through score cards, strengths, weaknesses,
              and recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
  <div className="section-heading">
    <span className="eyebrow">Student Feedback</span>
    <h2>Students preparing smarter with AI</h2>
  </div>

  <div className="testimonial-grid">
    <div className="testimonial-card">
      <p>
        “The mock interview helped me become more confident during technical
        interviews.”
      </p>

      <div className="testimonial-user">
        <div className="avatar">J</div>

        <div>
          <strong>John Cruz</strong>
          <span>Frontend Student</span>
        </div>
      </div>
    </div>

    <div className="testimonial-card">
      <p>
        “The resume feedback gave me a clearer structure and better project
        descriptions.”
      </p>

      <div className="testimonial-user">
        <div className="avatar">M</div>

        <div>
          <strong>Maria Santos</strong>
          <span>Backend Developer Student</span>
        </div>
      </div>
    </div>

    <div className="testimonial-card">
      <p>
        “It feels like practicing with a real interviewer instead of just
        reading questions online.”
      </p>

      <div className="testimonial-user">
        <div className="avatar">A</div>

        <div>
          <strong>Angela Reyes</strong>
          <span>UI/UX Student</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="section cta-section">
  <div className="cta-card">
    <div>
      <span className="eyebrow">Ready to Start?</span>

      <h2>Prepare for your IT career with AI assistance.</h2>

      <p>
        Practice interviews, improve resumes, and gain confidence before your
        real job applications.
      </p>
    </div>

    <Link to="/dashboard" className="button button-primary">
      Get Started
    </Link>
  </div>
</section>
    </div>
  );
}

export default Home;