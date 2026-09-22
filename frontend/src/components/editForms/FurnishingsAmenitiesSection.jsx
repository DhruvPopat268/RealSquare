/**
 * FurnishingsAmenitiesSection.jsx
 *
 * Housing.com-style card grid for furnishings & amenities.
 * - Icon cards in a responsive grid
 * - Click to toggle selection (card highlights in purple)
 * - hasCount=true → inline  −  N  +  counter appears on the card
 * - Amenities: simple toggle cards (no counter)
 *
 * Props
 * ─────
 * availableFurnishings  – { _id, name, hasCount, icon? }[]
 * availableAmenities    – { _id, name, icon? }[]
 * furnishType           – string | ""
 * selectedFurnishings   – { id, name, count }[] | { furnishingId, count }[]
 * selectedAmenities     – { id, name }[]         | { amenityId }[]
 * onFurnishTypeChange   – (val) => void
 * onFurnishingsChange   – (arr) => void   (emits { furnishingId, count })
 * onAmenitiesChange     – (arr) => void   (emits { amenityId })
 * disabled              – boolean
 */

import { Section, FormField, SelectField } from "./EditFormShared";

const FURNISH_TYPE_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];

// ── ID normalisation helpers ──────────────────────────────────────────────────

function getFurnishingId(f) {
  return f.id?.toString() ?? f.furnishingId?.toString() ?? null;
}
function getFurnishingCount(f) {
  return typeof f.count === "number" ? f.count : 1;
}
function getAmenityId(a) {
  return a.id?.toString() ?? a.amenityId?.toString() ?? null;
}

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
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="currentColor"
      >
        {abbr}
      </text>
    </svg>
  );
}

// ── Single furnishing card ────────────────────────────────────────────────────

function FurnishingCard({ item, active, count, onToggle, onCountChange, disabled }) {
  const stopProp = (e) => e.stopPropagation();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(item)}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3
        transition select-none focus:outline-none
        ${active
          ? "border-[#7B2FFF] bg-[#f5f0ff] text-[#7B2FFF]"
          : "border-gray-200 bg-white text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
        }
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {/* Icon */}
      <span className={`text-2xl leading-none ${active ? "text-[#7B2FFF]" : "text-gray-400"}`}>
        <ItemIcon icon={item.icon} label={item.name} />
      </span>

      {/* Name */}
      <span className="text-[11px] font-semibold text-center leading-tight line-clamp-2">
        {item.name}
      </span>

      {/* Counter — only for hasCount items when selected */}
      {active && item.hasCount && (
        <div
          className="flex items-center gap-1 mt-1"
          onClick={stopProp}
        >
          <button
            type="button"
            disabled={disabled || count <= 1}
            onClick={(e) => { stopProp(e); onCountChange(item._id.toString(), count - 1); }}
            className="w-6 h-6 flex items-center justify-center rounded-full border border-[#7B2FFF]
              text-[#7B2FFF] text-sm font-bold hover:bg-[#7B2FFF] hover:text-white transition
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-bold text-[#7B2FFF]">
            {count}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => { stopProp(e); onCountChange(item._id.toString(), count + 1); }}
            className="w-6 h-6 flex items-center justify-center rounded-full border border-[#7B2FFF]
              text-[#7B2FFF] text-sm font-bold hover:bg-[#7B2FFF] hover:text-white transition
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      )}
    </button>
  );
}

// ── Single amenity card ───────────────────────────────────────────────────────

function AmenityCard({ item, active, onToggle, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(item)}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3
        transition select-none focus:outline-none
        ${active
          ? "border-[#7B2FFF] bg-[#f5f0ff] text-[#7B2FFF]"
          : "border-gray-200 bg-white text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
        }
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <span className={`text-2xl leading-none ${active ? "text-[#7B2FFF]" : "text-gray-400"}`}>
        <ItemIcon icon={item.icon} label={item.name} />
      </span>
      <span className="text-[11px] font-semibold text-center leading-tight line-clamp-2">
        {item.name}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FurnishingsAmenitiesSection({
  availableFurnishings = [],
  availableAmenities   = [],
  furnishType          = "",
  selectedFurnishings  = [],
  selectedAmenities    = [],
  onFurnishTypeChange,
  onFurnishingsChange,
  onAmenitiesChange,
  disabled             = false,
}) {
  const selectedFurnishingIds = new Set(selectedFurnishings.map(getFurnishingId).filter(Boolean));
  const selectedAmenityIds    = new Set(selectedAmenities.map(getAmenityId).filter(Boolean));

  const selectedFurnishCount = selectedFurnishingIds.size;
  const selectedAmenityCount = selectedAmenityIds.size;

  // ── Toggle furnishing ───────────────────────────────────────────────────────
  const handleFurnishingToggle = (item) => {
    const id = item._id.toString();
    if (selectedFurnishingIds.has(id)) {
      onFurnishingsChange(selectedFurnishings.filter((f) => getFurnishingId(f) !== id));
    } else {
      onFurnishingsChange([...selectedFurnishings, { furnishingId: id, count: 1 }]);
    }
  };

  // ── Change count ────────────────────────────────────────────────────────────
  const handleCountChange = (id, newCount) => {
    const count = Math.max(1, newCount);
    onFurnishingsChange(
      selectedFurnishings.map((f) =>
        getFurnishingId(f) === id ? { furnishingId: id, count } : f
      )
    );
  };

  // ── Toggle amenity ──────────────────────────────────────────────────────────
  const handleAmenityToggle = (item) => {
    const id = item._id.toString();
    if (selectedAmenityIds.has(id)) {
      onAmenitiesChange(selectedAmenities.filter((a) => getAmenityId(a) !== id));
    } else {
      onAmenitiesChange([...selectedAmenities, { amenityId: id }]);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Furnish Type ── */}
      <Section title="Furnishing Details">
        <FormField label="Furnishing Status">
          <SelectField
            value={furnishType}
            onChange={onFurnishTypeChange}
            options={FURNISH_TYPE_OPTIONS}
            placeholder="Select furnishing status"
            disabled={disabled}
          />
        </FormField>
      </Section>

      {/* ── Flat Furnishings card grid — hidden when Unfurnished or not yet selected ── */}
      {availableFurnishings.length > 0 && furnishType && furnishType !== "Unfurnished" && (
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#1a1a2e]">Flat Furnishings</h3>
            <span className="text-xs font-semibold text-[#7B2FFF] bg-[#f5f0ff] px-2.5 py-1 rounded-full">
              {selectedFurnishCount} selected
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {availableFurnishings.map((item) => {
              const id     = item._id.toString();
              const active = selectedFurnishingIds.has(id);
              const cur    = active ? selectedFurnishings.find((f) => getFurnishingId(f) === id) : null;
              const count  = cur ? getFurnishingCount(cur) : 1;
              return (
                <FurnishingCard
                  key={id}
                  item={item}
                  active={active}
                  count={count}
                  onToggle={handleFurnishingToggle}
                  onCountChange={handleCountChange}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Society Amenities card grid ── */}
      {availableAmenities.length > 0 && (
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#1a1a2e]">Society Amenities</h3>
            <span className="text-xs font-semibold text-[#7B2FFF] bg-[#f5f0ff] px-2.5 py-1 rounded-full">
              {selectedAmenityCount} selected
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {availableAmenities.map((item) => {
              const id     = item._id.toString();
              const active = selectedAmenityIds.has(id);
              return (
                <AmenityCard
                  key={id}
                  item={item}
                  active={active}
                  onToggle={handleAmenityToggle}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
