import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BASE_URL = import.meta.env.VITE_API_URL;

const STEPS = { MOBILE: "mobile", OTP: "otp" };

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(STEPS.MOBILE);
  const firstOtpRef = useRef();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Step 1: Mobile ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setErrors({});
    if (!/^\d{10}$/.test(mobile)) {
      setErrors({ mobile: "Enter a valid 10-digit number" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/system-users/send-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep(STEPS.OTP);
      setTimeout(() => firstOtpRef.current?.focus(), 50);
    } catch (err) {
      setErrors({ mobile: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP ─────────────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(digits.length - 1, 5)}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleVerifyOtp = async () => {
    setErrors({});
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setErrors({ otp: "Enter the complete 6-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/system-users/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      await fetch(`${BASE_URL}/api/system-users/me`, { credentials: "include" });
      if (data.data.isNew) {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get("returnTo") || "/";
        navigate(`/complete-profile?returnTo=${encodeURIComponent(returnTo)}`, { state: { mobile } });
      } else {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get("returnTo") || "/";
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[420px] p-8">

          {/* ── MOBILE STEP ── */}
          {step === STEPS.MOBILE && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a2e]">Login / Sign Up</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Enter your mobile number to continue</p>
                </div>
              </div>

              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition mb-1">
                <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="flex-1 px-3 py-3 text-sm outline-none"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-500 mb-3">{errors.mobile}</p>}

              <p className="text-xs text-gray-400 mb-5">
                By continuing, you agree to our <span className="text-[#7B2FFF] cursor-pointer">Terms</span> &amp; <span className="text-[#7B2FFF] cursor-pointer">Privacy Policy</span>
              </p>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : <> Send OTP <FiArrowRight size={15} /> </>}
              </button>
            </>
          )}

          {/* ── OTP STEP ── */}
          {step === STEPS.OTP && (
            <>
              <button onClick={() => setStep(STEPS.MOBILE)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 mb-5 flex items-center gap-1.5 text-sm">
                <FiArrowLeft size={16} /> Back
              </button>

              <h2 className="text-xl font-extrabold text-[#1a1a2e] mb-1">Verify OTP</h2>
              <p className="text-sm text-gray-400 mb-6">
                Sent to <span className="font-semibold text-[#1a1a2e]">+91 {mobile}</span>
              </p>

              <div className="flex gap-2 justify-between mb-2">
                {otp.map((val, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    ref={idx === 0 ? firstOtpRef : null}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handleOtpPaste}
                    className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition ${
                        errors.otp
                          ? "border-red-400"
                          : val
                          ? "border-[#7B2FFF]"
                          : "border-gray-300"
                      }`}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-red-500 mb-3">{errors.otp}</p>}

              <p className="text-xs text-gray-400 mb-5">
                Didn't receive?{" "}
                <button className="text-[#7B2FFF] font-semibold bg-transparent border-none cursor-pointer p-0" onClick={() => setOtp(["", "", "", "", "", ""])}>
                  Resend OTP
                </button>
              </p>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </>
          )}


        </div>
      </div>
      <Footer />
    </>
  );
}
