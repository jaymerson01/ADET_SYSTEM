export default function ProgressCircle({ value = 0, size = 64 }) {
  const pct = Math.max(0, Math.min(100, value));
  const dash = 2 * Math.PI * 18;
  const offset = dash - (dash * pct) / 100;
  return (
    <svg className="progress-circle" width={size} height={size} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="18" stroke="#fff" strokeOpacity="0.08" strokeWidth="6" fill="none" />
      <circle cx="25" cy="25" r="18" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} transform="rotate(-90 25 25)" />
      <text x="50%" y="54%" textAnchor="middle" fontSize="10" fill="#fff">{pct}%</text>
    </svg>
  );
}
