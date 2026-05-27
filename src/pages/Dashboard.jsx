import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDrop from '../components/DragDrop.jsx';

const IT_ROLES = ['Frontend Developer', 'Backend Developer', 'QA Engineer', 'Data Analyst'];
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

    try {
      onStartSession({ file: selectedFile, role: selectedRole });

      // TODO: Replace this comment with your backend request.
      // Example: use fetch() or axios.post() to upload multipart form-data
      // and send selectedFile + selectedRole to the Python API.
      // await uploadResumeToBackend(selectedFile, selectedRole);

      navigate('/interview');
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
          <h3 className="panel-title">📄 Your Resume</h3>
          <DragDrop onFile={handleFileInput} accept="application/pdf">
            <div className="upload-inner">
              {!selectedFile ? (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⬆️</div>
                  <p><strong>Drop your resume here or click to browse</strong></p>
                  <p className="muted">PDF format only, up to 5MB</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <p><strong>{selectedFile.name}</strong></p>
                  <p className="muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', margin: '0.5rem 0' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 200ms ease' }} />
                    </div>
                  )}
                </>
              )}
              {fileError && <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>⚠️ {fileError}</p>}
            </div>
          </DragDrop>
        </div>

        <div className="dashboard-panel">
          <div className="role-card">
            <h3 className="panel-title">🎯 Target Role</h3>
            <label className="input-group">
              <span>Select your IT role</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                {IT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <div className="question-banner">
              <h3>💡 Pro Tip</h3>
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
