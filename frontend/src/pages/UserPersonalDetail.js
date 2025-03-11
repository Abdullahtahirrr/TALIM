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
    degree: "",
    designation: "",
    domain: ""
  });
  
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState("student"); // Default to student
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  // Get role and form data from location state
  useEffect(() => {
    const fetchUserInfo = async () => {
      // Try to get user info from location state first
      if (location.state) {
        const { role, email, userId } = location.state;
        if (role) setUserRole(role);
        
        if (email && formData.universityEmail === "") {
          setFormData(prev => ({
            ...prev,
            universityEmail: email
          }));
        }
      }
      
      // If no user in location state, try to get from auth
      const userId = location.state?.userId || (user ? user.id : null);
      
      if (userId) {
        try {
          // Get profile information
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (profile) {
            setUserRole(profile.role || 'student');
            
            // Check verification status
            if (!profile.email_verified) {
              const createdAt = new Date(profile.created_at);
              const now = new Date();
              const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
              
              // Show warning if account is older than 1 hour
              if (hoursDiff > 1) {
                setShowVerificationWarning(true);
              }
            }
            
            // Pre-fill email from profile
            if (profile.email) {
              setFormData(prev => ({
                ...prev,
                universityEmail: profile.email
              }));
            }
          }
        } catch (error) {
          console.error("Error in user data fetch:", error);
        }
      }
    };
    
    fetchUserInfo();
  }, [location, user, formData.universityEmail]);

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
    
    // Designation validation (only for teachers)
    if (userRole === "teacher" && !formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }
    
    // Domain validation
    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required";
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
        .from('user_details')
        .upsert({
          id: userId,
          university_name: formData.universityName,
          university_email: formData.universityEmail,
          university_address: formData.universityAddress,
          phone_number: formData.phoneNumber,
          semester: userRole === "student" ? formData.semester : null,
          degree: formData.degree,
          designation: userRole === "teacher" ? formData.designation : null,
          domain: formData.domain,
          updated_at: new Date()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      // Check if the user's email is verified
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();
      
      navigate(userRole === "student" ? "/StudentDashboard" : "/TeacherDashboard", {
        state: { showVerificationWarning: profile && !profile.email_verified }
      });
      
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage(error.message);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.universityEmail
      });
      
      if (error) throw error;
      
      // Show success message
      alert("Verification email has been resent. Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification:", error);
      alert("Could not resend verification email. Please try again later.");
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
          
          {showVerificationWarning && (
            <div className="verification-warning">
              <p>Your email address has not been verified yet. Please check your inbox for a verification link.</p>
              <button className="resend-button" onClick={handleResendVerification}>
                Resend Verification Email
              </button>
            </div>
          )}
          
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
              name="universityName"
              value={formData.universityName}
              onChange={(e) => handleChange(e)}
              error={errors.universityName}
            />
            
            <InputField
              label="University Email"
              type="email"
              placeholder="Enter university email"
              name="universityEmail"
              value={formData.universityEmail}
              onChange={(e) => handleChange(e)}
              error={errors.universityEmail}
            />
            
            <InputField
              label="University Address"
              type="text"
              placeholder="Enter university address"
              name="universityAddress"
              value={formData.universityAddress}
              onChange={(e) => handleChange(e)}
              error={errors.universityAddress}
            />
            
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange(e)}
              error={errors.phoneNumber}
            />
            
            {userRole === "student" && (
              <InputField
                label="Semester"
                type="text"
                placeholder="Enter current semester"
                name="semester"
                value={formData.semester}
                onChange={(e) => handleChange(e)}
                error={errors.semester}
              />
            )}
            
            <InputField
              label="Degree"
              type="text"
              placeholder="Enter degree program"
              name="degree"
              value={formData.degree}
              onChange={(e) => handleChange(e)}
              error={errors.degree}
            />
            
            {userRole === "teacher" && (
              <InputField
                label="Designation"
                type="text"
                placeholder="Enter your designation"
                name="designation"
                value={formData.designation}
                onChange={(e) => handleChange(e)}
                error={errors.designation}
              />
            )}
            
            <InputField
              label="Domain"
              type="text"
              placeholder="Enter your domain/field"
              name="domain"
              value={formData.domain}
              onChange={(e) => handleChange(e)}
              error={errors.domain}
            />
            
            <div className="button-container">
              <Button type="submit" variant="dark" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Account →"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetail;