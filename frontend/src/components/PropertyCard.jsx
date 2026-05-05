import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiDroplet, FiMaximize2, FiHeart, FiMapPin } from "react-icons/fi";
import ContactFlow from "./ContactFlow";
import "./PropertyCard.css";

export default function PropertyCard({ property }) {
  const [showContact, setShowContact] = useState(false);
  const navigate = useNavigate();
  const { id, title, price, location, beds, baths, area, type, tag, image } = property;

  const tagClass = {
    "Ready to Move": "tag-green",
    "New Launch": "tag-blue",
    "Premium": "tag-gold",
    "Under Construction": "tag-orange",
  }[tag] || "tag-green";

  return (
    <div className="property-card" onClick={() => navigate(`/property/${id}`)} style={{ cursor: "pointer" }}>
      <div className="card-image-wrap">
        <img src={image} alt={title} className="card-image" />
        <span className={`card-tag ${tagClass}`}>{tag}</span>
        <button className="wishlist-btn" aria-label="Save to wishlist">
          <FiHeart size={16} />
        </button>
        <span className="card-type">{type}</span>
      </div>

      <div className="card-body">
        <div className="card-price">{price}</div>
        <h3 className="card-title">{title}</h3>
        <div className="card-location">
          <FiMapPin size={13} />
          <span>{location}</span>
        </div>

        <div className="card-divider" />

        <div className="card-specs">
          {beds != null && <span><FiHome size={14} /> {beds} Beds</span>}
          {baths != null && <span><FiDroplet size={14} /> {baths} Baths</span>}
          <span><FiMaximize2 size={14} /> {area}</span>
        </div>

        <button className="contact-btn" onClick={(e) => { e.stopPropagation(); setShowContact(true); }}>Contact Owner</button>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </div>
  );
}
