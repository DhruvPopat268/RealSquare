import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { properties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import PropertyCardGrid from "./PropertyCardGrid";

const INTENT_MAP = {
  BUY: properties,
  RENT: rentProperties,
  COMMERCIAL: commercialProperties,
  "PG/CO-LIVING": pgProperties,
  PLOTS: plotProperties,
};

const TAB_FILTERS = {
  BUY: ["All", "Apartment", "Villa", "House", "Studio"],
  RENT: ["All", "Apartment", "Villa", "House", "Studio"],
  "PG/CO-LIVING": ["All", "Apartment", "Studio"],
  COMMERCIAL: ["All", "Commercial"],
  PLOTS: ["All", "Plot"],
};

const TAB_HEADING = {
  BUY: "Properties for Sale",
  RENT: "Properties for Rent",
  "PG/CO-LIVING": "PG / Co-Living Rooms",
  COMMERCIAL: "Commercial Spaces",
  PLOTS: "Plots & Land",
};

export default function PropertyListings({ activeTab, searchQuery, listingsRef }) {
  const [active, setActive] = useState("All");
  const navigate = useNavigate();

  const tabFilters = TAB_FILTERS[activeTab] ?? ["All"];

  const prevTab = useRef(activeTab);
  if (prevTab.current !== activeTab) {
    prevTab.current = activeTab;
    setActive("All");
  }

  const source = INTENT_MAP[activeTab] ?? properties;

  const byType = active === "All" ? source : source.filter((p) => p.type === active);

  const filtered = searchQuery
    ? byType.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        const locationLower = p.location.toLowerCase();
        const searchParts = searchLower.split(",").map((s) => s.trim());
        return searchParts.some((part) => locationLower.includes(part)) || locationLower.includes(searchLower);
      })
    : byType;

  const heading = TAB_HEADING[activeTab] ?? "Featured Properties";

  return (
    <section className="bg-[#f7f8fa] py-14 px-5" ref={listingsRef}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">{heading}</h2>
            <p className="text-sm text-gray-400 mt-1">Handpicked properties for you</p>
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("listingType", activeTab);
              if (searchQuery) params.set("city", searchQuery.split(",")[0].trim());
              navigate(`/listings?${params.toString()}`);
            }}
            className="text-sm font-semibold text-[#7B2FFF] hover:underline whitespace-nowrap"
          >
            View All →
          </button>
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 flex-wrap mb-7">
          {tabFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${
                active === f
                  ? "bg-[#7B2FFF] border-[#7B2FFF] text-white"
                  : "border-gray-300 text-gray-500 bg-white hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {filtered.length > 0 ? (
            filtered.map((p) => <PropertyCardGrid key={p.id} property={p} />)
          ) : (
            <p className="col-span-3 text-gray-400 text-sm py-8">
              No properties found{searchQuery ? ` for "${searchQuery}"` : ""}. Try a different filter.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
