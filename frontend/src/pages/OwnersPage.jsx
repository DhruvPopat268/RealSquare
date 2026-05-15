import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiArrowRight, FiX, FiCheck, FiStar, FiChevronRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

// ── Callback Modal ────────────────────────────────────────────────────────
function CallbackModal({ onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit number";
    if (!city.trim()) e.city = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6 relative" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}><FiX size={20} /></button>
        {!submitted ? (
          <>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">Request a Callback</h3>
            <p className="text-sm text-gray-400 mb-5">Our team will call you within 30 minutes</p>
            <div className="flex flex-col gap-4">
              <div>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
                  <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3">+91</span>
                  <input className="flex-1 px-3 py-3 text-sm outline-none" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} type="tel" />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition" placeholder="Your City" value={city} onChange={(e) => setCity(e.target.value)} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>
            <button onClick={() => { if (validate()) setSubmitted(true); }} className="w-full mt-5 bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition">
              Request Call
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">You're all set!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Thanks <strong>{name}</strong>! Our team will call you on <strong>+91 {phone}</strong> shortly.</p>
            <button onClick={onClose} className="mt-6 bg-[#7B2FFF] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6320d4] transition">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Visibility Gauge ──────────────────────────────────────────────────────
function VisibilityGauge({ percent }) {
  const circ = Math.PI * 28;
  const fill = (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="42" viewBox="0 0 72 42">
        <path d="M 8 36 A 28 28 0 0 1 64 36" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
        <path d="M 8 36 A 28 28 0 0 1 64 36" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`} />
        <text x="36" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1a2e">{percent}%</text>
      </svg>
      <span className="text-[10px] text-gray-400">Listing Visibility</span>
    </div>
  );
}

function Cell({ val }) {
  if (val === true) return <span className="text-[#7B2FFF] text-lg">✓</span>;
  if (val === false) return <span className="text-gray-300 text-lg">✗</span>;
  return <span className="text-sm text-gray-700">{val}</span>;
}

const RESIDENTIAL_PLANS = {
  "For Sell": {
    plans: [
      { name: "Basic", popular: false, visibility: 75, price: "₹3,299" },
      { name: "Premium +", popular: true, visibility: 86, price: "₹7,499" },
      { name: "Assist", popular: false, visibility: 92, price: "₹10,999" },
      { name: "Super Assist", popular: false, visibility: 98, price: "₹17,999" },
    ],
    features: [
      { label: "Plan Validity", vals: ["30 Days", "120 Days", "120 Days", "150 Days"] },
      { label: "Position in search result", vals: ["Medium Slot", "Medium Slot", "Top Slot", "Top Slot"] },
      { label: "Relationship Manager Assistance", vals: [false, false, true, true] },
      { label: "Field Visit Assistance", vals: [false, false, false, false] },
      { label: "Professional Photoshoot of Property", vals: [false, true, true, true] },
      { label: "Assured 1st rank in search results", vals: [false, false, "3 Boosts", "5 Boosts"] },
      { label: "Social media marketing", vals: [false, false, false, true] },
      { label: "Shorts", vals: [false, false, true, true] },
      { label: "Property Report", vals: [false, false, false, true] },
      { label: "Matching Buyers", vals: [false, false, false, "Upto 50"], badge: "NEW" },
    ],
  },
  "For Rent": {
    plans: [
      { name: "Basic", popular: false, visibility: 75, price: "₹2,199" },
      { name: "Premium +", popular: true, visibility: 86, price: "₹4,999" },
      { name: "Assist", popular: false, visibility: 92, price: "₹7,999" },
      { name: "Super Assist", popular: false, visibility: 98, price: "₹12,999" },
    ],
    features: [
      { label: "Plan Validity", vals: ["15 Days", "60 Days", "60 Days", "75 Days"] },
      { label: "Position in search result", vals: ["Medium Slot", "Medium Slot", "Top Slot", "Top Slot"] },
      { label: "Relationship Manager Assistance", vals: [false, false, true, true] },
      { label: "Field Visit Assistance", vals: [false, false, false, false] },
      { label: "Professional Photoshoot of Property", vals: [false, true, true, true] },
      { label: "Assured 1st rank in search results", vals: [false, false, "3 Boosts", "5 Boosts"] },
      { label: "Exclusive listing highlights", vals: [false, true, true, true] },
      { label: "Social media marketing", vals: [false, false, false, true] },
      { label: "Shorts", vals: [false, false, true, true] },
    ],
  },
  "For PG": {
    plans: [
      { name: "Basic", popular: false, visibility: 75, price: "₹1,750" },
      { name: "Premium", popular: true, visibility: 86, price: "₹3,999" },
    ],
    features: [
      { label: "Plan Validity", vals: ["30 Days", "60 Days"] },
      { label: "Position in search result", vals: ["Medium Slot", "Top Slot"] },
      { label: "Unique Tag on Property", vals: [false, true] },
    ],
  },
};

const COMMERCIAL_PLANS = {
  "For Sell": {
    plans: [
      { name: "Premium", popular: false, visibility: 86, price: "₹4,999" },
      { name: "Premium +", popular: true, visibility: 92, price: "₹7,999" },
      { name: "Assist", popular: false, visibility: 98, price: "₹11,999" },
    ],
    features: [
      { label: "Plan Validity", vals: ["90 Days", "120 Days", "120 Days"] },
      { label: "Position in search result", vals: ["Medium Slot", "Top Slot", "Top Slot"] },
      { label: "Matching Buyers", vals: ["Upto 5x", "Upto 10x", "Upto 10x"] },
      { label: "Verified Tag on property", vals: [false, true, true] },
      { label: "Email Promotions", vals: [false, true, true] },
      { label: "Relationship Manager Assistance", vals: [false, false, true] },
    ],
  },
  "For Lease": {
    plans: [
      { name: "Premium", popular: false, visibility: 86, price: "₹3,999" },
      { name: "Premium +", popular: true, visibility: 92, price: "₹6,499" },
      { name: "Assist", popular: false, visibility: 98, price: "₹9,999" },
    ],
    features: [
      { label: "Plan Validity", vals: ["90 Days", "120 Days", "120 Days"] },
      { label: "Position in search result", vals: ["Medium Slot", "Top Slot", "Top Slot"] },
      { label: "Matching Tenants", vals: ["Upto 5x", "Upto 10x", "Upto 10x"] },
      { label: "Verified Tag on property", vals: [false, true, true] },
      { label: "Email Promotions", vals: [false, true, true] },
      { label: "Relationship Manager Assistance", vals: [false, false, true] },
    ],
  },
};

function ResidentialPlans({ onUpgrade, onCallback }) {
  const tabs = Object.keys(RESIDENTIAL_PLANS);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { plans, features } = RESIDENTIAL_PLANS[activeTab];
  const popularIdx = plans.findIndex((p) => p.popular);

  return (
    <div>
      <div className="flex justify-center mb-8">
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === t ? "bg-[#1a1a2e] text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[240px]" />
              {plans.map((plan, pi) => (
                <th key={plan.name} className={`text-center pb-4 px-4 min-w-[140px] ${pi === popularIdx ? "border-x-2 border-t-2 border-[#7B2FFF] rounded-t-xl" : ""}`}>
                  {pi === popularIdx && (
                    <div className="bg-pink-100 text-pink-500 text-[10px] font-bold px-3 py-0.5 rounded-full inline-block mb-2 uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}
                  <p className="text-base font-extrabold text-[#1a1a2e]">{plan.name}</p>
                  <div className="mt-2 flex justify-center">
                    <VisibilityGauge percent={plan.visibility} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((row) => (
              <tr key={row.label} className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    {row.label}
                    {row.badge && (
                      <span className="bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{row.badge}</span>
                    )}
                  </span>
                </td>
                {row.vals.map((val, pi) => (
                  <td key={pi} className={`py-3 px-4 text-center ${pi === popularIdx ? "border-x-2 border-[#7B2FFF] bg-[#faf8ff]" : ""}`}>
                    <Cell val={val} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-gray-200">
              <td />
              {plans.map((plan, pi) => (
                <td key={plan.name} className={`py-5 px-4 text-center ${pi === popularIdx ? "border-x-2 border-[#7B2FFF] bg-[#faf8ff]" : ""}`}>
                  <p className="text-lg font-extrabold text-[#1a1a2e] mb-3">{plan.price}</p>
                  <button
                    onClick={() => onUpgrade(plan.name)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                      pi === popularIdx
                        ? "bg-[#7B2FFF] hover:bg-[#6320d4] text-white"
                        : "border border-[#7B2FFF] text-[#7B2FFF] hover:bg-[#f0ebff]"
                    }`}
                  >
                    Purchase
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              <td />
              {plans.map((_, pi) => (
                <td key={pi} className={pi === popularIdx ? "border-x-2 border-b-2 border-[#7B2FFF] rounded-b-xl h-2" : ""} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={onCallback} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition w-fit">
          <span className="w-6 h-6 bg-[#f0ebff] rounded-full flex items-center justify-center text-xs">👤</span>
          Having Trouble? <strong>Request a Callback</strong>
        </button>
        <p className="text-xs text-[#7B2FFF] font-semibold cursor-pointer hover:underline w-fit">Terms & Conditions</p>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[700px]">*Photography services are only available in Bengaluru, Chennai, Delhi, Faridabad, Ghaziabad, Gurgaon, Hyderabad, Kolkata, Mumbai, Noida, Pune, Ahmedabad, Navi Mumbai, Thane and Greater Noida</p>
        <p className="text-[11px] text-gray-400">*These packages are only applicable for Residential listings. To view packages for commercial please select the commercial tab.</p>
      </div>
    </div>
  );
}

function CommercialPlans({ onUpgrade, onCallback }) {
  const tabs = Object.keys(COMMERCIAL_PLANS);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { plans, features } = COMMERCIAL_PLANS[activeTab];
  const popularIdx = plans.findIndex((p) => p.popular);

  return (
    <div>
      <div className="flex justify-center mb-8">
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === t ? "bg-[#1a1a2e] text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[240px]" />
              {plans.map((plan, pi) => (
                <th key={plan.name} className={`text-center pb-4 px-4 min-w-[140px] ${pi === popularIdx ? "border-x-2 border-t-2 border-[#7B2FFF] rounded-t-xl" : ""}`}>
                  {pi === popularIdx && (
                    <div className="bg-pink-100 text-pink-500 text-[10px] font-bold px-3 py-0.5 rounded-full inline-block mb-2 uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}
                  <p className="text-base font-extrabold text-[#1a1a2e]">{plan.name}</p>
                  <div className="mt-2 flex justify-center">
                    <VisibilityGauge percent={plan.visibility} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((row) => (
              <tr key={row.label} className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">{row.label}</span>
                </td>
                {row.vals.map((val, pi) => (
                  <td key={pi} className={`py-3 px-4 text-center ${pi === popularIdx ? "border-x-2 border-[#7B2FFF] bg-[#faf8ff]" : ""}`}>
                    <Cell val={val} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-gray-200">
              <td />
              {plans.map((plan, pi) => (
                <td key={plan.name} className={`py-5 px-4 text-center ${pi === popularIdx ? "border-x-2 border-[#7B2FFF] bg-[#faf8ff]" : ""}`}>
                  <p className="text-lg font-extrabold text-[#1a1a2e] mb-3">{plan.price}</p>
                  <button
                    onClick={() => onUpgrade(plan.name)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                      pi === popularIdx
                        ? "bg-[#7B2FFF] hover:bg-[#6320d4] text-white"
                        : "border border-[#7B2FFF] text-[#7B2FFF] hover:bg-[#f0ebff]"
                    }`}
                  >
                    Purchase
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              <td />
              {plans.map((_, pi) => (
                <td key={pi} className={pi === popularIdx ? "border-x-2 border-b-2 border-[#7B2FFF] rounded-b-xl h-2" : ""} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={onCallback} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition w-fit">
          <span className="w-6 h-6 bg-[#f0ebff] rounded-full flex items-center justify-center text-xs">👤</span>
          Having Trouble? <strong>Request a Callback</strong>
        </button>
        <p className="text-xs text-[#7B2FFF] font-semibold cursor-pointer hover:underline w-fit">Terms & Conditions</p>
        <p className="text-[11px] text-gray-400">*These packages are only applicable for Commercial listings. To view packages for residential please select the residential tab.</p>
      </div>
    </div>
  );
}

// ── Steps data ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "1",
    title: "Upload your property",
    desc: "Provide your personal details, property details, and pricing information to post your property ad online.",
    icon: "🏠",
  },
  {
    num: "2",
    title: "Choose a package",
    desc: "Select a package that best suits your needs. Each package offers different features and benefits to help you reach potential buyers or renters.",
    icon: "📋",
  },
  {
    num: "3",
    title: "Property gets promoted to get unlimited enquiries",
    desc: "RealSquare makes it easy to reach the right tenants and buyers, finding you the perfect match through targeted promotion and qualified enquiries.",
    icon: "🔔",
  },
  {
    num: "4",
    title: "Dedicated RM filters out only the best suited enquiries for you",
    desc: "Our Relationship Manager personally contacts potential tenants or buyers on your behalf. Sit back, relax, and trust them to handle everything smoothly.",
    icon: "👔",
    badge: "For Assisted Packages Only",
  },
];

const TESTIMONIALS = [
  {
    name: "Nabashis Mallick",
    city: "From Kolkata",
    date: "December 12, 2023",
    stars: 5,
    text: "Using RealSquare was an absolute delight! Their executives provided continuous, top-notch leads directly, showcasing their dedication to customer satisfaction.",
    plan: "Assist +",
    rm: "Ramanand",
  },
  {
    name: "Mohan Bhawkar",
    city: "From Pune",
    date: "March 15, 2024",
    stars: 5,
    text: "I'm incredibly grateful for the support from my RealSquare relationship manager. With their proactive approach and unwavering assistance, navigating deals has never been easier.",
    plan: "Guarantee",
    rm: "Anjali Basu",
  },
  {
    name: "Priya Sharma",
    city: "From Mumbai",
    date: "January 8, 2024",
    stars: 5,
    text: "Got genuine buyer enquiries within 3 days of posting. The premium plan was totally worth it. Sold my flat in under 2 weeks!",
    plan: "Premium +",
    rm: "Vikram Nair",
  },
];

const BENEFITS = [
  { icon: "📊", text: "Get the top slot on property listings to stand out from the rest" },
  { icon: "🏷️", text: "Get special property tags to attract more enquiries" },
  { icon: "🥽", text: "Get 360 property visual experience with our patented Digitour" },
  { icon: "🎧", text: "Dedicated Relationship Manager" },
  { icon: "✅", text: "Verified & filtered enquiries with Tenant Profiles" },
];

// ── Upgrade Modal ─────────────────────────────────────────────────────────
function UpgradeModal({ planName, onClose }) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 text-center relative" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}><FiX size={20} /></button>
        <div className="w-16 h-16 bg-[#f0ebff] rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck size={30} className="text-[#7B2FFF]" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1a1a2e] mb-2">Plan Activated! 🎉</h3>
        <p className="text-sm text-gray-500 mb-1">Your <strong className="text-[#7B2FFF]">{planName}</strong> plan has been successfully purchased.</p>
        <p className="text-sm text-gray-400 mb-6">Our onboarding team will reach out within 24 hours.</p>
        <button onClick={onClose} className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition">Done</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function OwnersPage() {
  const navigate = useNavigate();
  const [showCommercial, setShowCommercial] = useState(false);
  const [showCallback, setShowCallback] = useState(false);
  const [upgradedPlan, setUpgradedPlan] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const visibleTestimonials = TESTIMONIALS.slice(testimonialIdx, testimonialIdx + 2);

  return (
    <>
      <PageSpinner />
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#2d1b69] to-[#7B2FFF] min-h-[420px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-5"
              style={{ width: 180 + i * 90, height: 180 + i * 90, top: `${i * 12}%`, right: `${i * 8}%` }} />
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto px-6 py-16 relative z-10 w-full flex flex-col md:flex-row md:items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-white mb-4 max-w-[560px] leading-tight">
              Sell or Rent Your Property <span className="underline decoration-yellow-400">Effortlessly</span> with RealSquare
            </h1>
            <p className="text-purple-200 text-base mb-8 max-w-[460px]">
              India's trusted platform to connect with genuine buyers and renters
            </p>
            <button
              onClick={() => document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-[#7B2FFF] font-bold px-7 py-3 rounded-xl hover:bg-purple-50 transition flex items-center gap-2 w-fit"
            >
              Explore Owner Plans <FiArrowRight size={16} />
            </button>
          </div>

          {/* Hero illustration */}
          <div className="flex-shrink-0 hidden md:flex items-center justify-center">
            <div className="relative w-[280px] h-[320px]">
              {/* Phone mockup */}
              <div className="absolute right-0 top-0 w-[200px] h-[300px] bg-white rounded-[28px] shadow-2xl flex flex-col items-center justify-center gap-4 border-4 border-white/20">
                <div className="w-14 h-14 bg-[#7B2FFF] rounded-full flex items-center justify-center">
                  <FiCheck size={28} className="text-white" />
                </div>
                <div className="w-[120px] h-[80px] bg-[#f0ebff] rounded-xl flex items-center justify-center text-4xl">🏡</div>
                <div className="flex flex-col gap-2 w-[140px]">
                  {[80, 60, 40].map((w, i) => (
                    <div key={i} className="h-2 bg-purple-200 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-gray-200" />
              </div>
              {/* Decorative circles */}
              <div className="absolute -left-4 bottom-10 w-[90px] h-[90px] bg-[#7B2FFF]/30 rounded-full" />
              <div className="absolute left-8 bottom-0 w-[50px] h-[50px] bg-green-400/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Plans Section ── */}
      <section id="plans-section" className="bg-[#f7f8fa] py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-[#1a1a2e]">Get 10x leads by upgrading to an owner plan</h2>
            <button
              onClick={() => setShowCommercial((v) => !v)}
              className="text-sm text-[#7B2FFF] font-semibold hover:underline flex items-center gap-1"
            >
              🏢 {showCommercial ? "Explore Residential Packages" : "Explore Commercial Packages"}
            </button>
          </div>
          {showCommercial ? (
            <CommercialPlans onUpgrade={(name) => setUpgradedPlan(name)} onCallback={() => setShowCallback(true)} />
          ) : (
            <ResidentialPlans onUpgrade={(name) => setUpgradedPlan(name)} onCallback={() => setShowCallback(true)} />
          )}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1a1a2e] text-center mb-2">
            Why 2Mn+ property owners choose RealSquare
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Monthly <strong>17Mn+ property seekers</strong> visit RealSquare in search of their right homes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left big card */}
            <div className="bg-[#d1fae5] rounded-2xl p-6 flex flex-col items-center justify-between min-h-[320px]">
              {/* Dashboard mockup */}
              <div className="w-full bg-[#1a1a2e] rounded-xl overflow-hidden mb-5 shadow-lg">
                <div className="bg-[#2d1b69] px-4 py-2 flex gap-2">
                  {["Dashboard", "Leads", "Listings", "Subscriptions"].map((t) => (
                    <span key={t} className="text-[10px] text-purple-300 font-medium">{t}</span>
                  ))}
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {["Pankaj Mishra", "Amit Chakrapani", "Jitesh Prakash", "Rajni Gupta", "Priyesh Shrimali", "Mayur Karodia"].map((n) => (
                    <div key={n} className="bg-white/10 rounded-lg p-2">
                      <div className="w-5 h-5 bg-purple-400 rounded-full mb-1" />
                      <p className="text-[8px] text-white font-semibold truncate">{n}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-[#1a1a2e]">Verified seekers</p>
                <p className="text-sm text-gray-600 mt-1">We bring serious buyers and renters directly to you.</p>
              </div>
            </div>

            {/* Right two cards */}
            <div className="flex flex-col gap-5">
              <div className="bg-[#fce7f3] rounded-2xl p-6 flex items-center justify-between flex-1">
                <div>
                  <p className="text-lg font-extrabold text-[#1a1a2e] mb-1">Maximum visibility</p>
                  <p className="text-sm text-gray-600 max-w-[200px]">Showcase your property to thousands of seekers every day</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-16 h-12 bg-[#7B2FFF] rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🏠</span>
                  </div>
                  <span className="text-[10px] text-[#7B2FFF] font-semibold">Upgraded listing</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between flex-1 shadow-sm">
                <div>
                  <p className="text-lg font-extrabold text-[#1a1a2e] mb-1">Smart tools</p>
                  <p className="text-sm text-gray-600 max-w-[200px]">Easy-to-use tools to create, optimise, and boost your listing</p>
                </div>
                <div className="w-20 h-16 flex-shrink-0">
                  {/* Gauge illustration */}
                  <svg viewBox="0 0 80 50" className="w-full h-full">
                    <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="60 94" />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="60%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <circle cx="40" cy="45" r="3" fill="#f97316" />
                    <text x="40" y="38" textAnchor="middle" fontSize="7" fill="#6b7280">Rent Rate</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#f0ebff]/40 py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-center text-xs font-bold text-[#7B2FFF] uppercase tracking-widest mb-2">How It Works</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a2e] text-center mb-12">
            4 easy steps to list & promote your properties
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                <span className="text-[80px] font-extrabold text-[#7B2FFF]/10 leading-none select-none absolute -top-4 left-1/2 -translate-x-1/2">
                  {step.num}
                </span>
                <div className="relative z-10 w-20 h-20 bg-[#f0ebff] rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                  {step.icon}
                </div>
                <p className="text-[11px] font-bold text-[#e11d48] uppercase tracking-wide mb-1">Step {step.num}</p>
                <p className="text-sm font-bold text-[#1a1a2e] mb-2">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                {step.badge && (
                  <span className="mt-2 bg-[#7B2FFF] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    {step.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#7B2FFF] uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-8">
            Boost your sales with our incredible packages
          </h2>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {visibleTestimonials.map((t) => (
                <div key={t.name} className="border border-gray-200 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(t.stars)].map((_, i) => (
                          <FiStar key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{t.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{t.text}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f0ebff] rounded-full flex items-center justify-center text-sm font-bold text-[#7B2FFF]">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a2e]">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs bg-[#f0ebff] text-[#7B2FFF] px-3 py-1 rounded-full font-medium">
                      Plan: {t.plan}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                      Assisted RM: {t.rm}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Next arrow */}
            {testimonialIdx + 2 < TESTIMONIALS.length && (
              <button
                onClick={() => setTestimonialIdx((i) => Math.min(i + 1, TESTIMONIALS.length - 2))}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition"
              >
                <FiChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-[#f0ebff]/50 py-16 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-xs font-bold text-[#7B2FFF] uppercase tracking-widest mb-2">Benefits</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-12">
            Unlock these benefits with a package purchase
          </h2>

          <div className="flex flex-wrap justify-center gap-10">
            {BENEFITS.map((b) => (
              <div key={b.text} className="flex flex-col items-center gap-3 max-w-[160px]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm border border-[#e4d9ff]">
                  {b.icon}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="bg-gradient-to-r from-[#7B2FFF] to-[#4f46e5] py-14 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to sell or rent your property?</h2>
          <p className="text-purple-200 mb-8">Join 2Mn+ owners already growing with RealSquare. Post your property and get genuine enquiries.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setShowCallback(true)}
              className="bg-white text-[#7B2FFF] font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition flex items-center gap-2"
            >
              <FiPhone size={15} /> Request a Callback
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Explore Platform
            </button>
          </div>
        </div>
      </div>

      <Footer />
      {showCallback && <CallbackModal onClose={() => setShowCallback(false)} />}
      {upgradedPlan && <UpgradeModal planName={upgradedPlan} onClose={() => setUpgradedPlan(null)} />}
    </>
  );
}
