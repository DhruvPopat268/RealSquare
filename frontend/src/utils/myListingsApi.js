import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const config = { withCredentials: true };

/**
 * Fetch the current user's property listings.
 *
 * Two modes:
 *   1. Preview mode  — pass only `limit` (no `page`). Returns a plain array.
 *      Used by the Navbar to show a quick preview.
 *      e.g. fetchMyListings({ limit: 3 })
 *
 *   2. Paginated mode — pass `page` (and optionally other filters).
 *      Returns { listings, pagination, statusCounts? }
 *      e.g. fetchMyListings({ page: 1, limit: 10, status: "Active", purposeId: "...", categoryId: "...", typeId: "..." })
 *
 * @param {{ page?: number, limit?: number, status?: string, purposeId?: string, categoryId?: string, typeId?: string }} [params]
 */
export async function fetchMyListings({ page, limit, status, purposeId, categoryId, typeId } = {}) {
  const qs = new URLSearchParams();
  if (page       != null) qs.set("page",       page);
  if (limit      != null) qs.set("limit",      limit);
  if (status     != null && status !== "All") qs.set("status",     status);
  if (purposeId  != null) qs.set("purposeId",  purposeId);
  if (categoryId != null) qs.set("categoryId", categoryId);
  if (typeId     != null) qs.set("typeId",      typeId);

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const { data } = await axios.get(
    `${API}/api/mixed/property-listings/my-listings${query}`,
    config
  );

  // Preview mode: { success, data: [] }
  // Paginated mode: { success, data: [], pagination: {} }
  if (data.pagination) {
    return {
      listings:   data.data ?? [],
      pagination: data.pagination,
    };
  }
  return data.data ?? [];
}

/**
 * Fetch active property purposes (Sell / Rent / PG …)
 */
export async function fetchActivePurposes() {
  const { data } = await axios.get(
    `${API}/api/mixed/property-listings/active-purposes`,
    config
  );
  return data.data ?? [];
}

/**
 * Fetch active property categories (Residential / Commercial …)
 */
export async function fetchActiveCategories() {
  const { data } = await axios.get(
    `${API}/api/mixed/property-listings/active-categories`,
    config
  );
  return data.data ?? [];
}

/**
 * Fetch active property types, optionally filtered by categoryId.
 * @param {string} [categoryId]
 */
export async function fetchActivePropertyTypes(categoryId) {
  const qs = categoryId ? `?categoryId=${categoryId}` : "";
  const { data } = await axios.get(
    `${API}/api/mixed/property-listings/active-property-types${qs}`,
    config
  );
  return data.data ?? [];
}
