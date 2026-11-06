import { useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ProfileQrModal({ qrUrl, name, onClose }) {
  const [error, setError] = useState("");

  const downloadQr = async () => {
    try {
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error("Download failed");
      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "realsquare-profile-qr.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      setError("Could not download the QR image. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/55 px-4 py-6" onMouseDown={onClose}>
      <section className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <button onClick={onClose} aria-label="Close profile QR" className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500"><FiX size={17} /></button>
        <h2 className="pr-7 text-left text-lg font-extrabold text-[#1a1a2e]">Your profile QR</h2>
        <p className="mt-1 text-left text-sm text-gray-500">Share this QR to let others view {name || "your"} public profile.</p>
        <div className="mx-auto my-5 flex w-fit items-center justify-center rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <img src={qrUrl} alt={`${name || "Your"} profile QR code`} className="h-64 w-64 object-contain" />
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
        <button onClick={downloadQr} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
          <FiDownload size={17} /> Download QR
        </button>
      </section>
    </div>
  );
}
