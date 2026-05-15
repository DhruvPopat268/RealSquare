import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Reusable image slider.
 * Props:
 *   images      – string[]  (required)
 *   className   – extra classes for the outer wrapper (e.g. "h-[200px]")
 *   imgClass    – extra classes for the <img> (default: "w-full h-full object-cover")
 *   children    – overlaid content (badges, buttons, etc.)
 */
export default function ImageSlider({ images = [], className = "", imgClass = "", children }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const prev = (e) => {
    e.stopPropagation();
    setIdx((idx - 1 + total) % total);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((idx + 1) % total);
  };

  if (!total) return null;

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img
        src={images[idx]}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-200 ${imgClass}`}
      />

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <FiChevronRight size={14} />
          </button>

          {/* dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* pass-through overlay content (badges, wishlist btn, etc.) */}
      {children}
    </div>
  );
}
