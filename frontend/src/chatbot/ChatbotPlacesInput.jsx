import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { fetchCitySuggestions, fetchLocalitySuggestions, selectCitySuggestion, selectLocalitySuggestion, finishPlacesSession } from "../components/googlePlaces";

export default function ChatbotPlacesInput({ mode = "city", cityName = "", onSubmit, placeholder }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const debounceRef = useRef(null);
  const requestRef = useRef(0);
  const inputWrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => () => clearTimeout(debounceRef.current), []);
  useEffect(() => {
    requestRef.current += 1;
    setQuery("");
    setSuggestions([]);
    setShowDrop(false);
    setLoading(false);
  }, [mode, cityName]);

  useEffect(() => {
    function handler(event) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(event.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateDropPosition = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
  }, []);

  const fetchSuggestions = async (value, requestId) => {
    try {
      const results = mode === "city"
        ? await fetchCitySuggestions(value)
        : await fetchLocalitySuggestions(value, { cityName });
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
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      requestRef.current += 1;
      setSuggestions([]);
      setShowDrop(false);
      setLoading(false);
      finishPlacesSession();
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const requestId = ++requestRef.current;
      fetchSuggestions(value, requestId);
    }, 400);
  };

  const handleSelect = async (suggestion) => {
    setSuggestions([]);
    setShowDrop(false);
    if (mode === "city") {
      setLoading(true);
      try {
        const city = await selectCitySuggestion(suggestion);
        setQuery(city.city);
        onSubmit({ displayText: city.city });
      } catch {
        setQuery("");
      } finally {
        setLoading(false);
        finishPlacesSession();
      }
    } else {
      setLoading(true);
      try {
        const location = await selectLocalitySuggestion(suggestion, cityName);
        setQuery(location.address);
        onSubmit({ displayText: location.address, ...location });
      } catch {
        setQuery("");
      } finally {
        setLoading(false);
        finishPlacesSession();
      }
    }
  };

  return (
    <div ref={inputWrapRef} className="relative w-full">
      <div className="flex items-center border border-gray-200 rounded-xl focus-within:border-[var(--primary-color)] transition bg-white">
        <FiSearch size={15} className="ml-3 text-gray-400 flex-shrink-0" />
        <input ref={inputRef} type="text" value={query} onChange={handleChange} onFocus={() => { if (suggestions.length) { updateDropPosition(); setShowDrop(true); } }} placeholder={placeholder} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" autoComplete="off" />
        {loading && <span className="mr-3 w-4 h-4 border-2 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin flex-shrink-0" />}
      </div>
      {showDrop && suggestions.length > 0 && (
        <ul style={dropStyle} className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId} onMouseDown={() => handleSelect(suggestion)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-[var(--primary-color-light)] hover:text-[var(--primary-color)] transition">
              <FiSearch size={12} className="text-gray-400 flex-shrink-0" />
              <span>{mode === "city" ? suggestion.displayAddress : suggestion.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
