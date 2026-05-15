const stats = [
  { value: "10L+", label: "Properties Listed" },
  { value: "5L+", label: "Happy Customers" },
  { value: "500+", label: "Cities Covered" },
  { value: "15K+", label: "Verified Agents" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#1a1a2e] flex flex-wrap justify-center">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`
            flex flex-col items-center px-4 py-6
            w-1/2 sm:w-auto sm:flex-1 sm:max-w-[220px]
            border-white/[0.08]
            ${i % 2 === 0 ? "border-r sm:border-r" : "border-r-0 sm:border-r"}
            ${i < 2 ? "border-b sm:border-b-0" : ""}
            ${i === stats.length - 1 ? "sm:border-r-0" : ""}
          `}
        >
          <span className="text-[28px] font-extrabold text-[#a78bfa]">{s.value}</span>
          <span className="text-[13px] text-white/65 mt-1">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
