import { useState } from "react";
import { FiCheck } from "react-icons/fi";

export default function ChatbotMultiSelect({ options, minSelect = 1, onSubmit }) {
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition cursor-pointer
                ${active
                  ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                }`}
            >
              {active && <FiCheck size={11} className="inline mr-1 -mt-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => canConfirm && onSubmit(selected.join(", "))}
        disabled={!canConfirm}
        className="self-end px-5 py-2 rounded-xl bg-[#7B2FFF] disabled:opacity-40 text-white text-sm font-medium transition hover:bg-[#6320d4] cursor-pointer border-none"
      >
        Confirm
      </button>
    </div>
  );
}
