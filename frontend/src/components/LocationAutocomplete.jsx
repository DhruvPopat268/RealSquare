import { useState, useRef, useEffect, useCallback } from "react";
import { FiMapPin } from "react-icons/fi";
import { fetchLocalitySuggestions, selectLocalitySuggestion, finishPlacesSession } from "./googlePlaces";

export default function LocationAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search location...",
  disabled = false,
  cityName = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const debounceRef = useRef(null);
  const requestRef = useRef(0);
  const inputWrapRef = useRef(null);

  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: rect.bottom + 8, left: rect.left, width: rect.width, zIndex: 99999 });
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);
  useEffect(() => {
    requestRef.current += 1;
    setSuggestions([]);
    setShowDrop(false);
  }, [cityName]);

  useEffect(() => {
    function handler(event) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(event.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (event) => {
    const query = event.target.value;
    onChange?.(query);
    clearTimeout(debounceRef.current);
    if (!query.trim() || !cityName) {
      requestRef.current += 1;
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current;
      try {
        const results = await fetchLocalitySuggestions(query, { cityName });
        if (requestId !== requestRef.current) return;
        setSuggestions(results);
        setShowDrop(results.length > 0);
        if (results.length) updateDropPosition();
      } catch {
        if (requestId === requestRef.current) {
          setSuggestions([]);
          setShowDrop(false);
        }
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (suggestion) => {
    setLoading(true);
    try {
      const location = await selectLocalitySuggestion(suggestion, cityName);
      onChange?.(location.address);
      onSelect?.(location);
    } catch {
      setSuggestions((current) => current.filter((item) => item.placeId !== suggestion.placeId));
    } finally {
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      finishPlacesSession();
    }
  };

  return (
    <div ref={inputWrapRef} className="relative w-full">
      <div className={`flex items-center border rounded-lg transition bg-white ${value ? "border-[var(--primary-color)]" : "border-gray-200 focus-within:border-[var(--primary-color)]"} focus-within:border-[var(--primary-color)] focus-within:ring-1 focus-within:ring-[var(--primary-color)]`}>
        <FiMapPin size={16} className={`ml-3 flex-shrink-0 ${value ? "text-[var(--primary-color)]" : "text-gray-400"}`} />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length) { updateDropPosition(); setShowDrop(true); } }}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-3 py-2.5 text-sm outline-none bg-transparent ${value ? "text-[var(--primary-color)] placeholder-gray-300" : "text-gray-800 placeholder-gray-400"} disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
          autoComplete="off"
        />
        {loading && <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin flex-shrink-0" />}
      </div>
      {showDrop && suggestions.length > 0 && (
        <div style={{ ...dropStyle, pointerEvents: "auto" }} className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button key={suggestion.placeId} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleSelect(suggestion)} className="w-full px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-purple-50 transition flex items-start gap-3 bg-white text-left">
              <FiMapPin size={16} className="text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
              <span className="flex-1 min-w-0 text-sm text-gray-800">{suggestion.address}</span>
            </button>
          ))}
        </div>
      )}
      {showDrop && !loading && suggestions.length === 0 && value && cityName && (
        <div style={dropStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-xs text-gray-500 text-center">No locations found in {cityName}</p>
        </div>
      )}
    </div>
  );
}
