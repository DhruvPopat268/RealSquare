import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FiChevronDown, FiX, FiSearch, FiMenu, FiMapPin } from "react-icons/fi";
import { properties, newlyAddedProperties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";

const TYPES = ["Buy", "Rent", "Commercial", "PG/Co-Living", "Plots"];
const INTENT_MAP = { "Buy": "BUY", "Rent": "RENT", "Commercial": "COMMERCIAL", "PG/Co-Living": "PG/CO-LIVING", "Plots": "PLOTS" };
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const POPULAR_CITIES = [
  { name: "Mumbai",    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=120&h=80&fit=crop" },
  { name: "Delhi",     image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=120&h=80&fit=crop" },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=120&h=80&fit=crop" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop" },
  { name: "Pune",      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=80&fit=crop" },
  { name: "Chennai",   image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&h=80&fit=crop" },
  { name: "Ahmedabad", image: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?w=120&h=80&fit=crop" },
  { name: "Vadodara",  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=80&fit=crop" },
  { name: "Noida",     image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=120&h=80&fit=crop" },
  { name: "Gurgaon",   image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=120&h=80&fit=crop" },
];

const POPULAR_LOCALITIES = {
  Mumbai:    ["Bandra West", "Andheri East", "Powai", "Vikhroli", "Parel", "Mira Road"],
  Bangalore: ["Koramangala", "Whitefield", "HSR Layout", "Indiranagar", "Sarjapur Road"],
  Hyderabad: ["Gachibowli", "Manikonda", "Jubilee Hills", "Banjara Hills", "Kukatpally"],
  Pune:      ["Hinjewadi", "Viman Nagar", "Kothrud", "Baner", "Wakad"],
  Delhi:     ["Dwarka", "Rohini", "Saket", "Vasant Kunj", "Lajpat Nagar"],
  Chennai:   ["Anna Nagar", "Velachery", "OMR", "Adyar", "Porur"],
  Noida:     ["Sector 62", "Sector 150", "Sector 137", "Greater Noida"],
  Gurgaon:   ["DLF Phase 1", "Sohna Road", "Golf Course Road", "Sector 56"],
  Ahmedabad: ["Shela", "South Bopal", "Bopal", "Gota", "Chandkheda", "Vaishno Devi Circle"],
  Vadodara:  ["Gotri", "Alkapuri", "Fatehgunj", "Manjalpur", "Waghodia Road"],
};

function normalizeType(raw) {
  if (!raw) return "Buy";
  const map = { buy: "Buy", rent: "Rent", commercial: "Commercial", "pg/co-living": "PG/Co-Living", "pg/coliving": "PG/Co-Living", plots: "Plots" };
  return map[raw.toLowerCase()] || TYPES.find((t) => t.toLowerCase() === raw.toLowerCase()) || "Buy";
}

function extractCity(description) {
  const parts = description.split(",").map((s) => s.trim());
  // parts[-1] = country (India), parts[-2] = state, parts[-3] = city
  // e.g. "Gotri, Vadodara, Gujarat, India" → parts[1] = "Vadodara"
  return parts[1] || parts[0];
}

const ALLOWED_TYPES = ["sublocality", "sublocality_level_1", "locality", "neighborhood"];

function extractArea(description) {
  return description.split(",")[0].trim();
}

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

export default function ListingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const refSearch = location.state?.from?.split("?")[1] || "";
  const refParams = new URLSearchParams(refSearch);
  const effectiveParams = searchParams.get("listingType") ? searchParams : refParams;

  const currentType = normalizeType(effectiveParams.get("listingType"));

  const isDetailPage = location.pathname.startsWith("/property/");
  const allProps = [
    ...properties, ...newlyAddedProperties.map((p) => ({ ...p, title: p.name })),
    ...rentProperties, ...commercialProperties, ...pgProperties, ...plotProperties,
  ];
  const detailProperty = isDetailPage
    ? allProps.find((p) => String(p.id) === String(location.pathname.split("/property/")[1]))
    : null;

  const detailCity = detailProperty ? detailProperty.location.split(",").map(s => s.trim()).at(-1) : null;
  const detailArea = detailProperty ? (detailProperty.location.split(",").length > 2 ? detailProperty.location.split(",")[1].trim() : detailProperty.location.split(",")[0].trim()) : null;

  const currentCity = isDetailPage ? (detailCity || "Mumbai") : (effectiveParams.get("city") || "");
  const displayCity = currentCity || "All Cities";
  const displayAreas = isDetailPage
    ? (detailArea ? [detailArea] : [])
    : (effectiveParams.get("areas") ? effectiveParams.get("areas").split(",").filter(Boolean) : []);

  // Search modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(currentType);
  const [modalCity, setModalCity] = useState(currentCity || "Mumbai");
  const [modalAreas, setModalAreas] = useState(displayAreas);
  const [modalInput, setModalInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  // City picker modal state
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [citySearching, setCitySearching] = useState(false);
  const [cityModalSource, setCityModalSource] = useState("main"); // "main" | "inline"

  // Inline search bar state (for area chips in navbar)
  const [editAreas, setEditAreas] = useState(displayAreas);
  const [searchInput, setSearchInput] = useState("");
  const [inlineSuggestions, setInlineSuggestions] = useState([]);
  const [showInlineDropdown, setShowInlineDropdown] = useState(false);
  const [inlineSearching, setInlineSearching] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // City change confirmation state
  const [cityChangeModal, setCityChangeModal] = useState(null);

  const debounceRef = useRef(null);
  const inlineDebounceRef = useRef(null);
  const cityDebounceRef = useRef(null);
  const searchRef = useRef(null);
  const modalRef = useRef(null);
  const cityModalRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    setEditAreas(displayAreas);
    setModalCity(currentCity || "Mumbai");
    setModalAreas(displayAreas);
    setModalType(currentType);
  }, [location.pathname, searchParams.toString()]);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      autocompleteService = new window.google.maps.places.AutocompleteService();
    });
  }, []);

  // Close inline dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowInlineDropdown(false);
        setInlineSuggestions([]);
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
      if (cityModalRef.current && !cityModalRef.current.contains(e.target)) {
        setShowCityModal(false);
        setCitySearch("");
        setCitySuggestions([]);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const fetchSuggestions = useCallback((value, setter, loadingSetter) => {
    if (!value.trim() || !autocompleteService) { setter([]); loadingSetter(false); return; }
    autocompleteService.getPlacePredictions(
      { input: value, componentRestrictions: { country: "in" }, types: ["geocode"] },
      (results, status) => {
        loadingSetter(false);
        if (status === "OK" && results) {
          const filtered = results
            .filter((item) => item.types.some((t) => ALLOWED_TYPES.includes(t)) && item.description.split(",").length >= 4)
            .slice(0, 6);
          setter(filtered);
        } else {
          setter([]);
        }
      }
    );
  }, []);

  // Modal input handler
  const handleModalInput = (e) => {
    const v = e.target.value;
    setModalInput(v);
    clearTimeout(debounceRef.current);
    if (!v.trim()) { setSuggestions([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(v, setSuggestions, setSearching), 400);
  };

  // City modal handlers
  const openCityModal = (source) => {
    setCityModalSource(source);
    setCitySearch("");
    setCitySuggestions([]);
    setShowCityModal(true);
  };

  const handleCitySearch = (e) => {
    const v = e.target.value;
    setCitySearch(v);
    clearTimeout(cityDebounceRef.current);
    if (!v.trim()) { setCitySuggestions([]); setCitySearching(false); return; }
    setCitySearching(true);
    cityDebounceRef.current = setTimeout(() => {
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

  const selectCity = (cityName) => {
    setShowCityModal(false);
    setCitySearch("");
    setCitySuggestions([]);
    if (cityModalSource === "main") {
      setModalCity(cityName);
      setModalAreas([]);
    } else {
      const params = new URLSearchParams();
      params.set("listingType", INTENT_MAP[currentType] || "BUY");
      if (cityName !== "All Cities") params.set("city", cityName);
      navigate(`/listings?${params.toString()}`);
    }
  };

  const addModalArea = (area) => {
    if (!modalAreas.includes(area)) setModalAreas([...modalAreas, area]);
    setModalInput("");
    setSuggestions([]);
  };

  const removeModalArea = (area) => setModalAreas(modalAreas.filter((a) => a !== area));

  const handleModalSearch = () => {
    const params = new URLSearchParams();
    params.set("listingType", INTENT_MAP[modalType] || "BUY");
    if (modalCity) params.set("city", modalCity);
    if (modalAreas.length) params.set("areas", modalAreas.join(","));
    setShowModal(false);
    navigate(`/listings?${params.toString()}`);
  };

  // Inline search bar handlers
  const handleInlineInput = (e) => {
    const v = e.target.value;
    setSearchInput(v);
    clearTimeout(inlineDebounceRef.current);
    if (!v.trim()) { setInlineSuggestions([]); setShowInlineDropdown(false); setInlineSearching(false); return; }
    setInlineSearching(true);
    inlineDebounceRef.current = setTimeout(() => {
      fetchSuggestions(v, (list) => { setInlineSuggestions(list); setShowInlineDropdown(list.length > 0); }, setInlineSearching);
    }, 400);
  };

  const handleInlineSelect = (suggestion) => {
    const area = extractArea(suggestion.description);
    const isSameCity = suggestion.description.toLowerCase().includes(currentCity.toLowerCase());
    setSearchInput(""); setInlineSuggestions([]); setShowInlineDropdown(false);
    if (isSameCity) {
      const newAreas = [...editAreas];
      if (!newAreas.includes(area)) newAreas.push(area);
      const params = new URLSearchParams();
      params.set("listingType", INTENT_MAP[currentType] || "BUY");
      params.set("city", currentCity);
      params.set("areas", newAreas.join(","));
      navigate(`/listings?${params.toString()}`);
    } else {
      // Different city — show confirmation popup
      setCityChangeModal({ area, newCity: extractCity(suggestion.description) });
    }
  };

  const confirmCityChange = () => {
    const params = new URLSearchParams();
    params.set("listingType", INTENT_MAP[currentType] || "BUY");
    params.set("city", cityChangeModal.newCity);
    params.set("areas", cityChangeModal.area);
    setCityChangeModal(null);
    navigate(`/listings?${params.toString()}`);
  };

  const removeAreaChip = (area) => {
    const next = editAreas.filter((a) => a !== area);
    setEditAreas(next);
    if (!isDetailPage) {
      const params = new URLSearchParams(effectiveParams);
      if (next.length) params.set("areas", next.join(","));
      else params.delete("areas");
      navigate(`/listings?${params.toString()}`);
    }
  };

  const popularLocalities = POPULAR_LOCALITIES[modalCity] || [];
  const modalSameCitySuggestions = suggestions.filter((s) => s.description.toLowerCase().includes(modalCity.toLowerCase()));
  const modalOtherSuggestions = suggestions.filter((s) => !s.description.toLowerCase().includes(modalCity.toLowerCase()));
  const sameCitySuggestions = inlineSuggestions.filter((s) => s.description.toLowerCase().includes(currentCity.toLowerCase()));
  const otherSuggestions = inlineSuggestions.filter((s) => !s.description.toLowerCase().includes(currentCity.toLowerCase()));

  return (
    <>
      <nav className="sticky top-0 z-[200] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]" ref={navRef}>
        <div className="max-w-[1280px] mx-auto px-6 h-[62px] flex items-center gap-4">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">
              Real<span className="text-[#7B2FFF]">Square</span>
            </span>
          </div>

          {/* Middle — desktop only */}
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 relative">

            {/* City/Intent trigger button */}
            <button
              className="flex items-center gap-1 px-3 py-2 rounded-md bg-transparent border-none text-sm font-bold text-[#1a1a2e] cursor-pointer whitespace-nowrap hover:bg-[#f3eeff] hover:text-[#7B2FFF] transition-colors"
              onClick={() => { setModalType(currentType); setModalCity(currentCity); setModalAreas([...editAreas]); setShowModal(true); }}
            >
              {currentType} In
              <span
                className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-lg bg-[#f0ebff] text-[#7B2FFF] hover:bg-[#e4d9ff] transition text-sm font-semibold"
                onClick={(e) => { e.stopPropagation(); openCityModal("inline"); }}
              >
                {displayCity} <FiChevronDown size={11} />
              </span>
            </button>

            {/* Inline search box */}
            <div
              ref={searchRef}
              className="flex-1 flex items-center gap-1.5 min-w-0 bg-[#f7f8fa] border-2 border-[#7B2FFF] rounded-lg px-3 py-1.5 cursor-text relative focus-within:bg-white focus-within:border-[#5b21b6] transition-colors"
              onClick={() => document.getElementById("lh-input")?.focus()}
            >
              <FiSearch size={14} className="text-gray-400 flex-shrink-0" />

              {editAreas.map((a) => (
                <span key={a} className="flex items-center gap-1 bg-[#ede9fe] text-[#7B2FFF] border border-[#c4b5fd] text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {a}
                  <FiX size={10} className="cursor-pointer opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeAreaChip(a); }} />
                </span>
              ))}

              <input
                id="lh-input"
                className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent min-w-[80px]"
                placeholder={editAreas.length ? "+ Add area..." : "Search locality, landmark, project..."}
                value={searchInput}
                onChange={handleInlineInput}
                onFocus={() => { if (inlineSuggestions.length > 0) setShowInlineDropdown(true); }}
              />

              {inlineSearching && (
                <span className="w-3.5 h-3.5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}

              {/* Inline suggestions dropdown */}
              {showInlineDropdown && inlineSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.14)] z-[300] overflow-hidden">
                  {sameCitySuggestions.length > 0 && (
                    <>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-6 pt-4 pb-1.5">In {currentCity}</p>
                      {sameCitySuggestions.map((s) => (
                        <button key={s.place_id} onMouseDown={() => handleInlineSelect(s)}
                          className="w-full flex items-center gap-2.5 px-6 py-2.5 border-none bg-transparent cursor-pointer text-left hover:bg-[#f5f0ff] transition">
                          <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-[#222] font-medium">{extractArea(s.description)}</span>
                          <span className="text-xs text-gray-400 truncate">{s.description.split(",").slice(1).join(",")}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {otherSuggestions.length > 0 && (
                    <>
                      <p className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-6 pt-3 pb-1.5 ${sameCitySuggestions.length ? "border-t border-gray-100" : ""}`}>Other Cities</p>
                      {otherSuggestions.map((s) => (
                        <button key={s.place_id} onMouseDown={() => handleInlineSelect(s)}
                          className="w-full flex items-center gap-2.5 px-6 py-2.5 border-none bg-transparent cursor-pointer text-left hover:bg-[#fff7ed] transition">
                          <FiSearch size={13} className="text-orange-400 flex-shrink-0" />
                          <span className="text-sm text-[#222] font-medium">{extractArea(s.description)}</span>
                          <span className="text-xs text-gray-400 truncate">{s.description.split(",").slice(1).join(",")}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right actions — desktop */}
          <div className="hidden md:flex items-center gap-3.5 flex-shrink-0">
            <a href="#" className="text-[13px] font-medium text-[#444] no-underline whitespace-nowrap hover:text-[#7B2FFF] transition-colors">Download App</a>
            <button className="flex items-center gap-1.5 border-none bg-transparent text-sm font-bold text-[#1a1a2e] cursor-pointer whitespace-nowrap hover:text-[#7B2FFF] transition-colors">
              Post Property
              <span className="bg-[#7B2FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">FREE</span>
            </button>
            <button className="flex items-center gap-1.5 bg-[#7B2FFF] border-none rounded-full px-3 py-1.5 cursor-pointer text-white text-[15px]">☰ 👤</button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden ml-auto bg-transparent border-none cursor-pointer text-[#333]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col px-5 py-3 gap-3 border-t border-gray-100">
            <span className="text-sm font-bold text-[#1a1a2e]">{currentType} In {displayCity}</span>
            <button
              className="bg-[#7B2FFF] text-white border-none px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              Search Properties
            </button>
          </div>
        )}
      </nav>

      {/* ── SEARCH MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center pt-[62px]" style={{ background: "rgba(0,0,0,0.45)" }}
          onMouseDown={() => setShowModal(false)}>
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[640px] mx-4 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Intent tabs */}
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">I'm Looking to</p>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setModalType(t)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition ${
                      modalType === t
                        ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                        : "border-gray-300 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-5" />

            {/* City + Area search row */}
            <div className="flex items-center gap-0 px-5 py-4">
              {/* City — clickable to open city picker */}
              <button
                className="flex items-center gap-2 pr-4 border-r border-gray-200 flex-shrink-0 hover:text-[#7B2FFF] transition group"
                onClick={() => openCityModal("main")}
              >
                <FiMapPin size={15} className="text-[#7B2FFF]" />
                <span className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#7B2FFF]">{modalCity}</span>
                <FiChevronDown size={13} className="text-gray-400" />
              </button>

              {/* Area input + chips */}
              <div className="flex-1 flex items-center flex-wrap gap-1.5 px-3 min-h-[40px]">
                {modalAreas.map((a) => (
                  <span key={a} className="flex items-center gap-1 bg-[#ede9fe] text-[#7B2FFF] border border-[#c4b5fd] text-xs font-semibold px-2.5 py-1 rounded-full">
                    {a}
                    <FiX size={10} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeModalArea(a)} />
                  </span>
                ))}
                <input
                  className="flex-1 border-none outline-none text-sm text-gray-700 bg-transparent min-w-[120px]"
                  placeholder="Enter locality, landmark, project..."
                  value={modalInput}
                  onChange={handleModalInput}
                  autoFocus
                />
                {searching && (
                  <span className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleModalSearch}
                className="bg-[#7B2FFF] hover:bg-[#6320d4] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex-shrink-0"
              >
                Search
              </button>
            </div>

            {/* Google suggestions split by city */}
            {suggestions.length > 0 && (
              <div className="border-t border-gray-100 max-h-[220px] overflow-y-auto">
                {modalSameCitySuggestions.length > 0 && (
                  <>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 pt-3 pb-1">In {modalCity}</p>
                    {modalSameCitySuggestions.map((s) => (
                      <button key={s.place_id} onMouseDown={() => addModalArea(extractArea(s.description))}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[#f5f0ff] text-left transition">
                        <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-800 font-medium">{extractArea(s.description)}</span>
                        <span className="text-xs text-gray-400 truncate">{s.description.split(",").slice(1).join(",")}</span>
                      </button>
                    ))}
                  </>
                )}
                {modalOtherSuggestions.length > 0 && (
                  <>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 pt-3 pb-1 border-t border-gray-100">Other Cities</p>
                    {modalOtherSuggestions.map((s) => (
                      <button key={s.place_id} onMouseDown={() => { setModalCity(extractCity(s.description)); setModalAreas([extractArea(s.description)]); setModalInput(""); setSuggestions([]); }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[#fff7ed] text-left transition">
                        <FiSearch size={13} className="text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-gray-800 font-medium">{extractArea(s.description)}</span>
                        <span className="text-xs text-gray-400 truncate">{s.description.split(",").slice(1).join(",")}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Popular Localities + City image grid */}
            {suggestions.length === 0 && (
              <div className="px-5 pb-5">
                {/* Popular localities for selected city */}
                {popularLocalities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wide">Popular Localities in {modalCity}</p>
                    <div className="flex flex-wrap gap-2">
                      {popularLocalities.map((loc) => (
                        <button key={loc} onClick={() => addModalArea(loc)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                            modalAreas.includes(loc)
                              ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                              : "border-gray-300 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                          }`}>
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* City image grid */}
                <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wide">Popular Cities</p>
                <div className="grid grid-cols-4 gap-2">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setModalCity(c.name); setModalAreas([]); }}
                      className={`relative rounded-xl overflow-hidden h-[64px] border-2 transition ${
                        modalCity === c.name ? "border-[#7B2FFF]" : "border-transparent hover:border-[#7B2FFF]"
                      }`}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                        modalCity === c.name ? "text-[#c4b5fd]" : "text-white"
                      }`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CITY PICKER MODAL ── */}
      {showCityModal && (
        <div
          className="fixed inset-0 z-[700] flex items-start justify-center pt-[62px]"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onMouseDown={() => { setShowCityModal(false); setCitySearch(""); setCitySuggestions([]); }}
        >
          <div
            ref={cityModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <p className="text-sm font-bold text-[#1a1a2e]">Select City</p>
              <button onClick={() => { setShowCityModal(false); setCitySearch(""); setCitySuggestions([]); }}>
                <FiX size={18} className="text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            {/* Search input */}
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

            {/* City suggestions from Google */}
            {citySuggestions.length > 0 && (
              <div className="border-t border-gray-100 max-h-[200px] overflow-y-auto">
                {citySuggestions.map((s) => {
                  const cityName = s.description.split(",")[0].trim();
                  return (
                    <button
                      key={s.place_id}
                      onMouseDown={() => selectCity(cityName)}
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
                  {cityModalSource === "inline" && (
                    <button
                      onMouseDown={() => selectCity("All Cities")}
                      className={`relative rounded-xl overflow-hidden h-[72px] border-2 transition col-span-1 ${
                        !currentCity ? "border-[#7B2FFF]" : "border-transparent hover:border-[#7B2FFF]"
                      } bg-gradient-to-br from-[#f0ebff] to-[#e4d9ff] flex items-center justify-center`}
                    >
                      <span className={`text-xs font-bold ${!currentCity ? "text-[#7B2FFF]" : "text-[#7B2FFF]"}`}>All Cities</span>
                    </button>
                  )}
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onMouseDown={() => selectCity(c.name)}
                      className={`relative rounded-xl overflow-hidden h-[72px] border-2 transition ${
                        (cityModalSource === "main" ? modalCity : currentCity) === c.name
                          ? "border-[#7B2FFF]"
                          : "border-transparent hover:border-[#7B2FFF]"
                      }`}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                        (cityModalSource === "main" ? modalCity : currentCity) === c.name
                          ? "text-[#c4b5fd]"
                          : "text-white"
                      }`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── CITY CHANGE CONFIRMATION ── */}
      {cityChangeModal && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[360px] mx-4">
            <h3 className="text-base font-bold text-[#1a1a2e] mb-2">Change City?</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Selecting <strong>"{cityChangeModal.area}"</strong> will change your city from{" "}
              <strong className="text-[#7B2FFF]">{currentCity}</strong> to{" "}
              <strong className="text-[#7B2FFF]">{cityChangeModal.newCity}</strong>. Do you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCityChangeModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                No, Stay in {currentCity}
              </button>
              <button
                onClick={confirmCityChange}
                className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] hover:bg-[#6320d4] text-white text-sm font-semibold transition"
              >
                Yes, Change City
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
