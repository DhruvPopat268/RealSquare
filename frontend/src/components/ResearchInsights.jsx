import { useNavigate } from "react-router-dom";

export default function ResearchInsights() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Price Trends",
      subtitle: "Find property rates & price trends of top locations",
      to: "/price-trends",
      illustration: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="10" y="55" width="22" height="50" rx="2" fill="#c7d2fe" />
          <rect x="36" y="40" width="22" height="65" rx="2" fill="#a5b4fc" />
          <rect x="62" y="60" width="18" height="45" rx="2" fill="#c7d2fe" />
          <rect x="84" y="45" width="22" height="60" rx="2" fill="#a5b4fc" />
          <rect x="110" y="35" width="22" height="70" rx="2" fill="#c7d2fe" />
          <rect x="15" y="62" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="23" y="62" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="15" y="72" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="23" y="72" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="41" y="48" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="49" y="48" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="41" y="58" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="49" y="58" width="5" height="5" rx="1" fill="#818cf8" />
          <rect x="30" y="88" width="100" height="6" rx="3" fill="#818cf8" />
          <rect x="38" y="94" width="6" height="16" rx="2" fill="#818cf8" />
          <rect x="116" y="94" width="6" height="16" rx="2" fill="#818cf8" />
          <rect x="55" y="72" width="38" height="16" rx="2" fill="#6366f1" />
          <rect x="57" y="74" width="34" height="12" rx="1" fill="#e0e7ff" />
          <rect x="50" y="88" width="48" height="3" rx="1.5" fill="#4f46e5" />
          <polyline points="60,83 67,78 74,81 81,75 88,77" stroke="#7B2FFF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="88" cy="68" r="7" fill="#fbbf24" />
          <rect x="82" y="75" width="12" height="14" rx="3" fill="#6366f1" />
          <line x1="82" y1="80" x2="74" y2="85" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="94" y1="80" x2="100" y2="84" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="108,75 118,62 128,66 138,52" stroke="#7B2FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points="138,52 133,54 136,59" fill="#7B2FFF" />
        </svg>
      ),
    },
    {
      title: "City Insights",
      subtitle: "Get to know about top cities before you invest",
      to: "/price-trends",
      illustration: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="8" y="50" width="20" height="55" rx="2" fill="#c7d2fe" />
          <rect x="30" y="35" width="24" height="70" rx="2" fill="#a5b4fc" />
          <rect x="56" y="55" width="16" height="50" rx="2" fill="#c7d2fe" />
          <rect x="74" y="42" width="20" height="63" rx="2" fill="#a5b4fc" />
          <rect x="96" y="30" width="26" height="75" rx="2" fill="#c7d2fe" />
          <rect x="124" y="48" width="18" height="57" rx="2" fill="#a5b4fc" />
          <rect x="13" y="58" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="20" y="58" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="35" y="43" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="43" y="43" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="101" y="38" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="109" y="38" width="4" height="4" rx="1" fill="#818cf8" />
          <circle cx="68" cy="72" r="6" fill="#fbbf24" />
          <rect x="63" y="78" width="10" height="13" rx="3" fill="#ec4899" />
          <line x1="63" y1="83" x2="57" y2="88" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="73" y1="83" x2="79" y2="87" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="110" cy="75" r="14" stroke="#7B2FFF" strokeWidth="3" fill="#ede9fe" fillOpacity="0.6" />
          <line x1="120" y1="85" x2="132" y2="97" stroke="#7B2FFF" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="110" cy="75" r="8" fill="#c4b5fd" fillOpacity="0.4" />
          <circle cx="110" cy="73" r="3" fill="#7B2FFF" />
          <line x1="110" y1="76" x2="110" y2="81" stroke="#7B2FFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Housing Research",
      subtitle: "Find reports on Indian residential market",
      to: "/news",
      illustration: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="8" y="45" width="20" height="60" rx="2" fill="#c7d2fe" />
          <rect x="30" y="55" width="18" height="50" rx="2" fill="#a5b4fc" />
          <rect x="110" y="40" width="22" height="65" rx="2" fill="#c7d2fe" />
          <rect x="134" y="52" width="18" height="53" rx="2" fill="#a5b4fc" />
          <rect x="13" y="53" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="20" y="53" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="115" y="48" width="4" height="4" rx="1" fill="#818cf8" />
          <rect x="123" y="48" width="4" height="4" rx="1" fill="#818cf8" />
          <path d="M42 65 Q42 60 47 60 L72 60 L76 55 L108 55 Q113 55 113 60 L113 98 Q113 103 108 103 L47 103 Q42 103 42 98 Z" fill="#fbbf24" />
          <path d="M42 68 L113 68 L113 98 Q113 103 108 103 L47 103 Q42 103 42 98 Z" fill="#f59e0b" />
          <rect x="55" y="72" width="45" height="24" rx="2" fill="white" fillOpacity="0.9" />
          <line x1="61" y1="79" x2="94" y2="79" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="61" y1="84" x2="94" y2="84" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="61" y1="89" x2="80" y2="89" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="68" r="13" stroke="#7B2FFF" strokeWidth="2.5" fill="#ede9fe" fillOpacity="0.5" />
          <line x1="109" y1="77" x2="120" y2="88" stroke="#7B2FFF" strokeWidth="3" strokeLinecap="round" />
          <rect x="92" y="68" width="4" height="8" rx="1" fill="#7B2FFF" />
          <rect x="98" y="64" width="4" height="12" rx="1" fill="#a78bfa" />
          <rect x="104" y="66" width="4" height="10" rx="1" fill="#7B2FFF" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-[#f7f8fa] py-14 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Research and Insights</h2>
          <p className="text-sm text-gray-400 mt-1">Explore useful real estate insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.to)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left overflow-hidden group"
            >
              <div className="h-[160px] bg-[#f0ebff] flex items-center justify-center px-8 py-4">
                <div className="w-full h-full max-w-[200px] mx-auto">
                  {card.illustration}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="font-bold text-gray-900 text-[15px] flex items-center gap-1 group-hover:text-[#7B2FFF] transition-colors">
                  {card.title}
                  <span className="text-[#7B2FFF]">›</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{card.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
