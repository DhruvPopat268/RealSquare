import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";

const STEPS = ["Details", "Verify OTP", "Done"];

export default function ContactFlow({ onClose }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  const validateDetails = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit number";
    if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => { if (validateDetails()) setStep(2); };

  const handleVerify = () => {
    if (otp.trim().length < 4) { setErrors({ otp: "Enter the OTP sent to your phone" }); return; }
    setErrors({});
    setStep(3);
  };

  const inputCls = "w-full border-[1.5px] border-[#e8e8e8] rounded-lg px-3.5 py-3 text-sm text-[#333] bg-[#fafafa] outline-none focus:border-[#7B2FFF] focus:bg-white transition-colors";

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-5"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-[#888] hover:text-[#111] transition-colors z-10"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        {/* Step indicators */}
        {step < 3 && (
          <div className="flex items-center justify-center px-6 pt-6">
            {STEPS.map((label, i) => {
              const isActive = step === i + 1;
              const isDone = step > i + 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative text-[11px] font-semibold">
                  {/* connector line */}
                  {i < STEPS.length - 1 && (
                    <span className={`absolute top-[13px] left-1/2 w-full h-0.5 z-0 ${isDone ? "bg-emerald-500" : "bg-[#e8e8e8]"}`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all
                    ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#7B2FFF] text-white" : "bg-[#e8e8e8] text-[#aaa]"}`}>
                    {isDone ? <FiCheck size={11} /> : i + 1}
                  </div>
                  <span className={isDone ? "text-emerald-500" : isActive ? "text-[#7B2FFF]" : "text-[#bbb]"}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-extrabold text-[#111] mb-1.5">Please share your details</h3>
              <p className="text-[13px] text-[#888] mb-5">Our team will reach out to you shortly</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <input className={inputCls} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  {errors.name && <span className="text-[11px] text-red-500 font-medium">{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center border-[1.5px] border-[#e8e8e8] rounded-lg overflow-hidden bg-[#fafafa] focus-within:border-[#7B2FFF] focus-within:bg-white transition-colors">
                    <span className="px-3 py-3 text-sm font-semibold text-[#333] border-r border-[#e8e8e8] bg-[#f0f0f0] whitespace-nowrap">+91</span>
                    <input className="flex-1 border-none bg-transparent outline-none px-3 py-3 text-sm text-[#333]" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" maxLength={10} />
                  </div>
                  {errors.phone && <span className="text-[11px] text-red-500 font-medium">{errors.phone}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <input className={inputCls} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  {errors.email && <span className="text-[11px] text-red-500 font-medium">{errors.email}</span>}
                </div>
              </div>
            </div>
            <button className="block w-full py-4 bg-[#7B2FFF] hover:bg-[#5a1fd1] text-white text-[15px] font-bold border-none cursor-pointer transition-colors mt-4" onClick={handleSubmit}>
              Submit &amp; Get OTP
            </button>
          </>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-extrabold text-[#111] mb-1.5">Verify OTP</h3>
              <p className="text-[13px] text-[#888] mb-5">We've sent a 6-digit OTP to <strong>+91 {phone}</strong></p>
              <div className="flex flex-col gap-1">
                <input
                  className={`${inputCls} text-center text-[22px] font-bold tracking-[8px]`}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="number"
                  maxLength={6}
                />
                {errors.otp && <span className="text-[11px] text-red-500 font-medium">{errors.otp}</span>}
              </div>
              <button className="bg-transparent border-none text-[#7B2FFF] text-[13px] font-semibold cursor-pointer pt-3 underline" onClick={() => {}}>
                Resend OTP
              </button>
            </div>
            <button className="block w-full py-4 bg-[#7B2FFF] hover:bg-[#5a1fd1] text-white text-[15px] font-bold border-none cursor-pointer transition-colors mt-4" onClick={handleVerify}>
              Verify
            </button>
          </>
        )}

        {/* Step 3 — Thank you */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center px-7 py-10 gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <FiCheck size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-[#111] leading-snug">Thank you for showing your interest!</h3>
            <p className="text-[14px] text-[#666]">Our team will reach out to you on <strong>+91 {phone}</strong> shortly.</p>
            <button className="mt-2 px-10 py-3 bg-[#7B2FFF] hover:bg-[#5a1fd1] text-white text-[15px] font-bold rounded-lg border-none cursor-pointer transition-colors" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
