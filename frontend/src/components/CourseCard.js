import React from "react";
import "../styles/CourseCard.css"; 

const CourseCard = ({ image, instructor, university, title, onEnroll }) => {
  return (
    <div className="course-card">
      {/* Course Image */}
      <img src={image} alt={title} className="course-image" />

      {/* Course Details */}
      <div className="course-info">
        <h3 className="course-title">{title}</h3>
        <p className="instructor">{instructor} - {university}</p>
      </div>

      {/* Enroll Button */}
      <button className="enroll-btn" onClick={onEnroll}>
        Enroll
      </button>
    </div>
  );
};

export default CourseCard;
