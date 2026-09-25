import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const config = { withCredentials: true };

// ── Q2: active purposes (Buy / Rent / PG) ───────────────────────────────────
export async function fetchActivePurposes() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-purposes`, config);
  const SELL_ID = import.meta.env.VITE_LISTING_TYPE_SELL_ID;
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      label: p._id === SELL_ID ? "Buy" : p.name, // Show "Buy" instead of "Sell"
      value: p._id
    }));
}

// ── Q3: active categories (Residential / Commercial) ────────────────────────
export async function fetchActiveCategories() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-categories`, config);
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ label: c.name, value: c._id }));
}

// ── Q4: property types by categoryId ────────────────────────────────────────
export async function fetchPropertyTypes(categoryId) {
  const { data } = await axios.get(
    `${API}/api/mixed/property-listings/active-property-types?categoryId=${categoryId}`, config
  );
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ label: t.name, value: t._id }));
}

// ── Furnishings & Amenities ───────────────────────────────────────────────────
export async function fetchFurnishingsAmenities() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, config);
  return data.data;
}
