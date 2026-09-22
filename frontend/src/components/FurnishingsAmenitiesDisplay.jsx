/**
 * FurnishingsAmenitiesDisplay.jsx
 *
 * Read-only Housing.com-style card grid for property detail page.
 * Icon is now stored in the listing document itself (denormalized at PATCH time).
 *
 * Props
 * ─────
 * furnishType  – string | null
 * furnishings  – { id, name, icon?, count }[]
 * amenities    – { id, name, icon? }[]
 */

// ── Icon: real image if URL present, else letter-abbreviation SVG ─────────────
function ItemIcon({ icon, label }) {
  if (icon) {
    return (
      <img
        src={icon}
        alt={label}
        className="w-9 h-9 object-contain"
      />
    );
  }
  const abbr = label
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
      <rect width="40" height="40" rx="8" fill="currentColor" opacity="0.08" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
        {abbr}
      </text>
    </svg>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────
function ItemCard({ name, icon, count }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border
      border-[#7B2FFF] bg-[#f5f0ff] text-[#7B2FFF] p-3 select-none">
      <ItemIcon icon={icon} label={name} />
      <span className="text-[11px] font-semibold text-center leading-tight line-clamp-2">
        {name}
      </span>
      {count > 1 && (
        <span className="text-xs font-bold bg-[#7B2FFF] text-white px-2 py-0.5 rounded-full">
          ×{count}
        </span>
      )}
    </div>
  );
}

// ── Furnish type badge ────────────────────────────────────────────────────────
function FurnishTypeBadge({ value }) {
  const colors = {
    "Fully-Furnished": "bg-green-100 text-green-700 border-green-200",
    "Semi-Furnished":  "bg-amber-100 text-amber-700 border-amber-200",
    "Unfurnished":     "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[value] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {value}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function FurnishingsAmenitiesDisplay({ furnishType, furnishings = [], amenities = [] }) {
  const hasFurnishings = furnishings.length > 0;
  const hasAmenities   = amenities.length > 0;

  if (!furnishType && !hasFurnishings && !hasAmenities) return null;

  return (
    <div className="flex flex-col gap-5">

      {/* Furnish Type */}
      {furnishType && (
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Furnishing Status</h2>
          <FurnishTypeBadge value={furnishType} />
        </div>
      )}

      {/* Flat Furnishings */}
      {hasFurnishings && (
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Flat Furnishings</h2>
            <span className="text-xs font-semibold text-[#7B2FFF] bg-[#f5f0ff] px-2.5 py-1 rounded-full">
              {furnishings.length} item{furnishings.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {furnishings.map((f, i) => (
              <ItemCard key={f.id?.toString() ?? i} name={f.name} icon={f.icon} count={f.count ?? 1} />
            ))}
          </div>
        </div>
      )}

      {/* Society Amenities */}
      {hasAmenities && (
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Society Amenities</h2>
            <span className="text-xs font-semibold text-[#7B2FFF] bg-[#f5f0ff] px-2.5 py-1 rounded-full">
              {amenities.length} item{amenities.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {amenities.map((a, i) => (
              <ItemCard key={a.id?.toString() ?? i} name={a.name} icon={a.icon} count={1} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
