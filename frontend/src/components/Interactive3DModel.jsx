import { useEffect, useRef, useState } from "react";

export default function Interactive3DModel({ src, height = 150, alt = "Interactive 3D model" }) {
  const viewerRef = useRef(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0); // 0–100
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Reset state whenever src changes
    setError("");
    setProgress(0);
    setLoaded(false);

    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    const handleError = (event) => setError(event.detail?.type || "The browser could not render this model.");
    const handleLoad = () => { setLoaded(true); setProgress(100); };
    const handleProgress = (event) => {
      const pct = Math.round((event.detail?.totalProgress ?? 0) * 100);
      setProgress(pct);
    };

    viewer.addEventListener("error", handleError);
    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("progress", handleProgress);
    return () => {
      viewer.removeEventListener("error", handleError);
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("progress", handleProgress);
    };
  }, [src]);

  return (
    <div className="relative">
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        loading="eager"
        reveal="auto"
        touch-action="pan-y"
        environment-image="neutral"
        shadow-intensity="1"
        exposure="0.8"
        style={{ display: "block", width: "100%", height: `${height}px`, background: "#dbe3ee", border: "1px solid #cbd5e1", borderRadius: "0.5rem" }}
      />

      {/* Loading overlay — shown until model finishes loading */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-[#dbe3ee]"
          aria-label="Loading 3D model"
        >
          {/* Spinner */}
          <svg className="mb-2 h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-xs text-gray-500">Loading 3D model…</p>
          {progress > 0 && progress < 100 && (
            <div className="mt-2 w-24 overflow-hidden rounded-full bg-gray-300">
              <div
                className="h-1 rounded-full bg-[var(--primary-color)] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && <p role="alert" className="mt-1 text-xs text-red-600">3D model error: {error}</p>}
    </div>
  );
}
