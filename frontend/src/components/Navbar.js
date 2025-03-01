import React from "react";
import { FaUserCircle } from "react-icons/fa"; 
import logo from "../assets/logo.png"; 
import Button from "../components/Button"; 
import "../styles/Navbar.css"; 

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Right: Avatar & Sign-out */}
      <div className="navbar-right">
        <button className="avatar-button" onClick={() => window.location.href = "/UserPersonalDetail"}>
          <FaUserCircle size={40} />
        </button>
        <Button variant="light" onClick={() => window.location.href = "/SignUp"}>Sign Out</Button> {/* Using Sign-out component */}
      </div>
    </nav>
  );
};

export default Navbar;
