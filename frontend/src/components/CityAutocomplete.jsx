import { useState, useEffect, useRef, useCallback } from "react";
import { FiMapPin } from "react-icons/fi";

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

/**
 * CityAutocomplete
 * Renders a text input with Google Places (cities) suggestions.
 *
 * Props:
 *   value      — controlled string value
 *   onChange   — called with the raw string as user types
 *   onSelect   — called with { city } when user picks a suggestion
 *   placeholder
 *   disabled
 */
export default function CityAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search city...",
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const debounceRef = useRef(null);
  const serviceRef = useRef(null);
  const inputWrapRef = useRef(null);
  const inputRef = useRef(null);

  // Load Google Maps script once
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
      })
      .catch(() => console.error("Google Maps failed to load"));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  const fetchSuggestions = useCallback((query) => {
    if (!query.trim() || !serviceRef.current) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    serviceRef.current.getPlacePredictions(
      {
        input: query,
        types: ["(cities)"],
        componentRestrictions: { country: "in" }, // India only
      },
      (results, status) => {
        setLoading(false);
        if (status === "OK" && results?.length) {
          setSuggestions(results.slice(0, 6));
          updateDropPosition();
          setShowDrop(true);
        } else {
          setSuggestions([]);
          setShowDrop(false);
        }
      }
    );
  }, [updateDropPosition]);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (suggestion) => {
    // Extract only the city name (before the first comma)
    const cityName = suggestion.description.split(",")[0].trim();
    onChange(cityName);
    setSuggestions([]);
    setShowDrop(false);
    onSelect?.({ city: cityName });
  };

  return (
    <div ref={inputWrapRef} className="relative w-full">
      <div className={`flex items-center border rounded-lg bg-white transition
        ${disabled ? "border-gray-100 bg-gray-50" : value ? "border-[#7B2FFF]" : "border-gray-200"}
        focus-within:border-[#7B2FFF] focus-within:ring-1 focus-within:ring-[#7B2FFF]`}
      >
        <FiMapPin size={16} className={`ml-3 flex-shrink-0 ${value ? "text-[#7B2FFF]" : "text-gray-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) { updateDropPosition(); setShowDrop(true); }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`flex-1 px-3 py-2.5 text-sm outline-none bg-transparent
            ${value ? "text-[#7B2FFF]" : "text-gray-800"}
            placeholder-gray-400 disabled:cursor-not-allowed disabled:text-gray-400`}
        />
        {loading && (
          <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[#7B2FFF] rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDrop && suggestions.length > 0 && (
        <ul
          style={dropStyle}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-[#f0ebff] hover:text-[#7B2FFF] transition border-b border-gray-100 last:border-b-0"
            >
              <FiMapPin size={13} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium">{s.description.split(",")[0].trim()}</span>
              <span className="text-xs text-gray-400 truncate">
                {s.structured_formatting?.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
