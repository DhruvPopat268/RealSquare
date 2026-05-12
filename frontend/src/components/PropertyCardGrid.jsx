import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiDroplet, FiMaximize2, FiHeart, FiMapPin } from "react-icons/fi";
import ContactFlow from "./ContactFlow";
import WishlistToast, { useWishlistToast } from "./WishlistToast";

export default function PropertyCardGrid({ property }) {
  const [showContact, setShowContact] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { toast, showToast, setToast } = useWishlistToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, title, price, location: loc, beds, baths, area, type, tag, image } = property;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const newState = !wishlisted;
    setWishlisted(newState);
    showToast(newState, title);
  };

  const tagColors = {
    "Ready to Move": "bg-green-100 text-green-700",
    "New Launch":    "bg-blue-100 text-blue-700",
    "Premium":       "bg-yellow-100 text-yellow-700",
    "Under Construction": "bg-orange-100 text-orange-700",
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
      onClick={() => navigate(`/property/${id}`, { state: { from: location.pathname + location.search } })}
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        {tag && (
          <span className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagColors[tag] || "bg-gray-100 text-gray-600"}`}>
            {tag}
          </span>
        )}
        <button
          className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow"
          onClick={handleWishlistToggle}
        >
          <FiHeart size={14} className={wishlisted ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
        <span className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded">
          {type}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="text-lg font-bold text-[#7B2FFF] mb-1">{price}</div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{title}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <FiMapPin size={11} />
          <span className="truncate">{loc}</span>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {beds != null && <span className="flex items-center gap-1"><FiHome size={12} /> {beds} Beds</span>}
          {baths != null && <span className="flex items-center gap-1"><FiDroplet size={12} /> {baths} Baths</span>}
          <span className="flex items-center gap-1"><FiMaximize2 size={12} /> {area}</span>
        </div>

        <button
          className="w-full py-2 border border-[#7B2FFF] text-[#7B2FFF] rounded-lg text-xs font-semibold hover:bg-[#7B2FFF] hover:text-white transition"
          onClick={(e) => { e.stopPropagation(); setShowContact(true); }}
        >
          Contact Owner
        </button>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
      <WishlistToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
