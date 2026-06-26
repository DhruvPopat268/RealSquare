import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiChevronLeft, FiMapPin } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

// ── Step data ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Listing Type" },
  { id: 2, label: "Basic Details" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price Details" },
];

const LISTING_MODES = ["Property", "Project"];
const PROPERTY_TYPES = ["Residential", "Commercial"];
const LOOKING_TO = ["Rent", "Sell", "PG/Co-living"];

const RES_SUBTYPES = ["Apartment", "Independent House", "Duplex", "Independent Floor", "Villa", "Penthouse", "Studio", "Farmhouse", "Plot"];
const COM_SUBTYPES = ["Office", "Shop", "Showroom", "Warehouse", "Plot", "Others"];
const PLOT_SUBTYPES = ["Plot/Land"];
const PROJECT_CATEGORIES = ["Residential", "Commercial", "Mixed Use"];
const PROJECT_TYPES = ["Apartment Project", "Villa Project", "Plot/Land Project", "Co-living Project", "Office Park", "Retail Project"];

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const AREA_UNITS = ["Square Feet", "Square Yard", "Square Meter"];
const FLOOR_OPTIONS = ["Ground", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15+"];
const FURNISHING = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const AVAILABILITY = ["Ready to Move", "Under Construction", "New Launch"];
const AMENITY_LIST = ["Lift", "Parking", "Power Backup", "Swimming Pool", "Gymnasium", "Club House", "Security", "Garden", "Intercom", "Gas Pipeline"];

const PRICE_UNITS = { Rent: "/month", Sell: "(total)", "PG/Co-living": "/month" };

// ── Chip button ──────────────────────────────────────────────────────────

function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
        selected
          ? "bg-[#f0ebff] border-[#7B2FFF] text-[#7B2FFF]"
          : "border-gray-200 text-gray-600 bg-white hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition bg-white text-gray-700"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function ListingTypeSelection({ form, setForm, errors }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">What would you like to list?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LISTING_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setForm(() => ({ ...INIT, listingMode: mode }))}
            className={`border rounded-3xl p-6 text-left transition shadow-sm ${
              form.listingMode === mode
                ? "border-[#7B2FFF] bg-[#f0ebff]"
                : "border-gray-200 bg-white hover:border-[#7B2FFF]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-900">{mode}</span>
              <span className="text-xs font-semibold text-gray-500">{mode === "Property" ? "Single unit" : "Developer project"}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {mode === "Property"
                ? "List individual homes, flats, plots, PG or commercial units."
                : "List new or upcoming projects, developments and residential/commercial complexes."
              }
            </p>
          </button>
        ))}
      </div>
      {errors.listingMode && <p className="text-xs text-red-500">{errors.listingMode}</p>}
    </div>
  );
}

// ── Step 1: Basic Details ─────────────────────────────────────────────────

function BasicDetails({ form, setForm, errors }) {
  const subtypes = form.propertyType === "Commercial" ? COM_SUBTYPES : RES_SUBTYPES;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Add Basic Details</h2>

      <Field label="Property Type" required>
        <div className="flex gap-3 flex-wrap">
          {PROPERTY_TYPES.map((t) => (
            <Chip key={t} label={t} selected={form.propertyType === t}
              onClick={() => setForm((f) => ({ ...f, propertyType: t, subType: "" }))} />
          ))}
        </div>
        {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType}</p>}
      </Field>

      <Field label="Looking to" required>
        <div className="flex gap-3 flex-wrap">
          {LOOKING_TO.map((t) => (
            <Chip key={t} label={t} selected={form.lookingTo === t}
              onClick={() => setForm((f) => ({ ...f, lookingTo: t }))} />
          ))}
        </div>
        {errors.lookingTo && <p className="text-xs text-red-500">{errors.lookingTo}</p>}
      </Field>

      <Field label="Property Sub-type" required>
        <div className="flex gap-2 flex-wrap">
          {subtypes.map((t) => (
            <Chip key={t} label={t} selected={form.subType === t}
              onClick={() => setForm((f) => ({ ...f, subType: t }))} />
          ))}
        </div>
        {errors.subType && <p className="text-xs text-red-500">{errors.subType}</p>}
      </Field>

      <Field label="City" required>
        <div className="flex flex-col gap-1">
          <Input value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="e.g. Mumbai" />
          {form.city && (
            <p className="text-xs text-[#7B2FFF] flex items-center gap-1 mt-0.5">
              <FiMapPin size={11} /> Location auto-detected
            </p>
          )}
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>
      </Field>

      <Field label="Locality / Society" required>
        <Input value={form.locality} onChange={(v) => setForm((f) => ({ ...f, locality: v }))} placeholder="e.g. Koramangala, Green Valley Society" />
        {errors.locality && <p className="text-xs text-red-500">{errors.locality}</p>}
      </Field>
    </div>
  );
}

// ── Step 2: Property Details ──────────────────────────────────────────────

function PropertyDetails({ form, setForm, errors }) {
  const showBhk = form.propertyType === "Residential" && !["Farmhouse", "Plot"].includes(form.subType);

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Add Property Details</h2>

      {showBhk && (
        <Field label="BHK / Bedrooms" required>
          <div className="flex gap-2 flex-wrap">
            {BHK_OPTIONS.map((b) => (
              <Chip key={b} label={b} selected={form.bhk === b}
                onClick={() => setForm((f) => ({ ...f, bhk: b }))} />
            ))}
          </div>
          {errors.bhk && <p className="text-xs text-red-500">{errors.bhk}</p>}
        </Field>
      )}

      <Field label="Area Unit">
        <Select value={form.areaUnit} onChange={(v) => setForm((f) => ({ ...f, areaUnit: v }))} options={AREA_UNITS} placeholder="Select unit" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Built-up Area" required>
          <Input type="number" value={form.builtupArea} onChange={(v) => setForm((f) => ({ ...f, builtupArea: v }))} placeholder="e.g. 1200" />
          {errors.builtupArea && <p className="text-xs text-red-500">{errors.builtupArea}</p>}
        </Field>
        <Field label="Carpet Area">
          <Input type="number" value={form.carpetArea} onChange={(v) => setForm((f) => ({ ...f, carpetArea: v }))} placeholder="e.g. 1000" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Floor No.">
          <Select value={form.floor} onChange={(v) => setForm((f) => ({ ...f, floor: v }))} options={FLOOR_OPTIONS} placeholder="Select floor" />
        </Field>
        <Field label="Total Floors">
          <Input type="number" value={form.totalFloors} onChange={(v) => setForm((f) => ({ ...f, totalFloors: v }))} placeholder="e.g. 15" />
        </Field>
      </div>

      <Field label="Furnishing Status" required>
        <div className="flex gap-3 flex-wrap">
          {FURNISHING.map((f) => (
            <Chip key={f} label={f} selected={form.furnishing === f}
              onClick={() => setForm((prev) => ({ ...prev, furnishing: f }))} />
          ))}
        </div>
        {errors.furnishing && <p className="text-xs text-red-500">{errors.furnishing}</p>}
      </Field>

      <Field label="Availability Status" required>
        <div className="flex gap-3 flex-wrap">
          {AVAILABILITY.map((a) => (
            <Chip key={a} label={a} selected={form.availability === a}
              onClick={() => setForm((f) => ({ ...f, availability: a }))} />
          ))}
        </div>
        {errors.availability && <p className="text-xs text-red-500">{errors.availability}</p>}
      </Field>

      <Field label="Amenities">
        <div className="flex gap-2 flex-wrap">
          {AMENITY_LIST.map((a) => (
            <Chip key={a} label={a} selected={form.amenities.includes(a)} onClick={() => toggleAmenity(a)} />
          ))}
        </div>
      </Field>

      <Field label="Property Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe your property — highlights, nearby places, unique features..."
          rows={4}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition resize-none"
        />
      </Field>
    </div>
  );
}

function ProjectBasicDetails({ form, setForm, errors }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Add Project Basics</h2>

      <Field label="Project Name" required>
        <Input value={form.projectName} onChange={(v) => setForm((f) => ({ ...f, projectName: v }))} placeholder="e.g. Emerald Heights" />
        {errors.projectName && <p className="text-xs text-red-500">{errors.projectName}</p>}
      </Field>

      <Field label="Developer / Builder Name" required>
        <Input value={form.developerName} onChange={(v) => setForm((f) => ({ ...f, developerName: v }))} placeholder="e.g. RealSquare Developers" />
        {errors.developerName && <p className="text-xs text-red-500">{errors.developerName}</p>}
      </Field>

      <Field label="Project Category" required>
        <div className="flex gap-3 flex-wrap">
          {PROJECT_CATEGORIES.map((category) => (
            <Chip key={category} label={category} selected={form.projectCategory === category}
              onClick={() => setForm((f) => ({ ...f, projectCategory: category }))} />
          ))}
        </div>
        {errors.projectCategory && <p className="text-xs text-red-500">{errors.projectCategory}</p>}
      </Field>

      <Field label="City" required>
        <div className="flex flex-col gap-1">
          <Input value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="e.g. Mumbai" />
          {form.city && (
            <p className="text-xs text-[#7B2FFF] flex items-center gap-1 mt-0.5">
              <FiMapPin size={11} /> Location auto-detected
            </p>
          )}
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>
      </Field>

      <Field label="Locality / Area" required>
        <Input value={form.locality} onChange={(v) => setForm((f) => ({ ...f, locality: v }))} placeholder="e.g. Hinjewadi, Kharadi" />
        {errors.locality && <p className="text-xs text-red-500">{errors.locality}</p>}
      </Field>
    </div>
  );
}

function ProjectDetails({ form, setForm, errors }) {
  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Add Project Details</h2>

      <Field label="Project Type" required>
        <div className="flex gap-3 flex-wrap">
          {PROJECT_TYPES.map((type) => (
            <Chip key={type} label={type} selected={form.projectType === type}
              onClick={() => setForm((f) => ({ ...f, projectType: type }))} />
          ))}
        </div>
        {errors.projectType && <p className="text-xs text-red-500">{errors.projectType}</p>}
      </Field>

      <Field label="Launch Status" required>
        <Select value={form.projectStatus} onChange={(v) => setForm((f) => ({ ...f, projectStatus: v }))} options={AVAILABILITY} placeholder="Select status" />
        {errors.projectStatus && <p className="text-xs text-red-500">{errors.projectStatus}</p>}
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Total Units" required>
          <Input type="number" value={form.units} onChange={(v) => setForm((f) => ({ ...f, units: v }))} placeholder="e.g. 120" />
          {errors.units && <p className="text-xs text-red-500">{errors.units}</p>}
        </Field>
        <Field label="Number of Towers">
          <Input type="number" value={form.towers} onChange={(v) => setForm((f) => ({ ...f, towers: v }))} placeholder="e.g. 3" />
        </Field>
      </div>

      <Field label="Expected Possession">
        <Input value={form.possession} onChange={(v) => setForm((f) => ({ ...f, possession: v }))} placeholder="e.g. Dec 2026" />
      </Field>

      <Field label="Amenities">
        <div className="flex gap-2 flex-wrap">
          {AMENITY_LIST.map((a) => (
            <Chip key={a} label={a} selected={form.amenities.includes(a)} onClick={() => toggleAmenity(a)} />
          ))}
        </div>
      </Field>

      <Field label="Project Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe the project — key amenities, location advantages, unit mix..."
          rows={4}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition resize-none"
        />
      </Field>
    </div>
  );
}

// ── Step 3: Price Details ─────────────────────────────────────────────────

function PriceDetails({ form, setForm, errors }) {
  const isRent = form.lookingTo === "Rent" || form.lookingTo === "PG/Co-living";
  const isProject = form.listingMode === "Project";
  const label = isProject ? "Starting Price" : `Expected Price ${PRICE_UNITS[form.lookingTo] || ""}`;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Add Price Details</h2>

      <Field label={label} required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
          <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
          <input
            type="number"
            value={isProject ? form.priceFrom : form.price}
            onChange={(e) => setForm((f) => isProject ? ({ ...f, priceFrom: e.target.value }) : ({ ...f, price: e.target.value }))}
            placeholder={isProject ? "e.g. 4000000" : isRent ? "e.g. 25000" : "e.g. 5000000"}
            className="flex-1 px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-gray-500">{isProject ? "Enter the starting price for the project." : "Enter the expected listing price."}</p>
        {(isProject ? errors.priceFrom : errors.price) && <p className="text-xs text-red-500">{isProject ? errors.priceFrom : errors.price}</p>}
      </Field>

      {isProject && (
        <Field label="Price Range (optional)">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input type="number" value={form.priceTo} onChange={(v) => setForm((f) => ({ ...f, priceTo: v }))} placeholder="Max price" />
            </div>
            <div>
              <Input value={form.priceUnit} onChange={(v) => setForm((f) => ({ ...f, priceUnit: v }))} placeholder="e.g. per sq.ft" />
            </div>
          </div>
        </Field>
      )}

      {!isProject && isRent && (
        <>
          <Field label="Security Deposit">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
              <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
              <input
                type="number"
                value={form.deposit}
                onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))}
                placeholder="e.g. 100000"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </Field>
          <Field label="Maintenance Charges (monthly)">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
              <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
              <input
                type="number"
                value={form.maintenance}
                onChange={(e) => setForm((f) => ({ ...f, maintenance: e.target.value }))}
                placeholder="e.g. 2000"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </Field>
        </>
      )}

      <Field label="Price Negotiable">
        <div className="flex gap-3">
          {["Yes", "No"].map((v) => (
            <Chip key={v} label={v} selected={form.negotiable === v}
              onClick={() => setForm((f) => ({ ...f, negotiable: v }))} />
          ))}
        </div>
      </Field>

      <Field label="Your Name" required>
        <Input value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} placeholder="Full name" />
        {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName}</p>}
      </Field>

      <Field label="Mobile Number" required>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
          <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">+91</span>
          <input
            type="tel"
            maxLength={10}
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/, "") }))}
            placeholder="10-digit mobile"
            className="flex-1 px-3 py-2.5 text-sm outline-none"
          />
        </div>
        {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
      </Field>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────

function Sidebar({ currentStep }) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6 h-fit">
      <div>
        <h3 className="text-base font-extrabold text-[#1a1a2e] mb-0.5">Post your listing</h3>
        <p className="text-xs text-gray-400">Create a property or project listing</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 font-medium">{Math.round(Math.max(5, progress))}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.id} className="flex gap-3">
              {/* icon + line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition ${
                  done ? "bg-[#7B2FFF] border-[#7B2FFF]" : active ? "border-[#7B2FFF] bg-white" : "border-gray-200 bg-white"
                }`}>
                  {done ? (
                    <FiCheck size={14} className="text-white" />
                  ) : (
                    <div className={`w-2.5 h-2.5 rounded-full ${active ? "bg-[#7B2FFF]" : "bg-gray-200"}`} />
                  )}
                </div>
                {!isLast && <div className="w-0.5 h-8 bg-gray-100 my-1" />}
              </div>

              {/* label */}
              <div className="pb-6">
                <p className={`text-sm font-semibold ${active ? "text-[#1a1a2e]" : done ? "text-[#7B2FFF]" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  active ? "bg-amber-50 text-amber-500" : done ? "bg-[#f0ebff] text-[#7B2FFF]" : "bg-gray-100 text-gray-400"
                }`}>
                  {active ? "In progress" : done ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#f7f8fa] rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
        <strong>Need help?</strong> Now you can directly post property via{" "}
        <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
          className="text-green-600 font-semibold hover:underline inline-flex items-center gap-0.5">
          📱 WhatsApp ›
        </a>
      </div>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────

function SuccessScreen({ onGoHome }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FiCheck size={36} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-2">Listing Submitted! 🎉</h2>
      <p className="text-gray-500 text-sm mb-2 max-w-[400px] mx-auto leading-relaxed">
        Your listing has been successfully submitted. Our team will review and publish it within 24 hours.
      </p>
      <p className="text-xs text-gray-400 mb-8">You'll receive a confirmation on your registered mobile number.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onGoHome}
          className="bg-[#7B2FFF] hover:bg-[#6320d4] text-white px-8 py-3 rounded-xl font-semibold text-sm transition"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.location.reload()}
          className="border border-[#7B2FFF] text-[#7B2FFF] px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#f0ebff] transition"
        >
          List Another Listing
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

const INIT = {
  listingMode: "",
  // step 2
  propertyType: "Residential", lookingTo: "Sell", subType: "", city: "", locality: "",
  // step 3
  bhk: "", areaUnit: "Square Feet", builtupArea: "", carpetArea: "", floor: "", totalFloors: "",
  furnishing: "", availability: "", amenities: [], description: "",
  // step 4
  price: "", priceFrom: "", priceTo: "", priceUnit: "", deposit: "", maintenance: "", negotiable: "No", ownerName: "", mobile: "",
  // project fields
  projectName: "", developerName: "", projectCategory: "", projectType: "", projectStatus: "", units: "", towers: "", possession: "",
};

export default function ListPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.listingMode) e.listingMode = "Choose a listing type";
    }
    if (step === 2) {
      if (form.listingMode === "Property") {
        if (!form.propertyType) e.propertyType = "Select a property type";
        if (!form.lookingTo) e.lookingTo = "Select what you're looking to do";
        if (!form.subType) e.subType = "Select a sub-type";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.locality.trim()) e.locality = "Locality is required";
      } else if (form.listingMode === "Project") {
        if (!form.projectName.trim()) e.projectName = "Project name is required";
        if (!form.developerName.trim()) e.developerName = "Developer name is required";
        if (!form.projectCategory) e.projectCategory = "Select a project category";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.locality.trim()) e.locality = "Locality is required";
      }
    }
    if (step === 3) {
      if (form.listingMode === "Property") {
        const needsBhk = form.propertyType === "Residential" && !["Farmhouse", "Plot"].includes(form.subType);
        if (needsBhk && !form.bhk) e.bhk = "Select BHK";
        if (!form.builtupArea || Number(form.builtupArea) <= 0) e.builtupArea = "Enter built-up area";
        if (!form.furnishing) e.furnishing = "Select furnishing status";
        if (!form.availability) e.availability = "Select availability";
      } else if (form.listingMode === "Project") {
        if (!form.projectType) e.projectType = "Select a project type";
        if (!form.projectStatus) e.projectStatus = "Select launch status";
        if (!form.units || Number(form.units) <= 0) e.units = "Enter total units";
      }
    }
    if (step === 4) {
      if (form.listingMode === "Property") {
        if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
      } else {
        if (!form.priceFrom || Number(form.priceFrom) <= 0) e.priceFrom = "Enter a valid starting price";
      }
      if (!form.ownerName.trim()) e.ownerName = "Name is required";
      if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < STEPS.length) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else setDone(true);
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) setStep((s) => s - 1);
    else navigate(-1);
  };

  return (
    <>
      <PageSpinner />
      <Navbar />

      <div className="bg-[#f0ebff]/30 min-h-screen py-8 px-4">
        <div className="max-w-[1000px] mx-auto">

          {/* Back link */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#7B2FFF] transition mb-5 bg-transparent border-none cursor-pointer"
          >
            <FiChevronLeft size={16} /> {step > 1 ? "Previous step" : "Return to dashboard"}
          </button>

          {done ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <SuccessScreen onGoHome={() => navigate("/")} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 items-start">

              {/* Sidebar */}
              <Sidebar currentStep={step} />

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                {step === 1 && <ListingTypeSelection form={form} setForm={setForm} errors={errors} />}
                {step === 2 && form.listingMode === "Property" && <BasicDetails form={form} setForm={setForm} errors={errors} />}
                {step === 2 && form.listingMode === "Project" && <ProjectBasicDetails form={form} setForm={setForm} errors={errors} />}
                {step === 3 && form.listingMode === "Property" && <PropertyDetails form={form} setForm={setForm} errors={errors} />}
                {step === 3 && form.listingMode === "Project" && <ProjectDetails form={form} setForm={setForm} errors={errors} />}
                {step === 4 && <PriceDetails form={form} setForm={setForm} errors={errors} />}

                <button
                  onClick={handleNext}
                  className="mt-8 w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-4 rounded-xl font-bold text-sm transition"
                >
                  {step < STEPS.length ? `Next, add ${STEPS[step].label.toLowerCase()}` : "Submit Listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
