import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/pages/EvaluationReport.css";
import { getSessionEvaluation } from "../services/api.js";

const defaultReportData = {
  metrics: {
    interviewPerformance: 85,
    resumeStrength: 78,
    roleFit: 4.2,
    keyStrength: "Communication",
    questionsAnswered: "5/5",
    responseQuality: 4.5,
    clarityScore: 90,
    focusArea: "Technical Depth",
  },
  recommendations: [
    {
      title: "Add more technical depth",
      description: "Include specific technical examples and implementation details when answering system design and architecture questions to demonstrate deeper expertise.",
    },
    {
      title: "Highlight key technologies",
      description: "Ensure your resume prominently features the tech stack most relevant to the role you're targeting, with concrete project examples.",
    },
    {
      title: "Prepare targeted questions",
      description: "Research the company and prepare 3-5 thoughtful questions about the role, team structure, and company culture to ask at the end of the interview.",
    },
  ],
};

export default function EvaluationReport({ reportData, session }) {
  const location = useLocation();
  const [rawData, setRawData] = useState(reportData || location.state?.reportData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const sessionId = session?.session_id || localStorage.getItem('active_session_id');
      if (rawData || !sessionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const evaluation = await getSessionEvaluation(sessionId);
        setRawData(evaluation);
      } catch (err) {
        setError(err.message || "Failed to load report from server.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReport();
  }, [rawData, session?.session_id]);

  if (isLoading) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <h3>Generating report metrics...</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we fetch your analysis from the server.</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error Loading Evaluation</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/dashboard" className="button button-primary" style={{ textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  const isRealData = Boolean(rawData);

  // Initialize defaults
  let metrics = defaultReportData.metrics;
  let recommendations = defaultReportData.recommendations;
  let strengths = [];
  let weaknesses = [];
  let summaryText = "Comprehensive AI-driven analysis of your interview responses and resume alignment with your target role.";

  if (isRealData) {
    summaryText = rawData.summary || summaryText;
    
    // Map recommendations from a list of strings
    recommendations = (rawData.recommendations || []).map((rec, index) => {
      if (typeof rec === 'string') {
        const colonIndex = rec.indexOf(':');
        if (colonIndex !== -1) {
          return {
            title: rec.substring(0, colonIndex).trim(),
            description: rec.substring(colonIndex + 1).trim()
          };
        }
        return {
          title: `Recommendation ${index + 1}`,
          description: rec
        };
      }
      return rec;
    });

    strengths = rawData.strengths || [];
    weaknesses = rawData.weaknesses || [];

    // Map metrics based on overall score
    metrics = {
      interviewPerformance: rawData.overall_score || 0,
      resumeStrength: 85, // Static fallback placeholder for resume
      roleFit: parseFloat((rawData.overall_score / 20).toFixed(1)),
      keyStrength: strengths[0] || "Structured Communication",
      questionsAnswered: "Completed",
      responseQuality: (rawData.overall_score / 20).toFixed(1),
      clarityScore: rawData.overall_score || 0,
      focusArea: weaknesses[0] || "Interview Performance",
    };
  }



  return (
    <section className="section page-shell page-stack">
      {/* Header Section */}
      <div className="section-heading">
        <p className="eyebrow">Your Performance</p>
        <h2>Interview & Resume Evaluation</h2>
        <p>{summaryText}</p>
      </div>

      {/* Top Performance Scorecards (4-Column Grid) */}
      <div className="evaluation-grid">
        {/* Card 1: Interview Performance */}
        <article className="score-card">
          <p className="panel-label">💼 Interview Performance</p>
          <h3>{metrics.interviewPerformance}%</h3>
          <p>Overall score based on clarity, technical accuracy, and confidence across all responses.</p>
        </article>

        {/* Card 2: Resume Strength */}
        <article className="score-card">
          <p className="panel-label">📄 Resume Strength</p>
          <h3>{metrics.resumeStrength}%</h3>
          <p>Formatting, keyword usage, and alignment with your target role. Ready for recruiters.</p>
        </article>

        {/* Card 3: Role Fit */}
        <article className="score-card">
          <p className="panel-label">🎯 Role Fit</p>
          <h3>{metrics.roleFit}</h3>
          <p>How well your responses align with your target role.</p>
          {/* Star rating visual */}
          <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ fontSize: "1.2rem", color: i < Math.floor(metrics.roleFit) ? "#FCD34D" : "#D1D5DB" }}>
                ★
              </span>
            ))}
          </div>
        </article>

        {/* Card 4: Key Strength */}
        <article className="score-card">
          <p className="panel-label">✨ Key Strength</p>
          <h3 style={{ background: "none", WebkitTextFillColor: "unset", color: "var(--accent)" }}>
            {metrics.keyStrength}
          </h3>
          <p>You demonstrated clear and structured responses with compelling examples.</p>
        </article>
      </div>

      {/* Detailed Metrics Section */}
      <div className="card metric-summary" style={{ padding: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>Detailed Metrics</h3>
        <div className="metric-grid">
          {/* Metric 1: Questions Answered */}
          <div className="metric-stat">
            <span className="metric-value">{metrics.questionsAnswered}</span>
            <span className="metric-label">Questions Answered</span>
          </div>

          {/* Metric 2: Response Quality */}
          <div className="metric-stat">
            <span className="metric-value">{metrics.responseQuality}</span>
            <span className="metric-label">Avg Response Quality (/ 5.0)</span>
          </div>

          {/* Metric 3: Clarity Score */}
          <div className="metric-stat">
            <span className="metric-value">{metrics.clarityScore}%</span>
            <span className="metric-label">Clarity Score</span>
          </div>

          {/* Metric 4: Focus Area */}
          <div className="metric-stat">
            <span className="metric-value" style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
              {metrics.focusArea}
            </span>
            <span className="metric-label">Focus Area</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations Block */}
      <div className="card" style={{ padding: "2rem", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>📋 AI Recommendations</h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              style={{
                padding: "1.25rem",
                background: "var(--bg-light)",
                borderRadius: "12px",
                borderLeft: "4px solid var(--accent)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, marginBottom: "0.5rem" }}>{rec.title}</p>
              <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isRealData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginTop: "2rem" }}>
          {/* Strengths Card */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#16a34a" }}>✨ Key Strengths</h3>
            <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "grid", gap: "0.75rem" }}>
              {strengths.map((s, index) => (
                <li key={index} style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Weaknesses Card */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#dc2626" }}>⚠️ Areas for Improvement</h3>
            <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "grid", gap: "0.75rem" }}>
              {weaknesses.map((w, index) => (
                <li key={index} style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Action Container */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem", justifyContent: "flex-end" }}>
        <Link
          to="/dashboard"
          className="button button-primary"
          style={{ textDecoration: "none" }}
        >
          ↻ Practice Again
        </Link>
      </div>
    </section>
  );
}
