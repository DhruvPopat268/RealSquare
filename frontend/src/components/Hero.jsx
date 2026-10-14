import { useEffect, useRef, useCallback, useState } from "react";
import { FiSearch, FiChevronDown, FiX, FiCheck } from "react-icons/fi";
import { MdMyLocation } from "react-icons/md";
import { fetchActiveCategories, fetchPropertyTypes } from "../chatbot/chatbotApi";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CATEGORY_ID = import.meta.env.VITE_CATEGORY_RESIDENTIAL_ID;

const BUILDING_HEIGHTS = [22, 32, 26, 36, 20, 30];

// Visual config keyed by tab label (case-insensitive prefix match as fallback)
const TAB_CONFIG_MAP = [
  {
    match: (label) => label.toUpperCase() === "BUY",
    config: {
      image: "https://images.openai.com/static-rsc-4/OgEyJmYehJ-0JcxBa8tjuxQBxocYJmaJ52cO7AQwOzJrbb8L9a6Qkrf0AXHrQBTQ2Z5aGJ4NeIBYRB3WmzFcsNk4Qz9o4u6qowFlA8z920FjJ8wNsXzjG8RXIkk6NsJx4_BGS33K0_eqaNxEHO1zEhjpjMuTQQ_UjKS1OveeGx1FmWmL9xRUEZj8uBxGetvZ?purpose=fullsize",
      gradient: "linear-gradient(135deg, #c7d2fe, #818cf8, #4f46e5)",
      overlay: "#3730a3",
    },
  },
  {
    match: (label) => label.toUpperCase().startsWith("RENT"),
    config: {
      image: "https://images.openai.com/static-rsc-4/2pbY7RrET2xwc22X83QJM00rulGkGNxutE9ZKN45ENy_ivSuoBTpUCrYuONvR5zARc84Mj9HCkDCBz9NG0HBUjJ6d4p0sGtWX1Ed0OGYy1kzjYgtfYiHjVWnVZOyR97D761nMqhsWx2hW8r8OALd99Rx1J165DFixpExP5H5XlsmnWscHNxw7b71fcxgLSt2?purpose=fullsize",
      gradient: "linear-gradient(135deg, #99f6e4, #2dd4bf, #0d9488)",
      overlay: "#0f766e",
    },
  },
  {
    match: (label) => label.toUpperCase().includes("PG"),
    config: {
      image: "https://images.openai.com/static-rsc-4/GBreYPOJqR6c0KMcRile8uJDlCi9_tJ8Rvfu80KkulxT_t-opUxZUROHmQHEIWMxF6c3VPROZk6Ry023HEQ7l08jcyblBjZIV_JNojKooH9WNXQery0IVUSMbwPtVcpHvKbMoEqnibE-rPJDKEfh-LPKzRpx6byRA3XIDSU-inO2ssdle0dl-HWRV4_sGcAk?purpose=fullsize",
      gradient: "linear-gradient(135deg, #fce7f3, #f9a8d4, #ec4899)",
      overlay: "#be185d",
    },
  },
];

const DEFAULT_CONFIG = {
  image: "https://images.openai.com/static-rsc-4/OgEyJmYehJ-0JcxBa8tjuxQBxocYJmaJ52cO7AQwOzJrbb8L9a6Qkrf0AXHrQBTQ2Z5aGJ4NeIBYRB3WmzFcsNk4Qz9o4u6qowFlA8z920FjJ8wNsXzjG8RXIkk6NsJx4_BGS33K0_eqaNxEHO1zEhjpjMuTQQ_UjKS1OveeGx1FmWmL9xRUEZj8uBxGetvZ?purpose=fullsize",
  gradient: "linear-gradient(135deg, #c7d2fe, #818cf8, #4f46e5)",
  overlay: "#3730a3",
};

function getTabConfig(label) {
  return TAB_CONFIG_MAP.find((t) => t.match(label))?.config ?? DEFAULT_CONFIG;
}

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

export default function Hero({ activeTab, setActiveTab, searchQuery, setSearchQuery, onSearch, tabs = [], tabsLoading = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  // ── Category / Type picker state ─────────────────────────────────────────
  const [showPicker, setShowPicker]             = useState(false);
  const [categories, setCategories]             = useState([]);
  const [catLoading, setCatLoading]             = useState(false);
  const [selectedCatId, setSelectedCatId]       = useState(DEFAULT_CATEGORY_ID);
  const [selectedCatLabel, setSelectedCatLabel] = useState("Residential");
  const [propertyTypes, setPropertyTypes]       = useState([]);
  const [typesLoading, setTypesLoading]         = useState(false);
  // all IDs selected by default = "show everything"; user opts-out by deselecting
  const [selectedTypeIds, setSelectedTypeIds]   = useState(new Set());

  // Load categories once on mount
  useEffect(() => {
    setCatLoading(true);
    fetchActiveCategories()
      .then((cats) => {
        setCategories(cats);
        const def = cats.find((c) => c.value === DEFAULT_CATEGORY_ID);
        if (def) setSelectedCatLabel(def.label);
      })
      .finally(() => setCatLoading(false));
  }, []);

  // Load property types whenever selected category changes; pre-select all
  useEffect(() => {
    if (!selectedCatId) return;
    setTypesLoading(true);
    setPropertyTypes([]);
    setSelectedTypeIds(new Set());
    fetchPropertyTypes(selectedCatId)
      .then((types) => {
        setPropertyTypes(types);
        // pre-select every type — user opts out by deselecting
        setSelectedTypeIds(new Set(types.map((t) => t.value)));
      })
      .finally(() => setTypesLoading(false));
  }, [selectedCatId]);

  // Close picker on outside click (reuses wrapRef — panel is inside it)
  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowPicker(false);
    }
    if (showPicker) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showPicker]);

  // Close picker when switching to PG tab
  useEffect(() => {
    if (activeTab?.toUpperCase().includes("PG")) setShowPicker(false);
  }, [activeTab]);

  // ── Google Places ─────────────────────────────────────────────────────────
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
      { input: value },
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

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!window.google?.maps?.Geocoder) return;
        new window.google.maps.Geocoder().geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const loc = results[0].address_components.find(
                (c) => c.types.includes("sublocality") || c.types.includes("locality")
              )?.long_name ?? results[0].formatted_address.split(",")[0];
              setQuery(loc);
              setSearchQuery(loc);
              onSearch();
            }
          }
        );
      },
      () => {} // silently ignore permission denial
    );
  };

  // Picker: select category
  const handleCatSelect = (cat) => {
    setSelectedCatId(cat.value);
    setSelectedCatLabel(cat.label);
    // types will be re-fetched and pre-selected by the useEffect above
  };

  // Picker: toggle a property type (opt-out model)
  // if deselecting the last one, revert to all selected
  const handleTypeSelect = (typeValue) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(typeValue)) {
        next.delete(typeValue);
        // if nothing left, revert to all selected
        if (next.size === 0) return new Set(propertyTypes.map((t) => t.value));
      } else {
        next.add(typeValue);
      }
      return next;
    });
  };

  // Picker: clear — restore all types selected for current category
  const handleClearPicker = (e) => {
    e.stopPropagation();
    setSelectedTypeIds(new Set(propertyTypes.map((t) => t.value)));
  };

  // "All" = every type is selected
  const allSelected = propertyTypes.length > 0 && selectedTypeIds.size === propertyTypes.length;

  // Button display label
  // All selected  → "All Residential"
  // Some removed  → "Residential · 3" (showing active count)
  const pickerLabel = allSelected ? `All ${selectedCatLabel}` : selectedCatLabel;

  const config = getTabConfig(activeTab ?? "");

  return (
    <section
      className="relative min-h-[520px] flex items-center justify-center px-5 py-12 md:px-10 transition-all duration-400"
      style={{ background: config.gradient }}
    >
      {/* Decorative buildings */}
      <div className="absolute left-0 bottom-0 flex items-end gap-1.5 pl-4 opacity-[0.12] pointer-events-none overflow-hidden" aria-hidden="true">
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
      <div className="relative z-10 flex-1 max-w-[780px] text-center">
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
            {tabsLoading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 py-2.5 px-1.5 flex justify-center">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              : tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex-1 py-2.5 px-1.5 border-none text-[11px] sm:text-[12px] font-bold cursor-pointer border-b-[3px] tracking-[0.4px] transition-all whitespace-nowrap
                      ${activeTab === tab.label
                        ? "text-[#0ea5e9] border-b-[#0ea5e9] bg-white"
                        : "text-[#888] border-b-transparent bg-transparent hover:text-[#0369a1] hover:bg-[#e0f2fe]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))
            }
          </div>

          {/* Search row — 30% category picker + 70% input */}
          <div className="flex items-stretch px-3 py-2.5 gap-0 relative" ref={wrapRef}>

            {/* 30% — category/type picker trigger (LEFT) */}
            <div className="flex-[3] flex-shrink-0">
              {activeTab?.toUpperCase().includes("PG") ? (
                <span className="w-full h-full flex items-center pl-1.5 pr-2.5 text-[12px] font-semibold text-[#444]">
                  Residential
                </span>
              ) : (
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                className="w-full h-full flex items-center justify-between gap-1.5 pl-1.5 pr-2.5 text-[12px] font-semibold text-[#444] hover:text-[#7B2FFF] transition-colors cursor-pointer bg-transparent border-none"
              >
                <span className="flex items-center gap-1.5 truncate text-left leading-tight min-w-0">
                  {catLoading ? (
                    <span className="inline-block w-20 h-3 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      <span className="truncate">{pickerLabel}</span>
                      {!allSelected && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#7B2FFF] text-white text-[10px] font-bold leading-none">
                          {selectedTypeIds.size}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {!allSelected && (
                    <span
                      onMouseDown={handleClearPicker}
                      title="Reset to all types"
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <FiX size={11} />
                    </span>
                  )}
                  <FiChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${showPicker ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 self-stretch mx-1 flex-shrink-0" />

            {/* 70% — search input (RIGHT) */}
            <div className="flex items-center gap-2 flex-[7] min-w-0 pl-2">
              <FiSearch className="text-[#aaa] flex-shrink-0" size={17} />
              <input
                type="text"
                placeholder="Search locality, landmark, project or builder"
                value={query}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off"
                className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb] w-full min-w-0"
              />
              {searching && (
                <span className="w-[16px] h-[16px] border-2 border-[#bae6fd] border-t-[#0ea5e9] rounded-full flex-shrink-0 animate-spin" />
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 self-stretch mx-2 flex-shrink-0" />

            {/* Current location button */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              title="Use current location"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-[#7B2FFF] hover:bg-[#f3eeff] transition-colors cursor-pointer bg-transparent border-none"
            >
              <MdMyLocation size={18} />
            </button>

            {/* Search button */}
            <button
              type="button"
              onClick={() => { onSearch(); setShowPicker(false); }}
              className="flex-shrink-0 flex items-center gap-1.5 bg-[#7B2FFF] hover:bg-[#6920e0] active:bg-[#5a1ac7] text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer border-none"
            >
              <FiSearch size={14} />
              Search
            </button>

            {/* Picker dropdown panel — full width, anchored to search row */}
            {showPicker && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-gray-100 z-[9999] overflow-y-auto max-h-[400px]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-[13px] font-extrabold text-[#1a1a2e]">Property Category</span>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer border-none bg-transparent"
                  >
                    <FiX size={15} />
                  </button>
                </div>

                {/* Categories */}
                <div className="px-4 pt-3 pb-1">
                  {catLoading ? (
                    <div className="flex gap-2 flex-wrap pb-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap pb-2">
                      {categories.map((cat) => {
                        const isActive = selectedCatId === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => handleCatSelect(cat)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition cursor-pointer
                              ${isActive
                                ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                                : "bg-white border-gray-200 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                              }`}
                          >
                            {isActive && <FiCheck size={11} />}
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Property Types */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-extrabold text-[#1a1a2e]">
                      Property Type
                    </p>
                    {!allSelected && (
                      <button
                        onClick={() => setSelectedTypeIds(new Set(propertyTypes.map((t) => t.value)))}
                        className="text-[11px] font-semibold text-[#7B2FFF] hover:underline cursor-pointer bg-transparent border-none p-0"
                      >
                        Reset all
                      </button>
                    )}
                  </div>
                  {typesLoading ? (
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : propertyTypes.length === 0 ? (
                    <p className="text-[12px] text-gray-400">No types available.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {propertyTypes.map((type) => {
                        const isActive = selectedTypeIds.has(type.value);
                        return (
                          <label
                            key={type.value}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition select-none hover:bg-gray-50"
                          >
                            {/* Custom checkbox */}
                            <span
                              className={`flex-shrink-0 w-[14px] h-[14px] rounded-[3px] border-[1.5px] flex items-center justify-center transition
                                ${isActive ? "bg-[#7B2FFF] border-[#7B2FFF]" : "bg-white border-gray-300"}`}
                            >
                              {isActive && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleTypeSelect(type.value)}
                              className="sr-only"
                            />
                            <span className="text-[12px] font-semibold text-gray-600 leading-tight">
                              {type.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Places suggestions dropdown */}
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
