import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "../styles/Sidebar.css";
import logo from "../assets/logo_light.png";
import { useAuth } from "../utils/authContext";

const Sidebar = ({ links }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (href, index) => {
    setActiveIndex(index);
    navigate(href);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/SignIn");
    } else {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo and Navigation Wrapper */}
      <div className="top-section">
        {/* Navigation Links */}
        <nav className="nav-links">
          {links.map((link, index) => (
            <a
              key={index}
              href="#"
              className={`nav-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => handleNavigation(link.href, index)}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Sign-out Button */}
      <a href="#" className="sign-out" onClick={handleSignOut}>
        <FaSignOutAlt size={20} />
        <span>Sign-out</span>
      </a>
    </div>
  );
};

export default Sidebar;