import { useEffect, useRef, useCallback, useState } from "react";
import { FiSearch } from "react-icons/fi";

const tabs = ["BUY", "RENT", "COMMERCIAL", "PG/CO-LIVING", "PLOTS"];
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const BUILDING_HEIGHTS = [22, 32, 26, 36, 20, 30];

const TAB_CONFIG = {
  BUY: {
    image: "https://images.openai.com/static-rsc-4/OgEyJmYehJ-0JcxBa8tjuxQBxocYJmaJ52cO7AQwOzJrbb8L9a6Qkrf0AXHrQBTQ2Z5aGJ4NeIBYRB3WmzFcsNk4Qz9o4u6qowFlA8z920FjJ8wNsXzjG8RXIkk6NsJx4_BGS33K0_eqaNxEHO1zEhjpjMuTQQ_UjKS1OveeGx1FmWmL9xRUEZj8uBxGetvZ?purpose=fullsize",
    gradient: "linear-gradient(135deg, #c7d2fe, #818cf8, #4f46e5)",
    overlay: "#3730a3",
  },
  RENT: {
    image: "https://images.openai.com/static-rsc-4/2pbY7RrET2xwc22X83QJM00rulGkGNxutE9ZKN45ENy_ivSuoBTpUCrYuONvR5zARc84Mj9HCkDCBz9NG0HBUjJ6d4p0sGtWX1Ed0OGYy1kzjYgtfYiHjVWnVZOyR97D761nMqhsWx2hW8r8OALd99Rx1J165DFixpExP5H5XlsmnWscHNxw7b71fcxgLSt2?purpose=fullsize",
    gradient: "linear-gradient(135deg, #99f6e4, #2dd4bf, #0d9488)",
    overlay: "#0f766e",
  },
  COMMERCIAL: {
    image: "https://images.openai.com/static-rsc-4/R_cdKb6SgmIEAYa_bfnkcK5Nt-fY1n4KXWdZ_TBRiymoI2f_FIVqQwM5bEKdajIatnYbk1asXzr4s9EzzOn0uM7ZKT7X4ZFG2BNu6CZeALOwrYC5jgkDBf-3a5A9HRNeX3jA-ia1PsSVcfabl9IPUIAmmxYcLvKXN9bQ5hwYaVXatYZ__xPxzGsje9cS8V2O?purpose=fullsize",
    gradient: "linear-gradient(135deg, #bae6fd, #38bdf8, #0ea5e9)",
    overlay: "#0369a1",
  },
  "PG/CO-LIVING": {
    image: "https://images.openai.com/static-rsc-4/GBreYPOJqR6c0KMcRile8uJDlCi9_tJ8Rvfu80KkulxT_t-opUxZUROHmQHEIWMxF6c3VPROZk6Ry023HEQ7l08jcyblBjZIV_JNojKooH9WNXQery0IVUSMbwPtVcpHvKbMoEqnibE-rPJDKEfh-LPKzRpx6byRA3XIDSU-inO2ssdle0dl-HWRV4_sGcAk?purpose=fullsize",
    gradient: "linear-gradient(135deg, #fce7f3, #f9a8d4, #ec4899)",
    overlay: "#be185d",
  },
  PLOTS: {
    image: "https://images.openai.com/static-rsc-4/cgdF4PIqSn1ED2SYfN-6U099LhKJotcRXIeD6NvWaRx-xV9UPqdxa5w_nNrxWREi6AN9x-sXrSUdbs09in1OsgJydXo7XS2g75waEFbdeDBl6WcV_7gP0XHcHXZRUilD-W03a0oK0br153BLtlPF1eSam3JBLrNin4SyIai5eiO36wjoW6QqPl7o2JJiUAVg?purpose=fullsize",
    gradient: "linear-gradient(135deg, #bbf7d0, #4ade80, #16a34a)",
    overlay: "#15803d",
  },
};

let autocompleteService = null;

function loadGoogleMapsScript() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (document.getElementById("gmap-script")) {
    return new Promise((res) => {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(interval); res(); }
      }, 100);
    });
  }
  return new Promise((res, rej) => {
    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = res;
    script.onerror = rej;
    document.head.appendChild(script);
  });
}

export default function Hero({ activeTab, setActiveTab, searchQuery, setSearchQuery, onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      autocompleteService = new window.google.maps.places.AutocompleteService();
    });
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const fetchSuggestions = useCallback((value) => {
    if (!value.trim()) { setSuggestions([]); setSearching(false); return; }
    if (!autocompleteService) { setSearching(false); return; }
    autocompleteService.getPlacePredictions(
      { input: value, componentRestrictions: { country: "in" }, types: ["geocode", "establishment"] },
      (results, status) => {
        setSearching(false);
        if (status === "OK" && results) {
          setSuggestions(results.slice(0, 6));
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }
    );
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); setShowDropdown(false); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 500);
  };

  const handleSelect = (description) => {
    const loc = description.split(",")[0].trim();
    setQuery(loc); setSearchQuery(loc);
    setSuggestions([]); setShowDropdown(false);
    onSearch();
  };

  const handleCityClick = (city) => {
    setQuery(city); setSearchQuery(city);
    setSuggestions([]); setShowDropdown(false);
    onSearch();
  };

  const config = TAB_CONFIG[activeTab];

  return (
    <section
      className="relative min-h-[520px] flex items-center justify-center overflow-hidden px-5 py-12 md:px-10 transition-all duration-400"
      style={{ background: config.gradient }}
    >
      {/* Decorative buildings */}
      <div className="absolute left-0 bottom-0 flex items-end gap-1.5 pl-4 opacity-[0.12] pointer-events-none" aria-hidden="true">
        {BUILDING_HEIGHTS.map((h, i) => (
          <div key={i} className="flex flex-col gap-1 items-center">
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                className="w-9 border-[1.5px] border-white rounded-sm"
                style={{ height: h }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-[620px] text-center">
        <h1 className="text-[26px] sm:text-[36px] font-extrabold text-white tracking-tight leading-snug mb-2">
          Find Your Dream Property
        </h1>
        <p className="text-[15px] text-white/80 mb-6">
          Search from <strong className="text-white">76K+</strong> verified listings across India
        </p>

        {/* Search box */}
        <div className="backdrop-blur-md bg-white/90 border border-white/20 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] mb-4">

          {/* Tabs */}
          <div className="flex bg-[#f0f9ff] border-b border-[#bae6fd] rounded-t-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-1.5 border-none text-[11px] sm:text-[12px] font-bold cursor-pointer border-b-[3px] tracking-[0.4px] transition-all whitespace-nowrap
                  ${activeTab === tab
                    ? "text-[#0ea5e9] border-b-[#0ea5e9] bg-white"
                    : "text-[#888] border-b-transparent bg-transparent hover:text-[#0369a1] hover:bg-[#e0f2fe]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search row */}
          <div className="flex items-center px-4 py-3 gap-2.5 relative" ref={wrapRef}>
            <div className="flex-1 flex items-center gap-2.5">
              <FiSearch className="text-[#aaa] flex-shrink-0" size={18} />
              <input
                type="text"
                placeholder="Search for locality, landmark, project, or builder"
                value={query}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off"
                className="flex-1 border-none outline-none text-[14px] text-[#333] bg-transparent placeholder:text-[#bbb] w-full"
              />
              {searching && (
                <span className="w-[18px] h-[18px] border-2 border-[#bae6fd] border-t-[#0ea5e9] rounded-full flex-shrink-0 animate-spin" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] list-none p-1.5 m-0 z-[100] overflow-hidden">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onMouseDown={() => handleSelect(s.description)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#333] cursor-pointer rounded-lg hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-colors"
                  >
                    <FiSearch size={13} className="text-[#aaa] flex-shrink-0" />
                    <span>{s.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Popular cities */}
        <div className="flex flex-col items-center gap-2 mb-3.5">
          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.6px]">
            Most Searched Cities
          </span>
          <div className="flex gap-2 flex-wrap justify-center">
            {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Kolkata", "Noida", "Gurgaon"].map((city) => (
              <a
                key={city}
                href="#"
                onClick={(e) => { e.preventDefault(); handleCityClick(city); }}
                className="text-white text-[13px] no-underline bg-white/[0.12] px-3.5 py-1 rounded-full border border-white/[0.28] hover:bg-white/[0.22] transition-colors whitespace-nowrap"
              >
                {city}
              </a>
            ))}
          </div>
        </div>

        {/* Owner bar */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[13px] text-white/85">
          <span>✨ Are you a Property Owner?</span>
          <a href="#" className="text-white font-bold no-underline hover:underline">
            Sell / Rent for FREE ›
          </a>
        </div>
      </div>

      {/* Right image — hidden on tablet and below */}
      <div className="absolute right-0 bottom-0 top-0 w-[38%] pointer-events-none overflow-hidden hidden md:block">
        <img
          src={config.image}
          alt="Find your dream home"
          className="w-full h-full object-cover object-top"
          style={{
            maskImage: "linear-gradient(to left, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 70%, transparent 100%)",
            filter: "blur(0.4px) brightness(0.92) saturate(1.1)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-400"
          style={{ background: `linear-gradient(to right, ${config.overlay} 0%, transparent 40%)` }}
        />
      </div>
    </section>
  );
}
