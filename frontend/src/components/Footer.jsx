import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi";
import "./Footer.css";

const links = {
  "Company": ["About Us", "Careers", "Press", "Blog"],
  "Properties": ["Buy", "Rent", "New Projects", "Commercial"],
  "Support": ["Help Center", "Contact Us", "Privacy Policy", "Terms of Use"],
  "Tools": ["EMI Calculator", "Property Valuation", "Home Loans", "Legal Help"],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">real<span>square</span></div>
          <p>India's most trusted real estate platform. Find your dream home today.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="YouTube"><FiYoutube /></a>
          </div>
        </div>

        {Object.entries(links).map(([heading, items]) => (
          <div key={heading} className="footer-col">
            <h4>{heading}</h4>
            <ul>
              {items.map((item) => (
                <li key={item}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© 2025 RealSquare. All rights reserved.</p>
        <p>Made with ❤️ in India</p>
      </div>
    </footer>
  );
}
