export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="brand">JobReady AI</div>
          <p className="muted">An AI mock interviewer and resume feedback platform for PUP IT students.</p>
        </div>
        <div className="footer-right">
          <div className="links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <div className="copyright">© {new Date().getFullYear()} JobReady AI</div>
        </div>
      </div>
    </footer>
  );
}
