import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiX, FiClock } from "react-icons/fi";
import { properties, newlyAddedProperties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import PropertyCard from "../components/PropertyCard";
import ListingHeader from "../components/ListingHeader";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const INTENT_SOURCE = {
  BUY:            properties,
  RENT:           rentProperties,
  COMMERCIAL:     commercialProperties,
  "PG/CO-LIVING": pgProperties,
  PLOTS:          plotProperties,
};

function timeAgo(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const PROPERTY_TYPES = ["Apartment", "Villa", "House", "Plot", "Studio", "Commercial"];
const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const BUDGETS = [
  { label: "Under ₹50L", min: 0, max: 50 },
  { label: "₹50L - ₹1Cr", min: 50, max: 100 },
  { label: "₹1Cr - ₹2Cr", min: 100, max: 200 },
  { label: "₹2Cr - ₹5Cr", min: 200, max: 500 },
  { label: "Above ₹5Cr", min: 500, max: Infinity },
];
const STATUSES = ["Ready to Move", "New Launch", "Under Construction", "Premium"];
const AMENITIES = ["Parking", "Lift", "Park", "Club house", "Gymnasium", "Swimming Pool"];

const TYPE_CONFIG = {
  buy:            { verb: "Sale",           noun: "Properties" },
  rent:           { verb: "Rent",           noun: "Flats" },
  commercial:     { verb: "Lease",          noun: "Commercial Spaces" },
  "pg/co-living": { verb: "PG / Co-Living", noun: "Rooms" },
  "pg/coliving":  { verb: "PG / Co-Living", noun: "Rooms" },
  plots:          { verb: "Sale",           noun: "Plots" },
};

function getTypeConfig(listingType) {
  return TYPE_CONFIG[(listingType || "buy").toLowerCase()] || { verb: listingType, noun: "Properties" };
}

function parsePriceToL(price) {
  if (!price) return 0;
  const str = price.replace(/[₹,]/g, "").trim();
  if (str.includes("Cr")) return parseFloat(str) * 100;
  if (str.includes("L")) return parseFloat(str);
  return 0;
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded border transition font-medium ${
        active
          ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
          : "border-gray-300 text-gray-600 hover:border-[#7B2FFF] hover:text-[#7B2FFF] bg-white"
      }`}
    >
      {active ? "" : "+ "}{label}
    </button>
  );
}

export default function PropertyListPage() {
  const [searchParams] = useSearchParams();

  const listingType = searchParams.get("listingType") || "BUY";
  const city = searchParams.get("city") || "";
  const areas = searchParams.get("areas") ? searchParams.get("areas").split(",").filter(Boolean) : [];
  const isNewlyAdded = searchParams.get("source") === "newly-added";

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedBhk([]);
    setSelectedBudget(null);
    setSelectedStatus([]);
    setSelectedAmenities([]);
  };

  const activeFilterCount =
    selectedTypes.length + selectedBhk.length + selectedStatus.length +
    selectedAmenities.length + (selectedBudget ? 1 : 0);

  // Reset sidebar filters when URL (city/type) changes
  useEffect(() => {
    clearAll();
  }, [city, listingType]);

  const sourceList = isNewlyAdded
    ? newlyAddedProperties.map((p) => ({ ...p, title: p.name, isNewlyAdded: true }))
    : (INTENT_SOURCE[listingType.toUpperCase()] || properties);

  const filtered = useMemo(() => {
    let list = [...sourceList];
    if (city) list = list.filter((p) => p.location.toLowerCase().includes(city.toLowerCase()));
    if (areas.length) list = list.filter((p) => areas.some((a) => p.location.toLowerCase().includes(a.toLowerCase())));
    if (selectedTypes.length) list = list.filter((p) => selectedTypes.includes(p.type));
    if (selectedBhk.length) {
      list = list.filter((p) => {
        if (p.beds == null) return false;
        return selectedBhk.some((b) => {
          if (b === "1 RK") return p.beds === 0;
          if (b === "4+ BHK") return p.beds >= 4;
          return p.beds === parseInt(b);
        });
      });
    }
    if (selectedBudget) {
      list = list.filter((p) => {
        const price = parsePriceToL(p.price.split("-")[0]);
        return price >= selectedBudget.min && price <= selectedBudget.max;
      });
    }
    if (selectedStatus.length) list = list.filter((p) => selectedStatus.includes(p.tag));
    if (sortBy === "price-asc") list.sort((a, b) => parsePriceToL(a.price) - parsePriceToL(b.price));
    if (sortBy === "price-desc") list.sort((a, b) => parsePriceToL(b.price) - parsePriceToL(a.price));
    return list;
  }, [city, areas.join(","), selectedTypes, selectedBhk, selectedBudget, selectedStatus, selectedAmenities, sortBy]);

  const { verb, noun } = getTypeConfig(listingType);
  const areaLabel = areas.length ? areas.join(", ") : city || "All Cities";
  const pageTitle = `${noun} for ${verb} in ${areaLabel}`;

  return (
    <>
      <PageSpinner key={`${city}-${areas.join()}`} />
      <ListingHeader />
      <div className="bg-[#f7f8fa] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-5 flex gap-5 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-[260px] flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 sticky top-[70px] max-h-[calc(100vh-80px)] overflow-y-auto">
            <p className="font-bold text-gray-800 text-sm mb-3 pb-3 border-b border-gray-100">Filters</p>

            {/* Budget */}
            <FilterSection title="Budget">
              <div className="flex flex-col gap-1.5">
                {BUDGETS.map((b) => (
                  <label key={b.label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="budget"
                      checked={selectedBudget?.label === b.label}
                      onChange={() => setSelectedBudget(selectedBudget?.label === b.label ? null : b)}
                      className="accent-[#7B2FFF]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#7B2FFF]">{b.label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Type of Property */}
            <FilterSection title="Type of property">
              <div className="flex flex-col gap-1.5">
                {PROPERTY_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => toggle(selectedTypes, setSelectedTypes, t)}
                      className="accent-[#7B2FFF]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#7B2FFF]">{t}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* No. of Bedrooms */}
            <FilterSection title="No. of Bedrooms">
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((b) => (
                  <FilterChip
                    key={b}
                    label={b}
                    active={selectedBhk.includes(b)}
                    onClick={() => toggle(selectedBhk, setSelectedBhk, b)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Construction Status */}
            <FilterSection title="Construction Status">
              <div className="flex flex-col gap-1.5">
                {STATUSES.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedStatus.includes(s)}
                      onChange={() => toggle(selectedStatus, setSelectedStatus, s)}
                      className="accent-[#7B2FFF]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#7B2FFF]">{s}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Amenities" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <FilterChip
                    key={a}
                    label={a}
                    active={selectedAmenities.includes(a)}
                    onClick={() => toggle(selectedAmenities, setSelectedAmenities, a)}
                  />
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Newly Added banner */}
            {isNewlyAdded && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <FiClock size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-700">Showing Newly Added Properties</span>
                <span className="text-xs text-green-500 ml-1">— freshest listings first</span>
              </div>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {filtered.length} results | {pageTitle}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#7B2FFF] bg-white"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Applied filters bar */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 mr-1">Applied Filters:</span>
                {areas.map((a) => (
                  <span key={a} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {a}
                  </span>
                ))}
                {selectedTypes.map((t) => (
                  <span key={t} className="flex items-center gap-1 bg-[#f0ebff] text-[#7B2FFF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {t} <FiX size={10} className="cursor-pointer" onClick={() => toggle(selectedTypes, setSelectedTypes, t)} />
                  </span>
                ))}
                {selectedBhk.map((b) => (
                  <span key={b} className="flex items-center gap-1 bg-[#f0ebff] text-[#7B2FFF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {b} <FiX size={10} className="cursor-pointer" onClick={() => toggle(selectedBhk, setSelectedBhk, b)} />
                  </span>
                ))}
                {selectedBudget && (
                  <span className="flex items-center gap-1 bg-[#f0ebff] text-[#7B2FFF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {selectedBudget.label} <FiX size={10} className="cursor-pointer" onClick={() => setSelectedBudget(null)} />
                  </span>
                )}
                {selectedStatus.map((s) => (
                  <span key={s} className="flex items-center gap-1 bg-[#f0ebff] text-[#7B2FFF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {s} <FiX size={10} className="cursor-pointer" onClick={() => toggle(selectedStatus, setSelectedStatus, s)} />
                  </span>
                ))}
                {selectedAmenities.map((a) => (
                  <span key={a} className="flex items-center gap-1 bg-[#f0ebff] text-[#7B2FFF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {a} <FiX size={10} className="cursor-pointer" onClick={() => toggle(selectedAmenities, setSelectedAmenities, a)} />
                  </span>
                ))}
                <button onClick={clearAll} className="ml-auto text-xs text-red-500 font-semibold hover:underline">
                  Clear All
                </button>
              </div>
            )}

            {/* Property list */}
            {filtered.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} showPostedAt={isNewlyAdded} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <p className="text-gray-500 text-base mb-4">No properties found for your selection.</p>
                <button
                  onClick={clearAll}
                  className="bg-[#7B2FFF] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#6a1fe0] transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
