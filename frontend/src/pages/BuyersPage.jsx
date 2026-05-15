import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiMapPin, FiSliders, FiX, FiChevronDown } from "react-icons/fi";
import { properties } from "../data/properties";
import PropertyCard from "../components/PropertyCard";
import ListingHeader from "../components/ListingHeader";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const PROPERTY_TYPES = ["Apartment", "Villa", "House", "Plot", "Studio", "Commercial"];
const BHK_OPTIONS    = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const AREAS = ["Bandra West", "Andheri East", "Vikhroli East", "Parel", "Palghar", "Mira Road East", "Koramangala", "Whitefield", "Sarjapur Road", "Jubilee Hills", "Banjara Hills", "Sector 62", "Sector 150", "Dombivli East"];
const BUDGETS = [
  { label: "Under ₹50L",    min: 0,   max: 50 },
  { label: "₹50L - ₹1Cr",  min: 50,  max: 100 },
  { label: "₹1Cr - ₹2Cr",  min: 100, max: 200 },
  { label: "₹2Cr - ₹5Cr",  min: 200, max: 500 },
  { label: "Above ₹5Cr",   min: 500, max: Infinity },
];
const STATUSES = ["Ready to Move", "New Launch", "Under Construction", "Premium"];

const TYPE_MAP = {
  "Flats": "Apartment", "Houses": "House", "Builder floors": "Apartment",
  "Plots": "Plot", "Villas": "Villa", "Commercial properties": "Commercial",
};

function parsePriceToL(price) {
  if (!price) return 0;
  const str = price.replace(/[₹,]/g, "").trim();
  if (str.includes("Cr")) return parseFloat(str) * 100;
  if (str.includes("L"))  return parseFloat(str);
  return 0;
}

const selectCls = "appearance-none border-[1.5px] border-[#e0e0e0] rounded-lg py-2 pl-3 pr-8 text-[13px] text-[#333] bg-[#fafafa] cursor-pointer outline-none hover:border-[#7B2FFF] focus:border-[#7B2FFF] transition-colors w-full";
const chipCls   = (active) => `px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] cursor-pointer transition-all whitespace-nowrap ${active ? "bg-[#7B2FFF] border-[#7B2FFF] text-white" : "border-[#e0e0e0] bg-[#fafafa] text-[#444] hover:border-[#7B2FFF] hover:text-[#7B2FFF]"}`;

export default function BuyersPage() {
  const [searchParams] = useSearchParams();

  const initType = searchParams.get("type") || "";
  const initArea = searchParams.get("area") || "";
  const initBhk  = searchParams.get("bhk")  || "";
  const mappedType = TYPE_MAP[initType] || initType;

  const [selectedTypes,  setSelectedTypes]  = useState(mappedType ? [mappedType] : []);
  const [selectedBhk,    setSelectedBhk]    = useState(initBhk ? [initBhk] : []);
  const [selectedArea,   setSelectedArea]   = useState(initArea || "");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy,         setSortBy]         = useState("relevance");
  const [showFilters,    setShowFilters]     = useState(false);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const clearAll = () => {
    setSelectedTypes([]); setSelectedBhk([]); setSelectedArea("");
    setSelectedBudget(null); setSelectedStatus("");
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
          return p.beds === parseInt(b);
        });
      });
    }
    if (selectedArea)   list = list.filter((p) => p.location.toLowerCase().includes(selectedArea.toLowerCase()));
    if (selectedBudget) list = list.filter((p) => {
      const price = parsePriceToL(p.price.split("-")[0]);
      return price >= selectedBudget.min && price <= selectedBudget.max;
    });
    if (selectedStatus) list = list.filter((p) => p.tag === selectedStatus);
    if (sortBy === "price-asc")  list.sort((a, b) => parsePriceToL(a.price) - parsePriceToL(b.price));
    if (sortBy === "price-desc") list.sort((a, b) => parsePriceToL(b.price) - parsePriceToL(a.price));
    return list;
  }, [selectedTypes, selectedBhk, selectedArea, selectedBudget, selectedStatus, sortBy]);

  return (
    <>
      <PageSpinner />
      <ListingHeader />
      <div className="min-h-screen bg-[#f7f8fa]">

        {/* ── Filter bar ── */}
        <div className="bg-white border-b border-[#efefef] sticky top-[62px] z-[99] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">

            {/* Area */}
            <div className="relative flex items-center min-w-[120px] sm:min-w-[140px]">
              <FiMapPin size={13} className="absolute left-2.5 text-[#888] pointer-events-none z-10" />
              <select className={`${selectCls} pl-8`} value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                <option value="">All Areas</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <FiChevronDown size={12} className="absolute right-2.5 text-[#888] pointer-events-none" />
            </div>

            {/* Property Type */}
            <div className="relative flex items-center min-w-[120px] sm:min-w-[130px]">
              <select className={selectCls} value={selectedTypes[0] || ""} onChange={(e) => setSelectedTypes(e.target.value ? [e.target.value] : [])}>
                <option value="">Property Type</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <FiChevronDown size={12} className="absolute right-2.5 text-[#888] pointer-events-none" />
            </div>

            {/* BHK */}
            <div className="relative flex items-center min-w-[100px] sm:min-w-[120px]">
              <select className={selectCls} value={selectedBhk[0] || ""} onChange={(e) => setSelectedBhk(e.target.value ? [e.target.value] : [])}>
                <option value="">BHK Type</option>
                {BHK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <FiChevronDown size={12} className="absolute right-2.5 text-[#888] pointer-events-none" />
            </div>

            {/* Budget */}
            <div className="relative flex items-center min-w-[110px] sm:min-w-[130px]">
              <select className={selectCls} value={selectedBudget?.label || ""} onChange={(e) => setSelectedBudget(BUDGETS.find((b) => b.label === e.target.value) || null)}>
                <option value="">Budget</option>
                {BUDGETS.map((b) => <option key={b.label} value={b.label}>{b.label}</option>)}
              </select>
              <FiChevronDown size={12} className="absolute right-2.5 text-[#888] pointer-events-none" />
            </div>

            {/* Status */}
            <div className="relative flex items-center min-w-[100px] sm:min-w-[120px]">
              <select className={selectCls} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown size={12} className="absolute right-2.5 text-[#888] pointer-events-none" />
            </div>

            {/* More filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 border-[1.5px] rounded-lg text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap
                ${showFilters ? "border-[#7B2FFF] text-[#7B2FFF] bg-[#f5f0ff]" : "border-[#e0e0e0] text-[#444] bg-[#fafafa] hover:border-[#7B2FFF] hover:text-[#7B2FFF] hover:bg-[#f5f0ff]"}`}
            >
              <FiSliders size={13} /> Filters
              {activeFilterCount > 0 && (
                <span className="w-[18px] h-[18px] bg-[#7B2FFF] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 bg-transparent border-none text-red-500 text-[13px] font-semibold cursor-pointer whitespace-nowrap">
                <FiX size={13} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Expanded filter panel ── */}
        {showFilters && (
          <div className="bg-white border-b border-[#efefef]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap gap-6 sm:gap-10">
              {[
                { label: "Property Type", items: PROPERTY_TYPES, isActive: (t) => selectedTypes.includes(t), onToggle: (t) => toggle(selectedTypes, setSelectedTypes, t) },
                { label: "BHK",           items: BHK_OPTIONS,    isActive: (b) => selectedBhk.includes(b),   onToggle: (b) => toggle(selectedBhk, setSelectedBhk, b) },
                { label: "Status",        items: STATUSES,        isActive: (s) => selectedStatus === s,       onToggle: (s) => setSelectedStatus(selectedStatus === s ? "" : s) },
              ].map(({ label, items, isActive, onToggle }) => (
                <div key={label} className="flex flex-col gap-2.5">
                  <p className="text-[12px] font-bold text-[#888] uppercase tracking-[0.5px] m-0">{label}</p>
                  <div className="flex gap-2 flex-wrap">
                    {items.map((item) => (
                      <button key={item} onClick={() => onToggle(item)} className={chipCls(isActive(item))}>{item}</button>
                    ))}
                  </div>
                </div>
              ))}
              {/* Budget chips */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[12px] font-bold text-[#888] uppercase tracking-[0.5px] m-0">Budget</p>
                <div className="flex gap-2 flex-wrap">
                  {BUDGETS.map((b) => (
                    <button key={b.label} onClick={() => setSelectedBudget(selectedBudget?.label === b.label ? null : b)} className={chipCls(selectedBudget?.label === b.label)}>{b.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Active filter tags ── */}
        {activeFilterCount > 0 && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex gap-2 flex-wrap">
            {selectedTypes.map((t) => <span key={t} className="flex items-center gap-1.5 bg-[#f0ebff] text-[#7B2FFF] text-[12px] font-semibold px-3 py-1 rounded-full">{t} <FiX size={11} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => toggle(selectedTypes, setSelectedTypes, t)} /></span>)}
            {selectedBhk.map((b)   => <span key={b} className="flex items-center gap-1.5 bg-[#f0ebff] text-[#7B2FFF] text-[12px] font-semibold px-3 py-1 rounded-full">{b} <FiX size={11} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => toggle(selectedBhk, setSelectedBhk, b)} /></span>)}
            {selectedArea   && <span className="flex items-center gap-1.5 bg-[#f0ebff] text-[#7B2FFF] text-[12px] font-semibold px-3 py-1 rounded-full">{selectedArea} <FiX size={11} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => setSelectedArea("")} /></span>}
            {selectedBudget && <span className="flex items-center gap-1.5 bg-[#f0ebff] text-[#7B2FFF] text-[12px] font-semibold px-3 py-1 rounded-full">{selectedBudget.label} <FiX size={11} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => setSelectedBudget(null)} /></span>}
            {selectedStatus && <span className="flex items-center gap-1.5 bg-[#f0ebff] text-[#7B2FFF] text-[12px] font-semibold px-3 py-1 rounded-full">{selectedStatus} <FiX size={11} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => setSelectedStatus("")} /></span>}
          </div>
        )}

        {/* ── Results header ── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#ebebeb]">
          <div>
            <h1 className="text-xl sm:text-[22px] font-extrabold text-[#111] mb-1">
              {selectedArea ? `Properties in ${selectedArea}` : "Properties for Sale"}
            </h1>
            <p className="text-[13px] text-[#888]">{filtered.length} properties found</p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border-[1.5px] border-[#e0e0e0] rounded-lg px-3 py-1.5 text-[13px] text-[#333] bg-white outline-none cursor-pointer focus:border-[#7B2FFF]">
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-7 pb-16">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-[#888]">
              <p className="text-base mb-4">No properties match your filters.</p>
              <button onClick={clearAll} className="bg-[#7B2FFF] text-white border-none px-6 py-2.5 rounded-lg text-[14px] font-semibold cursor-pointer">
                Clear filters
              </button>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}
