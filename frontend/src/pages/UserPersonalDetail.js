import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import logo from "../assets/LOGO.png";
import "../styles/UserPersonalDetails.css";

const UserPersonalDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Get role and form data from location state (passed from SignUp)
  useEffect(() => {
    if (location.state) {
      const { role, formData: signupData } = location.state;
      setUserRole(role || "student");
      
      // You could save the signup data if needed
      console.log("Signup data:", signupData);
    }
  }, [location]);

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
    
    // Navigate to appropriate dashboard based on role
    if (userRole === "student") {
      navigate("/StudentDashboard");
    } else {
      navigate("/TeacherDashboard");
    }
  };

  const handleSignOut = () => {
    navigate("/SignUp");
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
              <Button type="submit" variant="dark">
                Create Account →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetail;