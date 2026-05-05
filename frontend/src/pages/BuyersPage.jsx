import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiMapPin, FiSliders, FiX, FiChevronDown } from "react-icons/fi";
import { properties } from "../data/properties";
import PropertyCard from "../components/PropertyCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./BuyersPage.css";

const PROPERTY_TYPES = ["Apartment", "Villa", "House", "Plot", "Studio", "Commercial"];
const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const AREAS = ["Bandra West", "Andheri East", "Vikhroli East", "Parel", "Palghar", "Mira Road East", "Koramangala", "Whitefield", "Sarjapur Road", "Jubilee Hills", "Banjara Hills", "Sector 62", "Sector 150", "Dombivli East"];
const BUDGETS = [
  { label: "Under ₹50L", min: 0, max: 50 },
  { label: "₹50L - ₹1Cr", min: 50, max: 100 },
  { label: "₹1Cr - ₹2Cr", min: 100, max: 200 },
  { label: "₹2Cr - ₹5Cr", min: 200, max: 500 },
  { label: "Above ₹5Cr", min: 500, max: Infinity },
];
const STATUSES = ["Ready to Move", "New Launch", "Under Construction", "Premium"];

function parsePriceToL(price) {
  if (!price) return 0;
  const str = price.replace(/[₹,]/g, "").trim();
  if (str.includes("Cr")) return parseFloat(str) * 100;
  if (str.includes("L")) return parseFloat(str);
  return 0;
}

const TYPE_MAP = {
  "Flats": "Apartment",
  "Houses": "House",
  "Builder floors": "Apartment",
  "Plots": "Plot",
  "Villas": "Villa",
  "Commercial properties": "Commercial",
};

export default function BuyersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initType = searchParams.get("type") || "";
  const initArea = searchParams.get("area") || "";
  const initBhk  = searchParams.get("bhk")  || "";

  // Map navbar label to data type
  const mappedType = TYPE_MAP[initType] || initType;

  const [selectedTypes, setSelectedTypes] = useState(mappedType ? [mappedType] : []);
  const [selectedBhk, setSelectedBhk]     = useState(initBhk  ? [initBhk]  : []);
  const [selectedArea, setSelectedArea]   = useState(initArea || "");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy]               = useState("relevance");
  const [showFilters, setShowFilters]     = useState(false);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedBhk([]);
    setSelectedArea("");
    setSelectedBudget(null);
    setSelectedStatus("");
  };

  const activeFilterCount = selectedTypes.length + selectedBhk.length +
    (selectedArea ? 1 : 0) + (selectedBudget ? 1 : 0) + (selectedStatus ? 1 : 0);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (selectedTypes.length) list = list.filter((p) => selectedTypes.includes(p.type));
    if (selectedBhk.length) {
      list = list.filter((p) => {
        if (!p.beds) return false;
        return selectedBhk.some((b) => {
          if (b === "1 RK") return p.beds === 0;
          if (b === "4+ BHK") return p.beds >= 4;
          const num = parseInt(b);
          return p.beds === num;
        });
      });
    }
    if (selectedArea) list = list.filter((p) => p.location.toLowerCase().includes(selectedArea.toLowerCase()));
    if (selectedBudget) {
      list = list.filter((p) => {
        const price = parsePriceToL(p.price.split("-")[0]);
        return price >= selectedBudget.min && price <= selectedBudget.max;
      });
    }
    if (selectedStatus) list = list.filter((p) => p.tag === selectedStatus);

    if (sortBy === "price-asc") list.sort((a, b) => parsePriceToL(a.price) - parsePriceToL(b.price));
    if (sortBy === "price-desc") list.sort((a, b) => parsePriceToL(b.price) - parsePriceToL(a.price));

    return list;
  }, [selectedTypes, selectedBhk, selectedArea, selectedBudget, selectedStatus, sortBy]);

  return (
    <>
      <Navbar />
      <div className="bp-page">

        {/* Top filter bar */}
        <div className="bp-filterbar">
          <div className="bp-filterbar-inner">

            {/* Area search */}
            <div className="bp-filter-select-wrap">
              <FiMapPin size={14} className="bp-filter-icon" />
              <select
                className="bp-filter-select"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">All Areas</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <FiChevronDown size={13} className="bp-select-arrow" />
            </div>

            {/* Property Type */}
            <div className="bp-filter-select-wrap">
              <select
                className="bp-filter-select"
                value={selectedTypes[0] || ""}
                onChange={(e) => setSelectedTypes(e.target.value ? [e.target.value] : [])}
              >
                <option value="">Property Type</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <FiChevronDown size={13} className="bp-select-arrow" />
            </div>

            {/* BHK */}
            <div className="bp-filter-select-wrap">
              <select
                className="bp-filter-select"
                value={selectedBhk[0] || ""}
                onChange={(e) => setSelectedBhk(e.target.value ? [e.target.value] : [])}
              >
                <option value="">BHK Type</option>
                {BHK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <FiChevronDown size={13} className="bp-select-arrow" />
            </div>

            {/* Budget */}
            <div className="bp-filter-select-wrap">
              <select
                className="bp-filter-select"
                value={selectedBudget?.label || ""}
                onChange={(e) => setSelectedBudget(BUDGETS.find((b) => b.label === e.target.value) || null)}
              >
                <option value="">Budget</option>
                {BUDGETS.map((b) => <option key={b.label} value={b.label}>{b.label}</option>)}
              </select>
              <FiChevronDown size={13} className="bp-select-arrow" />
            </div>

            {/* Status */}
            <div className="bp-filter-select-wrap">
              <select
                className="bp-filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown size={13} className="bp-select-arrow" />
            </div>

            {/* More filters toggle */}
            <button className={`bp-more-filters ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
              <FiSliders size={14} /> Filters {activeFilterCount > 0 && <span className="bp-filter-count">{activeFilterCount}</span>}
            </button>

            {activeFilterCount > 0 && (
              <button className="bp-clear-btn" onClick={clearAll}><FiX size={13} /> Clear all</button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="bp-filter-panel">
            <div className="bp-filter-panel-inner">
              <div className="bp-filter-group">
                <p className="bp-filter-group-label">Property Type</p>
                <div className="bp-chips">
                  {PROPERTY_TYPES.map((t) => (
                    <button key={t} className={`bp-chip ${selectedTypes.includes(t) ? "active" : ""}`} onClick={() => toggle(selectedTypes, setSelectedTypes, t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="bp-filter-group">
                <p className="bp-filter-group-label">BHK</p>
                <div className="bp-chips">
                  {BHK_OPTIONS.map((b) => (
                    <button key={b} className={`bp-chip ${selectedBhk.includes(b) ? "active" : ""}`} onClick={() => toggle(selectedBhk, setSelectedBhk, b)}>{b}</button>
                  ))}
                </div>
              </div>
              <div className="bp-filter-group">
                <p className="bp-filter-group-label">Budget</p>
                <div className="bp-chips">
                  {BUDGETS.map((b) => (
                    <button key={b.label} className={`bp-chip ${selectedBudget?.label === b.label ? "active" : ""}`} onClick={() => setSelectedBudget(selectedBudget?.label === b.label ? null : b)}>{b.label}</button>
                  ))}
                </div>
              </div>
              <div className="bp-filter-group">
                <p className="bp-filter-group-label">Status</p>
                <div className="bp-chips">
                  {STATUSES.map((s) => (
                    <button key={s} className={`bp-chip ${selectedStatus === s ? "active" : ""}`} onClick={() => setSelectedStatus(selectedStatus === s ? "" : s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="bp-active-tags">
            {selectedTypes.map((t) => <span key={t} className="bp-tag">{t} <FiX size={11} onClick={() => toggle(selectedTypes, setSelectedTypes, t)} /></span>)}
            {selectedBhk.map((b) => <span key={b} className="bp-tag">{b} <FiX size={11} onClick={() => toggle(selectedBhk, setSelectedBhk, b)} /></span>)}
            {selectedArea && <span className="bp-tag">{selectedArea} <FiX size={11} onClick={() => setSelectedArea("")} /></span>}
            {selectedBudget && <span className="bp-tag">{selectedBudget.label} <FiX size={11} onClick={() => setSelectedBudget(null)} /></span>}
            {selectedStatus && <span className="bp-tag">{selectedStatus} <FiX size={11} onClick={() => setSelectedStatus("")} /></span>}
          </div>
        )}

        {/* Results header */}
        <div className="bp-results-header">
          <div className="bp-results-inner">
            <div>
              <h1 className="bp-results-title">
                {selectedArea ? `Properties in ${selectedArea}` : "Properties for Sale"}
              </h1>
              <p className="bp-results-count">{filtered.length} properties found</p>
            </div>
            <div className="bp-sort-wrap">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bp-sort-select">
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="bp-grid-wrap">
          <div className="bp-grid">
            {filtered.length > 0 ? (
              filtered.map((p) => <PropertyCard key={p.id} property={p} />)
            ) : (
              <div className="bp-empty">
                <p>No properties match your filters.</p>
                <button onClick={clearAll}>Clear filters</button>
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
