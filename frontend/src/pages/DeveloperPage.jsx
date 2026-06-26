import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiPhone, FiArrowRight, FiX, FiStar } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";


// ── Data ──────────────────────────────────────────────────────────────────

const AD_PRODUCTS = [
  {
    name: "RealSquare's top picks",
    coins: 500,
    image: "https://drive.google.com/thumbnail?id=1aZY4eSJyAP3kkxqDYfIbQpymFduDIhCX&sz=w1000",
    points: [
      "Most premium slot — featured in RealSquare's curated top picks",
      "Shown to high-intent buyers on homepage and listing pages",
      "Builds instant credibility and brand trust",
      "Highest priority placement on the platform",
    ],
  },
  {
    name: "Spotlight projects",
    coins: 350,
    image: "https://drive.google.com/thumbnail?id=1Qk1mqKsYU9L8ofxAp7XWeLme0Wt5faXp&sz=w1000",
    points: [
      "Feature your project in the Spotlight section",
      "Large image-overlay cards with price and location",
      "Drives discovery among buyers browsing new launches",
      "Second highest visibility slot on RealSquare",
    ],
  },
  {
    name: "Top builders",
    coins: 280,
    image: "https://drive.google.com/thumbnail?id=1ZXmt3LICvzr4u6YIQ1SGR6NmTvzPFlMF&sz=w1000",
    points: [
      "Get listed under Top Builders section on homepage",
      "Showcase multiple projects under your developer brand",
      "Buyers can browse all your projects in one place",
      "Builds long-term developer brand recognition",
    ],
  },
  {
    name: "Projects by leading builders",
    coins: 220,
    image: "https://drive.google.com/thumbnail?id=1FBMhhiRMS70O547T1XIQKJIyumFRXroq&sz=w1000",
    points: [
      "Appear in the 'Projects by Leading Builders' horizontal strip",
      "Shown across homepage and search result pages",
      "Targets buyers who trust established developer names",
      "Rotates with other leading builder projects",
    ],
  },
  {
    name: "Featured Projects to explore",
    coins: 180,
    image: "https://drive.google.com/thumbnail?id=1W3X0WV1VvwdxYN1nM2gGHKHTegLCVP2W&sz=w1000",
    points: [
      "Feature in the 'Featured Projects to Explore' section",
      "Large card format with image, price and developer name",
      "Ideal for new launches seeking early buyer interest",
      "Drives clicks from buyers actively exploring options",
    ],
  },
];

const CONTENT_PRODUCTS = [
  {
    name: "Virtual Site Tour",
    coins: 300,
    points: [
      "360° panoramic walkthrough of the project",
      "Works on mobile and desktop without any app",
      "Embed floor plan navigation inside the tour",
      "Reduces need for physical site visits",
    ],
  },
  {
    name: "3D Project Render",
    coins: 250,
    points: [
      "Photorealistic renders of towers and interiors",
      "Showcase amenities before construction completes",
      "Used across listings, ads and project pages",
      "Builds buyer confidence in under-construction projects",
    ],
  },
  {
    name: "Interactive Floor Plan",
    coins: 200,
    points: [
      "Clickable floor plan with room-level details",
      "Buyers can explore each unit configuration",
      "Supports multiple BHK variants in one view",
      "Increases time-on-page and lead quality",
    ],
  },
  {
    name: "Project Microsite",
    coins: 400,
    points: [
      "Dedicated landing page for your project",
      "Includes gallery, amenities, location map and RERA",
      "Custom URL shareable on WhatsApp and social media",
      "Integrated lead capture form",
    ],
  },
];

const VIDEO_PRODUCTS = [
  {
    name: "Drone Aerial Video",
    coins: 450,
    points: [
      "High-resolution aerial footage of the project site",
      "Showcases surrounding infrastructure and connectivity",
      "Ideal for large township and villa projects",
      "Dramatically improves listing engagement",
    ],
  },
  {
    name: "Project Walkthrough",
    coins: 380,
    points: [
      "Cinematic walkthrough of sample flat and amenities",
      "Professionally scripted and narrated",
      "Distributed across listings and social media",
      "Converts fence-sitters into serious enquiries",
    ],
  },
  {
    name: "Short Reel",
    coins: 150,
    points: [
      "60-second vertical video for Instagram & YouTube Shorts",
      "Highlights top 3 USPs of the project",
      "Optimised for mobile-first buyers",
      "High shareability drives organic reach",
    ],
  },
  {
    name: "Area Connectivity Video",
    coins: 200,
    points: [
      "Documents key landmarks, roads and transit near the project",
      "Builds buyer confidence in location",
      "Covers schools, hospitals, malls and metro stations",
      "Pairs well with locality billboard ads",
    ],
  },
];

const STATS = [
  { value: "500+", label: "Developer Partners" },
  { value: "12K+", label: "Projects Listed" },
  { value: "3.2L+", label: "Buyer Enquiries/Month" },
  { value: "4.8★", label: "Developer Satisfaction" },
];

// ── Reusable Tab Section ──────────────────────────────────────────────────

function TabSection({ title, subtitle, items, renderPreview }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl font-extrabold text-[#1a1a2e] uppercase tracking-wide mb-1">{title}</h2>
        <p className="text-sm text-gray-400 mb-8">{subtitle}</p>

        {/* Thumbnail tabs */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 mb-8">
          {items.map((item, i) => (
            <button
              key={item.name}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-opacity ${active === i ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
            >
              {item.image ? (
                <div className={`w-[120px] h-[76px] rounded-lg overflow-hidden border-2 transition ${active === i ? "border-[#7B2FFF]" : "border-transparent"}`}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-[120px] h-[76px] rounded-lg border-2 bg-[#f0ebff] flex items-center justify-center transition ${active === i ? "border-[#7B2FFF]" : "border-gray-200"}`}>
                  <FiStar size={20} className="text-[#7B2FFF]" />
                </div>
              )}
              <span className={`text-xs font-semibold whitespace-nowrap ${active === i ? "text-[#7B2FFF]" : "text-gray-500"}`}>
                {item.name}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                🪙 {item.coins}
              </span>
            </button>
          ))}
        </div>

        {/* Active item detail */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">{current.name}</h3>
            <ul className="flex flex-col gap-3 mb-6">
              {current.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7B2FFF] mt-2 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            {/* Coin price + Unlock button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <span className="text-xl">🪙</span>
                <div>
                  <p className="text-[11px] text-amber-600 font-medium leading-none mb-0.5">Required Coins</p>
                  <p className="text-lg font-extrabold text-amber-500 leading-none">{current.coins}</p>
                </div>
              </div>
              <button className="bg-[#7B2FFF] hover:bg-[#6320d4] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2">
                🔓 Unlock Now
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 max-w-[560px]">
            {renderPreview(current)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────

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

// ── Main Page ─────────────────────────────────────────────────────────────

export default function DeveloperPage() {
  const navigate = useNavigate();
  const [showCallModal, setShowCallModal] = useState(false);

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
                For Developers & Builders
              </span>
              <h1 className="text-4xl font-extrabold text-white mb-4 max-w-[600px] leading-tight">
                Sell faster with India's smartest property platform
              </h1>
              <p className="text-purple-200 text-base mb-6 max-w-[500px]">
                From homepage takeovers to virtual tours — everything you need to put your project in front of the right buyers.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowCallModal(true)}
                  className="bg-white text-[#7B2FFF] font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition flex items-center gap-2"
                >
                  Get Started <FiArrowRight size={16} />
                </button>
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

      {/* Stats */}
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

      {/* AD PRODUCTS */}
      <div className="bg-white border-t border-gray-100">
        <TabSection
          title="Ad Products"
          subtitle="Best-in-industry placements to give your project maximum brand visibility"
          items={AD_PRODUCTS}
          renderPreview={(item) => (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={item.image} alt={item.name} className="w-full h-auto object-cover" />
            </div>
          )}
        />
      </div>

      {/* CONTENT PRODUCTS */}
      <div className="bg-[#f7f8fa] border-t border-gray-100">
        <TabSection
          title="Content Products"
          subtitle="Digitally rich content to showcase every aspect of your project"
          items={CONTENT_PRODUCTS}
          renderPreview={() => (
            <div className="rounded-2xl bg-[#f0ebff] border border-[#e4d9ff] h-[260px] flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-14 h-14 bg-[#7B2FFF]/10 rounded-full flex items-center justify-center">
                <FiStar size={24} className="text-[#7B2FFF]" />
              </div>
              <p className="text-sm font-semibold text-[#7B2FFF]">Preview available after onboarding</p>
              <p className="text-xs text-gray-400">Our team will walk you through a live demo of this product</p>
            </div>
          )}
        />
      </div>

      {/* VIDEO OFFERINGS */}
      <div className="bg-white border-t border-gray-100">
        <TabSection
          title="Video Offerings"
          subtitle="Engaging video content to bring all vital aspects of your project to life"
          items={VIDEO_PRODUCTS}
          renderPreview={() => (
            <div className="rounded-2xl bg-gray-900 h-[260px] flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">▶</span>
              </div>
              <p className="text-sm font-semibold text-white">Sample video available on request</p>
              <p className="text-xs text-gray-400">Contact our team to view a demo reel for this product</p>
            </div>
          )}
        />
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-[#7B2FFF] to-[#4f46e5] py-14 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to launch your project?</h2>
          <p className="text-purple-200 mb-8">500+ developers trust RealSquare to drive quality buyer enquiries. Let's get your project in front of the right audience.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setShowCallModal(true)}
              className="bg-white text-[#7B2FFF] font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition"
            >
              Get In Touch
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
      {showCallModal && <CallSupportModal onClose={() => setShowCallModal(false)} />}
    </>
  );
}
