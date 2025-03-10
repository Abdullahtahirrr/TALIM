import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/AuthCallback.css';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          console.log("User authenticated:", user);
          
          // Check if user has a profile in your database
          // You'll need to create this table in your Supabase project
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              // PGRST116 is "row not found" error - that's expected for new users
              console.error("Profile error:", profileError);
            }
              
            if (!profile) {
              console.log("New user, redirecting to personal details");
              // First-time user - redirect to complete profile setup
              navigate('/UserPersonalDetail', { 
                state: { 
                  isNewUser: true,
                  email: user.email 
                } 
              });
            } else {
              console.log("Existing user, redirecting to dashboard");
              // Existing user - redirect to appropriate dashboard
              navigate(profile.role === 'student' ? '/StudentDashboard' : '/TeacherDashboard');
            }
          } catch (error) {
            console.error("Error checking user profile:", error);
            // If there's an error checking the profile, still try to navigate the user somewhere
            navigate('/UserPersonalDetail', { 
              state: { 
                isNewUser: true,
                email: user.email 
              } 
            });
          }
        } else {
          console.log("No user found, redirecting to sign in");
          // No user found - redirect to sign in
          navigate('/SignIn');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    handleAuthCallback();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-content">
          <h2>Completing sign in...</h2>
          <div className="auth-loader"></div>
          <p>Please wait while we process your authentication.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-content">
          <h2>Authentication Error</h2>
          <p>There was a problem completing your sign in: {error}</p>
          <button 
            className="auth-callback-button" 
            onClick={() => navigate('/SignIn')}
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default AuthCallback;