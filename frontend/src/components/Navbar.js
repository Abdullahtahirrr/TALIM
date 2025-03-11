import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"; 
import logo from "../assets/LOGO.png"; 
import Button from "../components/Button"; 
import "../styles/Navbar.css"; 
import { useAuth } from "../utils/authContext";
import { supabase } from "../supabaseClient";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState({
    checked: false,
    verified: false
  });
  const [showVerificationTooltip, setShowVerificationTooltip] = useState(false);

  // Check verification status when component mounts
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          setVerificationStatus({
            checked: true,
            verified: data?.email_verified || false
          });
        } catch (error) {
          console.error("Error checking verification status:", error);
          setVerificationStatus({
            checked: true,
            verified: false
          });
        }
      }
    };
    
    checkVerificationStatus();
  }, [user]);

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
  
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) throw error;
      
      // Show success message
      alert("Verification email has been resent. Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification:", error);
      alert("Could not resend verification email. Please try again later.");
    }
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Right: Avatar, Verification Status & Sign-out */}
      <div className="navbar-right">
        {verificationStatus.checked && (
          <div 
            className="verification-status"
            onMouseEnter={() => setShowVerificationTooltip(true)}
            onMouseLeave={() => setShowVerificationTooltip(false)}
          >
            {verificationStatus.verified ? (
              <FaCheckCircle className="verification-icon verified" />
            ) : (
              <FaExclamationTriangle className="verification-icon unverified" />
            )}
            
            {showVerificationTooltip && (
              <div className="verification-tooltip">
                {verificationStatus.verified ? (
                  <span>Your email is verified</span>
                ) : (
                  <div className="verification-tooltip-content">
                    <span>Your email is not verified</span>
                    <button className="resend-btn" onClick={handleResendVerification}>
                      Resend verification email
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <button className="avatar-button" onClick={handleProfileClick}>
          <FaUserCircle size={40} />
        </button>
        <Button variant="light" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </nav>
  );
};

export default Navbar;