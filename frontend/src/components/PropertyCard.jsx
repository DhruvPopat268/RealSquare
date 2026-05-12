import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiMapPin, FiMaximize2, FiPhone, FiClock } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ContactFlow from "./ContactFlow";
import WishlistToast, { useWishlistToast } from "./WishlistToast";

function timeAgo(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function PropertyCard({ property, showPostedAt = false }) {
  const [showContact, setShowContact] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { toast, showToast, setToast } = useWishlistToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, title, price, location: loc, beds, baths, area, type, tag, image, developer, emiStarts, configurations, postedAt } = property;
  const ago = showPostedAt ? timeAgo(postedAt) : null;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const newState = !wishlisted;
    setWishlisted(newState);
    showToast(newState, title);
  };

  const tagColors = {
    "Ready to Move": "bg-green-100 text-green-700",
    "New Launch": "bg-blue-100 text-blue-700",
    "Premium": "bg-yellow-100 text-yellow-700",
    "Under Construction": "bg-orange-100 text-orange-700",
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex overflow-hidden"
      onClick={() => navigate(`/property/${id}`, { state: { from: location.pathname + location.search } })}
    >
      {/* Left — Image */}
      <div className="relative flex-shrink-0 w-[260px] h-[190px]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* Newly Added badge */}
        {showPostedAt && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✦ Newly Added
          </span>
        )}
        {tag && !showPostedAt && (
          <span className={`absolute top-2 left-2 text-[11px] font-700 px-2 py-0.5 rounded font-semibold ${tagColors[tag] || "bg-gray-100 text-gray-600"}`}>
            {tag}
          </span>
        )}
        <button
          className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow"
          onClick={handleWishlistToggle}
        >
          <FiHeart size={14} className={wishlisted ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
          {type}
        </span>
      </div>

      {/* Right — Details */}
      <div className="flex flex-col flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              {configurations || (beds ? `${beds} BHK ${type}` : type)}
              <span className="mx-1 text-gray-300">·</span>
              <MdVerified size={13} className="text-green-500" />
              <span className="text-green-600 font-medium">RERA</span>
            </p>
          </div>
          {developer && (
            <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">Builder</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-4 mt-2 mb-2">
          <span className="text-xl font-bold text-gray-900">{price}</span>
          {area && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <FiMaximize2 size={12} /> {area}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <FiMapPin size={11} />
          <span className="truncate">{loc}</span>
        </div>

        {/* EMI / postedAt */}
        {ago ? (
          <p className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1">
            <FiClock size={11} /> Posted {ago}
          </p>
        ) : emiStarts ? (
          <p className="text-xs text-gray-400 mb-3">EMI starts at <span className="font-semibold text-gray-600">{emiStarts}/mo</span></p>
        ) : null}

        {/* Developer + Actions */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {developer && <span className="font-medium text-gray-700">{developer}</span>}
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#7B2FFF] text-[#7B2FFF] rounded-lg text-xs font-semibold hover:bg-[#f5f0ff] transition"
              onClick={(e) => { e.stopPropagation(); setShowContact(true); }}
            >
              <FiPhone size={12} /> Contact
            </button>
            <button
              className="px-3 py-1.5 bg-[#7B2FFF] text-white rounded-lg text-xs font-semibold hover:bg-[#6a1fe0] transition"
              onClick={(e) => { e.stopPropagation(); navigate(`/property/${id}`); }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
      <WishlistToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
