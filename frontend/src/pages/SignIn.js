import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import logo from "../assets/LOGO.png";
import "../styles/SignIn.css";
import { useAuth } from "../utils/authContext";
import { supabase } from '../supabaseClient';
import ErrorDialogBox from "../components/ErrorDialogBox";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, signOut } = useAuth();
  const [activeRole, setActiveRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for existing session on page load
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, redirect to appropriate dashboard
        try {
          // Get user's role from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) throw profileError;
          
          // Redirect based on role
          const role = profile?.role || 'student';
          navigate(role === 'student' ? '/StudentDashboard' : '/TeacherDashboard', { replace: true });
        } catch (err) {
          console.error("Error checking user profile:", err);
          // Default to student dashboard if can't determine role
          navigate('/StudentDashboard', { replace: true });
        }
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  // Check for success message from redirects (like email verification)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, check if the email exists and matches the selected role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', formData.email)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "row not found" error, which means email not registered
        console.error("Error checking profile:", profileError);
      }
      
      // If profile exists but role doesn't match
      if (profileData && profileData.role !== activeRole) {
        setErrorMessage(`This email is registered as a ${profileData.role}. Please select the correct role.`);
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }
      
      // If everything is fine, proceed with sign in
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrorMessage(error.message || "Invalid email or password");
        setShowErrorDialog(true);
      } else {
        // Get user profile to check verification status and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }
        
        // Confirm role matches what user selected
        if (profile && profile.role !== activeRole) {
          // Log user out, since they signed in with wrong role
          await signOut();
          setErrorMessage(`This account is registered as a ${profile.role}. Please select the correct role to sign in.`);
          setShowErrorDialog(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user details are completed
        const { data: userDetails, error: detailsError } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (detailsError && detailsError.code !== 'PGRST116') {
          console.error("Error fetching user details:", detailsError);
        }
        
        // Route user based on profile status
        if (!userDetails) {
          // User needs to complete profile
          navigate('/UserPersonalDetail', {
            state: {
              userId: data.user.id,
              email: data.user.email,
              role: profile ? profile.role : activeRole
            }
          });
        } else {
          // Check if email is verified
          if (profile && !profile.email_verified) {
            // Allow access but show a warning about verification
            // This is our hybrid approach - allowing access but reminding about verification
            const role = profile.role || activeRole;
            navigate(role === 'student' ? '/StudentDashboard' : '/TeacherDashboard', {
              state: { showVerificationWarning: true }
            });
          } else {
            // Fully verified user with completed profile
            const role = profile ? profile.role : activeRole;
            navigate(role === 'student' ? '/StudentDashboard' : '/TeacherDashboard');
          }
        }
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setErrorMessage("An unexpected error occurred");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    navigate("/SignUp");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        setErrorMessage(error.message || "Could not sign in with Google");
        setShowErrorDialog(true);
      }
      // The redirect will be handled by Supabase and your AuthCallback component
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setShowErrorDialog(true);
    }
  };
  
  const handleResendVerification = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });
      
      if (error) throw error;
      
      setSuccessMessage("Verification email has been resent. Please check your inbox.");
    } catch (err) {
      setErrorMessage("Could not resend verification email. Please try again later.");
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-left">
        {/* Left side with illustration */}
        <div className="illustration-container">
          {/* You'll need to add the computer illustration image here */}
        </div>
      </div>
      
      <div className="signin-right">
        <div className="signin-header">
          <div className="logo-container">
            <img src={logo} alt="TALIM Logo" className="signin-logo" />
          </div>
          
          <div className="signup-link-container">
            <span className="signup-text">Don't have an account?</span>
            <button className="signup-button" onClick={navigateToSignUp}>Create Account</button>
          </div>
        </div>
        
        <div className="signin-form-container">
          <h1 className="signin-title">Sign in to your account</h1>
          
          {/* Success message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          <div className="role-toggle">
            <button 
              className={`role-button ${activeRole === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              Student
            </button>
            <button 
              className={`role-button ${activeRole === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleChange('teacher')}
            >
              Teacher
            </button>
          </div>
          
          <form className="signin-form" onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <div className="password-field-container">
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <div className="password-toggle">
                <button type="button" onClick={toggleShowPassword} className="show-password-btn">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <div className="forgot-password">
                <div className="password-options">
                  <span className="forgot-pw-link">Forgot password?</span>
                  <span className="verification-link" onClick={handleResendVerification}>
                    Resend verification email
                  </span>
                </div>
              </div>
            </div>
            
            {/* Primary Sign In Button */}
            <div className="button-container">
              <Button type="submit" variant="dark" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In →"}
              </Button>
            </div>
            
            {/* Divider */}
            <div className="auth-divider">
              <span>Or sign in with:</span>
            </div>
            
            {/* Google Sign In */}
            <div className="social-login-container">
              <button 
                type="button" 
                className="google-signin-button" 
                onClick={handleGoogleSignIn}
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Google logo" 
                />
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Error Dialog */}
      {showErrorDialog && (
        <ErrorDialogBox 
          isOpen={showErrorDialog}
          title="Error"
          message={errorMessage}
          onClose={() => setShowErrorDialog(false)}
        />
      )}
    </div>
  );
};

export default SignIn;