import { useRef, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailVerificationField({
  value,
  onChange,
  verifiedEmail,
  onVerified,
  error,
  placeholder = "your@email.com",
}) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [actionError, setActionError] = useState("");
  const emailInputRef = useRef(null);
  const normalizedEmail = (value || "").trim().toLowerCase();
  const isVerified = Boolean(normalizedEmail && normalizedEmail === verifiedEmail);

  const sendOtp = async (openModal = true, targetEmail = normalizedEmail) => {
    setActionError("");
    if (!EMAIL_REGEX.test(targetEmail)) {
      setActionError("Enter a valid email address first.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${BASE_URL}/api/system-users/send-email-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Could not send verification code");
      }
      if (result.verified === true) {
        onVerified(targetEmail);
        setShowOtpModal(false);
        return;
      }
      setOtp("");
      setOtpEmail(targetEmail);
      if (openModal) setShowOtpModal(true);
    } catch (err) {
      setActionError(err.message || "Could not send verification code");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setActionError("");
    if (!/^\d{6}$/.test(otp)) {
      setActionError("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`${BASE_URL}/api/system-users/verify-email-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || result.verified !== true) {
        throw new Error(result.message || "Email verification failed");
      }
      onVerified((result.email || otpEmail).trim().toLowerCase());
      setShowOtpModal(false);
      setOtp("");
    } catch (err) {
      setActionError(err.message || "Email verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
    setActionError("");
  };

  const changeEmail = () => {
    closeOtpModal();
    requestAnimationFrame(() => emailInputRef.current?.focus());
  };

  return (
    <>
      <div className="flex gap-2">
        <input
          ref={emailInputRef}
          type="email"
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition"
        />
        {isVerified ? (
          <span className="flex shrink-0 items-center rounded-xl bg-green-50 px-3 text-xs font-semibold text-green-700">Verified</span>
        ) : (
          <button
            type="button"
            onClick={() => sendOtp(true)}
            disabled={sending || !normalizedEmail}
            className="shrink-0 rounded-xl border border-[#7B2FFF] px-3 text-sm font-semibold text-[#7B2FFF] transition hover:bg-[#f5f0ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Verify"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {actionError && !showOtpModal && <p role="alert" className="mt-1 text-xs text-red-500">{actionError}</p>}

      {showOtpModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[#1a1a2e]">Verify your email</h3>
              <button
                type="button"
                onClick={closeOtpModal}
                aria-label="Close email verification"
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{otpEmail}</span>{" "}
              <button type="button" onClick={changeEmail} disabled={sending || verifying} className="font-semibold text-[#7B2FFF] hover:underline disabled:opacity-50">
                Change
              </button>
              .
            </p>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(event) => { if (event.key === "Enter") verifyOtp(); }}
              placeholder="6-digit code"
              className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-[#7B2FFF]"
            />
            {actionError && <p role="alert" className="mt-2 text-xs text-red-500">{actionError}</p>}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => sendOtp(false, otpEmail)} disabled={sending || verifying} className="text-sm font-medium text-[#7B2FFF] disabled:opacity-50">
                {sending ? "Sending..." : "Resend code"}
              </button>
              <button type="button" onClick={verifyOtp} disabled={verifying || sending} className="rounded-xl bg-[#7B2FFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6320d4] disabled:opacity-50">
                {verifying ? "Verifying..." : "Verify email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
