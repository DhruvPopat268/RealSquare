import { useState, useEffect, useRef, useCallback } from "react";
import { FiMapPin } from "react-icons/fi";
import { fetchCitySuggestions, selectCitySuggestion, finishPlacesSession } from "./googlePlaces";

export default function CityAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search city...",
  disabled = false,
  commitOnSelect = false,
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const debounceRef = useRef(null);
  const requestRef = useRef(0);
  const skipValueSyncRef = useRef(false);
  const inputWrapRef = useRef(null);

  useEffect(() => {
    if (skipValueSyncRef.current) {
      skipValueSyncRef.current = false;
      return;
    }
    setQuery(value);
  }, [value]);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: rect.bottom + 6, left: rect.left, width: rect.width, zIndex: 99999 });
  }, []);

  useEffect(() => {
    function handler(event) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(event.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (event) => {
    const next = event.target.value;
    setQuery(next);
    if (!commitOnSelect) onChange?.(next);
    else if (value) {
      skipValueSyncRef.current = true;
      onChange?.("");
      onSelect?.({ city: "", placeId: null, viewport: null });
    }
    clearTimeout(debounceRef.current);
    if (!next.trim()) {
      requestRef.current += 1;
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      onChange?.("");
      onSelect?.({ city: "", placeId: null, viewport: null });
      finishPlacesSession();
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current;
      try {
        const results = await fetchCitySuggestions(next);
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
    }, 350);
  };

  const handleSelect = async (suggestion) => {
    setLoading(true);
    try {
      const selectedCity = await selectCitySuggestion(suggestion);
      setQuery(selectedCity.city);
      onChange?.(selectedCity.city);
      onSelect?.(selectedCity);
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
      <div className={`flex items-center border rounded-lg bg-white transition ${disabled ? "border-gray-100 bg-gray-50" : query ? "border-[var(--primary-color)]" : "border-gray-200"} focus-within:border-[var(--primary-color)] focus-within:ring-1 focus-within:ring-[var(--primary-color)]`}>
        <FiMapPin size={16} className={`ml-3 flex-shrink-0 ${query ? "text-[var(--primary-color)]" : "text-gray-400"}`} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length) { updateDropPosition(); setShowDrop(true); } }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`flex-1 px-3 py-2.5 text-sm outline-none bg-transparent ${query ? "text-[var(--primary-color)]" : "text-gray-800"} placeholder-gray-400 disabled:cursor-not-allowed disabled:text-gray-400`}
        />
        {loading && <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin flex-shrink-0" />}
      </div>
      {showDrop && suggestions.length > 0 && (
        <ul style={dropStyle} className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId} onMouseDown={() => handleSelect(suggestion)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-[var(--primary-color-light)] hover:text-[var(--primary-color)] transition border-b border-gray-100 last:border-b-0">
              <FiMapPin size={13} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium">{suggestion.displayAddress}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
