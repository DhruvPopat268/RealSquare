import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageSlider from "./ImageSlider";

const HIGH_DEMAND_PROJECTS = [
  {
    id: 1,
    name: "Anuar Towers",
    developer: "Anuhar Homes Pvt Ltd",
    type: "2, 3 BHK Apartment",
    location: "Manikonda, Hyderabad",
    price: "₹1.04 Cr - 1.57 Cr",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop",
    ],
    propertyId: 1,
  },
  {
    id: 2,
    name: "Prestige Koramangala Heights",
    developer: "Prestige Group",
    type: "2, 3 BHK Apartment",
    location: "Koramangala, Bangalore",
    price: "₹85 L - 1.2 Cr",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=260&fit=crop",
    ],
    propertyId: 2,
  },
  {
    id: 3,
    name: "Lodha Palava City",
    developer: "Lodha Group",
    type: "1, 2, 3 BHK Apartment",
    location: "Dombivli East, Thane",
    price: "₹42.5 L - 1.2 Cr",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop",
    ],
    propertyId: 3,
  },
  {
    id: 4,
    name: "Whitefield Green Residency",
    developer: "Prestige Group",
    type: "2, 3 BHK Apartment",
    location: "Whitefield, Bangalore",
    price: "₹75 L - 1.40 Cr",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop",
    ],
    propertyId: 2,
  },
  {
    id: 5,
    name: "Hyderabad Skyline Towers",
    developer: "Skyline Developers",
    type: "2, 3 BHK Apartment",
    location: "Jubilee Hills, Hyderabad",
    price: "₹1.20 Cr - 2.50 Cr",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop",
    ],
    propertyId: 1,
  },
  {
    id: 6,
    name: "Noida Sector 62 Residences",
    developer: "Gaurs Group",
    type: "1, 2 BHK Apartment",
    location: "Sector 62, Noida",
    price: "₹60 L - 95 L",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=260&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop",
    ],
    propertyId: 3,
  },
];

export default function HighDemandProjects() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-12 px-5">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">High-demand projects to invest now</h2>
            <p className="text-sm text-gray-400 mt-1">Leading projects in high demand</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable grid — 2 rows × N cols like housing.com */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-none"
        >
          <div className="grid grid-rows-2 grid-flow-col gap-3 w-max">
            {HIGH_DEMAND_PROJECTS.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/property/${project.propertyId}`)}
                className="w-[420px] flex items-center gap-3 border border-gray-100 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-[#7B2FFF] transition-all group"
              >
                {/* Image */}
                <ImageSlider
                  images={project.images}
                  className="w-[110px] h-[80px] rounded-lg flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#1a1a2e] truncate group-hover:text-[#7B2FFF] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate mb-1">by {project.developer}</p>
                  <p className="text-xs text-gray-500 truncate mb-1">{project.type}</p>
                  <p className="text-xs text-gray-400 truncate mb-1.5">{project.location}</p>
                  <p className="text-sm font-extrabold text-[#1a1a2e]">{project.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
