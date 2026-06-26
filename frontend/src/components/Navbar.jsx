import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX, FiUser } from "react-icons/fi";

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
          { title: "Developers/Builders", sub: "Launch or sell homes" },
          { title: "Brokers/Agents", sub: "List and grow business" },
          { title: "Owners", sub: "Sell or rent easily" },
        ],
      },
    ],
  },
  Calculators: {
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

function DropdownContent({ menuKey, sections, onItemClick }) {
  const isNarrow = ["For Sellers", "Calculators"].includes(menuKey);
  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.14)] z-[300] ${
        isNarrow ? "min-w-[220px]" : "min-w-[900px]"
      }`}
    >
      {/* caret */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="flex px-8 py-7 gap-0">
        {sections.map((section, si) => (
          <div
            key={section.heading}
            className={`flex-1 min-w-[180px] ${
              si < sections.length - 1 ? "pr-6 border-r border-gray-100" : ""
            } ${si > 0 ? "pl-6" : ""}`}
          >
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3.5">
              {section.heading}
            </p>
            {section.type === "links" && (
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {section.items.map((item) => (
                  <li key={item}>
                    <button
                      className="text-[14px] text-[#333] bg-transparent border-none cursor-pointer p-0 text-left hover:text-[#7B2FFF] transition-colors"
                      onClick={() => onItemClick(menuKey, item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {section.type === "cards" && (
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                {section.items.map((item) => (
                  <li key={item.title}>
                    <button
                      className="flex flex-col gap-0.5 bg-transparent border-none cursor-pointer p-0 text-left group"
                      onClick={() => onItemClick(menuKey, item.title)}
                    >
                      <span className="text-[14px] font-semibold text-[#222] group-hover:text-[#7B2FFF] transition-colors">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-400">{item.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItem({ label, menuData, onItemClick, onNavigate }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const hasDropdown = menuData !== null;

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hasDropdown) {
    return (
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md border-none text-sm font-medium cursor-pointer whitespace-nowrap bg-transparent text-[#333] hover:bg-[#f3eeff] hover:text-[#7B2FFF] transition-colors duration-150"
        onClick={() => onNavigate("/news")}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-visible"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-md border-none text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-150 ${
          open ? "bg-[#f3eeff] text-[#7B2FFF]" : "bg-transparent text-[#333] hover:bg-[#f3eeff] hover:text-[#7B2FFF]"
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <FiChevronDown
          size={13}
          className={`opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <DropdownContent
          menuKey={label}
          sections={menuData.sections}
          onItemClick={(menuKey, item) => {
            setOpen(false);
            onItemClick(menuKey, item);
          }}
        />
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState(null);
  const navigate = useNavigate();

  const handleItemClick = (menuLabel, item) => {
    setMobileOpen(false);
    setMobileActiveMenu(null);

    if (menuLabel === "For Buyers") {
      const section = menus[menuLabel].sections.find((s) => s.items.includes(item));
      if (!section) return;
      if (["Top Metropolitans in India", "Top Emerging Cities in India"].includes(section.heading)) {
        const city = item.replace("Properties for sale in ", "").trim();
        navigate(`/listings?listingType=BUY&city=${encodeURIComponent(city)}`);
      } else if (section.heading === "Top Projects in India") {
        const id = PROJECT_ID_MAP[item];
        if (id) navigate(`/property/${id}`);
      } else if (section.heading === "Top Developers in India") {
        const devId = DEVELOPER_ID_MAP[item];
        navigate(devId ? `/developer/${devId}` : `/listings?listingType=BUY`);
      }
    }

    if (menuLabel === "For Tenants") {
      const section = menus[menuLabel].sections.find((s) => s.items.includes(item));
      if (!section) return;
      if (["Top Metropolitans in India", "Top Emerging Cities in India"].includes(section.heading)) {
        const city = item.replace("Flats for Rent in ", "").trim();
        navigate(`/listings?listingType=RENT&city=${encodeURIComponent(city)}`);
      } else if (section.heading === "Top Projects in India") {
        const id = PROJECT_ID_MAP[item];
        if (id) navigate(`/property/${id}`);
      }
    }

    if (menuLabel === "Calculators") {
      if (item === "EMI Calculator") navigate("/emi-calculator");
      if (item === "Property Value Calculator") navigate("/property-value-calculator");
    }

    if (menuLabel === "For Sellers") {
      if (item === "Brokers/Agents") navigate("/broker");
      if (item === "Developers/Builders") navigate("/developer-plans");
      if (item === "Owners") navigate("/owners");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-[200] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center h-[62px] px-4 md:px-6 overflow-visible">
        {/* Logo */}
        <div
          className="flex items-center gap-1.5 cursor-pointer z-10 ml-2 md:flex-1 md:pl-28"
          onClick={() => navigate("/")}
        >
          <span className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">
            Real<span className="text-[#7B2FFF]">Square</span>
          </span>
        </div>

        {/* Desktop nav — each item manages its own dropdown */}
        <div className="hidden md:flex items-center justify-around absolute left-1/2 -translate-x-1/2 w-[650px] overflow-visible z-20">
          {Object.keys(menus).map((label) => (
            <NavItem
              key={label}
              label={label}
              menuData={menus[label]}
              onItemClick={handleItemClick}
              onNavigate={navigate}
            />
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center justify-end gap-9 z-10 flex-1">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <span className="text-base leading-none">🪙</span>
            <span className="text-sm font-bold text-amber-500">1,250</span>
          </div>
          <a href="#" className="text-[13px] font-medium text-[#444] no-underline whitespace-nowrap hover:text-[#7B2FFF] transition-colors">
            Download App
          </a>
          <button
            onClick={() => navigate("/list-property")}
            className="flex items-center gap-1.5 border-none bg-transparent text-sm font-bold text-[#1a1a2e] cursor-pointer whitespace-nowrap hover:text-[#7B2FFF] transition-colors"
          >
            List Property
            <span className="bg-[#7B2FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">FREE</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 bg-[#7B2FFF] border-none rounded-full px-4 py-1.5 cursor-pointer text-white text-sm font-semibold hover:bg-[#6320d4] transition"
          >
            <FiUser size={15} />
            Login
          </button>
        </div>

        {/* Mobile — Download App + hamburger */}
        <div className="md:hidden ml-auto flex items-center gap-7 mr-2">
          <a href="#" className="text-[13px] font-medium text-[#444] no-underline hover:text-[#7B2FFF] transition-colors whitespace-nowrap flex items-center gap-1">
            Download App
            <span className="bg-[#7B2FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">NEW</span>
          </a>
          <button
            className="bg-transparent border-none cursor-pointer text-[#333] p-1"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[199] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute top-0 right-0 h-full w-[75vw] max-w-[300px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-[62px] border-b border-gray-100">
              <span className="text-lg font-extrabold text-[#1a1a2e]">
                Real<span className="text-[#7B2FFF]">Square</span>
              </span>
              <button
                className="bg-transparent border-none cursor-pointer text-[#333] p-1"
                onClick={() => setMobileOpen(false)}
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col flex-1 overflow-y-auto px-5 py-4 gap-1">
              {Object.keys(menus).map((label) => {
                const hasMenu = menus[label] !== null;
                const isOpen = mobileActiveMenu === label;
                return (
                  <div key={label}>
                    <button
                      className="w-full text-left text-[15px] font-medium text-[#333] bg-transparent border-none cursor-pointer py-3 px-2 rounded-lg hover:bg-[#f3eeff] hover:text-[#7B2FFF] transition-colors flex items-center justify-between"
                      onClick={() => {
                        if (!hasMenu) { setMobileOpen(false); navigate("/news"); return; }
                        setMobileActiveMenu(isOpen ? null : label);
                      }}
                    >
                      <span>{label}</span>
                      {hasMenu && (
                        <FiChevronDown
                          size={15}
                          className={`opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {hasMenu && isOpen && (
                      <div className="ml-3 mb-2 flex flex-col">
                        {menus[label].sections.map((section) => (
                          <div key={section.heading} className="mb-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-2 mb-1.5">
                              {section.heading}
                            </p>
                            {section.items.map((item) => {
                              const itemLabel = typeof item === "string" ? item : item.title;
                              const itemSub = typeof item === "object" ? item.sub : null;
                              return (
                                <button
                                  key={itemLabel}
                                  className="w-full text-left text-[13px] text-[#444] bg-transparent border-none cursor-pointer py-2 px-2 rounded-lg hover:bg-[#f3eeff] hover:text-[#7B2FFF] transition-colors"
                                  onClick={() => handleItemClick(label, itemLabel)}
                                >
                                  {itemLabel}
                                  {itemSub && <span className="block text-[11px] text-gray-400">{itemSub}</span>}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="px-5 py-5 border-t border-gray-100">
              <button
                onClick={() => { setMobileOpen(false); navigate("/list-property"); }}
                className="w-full bg-[#7B2FFF] text-white border-none px-4 py-3 rounded-xl text-sm font-bold cursor-pointer"
              >
                List Property FREE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
