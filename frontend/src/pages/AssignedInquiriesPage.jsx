import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiClipboard, FiMapPin, FiDollarSign, FiCalendar,
  FiMessageSquare, FiHome, FiCheckCircle, FiUser, FiPhone,
  FiFilter, FiChevronDown, FiX, FiLock,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchAssignedInquiries } from "../utils/inquiryApi";
import { fetchActivePurposes, fetchActiveCategories, fetchActivePropertyTypes } from "../utils/myListingsApi";

const ALLOWED_ROLES = [
  import.meta.env.VITE_OWNER_ROLE_ID,
  import.meta.env.VITE_BROKER_ROLE_ID,
  import.meta.env.VITE_BUILDER_ROLE_ID,
];

const LIMIT = 10;
const EMPTY_FILTERS = { status: "", classification: "", purposeId: "", categoryId: "", typeId: "" };

const STATUS_OPTIONS = [{ _id: "active", name: "Active" }, { _id: "purchased", name: "Purchased" }];
const CLASS_OPTIONS  = [{ _id: "hot", name: "Hot 🔥" }, { _id: "warm", name: "Warm 🌤️" }, { _id: "cold", name: "Cold ❄️" }];

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLASSIFICATION_STYLES = {
  hot:  { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-600",   dot: "bg-red-500"   },
  warm: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-600", dot: "bg-amber-500" },
  cold: { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-600",  dot: "bg-blue-500"  },
};

function formatBudget(min, max) {
  const fmt = (n) => {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, "")} Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1).replace(/\.0$/, "")} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  return `${fmt(min)} – ${fmt(max)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const isMasked = (val) => val === "****";

// ── Filter Select ─────────────────────────────────────────────────────────────

function FilterSelect({ label, value, options, onChange, disabled }) {
  return (
    <div className="relative flex-1 min-w-[140px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-white border rounded-xl px-3 py-2 pr-8 text-xs font-semibold transition outline-none
          ${value ? "border-[#7B2FFF] text-[#7B2FFF]" : "border-gray-200 text-gray-500"}
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-[#7B2FFF] cursor-pointer"}
          focus:border-[#7B2FFF] focus:ring-1 focus:ring-[#7B2FFF]/20`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt._id ?? opt.value} value={opt._id ?? opt.value}>{opt.name ?? opt.label}</option>
        ))}
      </select>
      <FiChevronDown
        size={13}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition ${
          value ? "text-[#7B2FFF]" : "text-gray-400"
        }`}
      />
    </div>
  );
}

// ── Assigned Inquiry Card ─────────────────────────────────────────────────────

function AssignedInquiryCard({ assignment }) {
  const inquiry = assignment.inquiry;
  if (!inquiry) return null;

  const cls = CLASSIFICATION_STYLES[inquiry.inquiryClassification] ?? CLASSIFICATION_STYLES.cold;
  const purchased = assignment.status === "purchased";

  const areaDetail =
    inquiry.bhk != null          ? `${inquiry.bhk} BHK`
    : inquiry.builtUpArea?.value ? `${inquiry.builtUpArea.value} ${inquiry.builtUpArea.unit} built-up`
    : inquiry.plotArea?.value    ? `${inquiry.plotArea.value} ${inquiry.plotArea.unit} plot`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">

      {/* Top row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cls.bg} ${cls.border} ${cls.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
          {inquiry.inquiryClassification.charAt(0).toUpperCase() + inquiry.inquiryClassification.slice(1)} Lead
        </span>
        <div className="flex items-center gap-2">
          {inquiry.verifiedByUser?.isVerified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-600 text-[10px] font-bold">
              <FiCheckCircle size={10} />
              Verified
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            purchased
              ? "bg-[#f5f0ff] border-[#e0d5ff] text-[#7B2FFF]"
              : "bg-green-50 border-green-200 text-green-600"
          }`}>
            {purchased ? "Purchased" : "Active"}
          </span>
        </div>
      </div>

      {/* createdBy — masked or real */}
      <div className={`flex items-start gap-3 p-3 rounded-xl border ${purchased ? "border-[#e0d5ff] bg-[#f9f7ff]" : "border-gray-100 bg-gray-50"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${purchased ? "bg-[#7B2FFF]" : "bg-gray-200"}`}>
          <FiUser size={14} className={purchased ? "text-white" : "text-gray-400"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Inquiry By</p>
          {isMasked(inquiry.createdBy?.name) ? (
            <p className="text-xs text-gray-400 italic">Purchase to reveal contact details</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#1a1a2e]">{inquiry.createdBy?.name}</p>
              <div className="flex items-center gap-1">
                <FiPhone size={11} className="text-gray-400" />
                <p className="text-xs text-gray-500">{inquiry.createdBy?.mobile}</p>
              </div>
            </div>
          )}
        </div>
        {!purchased && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
            Locked 🔒
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <FiMapPin size={14} className="text-[#7B2FFF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">{inquiry.preferredCity}</p>
          {inquiry.preferredArea && (
            <p className="text-xs text-gray-400">{inquiry.preferredArea}</p>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="flex items-center gap-2">
        <FiDollarSign size={14} className="text-[#7B2FFF] flex-shrink-0" />
        <p className="text-sm font-semibold text-[#1a1a2e]">
          {formatBudget(inquiry.budget.min, inquiry.budget.max)}
        </p>
      </div>

      {/* Row 1 — Purpose / Category / Type */}
      <div className="flex flex-wrap gap-2">
        {inquiry.listingType?.name && (
          <span className="px-2.5 py-1 bg-[#f5f0ff] text-[#7B2FFF] border border-[#e0d5ff] rounded-lg text-[11px] font-bold">
            {inquiry.listingType.name}
          </span>
        )}
        {inquiry.propertyCategory?.name && (
          <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold">
            {inquiry.propertyCategory.name}
          </span>
        )}
        {inquiry.propertyType?.name && (
          <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold">
            {inquiry.propertyType.name}
          </span>
        )}
      </div>

      {/* Row 2 — Area / BHK + Furnishing */}
      {(areaDetail || inquiry.furnishingType) && (
        <div className="flex flex-wrap gap-2">
          {areaDetail && (
            <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold">
              {areaDetail}
            </span>
          )}
          {inquiry.furnishingType && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f5f0ff] text-[#7B2FFF] rounded-lg text-[11px] font-semibold">
              <FiHome size={11} />
              {inquiry.furnishingType}
            </span>
          )}
        </div>
      )}

      {/* Row 3 — Communication Preferences */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">Communication Preferences:</span>
        {inquiry.preferredCommunication.map((ch) => (
          <span key={ch} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold capitalize">
            {ch}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-100" />

      {/* Footer */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <FiCalendar size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500">
            createdAt: <span className="font-semibold text-[#1a1a2e]">{formatDate(inquiry.createdAt)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500">
            Last Follow-up Date: <span className="font-semibold text-[#1a1a2e]">{formatDate(inquiry.lastFollowUpDate)}</span>
          </span>
        </div>
        {inquiry.remarks && (
          <div className="flex items-start gap-1.5">
            <FiMessageSquare size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 truncate">{inquiry.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
        <div className="h-5 w-28 bg-gray-100 rounded-full" />
      </div>
      <div className="h-14 bg-gray-100 rounded-xl" />
      <div className="h-4 w-40 bg-gray-100 rounded" />
      <div className="h-4 w-32 bg-gray-100 rounded" />
      <div className="flex gap-2">
        <div className="h-6 w-24 bg-gray-100 rounded-lg" />
        <div className="h-6 w-16 bg-gray-100 rounded-lg" />
      </div>
      <div className="border-t border-gray-100" />
      <div className="h-3 w-36 bg-gray-100 rounded" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssignedInquiriesPage() {
  const navigate    = useNavigate();
  const sentinelRef = useRef(null);

  // ── Access guard ─────────────────────────────────────────────────────────
  const [authLoading, setAuthLoading] = useState(true);
  const [allowed,     setAllowed]     = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/system-users/me`, { withCredentials: true })
      .then(({ data }) => {
        if (data.success) {
          setAllowed(ALLOWED_ROLES.includes(data.data?.role?._id));
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setAuthLoading(false));
  }, [navigate]);

  const [assignments,    setAssignments]    = useState([]);
  const [page,           setPage]           = useState(1);
  const [hasMore,        setHasMore]        = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error,          setError]          = useState(null);
  const [stats,          setStats]          = useState(null);

  // ── Filter options
  const [purposes,       setPurposes]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [propertyTypes,  setPropertyTypes]  = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // ── Search
  const [searchInput,    setSearchInput]    = useState("");
  const [appliedSearch,  setAppliedSearch]  = useState("");

  // ── Pending vs applied filters
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean) || !!appliedSearch;
  const hasPendingChanges = Object.keys(EMPTY_FILTERS).some((k) => pendingFilters[k] !== appliedFilters[k])
    || searchInput !== appliedSearch;
  const anyPendingValue   = Object.values(pendingFilters).some(Boolean) || !!searchInput;

  // ── Load filter options on mount
  useEffect(() => {
    setOptionsLoading(true);
    Promise.all([fetchActivePurposes(), fetchActiveCategories()])
      .then(([p, c]) => { setPurposes(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  // ── Reload property types when pending category changes
  useEffect(() => {
    setPropertyTypes([]);
    setPendingFilters((prev) => ({ ...prev, typeId: "" }));
    if (!pendingFilters.categoryId) return;
    fetchActivePropertyTypes(pendingFilters.categoryId)
      .then(setPropertyTypes)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFilters.categoryId]);

  // ── Core fetch
  const loadPage = useCallback(async (pageNum, filters, search, replace = false) => {
    setLoading(true);
    try {
      const { assignments: newItems, stats: pageStats } = await fetchAssignedInquiries({
        page:           pageNum,
        limit:          LIMIT,
        status:         filters.status         || undefined,
        classification: filters.classification || undefined,
        purposeId:      filters.purposeId      || undefined,
        categoryId:     filters.categoryId     || undefined,
        typeId:         filters.typeId         || undefined,
        search:         search                 || undefined,
      });
      setAssignments((prev) => replace ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === LIMIT);
      setPage(pageNum);
      if (pageNum === 1 && pageStats) setStats(pageStats);
    } catch {
      setError("Failed to load assigned inquiries. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // ── Re-fetch when applied filters or search change
  useEffect(() => {
    if (!allowed) return;
    setInitialLoading(true);
    setError(null);
    setAssignments([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, appliedFilters, appliedSearch, true);
  }, [allowed, appliedFilters, appliedSearch, loadPage]);

  // ── IntersectionObserver
  useEffect(() => {
    if (!allowed || !hasMore || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadPage(page + 1, appliedFilters, appliedSearch, false);
      }
    }, { threshold: 1.0 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [allowed, hasMore, loading, page, appliedFilters, appliedSearch, loadPage]);

  // ── Filter handlers
  const handleApply = () => {
    if (hasPendingChanges) {
      setAppliedFilters({ ...pendingFilters });
      setAppliedSearch(searchInput);
    }
  };
  const handleClear = () => {
    setPendingFilters(EMPTY_FILTERS);
    setPropertyTypes([]);
    setAppliedFilters(EMPTY_FILTERS);
    setSearchInput("");
    setAppliedSearch("");
  };

  const appliedLabels = [
    appliedSearch && `"${appliedSearch}"`,
    appliedFilters.status         && STATUS_OPTIONS.find((o) => o._id === appliedFilters.status)?.name,
    appliedFilters.classification && CLASS_OPTIONS.find((o) => o._id === appliedFilters.classification)?.name,
    appliedFilters.purposeId      && purposes.find((o) => (o._id ?? o.value) === appliedFilters.purposeId)?.name,
    appliedFilters.categoryId     && categories.find((o) => (o._id ?? o.value) === appliedFilters.categoryId)?.name,
    appliedFilters.typeId         && propertyTypes.find((o) => (o._id ?? o.value) === appliedFilters.typeId)?.name,
  ].filter(Boolean);

  // ── Auth loading spinner ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  // ── Access restricted ────────────────────────────────────────────────────
  if (!allowed) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[420px] p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f3eeff] flex items-center justify-center mb-5">
              <FiLock size={28} className="text-[#7B2FFF]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1a1a2e] mb-2">Access Restricted</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              You don't have permission to view assigned inquiries. Only Owners, Brokers, and Builders can access this page.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-[#f7f8fa] min-h-[calc(100vh-62px)]">
        <div className="max-w-6xl w-full mx-auto px-4 py-8">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7B2FFF] flex items-center justify-center shadow-sm">
                <FiClipboard size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#1a1a2e] leading-tight">Assigned Inquiries</h1>
                <p className="text-xs text-gray-400">Inquiries matched to you based on your cities</p>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          {stats && !initialLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
              <div className="bg-white border border-green-200 rounded-2xl p-3 text-center hover:shadow-md transition">
                <p className="text-[11px] text-green-600 font-semibold mb-1">Active</p>
                <p className="text-2xl font-extrabold text-green-600">{stats.active ?? 0}</p>
              </div>
              <div className="bg-white border border-[#e0d5ff] rounded-2xl p-3 text-center hover:shadow-md transition">
                <p className="text-[11px] text-[#7B2FFF] font-semibold mb-1">Purchased</p>
                <p className="text-2xl font-extrabold text-[#7B2FFF]">{stats.purchased ?? 0}</p>
              </div>
              <div className="bg-white border border-red-200 rounded-2xl p-3 text-center hover:shadow-md transition">
                <p className="text-[11px] text-red-500 font-semibold mb-1">Hot 🔥</p>
                <p className="text-2xl font-extrabold text-red-500">{stats.hot ?? 0}</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-2xl p-3 text-center hover:shadow-md transition">
                <p className="text-[11px] text-amber-500 font-semibold mb-1">Warm 🌤️</p>
                <p className="text-2xl font-extrabold text-amber-500">{stats.warm ?? 0}</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-2xl p-3 text-center hover:shadow-md transition">
                <p className="text-[11px] text-blue-500 font-semibold mb-1">Cold ❄️</p>
                <p className="text-2xl font-extrabold text-blue-500">{stats.cold ?? 0}</p>
              </div>
            </div>
          )}

          {/* Filter panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <FiFilter size={13} className="text-[#7B2FFF]" />
              <span className="text-xs font-bold text-[#1a1a2e]">Filter Inquiries</span>
              {hasAppliedFilters && (
                <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#7B2FFF]">
                  {appliedLabels.length} filter{appliedLabels.length !== 1 ? "s" : ""} applied
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Search by city, area, name or mobile..."
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold outline-none focus:border-[#7B2FFF] focus:ring-1 focus:ring-[#7B2FFF]/20 transition placeholder-gray-400"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-2 mb-3">
              <FilterSelect
                label="Status"
                value={pendingFilters.status}
                options={STATUS_OPTIONS}
                disabled={false}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, status: val }))}
              />
              <FilterSelect
                label="Classification"
                value={pendingFilters.classification}
                options={CLASS_OPTIONS}
                disabled={false}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, classification: val }))}
              />
              <FilterSelect
                label="Purpose"
                value={pendingFilters.purposeId}
                options={purposes}
                disabled={optionsLoading}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, purposeId: val }))}
              />
              <FilterSelect
                label="Category"
                value={pendingFilters.categoryId}
                options={categories}
                disabled={optionsLoading}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, categoryId: val, typeId: "" }))}
              />
              <FilterSelect
                label="Property Type"
                value={pendingFilters.typeId}
                options={propertyTypes}
                disabled={optionsLoading || !pendingFilters.categoryId}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, typeId: val }))}
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              {(hasAppliedFilters || anyPendingValue) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <FiX size={11} />
                  Clear
                </button>
              )}
              <button
                onClick={handleApply}
                disabled={!hasPendingChanges}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#7B2FFF] text-white hover:bg-[#6320d4] border-none cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Error */}
          {!initialLoading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-sm text-red-500 font-semibold">{error}</p>
              <button
                onClick={() => { setError(null); setInitialLoading(true); loadPage(1, appliedFilters, appliedSearch, true); }}
                className="text-sm text-[#7B2FFF] font-semibold underline bg-transparent border-none cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Skeletons */}
          {initialLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!initialLoading && !error && assignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f3eeff] flex items-center justify-center">
                <FiClipboard size={28} className="text-[#7B2FFF]" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-[#1a1a2e]">
                  {hasAppliedFilters ? "No inquiries match these filters" : "No assigned inquiries yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {hasAppliedFilters
                    ? "Try adjusting or clearing the filters."
                    : "Inquiries matching your cities will appear here."}
                </p>
              </div>
            </div>
          )}

          {/* Cards */}
          {!initialLoading && !error && assignments.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((a) => (
                  <AssignedInquiryCard key={a._id} assignment={a} />
                ))}
              </div>

              <div ref={sentinelRef} className="h-1 mt-4" />

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-xs text-gray-400 py-6">No more inquiries</p>
              )}
            </>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
