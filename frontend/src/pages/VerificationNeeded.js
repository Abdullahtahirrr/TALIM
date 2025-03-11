import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../utils/authContext';
import logo from "../assets/LOGO.png";
import "../styles/AuthCallback.css"; // Reuse existing styles

const VerificationNeeded = () => {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const getEmail = async () => {
      if (user) {
        setEmail(user.email);
      } else {
        // If no user, redirect to login
        navigate('/SignIn');
      }
    };
    
    getEmail();
  }, [user, navigate]);
  
  const handleResendVerification = async () => {
    if (!email) return;
    
    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      
      setSuccessMessage('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      console.error("Error resending verification:", error);
      setErrorMessage('Could not resend verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/SignIn');
  };
  
  const checkVerification = async () => {
    if (!user) return;
    
    try {
      // Get the current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (currentUser) {
        // Check if email is verified in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('id', currentUser.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.email_verified) {
          // Email is now verified, redirect to dashboard
          navigate('/StudentDashboard'); // Default to student dashboard
        } else {
          setErrorMessage('Your email is not verified yet. Please check your inbox.');
        }
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      setErrorMessage('Could not check verification status. Please try again later.');
    }
  };
  
  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <div className="logo-container">
          <img src={logo} alt="TALIM Logo" className="auth-logo" />
        </div>
        
        <h2>Email Verification Required</h2>
        
        <div className="verification-message">
          <p>Your account requires email verification to continue.</p>
          <p>We've sent a verification link to <strong>{email}</strong></p>
          <p>Please check your inbox and click the link to verify your account.</p>
        </div>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <div className="verification-actions">
          <button 
            className="verification-button primary" 
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
          
          <button 
            className="verification-button secondary" 
            onClick={checkVerification}
          >
            I've Verified My Email
          </button>
          
          <button 
            className="verification-button tertiary" 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationNeeded;