import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ sessionActive }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/interview', label: 'Interview' },
    { to: '/evaluation', label: 'Evaluation' },
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
          <Link to="/login" className="nav-button ghost" onClick={(event) => handleNavigation(event, '/login')}>
            Login
          </Link>
          <Link to="/signup" className="nav-button primary" onClick={(event) => handleNavigation(event, '/signup')}>
            Sign Up
          </Link>
          <button
            className="hamburger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            ☰
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
          <Link to="/login" className="nav-button ghost" onClick={(event) => handleNavigation(event, '/login')}>
            Login
          </Link>
          <Link to="/signup" className="nav-button primary" onClick={(event) => handleNavigation(event, '/signup')}>
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
