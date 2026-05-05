import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const menus = {
  "For Buyers": {
    sections: [
      {
        heading: "Property type",
        type: "icons",
        items: ["Flats", "Houses", "Builder floors", "Plots", "Villas", "Commercial properties"],
      },
      {
        heading: "Popular areas",
        type: "links",
        items: ["Andheri East", "Bandra West", "Koramangala", "Whitefield", "Jubilee Hills", "Sector 62"],
      },
      {
        heading: "Search by BHK",
        type: "links",
        items: ["1 BHK Properties", "2 BHK Properties", "3 BHK Properties", "4 BHK Properties", "1 BHK Houses", "2 BHK Houses"],
      },
      {
        heading: "Popular searches",
        type: "links",
        items: ["Flats without brokerage", "Under construction flats", "Affordable projects for sale", "Ready to move-in projects", "New residential projects", "Resale properties"],
      },
    ],
  },
  "For Tenants": {
    sections: [
      {
        heading: "Property type",
        type: "icons",
        items: ["Flats", "Houses", "Builder floors", "Villas", "Commercial properties"],
      },
      {
        heading: "Popular areas",
        type: "links",
        items: ["Andheri East", "Andheri West", "Thane West", "Kurla West", "Kurla East", "Santacruz East"],
      },
      {
        heading: "Search by BHK",
        type: "links",
        items: ["1 RK Flats", "1 BHK Flats", "2 BHK Flats", "3 BHK Flats", "1 BHK Houses", "2 BHK Houses"],
      },
      {
        heading: "Popular searches",
        type: "links",
        items: ["Flats for rent without brokerage", "Houses for rent without brokerage", "Fully furnished houses for rent", "Fully furnished flats for rent", "Semi furnished flats for rent", "Unfurnished flats for rent"],
      },
    ],
  },
  "For Sellers": {
    sections: [
      {
        heading: "Packages for",
        type: "cards",
        items: [
          { title: "Developers", sub: "Launch or sell homes" },
          { title: "Brokers", sub: "List and grow business" },
          { title: "Owners", sub: "Sell or rent easily" },
        ],
      },
    ],
  },
  "Services": {
    sections: [
      {
        heading: "Housing Edge",
        type: "links",
        items: ["Home Loan", "Housing Protect", "Housing Premium"],
      },
      {
        heading: "Tools",
        type: "links",
        items: ["EMI calculator", "Property value calculator", "Rent receipt generator"],
      },
    ],
  },
  "News & Guide": {
    sections: [
      {
        heading: "Property market guide",
        type: "cards",
        items: [
          { title: "Real Estate News", sub: "Latest market updates" },
          { title: "Buying Guide", sub: "Expert homebuying tips" },
          { title: "Housing Research", sub: "Data-driven insights" },
          { title: "Mumbai Overview", sub: "Real estate & area highlights" },
        ],
      },
    ],
  },
};

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  const handleItemClick = (menuLabel, item) => {
    setActiveMenu(null);
    if (menuLabel === "For Buyers") {
      const section = menus[menuLabel].sections.find((s) => s.items.includes(item));
      if (!section) return;
      if (section.heading === "Property type") navigate(`/buy?type=${encodeURIComponent(item)}`);
      else if (section.heading === "Popular areas") navigate(`/buy?area=${encodeURIComponent(item)}`);
      else if (section.heading === "Search by BHK") {
        const bhk = item.replace(" Properties", "").replace(" Houses", "");
        navigate(`/buy?bhk=${encodeURIComponent(bhk)}`);
      } else navigate("/buy");
    }
  };

  const openMenu = (label) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="logo-text">Real<span className="logo-accent">Square</span></span>
        </div>

        {/* Desktop nav links */}
        <div className="navbar-links desktop-only">
          {Object.keys(menus).map((label) => (
            <button
              key={label}
              className={`nav-item ${activeMenu === label ? "nav-item-active" : ""}`}
              onClick={() => {
                setActiveMenu(activeMenu === label ? null : label);
                if (label === "For Buyers") navigate("/buy");
              }}
              onMouseEnter={() => openMenu(label)}
              onMouseLeave={closeMenu}
            >
              {label} <FiChevronDown size={13} className={`chevron ${activeMenu === label ? "chevron-up" : ""}`} />
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="navbar-actions desktop-only">
          <a href="#" className="download-link">Download App</a>
          <button className="btn-post">Post Property <span className="free-tag">FREE</span></button>
          <button className="btn-avatar">
            <span className="avatar-lines">☰</span>
            <span className="avatar-icon">👤</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mega dropdown */}
      {activeMenu && (
        <div className="mega-dropdown" onMouseEnter={() => openMenu(activeMenu)} onMouseLeave={closeMenu}>
          <div className="mega-arrow" />
          <div className="mega-inner">
            {menus[activeMenu].sections.map((section) => (
              <div key={section.heading} className="mega-section">
                <p className="mega-heading">{section.heading}</p>

                {section.type === "icons" && (
                  <ul className="mega-icon-list">
                    {section.items.map((item) => (
                      <li key={item}>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick(activeMenu, item); }}>
                          <span className="prop-icon">⊞</span> {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {section.type === "links" && (
                  <ul className="mega-link-list">
                    {section.items.map((item) => (
                      <li key={item}><a href="#" onClick={(e) => { e.preventDefault(); handleItemClick(activeMenu, item); }}>{item}</a></li>
                    ))}
                  </ul>
                )}

                {section.type === "cards" && (
                  <ul className="mega-card-list">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <a href="#">
                          <span className="card-title">{item.title}</span>
                          <span className="card-sub">{item.sub}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {Object.keys(menus).map((label) => (
            <a key={label} href="#" className="mobile-link">{label}</a>
          ))}
          <button className="btn-post mobile-post">Post Property FREE</button>
        </div>
      )}
    </nav>
  );
}
