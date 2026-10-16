import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { properties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import PropertyCardGrid from "./PropertyCardGrid";
import { primaryColor } from "../utils/theme";


// Match dynamic label → static mock data bucket
function resolveSource(label) {
  const u = (label ?? "").toUpperCase();
  if (u === "BUY")              return properties;
  if (u.startsWith("RENT"))     return rentProperties;
  if (u.includes("PG"))         return pgProperties;
  if (u.includes("COMMERCIAL")) return commercialProperties;
  if (u.includes("PLOT"))       return plotProperties;
  return properties;
}

function resolveFilters(label) {
  const u = (label ?? "").toUpperCase();
  if (u === "BUY" || u.startsWith("RENT")) return ["All", "Apartment", "Villa", "House", "Studio"];
  if (u.includes("PG"))                    return ["All", "Apartment", "Studio"];
  if (u.includes("COMMERCIAL"))            return ["All", "Commercial"];
  if (u.includes("PLOT"))                  return ["All", "Plot"];
  return ["All"];
}

function resolveHeading(label) {
  const u = (label ?? "").toUpperCase();
  if (u === "BUY")              return "Properties for Sale";
  if (u.startsWith("RENT"))     return "Properties for Rent";
  if (u.includes("PG"))         return "PG / Co-Living Rooms";
  if (u.includes("COMMERCIAL")) return "Commercial Spaces";
  if (u.includes("PLOT"))       return "Plots & Land";
  return "Featured Properties";
}

export default function PropertyListings({ activeTab, searchQuery, listingsRef }) {
  const [active, setActive] = useState("All");
  const navigate = useNavigate();

  const tabFilters = resolveFilters(activeTab);

  const prevTab = useRef(activeTab);
  if (prevTab.current !== activeTab) {
    prevTab.current = activeTab;
    setActive("All");
  }

  const source = resolveSource(activeTab);

  const byType = active === "All" ? source : source.filter((p) => p.type === active);

  const filtered = searchQuery
    ? byType.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        const locationLower = p.location.toLowerCase();
        const searchParts = searchLower.split(",").map((s) => s.trim());
        return searchParts.some((part) => locationLower.includes(part)) || locationLower.includes(searchLower);
      })
    : byType;

  const heading = resolveHeading(activeTab);

  // derive listingType param for navigation — use the raw activeTab label
  const listingTypeParam = activeTab ?? "BUY";

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
              params.set("listingType", listingTypeParam);
              if (searchQuery) params.set("city", searchQuery.split(",")[0].trim());
              navigate(`/listings?${params.toString()}`);
            }}
            className="text-sm font-semibold hover:underline whitespace-nowrap"
            style={{ color: primaryColor }}
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
              className="px-4 py-1.5 rounded-full border text-sm font-medium transition"
              style={active === f
                ? { backgroundColor: primaryColor, borderColor: primaryColor, color: "white" }
                : { borderColor: "#d1d5db", color: "#6b7280", backgroundColor: "white" }
              }
              onMouseEnter={e => { if (active !== f) { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.color = primaryColor; }}}
              onMouseLeave={e => { if (active !== f) { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#6b7280"; }}}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {filtered.length > 0 ? (
            filtered.map((p) => <PropertyCardGrid key={p.id} property={p} />)
          ) : (
            <p className="col-span-2 md:col-span-3 text-gray-400 text-sm py-8">
              No properties found{searchQuery ? ` for "${searchQuery}"` : ""}. Try a different filter.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
