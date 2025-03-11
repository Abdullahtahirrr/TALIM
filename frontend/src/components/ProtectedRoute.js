import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { supabase } from '../supabaseClient';

// Enhanced ProtectedRoute component with verification time check
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [verified, setVerified] = useState(true); // Assume verified initially
  const [checkingVerification, setCheckingVerification] = useState(true);
  
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user) {
        try {
          // Get profile data including verification status and creation date
          const { data, error } = await supabase
            .from('profiles')
            .select('email_verified, created_at')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // If email is verified, all good
            if (data.email_verified) {
              setVerified(true);
            } else {
              // Check how long ago the account was created
              const createdAt = new Date(data.created_at);
              const now = new Date();
              const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
              
              // If more than 24 hours and not verified, restrict access
              if (hoursDiff > 24) {
                setVerified(false);
              } else {
                // Less than 24 hours, allow access but warning will be shown in app
                setVerified(true);
              }
            }
          }
        } catch (error) {
          console.error("Error checking verification:", error);
          // Default to allowing access if there's an error
          setVerified(true);
        } finally {
          setCheckingVerification(false);
        }
      } else {
        setCheckingVerification(false);
      }
    };
    
    if (!loading && user) {
      checkEmailVerification();
    } else if (!loading) {
      setCheckingVerification(false);
    }
  }, [user, loading]);
  
  if (loading || checkingVerification) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/SignIn" />;
  }
  
  if (!verified) {
    return <Navigate to="/verify-needed" />;
  }
  
  return children;
};

export default ProtectedRoute;