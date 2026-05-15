import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronDown, FiArrowLeft, FiPhone } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { topPickGroups } from "../data/properties";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactFlow from "../components/ContactFlow";
import PageSpinner from "../components/PageSpinner";

function parsePriceToL(price) {
  if (!price) return 0;
  const str = price.replace(/[₹,]/g, "").trim();
  if (str.includes("Cr")) return parseFloat(str) * 100;
  if (str.includes("L")) return parseFloat(str);
  return 0;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function DeveloperProjects() {
  const { developerId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [developerId]);

  const group = topPickGroups.find((g) => g.id === developerId);

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Developer not found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#7B2FFF] text-white px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Go Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  let projects = [...group.projects];
  if (sortBy === "price-asc") projects.sort((a, b) => parsePriceToL(a.price) - parsePriceToL(b.price));
  if (sortBy === "price-desc") projects.sort((a, b) => parsePriceToL(b.price) - parsePriceToL(a.price));

  return (
    <>
      <PageSpinner key={developerId} />
      <Navbar />

      <div className="bg-[#f7f8fa] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#7B2FFF] font-medium hover:underline">
              <FiArrowLeft size={13} /> Back
            </button>
            <span>/</span>
            <span className="text-gray-600">{group.developer}</span>
          </div>

          <div className="flex gap-6 items-start max-lg:flex-col">

            {/* ── MAIN ── */}
            <div className="flex-1 min-w-0">

              {/* Results header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400">Showing {projects.length} projects</p>
                  <h1 className="text-xl font-bold text-[#1a1a2e]">Residential Projects by {group.developer}</h1>
                </div>
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:border-[#7B2FFF] transition"
                  >
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    <FiChevronDown size={13} className={showSort ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                  {showSort && (
                    <ul className="absolute right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-xl shadow-lg min-w-[180px] z-50 overflow-hidden">
                      {SORT_OPTIONS.map((o) => (
                        <li
                          key={o.value}
                          onClick={() => { setSortBy(o.value); setShowSort(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f3eeff] hover:text-[#7B2FFF] ${sortBy === o.value ? "bg-[#f3eeff] text-[#7B2FFF] font-semibold" : "text-gray-700"}`}
                        >
                          {o.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Developer info card */}
              <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <img src={group.logo} alt={group.developer} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                <div>
                  <h2 className="text-base font-bold text-[#1a1a2e]">{group.developer}</h2>
                  <div className="flex gap-5 text-xs text-gray-500 mt-1">
                    <span>Est. {group.estd}</span>
                    <span>{projects.length} Projects</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-6 px-1">{group.description}</p>

              {/* Project cards */}
              <div className="flex flex-col gap-4">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => p.propertyId ? navigate(`/property/${p.propertyId}`) : navigate(`/developer/${group.id}#${p.id}`)}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden flex hover:shadow-md transition-shadow cursor-pointer max-sm:flex-col"
                  >
                    {/* Image */}
                    <div className="relative w-[260px] flex-shrink-0 max-sm:w-full max-sm:h-[200px]">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover min-h-[190px]" />
                      {/* Developer badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/90 rounded-lg px-2 py-1">
                        <img src={group.logo} alt={group.developer} className="w-4 h-4 rounded object-cover" />
                        <span className="text-[10px] font-semibold text-gray-700">{group.developer}</span>
                      </div>
                      {p.brokerage && (
                        <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {p.brokerage}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#1a1a2e]">{p.name}</h3>
                        {p.tag && (
                          <span className="flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                            <MdVerified size={13} /> {p.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{p.type} in {p.location.split(",")[0]}</p>
                      <div className="text-xl font-extrabold text-[#1a1a2e] mt-1">{p.price}</div>
                      <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                        {p.avgPrice && <span>Avg. {p.avgPrice}</span>}
                        {p.possession && <span>Possession: {p.possession}</span>}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {p.propertyId ? "Click to view full details" : "View all projects by this developer"}
                        </span>
                        <button
                          className="flex items-center gap-1.5 bg-[#7B2FFF] hover:bg-[#6320d4] text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                          onClick={(e) => { e.stopPropagation(); setShowContact(true); }}
                        >
                          <FiPhone size={12} /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="w-[280px] flex-shrink-0 sticky top-[70px] max-lg:w-full max-lg:static">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs text-gray-400 mb-3">Contact Developer</p>
                <div className="flex items-center gap-3 mb-5">
                  <img src={group.logo} alt={group.developer} className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
                  <div>
                    <p className="text-sm font-bold text-[#1a1a2e]">{group.developer}</p>
                    <p className="text-xs text-gray-400">Developer · Est. {group.estd}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  <FiPhone size={14} /> Get Contact Details
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </>
  );
}
