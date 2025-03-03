import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "../styles/PersonalInfoModal.css";

const PersonalInfoModal = ({ isOpen, onClose, userRole, signupData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    universityName: "",
    universityAddress: "",
    semester: "",
    designation: "",
    domain: ""
  });
  
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

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
    
    // University Address validation
    if (!formData.universityAddress.trim()) {
      newErrors.universityAddress = "University address is required";
    }
    
    // Semester/Designation validation
    if (userRole === "student" && !formData.semester.trim()) {
      newErrors.semester = "Semester is required";
    } else if (userRole === "teacher" && !formData.designation.trim()) {
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
    
    // Combine the signup data with personal info
    const completeUserData = {
      ...signupData,
      ...formData
    };
    
    console.log("Complete user data:", completeUserData);
    
    // Navigate to appropriate dashboard based on role
    if (userRole === "student") {
      navigate("/StudentDashboard");
    } else {
      navigate("/TeacherDashboard");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="personal-info-modal" onClick={(e) => e.stopPropagation()}>
        <h1 className="modal-title">PERSONAL INFORMATION</h1>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <InputField
            label="University Name"
            type="text"
            placeholder="University Name"
            value={formData.universityName}
            onChange={(e) => handleChange({ target: { name: 'universityName', value: e.target.value } })}
            error={errors.universityName}
          />
          
          <InputField
            label="University Address"
            type="text"
            placeholder="University Address"
            value={formData.universityAddress}
            onChange={(e) => handleChange({ target: { name: 'universityAddress', value: e.target.value } })}
            error={errors.universityAddress}
          />
          
          {userRole === "student" ? (
            <InputField
              label="Semester"
              type="text"
              placeholder="Semester"
              value={formData.semester}
              onChange={(e) => handleChange({ target: { name: 'semester', value: e.target.value } })}
              error={errors.semester}
            />
          ) : (
            <InputField
              label="Designation"
              type="text"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) => handleChange({ target: { name: 'designation', value: e.target.value } })}
              error={errors.designation}
            />
          )}
          
          <InputField
            label="Domain"
            type="text"
            placeholder="Domain"
            value={formData.domain}
            onChange={(e) => handleChange({ target: { name: 'domain', value: e.target.value } })}
            error={errors.domain}
          />
          
          <div className="button-container">
            <Button type="submit" variant="dark">
              Create Account →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoModal;