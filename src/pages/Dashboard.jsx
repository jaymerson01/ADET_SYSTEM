import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDrop from '../components/DragDrop.jsx';

const IT_ROLES = ['Frontend Developer', 'Backend Developer', 'QA Engineer', 'Data Analyst'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Dashboard({ onStartSession, initialRole = IT_ROLES[0], initialFile = null }) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [fileError, setFileError] = useState('');
  const navigate = useNavigate();

  const handleFileInput = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFileError('Only PDF resumes are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('Resume must be under 5MB to upload.');
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const hasValidFile = Boolean(selectedFile && selectedFile.type === 'application/pdf' && selectedFile.size <= MAX_FILE_SIZE);

  const handleStartSession = () => {
    if (!hasValidFile) return;
    onStartSession({ file: selectedFile, role: selectedRole });
    navigate('/interview');
  };

  return (
    <section className="section page-shell">
      <div className="section-heading">
        <p className="eyebrow">Resume & Interview Setup</p>
        <h2 className="heading-xl">Upload your PDF resume and choose your target role</h2>
        <p className="muted lead-text">Prepare your profile and role preference before beginning the mock interview session.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card upload-card modern-upload">
          <h3 className="panel-title">Resume Upload</h3>
          <DragDrop onFile={handleFileInput} accept="application/pdf">
            <div className="upload-inner polished-upload">
              <p className="muted">Drag and drop your PDF resume here or click to browse.</p>
              <p className="file-name small">{selectedFile ? selectedFile.name : 'No file selected'}</p>
              {fileError && <p className="file-error">{fileError}</p>}
              <button className="button button-secondary w-full" type="button" onClick={handleStartSession} disabled={!hasValidFile}>
                Start Session
              </button>
            </div>
          </DragDrop>
        </div>

        <div className="card role-card dashboard-panel">
          <h3 className="panel-title">Target role</h3>
          <label className="input-group">
            <span className="label-small">Choose your IT role</span>
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
              {IT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <div className="question-banner modern-question">
            <h3>Interview Details</h3>
            <p>Once started, your resume and role selection will be linked for the mock interview experience.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
