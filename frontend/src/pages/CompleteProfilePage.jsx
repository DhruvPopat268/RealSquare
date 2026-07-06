import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowRight, FiSkipForward, FiCamera, FiImage } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PlacesAutocomplete from "../components/PlacesAutocomplete";

const BASE_URL = import.meta.env.VITE_API_URL;

const ROLE_IDS = {
  customer: import.meta.env.VITE_CUSTOMER_ROLE_ID,
  owner:    import.meta.env.VITE_OWNER_ROLE_ID,
  broker:   import.meta.env.VITE_BROKER_ROLE_ID,
  builder:  import.meta.env.VITE_BUILDER_ROLE_ID,
};

const ROLES = [
  { key: "customer", label: "Customer",           icon: "🏠", desc: "Looking to buy or rent a property" },
  { key: "owner",    label: "Owner",               icon: "🔑", desc: "I own properties and want to list them" },
  { key: "broker",   label: "Broker / Agent",      icon: "🤝", desc: "I help clients buy, sell or rent" },
  { key: "builder",  label: "Builder / Developer", icon: "🏗️", desc: "I develop and sell real estate projects" },
];

const OWNER_BUSINESS_TYPES = [
  { value: "private_owner",                label: "Private Owner" },
  { value: "real_estate_investment_trust", label: "Real Estate Investment Trust" },
  { value: "property_management_group",    label: "Property Management Group" },
  { value: "family_office",               label: "Family Office" },
];

// ── Geocode a place name → { latitude, longitude } ───────────────────────────

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

// ── Shared UI ─────────────────────────────────────────────────────────────────

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
          type={type} maxLength={maxLength} placeholder={placeholder}
          value={value} onChange={onChange} readOnly={readOnly}
          className="flex-1 px-3 py-3 text-sm outline-none"
        />
      </div>
    );
  }
  return (
    <input
      type={type} maxLength={maxLength} placeholder={placeholder}
      value={value} onChange={onChange} readOnly={readOnly}
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition ${readOnly ? "bg-gray-50 text-gray-400" : ""}`}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition bg-white appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange}
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
    onChange(URL.createObjectURL(file), file);
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => ref.current.click()}
        className={`relative group bg-gray-100 hover:bg-[#f0ebff] border-2 border-dashed border-gray-300 hover:border-[#7B2FFF] transition overflow-hidden flex items-center justify-center ${isCircle ? "w-20 h-20 rounded-full" : "w-24 h-20 rounded-xl"}`}
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

function CustomerFields({ form, setForm, errors, mobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhotoPreview}
          onChange={(url, file) => setForm((p) => ({ ...p, profilePhotoPreview: url, profilePhotoFile: file }))}
        />
      </div>
      {errors.profilePhotoFile && <p className="text-xs text-red-500 text-center -mt-1">{errors.profilePhotoFile}</p>}
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <TextInput value={mobile} readOnly prefix="+91" />
      </InputField>
      <InputField label="Email" required error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="Location" required error={errors.location}>
        <PlacesAutocomplete value={form.location} onChange={(val) => setForm((p) => ({ ...p, location: val }))} placeholder="City or area you're looking in" />
      </InputField>
      <InputField label="Bio" required error={errors.bio}>
        <TextareaInput value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us a bit about yourself" />
      </InputField>
    </>
  );
}

function OwnerFields({ form, setForm, errors, mobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhotoPreview}
          onChange={(url, file) => setForm((p) => ({ ...p, profilePhotoPreview: url, profilePhotoFile: file }))}
        />
      </div>
      {errors.profilePhotoFile && <p className="text-xs text-red-500 text-center -mt-1">{errors.profilePhotoFile}</p>}
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <TextInput value={mobile} readOnly prefix="+91" />
      </InputField>
      <InputField label="Email" required error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>

      <div className="border-t border-gray-100 pt-4 mt-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Business Details</p>
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <PhotoUpload label="Company Logo" value={form.bizLogoPreview}
              onChange={(url, file) => setForm((p) => ({ ...p, bizLogoPreview: url, bizLogoFile: file }))}
              shape="square" icon={FiImage}
            />
          </div>
          <InputField label="Business Name" required error={errors.bizName}>
            <TextInput value={form.bizName} onChange={(e) => setForm((p) => ({ ...p, bizName: e.target.value }))} placeholder="Your business / firm name" />
          </InputField>
          <InputField label="Business Type" required error={errors.bizType}>
            <SelectInput value={form.bizType} onChange={(e) => setForm((p) => ({ ...p, bizType: e.target.value }))} options={OWNER_BUSINESS_TYPES} placeholder="Select business type" />
          </InputField>
          <InputField label="GST Number" required error={errors.gstNumber}>
            <TextInput value={form.gstNumber} onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" />
          </InputField>
          <InputField label="Business Email" required error={errors.bizEmail}>
            <TextInput type="email" value={form.bizEmail} onChange={(e) => setForm((p) => ({ ...p, bizEmail: e.target.value }))} placeholder="business@email.com" />
          </InputField>
          <InputField label="Business Mobile" required error={errors.bizMobile}>
            <TextInput value={form.bizMobile} onChange={(e) => setForm((p) => ({ ...p, bizMobile: e.target.value.replace(/\D/, "") }))} placeholder="Business contact number" prefix="+91" maxLength={10} />
          </InputField>
          <InputField label="Website" required error={errors.website}>
            <TextInput value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
          </InputField>
        </div>
      </div>
    </>
  );
}

function BrokerFields({ form, setForm, errors, mobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhotoPreview}
          onChange={(url, file) => setForm((p) => ({ ...p, profilePhotoPreview: url, profilePhotoFile: file }))}
        />
      </div>
      {errors.profilePhotoFile && <p className="text-xs text-red-500 text-center -mt-1">{errors.profilePhotoFile}</p>}
      <InputField label="Full Name" required error={errors.fullName}>
        <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <TextInput value={mobile} readOnly prefix="+91" />
      </InputField>
      <InputField label="Email" required error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="Agency Name" required error={errors.agencyName}>
        <TextInput value={form.agencyName} onChange={(e) => setForm((p) => ({ ...p, agencyName: e.target.value }))} placeholder="Your agency or firm name" />
      </InputField>
      <InputField label="Years of Experience" required error={errors.yearsOfExperience}>
        <TextInput type="number" value={form.yearsOfExperience} onChange={(e) => setForm((p) => ({ ...p, yearsOfExperience: e.target.value }))} placeholder="e.g. 5" />
      </InputField>
      <InputField label="Bio" required error={errors.bio}>
        <TextareaInput value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Brief professional summary" />
      </InputField>
    </>
  );
}

function BuilderFields({ form, setForm, errors, mobile }) {
  return (
    <>
      <div className="flex justify-center mb-2">
        <PhotoUpload label="Profile Photo" value={form.profilePhotoPreview}
          onChange={(url, file) => setForm((p) => ({ ...p, profilePhotoPreview: url, profilePhotoFile: file }))}
        />
      </div>
      {errors.profilePhotoFile && <p className="text-xs text-red-500 text-center -mt-1">{errors.profilePhotoFile}</p>}
      <InputField label="Company / Builder Name" required error={errors.name}>
        <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your company name" />
      </InputField>
      <InputField label="Mobile Number" required>
        <TextInput value={mobile} readOnly prefix="+91" />
      </InputField>
      <InputField label="Email" required error={errors.email}>
        <TextInput type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
      </InputField>
      <InputField label="GST Number" required error={errors.gstNumber}>
        <TextInput value={form.gstNumber} onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" />
      </InputField>
      <InputField label="CIN Number" required error={errors.cinNumber}>
        <TextInput value={form.cinNumber} onChange={(e) => setForm((p) => ({ ...p, cinNumber: e.target.value }))} placeholder="Corporate Identification Number" />
      </InputField>
      <InputField label="Founded Year" required error={errors.foundedYear}>
        <TextInput type="number" value={form.foundedYear} onChange={(e) => setForm((p) => ({ ...p, foundedYear: e.target.value }))} placeholder="e.g. 2005" />
      </InputField>
      <InputField label="Total Projects Delivered" required error={errors.totalProjectsDelivered}>
        <TextInput type="number" value={form.totalProjectsDelivered} onChange={(e) => setForm((p) => ({ ...p, totalProjectsDelivered: e.target.value }))} placeholder="e.g. 12" />
      </InputField>
      <InputField label="Location / HQ City" required error={errors.location}>
        <PlacesAutocomplete value={form.location} onChange={(val) => setForm((p) => ({ ...p, location: val }))} placeholder="City where your HQ is based" />
      </InputField>
      <div className="flex justify-center">
        <PhotoUpload label="Business Logo (optional)" value={form.bizLogoPreview}
          onChange={(url, file) => setForm((p) => ({ ...p, bizLogoPreview: url, bizLogoFile: file }))}
          shape="square" icon={FiImage}
        />
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  fullName: "", name: "", email: "", bio: "", location: "",
  profilePhotoPreview: "", profilePhotoFile: null,
  agencyName: "", yearsOfExperience: "",
  bizName: "", bizType: "", gstNumber: "", bizEmail: "", bizMobile: "", website: "",
  bizLogoPreview: "", bizLogoFile: null,
  cinNumber: "", foundedYear: "", totalProjectsDelivered: "",
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile || "";

  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/";

  const validate = () => {
    const e = {};
    if (!form.profilePhotoFile) e.profilePhotoFile = "Profile photo is required";
    if (selectedRole !== "builder") {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
    } else {
      if (!form.name.trim()) e.name = "Company name is required";
    }
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";

    if (selectedRole === "customer") {
      if (!form.location.trim()) e.location = "Location is required";
      if (!form.bio.trim()) e.bio = "Bio is required";
    }
    if (selectedRole === "owner") {
      if (!form.bizName.trim()) e.bizName = "Business name is required";
      if (!form.bizType) e.bizType = "Business type is required";
      if (!form.gstNumber.trim()) e.gstNumber = "GST number is required";
      if (!form.bizEmail.trim()) e.bizEmail = "Business email is required";
      if (!form.bizMobile.trim()) e.bizMobile = "Business mobile is required";
      if (!form.website.trim()) e.website = "Website is required";
    }
    if (selectedRole === "broker") {
      if (!form.agencyName.trim()) e.agencyName = "Agency name is required";
      if (!form.yearsOfExperience) e.yearsOfExperience = "Years of experience is required";
      if (!form.bio.trim()) e.bio = "Bio is required";
    }
    if (selectedRole === "builder") {
      if (!form.gstNumber.trim()) e.gstNumber = "GST number is required";
      if (!form.cinNumber.trim()) e.cinNumber = "CIN number is required";
      if (!form.foundedYear) e.foundedYear = "Founded year is required";
      if (!form.totalProjectsDelivered) e.totalProjectsDelivered = "Total projects is required";
      if (!form.location.trim()) e.location = "Location is required";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("role", ROLE_IDS[selectedRole]);
      fd.append("profilePhoto", form.profilePhotoFile);

      if (selectedRole === "customer") {
        fd.append("fullName", form.fullName);
        fd.append("email", form.email);
        fd.append("bio", form.bio);
        const coords = await geocode(form.location);
        fd.append("location.name", form.location);
        fd.append("location.latitude", coords?.latitude ?? "");
        fd.append("location.longitude", coords?.longitude ?? "");
      }

      if (selectedRole === "owner") {
        fd.append("fullName", form.fullName);
        fd.append("email", form.email);
        fd.append("businessDetails.name", form.bizName);
        fd.append("businessDetails.type", form.bizType);
        fd.append("businessDetails.gstNumber", form.gstNumber);
        fd.append("businessDetails.email", form.bizEmail);
        fd.append("businessDetails.mobile", form.bizMobile);
        fd.append("businessDetails.website", form.website);
        if (form.bizLogoFile) fd.append("businessLogo", form.bizLogoFile);
      }

      if (selectedRole === "broker") {
        fd.append("fullName", form.fullName);
        fd.append("email", form.email);
        fd.append("agencyName", form.agencyName);
        fd.append("yearsOfExperience", form.yearsOfExperience);
        fd.append("bio", form.bio);
      }

      if (selectedRole === "builder") {
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("gstNumber", form.gstNumber);
        fd.append("cinNumber", form.cinNumber);
        fd.append("foundedYear", form.foundedYear);
        fd.append("totalProjectsDelivered", form.totalProjectsDelivered);
        const coords = await geocode(form.location);
        fd.append("location.name", form.location);
        fd.append("location.latitude", coords?.latitude ?? "");
        fd.append("location.longitude", coords?.longitude ?? "");
        if (form.bizLogoFile) fd.append("businessLogo", form.bizLogoFile);
      }

      const res = await fetch(`${BASE_URL}/api/system-users/complete-profile`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");
      navigate(returnTo, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate(returnTo, { replace: true });

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[520px] p-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Complete Your Profile</h2>
              <p className="text-sm text-gray-400 mt-0.5">Help us personalise your experience</p>
            </div>
            <button onClick={handleSkip}
              className="flex items-center gap-1.5 text-sm text-[#7B2FFF] bg-transparent border border-[#7B2FFF] rounded-xl px-3 py-1.5 transition cursor-pointer flex-shrink-0 hover:bg-[#f5f0ff]"
            >
              <FiSkipForward size={14} /> Skip
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">I am a *</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <button key={role.key}
                  onClick={() => { setSelectedRole(role.key); setForm(INITIAL_FORM); setErrors({}); }}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                    selectedRole === role.key
                      ? "border-[#7B2FFF] bg-[#f5f0ff]"
                      : "border-gray-200 bg-white hover:border-[#7B2FFF] hover:bg-[#faf8ff]"
                  }`}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`text-sm font-bold ${selectedRole === role.key ? "text-[#7B2FFF]" : "text-[#1a1a2e]"}`}>
                    {role.label}
                  </span>
                  <span className="text-xs text-gray-400 leading-snug">{role.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedRole && (
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
              {selectedRole === "customer" && <CustomerFields form={form} setForm={setForm} errors={errors} mobile={mobile} />}
              {selectedRole === "owner"    && <OwnerFields    form={form} setForm={setForm} errors={errors} mobile={mobile} />}
              {selectedRole === "broker"   && <BrokerFields   form={form} setForm={setForm} errors={errors} mobile={mobile} />}
              {selectedRole === "builder"  && <BuilderFields  form={form} setForm={setForm} errors={errors} mobile={mobile} />}

              {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full mt-2 bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : <> Save & Continue <FiArrowRight size={15} /> </>}
              </button>
            </div>
          )}

          {!selectedRole && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Select your role above to fill in your profile details
            </p>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
