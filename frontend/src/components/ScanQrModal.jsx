import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { FiCamera, FiImage, FiX } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ScanQrModal({ onClose, onProfileToken }) {
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    let mounted = true;
    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
      if (!mounted) return;
      if (result) onDecoded(result.getText());
      else if (error?.name === "NotFoundException") return;
    }).then((controls) => {
      if (mounted) controlsRef.current = controls;
      else controls.stop();
    }).catch(() => {
      if (mounted) setCameraError("Camera access is unavailable. Allow camera permission or upload a QR image instead.");
    });

    return () => {
      mounted = false;
      controlsRef.current?.stop();
      reader.reset();
    };
    // Scanner setup is intentionally started once when the modal mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDecoded = (rawValue) => {
    try {
      const parsed = new URL(rawValue, window.location.origin);
      const match = parsed.pathname.match(/^\/public-profile\/([^/]+)\/?$/);
      if (!match) throw new Error("This QR code is not a RealSquare profile QR.");
      onProfileToken(decodeURIComponent(match[1]));
    } catch (error) {
      setFileError(error.message || "This QR code could not be read.");
    }
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setFileError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Choose an image file containing a QR code.");
      return;
    }
    try {
      const objectUrl = URL.createObjectURL(file);
      try {
        const result = await readerRef.current.decodeFromImageUrl(objectUrl);
        onDecoded(result.getText());
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      setFileError("No readable QR code was found in that image.");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/55 px-4 py-6" onMouseDown={onClose}>
      <section className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <button onClick={onClose} aria-label="Close QR scanner" className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 shadow-sm">
          <FiX size={18} />
        </button>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: primaryColor }}><FiCamera size={20} /></span>
            <div>
              <h2 className="text-lg font-extrabold text-[#1a1a2e]">Scan a RealSquare QR</h2>
              <p className="text-sm text-gray-500">Scan a profile QR to open its public profile.</p>
            </div>
          </div>
          <p className="mb-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            The profile owner can open <span className="font-bold text-[#1a1a2e]">View my QR</span> from their profile menu and share it with you.
          </p>
          <video ref={videoRef} className="aspect-video w-full rounded-xl bg-gray-950 object-cover" muted playsInline />
          {cameraError && <p role="alert" className="mt-2 text-sm text-amber-700">{cameraError}</p>}
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="mb-2 font-bold text-[#1a1a2e]">How to scan</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Allow camera access when your browser asks.</li>
              <li>Hold the QR code steady inside the camera view.</li>
              <li>Or upload a saved QR image below.</li>
            </ol>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <button onClick={() => fileRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold" style={{ borderColor: primaryColor, color: primaryColor }}>
            <FiImage size={17} /> Upload QR image
          </button>
          {fileError && <p role="alert" className="mt-2 text-sm text-red-600">{fileError}</p>}
        </div>
      </section>
    </div>
  );
}
