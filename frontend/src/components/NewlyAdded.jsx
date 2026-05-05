import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { newlyAddedProperties } from "../data/properties";
import ContactFlow from "./ContactFlow";
import "./NewlyAdded.css";

export default function NewlyAdded({ searchQuery }) {
  const scrollRef = useRef(null);
  const [showContact, setShowContact] = useState(false);
  const navigate = useNavigate();

  const filtered = searchQuery
    ? newlyAddedProperties.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        const locationLower = p.location.toLowerCase();
        const searchParts = searchLower.split(',').map(s => s.trim());
        return searchParts.some(part => locationLower.includes(part)) || locationLower.includes(searchLower);
      })
    : newlyAddedProperties;

  const scroll = () => {
    scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" });
  };

  return (
    <section className="newly-added">
      <div className="na-header">
        <div>
          <h2>Newly-added properties</h2>
          <p>Fresh listings to check out</p>
        </div>
      </div>

      <div className="na-scroll-wrap">
        <div className="na-cards" ref={scrollRef}>
          {filtered.length > 0 ? filtered.map((p) => (
            <div className="na-card" key={p.id} onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: "pointer" }}>
              <div className="na-img-wrap">
                <img src={p.image} alt={p.name} />
              </div>
              <div className="na-body">
                <h3>{p.name}</h3>
                <span className="na-type">{p.type}</span>
                <span className="na-location">{p.location}</span>
                <div className="na-price">{p.price}</div>
                <button className="na-contact-btn" onClick={(e) => { e.stopPropagation(); setShowContact(true); }}>Contact</button>
              </div>
            </div>
          )) : (
            <p className="na-empty">No newly added properties found for <strong>"{searchQuery}"</strong>.</p>
          )}
        </div>
        <button className="na-arrow" onClick={scroll} aria-label="Scroll right">›</button>
      </div>
      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
