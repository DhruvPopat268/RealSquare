import { useEffect, useRef, useCallback, useState } from "react";
import { FiSearch } from "react-icons/fi";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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

export default function PlacesAutocomplete({ value, onChange, placeholder, types = ["geocode"], cityBias = "" }) {
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

  const fetchSuggestions = useCallback((val) => {
    if (!val.trim() || !autocompleteService) { setSuggestions([]); setSearching(false); return; }
    const query = cityBias ? `${val}, ${cityBias}` : val;
    autocompleteService.getPlacePredictions(
      { input: query, componentRestrictions: { country: "in" }, types },
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
  }, [types, cityBias]);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowDropdown(false); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (description) => {
    onChange(description);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition bg-white">
        <FiSearch size={14} className="ml-3 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
        {searching && (
          <div className="mr-3 w-3.5 h-3.5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[500] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s.description)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0ebff] hover:text-[#7B2FFF] cursor-pointer transition"
            >
              <FiSearch size={12} className="text-gray-400 flex-shrink-0" />
              <span>{s.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
