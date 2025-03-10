import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; 
import logo from "../assets/LOGO.png"; 
import Button from "../components/Button"; 
import "../styles/Navbar.css"; 
import { useAuth } from "../utils/authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/SignIn");
    } else {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/UserPersonalDetail");
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Right: Avatar & Sign-out */}
      <div className="navbar-right">
        <button className="avatar-button" onClick={handleProfileClick}>
          <FaUserCircle size={40} />
        </button>
        <Button variant="light" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </nav>
  );
};

export default Navbar;