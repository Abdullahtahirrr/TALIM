import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import PersonalInfoModal from "../components/PersonalInfoModal";
import logo from "../assets/LOGO.png";
import "../styles/SignUp.css";
import { useAuth } from "../utils/authContext"; 
import { supabase } from '../supabaseClient';
import ErrorDialogBox from "../components/ErrorDialogBox"; 

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth(); // Use the auth context
  
  // Get role from location state if provided (from RoleSelection page)
  const initialRole = location.state?.role || "student";
  const [activeRole, setActiveRole] = useState(initialRole);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
} else if (formData.password.length < 8) {
  newErrors.password = "Password must be at least 8 characters long";
} else if (!/[A-Z]/.test(formData.password)) {
  newErrors.password = "Password must contain at least one uppercase letter";
} else if (!/[a-z]/.test(formData.password)) {
  newErrors.password = "Password must contain at least one lowercase letter";
} else if (!/[0-9]/.test(formData.password)) {
  newErrors.password = "Password must contain at least one digit";
} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
  newErrors.password = "Password must contain at least one special character";
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
    
    setIsLoading(true);
    
    try {
      // First, check if the email already exists
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .limit(1);
        
      if (profileCheckError) {
        console.error("Error checking existing profiles:", profileCheckError);
      }
      
      // If email already exists, show error
      if (existingProfiles && existingProfiles.length > 0) {
        setErrorMessage("This email is already registered. Please sign in or use a different email.");
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }
      
      // Register user with Supabase
      const { data, error } = await signUp({
        email: formData.email, 
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: activeRole
          }
        }
      });
      
      if (error) {
        setErrorMessage(error.message || "Error creating account");
        setShowErrorDialog(true);
      } else {
        // Store the entire user data object
        console.log("User created:", data.user);
        setUserData(data.user);
        
        // Show the personal info modal
        setShowPersonalInfoModal(true);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("An unexpected error occurred");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigate("/SignIn");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePersonalInfoClose = () => {
    setShowPersonalInfoModal(false);
    
    // Navigate to SignIn with verification message
    navigate("/SignIn", {
      state: { 
        message: "Account created successfully! Please check your email to verify your account before signing in."
      }
    });
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
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
              </div>
              <div className="lastname-field">
                <InputField
                  label="Last Name"
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
              </div>
            </div>
            
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
            
            <div className="password-field-container">
              <InputField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
              <div className="password-toggle">
                <button type="button" onClick={toggleShowPassword} className="show-password-btn">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            <div className="button-container">
              <Button type="submit" variant="dark" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account →"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Personal Information Modal */}
      <PersonalInfoModal 
        isOpen={showPersonalInfoModal}
        onClose={handlePersonalInfoClose}
        userRole={activeRole}
        signupData={formData}
        userData={userData}
      />
      
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

export default SignUp;