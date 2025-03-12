import React, { useState } from "react";
import "../styles/CourseCard.css";
import courseImage1 from "../assets/course_image.jpeg";

const CourseCard = ({ image, instructor, university, title, buttonText, onButtonClick }) => {
  // State to track image loading errors
  const [imgSrc, setImgSrc] = useState(image || courseImage1);
  
  // Handle image loading errors
  const handleImageError = () => {
    if (imgSrc !== courseImage1) {
      console.log(`Image failed to load: ${imgSrc}, falling back to default`);
      setImgSrc(courseImage1);
    }
  };
  
  return (
    <div className="course-card">
      {/* Course Image with fallback */}
      <img 
        src={imgSrc} 
        alt={title} 
        className="course-image" 
        onError={handleImageError}
      />

      {/* Course Details */}
      <div className="course-info">
        <h3 className="course-title">{title}</h3>
        <p className="instructor">{instructor} - {university}</p>
      </div>

      {/* Dynamic Button */}
      <button className="enroll-btn" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default CourseCard;