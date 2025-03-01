import React from "react";
import "../styles/Footer.css"; 
import logo from "../assets/logo_light.png"; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Talim App Name */}
        <div className="footer-logo">
          <img src={logo} alt="Logo" />
        </div>

        {/* Center: Navigation Links */}
        <nav className="footer-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact Us</a>
        </nav>

        {/* Right: Copyright Info */}
        <div className="footer-copy">
          <p>&copy; {new Date().getFullYear()} Talim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
