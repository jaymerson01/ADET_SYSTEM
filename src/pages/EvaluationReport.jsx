export default function EvaluationReport() {
  return (
    <section className="section page-shell page-stack">
      <div className="section-heading">
        <p className="eyebrow">Evaluation Report</p>
        <h2>Review your interview and resume performance</h2>
        <p>AI-driven evaluations will appear here once your session completes, including scorecards, metrics, and improvement guidance.</p>
      </div>

      <div className="evaluation-grid">
        <article className="panel-card score-card">
          <p className="panel-label">Resume Strength</p>
          <h3>82%</h3>
          <p>Resume formatting, keyword usage, and readability score for your latest upload.</p>
        </article>

        <article className="panel-card score-card">
          <p className="panel-label">Interview Readiness</p>
          <h3>78%</h3>
          <p>Evaluation of confidence, structure, and technical clarity across your responses.</p>
        </article>

        <article className="panel-card score-card">
          <p className="panel-label">Role Fit</p>
          <h3>4.2 / 5</h3>
          <p>How closely your responses aligned with the chosen role’s key responsibilities.</p>
        </article>

        <article className="panel-card score-card">
          <p className="panel-label">Next Steps</p>
          <h3>3 recommendations</h3>
          <p>Actionable feedback on improving answers, resume sections, and interview presence.</p>
        </article>
      </div>

      <div className="card metric-summary">
        <div className="metric-grid">
          <div className="metric-stat">
            <span className="metric-value">15</span>
            <span className="metric-label">Interview questions answered</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">4.8</span>
            <span className="metric-label">Average response quality</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">92%</span>
            <span className="metric-label">Resume clarity score</span>
          </div>
          <div className="metric-stat">
            <span className="metric-value">3</span>
            <span className="metric-label">Focus areas suggested</span>
          </div>
        </div>
      </div>
    </section>
  );
}
