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
          
          // Check if user has a profile
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Profile error:", profileError);
            }
              
            if (!profile) {
              console.log("New Google user, creating profile");
              
              // Create a profile for this Google user
              const newProfile = {
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                role: 'student', // Default role
                email_verified: true  // Google users are already verified
              };
              
              await supabase.from('profiles').insert(newProfile);
            }
            
            // Check if user has completed their details
            const { data: userDetails, error: detailsError } = await supabase
              .from('user_details')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (detailsError && detailsError.code !== 'PGRST116') {
              console.error("User details error:", detailsError);
            }
              
            if (!userDetails) {
              // User needs to complete profile
              navigate('/UserPersonalDetail', { 
                state: { 
                  isNewUser: true,
                  email: user.email,
                  userId: user.id,
                  role: profile ? profile.role : 'student'
                } 
              });
            } else {
              // Existing user with complete profile - redirect to appropriate dashboard
              const role = profile ? profile.role : 'student';
              navigate(role === 'student' ? '/StudentDashboard' : '/TeacherDashboard');
            }
          } catch (error) {
            console.error("Error checking user profile:", error);
            // If there's an error checking the profile, still try to navigate the user somewhere
            navigate('/UserPersonalDetail', { 
              state: { 
                isNewUser: true,
                email: user.email, 
                userId: user.id
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