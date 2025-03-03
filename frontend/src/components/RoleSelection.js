import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import logo from "../assets/LOGO.png";
import "../styles/RoleSelection.css";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Pass the selected role to the sign-up page
      navigate("/SignUp", { state: { role: selectedRole } });
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="logo-container">
          <img src={logo} alt="TALIM Logo" className="role-logo" />
        </div>
        
        <h1 className="role-title">Choose Your Role</h1>
        <p className="role-subtitle">Select how you'll use TALIM</p>
        
        <div className="roles-container">
          <div 
            className={`role-option ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <div className="role-icon student-icon">👨‍🎓</div>
            <h3>Student</h3>
            <p>Join courses, access learning materials, and track your progress</p>
          </div>
          
          <div 
            className={`role-option ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="role-icon teacher-icon">👨‍🏫</div>
            <h3>Teacher</h3>
            <p>Create courses, manage content, and interact with students</p>
          </div>
        </div>
        
        <div className="action-buttons">
          <Button 
            onClick={handleContinue} 
            variant="dark"
            disabled={!selectedRole}
          >
            Continue
          </Button>
          
          <div className="signin-redirect">
            <p>
              Already have an account?{" "}
              <span className="signin-link" onClick={() => navigate("/SignIn")}>
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;