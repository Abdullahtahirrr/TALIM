import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from "../assets/LOGO.png";
import "../styles/AuthCallback.css"; // Reusing existing styles

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const token_hash = queryParams.get('token_hash');
        const type = queryParams.get('type');
        
        if (!token_hash || type !== 'email') {
          setError('Invalid verification link');
          setVerifying(false);
          return;
        }
        
        // Verify the token with Supabase
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });
        
        if (verifyError) throw verifyError;
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          // Update the user's profile to mark email as verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', user.id);
          
          if (updateError) throw updateError;
        }
        
        setSuccess(true);
        setVerifying(false);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/SignIn', { 
            state: { message: 'Email verified successfully! You can now log in.' }
          });
        }, 3000);
        
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message);
        setVerifying(false);
      }
    };
    
    verifyEmail();
  }, [location, navigate]);
  
  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <div className="logo-container">
          <img src={logo} alt="TALIM Logo" className="auth-logo" />
        </div>
        
        <h2>{verifying ? 'Verifying your email...' : (success ? 'Email Verified!' : 'Email Verification')}</h2>
        
        {verifying ? (
          <div className="auth-loader"></div>
        ) : success ? (
          <>
            <div className="success-icon">✓</div>
            <p>Your email has been successfully verified.</p>
            <p>Redirecting to login page...</p>
          </>
        ) : (
          <>
            <p className="error-message">Error: {error}</p>
            <button 
              className="auth-callback-button" 
              onClick={() => navigate('/SignIn')}
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;