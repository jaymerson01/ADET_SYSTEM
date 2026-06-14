import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHistoryList, getHistoryReport } from '../services/api.js';
import EvaluationReport from './EvaluationReport.jsx';
import { Loader2, AlertTriangle, BarChart3, X } from 'lucide-react';
import '../styles/pages/EvaluationHistory.css';

export default function EvaluationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalReport, setModalReport] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistoryList();
        setHistory(data);
      } catch (err) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleView = async (sessionId) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const report = await getHistoryReport(sessionId);
      setModalReport(report);
      setShowModal(true);
    } catch (err) {
      setModalError(err.message || 'Failed to load report');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <h3>Loading interview history...</h3>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '500px' }}>
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error Loading History</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/dashboard" className="button button-primary" style={{ textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  if (!history || history.length === 0) {
    return (
      <section className="section page-shell page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <div className="card" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', maxWidth: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <BarChart3 className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-pulse" style={{ filter: 'drop-shadow(0 8px 16px rgba(var(--accent-rgb), 0.15))' }} />
          <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>No Past Interviews Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6', fontSize: '1rem' }}>
            You haven't completed any interviews yet! Head over to the Resume Upload section to kick off your first session.
          </p>
          <Link to="/dashboard" className="button button-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, marginTop: '0.5rem' }}>
            Upload Resume
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-shell page-stack">
      <div className="section-heading">
        <h2>Interview History</h2>
        <p>Review your past mock interviews and see detailed performance metrics.</p>
      </div>
      <div className="history-table" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Target Role</th>
              <th style={{ padding: '0.75rem' }}>Completion Date</th>
              <th style={{ padding: '0.75rem' }}>Score</th>
              <th style={{ padding: '0.75rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.session_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '0.75rem' }}>{item.selectedRole || item.target_role || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{formatDate(item.created_at)}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className="score-badge">{item.interviewPerformance ?? item.score ?? '—'}</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    className="button button-ghost"
                    onClick={() => handleView(item.session_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View Full Evaluation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X className="w-5 h-5" />
            </button>
            {modalLoading && <p>Loading report...</p>}
            {modalError && <p style={{ color: '#dc2626' }}>{modalError}</p>}
            {modalReport && <EvaluationReport reportData={modalReport} session={null} />}
          </div>
        </div>
      )}
    </section>
  );
}
