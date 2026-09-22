import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiMapPin } from "react-icons/fi";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMapsScript() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (document.getElementById("gmap-script")) {
    return new Promise((res) => {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          res();
        }
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

export default function LocationAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search location...",
  disabled = false,
  cityName = "", // New prop to filter by city
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const debounceRef = useRef(null);
  const serviceRef = useRef(null);
  const geocoderRef = useRef(null);
  const inputWrapRef = useRef(null);
  const inputRef = useRef(null);

  // Calculate dropdown position
  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
      })
      .catch(() => console.error("Google Maps failed to load"));
  }, []);

  // Show dropdown when suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0) {
      console.log("useEffect: Suggestions arrived, setting showDrop=true");
      updateDropPosition();
      setShowDrop(true);
    }
  }, [suggestions, updateDropPosition]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch suggestions using Google Places API
  const fetchSuggestions = useCallback((query) => {
    if (!query.trim() || !serviceRef.current) {
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      return;
    }

    // If cityName is provided, search for places within that city
    const searchQuery = cityName ? `${query}, ${cityName}` : query;

    const request = {
      input: searchQuery,
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "in" }, // Restrict to India
    };

    serviceRef.current.getPlacePredictions(request, (results, status) => {
      console.log("API callback - Status:", status, "Results:", results?.length);
      setLoading(false);

      if (status === "OK" && results && results.length > 0) {
        // Filter results to only show places that contain the city name
        let filtered = results;
        if (cityName) {
          filtered = results.filter((r) =>
            r.description.toLowerCase().includes(cityName.toLowerCase())
          );
        }

        console.log("Setting suggestions:", filtered.length);
        setSuggestions(filtered.slice(0, 8));
        setShowDrop(true);
        updateDropPosition();
      } else {
        console.log("No results or error");
        setSuggestions([]);
        setShowDrop(false);
      }
    });
  }, [updateDropPosition, cityName]);

  // Handle input change with debounce
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
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setShowDrop(false);

    // Get coordinates using Geocoder
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { placeId: suggestion.place_id },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            onSelect?.({
              address: suggestion.description,
              latitude: lat(),
              longitude: lng(),
            });
          } else {
            onSelect?.({
              address: suggestion.description,
              latitude: null,
              longitude: null,
            });
          }
        }
      );
    }
  };

  return (
    <div ref={inputWrapRef} className="relative w-full">
      <div className={`flex items-center border rounded-lg transition bg-white ${
        value ? "border-[#7B2FFF]" : "border-gray-200 focus-within:border-[#7B2FFF]"
      } focus-within:border-[#7B2FFF] focus-within:ring-1 focus-within:ring-[#7B2FFF]`}>
        <FiMapPin size={16} className={`ml-3 flex-shrink-0 ${value ? "text-[#7B2FFF]" : "text-gray-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            console.log("Input focused, suggestions:", suggestions.length);
            if (suggestions.length > 0) {
              updateDropPosition();
              setShowDrop(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-3 py-2.5 text-sm outline-none bg-transparent ${value ? "text-[#7B2FFF] placeholder-gray-300" : "text-gray-800 placeholder-gray-400"} disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
          autoComplete="off"
        />
        {loading && (
          <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[#7B2FFF] rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Dropdown - render inline with fixed positioning */}
      {showDrop && suggestions.length > 0 && (
        <div
          style={{
            ...dropStyle,
            pointerEvents: "auto",
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-visible max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onMouseDown={() => handleSelect(suggestion)}
              className="px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-purple-50 transition flex items-start gap-3 bg-white"
              style={{ pointerEvents: "auto" }}
            >
              <FiMapPin size={16} className="text-[#7B2FFF] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-base">
                  {suggestion.structured_formatting?.main_text}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {suggestion.structured_formatting?.secondary_text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDrop && !loading && suggestions.length === 0 && value && (
        <div style={dropStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-xs text-gray-500 text-center">No locations found</p>
        </div>
      )}
    </div>
  );
}
