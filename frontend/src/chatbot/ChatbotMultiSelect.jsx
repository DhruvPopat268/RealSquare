import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ChatbotMultiSelect({ options, minSelect = 1, onSubmit, returnArray = false }) {
  const [selected, setSelected] = useState([]);

  const toggle = (opt) =>
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );

  const canConfirm = selected.length >= minSelect;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition cursor-pointer"
              style={active
                ? { backgroundColor: primaryColor, borderColor: primaryColor, color: "white" }
                : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#4b5563" }
              }
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.color = primaryColor; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#4b5563"; }}}
            >
              {active && <FiCheck size={11} className="inline mr-1 -mt-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => canConfirm && onSubmit(returnArray ? selected : selected.join(", "))}
        disabled={!canConfirm}
        className="self-end px-5 py-2 rounded-xl disabled:opacity-40 text-white text-sm font-medium transition cursor-pointer border-none"
        style={{ backgroundColor: primaryColor }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.85)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
      >
        Confirm
      </button>
    </div>
  );
}
