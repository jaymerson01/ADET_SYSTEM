import { useState } from 'react';

export default function Navbar({ activeSection, onNavigate, onOpenAuth }) {
  const [open, setOpen] = useState(false);

  const links = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'resume', label: 'Resume' },
    { id: 'interview', label: 'Mock Interview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <header className={`navbar ${open ? 'open' : ''}`}>
      <div className="nav-inner">
        <div className="brand">JobReady AI</div>
        <nav className="nav-links">
          {links.map((l) => (
            <button key={l.id} className={activeSection === l.id ? 'active' : ''} onClick={() => { onNavigate(l.id); setOpen(false); }}>{l.label}</button>
          ))}
        </nav>
        <div className="nav-right">
          <button className="ghost" onClick={() => onOpenAuth('login')}>Login</button>
          <button onClick={() => onOpenAuth('register')}>Register</button>
          <button className="hamburger" onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">☰</button>
        </div>
      </div>
    </header>
  );
}
