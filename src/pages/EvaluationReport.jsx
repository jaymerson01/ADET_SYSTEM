import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/pages/EvaluationReport.css";
import { getSessionEvaluation, getHistoryReport } from "../services/api.js";

export default function EvaluationReport({ reportData, session }) {
  const location = useLocation();
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Core metric states initialized to null, empty strings, or 0
  const [interviewPerformance, setInterviewPerformance] = useState(0);
  const [resumeStrength, setResumeStrength] = useState("");
  const [roleFit, setRoleFit] = useState("");
  const [keyStrength, setKeyStrength] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState("");
  const [responseQuality, setResponseQuality] = useState(0.0);
  const [clarityScore, setClarityScore] = useState(0);
  const [focusArea, setFocusArea] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [summaryText, setSummaryText] = useState("");

  // Sync state with props or location navigation data
  useEffect(() => {
    if (reportData) {
      setRawData(reportData);
    } else if (location.state?.reportData) {
      setRawData(location.state?.reportData);
    }
  }, [reportData, location.state]);

  useEffect(() => {
    const fetchReport = async () => {
      const query = new URLSearchParams(location.search);
      const querySessionId = query.get('session_id');
      const historySessionId = location.state?.historySessionId;
      const sessionId = querySessionId || historySessionId || session?.session_id || localStorage.getItem('active_session_id');
      if (rawData || !sessionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const evaluation = historySessionId || querySessionId
          ? await getHistoryReport(sessionId)
          : await getSessionEvaluation(sessionId);
        setRawData(evaluation);
      } catch (err) {
        // Safe fallback to null state to trigger the clean placeholder card
        console.warn("Could not fetch evaluation report from API:", err);
        setRawData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [rawData, session?.session_id]);

  useEffect(() => {
    if (rawData) {
      const quality = rawData.average_response_quality || 0.0;
      const overallScorePercentage = Math.round(quality * 20);

      setInterviewPerformance(overallScorePercentage);
      setResumeStrength(rawData.resume_strength || "");
      setRoleFit(rawData.role_fit || "");
      setKeyStrength(rawData.key_strengths || "");
      setQuestionsAnswered(rawData.questions_answered || "");
      setResponseQuality(quality);
      setClarityScore(rawData.clarity_score || overallScorePercentage);
      setFocusArea(rawData.focus_area || "");
      setSummaryText(rawData.interview_performance || "");

      setRecommendations([
        {
          title: "Answer Length & Depth",
          description: rawData.rec_answer_length || "No recommendation details generated."
        },
        {
          title: "CS / IT Fundamentals",
          description: rawData.rec_core_fundamentals || "No recommendation details generated."
        },
        {
          title: "Practical Projects & Experience",
          description: rawData.rec_practical_experience || "No recommendation details generated."
        }
      ]);
    } else {
      setInterviewPerformance(0);
      setResumeStrength("");
      setRoleFit("");
      setKeyStrength("");
      setQuestionsAnswered("");
      setResponseQuality(0.0);
      setClarityScore(0);
      setFocusArea("");
      setSummaryText("");
      setRecommendations([]);
    }
  }, [rawData]);

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

  const isEmpty = !rawData || Object.keys(rawData).length === 0;

  // Render empty placeholder state if no evaluation data exists
  if (isEmpty) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <div className="card" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', maxWidth: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 8px 16px rgba(var(--accent-rgb), 0.15))', animation: 'pulse 2.5s infinite ease-in-out' }}>📊</div>
          <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>No Evaluation Data Available Yet</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6', fontSize: '1rem' }}>
            Complete your first mock interview to unlock your performance metrics report!
          </p>
          <Link to="/dashboard" className="button button-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, marginTop: '0.5rem' }}>
            Start Mock Interview
          </Link>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 0.9; }
            }
          `}</style>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-shell page-stack">
      {/* Header Section */}
      <div className="section-heading">
        <p className="eyebrow">Your Performance</p>
        <h2>Interview & Resume Evaluation</h2>
        <p>Comprehensive AI-driven review of your session transcript and resume alignment.</p>
      </div>

      {/* Top Performance Scorecards (4-Column Grid) */}
      <div className="evaluation-grid">
        {/* Card 1: Interview Performance */}
        <article className="score-card">
          <p className="panel-label">💼 Interview Performance</p>
          <h3>{interviewPerformance}%</h3>
          <p>{summaryText}</p>
        </article>

        {/* Card 2: Resume Strength */}
        <article className="score-card">
          <p className="panel-label">📄 Resume Strength</p>
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
            {resumeStrength}
          </p>
        </article>

        {/* Card 3: Role Fit */}
        <article className="score-card">
          <p className="panel-label">🎯 Role Fit</p>
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
            {roleFit}
          </p>
        </article>

        {/* Card 4: Key Strength */}
        <article className="score-card">
          <p className="panel-label">✨ Key Strength</p>
          <h4 style={{ margin: "1rem 0 0.5rem 0", color: "var(--accent)", fontWeight: 700 }}>
            {keyStrength}
          </h4>
          <p>Demonstrated strong foundational capabilities in this primary area.</p>
        </article>
      </div>

      {/* Detailed Metrics Section */}
      <div className="card metric-summary" style={{ padding: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>Detailed Metrics</h3>
        <div className="metric-grid">
          {/* Metric 1: Questions Answered */}
          <div className="metric-stat">
            <span className="metric-value">{questionsAnswered}</span>
            <span className="metric-label">Questions Answered</span>
          </div>

          {/* Metric 2: Response Quality */}
          <div className="metric-stat">
            <span className="metric-value">{responseQuality.toFixed(1)}</span>
            <span className="metric-label">Avg Response Quality (/ 5.0)</span>
          </div>

          {/* Metric 3: Clarity Score */}
          <div className="metric-stat">
            <span className="metric-value">{clarityScore}%</span>
            <span className="metric-label">Clarity Score</span>
          </div>

          {/* Metric 4: Focus Area */}
          <div className="metric-stat">
            <span className="metric-value" style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
              {focusArea}
            </span>
            <span className="metric-label">Focus Area</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations Block */}
      <div className="card" style={{ padding: "2rem", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>📋 AI Actionable Recommendations</h3>
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
