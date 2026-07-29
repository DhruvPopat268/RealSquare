import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";

export default function ChatbotDateInput({ placeholder, minDate, maxDate, onSubmit }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const validate = () => {
    if (!value) { setError("Please select a date."); return false; }
    if (minDate && value < minDate) { setError(`Date must be on or after ${minDate}.`); return false; }
    if (maxDate && value > maxDate) { setError(`Date must be on or before ${maxDate}.`); return false; }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(value);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          placeholder={placeholder}
          className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition
            ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#7B2FFF]"}`}
        />
        <button
          onClick={submit}
          disabled={!value}
          className="w-10 h-10 rounded-xl bg-[#7B2FFF] disabled:opacity-40 flex items-center justify-center flex-shrink-0 hover:bg-[#6320d4] transition border-none cursor-pointer"
        >
          <FiSend size={16} className="text-white" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}
