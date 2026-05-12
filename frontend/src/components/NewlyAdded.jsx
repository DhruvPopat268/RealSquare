import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiClock } from "react-icons/fi";
import { newlyAddedProperties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import ContactFlow from "./ContactFlow";

const INTENT_MAP = {
  BUY: newlyAddedProperties,
  RENT: rentProperties,
  COMMERCIAL: commercialProperties,
  "PG/CO-LIVING": pgProperties,
  PLOTS: plotProperties,
};

const INTENT_LABEL = {
  BUY: "BUY",
  RENT: "RENT",
  COMMERCIAL: "COMMERCIAL",
  "PG/CO-LIVING": "PG/CO-LIVING",
  PLOTS: "PLOTS",
};

function timeAgo(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function NewlyAdded({ searchQuery, activeTab }) {
  const [showContact, setShowContact] = useState(false);
  const navigate = useNavigate();

  const source = INTENT_MAP[activeTab] ?? newlyAddedProperties;

  const normalised = source.map((p) => ({
    ...p,
    displayName: p.title || p.name,
  }));

  const filtered = searchQuery
    ? normalised.filter((p) => {
        const q = searchQuery.toLowerCase();
        const loc = p.location.toLowerCase();
        return searchQuery.split(",").map((s) => s.trim().toLowerCase()).some((part) => loc.includes(part)) || loc.includes(q);
      })
    : normalised;

  const displayed = filtered.slice(0, 8);

  const handleSeeAll = () => {
    const params = new URLSearchParams();
    params.set("listingType", INTENT_LABEL[activeTab] || "BUY");
    params.set("source", "newly-added");
    if (searchQuery) params.set("city", searchQuery.split(",")[0].trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <section className="bg-white py-14 px-5">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Newly-added properties</h2>
            <p className="text-sm text-gray-400 mt-1">Fresh listings to check out</p>
          </div>
          <button
            onClick={handleSeeAll}
            className="text-sm font-semibold text-[#7B2FFF] hover:underline whitespace-nowrap"
          >
            See all →
          </button>
        </div>

        {/* Grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayed.map((p) => {
              const ago = timeAgo(p.postedAt);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="h-[150px] overflow-hidden flex-shrink-0 relative">
                    <img src={p.image} alt={p.displayName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    {ago && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                        <FiClock size={9} /> {ago}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{p.displayName}</h3>
                    <span className="text-[11px] text-[#7B2FFF] font-medium">{p.type}</span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <FiMapPin size={10} />
                      <span className="truncate">{p.location}</span>
                    </div>
                    <div className="text-sm font-extrabold text-gray-900 mt-1">{p.price}</div>
                    <button
                      className="mt-2 w-full py-1.5 border border-[#7B2FFF] text-[#7B2FFF] rounded-lg text-[11px] font-semibold hover:bg-[#7B2FFF] hover:text-white transition"
                      onClick={(e) => { e.stopPropagation(); setShowContact(true); }}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-8">
            No newly added properties found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>
        )}
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
