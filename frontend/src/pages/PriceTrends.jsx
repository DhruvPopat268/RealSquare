import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiX, FiChevronRight, FiSearch, FiMapPin, FiChevronDown } from "react-icons/fi";
import { priceTrendsData, QUARTERS, CITIES } from "../data/priceTrends";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const PROP_TYPES = ["Apartment", "Independent House", "Villa"];

const POPULAR_CITIES = [
  { name: "Ahmedabad", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=80&fit=crop" },
  { name: "Vadodara",  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=80&fit=crop" },
  { name: "Mumbai",    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=120&h=80&fit=crop" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop" },
];

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let autocompleteService = null;

function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (document.getElementById("gmap-script")) {
    return new Promise((res) => {
      const t = setInterval(() => { if (window.google?.maps?.places) { clearInterval(t); res(); } }, 100);
    });
  }
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.id = "gmap-script";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    s.async = true; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── City Picker Modal ──────────────────────────────────────────────────────
function CityPickerModal({ selectedCity, onSelect, onClose }) {
  const [citySearch, setCitySearch] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [citySearching, setCitySearching] = useState(false);
  const debounceRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      autocompleteService = new window.google.maps.places.AutocompleteService();
    });
  }, []);

  const handleCitySearch = (e) => {
    const v = e.target.value;
    setCitySearch(v);
    clearTimeout(debounceRef.current);
    if (!v.trim()) { setCitySuggestions([]); setCitySearching(false); return; }
    setCitySearching(true);
    debounceRef.current = setTimeout(() => {
      if (!autocompleteService) { setCitySearching(false); return; }
      autocompleteService.getPlacePredictions(
        { input: v, componentRestrictions: { country: "in" }, types: ["(cities)"] },
        (results, status) => {
          setCitySearching(false);
          setCitySuggestions(status === "OK" && results ? results.slice(0, 6) : []);
        }
      );
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-base font-bold text-[#1a1a2e]">Select a City</p>
            <p className="text-xs text-gray-400 mt-0.5">to view property price trends</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 border-2 border-gray-200 focus-within:border-[#7B2FFF] rounded-xl px-3 py-2.5 transition">
            <FiSearch size={15} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 border-none outline-none text-sm text-gray-700 bg-transparent"
              placeholder="Search for a city..."
              value={citySearch}
              onChange={handleCitySearch}
            />
            {citySearching && (
              <span className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Google suggestions */}
        {citySuggestions.length > 0 && (
          <div className="border-t border-gray-100 max-h-[200px] overflow-y-auto">
            {citySuggestions.map((s) => {
              const cityName = s.description.split(",")[0].trim();
              return (
                <button
                  key={s.place_id}
                  onMouseDown={() => onSelect(cityName)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f5f0ff] text-left transition"
                >
                  <FiMapPin size={13} className="text-[#7B2FFF] flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-medium">{cityName}</span>
                  <span className="text-xs text-gray-400 truncate">{s.description.split(",").slice(1).join(",")}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Popular cities grid */}
        {citySuggestions.length === 0 && (
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Popular Cities</p>
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  onMouseDown={() => onSelect(c.name)}
                  className={`relative rounded-xl overflow-hidden h-[72px] border-2 transition ${
                    selectedCity === c.name ? "border-[#7B2FFF]" : "border-transparent hover:border-[#7B2FFF]"
                  }`}
                >
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                    selectedCity === c.name ? "text-[#c4b5fd]" : "text-white"
                  }`}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inline SVG line chart ──────────────────────────────────────────────────
function LineChart({ data, quarters }) {
  const W = 460, H = 220, PL = 60, PR = 20, PT = 20, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const min = Math.min(...data) * 0.98;
  const max = Math.max(...data) * 1.02;
  const range = max - min || 1;

  const px = (i) => PL + (i / (data.length - 1)) * chartW;
  const py = (v) => PT + chartH - ((v - min) / range) * chartH;

  const points = data.map((v, i) => `${px(i)},${py(v)}`).join(" ");

  // Y-axis labels (5 steps)
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = min + (range / ySteps) * i;
    return { val: Math.round(val), y: py(val) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
      {/* Grid lines */}
      {yLabels.map((l) => (
        <g key={l.val}>
          <line x1={PL} y1={l.y} x2={W - PR} y2={l.y} stroke="#f0f0f0" strokeWidth="1" />
          <text x={PL - 6} y={l.y + 4} textAnchor="end" fontSize="10" fill="#aaa">
            {l.val.toLocaleString()}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {quarters.map((q, i) => (
        <text
          key={q}
          x={px(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="9"
          fill="#aaa"
        >
          {q.replace("'", "'")}
        </text>
      ))}

      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${px(0)},${PT + chartH} ${points} ${px(data.length - 1)},${PT + chartH}`}
        fill="url(#areaGrad)"
      />

      {/* Line */}
      <polyline points={points} fill="none" stroke="#7B2FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r="4" fill="#7B2FFF" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ── Trend popup ────────────────────────────────────────────────────────────
function TrendModal({ locality, trendData, onClose }) {
  const [propType, setPropType] = useState("Apartment");

  return (
    <div
      className="fixed inset-0 z-[800] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="text-lg font-bold text-gray-900">{locality} Avg. Price / Sqft</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Property type tabs */}
        <div className="flex gap-2 px-6 pb-4">
          {PROP_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setPropType(t)}
              className={`px-4 py-1.5 rounded-lg border text-sm font-semibold transition ${
                propType === t
                  ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                  : "border-gray-300 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="px-4 pb-2">
          <LineChart data={trendData[propType]} quarters={QUARTERS} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Show Quarterly</span>
          <span className="text-gray-300">|</span>
          <span>Yearly</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PriceTrends() {
  const { city } = useParams();
  const navigate = useNavigate();

  const cityName = CITIES.find((c) => c.toLowerCase() === city?.toLowerCase()) || null;
  const cityData = cityName ? priceTrendsData[cityName] : null;

  const [showPicker, setShowPicker] = useState(!cityName);
  const [intent, setIntent] = useState("buy");
  const [propType, setPropType] = useState("Apartment");
  const [trendModal, setTrendModal] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowPicker(!CITIES.find((c) => c.toLowerCase() === city?.toLowerCase()));
  }, [city]);

  const handleCitySelect = (selected) => {
    setShowPicker(false);
    navigate(`/price-trends/${selected.toLowerCase()}`);
  };

  if (!cityName || !cityData) {
    return (
      <>
        <Navbar />
        <CityPickerModal selectedCity={null} onSelect={handleCitySelect} onClose={() => navigate(-1)} />
      </>
    );
  }

  const data = cityData[intent];
  const rows = data[propType] || data.Apartment;

  return (
    <>
      <PageSpinner key={city} />
      <Navbar />
      {showPicker && <CityPickerModal selectedCity={cityName} onSelect={handleCitySelect} onClose={() => setShowPicker(false)} />}
      <div className="bg-white min-h-screen">
        <div className="max-w-[1100px] mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-6">
            <button onClick={() => navigate("/")} className="hover:text-[#7B2FFF]">Home</button>
            <FiChevronRight size={13} />
            <button onClick={() => navigate(`/price-trends/${cityName.toLowerCase()}`)} className="hover:text-[#7B2FFF]">{cityName}</button>
            <FiChevronRight size={13} />
            <span className="text-gray-600">Property Rates in {cityName}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Property Rates in {cityName}, {cityData.state} - 2026
          </h1>

          {/* City: selected chip + change button only */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex items-center gap-2 px-4 py-1.5 bg-[#7B2FFF] text-white rounded-full text-sm font-semibold">
              <FiMapPin size={13} />
              {cityName}
            </span>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition"
            >
              <FiChevronDown size={13} /> Change City
            </button>
          </div>

          {/* Buy / Rent toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-lg border border-[#7B2FFF] overflow-hidden">
              {["buy", "rent"].map((t) => (
                <button
                  key={t}
                  onClick={() => setIntent(t)}
                  className={`px-12 py-2.5 text-sm font-semibold transition capitalize ${
                    intent === t ? "bg-[#7B2FFF] text-white" : "bg-white text-gray-700 hover:bg-[#f5f0ff]"
                  }`}
                >
                  {t === "buy" ? "Buy" : "Rent"}
                </button>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden mb-8 max-w-[700px] mx-auto">
            <div className="flex-1 px-8 py-5 border-r border-gray-200">
              <p className="text-sm text-gray-400 mb-1">Avg. Price / Sqft</p>
              <p className="text-2xl font-bold text-gray-900">{data.avgPrice}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{data.yoy} Y-o-Y</p>
            </div>
            <div className="flex-1 px-8 py-5 flex flex-col justify-between">
              <p className="text-sm text-gray-400 mb-1">Price Range / Sqft</p>
              <p className="text-2xl font-bold text-gray-900">{data.priceRange}</p>
              <button
                onClick={() => navigate(`/listings?listingType=${intent.toUpperCase()}&city=${cityName}`)}
                className="text-xs text-[#7B2FFF] font-semibold mt-1 hover:underline text-left"
              >
                See {(data.totalProperties / 1000).toFixed(0)}K+ Properties →
              </button>
            </div>
          </div>

          {/* Property type tabs */}
          <div className="flex gap-6 border-b border-gray-200 mb-0">
            {PROP_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setPropType(t)}
                className={`pb-3 text-sm font-semibold transition border-b-2 -mb-px ${
                  propType === t
                    ? "border-[#7B2FFF] text-[#7B2FFF]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-b-xl overflow-hidden mb-10">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.5fr_2fr_1.5fr_1.5fr] bg-gray-50 border-b border-gray-200 px-6 py-3">
              {["Locality", "Avg. Price / Sqft", "Price Range / Sqft", "Trend", "View Properties"].map((h) => (
                <span key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.locality}
                className={`grid grid-cols-[2fr_1.5fr_2fr_1.5fr_1.5fr] px-6 py-4 items-center ${
                  i !== rows.length - 1 ? "border-b border-gray-100" : ""
                } hover:bg-gray-50 transition`}
              >
                <span className="text-sm font-medium text-gray-800">{row.locality}</span>
                <span className="text-sm text-gray-700">{row.avgPrice}</span>
                <span className="text-sm text-gray-500">{row.priceRange}</span>
                <button
                  onClick={() => setTrendModal({ locality: row.locality, trendData: row.trend })}
                  className="w-fit px-4 py-1.5 border border-[#7B2FFF] text-[#7B2FFF] rounded-lg text-xs font-semibold hover:bg-[#f5f0ff] transition"
                >
                  See Trend
                </button>
                <button
                  onClick={() => navigate(`/listings?listingType=${intent.toUpperCase()}&city=${cityName}&areas=${encodeURIComponent(row.locality)}`)}
                  className="w-fit px-4 py-1.5 bg-[#7B2FFF] text-white rounded-lg text-xs font-semibold hover:bg-[#6320d4] transition"
                >
                  See {row.count}+ Properties
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer />

      {/* Trend modal */}
      {trendModal && (
        <TrendModal
          locality={trendModal.locality}
          trendData={trendModal.trendData}
          onClose={() => setTrendModal(null)}
        />
      )}
    </>
  );
}
