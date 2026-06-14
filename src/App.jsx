import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import EvaluationReport from './pages/EvaluationReport.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import EvaluationHistory from './pages/EvaluationHistory.jsx';

function App() {
  const [sessionBundle, setSessionBundle] = useState(() => {
    const savedSessionId = localStorage.getItem('active_session_id');
    const savedRole = localStorage.getItem('active_role');
    if (savedSessionId && savedRole) {
      return { session_id: parseInt(savedSessionId, 10), role: savedRole };
    }
    return null;
  });
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      window.dispatchEvent(new Event('storage'));
    }
  }, [location]);

  const showAppChrome = ['/', '/dashboard', '/interview', '/evaluation', '/history'].includes(location.pathname);
  const handleStartSession = ({ file, role, session_id }) => {
    if (!file || !role) return;
    localStorage.setItem('active_session_id', session_id);
    localStorage.setItem('active_role', role);
    setSessionBundle({ file, role, session_id, startedAt: new Date() });
  };

  const handleClearSession = () => {
    localStorage.removeItem('active_session_id');
    localStorage.removeItem('session_id');
    localStorage.removeItem('active_role');
    localStorage.removeItem('evaluation_report');
    localStorage.removeItem('reportData');
    setSessionBundle(null);
  };

  return (
    <div className={`app-shell ${showAppChrome ? '' : 'auth-shell'}`}>
      {showAppChrome && (
        <Navbar
          sessionActive={Boolean(sessionBundle && sessionBundle.file)}
          onLogout={handleClearSession}
        />
      )}

      <main className={showAppChrome ? 'main-shell' : 'auth-main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                onStartSession={handleStartSession}
                initialRole={sessionBundle?.role || 'Frontend Developer'}
                initialFile={sessionBundle?.file || null}
              />
            }
          />
          <Route path="/interview" element={<InterviewRoom session={sessionBundle} />} />
          <Route path="/evaluation" element={<EvaluationReport session={sessionBundle} />} />
          <Route path="/login" element={<Login onLogin={handleClearSession} />} />
          <Route path="/signup" element={<Signup onSignup={handleClearSession} />} />
          <Route path="/history" element={<EvaluationHistory />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {showAppChrome && <Footer />}
    </div>
  );
}

export default App;