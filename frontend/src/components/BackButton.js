import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/BackButton.css';

const BackButton = ({ 
  onClick, 
  to = '/StudentMyCourses', 
  variant = 'default', 
  className = '', 
  children = 'Back to Courses' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`elegant-back-button ${variant} ${className}`}
    >
      <FaArrowLeft className="back-icon" />
      <span className="back-text">{children}</span>
      <div className="button-overlay"></div>
    </button>
  );
};

export default BackButton;