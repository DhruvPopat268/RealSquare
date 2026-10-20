import { useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ChatbotImageUpload({ onSubmit }) {
  const [images, setImages] = useState([]); // [{ file }]
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const remaining = 20 - images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining).map((file) => ({ file }));
    setImages((prev) => [...prev, ...toAdd]);
  };

  const clearAll = () => setImages([]);

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (images.length === 0) return;
    onSubmit(images.map((i) => i.file));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition select-none"
        style={{ borderColor: primaryColor }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3eeff"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <FiUploadCloud size={28} style={{ color: primaryColor }} />
        <p className="text-sm font-medium" style={{ color: primaryColor }}>
          Click or drag &amp; drop images here
        </p>
        <p className="text-xs text-gray-400">
          {images.length}/20 selected · JPG, PNG, WEBP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Selected count pill */}
      {images.length > 0 && (
        <div className="flex items-center justify-between bg-[var(--primary-color-light)] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiImage size={16} style={{ color: primaryColor }} />
            <span className="text-sm font-medium" style={{ color: primaryColor }}>
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition bg-transparent border-none cursor-pointer"
          >
            <FiX size={13} />
            Clear all
          </button>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={images.length === 0}
        className="w-full py-2.5 rounded-xl disabled:opacity-40 text-white text-sm font-semibold transition border-none cursor-pointer"
        style={{ backgroundColor: primaryColor }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.85)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
      >
        Upload {images.length > 0 ? `${images.length} Image${images.length > 1 ? "s" : ""}` : "Images"}
      </button>
    </div>
  );
}
