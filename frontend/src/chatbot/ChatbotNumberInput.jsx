import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";

export default function ChatbotNumberInput({ placeholder, min = 0, allowZero = false, onSubmit }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setValue(val);
      setError("");
    }
  };

  const validate = () => {
    if (!value.trim()) { setError("This field is required."); return false; }
    const num = Number(value);
    if (isNaN(num)) { setError("Please enter a valid number."); return false; }
    if (!allowZero && num <= min) { setError(`Value must be greater than ${min}.`); return false; }
    if (allowZero && num < min) { setError(`Value must be at least ${min}.`); return false; }
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
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder ?? "Enter a number..."}
          className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition
            ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#7B2FFF]"}`}
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="w-10 h-10 rounded-xl bg-[#7B2FFF] disabled:opacity-40 flex items-center justify-center flex-shrink-0 hover:bg-[#6320d4] transition border-none cursor-pointer"
        >
          <FiSend size={16} className="text-white" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}
