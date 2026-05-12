import { useEffect, useState } from "react";
import { FiHeart, FiX } from "react-icons/fi";

export function useWishlistToast() {
  const [toast, setToast] = useState(null); // { saved: bool, title: string } | null

  const showToast = (saved, title) => {
    setToast({ saved, title });
  };

  return { toast, showToast, setToast };
}

export default function WishlistToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-fadeUp"
      style={{
        background: toast.saved ? "#fff" : "#fff",
        borderColor: toast.saved ? "#f9a8d4" : "#e5e7eb",
        minWidth: 260,
        maxWidth: 360,
      }}
    >
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: toast.saved ? "#fdf2f8" : "#f3f4f6" }}
      >
        <FiHeart
          size={15}
          className={toast.saved ? "text-red-500 fill-red-500" : "text-gray-400"}
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className={toast.saved ? "text-gray-900" : "text-gray-500"}>
          {toast.saved ? "Property saved!" : "Removed from saved"}
        </p>
        {toast.title && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{toast.title}</p>
        )}
      </div>
      <button onClick={onClose} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
        <FiX size={14} />
      </button>
    </div>
  );
}
