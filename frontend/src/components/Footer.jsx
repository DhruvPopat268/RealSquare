import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi";

const links = {
  "Company":    ["About Us", "Careers", "Press", "Blog"],
  "Properties": ["Buy", "Rent", "New Projects", "Commercial"],
  "Support":    ["Help Center", "Contact Us", "Privacy Policy", "Terms of Use"],
  "Tools":      ["EMI Calculator", "Property Valuation", "Home Loans", "Legal Help"],
};

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-[#ccc]">

      {/* Main grid */}
      <div className="max-w-[1200px] mx-auto px-5 pt-12 pb-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">

        {/* Brand — full width on tablet and below */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <div className="text-[22px] font-extrabold text-white mb-3">
            real<span className="text-[#a78bfa]">square</span>
          </div>
          <p className="text-[13px] leading-relaxed text-[#9ca3af] mb-4">
            India's most trusted real estate platform. Find your dream home today.
          </p>
          <div className="flex gap-3">
            {[
              { icon: <FiFacebook />, label: "Facebook" },
              { icon: <FiTwitter />,  label: "Twitter" },
              { icon: <FiInstagram />,label: "Instagram" },
              { icon: <FiYoutube />,  label: "YouTube" },
            ].map(({ icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-[#9ca3af] text-lg hover:text-[#a78bfa] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-[0.5px] mb-4">
              {heading}
            </h4>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#9ca3af] text-[13px] no-underline hover:text-[#a78bfa] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1f2937]">
        <div className="max-w-[1200px] mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[12px] text-[#6b7280] text-center">
          <p>© 2025 RealSquare. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>

    </footer>
  );
}
