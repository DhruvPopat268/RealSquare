import { useEffect, useRef, useState } from "react";

export default function Interactive3DModel({ src, height = 150, alt = "Interactive 3D model" }) {
  const viewerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;
    const handleError = (event) => setError(event.detail?.type || "The browser could not render this model.");
    const handleLoad = () => setError("");
    viewer.addEventListener("error", handleError);
    viewer.addEventListener("load", handleLoad);
    return () => {
      viewer.removeEventListener("error", handleError);
      viewer.removeEventListener("load", handleLoad);
    };
  }, [src]);

  return (
    <div>
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
      {error && <p role="alert" className="mt-1 text-xs text-red-600">3D model error: {error}</p>}
    </div>
  );
}
