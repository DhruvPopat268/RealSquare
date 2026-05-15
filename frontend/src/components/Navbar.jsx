import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

const PROJECT_ID_MAP = {
  "Anuar Towers": 1,
  "Prestige Koramangala Heights": 2,
  "Lodha Palava City": 3,
  "Aparna Sarovar Zenith": 4,
  "Raj Legacy Satyam": 1,
  "Lodha Belmondo": 3,
  "Prestige Whitefield": 2,
  "Skyline Residency": 101,
  "Palm Grove Villas": 102,
  "Urban Studio Hub": 103,
  "Gotri Green Residency": 104,
  "Urban CoLiving": 301,
  "Smart Stay PG": 302,
  "Metro Nest CoLiving": 303,
};

const DEVELOPER_ID_MAP = {
  "Lodha Group": "lodha-group",
  "Prestige Group": "prestige-group",
  "Raj Realty Group": "raj-realty",
  "Aparna Constructions": null,
  "Anuhar Homes": null,
  "Sobha Limited": null,
  "Godrej Properties": null,
};

const menus = {
  "For Buyers": {
    sections: [
      {
        heading: "Top Metropolitans in India",
        type: "links",
        items: [
          "Properties for sale in Mumbai",
          "Properties for sale in Bengaluru",
          "Properties for sale in New Delhi",
          "Properties for sale in Hyderabad",
          "Properties for sale in Chennai",
          "Properties for sale in Kolkata",
          "Properties for sale in Gurgaon",
        ],
      },
      {
        heading: "Top Emerging Cities in India",
        type: "links",
        items: [
          "Properties for sale in Pune",
          "Properties for sale in Thane",
          "Properties for sale in Ahmedabad",
          "Properties for sale in Navi Mumbai",
          "Properties for sale in Noida",
          "Properties for sale in Jaipur",
        ],
      },
      {
        heading: "Top Projects in India",
        type: "links",
        items: [
          "Anuar Towers",
          "Prestige Koramangala Heights",
          "Lodha Palava City",
          "Aparna Sarovar Zenith",
          "Raj Legacy Satyam",
          "Lodha Belmondo",
          "Prestige Whitefield",
        ],
      },
      {
        heading: "Top Developers in India",
        type: "links",
        items: [
          "Lodha Group",
          "Prestige Group",
          "Raj Realty Group",
          "Aparna Constructions",
          "Anuhar Homes",
          "Sobha Limited",
          "Godrej Properties",
        ],
      },
    ],
  },
  "For Tenants": {
    sections: [
      {
        heading: "Top Metropolitans in India",
        type: "links",
        items: [
          "Flats for Rent in Mumbai",
          "Flats for Rent in Bengaluru",
          "Flats for Rent in New Delhi",
          "Flats for Rent in Hyderabad",
          "Flats for Rent in Chennai",
          "Flats for Rent in Kolkata",
          "Flats for Rent in Gurgaon",
        ],
      },
      {
        heading: "Top Emerging Cities in India",
        type: "links",
        items: [
          "Flats for Rent in Pune",
          "Flats for Rent in Thane",
          "Flats for Rent in Ahmedabad",
          "Flats for Rent in Navi Mumbai",
          "Flats for Rent in Noida",
          "Flats for Rent in Jaipur",
        ],
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
  "Calculators": {
    sections: [
      {
        heading: "Tools",
        type: "links",
        items: ["EMI Calculator", "Property Value Calculator"],
      },
    ],
  },
  "News & Guide": null,
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
      if (section.heading === "Top Metropolitans in India" || section.heading === "Top Emerging Cities in India") {
        const city = item.replace("Properties for sale in ", "").trim();
        navigate(`/listings?listingType=BUY&city=${encodeURIComponent(city)}`);
      } else if (section.heading === "Top Projects in India") {
        const propertyId = PROJECT_ID_MAP[item];
        if (propertyId) navigate(`/property/${propertyId}`);
      } else if (section.heading === "Top Developers in India") {
        const devId = DEVELOPER_ID_MAP[item];
        if (devId) navigate(`/developer/${devId}`);
        else navigate(`/listings?listingType=BUY`);
      }
    }
    if (menuLabel === "For Tenants") {
      const section = menus[menuLabel].sections.find((s) => s.items.includes(item));
      if (!section) return;
      if (section.heading === "Top Metropolitans in India" || section.heading === "Top Emerging Cities in India") {
        const city = item.replace("Flats for Rent in ", "").trim();
        navigate(`/listings?listingType=RENT&city=${encodeURIComponent(city)}`);
      } else if (section.heading === "Top Projects in India") {
        const propertyId = PROJECT_ID_MAP[item];
        if (propertyId) navigate(`/property/${propertyId}`);
      }
    }
    if (menuLabel === "Calculators") {
      if (item === "EMI Calculator") navigate("/emi-calculator");
      if (item === "Property Value Calculator") navigate("/property-value-calculator");
    }
    if (menuLabel === "For Sellers") {
      if (item === "Brokers") navigate("/broker");
      if (item === "Developers") navigate("/developer-plans");
      if (item === "Owners") navigate("/owners");
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
      if (navRef.current && !navRef.current.contains(e.target)) setActiveMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-[200] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-[inherit] relative flex items-center h-[62px]"
    >
      <div className="w-full px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-1.5 cursor-pointer z-10 flex-1 pl-32"
          onClick={() => navigate("/")}
        >
          <span className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">
            Real<span className="text-[#7B2FFF]">Square</span>
          </span>
        </div>

        <div className="hidden md:flex items-center justify-around" style={{position:'absolute', left:'50%', transform:'translateX(-50%)', width:'650px'}}>
          {Object.keys(menus).map((label) => (
            <button
              key={label}
              className={`flex items-center gap-1 px-3 py-2 rounded-md border-none text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-150 ${
                activeMenu === label
                  ? "bg-[#f3eeff] text-[#7B2FFF]"
                  : "bg-transparent text-[#333] hover:bg-[#f3eeff] hover:text-[#7B2FFF]"
              }`}
              onClick={() => {
                if (label === "News & Guide") { navigate("/news"); return; }
                setActiveMenu(activeMenu === label ? null : label);
                if (label === "For Buyers") navigate("/buy");
              }}
              onMouseEnter={() => label !== "News & Guide" && openMenu(label)}
              onMouseLeave={() => label !== "News & Guide" && closeMenu()}
            >
              {label}
              {label !== "News & Guide" && (
                <FiChevronDown
                  size={13}
                  className={`opacity-60 transition-transform duration-200 ${activeMenu === label ? "rotate-180" : ""}`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center justify-end gap-9 z-10 flex-1">
          <a href="#" className="text-[13px] font-medium text-[#444] no-underline whitespace-nowrap hover:text-[#7B2FFF] transition-colors">
            Download App
          </a>
          <button className="flex items-center gap-1.5 border-none bg-transparent text-sm font-bold text-[#1a1a2e] cursor-pointer whitespace-nowrap hover:text-[#7B2FFF] transition-colors">
            Post Property
            <span className="bg-[#7B2FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
              FREE
            </span>
          </button>
          <button className="flex items-center gap-1.5 bg-[#7B2FFF] border-none rounded-full px-3 py-1.5 cursor-pointer text-white text-[15px]">
            <span>☰</span>
            <span>👤</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto bg-transparent border-none cursor-pointer text-[#333]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mega dropdown */}
      {activeMenu && menus[activeMenu] && (
        <div
          className={`absolute top-[62px] left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.14)] z-[300] w-max animate-fadeDown hidden md:block ${
            ["For Sellers", "Calculators", "News & Guide"].includes(activeMenu)
              ? "min-w-[220px] max-w-[280px]"
              : "min-w-[900px] max-w-[1080px]"
          }`}
          onMouseEnter={() => openMenu(activeMenu)}
          onMouseLeave={closeMenu}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />

          <div className="flex gap-0 px-8 py-7">
            {menus[activeMenu].sections.map((section, si) => (
              <div
                key={section.heading}
                className={`flex-1 min-w-[180px] ${
                  si < menus[activeMenu].sections.length - 1
                    ? "pr-6 border-r border-gray-100"
                    : "pr-0"
                } ${si > 0 ? "pl-6" : ""}`}
              >
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3.5">
                  {section.heading}
                </p>

                {/* Links */}
                {section.type === "links" && (
                  <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                    {section.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-[14px] text-[#333] no-underline hover:text-[#7B2FFF] transition-colors"
                          onClick={(e) => { e.preventDefault(); handleItemClick(activeMenu, item); }}
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Icons */}
                {section.type === "icons" && (
                  <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                    {section.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="flex items-center gap-2.5 text-[14px] font-medium text-[#333] no-underline hover:text-[#7B2FFF] transition-colors"
                          onClick={(e) => { e.preventDefault(); handleItemClick(activeMenu, item); }}
                        >
                          <span className="w-[30px] h-[30px] bg-[#f5f3ff] border border-[#ede9fe] rounded-md flex items-center justify-center text-sm flex-shrink-0">
                            ⊞
                          </span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Cards */}
                {section.type === "cards" && (
                  <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <a href="#" className="flex flex-col gap-0.5 no-underline group"
                          onClick={(e) => { e.preventDefault(); handleItemClick(activeMenu, item.title); }}>
                          <span className="text-[14px] font-semibold text-[#222] group-hover:text-[#7B2FFF] transition-colors">
                            {item.title}
                          </span>
                          <span className="text-xs text-gray-400">{item.sub}</span>
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
        <div className="flex flex-col px-5 py-3 gap-3 border-t border-gray-100 md:hidden">
          {Object.keys(menus).map((label) => (
            <a key={label} href="#" className="text-[15px] font-medium text-[#333] no-underline">
              {label}
            </a>
          ))}
          <button className="bg-[#7B2FFF] text-white border-none px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer mt-1">
            Post Property FREE
          </button>
        </div>
      )}
    </nav>
  );
}
