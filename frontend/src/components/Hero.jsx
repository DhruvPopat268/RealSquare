import { useEffect, useRef, useCallback, useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./Hero.css";

const tabs = ["BUY", "RENT", "COMMERCIAL", "PG/CO-LIVING", "PLOTS"];
const localities = ["Andheri West", "Chembur", "Malad West", "Kandivali West", "Borivali"];
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
    if (!autocompleteService) {
      setSearching(false);
      return;
    }
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
    setQuery(description);
    setSearchQuery(description);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleCityClick = (city) => {
    setQuery(city);
    setSearchQuery(city);
    clearTimeout(debounceRef.current);
    setSuggestions([]);
    setShowDropdown(false);
    setSearching(true);
    fetchSuggestions(city);
  };

  const config = TAB_CONFIG[activeTab];

  return (
    <section className="hero" style={{ background: config.gradient }}>
      <div className="hero-buildings" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="building-col">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="building-block" />
            ))}
          </div>
        ))}
      </div>

      <div className="hero-content">
        <h1>Find Your Dream Property</h1>
        <p>Search from <strong>76K+</strong> verified listings across India</p>

        <div className="search-box">
          <div className="search-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-row" ref={wrapRef}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search for locality, landmark, project, or builder"
                value={query}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off"
              />
              {searching && <span className="search-spinner" />}
            </div>
            <button className="search-btn" onClick={() => { setSearchQuery(query); onSearch(); }}>Search</button>

            {showDropdown && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((s) => (
                  <li key={s.place_id} onMouseDown={() => handleSelect(s.description)}>
                    <FiSearch size={13} className="suggestion-icon" />
                    <span>{s.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="popular-localities">
          <span className="loc-label">Most Searched Cities</span>
          <div className="loc-chips">
            {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Kolkata", "Noida", "Gurgaon"].map((city) => (
              <a key={city} href="#" className="loc-chip" onClick={(e) => { e.preventDefault(); handleCityClick(city); }}>{city}</a>
            ))}
          </div>
        </div>

        <div className="owner-bar">
          <span>✨ Are you a Property Owner?</span>
          <a href="#">Sell / Rent for FREE ›</a>
        </div>
      </div>

      <div className="hero-image-wrap">
        <img src={config.image} alt="Find your dream home" className="hero-image" style={{ "--overlay-color": config.overlay }} />
      </div>
    </section>
  );
}
