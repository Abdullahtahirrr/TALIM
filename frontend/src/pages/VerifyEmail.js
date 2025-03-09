// src/pages/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Your Supabase client

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
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
        // This must be done on the client side
        await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });
        
        // Success! Redirect to login or dashboard
        navigate('/SignIn', { 
          state: { message: 'Email verified successfully! You can now log in.' }
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setVerifying(false);
      }
    };
    
    verifyEmail();
  }, [location, navigate]);
  
  return (
    <div>
      <h1>Email Verification</h1>
      {verifying ? (
        <p>Verifying your email...</p>
      ) : error ? (
        <div>
          <p>Error: {error}</p>
          <button onClick={() => navigate('/SignUp')}>Back to Sign Up</button>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyEmail;