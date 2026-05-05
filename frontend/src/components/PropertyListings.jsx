import { useState, useRef } from "react";
import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";
import "./PropertyListings.css";

const filters = ["All", "Apartment", "Villa", "House", "Plot", "Studio"];

const TAB_FILTERS = {
  BUY: ["All", "Apartment", "Villa", "House", "Studio"],
  RENT: ["All", "Apartment", "Villa", "House", "Studio"],
  "PG/CO-LIVING": ["All", "Apartment", "Villa", "House", "Studio"],
  COMMERCIAL: ["Studio"],
  PLOTS: ["Plot"],
};
const TAB_HEADING = {
  BUY: "Featured Properties for Buy",
  RENT: "Featured Properties for Rent",
  "PG/CO-LIVING": "Featured Properties for PG / Co-Living",
  COMMERCIAL: "Featured Properties for Commercial",
  PLOTS: "Featured Properties for Plots",
};

export default function PropertyListings({ activeTab, searchQuery, listingsRef }) {
  const [active, setActive] = useState("All");

  const tabFilters = TAB_FILTERS[activeTab] ?? filters;

  // reset chip selection when tab changes
  const prevTab = useRef(activeTab);
  if (prevTab.current !== activeTab) {
    prevTab.current = activeTab;
    setActive(tabFilters[0]);
  }

  const byType = active === "All" ? properties : properties.filter((p) => p.type === active);
  const filtered = searchQuery
    ? byType.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        const locationLower = p.location.toLowerCase();
        // Split search query by comma and check if any part matches
        const searchParts = searchLower.split(',').map(s => s.trim());
        return searchParts.some(part => locationLower.includes(part)) || locationLower.includes(searchLower);
      })
    : byType;
  const heading = TAB_HEADING[activeTab] ?? "Featured Properties";

  return (
    <section className="listings-section" ref={listingsRef}>
      <div className="listings-inner">
        <div className="listings-header">
          <div>
            <h2>{heading}</h2>
            <p>Handpicked properties for you</p>
          </div>
          <a href="#" className="view-all">View All →</a>
        </div>

        <div className="filter-chips">
          {tabFilters.map((f) => (
            <button
              key={f}
              className={`chip ${active === f ? "chip-active" : ""}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="listings-grid">
          {filtered.length > 0 ? (
            filtered.map((p) => <PropertyCard key={p.id} property={p} />)
          ) : (
            <p className="listings-empty">No properties found for <strong>"{searchQuery}"</strong>. Try a different location.</p>
          )}
        </div>
      </div>
    </section>
  );
}
