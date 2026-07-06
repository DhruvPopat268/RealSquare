import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCamera, FiImage, FiRefreshCw, FiAlertTriangle, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PlacesAutocomplete from "../components/PlacesAutocomplete";

async function geocode(name) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(name)}&key=${apiKey}`
  );
  const data = await res.json();
  if (data.status === "OK" && data.results[0]) {
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  }
  return null;
}

const BASE_URL = import.meta.env.VITE_API_URL;

const OWNER_BUSINESS_TYPES = [
  { value: "private_owner", label: "Private Owner" },
  { value: "real_estate_investment_trust", label: "Real Estate Investment Trust" },
  { value: "property_management_group", label: "Property Management Group" },
  { value: "family_office", label: "Family Office" },
];

// ── Shared UI components ──────────────────────────────────────────────────────

function InputField({ label, required, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", prefix, maxLength, readOnly }) {
  if (prefix) {
    return (
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
        <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">{prefix}</span>
        <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="flex-1 px-3 py-3 text-sm outline-none"
        />
      </div>
    );
  }
  return (
    <input
      type={type}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition ${readOnly ? "bg-gray-50 text-gray-400" : ""}`}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition bg-white appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition resize-none"
    />
  );
}

function PhotoUpload({ label, value, onChange, shape = "circle", icon: Icon = FiCamera }) {
  const ref = useRef();
  const isCircle = shape === "circle";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url, file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => ref.current.click()}
        className={`relative group bg-gray-100 hover:bg-[#f0ebff] border-2 border-dashed border-gray-300 hover:border-[#7B2FFF] transition overflow-hidden flex items-center justify-center ${
          isCircle ? "w-20 h-20 rounded-full" : "w-24 h-20 rounded-xl"
        }`}
      >
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <Icon size={22} className="text-gray-400 group-hover:text-[#7B2FFF] transition" />
        )}
        {value && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Icon size={18} className="text-white" />
          </div>
        )}
      </button>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

// ── Role-specific field sets ──────────────────────────────────────────────────

function CustomerFields({ form, setForm, errors, mobile, onChangeMobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhoto} onChange={(url, file) => setForm((p) => ({ ...p, profilePhoto: url, profilePhotoFile: file }))} />
      </div>
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
          <span className="flex-1 px-3 py-3 text-sm text-gray-400">{mobile}</span>
          <button type="button" onClick={onChangeMobile} className="px-3 text-xs font-semibold text-[#7B2FFF] bg-transparent border-none cursor-pointer hover:underline">Change</button>
        </div>
      </InputField>
      <InputField label="Email" error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="Location" error={errors.location}>
        <PlacesAutocomplete value={form.location || ""} onChange={(val) => setForm((p) => ({ ...p, location: val }))} placeholder="City or area you're looking in" />
      </InputField>
      <InputField label="Bio" error={errors.bio}>
        <TextareaInput value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us a bit about yourself (optional)" />
      </InputField>
    </>
  );
}

function OwnerFields({ form, setForm, errors, mobile, onChangeMobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhoto} onChange={(url, file) => setForm((p) => ({ ...p, profilePhoto: url, profilePhotoFile: file }))} />
      </div>
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
          <span className="flex-1 px-3 py-3 text-sm text-gray-400">{mobile}</span>
          <button type="button" onClick={onChangeMobile} className="px-3 text-xs font-semibold text-[#7B2FFF] bg-transparent border-none cursor-pointer hover:underline">Change</button>
        </div>
      </InputField>
      <InputField label="Email" error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>

      <div className="border-t border-gray-100 pt-4 mt-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Business Details <span className="normal-case font-normal">(optional)</span></p>
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <PhotoUpload label="Company Logo" value={form.bizLogo} onChange={(url, file) => setForm((p) => ({ ...p, bizLogo: url, bizLogoFile: file }))} shape="square" icon={FiImage} />
          </div>
          <InputField label="Business Name" error={errors.bizName}>
            <TextInput value={form.bizName} onChange={(e) => setForm((p) => ({ ...p, bizName: e.target.value }))} placeholder="Your business / firm name" />
          </InputField>
          <InputField label="Business Type" error={errors.bizType}>
            <SelectInput value={form.bizType} onChange={(e) => setForm((p) => ({ ...p, bizType: e.target.value }))} options={OWNER_BUSINESS_TYPES} placeholder="Select business type" />
          </InputField>
          <InputField label="GST Number" error={errors.gstNumber}>
            <TextInput value={form.gstNumber} onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" />
          </InputField>
          <InputField label="Business Email" error={errors.bizEmail}>
            <TextInput type="email" value={form.bizEmail} onChange={(e) => setForm((p) => ({ ...p, bizEmail: e.target.value }))} placeholder="business@email.com" />
          </InputField>
          <InputField label="Business Mobile" error={errors.bizMobile}>
            <TextInput value={form.bizMobile} onChange={(e) => setForm((p) => ({ ...p, bizMobile: e.target.value.replace(/\D/, "") }))} placeholder="Business contact number" prefix="+91" maxLength={10} />
          </InputField>
          <InputField label="Website" error={errors.website}>
            <TextInput value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
          </InputField>
        </div>
      </div>
    </>
  );
}

function BrokerFields({ form, setForm, errors, mobile, onChangeMobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhoto} onChange={(url, file) => setForm((p) => ({ ...p, profilePhoto: url, profilePhotoFile: file }))} />
      </div>
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
          <span className="flex-1 px-3 py-3 text-sm text-gray-400">{mobile}</span>
          <button type="button" onClick={onChangeMobile} className="px-3 text-xs font-semibold text-[#7B2FFF] bg-transparent border-none cursor-pointer hover:underline">Change</button>
        </div>
      </InputField>
      <InputField label="Email" error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="Agency Name" error={errors.agencyName}>
        <TextInput value={form.agencyName} onChange={(e) => setForm((p) => ({ ...p, agencyName: e.target.value }))} placeholder="Your agency or firm name" />
      </InputField>
      <InputField label="Years of Experience" error={errors.yearsOfExperience}>
        <TextInput type="number" value={form.yearsOfExperience} onChange={(e) => setForm((p) => ({ ...p, yearsOfExperience: e.target.value }))} placeholder="e.g. 5" />
      </InputField>
      <InputField label="Bio" error={errors.bio}>
        <TextareaInput value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Brief professional summary (optional)" />
      </InputField>
    </>
  );
}

function BuilderFields({ form, setForm, errors, mobile, onChangeMobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhoto} onChange={(url, file) => setForm((p) => ({ ...p, profilePhoto: url, profilePhotoFile: file }))} />
      </div>
      <InputField label="Company / Builder Name" required error={errors.name}>
        <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your company name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
          <span className="flex-1 px-3 py-3 text-sm text-gray-400">{mobile}</span>
          <button type="button" onClick={onChangeMobile} className="px-3 text-xs font-semibold text-[#7B2FFF] bg-transparent border-none cursor-pointer hover:underline">Change</button>
        </div>
      </InputField>
      <InputField label="Email" error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="GST Number" error={errors.gstNumber}>
        <TextInput value={form.gstNumber} onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" />
      </InputField>
      <InputField label="CIN Number" error={errors.cinNumber}>
        <TextInput value={form.cinNumber} onChange={(e) => setForm((p) => ({ ...p, cinNumber: e.target.value }))} placeholder="Corporate Identification Number" />
      </InputField>
      <InputField label="Founded Year" error={errors.foundedYear}>
        <TextInput type="number" value={form.foundedYear} onChange={(e) => setForm((p) => ({ ...p, foundedYear: e.target.value }))} placeholder="e.g. 2005" />
      </InputField>
      <InputField label="Total Projects Delivered" error={errors.totalProjectsDelivered}>
        <TextInput type="number" value={form.totalProjectsDelivered} onChange={(e) => setForm((p) => ({ ...p, totalProjectsDelivered: e.target.value }))} placeholder="e.g. 12" />
      </InputField>
      <InputField label="Location / HQ City" error={errors.location}>
        <PlacesAutocomplete value={form.location || ""} onChange={(val) => setForm((p) => ({ ...p, location: val }))} placeholder="City where your HQ is based" />
      </InputField>
    </>
  );
}

// ── Derive role key from /me response ─────────────────────────────────────────

function detectRole(user) {
  const roleName = user?.role?.name?.toLowerCase() || "";
  if (roleName.includes("owner")) return "owner";
  if (roleName.includes("broker") || roleName.includes("agent")) return "broker";
  if (roleName.includes("builder") || roleName.includes("developer")) return "builder";
  if (roleName.includes("customer")) return "customer";
  // fallback: check which sub-profile exists
  if (user?.ownerProfile) return "owner";
  if (user?.brokerProfile) return "broker";
  if (user?.builderProfile) return "builder";
  return "customer";
}

function buildFormFromUser(user, role) {
  if (role === "owner") {
    const p = user.ownerProfile || {};
    const b = p.businessDetails || {};
    return {
      fullName: p.fullName || "", email: p.email || "", profilePhoto: p.profilePhoto || "",
      bizLogo: b.logo || "", bizName: b.name || "", bizType: b.type || "",
      gstNumber: b.gstNumber || "", bizEmail: b.email || "", bizMobile: b.mobile || "", website: b.website || "",
    };
  }
  if (role === "broker") {
    const p = user.brokerProfile || {};
    return {
      fullName: p.fullName || "", email: p.email || "", profilePhoto: p.profilePhoto || "",
      agencyName: p.agencyName || "", yearsOfExperience: p.yearsOfExperience ?? "", bio: p.bio || "",
    };
  }
  if (role === "builder") {
    const p = user.builderProfile || {};
    return {
      name: p.name || "", email: p.email || "", profilePhoto: p.profilePhoto || "",
      gstNumber: p.gstNumber || "", cinNumber: p.cinNumber || "",
      foundedYear: p.foundedYear ?? "", totalProjectsDelivered: p.totalProjectsDelivered ?? "",
      location: p.location?.name || "",
    };
  }
  // customer
  const p = user.customerProfile || {};
  return {
    fullName: p.fullName || "", email: p.email || "", profilePhoto: p.profilePhoto || "",
    location: p.location?.name || "", bio: p.bio || "",
  };
}

// ── Change Mobile Modal ──────────────────────────────────────────────────────

const MOBILE_STEPS = { INPUT: "input", OTP: "otp" };

function ChangeMobileModal({ oldMobile, onCancel, onSuccess }) {
  const [step, setStep] = useState(MOBILE_STEPS.INPUT);
  const [newMobile, setNewMobile] = useState("");
  const [oldOtp, setOldOtp] = useState(["", "", "", "", "", ""]);
  const [newOtp, setNewOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const firstOldOtpRef = useRef();

  const handleSendOtp = async () => {
    setError("");
    if (!/^\d{10}$/.test(newMobile)) { setError("Enter a valid 10-digit number"); return; }
    if (newMobile === oldMobile) { setError("New number must be different from current"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/system-users/send-change-mobile-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep(MOBILE_STEPS.OTP);
      setTimeout(() => firstOldOtpRef.current?.focus(), 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx, setter, prefix) => {
    if (!/^\d?$/.test(val)) return;
    setter((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    if (val && idx < 5) setTimeout(() => document.getElementById(`${prefix}-otp-${idx + 1}`)?.focus(), 0);
  };

  const handleOtpKeyDown = (e, idx, setter, prefix) => {
    if (e.key === "Backspace" && !e.target.value && idx > 0)
      document.getElementById(`${prefix}-otp-${idx - 1}`)?.focus();
  };

  const handleOtpPaste = (e, setter, prefix) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setter(next);
    document.getElementById(`${prefix}-otp-${Math.min(digits.length - 1, 5)}`)?.focus();
  };

  const handleVerify = async () => {
    setError("");
    if (oldOtp.join("").length < 6 || newOtp.join("").length < 6) {
      setError("Enter both 6-digit OTPs"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/system-users/verify-change-mobile-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMobile, oldOtp: oldOtp.join(""), newOtp: newOtp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      onSuccess(newMobile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const OtpRow = ({ label, otp, setter, prefix }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex gap-2 justify-between">
        {otp.map((val, idx) => (
          <input
            key={idx}
            id={`${prefix}-otp-${idx}`}
            ref={prefix === "old" && idx === 0 ? firstOldOtpRef : null}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleOtpChange(e.target.value, idx, setter, prefix)}
            onKeyDown={(e) => handleOtpKeyDown(e, idx, setter, prefix)}
            onPaste={(e) => handleOtpPaste(e, setter, prefix)}
            className={`w-10 h-11 text-center text-lg font-bold border-2 rounded-xl outline-none transition ${val ? "border-[#7B2FFF]" : "border-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.18)] w-full max-w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
          <FiX size={18} />
        </button>

        <h3 className="text-base font-extrabold text-[#1a1a2e] mb-1">Change Mobile Number</h3>

        {step === MOBILE_STEPS.INPUT && (
          <>
            <p className="text-xs text-gray-400 mb-4">Enter your new mobile number. OTP will be sent to both old (+91 {oldMobile}) and new number.</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition mb-1">
              <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3 bg-gray-50">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="New mobile number"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value.replace(/\D/, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="flex-1 px-3 py-3 text-sm outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 bg-transparent cursor-pointer transition">
                Cancel
              </button>
              <button onClick={handleSendOtp} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white text-sm font-semibold cursor-pointer transition border-none">
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {step === MOBILE_STEPS.OTP && (
          <>
            <p className="text-xs text-gray-400 mb-4">Enter the OTPs sent to your old (+91 {oldMobile}) and new (+91 {newMobile}) numbers.</p>
            <OtpRow label={`OTP sent to old number (+91 ${oldMobile})`} otp={oldOtp} setter={setOldOtp} prefix="old" />
            <OtpRow label={`OTP sent to new number (+91 ${newMobile})`} otp={newOtp} setter={setNewOtp} prefix="new" />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => { setStep(MOBILE_STEPS.INPUT); setOldOtp(["","","","","",""]); setNewOtp(["","","","","",""]); setError(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 bg-transparent cursor-pointer transition">
                Back
              </button>
              <button onClick={handleVerify} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white text-sm font-semibold cursor-pointer transition border-none">
                {loading ? "Verifying..." : "Verify & Update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Switch Profile Modal ──────────────────────────────────────────────────────

const SWITCH_ROLES = [
  { key: "customer", label: "Customer", icon: "🏠", desc: "Looking to buy or rent" },
  { key: "owner",    label: "Owner",    icon: "🔑", desc: "I own properties" },
  { key: "broker",   label: "Broker / Agent", icon: "🤝", desc: "I help clients buy, sell or rent" },
  { key: "builder",  label: "Builder / Developer", icon: "🏗️", desc: "I develop real estate projects" },
];

function SwitchProfileModal({ currentRole, onCancel, onConfirm }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.18)] w-full max-w-[420px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
          <FiX size={18} />
        </button>

        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <FiAlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 leading-relaxed">
            Switching your profile role will <span className="font-bold">permanently delete</span> your current <span className="font-semibold capitalize">{currentRole}</span> profile data. This action cannot be undone.
          </p>
        </div>

        <h3 className="text-base font-extrabold text-[#1a1a2e] mb-1">Switch Profile Role</h3>
        <p className="text-xs text-gray-400 mb-4">Select the role you want to switch to. Your current profile data will be deleted and you'll set up a new profile.</p>

        {/* Role options — exclude current */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {SWITCH_ROLES.filter((r) => r.key !== currentRole).map((r) => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                selected === r.key
                  ? "border-[#7B2FFF] bg-[#f5f0ff]"
                  : "border-gray-200 hover:border-[#7B2FFF] hover:bg-[#faf8ff]"
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <span className={`text-xs font-bold ${selected === r.key ? "text-[#7B2FFF]" : "text-[#1a1a2e]"}`}>{r.label}</span>
              <span className="text-[11px] text-gray-400 leading-snug">{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!selected) return;
              await fetch(`${BASE_URL}/api/system-users/delete-account`, {
                method: "DELETE",
                credentials: "include",
              });
              onConfirm(selected);
            }}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer transition border-none"
          >
            Delete & Switch
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UpdateProfilePage() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [mobile, setMobile] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showChangeMobile, setShowChangeMobile] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/system-users/me`, { credentials: "include" })
      .then((r) => r.json())
      .then(({ data }) => {
        const detectedRole = detectRole(data);
        setRole(detectedRole);
        setMobile(data.mobile || "");
        setForm(buildFormFromUser(data, detectedRole));
      })
      .finally(() => setFetching(false));
  }, []);

  const validate = () => {
    const e = {};
    if (role !== "builder" && !form.fullName?.trim()) e.fullName = "Full name is required";
    if (role === "builder" && !form.name?.trim()) e.name = "Company name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const fd = new FormData();

      if (form.profilePhotoFile) fd.append("profilePhoto", form.profilePhotoFile);

      if (role === "customer") {
        if (form.fullName) fd.append("fullName", form.fullName);
        if (form.email) fd.append("email", form.email);
        if (form.bio) fd.append("bio", form.bio);
        if (form.location) {
          const coords = await geocode(form.location);
          fd.append("location.name", form.location);
          fd.append("location.latitude", coords?.latitude ?? "");
          fd.append("location.longitude", coords?.longitude ?? "");
        }
      }

      if (role === "owner") {
        if (form.fullName) fd.append("fullName", form.fullName);
        if (form.email) fd.append("email", form.email);
        if (form.bizName) fd.append("businessDetails.name", form.bizName);
        if (form.bizType) fd.append("businessDetails.type", form.bizType);
        if (form.gstNumber) fd.append("businessDetails.gstNumber", form.gstNumber);
        if (form.bizEmail) fd.append("businessDetails.email", form.bizEmail);
        if (form.bizMobile) fd.append("businessDetails.mobile", form.bizMobile);
        if (form.website) fd.append("businessDetails.website", form.website);
        if (form.bizLogoFile) fd.append("businessLogo", form.bizLogoFile);
      }

      if (role === "broker") {
        if (form.fullName) fd.append("fullName", form.fullName);
        if (form.email) fd.append("email", form.email);
        if (form.agencyName) fd.append("agencyName", form.agencyName);
        if (form.yearsOfExperience) fd.append("yearsOfExperience", form.yearsOfExperience);
        if (form.bio) fd.append("bio", form.bio);
      }

      if (role === "builder") {
        if (form.name) fd.append("name", form.name);
        if (form.email) fd.append("email", form.email);
        if (form.gstNumber) fd.append("gstNumber", form.gstNumber);
        if (form.cinNumber) fd.append("cinNumber", form.cinNumber);
        if (form.foundedYear) fd.append("foundedYear", form.foundedYear);
        if (form.totalProjectsDelivered) fd.append("totalProjectsDelivered", form.totalProjectsDelivered);
        if (form.location) {
          const coords = await geocode(form.location);
          fd.append("location.name", form.location);
          fd.append("location.latitude", coords?.latitude ?? "");
          fd.append("location.longitude", coords?.longitude ?? "");
        }
      }

      const res = await fetch(`${BASE_URL}/api/system-users/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      navigate(-1);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[520px] p-8">

          {/* Change Mobile Modal */}
          {showChangeMobile && (
            <ChangeMobileModal
              oldMobile={mobile}
              onCancel={() => setShowChangeMobile(false)}
              onSuccess={(newMobile) => { setMobile(newMobile); setShowChangeMobile(false); }}
            />
          )}

          {/* Switch Profile Modal */}
          {showSwitchModal && (
            <SwitchProfileModal
              currentRole={role}
              onCancel={() => setShowSwitchModal(false)}
              onConfirm={(newRole) => {
                setShowSwitchModal(false);
                navigate("/");
              }}
            />
          )}

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              <FiArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Edit Profile</h2>
              <p className="text-sm text-gray-400 mt-0.5">Update your profile information</p>
            </div>
            <button
              onClick={() => setShowSwitchModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2FFF] border border-[#7B2FFF] bg-transparent hover:bg-[#f5f0ff] rounded-xl px-3 py-1.5 cursor-pointer transition flex-shrink-0"
            >
              <FiRefreshCw size={12} />
              Switch Role
            </button>
          </div>

          {/* Role badge */}
          {role && (
            <div className="inline-flex items-center gap-1.5 bg-[#f5f0ff] border border-[#e0d4ff] rounded-full px-3 py-1 mb-6">
              <span className="text-xs font-semibold text-[#7B2FFF] capitalize">{role}</span>
            </div>
          )}

          {/* Fields */}
          <div className="flex flex-col gap-4">
            {role === "customer" && <CustomerFields form={form} setForm={setForm} errors={errors} mobile={mobile} onChangeMobile={() => setShowChangeMobile(true)} />}
            {role === "owner"    && <OwnerFields    form={form} setForm={setForm} errors={errors} mobile={mobile} onChangeMobile={() => setShowChangeMobile(true)} />}
            {role === "broker"   && <BrokerFields   form={form} setForm={setForm} errors={errors} mobile={mobile} onChangeMobile={() => setShowChangeMobile(true)} />}
            {role === "builder"  && <BuilderFields  form={form} setForm={setForm} errors={errors} mobile={mobile} onChangeMobile={() => setShowChangeMobile(true)} />}

            {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : <> Save Changes <FiArrowRight size={15} /> </>}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
