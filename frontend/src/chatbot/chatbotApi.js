import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const config = { withCredentials: true };

// ── Q2: active purposes ─────────────────────────────────────────────────────
export async function fetchActivePurposes({ showBuyLabel = false } = {}) {
  const { data } = await axios.get(`${API}/api/mixed/unprotected/active-purposes`, config);
  const SELL_ID = import.meta.env.VITE_LISTING_TYPE_SELL_ID;
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      label: showBuyLabel && p._id === SELL_ID ? "Buy" : p.name,
      value: p._id
    }));
}

// ── Q3: active categories (Residential / Commercial) ────────────────────────
export async function fetchActiveCategories() {
  const { data } = await axios.get(`${API}/api/mixed/unprotected/active-categories`, config);
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ label: c.name, value: c._id }));
}

// ── Q4: property types by categoryId ────────────────────────────────────────
export async function fetchPropertyTypes(categoryId) {
  const { data } = await axios.get(
    `${API}/api/mixed/unprotected/active-property-types?categoryId=${categoryId}`, config
  );
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ label: t.name, value: t._id }));
}

// ── Project listing Ideal For options ──────────────────────────────────────
export async function fetchActiveIdealFor() {
  const { data } = await axios.get(`${API}/api/mixed/project-listings/ideal-for`, config);
  return data.data ?? [];
}

// ── Virtual Space Benefits ───────────────────────────────────────────────────
export async function fetchVirtualSpaceBenefits() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-virtual-space-benefits`, config);
  return data.data ?? [];
}

// ── Furnishings & Amenities ───────────────────────────────────────────────────
export async function fetchFurnishingsAmenities() {
  const { data } = await axios.get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, config);
  return data.data;
}
