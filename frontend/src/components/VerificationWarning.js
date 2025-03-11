import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/VerificationWarning.css";

const VerificationWarning = ({ email, onDismiss }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setSending(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      
      setSent(true);
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 5000); // Auto-dismiss after 5 seconds
      
    } catch (err) {
      console.error("Error resending verification:", err);
      setError("Could not resend verification email. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verification-warning-container">
      <div className="verification-warning-content">
        <div className="verification-icon">⚠️</div>
        
        <div className="verification-message">
          {sent ? (
            <p className="success-text">Verification email sent! Please check your inbox.</p>
          ) : (
            <>
              <p>Your email address has not been verified yet.</p>
              <p className="warning-text">Please verify your email to ensure continued access to all features.</p>
              
              {error && <p className="error-text">{error}</p>}
              
              <button 
                className="resend-verification-btn" 
                onClick={handleResendVerification}
                disabled={sending}
              >
                {sending ? "Sending..." : "Resend Verification Email"}
              </button>
            </>
          )}
        </div>
        
        <button className="dismiss-btn" onClick={onDismiss}>
          {sent ? "Close" : "Dismiss"}
        </button>
      </div>
    </div>
  );
};

export default VerificationWarning;