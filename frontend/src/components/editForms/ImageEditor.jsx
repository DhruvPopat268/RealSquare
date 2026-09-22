/**
 * ImageEditor.jsx
 * Manages the property image list:
 *  - Shows existing images in a reorderable grid (drag-and-drop via mouse & touch)
 *  - Each image has a delete (×) button
 *  - An upload button adds new images from disk
 *  - First image (existing or new) is always labelled "Cover"
 *  - Can select new images as cover
 *
 * Props:
 *   images        {string[]}  — current ordered list of image URLs
 *   onChange      {(string[]) => void} — called whenever the list changes (reorder/delete)
 *   newFiles      {File[]}    — queued new uploads (not yet sent to server)
 *   onNewFiles    {(File[]) => void}   — called when user picks new files
 *   onRemoveNew   {(index: number) => void} — remove a queued file before upload
 *   onNewFilesReorder {(File[]) => void} — called when new files are reordered
 *   disabled      {boolean}
 */
import { useState, useRef, useCallback } from "react";
import { FiUpload, FiX, FiImage, FiMove } from "react-icons/fi";

export default function ImageEditor({
  images = [],
  onChange,
  newFiles = [],
  onNewFiles,
  onRemoveNew,
  onNewFilesReorder,
  disabled = false,
}) {
  // ── Drag-and-drop state ───────────────────────────────────────────────────
  const dragIndex = useRef(null);
  const dragType = useRef(null); // 'existing' or 'new'
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (i, type) => {
    dragIndex.current = i;
    dragType.current = type;
  };

  const handleDragEnter = (i, type) => {
    if (dragIndex.current !== i || dragType.current !== type) {
      setDragOver({ i, type });
    }
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    dragType.current = null;
    setDragOver(null);
  };

  const handleDrop = (targetIndex, type) => {
    if (
      dragIndex.current === null ||
      dragType.current === null ||
      (dragIndex.current === targetIndex && dragType.current === type)
    ) {
      setDragOver(null);
      return;
    }

    // If dragging within new files
    if (dragType.current === "new" && type === "new") {
      const reordered = [...newFiles];
      const [moved] = reordered.splice(dragIndex.current, 1);
      reordered.splice(targetIndex, 0, moved);
      dragIndex.current = null;
      dragType.current = null;
      setDragOver(null);
      onNewFilesReorder?.(reordered);
    }
    // If dragging within existing images
    else if (dragType.current === "existing" && type === "existing") {
      const reordered = [...images];
      const [moved] = reordered.splice(dragIndex.current, 1);
      reordered.splice(targetIndex, 0, moved);
      dragIndex.current = null;
      dragType.current = null;
      setDragOver(null);
      onChange(reordered);
    }
    // Cross-type drag not allowed
  };

  // ── Delete existing image ─────────────────────────────────────────────────
  const handleDelete = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  // ── File picker ───────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onNewFiles(files);
    e.target.value = "";
  };

  const totalImages = images.length + newFiles.length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Existing images grid ─────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              data-img-idx={i}
              draggable={!disabled}
              onDragStart={() => handleDragStart(i, "existing")}
              onDragEnter={() => handleDragEnter(i, "existing")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i, "existing")}
              onDragEnd={handleDragEnd}
              className={`relative rounded-xl overflow-hidden border-2 transition group cursor-grab active:cursor-grabbing select-none
                ${dragOver?.i === i && dragOver?.type === "existing"
                  ? "border-[#7B2FFF] scale-95 opacity-70"
                  : "border-transparent hover:border-[#7B2FFF]/40"
                }`}
            >
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-28 object-cover pointer-events-none"
                draggable={false}
              />

              {/* Cover badge - existing image is cover only if it's first and no new files queued */}
              {i === 0 && newFiles.length === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-[#7B2FFF] text-white px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}

              {/* Drag handle hint */}
              <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition">
                <FiMove size={13} className="text-white drop-shadow" />
              </div>

              {/* Delete button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                >
                  <FiX size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Queued new files (not yet uploaded) ──────────────────────────── */}
      {newFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
            Queued for upload ({newFiles.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {newFiles.map((file, i) => (
              <div
                key={i}
                data-new-idx={i}
                draggable={!disabled}
                onDragStart={() => handleDragStart(i, "new")}
                onDragEnter={() => handleDragEnter(i, "new")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i, "new")}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl overflow-hidden border-2 transition group cursor-grab active:cursor-grabbing
                  ${dragOver?.i === i && dragOver?.type === "new"
                    ? "border-[#7B2FFF] scale-95 opacity-70"
                    : "border-amber-300"
                  }`}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-28 object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Cover badge - new image is cover if it's first in new files */}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-[#7B2FFF] text-white px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                )}

                {/* Drag handle hint */}
                <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition">
                  <FiMove size={13} className="text-white drop-shadow" />
                </div>

                {/* Delete button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveNew(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                  >
                    <FiX size={11} />
                  </button>
                )}

                <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
                  New
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {totalImages === 0 && (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl gap-2 text-gray-400">
          <FiImage size={28} />
          <p className="text-sm font-medium">No images yet</p>
          <p className="text-xs">Upload images to showcase your property</p>
        </div>
      )}

      {/* ── Upload button ─────────────────────────────────────────────────── */}
      {!disabled && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#7B2FFF] text-[#7B2FFF] rounded-xl text-sm font-semibold hover:bg-[#f5f0ff] transition"
          >
            <FiUpload size={14} />
            Add Photos
          </button>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Drag images to reorder · First image is the cover · Max 5 MB each · JPEG / PNG / WebP
          </p>
        </div>
      )}
    </div>
  );
}
