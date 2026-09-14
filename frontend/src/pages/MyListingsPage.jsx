import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiHome, FiMapPin, FiCalendar, FiList,
  FiPlus, FiRefreshCw, FiEdit2, FiChevronLeft, FiChevronRight,
  FiFilter, FiChevronDown, FiX,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import {
  fetchMyListings,
  fetchActivePurposes,
  fetchActiveCategories,
  fetchActivePropertyTypes,
} from "../utils/myListingsApi";

const PAGE_LIMIT = 10;

// ── Status options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { _id: "Active",      name: "Active"       },
  { _id: "UnderReview", name: "Under Review" },
  { _id: "Sold",        name: "Sold"         },
  { _id: "Rented",      name: "Rented"       },
  { _id: "Rejected",    name: "Rejected"     },
  { _id: "Inactive",    name: "Inactive"     },
];

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active:      { label: "Active",       bg: "bg-green-100", text: "text-green-700",  dot: "bg-green-500"  },
  UnderReview: { label: "Under Review", bg: "bg-amber-100", text: "text-amber-700",  dot: "bg-amber-400"  },
  Rejected:    { label: "Rejected",     bg: "bg-red-100",   text: "text-red-600",    dot: "bg-red-500"    },
  Sold:        { label: "Sold",         bg: "bg-blue-100",  text: "text-blue-600",   dot: "bg-blue-500"   },
  Rented:      { label: "Rented",       bg: "bg-blue-100",  text: "text-blue-600",   dot: "bg-blue-500"   },
  Inactive:    { label: "Inactive",     bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-400"   },
};

// ── Listing type badge colors ─────────────────────────────────────────────────
const TYPE_CONFIG = {
  Sell:             { bg: "bg-purple-100", text: "text-purple-700" },
  Rent:             { bg: "bg-teal-100",   text: "text-teal-700"   },
  "PG / Co-living": { bg: "bg-pink-100",   text: "text-pink-700"   },
};

const EMPTY_FILTERS = { status: "", purposeId: "", categoryId: "", typeId: "" };

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="w-full sm:w-[220px] sm:flex-shrink-0 h-[180px] sm:h-auto bg-gray-100" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-1/3 mt-1" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Dropdown select ───────────────────────────────────────────────────────────
function FilterSelect({ label, value, options, onChange, disabled }) {
  return (
    <div className="relative flex-1 min-w-[140px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-white border rounded-xl px-3 py-2 pr-8 text-xs font-semibold transition outline-none
          ${value
            ? "border-[#7B2FFF] text-[#7B2FFF]"
            : "border-gray-200 text-gray-500"}
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-[#7B2FFF] cursor-pointer"}
          focus:border-[#7B2FFF] focus:ring-1 focus:ring-[#7B2FFF]/20`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt._id} value={opt._id}>{opt.name}</option>
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

// ── Main listing card ─────────────────────────────────────────────────────────
function ListingCard({ listing }) {
  const navigate = useNavigate();
  const status  = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.Inactive;
  const type    = TYPE_CONFIG[listing.listingType] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.media?.images?.length
    ? listing.media.images
    : listing.thumbnail ? [listing.thumbnail] : [];

  const nextImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 hover:border-[#7B2FFF] hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col sm:flex-row group"
      onClick={() => navigate(`/property/${listing._id}`)}
    >
      {/* Image Gallery */}
      <div className="relative w-full sm:w-[220px] sm:flex-shrink-0 h-[180px] sm:h-auto bg-[#f3eeff] flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                >
                  <FiChevronLeft size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                >
                  <FiChevronRight size={14} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {currentImageIndex + 1}/{images.length}
                </div>
                {images.length <= 5 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <FiHome size={32} className="text-[#c4aaff]" />
        )}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${type.bg} ${type.text}`}>
          {listing.listingType}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-[#1a1a2e] leading-snug truncate">{listing.title}</h3>
            {listing.category && (
              <span className="text-[11px] text-gray-400">{listing.category}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <button
              onClick={() => {/* TODO: navigate to edit page */}}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold hover:border-[#7B2FFF] hover:text-[#7B2FFF] hover:bg-[#f5f0ff] transition"
            >
              <FiEdit2 size={11} />
              Edit
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {listing.furnishType && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {listing.furnishType}
            </span>
          )}
          {listing.pgFor && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
              {listing.pgFor === "Both" ? "Boys & Girls" : `${listing.pgFor} Only`}
            </span>
          )}
          {listing.builtUpArea?.value && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {listing.builtUpArea.value} {listing.builtUpArea.unit || "sqft"}
            </span>
          )}
          {listing.plotArea?.value && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {listing.plotArea.value} {listing.plotArea.unit || "sqft"} Plot
            </span>
          )}
        </div>

        <p className="text-base font-extrabold text-[#7B2FFF] mb-1.5">
          {listing.price ?? <span className="text-sm font-semibold text-gray-400">Price on request</span>}
        </p>

        {(listing.address || listing.cityName) && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
            <FiMapPin size={10} className="flex-shrink-0" />
            <span className="truncate">
              {[listing.address, listing.cityName].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end">
          {listing.createdAt && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <FiCalendar size={10} />
              <span>Listed on {formatDate(listing.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ filtered, navigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f3eeff] flex items-center justify-center mb-4">
        <FiList size={28} className="text-[#7B2FFF]" />
      </div>
      <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">
        {filtered ? "No listings match these filters" : "No listings yet"}
      </h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">
        {filtered
          ? "Try adjusting or clearing the filters to see your listings."
          : "You haven't listed any property yet. Start by listing your first property."}
      </p>
      {!filtered && (
        <button
          onClick={() => navigate("/chatbot")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7B2FFF] text-white rounded-xl text-sm font-bold hover:bg-[#6320d4] transition"
        >
          <FiPlus size={15} />
          List a Property
        </button>
      )}
    </div>
  );
}

// ── Loading more spinner ──────────────────────────────────────────────────────
function LoadingMore() {
  return (
    <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
      <svg className="animate-spin w-4 h-4 text-[#7B2FFF]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading more listings…
    </div>
  );
}

// ── End of list ───────────────────────────────────────────────────────────────
function EndOfList({ total }) {
  return (
    <div className="flex flex-col items-center py-6 gap-1 text-xs text-gray-400">
      <span className="w-8 h-px bg-gray-200" />
      <span>You&apos;ve seen all {total} listing{total !== 1 ? "s" : ""}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyListingsPage() {
  const navigate = useNavigate();

  // ── Listing / pagination state ────────────────────────────────────────────
  const [listings,    setListings]    = useState([]);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);

  // ── Filter options ────────────────────────────────────────────────────────
  const [purposes,      setPurposes]      = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // ── Pending filters (user is editing, not yet applied) ───────────────────
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);

  // ── Applied filters (what's actually sent to API) ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  // ── Derived ───────────────────────────────────────────────────────────────
  const hasAppliedFilters  = Object.values(appliedFilters).some(Boolean);
  const hasPendingChanges  = Object.keys(EMPTY_FILTERS).some(
    (k) => pendingFilters[k] !== appliedFilters[k]
  );
  const anyPendingValue    = Object.values(pendingFilters).some(Boolean);

  // ── Sentinel + fetch guard ────────────────────────────────────────────────
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const fetchingRef = useRef(false);

  // ── Fetch filter options on mount ─────────────────────────────────────────
  useEffect(() => {
    setOptionsLoading(true);
    Promise.all([fetchActivePurposes(), fetchActiveCategories()])
      .then(([p, c]) => { setPurposes(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  // ── Reload property types when pending category changes ───────────────────
  useEffect(() => {
    setPropertyTypes([]);
    setPendingFilters((prev) => ({ ...prev, typeId: "" }));
    if (!pendingFilters.categoryId) return;
    fetchActivePropertyTypes(pendingFilters.categoryId)
      .then(setPropertyTypes)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFilters.categoryId]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const loadPage = useCallback(async (pageNum, filters, replace = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const result = await fetchMyListings({
        page:       pageNum,
        limit:      PAGE_LIMIT,
        status:     filters.status     || undefined,
        purposeId:  filters.purposeId  || undefined,
        categoryId: filters.categoryId || undefined,
        typeId:     filters.typeId     || undefined,
      });

      const { listings: newListings, pagination } = result;
      setListings((prev) => replace ? newListings : [...prev, ...newListings]);
      setHasMore(pagination.hasMore);
      setTotalCount(pagination.totalCount);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load listings");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // ── Re-fetch when applied filters change ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    setListings([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, appliedFilters, true);
  }, [appliedFilters, loadPage]);

  // ── IntersectionObserver ──────────────────────────────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          loadPage(page + 1, appliedFilters, false);
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, appliedFilters, loadPage]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApply = () => {
    if (!hasPendingChanges) return;
    setAppliedFilters({ ...pendingFilters });
  };

  const handleClear = () => {
    setPendingFilters(EMPTY_FILTERS);
    setPropertyTypes([]);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setListings([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, appliedFilters, true);
  };

  // ── Applied filter pill labels (for display) ──────────────────────────────
  const appliedLabels = [
    appliedFilters.status     && STATUS_OPTIONS.find((o) => o._id === appliedFilters.status)?.name,
    appliedFilters.purposeId  && purposes.find((o) => o._id === appliedFilters.purposeId)?.name,
    appliedFilters.categoryId && categories.find((o) => o._id === appliedFilters.categoryId)?.name,
    appliedFilters.typeId     && propertyTypes.find((o) => o._id === appliedFilters.typeId)?.name,
  ].filter(Boolean);

  return (
    <>
      <PageSpinner />
      <Navbar />

      <div className="min-h-screen bg-[#f9f9fb]">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:border-[#7B2FFF] hover:bg-[#f5f0ff] text-gray-500 hover:text-[#7B2FFF] transition bg-white"
            >
              <FiArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#1a1a2e] leading-tight">My Listings</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading
                  ? "Loading your properties…"
                  : totalCount > 0
                    ? `${totalCount} propert${totalCount !== 1 ? "ies" : "y"} found`
                    : "All properties you have listed on RealSquare"}
              </p>
            </div>
            {!loading && (
              <button
                onClick={() => navigate("/chatbot")}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#7B2FFF] text-white rounded-xl text-xs font-bold hover:bg-[#6320d4] transition"
              >
                <FiPlus size={13} />
                New Listing
              </button>
            )}
          </div>

          {/* ── Filter panel ─────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <FiFilter size={13} className="text-[#7B2FFF]" />
              <span className="text-xs font-bold text-[#1a1a2e]">Filter Listings</span>
              {hasAppliedFilters && (
                <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#7B2FFF]">
                  {appliedLabels.length} filter{appliedLabels.length !== 1 ? "s" : ""} applied
                </span>
              )}
            </div>

            {/* 4 dropdowns — wrap on mobile */}
            <div className="flex flex-wrap gap-2 mb-3">
              <FilterSelect
                label="Status"
                value={pendingFilters.status}
                options={STATUS_OPTIONS}
                disabled={false}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, status: val }))}
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
                onChange={(val) =>
                  setPendingFilters((prev) => ({ ...prev, categoryId: val, typeId: "" }))
                }
              />
              <FilterSelect
                label="Property Type"
                value={pendingFilters.typeId}
                options={propertyTypes}
                disabled={optionsLoading || !pendingFilters.categoryId}
                onChange={(val) => setPendingFilters((prev) => ({ ...prev, typeId: val }))}
              />
            </div>

            {/* Apply / Clear */}
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
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  hasPendingChanges
                    ? "bg-[#7B2FFF] text-white hover:bg-[#6320d4]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Applied filter pills */}
          {hasAppliedFilters && appliedLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {appliedLabels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f3eeff] text-[#7B2FFF] border border-[#e0d0ff]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition"
              >
                <FiRefreshCw size={12} />
                Retry
              </button>
            </div>
          ) : listings.length === 0 ? (
            <EmptyState filtered={hasAppliedFilters} navigate={navigate} />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              <div ref={sentinelRef} className="h-1" />
              {loadingMore && <LoadingMore />}
              {!hasMore && !loadingMore && <EndOfList total={totalCount} />}
            </>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
