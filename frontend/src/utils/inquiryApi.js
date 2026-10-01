import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const config = { withCredentials: true };

/**
 * Fetch inquiries created by the logged-in user (paginated).
 * GET /api/mixed/inquiries/my?page=1&limit=10
 * Returns { inquiries, pagination }
 *
 * @param {{ page?: number, limit?: number }} params
 */
export async function fetchMyInquiries({ page = 1, limit = 10, purposeId, categoryId, typeId, status, classification, search } = {}) {
  const qs = new URLSearchParams();
  qs.set("page",  page);
  qs.set("limit", limit);
  if (purposeId)      qs.set("purposeId",      purposeId);
  if (categoryId)     qs.set("categoryId",     categoryId);
  if (typeId)         qs.set("typeId",         typeId);
  if (status)         qs.set("status",         status);
  if (classification) qs.set("classification", classification);
  if (search)         qs.set("search",         search);

  const { data } = await axios.get(
    `${API}/api/mixed/inquiries/my?${qs.toString()}`,
    config
  );
  return data.data ?? { inquiries: [], pagination: null, stats: null };
}

/**
 * Fetch inquiries assigned to the logged-in user (paginated + filtered).
 * GET /api/mixed/inquiries/assigned
 * Returns { assignments, pagination }
 *
 * @param {{ page?: number, limit?: number, status?: string, classification?: string,
 *           purposeId?: string, categoryId?: string, typeId?: string, search?: string }} params
 */
export async function fetchAssignedInquiries({
  page = 1, limit = 10,
  status, classification,
  purposeId, categoryId, typeId,
  search,
} = {}) {
  const qs = new URLSearchParams();
  qs.set("page",  page);
  qs.set("limit", limit);
  if (status)         qs.set("status",         status);
  if (classification) qs.set("classification", classification);
  if (purposeId)      qs.set("purposeId",      purposeId);
  if (categoryId)     qs.set("categoryId",     categoryId);
  if (typeId)         qs.set("typeId",         typeId);
  if (search)         qs.set("search",         search);

  const { data } = await axios.get(
    `${API}/api/mixed/inquiries/assigned?${qs.toString()}`,
    config
  );
  return data.data ?? { assignments: [], pagination: null, stats: null };
}

/**
 * Unlock an assigned inquiry using one plan credit or coins.
 * PATCH /api/mixed/inquiries/purchase
 * @param {{ assignmentId: string, purchasedVia: "plan" | "coins" }} payload
 */
export async function purchaseAssignedInquiry({ assignmentId, purchasedVia }) {
  const { data } = await axios.patch(
    `${API}/api/mixed/inquiries/purchase`,
    { assignmentId, purchasedVia },
    config
  );
  return data.data;
}
