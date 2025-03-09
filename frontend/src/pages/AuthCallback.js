// src/pages/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get query parameters
        const queryParams = Object.fromEntries(
          new URLSearchParams(location.search)
        );
        
        // Send the query params to your backend
        const response = await fetch('http://localhost:5000/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ queryParams })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store user data and tokens
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.session.access_token);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    handleCallback();
  }, [location, navigate]);
  
  return (
    <div>
      <h1>Signing you in...</h1>
      {loading ? (
        <p>Please wait while we complete your sign-in.</p>
      ) : error ? (
        <div>
          <p>Error: {error}</p>
          <button onClick={() => navigate('/signin')}>Back to Sign In</button>
        </div>
      ) : null}
    </div>
  );
};

export default AuthCallback;