import React, { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import "../styles/Sidebar.css"; // Import the CSS file
import logo from "../assets/logo_light.png";

const Sidebar = ({ links }) => {
  const [activeIndex, setActiveIndex] = useState(null); // Track active index

  return (
    <div className="sidebar">
      {/* Logo and Navigation Wrapper */}
      <div className="top-section">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={`nav-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => setActiveIndex(index)} // Set active state on click
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Sign-out Button */}
      <a href="#" className="sign-out">
        <FaSignOutAlt size={20} />
        <span>Sign-out</span>
      </a>
    </div>
  );
};

export default Sidebar;
