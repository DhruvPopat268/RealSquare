import "./StatsBar.css";

const stats = [
  { value: "10L+", label: "Properties Listed" },
  { value: "5L+", label: "Happy Customers" },
  { value: "500+", label: "Cities Covered" },
  { value: "15K+", label: "Verified Agents" },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className="stat-item">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
