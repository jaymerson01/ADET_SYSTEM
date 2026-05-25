export default function Spinner() {
  return (
    <div className="spinner" aria-hidden>
      <svg width="36" height="36" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" strokeWidth="4" stroke="#fff" strokeOpacity="0.12" fill="none" />
        <path d="M45 25a20 20 0 00-6-14" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}
