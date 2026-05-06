import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronDown, FiArrowLeft } from "react-icons/fi";
import { topPickGroups } from "../data/properties";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactFlow from "../components/ContactFlow";
import "./DeveloperProjects.css";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function parsePriceToL(price) {
  if (!price) return 0;
  const str = price.replace(/[₹,]/g, "").trim();
  if (str.includes("Cr")) return parseFloat(str) * 100;
  if (str.includes("L")) return parseFloat(str);
  return 0;
}

export default function DeveloperProjects() {
  const { developerId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const group = topPickGroups.find((g) => g.id === developerId);

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="dp-not-found">
          <p>Developer not found.</p>
          <button onClick={() => navigate("/")}>Go Home</button>
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
      <Navbar />
      <div className="dp-page">
        {/* Breadcrumb */}
        <div className="dp-breadcrumb">
          <button className="dp-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={14} /> Home
          </button>
          <span>/</span>
          <span>{group.developer}</span>
        </div>

        <div className="dp-layout">
          {/* Main content */}
          <div className="dp-main">
            <div className="dp-results-header">
              <div className="dp-results-header-left">
                <p className="dp-count">Showing 1 – {projects.length} of {projects.length}</p>
                <h1 className="dp-title">Residential Projects by {group.developer}</h1>
              </div>

              <div className="dp-sort-wrap">
                <span>Sort by:</span>
                <div className="dp-sort-dropdown">
                  <button className="dp-sort-btn" onClick={() => setShowSort(!showSort)}>
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    <FiChevronDown size={14} className={showSort ? "rotated" : ""} />
                  </button>
                  {showSort && (
                    <ul className="dp-sort-list">
                      {SORT_OPTIONS.map((o) => (
                        <li
                          key={o.value}
                          className={sortBy === o.value ? "active" : ""}
                          onClick={() => { setSortBy(o.value); setShowSort(false); }}
                        >
                          {o.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Developer info card */}
            <div className="dp-dev-card">
              <img src={group.logo} alt={group.developer} className="dp-dev-logo" />
              <div className="dp-dev-info">
                <h2>{group.developer}</h2>
                <div className="dp-dev-meta">
                  <span>Year estd. {group.estd}</span>
                  <span>Projects {projects.length}</span>
                </div>
              </div>
            </div>

            <p className="dp-dev-desc">{group.description}</p>

            {/* Project cards */}
            {projects.map((p) => (
              <div className="dp-project-card" key={p.id}>
                <div className="dp-project-img-wrap">
                  <div className="dp-dev-badge">
                    <img src={group.logo} alt={group.developer} />
                    <span>{group.developer}</span>
                  </div>
                  <img src={p.image} alt={p.name} className="dp-project-img" />
                </div>

                <div className="dp-project-body">
                  {p.brokerage && <span className="dp-brokerage">{p.brokerage}</span>}
                  <div className="dp-project-title-row">
                    <h3>{p.name}</h3>
                    {p.tag && <span className="dp-rera-tag">● {p.tag}</span>}
                  </div>
                  <p className="dp-project-type">{p.type} in {p.location.split(",")[0]}</p>
                  <p className="dp-project-bhk">{p.type.split(" ")[0]} {p.type.includes("BHK") ? "BHK" : ""} Flat</p>
                  <p className="dp-project-price">{p.price}</p>
                  <div className="dp-project-meta">
                    {p.avgPrice && <span>Avg. Price: {p.avgPrice}</span>}
                    {p.possession && <span>Possession: {p.possession}</span>}
                  </div>
                  <div className="dp-project-actions">
                    <button className="dp-contact-btn" onClick={() => setShowContact(true)}>Contact</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="dp-sidebar">
            <div className="dp-sidebar-card">
              <p className="dp-sidebar-label">Contact Seller</p>
              <div className="dp-sidebar-dev">
                <img src={group.logo} alt={group.developer} />
                <div>
                  <p>{group.developer}</p>
                  <p className="dp-sidebar-role">Developer</p>
                </div>
              </div>
              <button className="dp-sidebar-contact-btn" onClick={() => setShowContact(true)}>
                📞 Get Contact Details
              </button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </>
  );
}
