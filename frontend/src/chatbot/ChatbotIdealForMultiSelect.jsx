import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ChatbotIdealForMultiSelect({ options = [], minSelect = 1, onSubmit }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const toggle = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {options.map((option) => {
          const active = selectedIds.includes(option._id);
          return (
            <button key={option._id} type="button" onClick={() => toggle(option._id)} className="relative flex min-h-12 items-center gap-2 rounded-xl border-2 px-2 text-left transition" style={{ borderColor: active ? primaryColor : "#e5e7eb" }}>
              <img src={option.image} alt={option.name} className="h-10 w-[50px] shrink-0 rounded bg-gray-100 object-contain" />
              <span className="text-sm font-medium" style={{ color: active ? primaryColor : "#4b5563" }}>{option.name}</span>
              {active && <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: primaryColor }}><FiCheck size={12} /></span>}
            </button>
          );
        })}
      </div>
      <button type="button" disabled={selectedIds.length < minSelect} onClick={() => onSubmit(options.filter((option) => selectedIds.includes(option._id)))} className="ml-auto block rounded-xl px-5 py-2 text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: primaryColor }}>Confirm</button>
    </div>
  );
}
