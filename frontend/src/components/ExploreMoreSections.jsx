import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import ImageSlider from "./ImageSlider";

// ── Data ──────────────────────────────────────────────────────────────────

const FEATURED_PROJECTS = [
  { id: 1, name: "Anuar Towers", developer: "Anuhar Homes Pvt Ltd", type: "2, 3 BHK Apartments", location: "Manikonda, Hyderabad", price: "₹1.04 Cr - 1.57 Cr", images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=340&fit=crop"], propertyId: 1 },
  { id: 2, name: "Prestige Koramangala Heights", developer: "Prestige Group", type: "2, 3 BHK Apartments", location: "Koramangala, Bangalore", price: "₹85 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=340&fit=crop"], propertyId: 2 },
  { id: 3, name: "Lodha Palava City", developer: "Lodha Group", type: "1, 2, 3 BHK Apartments", location: "Dombivli East, Thane", price: "₹42.5 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=340&fit=crop"], propertyId: 3 },
  { id: 4, name: "Aparna Sarovar Zenith", developer: "Aparna Constructions", type: "2, 3 BHK Apartments", location: "Gachibowli, Hyderabad", price: "₹92 L - 1.45 Cr", images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=340&fit=crop"], propertyId: 4 },
  { id: 5, name: "Skyline Residency", developer: "Skyline Builders", type: "2, 3 BHK Apartments", location: "Bandra West, Mumbai", price: "₹65,000/mo", images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=340&fit=crop","https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=340&fit=crop"], propertyId: 101 },
];

const SPOTLIGHT_PROJECTS = [
  { id: 1, name: "Prestige Whitefield", developer: "Prestige Group", type: "2, 3 BHK Apartments", location: "Whitefield, Bangalore", price: "₹85 L - 1.40 Cr", images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=380&fit=crop"], propertyId: 2 },
  { id: 2, name: "Lodha Belmondo", developer: "Lodha Group", type: "2, 3 BHK Apartments", location: "Gahunje, Pune", price: "₹1.20 Cr - 1.85 Cr", images: ["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=380&fit=crop"], propertyId: 3 },
  { id: 3, name: "Aparna Sarovar Grande", developer: "Aparna Constructions", type: "3, 4 BHK Apartments", location: "Nallagandla, Hyderabad", price: "₹1.19 Cr - 1.99 Cr", images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop"], propertyId: 4 },
  { id: 4, name: "Raj Legacy Satyam", developer: "Raj Realty Group", type: "1, 2, 3 BHK Apartments", location: "Mira Road East, Mumbai", price: "₹82.5 L - 1.20 Cr", images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=380&fit=crop","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=380&fit=crop"], propertyId: 1 },
];

const FEATURED_DEVELOPERS = [
  {
    id: "lodha-group",
    name: "Lodha Group",
    logo: "https://randomuser.me/api/portraits/men/22.jpg",
    estd: 1980,
    totalProjects: 120,
    description: "India's largest real estate developer by sales, known for delivering world-class residential and commercial projects across Mumbai, Pune, Hyderabad and London.",
    projects: [
      { id: "lg-1", name: "Lodha Palava City", type: "1, 2, 3 BHK", location: "Dombivli East, Thane", price: "₹42.5 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=220&fit=crop"], propertyId: 3 },
      { id: "lg-2", name: "Lodha Belmondo", type: "2, 3 BHK", location: "Gahunje, Pune", price: "₹1.20 Cr - 1.85 Cr", images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=220&fit=crop"], propertyId: 3 },
      { id: "lg-3", name: "Lodha Meridian", type: "2, 3 BHK", location: "Kukatpally, Hyderabad", price: "₹95 L - 1.40 Cr", images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=220&fit=crop"], propertyId: 3 },
      { id: "lg-4", name: "Lodha Park", type: "3, 4 BHK", location: "Worli, Mumbai", price: "₹5.5 Cr - 9 Cr", images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=220&fit=crop"], propertyId: 3 },
    ],
  },
  {
    id: "prestige-group",
    name: "Prestige Group",
    logo: "https://randomuser.me/api/portraits/men/33.jpg",
    estd: 1986,
    totalProjects: 85,
    description: "One of South India's leading real estate developers with a diversified portfolio spanning residential, commercial, retail, hospitality and leisure segments.",
    projects: [
      { id: "pg-1", name: "Prestige Koramangala Heights", type: "2, 3 BHK", location: "Koramangala, Bangalore", price: "₹85 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop"], propertyId: 2 },
      { id: "pg-2", name: "Prestige Whitefield", type: "2, 3 BHK", location: "Whitefield, Bangalore", price: "₹75 L - 1.40 Cr", images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=220&fit=crop"], propertyId: 2 },
      { id: "pg-3", name: "Prestige Lakeside Habitat", type: "1, 2, 3 BHK", location: "Whitefield, Bangalore", price: "₹60 L - 1.10 Cr", images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=220&fit=crop"], propertyId: 2 },
      { id: "pg-4", name: "Prestige Golfshire", type: "4, 5 BHK Villas", location: "Devanahalli, Bangalore", price: "₹3.5 Cr - 6 Cr", images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=220&fit=crop"], propertyId: 2 },
    ],
  },
  {
    id: "raj-realty",
    name: "Raj Realty Group",
    logo: "https://randomuser.me/api/portraits/men/11.jpg",
    estd: 2005,
    totalProjects: 30,
    description: "A dynamic force in Mumbai's real estate landscape with a proven track record of delivering landmark projects across the western suburbs and beyond.",
    projects: [
      { id: "rr-1", name: "Raj Legacy 1", type: "1 BHK", location: "Mira Road East, Mumbai", price: "₹68.65 L", images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=220&fit=crop"], propertyId: 1 },
      { id: "rr-2", name: "Raj Legacy Satyam A & B", type: "1, 2, 3 BHK", location: "Mira Road East, Mumbai", price: "₹82.5 L - 1.10 Cr", images: ["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=220&fit=crop"], propertyId: 1 },
      { id: "rr-3", name: "Raj Grandeur", type: "2, 3 BHK", location: "Borivali West, Mumbai", price: "₹1.10 Cr - 1.60 Cr", images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=220&fit=crop"], propertyId: 1 },
      { id: "rr-4", name: "Raj Splendour", type: "2, 3 BHK", location: "Kandivali West, Mumbai", price: "₹95 L - 1.45 Cr", images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=220&fit=crop"], propertyId: 1 },
    ],
  },
];

const TRUSTED_PROJECTS = [
  { id: 1, name: "Aparna Sarovar Zenith", developer: "Aparna Constructions", type: "2, 3 BHK Apartments", location: "Gachibowli, Hyderabad", price: "₹92 L - 1.45 Cr", images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop"], propertyId: 4 },
  { id: 2, name: "Prestige Koramangala Heights", developer: "Prestige Group", type: "2, 3 BHK Apartments", location: "Whitefield, Bangalore", price: "₹85 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=300&fit=crop"], propertyId: 2 },
  { id: 3, name: "Lodha Palava City", developer: "Lodha Group", type: "1, 2, 3 BHK Apartments", location: "Dombivli East, Thane", price: "₹42.5 L - 1.2 Cr", images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&h=300&fit=crop"], propertyId: 3 },
  { id: 4, name: "Anuar Towers", developer: "Anuhar Homes Pvt Ltd", type: "2, 3 BHK Apartments", location: "Manikonda, Hyderabad", price: "₹1.04 Cr - 1.57 Cr", images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop"], propertyId: 1 },
  { id: 5, name: "Raj Legacy Satyam", developer: "Raj Realty Group", type: "1, 2, 3 BHK Apartments", location: "Mira Road East, Mumbai", price: "₹82.5 L - 1.10 Cr", images: ["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1494526585095-c41746248156?w=500&h=300&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop"], propertyId: 1 },
];

// ── Section 1: Featured Projects to Explore ──────────────────────────────

function FeaturedProjectsSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 520, behavior: "smooth" });

  return (
    <section className="bg-white py-12 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Featured projects to explore</h2>
            <p className="text-sm text-gray-400 mt-1">Best projects to look out for</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition">
              <FiChevronRight size={18} className="rotate-180" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition">
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {FEATURED_PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/property/${p.propertyId}`)}
              className="min-w-[480px] max-w-[480px] flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
            >
              <ImageSlider images={p.images} className="h-[260px]" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">by {p.developer}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{p.price}</p>
                    <p className="text-[11px] text-gray-400">Price</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{p.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 2: Spotlight Projects ────────────────────────────────────────

function SpotlightProjectsSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 520, behavior: "smooth" });

  return (
    <section className="bg-[#f7f8fa] py-12 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Spotlight projects</h2>
            <p className="text-sm text-gray-400 mt-1">Noteworthy projects to watch</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition bg-white">
              <FiChevronRight size={18} className="rotate-180" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition bg-white">
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {SPOTLIGHT_PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/property/${p.propertyId}`)}
              className="min-w-[480px] max-w-[480px] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group h-[260px]"
            >
              <ImageSlider images={p.images} className="w-full h-full" />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{p.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">by {p.developer}</p>
                    <p className="text-sm font-medium text-white/90 mt-2">{p.type}</p>
                    <p className="text-xs text-white/60">{p.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white text-sm">{p.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 3: Top Builders ───────────────────────────────────────────────

function BuilderCard({ dev }) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const thumbsRef = useRef(null);
  const activeProject = dev.projects[activeIdx];

  return (
    <div className="min-w-[340px] max-w-[340px] flex-shrink-0 border-t-4 border-[#7B2FFF] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img src={dev.logo} alt={dev.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{dev.name}</p>
            <div className="flex gap-4 mt-1.5">
              <div>
                <p className="text-sm font-bold text-gray-900">{dev.estd}</p>
                <p className="text-[11px] text-gray-400">Year estd.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{dev.totalProjects}</p>
                <p className="text-[11px] text-gray-400">Projects</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{dev.description}</p>

        {/* Project name tabs — clickable */}
        <div ref={thumbsRef} className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {dev.projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveIdx(i)}
              className={`text-xs whitespace-nowrap flex-shrink-0 pb-0.5 transition-colors ${
                activeIdx === i
                  ? "text-[#7B2FFF] font-semibold border-b-2 border-[#7B2FFF]"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active project image — navigates on click */}
      <div
        className="relative h-[190px] cursor-pointer group overflow-hidden"
        onClick={() => navigate(`/property/${activeProject.propertyId}`)}
      >
        <ImageSlider images={activeProject.images} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-tight">{activeProject.name}</p>
          <p className="text-white/70 text-xs mt-0.5">{activeProject.location}</p>
          <p className="text-white font-bold text-sm mt-1">{activeProject.price}</p>
        </div>

        {/* Dot indicators */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {dev.projects.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeIdx === i ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TopBuildersSection() {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <section className="bg-white py-12 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Top builders</h2>
            <p className="text-sm text-gray-400 mt-1">Prominent real-estate builders</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition">
              <FiChevronRight size={18} className="rotate-180" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition">
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {FEATURED_DEVELOPERS.map((dev) => (
            <BuilderCard key={dev.id} dev={dev} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 4: Projects by Leading Builders ───────────────────────────────

function TrustedDevelopersSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <section className="bg-[#f7f8fa] py-12 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Projects by leading builders</h2>
            <p className="text-sm text-gray-400 mt-1">Exclusive showcase of top projects</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition bg-white">
              <FiChevronRight size={18} className="rotate-180" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition bg-white">
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {TRUSTED_PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/property/${p.propertyId}`)}
              className="min-w-[340px] max-w-[340px] flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white group"
            >
              <ImageSlider images={p.images} className="h-[220px]" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">by {p.developer}</p>
                <div className="mt-2">
                  <p className="text-xs text-gray-600">{p.type}</p>
                  <p className="text-xs text-gray-400">{p.location}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm mt-2">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Combined export ───────────────────────────────────────────────────────

export default function ExploreMoreSections() {
  return (
    <>
      <FeaturedProjectsSection />
      <SpotlightProjectsSection />
      <TopBuildersSection />
      <TrustedDevelopersSection />
    </>
  );
}
