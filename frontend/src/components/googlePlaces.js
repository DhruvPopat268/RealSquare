import api from "../utils/axiosInterceptor";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_URL;
let placesLibraryPromise;
let citySessionToken;
let placesSessionToken;

function createSessionToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function loadPlacesLibrary() {
  if (window.google?.maps?.importLibrary) {
    return window.google.maps.importLibrary("places");
  }
  if (!placesLibraryPromise) {
    placesLibraryPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("gmap-script");
      if (existing) {
        existing.addEventListener("load", () => window.google.maps.importLibrary("places").then(resolve, reject), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = "gmap-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=places`;
      script.async = true;
      script.onload = () => window.google.maps.importLibrary("places").then(resolve, reject);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return placesLibraryPromise;
}

function getCitySessionToken() {
  if (!citySessionToken) citySessionToken = createSessionToken();
  return citySessionToken;
}

function getPlacesSessionToken() {
  if (!placesSessionToken) placesSessionToken = createSessionToken();
  return placesSessionToken;
}

function component(components, type) {
  return components?.find((item) => item.types?.includes(type))?.longText ?? "";
}

function extractCity(components) {
  return component(components, "locality") || component(components, "postal_town");
}

export function normalizePlaceName(value = "") {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export async function fetchCitySuggestions(input) {
  const query = input.trim();
  if (!query) return [];
  const { data } = await api.post(
    `${API_BASE_URL}/api/system-users/city-suggestions`,
    { input: query, sessionToken: getCitySessionToken() },
    { withCredentials: true },
  );
  return data?.data?.suggestions ?? [];
}

export function selectCitySuggestion(suggestion) {
  if (!suggestion?.city || !suggestion?.placeId) throw new Error("Invalid city suggestion.");
  return { ...suggestion, viewport: null };
}

export async function fetchLocalitySuggestions(input, { cityName } = {}) {
  const query = input.trim();
  if (!query || !cityName) return [];
  const { data } = await api.post(
    `${API_BASE_URL}/api/system-users/city-address-suggestions`,
    { input: query, cityName, sessionToken: getPlacesSessionToken() },
    { withCredentials: true },
  );
  return data?.data?.suggestions ?? [];
}

export async function selectLocalitySuggestion(suggestion, cityName) {
  if (!suggestion?.placeId) throw new Error("Invalid address suggestion.");
  const places = await loadPlacesLibrary();
  const place = new places.Place({ id: suggestion.placeId });
  await place.fetchFields({ fields: ["addressComponents", "formattedAddress", "location"] });
  const placeCity = extractCity(place.addressComponents);
  if (!placeCity || normalizePlaceName(placeCity) !== normalizePlaceName(cityName)) {
    throw new Error("This location does not belong to the selected city.");
  }
  return {
    placeId: suggestion.placeId,
    address: place.formattedAddress || suggestion.address,
    latitude: place.location?.lat() ?? null,
    longitude: place.location?.lng() ?? null,
  };
}

export function finishPlacesSession() {
  citySessionToken = null;
  placesSessionToken = null;
}
