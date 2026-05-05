import { useState, useRef } from "react";
import { FiPhone, FiChevronRight } from "react-icons/fi";
import { sellersByTab } from "../data/sellers";
import ContactFlow from "./ContactFlow";
import "./RecommendedSellers.css";

export default function RecommendedSellers({ activeTab }) {
  const [showContact, setShowContact] = useState(false);
  const scrollRef = useRef(null);

  const sellers = sellersByTab[activeTab] ?? sellersByTab["BUY"];

  // pair sellers into rows of 2
  const pairs = [];
  for (let i = 0; i < sellers.length; i += 2) pairs.push(sellers.slice(i, i + 2));

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="rs-section">
      <div className="rs-inner">
        <h2 className="rs-heading">Recommended sellers</h2>
        <p className="rs-sub">Sellers with complete knowledge about locality</p>

        <div className="rs-scroll-wrap">
          <div className="rs-grid" ref={scrollRef}>
            {pairs.map((pair, ci) => (
              <div key={ci} className="rs-col">
                {pair.map((seller) => (
                  <div key={seller.id} className="rs-card">
                    <div className="rs-card-header" style={{ background: seller.badge === "#fff" ? "#f9f9f9" : seller.badge }}>
                      <img src={seller.avatar} alt={seller.name} className="rs-avatar" />
                      <span className="rs-name" style={{ color: seller.badge === "#fff" ? "#222" : "#fff" }}>
                        {seller.name}
                      </span>
                      <FiChevronRight size={16} style={{ color: seller.badge === "#fff" ? "#222" : "#fff", marginLeft: "auto", flexShrink: 0 }} />
                    </div>
                    <div className="rs-card-body">
                      <p className="rs-stats">
                        <span>{seller.experience} Yrs Experience</span>
                        <span className="rs-divider">|</span>
                        <span>{seller.listings} Total listings</span>
                      </p>
                      <div className="rs-areas">
                        {seller.areas.map((a) => <span key={a} className="rs-area-chip">{a}</span>)}
                      </div>
                      <button className="rs-contact-btn" onClick={() => setShowContact(true)}>
                        <FiPhone size={14} /> Show Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button className="rs-arrow rs-arrow-right" onClick={() => scroll(1)}>›</button>
        </div>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
