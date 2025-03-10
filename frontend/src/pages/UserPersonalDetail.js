import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import logo from "../assets/LOGO.png";
import "../styles/UserPersonalDetails.css";
import { supabase } from "../supabaseClient";
import { useAuth } from "../utils/authContext";

const UserPersonalDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    universityName: "",
    universityEmail: "",
    universityAddress: "",
    phoneNumber: "",
    semester: "",
    degree: ""
  });
  
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState("student"); // Default to student
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get role and form data from location state (passed from SignUp or AuthCallback)
  useEffect(() => {
    if (location.state) {
      const { role, isNewUser, email } = location.state;
      if (role) setUserRole(role);
      
      // For Google auth users, we may have their email from the auth process
      if (email && formData.universityEmail === "") {
        setFormData(prev => ({
          ...prev,
          universityEmail: email
        }));
      }
    }
  }, [location, formData.universityEmail]);

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
    
    // University Name validation
    if (!formData.universityName.trim()) {
      newErrors.universityName = "University name is required";
    }
    
    // University Email validation
    if (!formData.universityEmail.trim()) {
      newErrors.universityEmail = "University email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.universityEmail)) {
      newErrors.universityEmail = "Email is invalid";
    }
    
    // University Address validation
    if (!formData.universityAddress.trim()) {
      newErrors.universityAddress = "University address is required";
    }
    
    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    
    // Semester validation (only for students)
    if (userRole === "student" && !formData.semester.trim()) {
      newErrors.semester = "Semester is required";
    }
    
    // Degree validation
    if (!formData.degree.trim()) {
      newErrors.degree = "Degree is required";
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
    
    setIsSubmitting(true);
    setShowError(false);
    
    try {
      // Get current user ID
      const userId = user ? user.id : location.state?.userId;
      
      if (!userId) {
        throw new Error("User not found. Please sign in again.");
      }
      
      // Save user profile data to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          university_name: formData.universityName,
          university_email: formData.universityEmail,
          university_address: formData.universityAddress,
          phone_number: formData.phoneNumber,
          semester: formData.semester,
          degree: formData.degree,
          role: userRole,
          updated_at: new Date()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      // Navigate to appropriate dashboard based on role
      navigate(userRole === "student" ? "/StudentDashboard" : "/TeacherDashboard");
      
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage(error.message);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    navigate("/SignIn");
  };

  return (
    <div className="personal-details-container">
      <div className="details-header">
        <div className="logo-container">
          <img src={logo} alt="TALIM Logo" className="logo" />
        </div>
        
        <div className="signout-container">
          <span className="header-text">Already have an account?</span>
          <button className="signout-button" onClick={handleSignOut}>Sign In</button>
        </div>
      </div>
      
      <div className="details-modal-wrapper">
        <div className="details-modal">
          <h1 className="details-title">PERSONAL INFORMATION</h1>
          
          {showError && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
          <form className="details-form" onSubmit={handleSubmit}>
            <InputField
              label="University Name"
              type="text"
              placeholder="Enter university name"
              value={formData.universityName}
              onChange={(e) => handleChange({ target: { name: 'universityName', value: e.target.value } })}
              error={errors.universityName}
            />
            
            <InputField
              label="University Email"
              type="email"
              placeholder="Enter university email"
              value={formData.universityEmail}
              onChange={(e) => handleChange({ target: { name: 'universityEmail', value: e.target.value } })}
              error={errors.universityEmail}
            />
            
            <InputField
              label="University Address"
              type="text"
              placeholder="Enter university address"
              value={formData.universityAddress}
              onChange={(e) => handleChange({ target: { name: 'universityAddress', value: e.target.value } })}
              error={errors.universityAddress}
            />
            
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange({ target: { name: 'phoneNumber', value: e.target.value } })}
              error={errors.phoneNumber}
            />
            
            {userRole === "student" && (
              <InputField
                label="Semester"
                type="text"
                placeholder="Enter current semester"
                value={formData.semester}
                onChange={(e) => handleChange({ target: { name: 'semester', value: e.target.value } })}
                error={errors.semester}
              />
            )}
            
            <InputField
              label="Degree"
              type="text"
              placeholder="Enter degree program"
              value={formData.degree}
              onChange={(e) => handleChange({ target: { name: 'degree', value: e.target.value } })}
              error={errors.degree}
            />
            
            <div className="button-container">
              <Button type="submit" variant="dark" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account →"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetail;