import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import "./ContactFlow.css";

export default function ContactFlow({ onClose }) {
  const [step, setStep] = useState(1); // 1=details, 2=otp, 3=thanks
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

  const handleSubmit = () => {
    if (validateDetails()) setStep(2);
  };

  const handleVerify = () => {
    if (otp.trim().length < 4) {
      setErrors({ otp: "Enter the OTP sent to your phone" });
      return;
    }
    setErrors({});
    setStep(3);
  };

  return (
    <div className="cf-overlay" onMouseDown={onClose}>
      <div className="cf-box" onMouseDown={(e) => e.stopPropagation()}>
        <button className="cf-close" onClick={onClose}><FiX size={20} /></button>

        {/* Step indicators */}
        {step < 3 && (
          <div className="cf-steps">
            {["Details", "Verify OTP", "Done"].map((label, i) => (
              <div key={i} className={`cf-step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                <div className="cf-step-dot">{step > i + 1 ? <FiCheck size={11} /> : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <>
            <div className="cf-body">
              <h3>Please share your details</h3>
              <p>Our team will reach out to you shortly</p>
              <div className="cf-fields">
                <div className="cf-field-wrap">
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <span className="cf-error">{errors.name}</span>}
                </div>
                <div className="cf-field-wrap">
                  <div className="cf-phone-row">
                    <span className="cf-code">+91</span>
                    <input
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <span className="cf-error">{errors.phone}</span>}
                </div>
                <div className="cf-field-wrap">
                  <input
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                  {errors.email && <span className="cf-error">{errors.email}</span>}
                </div>
              </div>
            </div>
            <button className="cf-cta" onClick={handleSubmit}>Submit &amp; Get OTP</button>
          </>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <>
            <div className="cf-body">
              <h3>Verify OTP</h3>
              <p>We've sent a 6-digit OTP to <strong>+91 {phone}</strong></p>
              <div className="cf-fields">
                <div className="cf-field-wrap">
                  <input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="number"
                    maxLength={6}
                    className="cf-otp-input"
                  />
                  {errors.otp && <span className="cf-error">{errors.otp}</span>}
                </div>
              </div>
              <button className="cf-resend" onClick={() => {}}>Resend OTP</button>
            </div>
            <button className="cf-cta" onClick={handleVerify}>Verify</button>
          </>
        )}

        {/* Step 3 — Thank you */}
        {step === 3 && (
          <div className="cf-thanks">
            <div className="cf-thanks-icon"><FiCheck size={32} /></div>
            <h3>Thank you for showing your interest!</h3>
            <p>Our team will reach out to you on <strong>+91 {phone}</strong> shortly.</p>
            <button className="cf-cta cf-cta-done" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
