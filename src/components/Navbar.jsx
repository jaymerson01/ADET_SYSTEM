import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar({ sessionActive, onLogout }) {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('access_token')));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('access_token')));
  }, [location]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('access_token')));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const links = isAuthenticated
    ? [
      { to: '/', label: 'Home' },
      { to: '/dashboard', label: 'Dashboard' },
      ...(sessionActive ? [{ to: '/interview', label: 'Interview' }] : []),
      { to: '/evaluation', label: 'Evaluation' },
      { to: '/history', label: 'History' },
    ]
    : [
      { to: '/', label: 'Home' },
    ];

  const handleClose = () => setOpen(false);

  const handleNavigation = (event, to) => {
    if (location.pathname === '/interview' && sessionActive && to !== '/interview') {
      const shouldLeave = window.confirm('Are you sure you want to leave? Your current interview progress will be lost.');
      if (!shouldLeave) {
        event.preventDefault();
        return;
      }
    }
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('active_session_id');
      localStorage.removeItem('session_id');
      localStorage.removeItem('active_role');
      localStorage.removeItem('evaluation_report');
      localStorage.removeItem('reportData');
    }
    setIsAuthenticated(false);
    handleClose();
    navigate('/login');
  };

  return (
    <header className={`navbar ${open ? 'open' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={(event) => handleNavigation(event, '/')}>
          JobReady AI
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={(event) => handleNavigation(event, link.to)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          {isAuthenticated ? (
            <button
              type="button"
              className="nav-button ghost"
              onClick={handleLogout}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-button ghost" onClick={(event) => handleNavigation(event, '/login')}>
                Login
              </Link>
              <Link to="/signup" className="nav-button primary" onClick={(event) => handleNavigation(event, '/signup')}>
                Sign Up
              </Link>
            </>
          )}
          <button
            className="hamburger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={open}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: 0 }}
          >
            {open ? <X className="w-6 h-6 text-current" /> : <Menu className="w-6 h-6 text-current" />}
          </button>
        </div>
      </div>

      <div className="mobile-menu" aria-hidden={!open}>
        <nav className="mobile-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={(event) => handleNavigation(event, link.to)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="nav-button ghost w-full"
              onClick={handleLogout}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-button ghost" onClick={(event) => handleNavigation(event, '/login')}>
                Login
              </Link>
              <Link to="/signup" className="nav-button primary" onClick={(event) => handleNavigation(event, '/signup')}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
