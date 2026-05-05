import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft, FiMapPin, FiHome, FiDroplet, FiMaximize2, FiHeart, FiShare2, FiCheck } from "react-icons/fi";
import { properties, newlyAddedProperties } from "../data/properties";
import ContactFlow from "../components/ContactFlow";
import ScheduleVisit from "../components/ScheduleVisit";
import "./PropertyDetail.css";

const extraDetails = {
  description: "This beautifully designed property offers a perfect blend of modern architecture and comfortable living. Located in a prime area with excellent connectivity to schools, hospitals, shopping centres, and public transport. The property features premium fittings, spacious rooms, and ample natural light throughout.",
  amenities: ["Swimming Pool", "Gym & Fitness Centre", "24/7 Security", "Power Backup", "Covered Parking", "Children's Play Area", "Clubhouse", "Landscaped Garden", "Lift", "Intercom"],
  highlights: ["Vastu Compliant", "Corner Unit", "East Facing", "Modular Kitchen", "Vitrified Tiles", "Premium Fittings"],
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=500&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=500&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=500&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=500&fit=crop",
  ],
  postedBy: "Rahul Sharma",
  postedOn: "2 days ago",
  rera: "P51800047765",
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const allProperties = [
    ...properties.map((p) => ({ ...p, name: p.title })),
    ...newlyAddedProperties.map((p) => ({ ...p, title: p.name, beds: p.beds ?? null, baths: p.baths ?? null, area: p.area ?? "N/A", tag: p.tag ?? "New Launch", type: p.type })),
  ];

  const property = allProperties.find((p) => String(p.id) === String(id));

  if (!property) {
    return (
      <div className="pd-not-found">
        <h2>Property not found</h2>
        <button onClick={() => navigate("/")}>← Back to Home</button>
      </div>
    );
  }

  const images = [property.image, ...extraDetails.images.filter((img) => img !== property.image)].slice(0, 4);

  return (
    <div className="pd-page">
      {/* Top bar */}
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>
        <div className="pd-topbar-actions">
          <button className="pd-icon-btn" onClick={() => setWishlisted((w) => !w)}>
            <FiHeart size={18} style={{ color: wishlisted ? "#ef4444" : "#555", fill: wishlisted ? "#ef4444" : "none" }} />
          </button>
          <button className="pd-icon-btn"><FiShare2 size={18} /></button>
        </div>
      </div>

      <div className="pd-inner">
        {/* Image gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            <img src={images[activeImg]} alt={property.title} />
            <span className="pd-tag">{property.tag}</span>
          </div>
          <div className="pd-thumbs">
            {images.map((img, i) => (
              <div key={i} className={`pd-thumb ${activeImg === i ? "active" : ""}`} onClick={() => setActiveImg(i)}>
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-body">
          {/* Left — details */}
          <div className="pd-left">
            <div className="pd-title-row">
              <div>
                <h1>{property.title || property.name}</h1>
                <div className="pd-location"><FiMapPin size={14} /> {property.location}</div>
              </div>
              <div className="pd-price">{property.price}</div>
            </div>

            <div className="pd-specs-row">
              {property.beds != null && <div className="pd-spec"><FiHome size={16} /><span>{property.beds} Beds</span></div>}
              {property.baths != null && <div className="pd-spec"><FiDroplet size={16} /><span>{property.baths} Baths</span></div>}
              <div className="pd-spec"><FiMaximize2 size={16} /><span>{property.area}</span></div>
              <div className="pd-spec-badge">{property.type}</div>
            </div>

            <div className="pd-rera">
              <span>RERA ID:</span> {extraDetails.rera}
            </div>

            {/* Description */}
            <div className="pd-section">
              <h3>About this property</h3>
              <p>{extraDetails.description}</p>
            </div>

            {/* Highlights */}
            <div className="pd-section">
              <h3>Key Highlights</h3>
              <div className="pd-highlights">
                {extraDetails.highlights.map((h) => (
                  <div key={h} className="pd-highlight-chip">
                    <FiCheck size={13} /> {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="pd-section">
              <h3>Amenities</h3>
              <div className="pd-amenities">
                {extraDetails.amenities.map((a) => (
                  <div key={a} className="pd-amenity">
                    <div className="pd-amenity-dot" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — contact card */}
          <div className="pd-right">
            <div className="pd-contact-card">
              <div className="pd-posted-by">
                <div className="pd-avatar">{extraDetails.postedBy[0]}</div>
                <div>
                  <p className="pd-poster-name">{extraDetails.postedBy}</p>
                  <p className="pd-poster-label">Property Owner · {extraDetails.postedOn}</p>
                </div>
              </div>

              <div className="pd-price-big">{property.price}</div>
              <p className="pd-price-note">All inclusive price</p>

              <button className="pd-contact-btn" onClick={() => setShowContact(true)}>
                Contact Owner
              </button>
              <button className="pd-schedule-btn" onClick={() => setShowSchedule(true)}>Schedule a Visit</button>

              <div className="pd-safe">
                <FiCheck size={13} /> Safe &amp; Verified Listing
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
      {showSchedule && <ScheduleVisit onClose={() => setShowSchedule(false)} />}
    </div>
  );
}
