import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiPhone, FiArrowRight, FiStar, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const PLANS = [
  {
    name: "RealSquare Pro",
    badge: "Elite",
    badgeColor: "bg-blue-500",
    features: [
      "Maximum search visibility across all localities",
      "Unlimited listing slots with auto-rotation",
      "Premium branded listing cards with logo",
      "Video property previews on search results",
      "Dedicated agent profile page",
      "Priority placement on homepage",
      "Unlimited property self-verification",
      "24/7 dedicated account manager",
    ],
  },
  {
    name: "RealSquare Expert",
    badge: "Premium",
    badgeColor: "bg-orange-400",
    features: [
      "High visibility across your active localities",
      "Branded listing cards with agent photo",
      "Reusable listing slots for inventory rotation",
      "Agent profile page with strong branding",
      "Featured on search result pages",
      "On-ground property verification support",
      "Unlimited self-verification of properties",
    ],
  },
  {
    name: "RealSquare Plus",
    badge: "Value",
    badgeColor: "bg-green-500",
    features: [
      "Strong search visibility in key localities",
      "Branded listing cards with logo display",
      "Reusable listing slots",
      "Showcase properties to buyers & tenants",
      "On-ground verification in Tier-1 cities",
      "Agent profile page with basic branding",
      "Unlimited self-verification",
    ],
  },
  {
    name: "RealSquare Starter",
    badge: "Starter",
    badgeColor: "bg-gray-400",
    features: [
      "Standard listing visibility",
      "Basic listing cards",
      "Reusable listing slots",
      "Unlimited self-verification",
      "Agent microsite with essential info",
      "Showcase properties to active buyers",
    ],
  },
];



const STATS = [
  { value: "2.5L+", label: "Active Buyers Monthly" },
  { value: "15K+", label: "Verified Agents" },
  { value: "76K+", label: "Live Listings" },
  { value: "98%", label: "Lead Response Rate" },
];

// ── Call Support Modal ────────────────────────────────────────────────────
function CallSupportModal({ onClose }) {
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

  const handleSubmit = () => {
    if (validate()) setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6 relative" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>
          <FiX size={20} />
        </button>

        {!submitted ? (
          <>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">Request a Callback</h3>
            <p className="text-sm text-gray-400 mb-5">Our team will call you within 30 minutes</p>

            <div className="flex flex-col gap-4">
              <div>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
                  <span className="px-3 text-sm text-gray-500 border-r border-gray-200 py-3">+91</span>
                  <input
                    className="flex-1 px-3 py-3 text-sm outline-none"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    type="tel"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7B2FFF] transition"
                  placeholder="Your City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-5 bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              Request Call
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">You're all set!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Thanks <strong>{name}</strong>! Our team will call you on <strong>+91 {phone}</strong> shortly. We look forward to helping you grow your business.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-[#7B2FFF] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6320d4] transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plan Purchased Modal ──────────────────────────────────────────────────
function PlanPurchasedModal({ planName, onClose }) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 text-center relative" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>
          <FiX size={20} />
        </button>
        <div className="w-16 h-16 bg-[#f0ebff] rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck size={30} className="text-[#7B2FFF]" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1a1a2e] mb-2">Plan Activated! 🎉</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-1">
          Your <strong className="text-[#7B2FFF]">{planName}</strong> plan has been successfully purchased.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Our onboarding team will reach out within 24 hours to get you started.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          Start Listing Properties
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function BrokerPage() {
  const navigate = useNavigate();
  const [showCallModal, setShowCallModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState(null);

  return (
    <>
      <PageSpinner />
      <Navbar />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#2d1b69] to-[#7B2FFF] min-h-[340px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-5"
              style={{ width: 200 + i * 80, height: 200 + i * 80, top: `${i * 10}%`, left: `${i * 15}%` }} />
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto px-6 py-16 relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="bg-[#7B2FFF]/30 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full border border-purple-400/30 inline-block mb-4">
                For Brokers & Agents
              </span>
              <h1 className="text-4xl font-extrabold text-white mb-4 max-w-[600px] leading-tight">
                Grow your real estate business with RealSquare
              </h1>
              <p className="text-purple-200 text-base mb-6 max-w-[500px]">
                List smarter, reach more buyers, and close deals faster with tools built for serious agents.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white text-[#7B2FFF] font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition flex items-center gap-2"
                >
                  View Plans <FiArrowRight size={16} />
                </button>
                {/* Call Support button in hero */}
                <button
                  onClick={() => setShowCallModal(true)}
                  className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition flex items-center gap-2"
                >
                  <FiPhone size={15} /> Need Help? Call Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-[#7B2FFF]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listing Plans */}
      <div id="plans" className="bg-[#f7f8fa] py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Choose your listing plan</h2>
            <p className="text-sm text-gray-400 mt-1">Pick the plan that matches your business scale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div key={plan.name} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {/* Badge */}
                <div className="flex justify-end px-4 pt-4">
                  <span className={`${plan.badgeColor} text-white text-[11px] font-bold px-3 py-0.5 rounded-full`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Plan name */}
                <div className="px-5 pb-4 pt-2 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#f0ebff] flex items-center justify-center mb-3">
                    <FiStar size={18} className="text-[#7B2FFF]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1a1a2e]">{plan.name}</h3>
                </div>

                {/* Features */}
                <div className="px-5 py-4 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Features</p>
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <FiCheck size={14} className="text-[#7B2FFF] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Single Select Plan button */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setPurchasedPlan(plan.name)}
                    className="w-full py-2.5 bg-[#7B2FFF] hover:bg-[#6320d4] text-white rounded-xl text-sm font-semibold transition"
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-[#7B2FFF] to-[#4f46e5] py-14 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to scale your business?</h2>
          <p className="text-purple-200 mb-8">Join 15,000+ agents already growing with RealSquare. No setup fees, cancel anytime.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-[#7B2FFF] font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition"
            >
              View All Plans
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

      {/* Modals */}
      {showCallModal && <CallSupportModal onClose={() => setShowCallModal(false)} />}
      {purchasedPlan && <PlanPurchasedModal planName={purchasedPlan} onClose={() => setPurchasedPlan(null)} />}
    </>
  );
}
