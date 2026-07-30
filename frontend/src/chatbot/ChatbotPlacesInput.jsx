import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch } from "react-icons/fi";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

export default function ChatbotPlacesInput({ mode = "city", cityName = "", onSubmit, placeholder }) {
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [dropStyle, setDropStyle]     = useState({});
  const debounceRef                   = useRef(null);
  const serviceRef                    = useRef(null);
  const inputWrapRef                  = useRef(null);
  const inputRef                      = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }).catch(() => console.error("Google Maps failed to load"));
  }, []);

  // close on outside click
  useEffect(() => {
    function handler(e) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // calculate dropdown position relative to viewport (fixed positioning)
  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const fetchSuggestions = useCallback((value) => {
    if (!value.trim() || !serviceRef.current) { setSuggestions([]); setLoading(false); return; }

    const request = mode === "city"
      ? { input: value, componentRestrictions: { country: "in" }, types: ["(cities)"] }
      : { input: `${value}, ${cityName}`, componentRestrictions: { country: "in" }, types: ["geocode", "establishment"] };

    serviceRef.current.getPlacePredictions(request, (results, status) => {
      setLoading(false);
      if (status === "OK" && results) {
        const filtered = mode === "locality" && cityName
          ? results.filter((r) => r.description.toLowerCase().includes(cityName.toLowerCase()))
          : results;
        setSuggestions(filtered.slice(0, 5));
        updateDropPosition();
        setShowDrop(true);
      } else {
        setSuggestions([]);
        setShowDrop(false);
      }
    });
  }, [mode, cityName, updateDropPosition]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowDrop(false); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (suggestion) => {
    if (mode === "city") {
      const cityOnly = suggestion.description.split(",")[0].trim();
      setQuery(cityOnly);
      setSuggestions([]);
      setShowDrop(false);
      onSubmit({ displayText: cityOnly, placeId: suggestion.place_id });
    } else {
      setQuery(suggestion.description);
      setSuggestions([]);
      setShowDrop(false);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          onSubmit({ displayText: suggestion.description, address: suggestion.description, latitude: lat(), longitude: lng() });
        } else {
          onSubmit({ displayText: suggestion.description, address: suggestion.description, latitude: null, longitude: null });
        }
      });
    }
  };

  return (
    <div ref={inputWrapRef} className="relative w-full">
      <div className="flex items-center border border-gray-200 rounded-xl focus-within:border-[#7B2FFF] transition bg-white">
        <FiSearch size={15} className="ml-3 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length > 0) { updateDropPosition(); setShowDrop(true); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
          autoComplete="off"
        />
        {loading && (
          <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[#7B2FFF] rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Dropdown rendered with fixed positioning to escape overflow:hidden parents */}
      {showDrop && suggestions.length > 0 && (
        <ul
          style={dropStyle}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-[#f0ebff] hover:text-[#7B2FFF] transition"
            >
              <FiSearch size={12} className="text-gray-400 flex-shrink-0" />
              <span>{mode === "city" ? s.description.split(",")[0].trim() : s.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
