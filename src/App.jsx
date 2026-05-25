import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from './components/Modal.jsx';
import FeatureCard from './components/FeatureCard.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import DragDrop from './components/DragDrop.jsx';
import Spinner from './components/Spinner.jsx';
import InterviewChat from './components/InterviewChat.jsx';
import ProgressCircle from './components/ProgressCircle.jsx';
import AuthSplit from './components/AuthSplit.jsx';

const roleQuestions = {
  'Web Developer': [
    'Describe a web application you built and the technologies you chose.',
    'How do you make an interface responsive and accessible?',
    'What strategies do you use to optimize front-end performance?',
  ],
  'Software Developer': [
    'Explain how you approach debugging a challenging bug.',
    'How do you structure code to make it easy to maintain?',
    'What is your process when you receive a new software requirement?',
  ],
  'UI/UX Designer': [
    'Describe how you turn user research into interface decisions.',
    'What tools do you use for wireframing and prototyping?',
    'How do you validate a design before implementation?',
  ],
  'Database Administrator': [
    'How do you keep a database secure and performant?',
    'Explain the benefits of indexing and when you use it.',
    'What is your backup strategy for critical systems?',
  ],
  'IT Support': [
    'How would you troubleshoot a slow network for a user?',
    'Describe a time you resolved a difficult hardware issue.',
    'What is your communication approach with non-technical users?',
  ],
};

const initialResumeFeedback = {
  strengths: [
    'Well-organized IT skill section',
    'Clear focus on student career goals',
    'Strong mention of technical coursework',
  ],
  improvements: [
    'Add measurable outcomes to project descriptions',
    'Include more keywords for IT岗位 roles',
    'Use consistent formatting across sections',
  ],
  keywords: ['JavaScript', 'Python', 'Responsive Design', 'Database', 'Problem Solving'],
  formatting: [
    'Use a single font style for a polished layout',
    'Add spacing between sections for readability',
    'Keep bullet points concise and direct',
  ],
};

function App() {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const resumeRef = useRef(null);
  const interviewRef = useRef(null);
  const dashboardRef = useRef(null);
  const adminRef = useRef(null);

  const sectionRefs = useMemo(
    () => [
      { id: 'hero', ref: heroRef },
      { id: 'about', ref: aboutRef },
      { id: 'resume', ref: resumeRef },
      { id: 'interview', ref: interviewRef },
      { id: 'dashboard', ref: dashboardRef },
      { id: 'admin', ref: adminRef },
    ],
    []
  );

  const [activeSection, setActiveSection] = useState('hero');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Web Developer');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [dashboardData, setDashboardData] = useState({
    interviewsCompleted: 7,
    resumeScore: 85,
    averageConfidence: '79%',
    improvementLevel: 'Growing',
  });

  useEffect(() => {
    const handleScroll = () => {
      const current = sectionRefs.reduce(
        (active, section) => {
          const rect = section.ref.current?.getBoundingClientRect();
          if (!rect) return active;
          if (rect.top >= 0 && rect.top < active.offset) {
            return { id: section.id, offset: rect.top };
          }
          return active;
        },
        { id: activeSection, offset: Number.POSITIVE_INFINITY }
      );
      setActiveSection(current.id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, sectionRefs]);

  const scrollTo = (ref, id) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file || null);
    setResumeFeedback(null);
  };

  const analyzeResume = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setResumeFeedback(initialResumeFeedback);
      setIsAnalyzing(false);
      setDashboardData((prev) => ({ ...prev, resumeScore: 90 }));
    }, 1400);
  };

  const startInterview = () => {
    setQuestionIndex(0);
    setFeedback(null);
    setAnswerText('');
  };

  const currentQuestion = roleQuestions[selectedRole][questionIndex % roleQuestions[selectedRole].length];

  const submitAnswer = () => {
    if (!answerText.trim()) return;
    const nextFeedback = {
      clarity: 'Clear and well-organized.',
      technical: `Good use of role-specific concepts for ${selectedRole}.`,
      confidence: answerText.length > 45 ? 'Strong' : 'Developing',
      improvement: 'Add one concrete example and mention tools or frameworks by name.',
    };
    setFeedback(nextFeedback);
    setHistory((prev) => [
      { role: selectedRole, question: currentQuestion, confidence: nextFeedback.confidence, date: new Date().toLocaleDateString() },
      ...prev,
    ].slice(0, 6));
    setAnswerText('');
    setDashboardData((prev) => ({
      ...prev,
      interviewsCompleted: prev.interviewsCompleted + 1,
      averageConfidence: `${Math.min(96, Number(prev.averageConfidence.replace('%', '')) + 2)}%`,
    }));
  };

  const nextQuestion = () => {
    setQuestionIndex((prev) => prev + 1);
    setFeedback(null);
    setAnswerText('');
  };

  const openAuth = (mode) => {
    setModalMode(mode);
    setShowModal(true);
    setAuthData({ name: '', email: '', password: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const validateAuth = () => {
    const newErrors = {};
    if (modalMode === 'register' && !authData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!authData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!authData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    if (!validateAuth()) return;
    setSuccessMessage(modalMode === 'login' ? 'Login successful. Welcome back!' : 'Registration successful. Welcome aboard!');
    setTimeout(() => setShowModal(false), 1300);
  };

  return (
    <div className="app-shell">
      <Navbar
        activeSection={activeSection}
        onNavigate={(id) => {
          const mapping = { hero: heroRef, about: aboutRef, resume: resumeRef, interview: interviewRef, dashboard: dashboardRef, admin: adminRef };
          scrollTo(mapping[id], id);
        }}
        onOpenAuth={openAuth}
      />

      <main>
        <section className="section hero" ref={heroRef} id="hero">
          <div className="hero-copy modern">
            <p className="eyebrow">PUP Parañaque — IT Career Prep</p>
            <h1>
              JobReady AI
              <span className="typing"> — Mock Interviews & Resume Feedback</span>
            </h1>
            <p className="lead">An Intelligent Mock Interviewer and Resume Feedback System for IT students.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => scrollTo(aboutRef, 'about')}>Get Started</button>
              <button className="secondary" onClick={() => scrollTo(interviewRef, 'interview')}>Try Mock Interview</button>
              <button className="secondary" onClick={() => scrollTo(resumeRef, 'resume')}>Upload Resume</button>
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

        <section className="section" ref={aboutRef} id="about">
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

        <section className="section split-panel" ref={resumeRef} id="resume">
          <div className="panel-left">
            <div className="section-heading">
              <p className="eyebrow">Resume Upload</p>
              <h2>Upload your PDF resume for a sample AI review</h2>
            </div>
            <div className="card upload-card modern-upload">
              <DragDrop onFile={(file) => { setSelectedFile(file); setResumeFeedback(null); }} accept="application/pdf">
                <div className="upload-inner">
                  <p className="muted">Drag & drop here or click to browse</p>
                  <p className="file-name small">{selectedFile ? selectedFile.name : 'No file selected'}</p>
                  <div className="actions">
                    <button className="primary" onClick={analyzeResume} disabled={!selectedFile || isAnalyzing}>
                      {isAnalyzing ? <Spinner /> : 'Analyze Resume'}
                    </button>
                  </div>
                </div>
              </DragDrop>
            </div>
          </div>
          <div className="panel-right">
            <div className="card feedback-card modern-feedback">
              <h3>Sample Feedback</h3>
              {isAnalyzing && <div className="center"><Spinner /></div>}
              {resumeFeedback ? (
                <div className="feedback-blocks">
                  <div>
                    <h4>Strengths</h4>
                    <ul>{resumeFeedback.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h4>Improvements</h4>
                    <ul>{resumeFeedback.improvements.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h4>Missing Keywords</h4>
                    <p>{resumeFeedback.keywords.join(', ')}</p>
                  </div>
                  <div>
                    <h4>Formatting Suggestions</h4>
                    <ul>{resumeFeedback.formatting.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </div>
              ) : !isAnalyzing ? (
                <p className="muted">Upload a PDF and click Analyze to simulate AI resume feedback.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="section" ref={interviewRef} id="interview">
          <div className="section-heading">
            <p className="eyebrow">Mock Interview</p>
            <h2>Practice role-focused interview questions</h2>
          </div>
          <div className="interview-grid modern-interview">
            <div className="card role-card">
              <label>
                <span className="muted small">Target role</span>
                <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                  {Object.keys(roleQuestions).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
              <div className="role-actions">
                <button className="primary" onClick={startInterview}>Start Interview</button>
                <button className="ghost" onClick={() => { setQuestionIndex(0); setFeedback(null); }}>Reset</button>
              </div>
              <div className="question-banner modern-question">
                <h3>Question</h3>
                <p>{currentQuestion}</p>
              </div>
            </div>
            <div className="card answer-card">
              <InterviewChat
                question={currentQuestion}
                value={answerText}
                onChange={setAnswerText}
                onSubmit={() => submitAnswer()}
                onNext={() => nextQuestion()}
                feedback={feedback}
              />
            </div>
          </div>
        </section>

        <section className="section" ref={dashboardRef} id="dashboard">
          <div className="section-heading">
            <p className="eyebrow">Dashboard</p>
            <h2>Track your progress</h2>
          </div>
          <div className="stats-grid modern-stats">
            <div className="card stat-card">
              <p className="muted">Interviews Completed</p>
              <h3>{dashboardData.interviewsCompleted}</h3>
              <ProgressCircle value={dashboardData.interviewsCompleted % 100} />
            </div>
            <div className="card stat-card">
              <p className="muted">Resume Score</p>
              <h3>{dashboardData.resumeScore}%</h3>
              <ProgressCircle value={dashboardData.resumeScore} />
            </div>
            <div className="card stat-card">
              <p className="muted">Average Confidence</p>
              <h3>{dashboardData.averageConfidence}</h3>
            </div>
            <div className="card stat-card">
              <p className="muted">Improvement Level</p>
              <h3>{dashboardData.improvementLevel}</h3>
            </div>
          </div>
          <div className="card history-card">
            <h3>Interview History</h3>
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Question</th>
                  <th>Confidence</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <tr key={`${entry.role}-${index}`}>
                      <td>{entry.role}</td>
                      <td>{entry.question}</td>
                      <td>{entry.confidence}</td>
                      <td>{entry.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="muted">No interview attempts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" ref={adminRef} id="admin">
          <div className="section-heading">
            <p className="eyebrow">Admin Preview</p>
            <h2>Platform insights</h2>
          </div>
          <div className="admin-grid modern-admin">
            <div className="card admin-card">
              <p className="muted">Users</p>
              <h3>1,230</h3>
            </div>
            <div className="card admin-card">
              <p className="muted">Resume uploads</p>
              <h3>812</h3>
            </div>
            <div className="card admin-card">
              <p className="muted">Completed interviews</p>
              <h3>3,120</h3>
            </div>
            <div className="card admin-card activity-card">
              <p className="muted">Recent activity</p>
              <ul>
                <li>Anna uploaded resume for Web Developer</li>
                <li>Jared completed a Software Developer mock</li>
                <li>Louise requested another review</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <AuthSplit mode={modalMode} authData={authData} setAuthData={setAuthData} errors={errors} onSubmit={handleAuthSubmit} switchMode={() => setModalMode(modalMode === 'login' ? 'register' : 'login')} successMessage={successMessage} />
        </Modal>
      )}
    </div>
  );
}

export default App;
