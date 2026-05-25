import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import EvaluationReport from './pages/EvaluationReport.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  const [sessionBundle, setSessionBundle] = useState(null);
  const location = useLocation();
  const showAppChrome = ['/', '/dashboard', '/interview', '/evaluation'].includes(location.pathname);

  const handleStartSession = ({ file, role }) => {
    if (!file || !role) return;
    setSessionBundle({ file, role, startedAt: new Date() });
  };

  return (
    <div className={`app-shell ${showAppChrome ? '' : 'auth-shell'}`}>
      {showAppChrome && <Navbar sessionActive={Boolean(sessionBundle)} />}

      <main className={showAppChrome ? 'main-shell' : 'auth-main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={<Dashboard onStartSession={handleStartSession} initialRole={sessionBundle?.role || 'Frontend Developer'} initialFile={sessionBundle?.file || null} />}
          />
          <Route path="/interview" element={<InterviewRoom session={sessionBundle} />} />
          <Route path="/evaluation" element={<EvaluationReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {showAppChrome && <Footer />}
    </div>
  );
}

export default App;
