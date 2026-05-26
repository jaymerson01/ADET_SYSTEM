export default function EvaluationReport() {
  return (
    <section className="section page-shell page-stack">
      <div className="section-heading">
        <p className="eyebrow">Your Performance</p>
        <h2>Interview & Resume Evaluation</h2>
        <p>Comprehensive AI-driven analysis of your interview responses and resume alignment with your target role.</p>
      </div>

      <div className="evaluation-grid">
        <article className="score-card">
          <p className="panel-label">💼 Interview Performance</p>
          <h3>82%</h3>
          <p>Your overall score based on clarity, technical accuracy, and confidence demonstrated across all responses.</p>
        </article>

        <article className="score-card">
          <p className="panel-label">📄 Resume Strength</p>
          <h3>78%</h3>
          <p>Resume formatting, keyword usage, and alignment with your target role. Ready to share with recruiters.</p>
        </article>

        <article className="score-card">
          <p className="panel-label">🎯 Role Fit</p>
          <h3>4.2 / 5</h3>
          <p>How well your responses and resume align with the responsibilities of your target role.</p>
        </article>

        <article className="score-card">
          <p className="panel-label">✨ Key Strength</p>
          <h3>Communication</h3>
          <p>You demonstrated clear and structured responses with good examples to support your answers.</p>
        </article>
      </div>

      <div className="card metric-summary">
        <h3 style={{ marginBottom: '1.5rem' }}>Detailed Metrics</h3>
        <div className="metric-grid">
          <div className="metric-stat">
            <span className="metric-value">5/5</span>
            <span className="metric-label">Questions Answered</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">4.6</span>
            <span className="metric-label">Avg Response Quality</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">88%</span>
            <span className="metric-label">Clarity Score</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">3</span>
            <span className="metric-label">Focus Areas</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>📋 Recommendations</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
            <p><strong>Improve Technical Depth</strong></p>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Add more specific examples from your projects when answering technical questions.</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
            <p><strong>Highlight Key Skills</strong></p>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Update your resume to emphasize the technologies most relevant to the role.</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
            <p><strong>Prepare Questions</strong></p>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Have 3-5 thoughtful questions ready to ask the interviewer about the role and company.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="#" className="button button-primary" style={{ textDecoration: 'none' }}>
          📥 Download Report
        </a>
        <a href="/dashboard" className="button button-secondary" style={{ textDecoration: 'none' }}>
          ↻ Practice Again
        </a>
      </div>
    </section>
  );
}
