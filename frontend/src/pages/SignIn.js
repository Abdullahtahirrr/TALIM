import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import logo from "../assets/LOGO.png";
import "../styles/SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
    
    // Navigate to appropriate dashboard based on role
    if (activeRole === "student") {
      navigate("/StudentDashboard");
    } else {
      navigate("/TeacherDashboard");
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
      // Get the Google auth URL from your backend
      const response = await fetch('http://localhost:5000/api/auth/google/url');
      const data = await response.json();
      
      // Redirect the user to Google's authentication page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error starting Google authentication:', error);
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
            
            <div className="button-container">
              <Button type="submit" variant="dark">
                Sign In →
              </Button>
            <div className="social-login">
              <p>Or sign in with:</p>
              <button onClick={handleGoogleSignIn}>
              Sign in with Google
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;