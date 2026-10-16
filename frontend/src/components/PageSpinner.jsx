import { useState, useEffect } from "react";
import { primaryColor } from "../utils/theme";


export default function PageSpinner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Outer ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#ede9fe]" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: primaryColor }}
        />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
      <p
        className="mt-4 text-sm font-semibold tracking-wide animate-pulse"
        style={{ color: primaryColor }}
      >
        Loading...
      </p>
    </div>
  );
}
