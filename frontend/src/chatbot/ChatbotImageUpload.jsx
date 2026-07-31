import { useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";

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
        className="border-2 border-dashed border-[#7B2FFF] rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#f3eeff] transition select-none"
      >
        <FiUploadCloud size={28} className="text-[#7B2FFF]" />
        <p className="text-sm text-[#7B2FFF] font-medium">
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
        <div className="flex items-center justify-between bg-[#f3eeff] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiImage size={16} className="text-[#7B2FFF]" />
            <span className="text-sm font-medium text-[#7B2FFF]">
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
        className="w-full py-2.5 rounded-xl bg-[#7B2FFF] disabled:opacity-40 text-white text-sm font-semibold hover:bg-[#6320d4] transition border-none cursor-pointer"
      >
        Upload {images.length > 0 ? `${images.length} Image${images.length > 1 ? "s" : ""}` : "Images"}
      </button>
    </div>
  );
}
