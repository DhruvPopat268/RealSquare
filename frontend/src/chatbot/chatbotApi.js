import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const config = { withCredentials: true };

// ── Q2: active purposes (Sell / Rent / PG) ──────────────────────────────────
export async function fetchActivePurposes() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-purposes`, config);
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ label: p.name, value: p._id }));
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

// ── Q5: active cities ────────────────────────────────────────────────────────
export async function fetchActiveCities() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-cities`, config);
  return data.data.map((c) => ({ label: c.name, value: c._id }));
}

// ── Furnishings & Amenities ───────────────────────────────────────────────────
export async function fetchFurnishingsAmenities() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, config);
  return data.data;
}
