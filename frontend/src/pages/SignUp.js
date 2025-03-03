import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import PersonalInfoModal from "../components/PersonalInfoModal";
import logo from "../assets/LOGO.png";
import "../styles/SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

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
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    
    // Show the personal info modal
    setShowPersonalInfoModal(true);
  };

  const navigateToSignIn = () => {
    navigate("/SignIn");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        {/* Left side with illustration */}
        <div className="illustration-container">
          {/* You'll need to add the rocket illustration image here */}
        </div>
      </div>
      
      <div className="signup-right">
        <div className="signup-header">
          <div className="logo-container">
            <img src={logo} alt="TALIM Logo" className="signup-logo" />
          </div>
          
          <div className="signin-link-container">
            <span className="signin-text">Already have an Account?</span>
            <button className="signin-button" onClick={navigateToSignIn}>Sign In</button>
          </div>
        </div>
        
        <div className="signup-form-container">
          <h1 className="signup-title">Create your account</h1>
          
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
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="name-fields">
              <div className="firstname-field">
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleChange({ target: { name: 'firstName', value: e.target.value } })}
                  error={errors.firstName}
                />
              </div>
              <div className="lastname-field">
                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange({ target: { name: 'lastName', value: e.target.value } })}
                  error={errors.lastName}
                />
              </div>
            </div>
            
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
            
            <div className="password-field-container">
              <InputField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange({ target: { name: 'confirmPassword', value: e.target.value } })}
                error={errors.confirmPassword}
              />
              <div className="password-toggle">
                <button type="button" onClick={toggleShowPassword} className="show-password-btn">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            <div className="button-container">
              <Button type="submit" variant="dark">
                Create Account →
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Personal Information Modal */}
      <PersonalInfoModal 
        isOpen={showPersonalInfoModal}
        onClose={() => setShowPersonalInfoModal(false)}
        userRole={activeRole}
        signupData={formData}
      />
    </div>
  );
};

export default SignUp;