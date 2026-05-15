import { useState, useRef } from "react";
import { FiPhone, FiChevronRight } from "react-icons/fi";
import { sellersByTab } from "../data/sellers";
import ContactFlow from "./ContactFlow";

export default function RecommendedSellers({ activeTab }) {
  const [showContact, setShowContact] = useState(false);
  const scrollRef = useRef(null);

  const sellers = sellersByTab[activeTab] ?? sellersByTab["BUY"];

  // pair sellers into columns of 2
  const pairs = [];
  for (let i = 0; i < sellers.length; i += 2) pairs.push(sellers.slice(i, i + 2));

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="bg-[#f7f8fa] px-5 py-12">
      <div className="max-w-[1200px] mx-auto">

        <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-1">Recommended sellers</h2>
        <p className="text-sm text-[#888] mb-7">Sellers with complete knowledge about locality</p>

        {/* Scroll wrap */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-1 scroll-snap-x-mandatory"
          >
            {pairs.map((pair, ci) => (
              <div
                key={ci}
                className="flex flex-col gap-4 flex-shrink-0 w-[260px] sm:w-[300px] scroll-snap-align-start"
              >
                {pair.map((seller) => {
                  const lightBadge = seller.badge === "#fff";
                  return (
                    <div key={seller.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.07)]">
                      {/* Header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3.5"
                        style={{ background: lightBadge ? "#f9f9f9" : seller.badge }}
                      >
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="w-[42px] h-[42px] rounded-lg object-cover flex-shrink-0 border-2 border-white/30"
                        />
                        <span
                          className="text-[15px] font-bold flex-1"
                          style={{ color: lightBadge ? "#222" : "#fff" }}
                        >
                          {seller.name}
                        </span>
                        <FiChevronRight
                          size={16}
                          className="flex-shrink-0 ml-auto"
                          style={{ color: lightBadge ? "#222" : "#fff" }}
                        />
                      </div>

                      {/* Body */}
                      <div className="px-4 py-3.5">
                        <p className="flex items-center gap-2 text-[13px] text-[#444] mb-2.5">
                          <span>{seller.experience} Yrs Experience</span>
                          <span className="text-[#ccc]">|</span>
                          <span>{seller.listings} Total listings</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3.5">
                          {seller.areas.map((a) => (
                            <span key={a} className="text-[12px] text-[#555] bg-[#f0f0f0] px-2.5 py-0.5 rounded-full">
                              {a}
                            </span>
                          ))}
                        </div>
                        <button
                          className="w-full py-2 border-[1.5px] border-[#7B2FFF] text-[#7B2FFF] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#7B2FFF] hover:text-white transition-all cursor-pointer bg-transparent"
                          onClick={() => setShowContact(true)}
                        >
                          <FiPhone size={14} /> Show Contact
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-[#e0e0e0] rounded-full flex items-center justify-center text-[22px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] cursor-pointer hover:bg-[#f3eeff] hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition-all z-10 leading-none"
          >
            ›
          </button>
        </div>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
