import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDrop from '../components/DragDrop.jsx';
import { startInterviewSession } from '../services/api.js';
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Target, Lightbulb } from 'lucide-react';

const IT_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'QA Engineer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Dashboard({ onStartSession, initialRole = IT_ROLES[0], initialFile = null }) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileInput = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFileError('Only PDF resumes are accepted.');
      setSelectedFile(null);
      setUploadProgress(0);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('Resume must be under 5MB to upload.');
      setSelectedFile(null);
      setUploadProgress(0);
      return;
    }

    setFileError('');
    setSelectedFile(file);
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);
  };

  const hasValidFile = Boolean(selectedFile && selectedFile.type === 'application/pdf' && selectedFile.size <= MAX_FILE_SIZE);

  const handleStartSession = async () => {
    if (!hasValidFile || isLoading) return;

    setIsLoading(true);
    setFileError('');

    try {
      const result = await startInterviewSession(selectedFile, selectedRole);

      onStartSession({ 
        file: selectedFile, 
        role: selectedRole, 
        session_id: result.session_id 
      });

      navigate('/interview');
    } catch (err) {
      setFileError(err.message || 'Failed to start interview session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section page-shell">
      <div className="section-heading">
        <p className="eyebrow">Interview Setup</p>
        <h2>Ready to Practice?</h2>
        <p className="lead-text">Upload your resume and select your target role to begin your AI-powered mock interview session.</p>
      </div>

      <div className="dashboard-grid">
        <div className="upload-card">
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-blue)' }} />
            <span>Your Resume</span>
          </h3>
          <DragDrop onFile={handleFileInput} accept="application/pdf">
            <div className="upload-inner">
              {!selectedFile ? (
                <>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    margin: '0 auto 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '18px',
                    background: 'white',
                    color: 'var(--accent-blue)',
                    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.14)'
                  }}>
                    <UploadCloud style={{ width: '28px', height: '28px' }} />
                  </div>
                  <p><strong>Drop your resume here or click to browse</strong></p>
                  <p className="muted">PDF format only, up to 5MB</p>
                </>
              ) : (
                <>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    margin: '0 auto 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '18px',
                    background: 'white',
                    color: '#10b981',
                    boxShadow: '0 12px 30px rgba(16, 185, 129, 0.14)'
                  }}>
                    <CheckCircle2 style={{ width: '28px', height: '28px' }} />
                  </div>
                  <p><strong>{selectedFile.name}</strong></p>
                  <p className="muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', margin: '0.5rem 0' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 200ms ease' }} />
                    </div>
                  )}
                </>
              )}
              {fileError && (
                <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <AlertCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                  <span>{fileError}</span>
                </p>
              )}
            </div>
          </DragDrop>
        </div>

        <div className="dashboard-panel">
          <div className="role-card">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Target style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-blue)' }} />
              <span>Target Role</span>
            </h3>
            <label className="input-group" style={{ marginBottom: '1.5rem', display: 'block' }}>
              <span>Select your IT role</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                {IT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <div className="question-banner" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                <span>Pro Tip</span>
              </h3>
              <p>Selecting the right role helps our AI generate relevant questions and provide personalized feedback for your target position.</p>
            </div>

            <button 
              className={`button ${hasValidFile && !isLoading ? 'button-primary' : 'button-secondary'} w-full`} 
              type="button" 
              onClick={handleStartSession} 
              disabled={!hasValidFile || isLoading}
            >
              {isLoading ? 'Processing Resume...' : hasValidFile ? 'Start Interview Session →' : 'Upload Resume to Continue'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
