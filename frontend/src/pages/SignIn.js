import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import logo from "../assets/LOGO.png";
import "../styles/SignIn.css";
import { useAuth } from "../utils/authContext"; // Import auth context
import ErrorDialogBox from "../components/ErrorDialogBox"; // You may need to create this component

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth(); // Use the auth context
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
      // Sign in with Supabase
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrorMessage(error.message || "Invalid email or password");
        setShowErrorDialog(true);
      } else {
        // Navigate to appropriate dashboard based on role
        if (activeRole === "student") {
          navigate("/StudentDashboard");
        } else {
          navigate("/TeacherDashboard");
        }
      }
    } catch (err) {
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
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
              error={errors.email}
            />
            
            <div className="password-field-container">
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
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
                <span>Forgot password?</span>
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