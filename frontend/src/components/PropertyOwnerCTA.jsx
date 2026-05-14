export default function PropertyOwnerCTA({ activeTab }) {
  // Show different messages based on intent
  const config = {
    BUY: {
      title: "Have a property to sell?",
      subtitle: "List your property & connect with clients faster!",
      buttonText: "Sell your property",
      illustration: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop",
    },
    RENT: {
      title: "Have a property to rent?",
      subtitle: "List your property & connect with tenants faster!",
      buttonText: "Rent your property",
      illustration: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop",
    },
  };

  const content = config[activeTab] || config.BUY;

  // Only show for BUY and RENT
  if (!["BUY", "RENT"].includes(activeTab)) return null;

  return (
    <section className="bg-white py-12 px-5">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-6">{content.title}</h2>

        <div className="relative bg-gradient-to-r from-[#f0ebff] via-[#fef3f8] to-[#e8f5ff] rounded-2xl overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-8 py-8 max-md:flex-col max-md:text-center">
            
            {/* Left illustration */}
            <div className="w-[200px] flex-shrink-0 max-md:hidden">
              <svg viewBox="0 0 200 150" className="w-full h-auto">
                {/* House illustration */}
                <g>
                  {/* Building */}
                  <rect x="60" y="50" width="80" height="80" fill="#7B2FFF" opacity="0.1" rx="4"/>
                  <rect x="70" y="60" width="60" height="60" fill="#7B2FFF" opacity="0.2" rx="2"/>
                  
                  {/* Windows */}
                  <rect x="80" y="70" width="15" height="15" fill="#7B2FFF" opacity="0.4" rx="1"/>
                  <rect x="105" y="70" width="15" height="15" fill="#7B2FFF" opacity="0.4" rx="1"/>
                  <rect x="80" y="95" width="15" height="15" fill="#7B2FFF" opacity="0.4" rx="1"/>
                  <rect x="105" y="95" width="15" height="15" fill="#7B2FFF" opacity="0.4" rx="1"/>
                  
                  {/* Cursor/Hand */}
                  <circle cx="150" cy="40" r="20" fill="#FF6B9D" opacity="0.2"/>
                  <path d="M145 35 L155 45 L150 50 L140 40 Z" fill="#FF6B9D"/>
                </g>
              </svg>
            </div>

            {/* Center content */}
            <div className="flex-1 text-center">
              <p className="text-base text-gray-600 mb-4">{content.subtitle}</p>
              <button className="bg-white border-2 border-[#7B2FFF] text-[#7B2FFF] hover:bg-[#7B2FFF] hover:text-white px-8 py-3 rounded-xl font-bold text-sm transition-all">
                {content.buttonText}
              </button>
            </div>

            {/* Right illustration */}
            <div className="w-[200px] flex-shrink-0 max-md:hidden">
              <svg viewBox="0 0 200 150" className="w-full h-auto">
                {/* People illustration */}
                <g>
                  {/* Person 1 */}
                  <circle cx="70" cy="60" r="15" fill="#7B2FFF" opacity="0.3"/>
                  <rect x="60" y="75" width="20" height="35" fill="#7B2FFF" opacity="0.2" rx="10"/>
                  
                  {/* Person 2 */}
                  <circle cx="130" cy="65" r="18" fill="#FF6B9D" opacity="0.3"/>
                  <rect x="118" y="83" width="24" height="40" fill="#FF6B9D" opacity="0.2" rx="12"/>
                  
                  {/* Car */}
                  <ellipse cx="100" cy="130" rx="40" ry="10" fill="#7B2FFF" opacity="0.1"/>
                  <rect x="70" y="115" width="60" height="20" fill="#7B2FFF" opacity="0.2" rx="10"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
