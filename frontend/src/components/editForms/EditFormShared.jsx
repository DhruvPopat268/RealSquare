/**
 * EditFormShared.jsx
 * Reusable primitive components used by all type-specific edit forms.
 */

// ── Section wrapper ───────────────────────────────────────────────────────────
export function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-5">
      {title && <h3 className="text-base font-bold text-[#1a1a2e] border-b border-gray-100 pb-3">{title}</h3>}
      {children}
    </div>
  );
}

// ── Two-column grid ───────────────────────────────────────────────────────────
export function Grid({ children, cols = 2 }) {
  const colClass = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }[cols] ?? "grid-cols-1 sm:grid-cols-2";
  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

// ── Label + input wrapper ─────────────────────────────────────────────────────
export function FormField({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Text input ────────────────────────────────────────────────────────────────
export function TextInput({ value, onChange, placeholder, disabled }) {
  const hasValue = value && String(value).trim() !== "";
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? ""}
      disabled={disabled}
      className={`w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-400
        focus:outline-none focus:ring-1 focus:ring-[#7B2FFF]/20
        disabled:bg-gray-50 disabled:text-gray-400 transition
        ${hasValue ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-800 focus:border-[#7B2FFF]"}`}
    />
  );
}

// ── Number input ──────────────────────────────────────────────────────────────
export function NumberInput({ value, onChange, placeholder, min, disabled }) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      placeholder={placeholder ?? ""}
      min={min ?? 0}
      disabled={disabled}
      className={`w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-400
        focus:outline-none focus:ring-1 focus:ring-[#7B2FFF]/20
        disabled:bg-gray-50 disabled:text-gray-400 transition
        ${hasValue ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-800 focus:border-[#7B2FFF]"}`}
    />
  );
}

// ── Select / dropdown ─────────────────────────────────────────────────────────
export function SelectField({ value, onChange, options, placeholder, disabled }) {
  // options: [{ value, label }] or ['string']
  const normalised = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none border rounded-xl px-3 py-2.5 text-sm transition
          focus:outline-none focus:border-[#7B2FFF] focus:ring-1 focus:ring-[#7B2FFF]/20
          disabled:bg-gray-50 disabled:text-gray-400
          ${value ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-500"}`}
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {normalised.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// ── Area field (value + unit) ─────────────────────────────────────────────────
const AREA_UNITS = [
  { value: "sqft", label: "sq.ft" },
  { value: "sqyd", label: "sq.yd" },
  { value: "sqmt", label: "sq.m" },
];

export function AreaField({ value, unit, onValueChange, onUnitChange, placeholder }) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onValueChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder={placeholder ?? "Area"}
        min={0}
        className={`flex-1 min-w-0 border rounded-xl px-3 py-2.5 text-sm placeholder-gray-400
          focus:outline-none focus:ring-1 focus:ring-[#7B2FFF]/20 transition
          ${hasValue ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-800 focus:border-[#7B2FFF]"}`}
      />
      <div className="relative w-28 flex-shrink-0">
        <select
          value={unit ?? "sqft"}
          onChange={(e) => onUnitChange(e.target.value)}
          className={`w-full appearance-none border rounded-xl px-3 py-2.5 text-sm
            focus:outline-none focus:ring-1 focus:ring-[#7B2FFF]/20 transition
            ${hasValue ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-600 focus:border-[#7B2FFF]"}`}
        >
          {AREA_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Date input (ISO date string ↔ <input type="date">) ────────────────────────
export function DateField({ value, onChange, placeholder }) {
  // value is ISO string (or empty). The input shows yyyy-mm-dd.
  const dateVal = value ? new Date(value).toISOString().split("T")[0] : "";
  const hasValue = dateVal !== "";
  return (
    <input
      type="date"
      value={dateVal}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
      placeholder={placeholder}
      className={`w-full border rounded-xl px-3 py-2.5 text-sm
        focus:outline-none focus:ring-1 focus:ring-[#7B2FFF]/20 transition
        ${hasValue ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-800 focus:border-[#7B2FFF]"}`}
    />
  );
}

// ── Chip group (multi-select pills) ──────────────────────────────────────────
export function ChipGroup({ options, selected = [], onToggle, max }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const val     = typeof opt === "string" ? opt : opt.value;
        const label   = typeof opt === "string" ? opt : opt.label;
        const active  = selected.includes(val);
        const maxed   = max && !active && selected.length >= max;
        return (
          <button
            key={val}
            type="button"
            disabled={maxed}
            onClick={() => onToggle(val)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition
              ${active
                ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                : maxed
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle (boolean) ──────────────────────────────────────────────────────────
export function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition
        ${value
          ? "bg-[#f3eeff] border-[#7B2FFF] text-[#7B2FFF]"
          : "bg-white border-gray-200 text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
        }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition
        ${value ? "border-[#7B2FFF] bg-[#7B2FFF]" : "border-gray-300 bg-white"}`}>
        {value && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <div className="border-t border-gray-100 my-1" />;
}
