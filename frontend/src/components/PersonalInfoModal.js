import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { supabase } from "../supabaseClient";
import "../styles/PersonalInfoModal.css";

const PersonalInfoModal = ({ isOpen, onClose, userRole, signupData, userData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    universityName: "",
    universityEmail: signupData?.email || "",
    universityAddress: "",
    phoneNumber: "",
    semester: "",
    degree: "",
    designation: "",
    domain: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Fixed handleChange function to properly accept input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data with new value
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
    
    try {
      // Use the userData that was passed directly from the SignUp component
      if (!userData || !userData.id) {
        throw new Error("User data is missing or incomplete. Please try signing up again.");
      }
      
      console.log("Using user ID:", userData.id);
      
      // First, check if the profile was created during signup, if not, create it
      try {
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userData.id)
          .single();
        
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileCheckError);
        }
        
        // If profile doesn't exist, create it
        if (!existingProfile) {
          const profileData = {
            id: userData.id,
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            email: signupData.email,
            role: userRole,
            email_verified: false
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
          
          if (profileError) throw profileError;
        }
      } catch (profileError) {
        console.error("Error handling profile:", profileError);
        // Continue anyway to try to create user details
      }
      
      // Save details to user_details table
      const userDetails = {
        id: userData.id,
        university_name: formData.universityName,
        university_email: formData.universityEmail,
        university_address: formData.universityAddress,
        phone_number: formData.phoneNumber,
        semester: userRole === "student" ? formData.semester : null,
        degree: formData.degree,
        designation: userRole === "teacher" ? formData.designation : null,
        domain: formData.domain
      };
      
      console.log("Inserting user details:", userDetails);
      
      const { error: detailsError } = await supabase
        .from('user_details')
        .insert(userDetails);
      
      if (detailsError) {
        console.error("Details insert error:", detailsError);
        throw detailsError;
      }
      
      // Close the modal and continue with signup flow
      onClose();
      
    } catch (error) {
      console.error("Error saving user details:", error);
      alert("There was an error saving your information: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="personal-info-modal" onClick={(e) => e.stopPropagation()}>
        <h1 className="modal-title">PERSONAL INFORMATION</h1>
        
        <p className="modal-description">
          Complete your profile to continue. You'll be able to use the platform immediately,
          but please verify your email within 24 hours.
        </p>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <InputField
            label="University Name"
            type="text"
            placeholder="Your university name"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            error={errors.universityName}
          />
          
          <InputField
            label="University Email"
            type="email"
            placeholder="Your university email"
            name="universityEmail"
            value={formData.universityEmail}
            onChange={handleChange}
            error={errors.universityEmail}
          />
          
          <InputField
            label="University Address"
            type="text"
            placeholder="University address"
            name="universityAddress"
            value={formData.universityAddress}
            onChange={handleChange}
            error={errors.universityAddress}
          />
          
          <InputField
            label="Phone Number"
            type="tel"
            placeholder="Your phone number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
          />
          
          {userRole === "student" ? (
            <InputField
              label="Semester"
              type="text"
              placeholder="Current semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              error={errors.semester}
            />
          ) : (
            <InputField
              label="Designation"
              type="text"
              placeholder="Your designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
            />
          )}
          
          <InputField
            label="Degree"
            type="text"
            placeholder="Your degree program"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            error={errors.degree}
          />
          
          <InputField
            label="Domain"
            type="text"
            placeholder="Your domain of expertise"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            error={errors.domain}
          />
          
          <div className="button-container">
            <Button type="submit" variant="dark" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete Profile →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoModal;