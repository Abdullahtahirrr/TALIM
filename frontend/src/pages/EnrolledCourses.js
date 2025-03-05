import React, { useState } from "react";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import Button from "../components/Button";
import { FaArrowLeft } from "react-icons/fa";
import courseImage from "../assets/course_image.jpeg";
import "../styles/EnrolledCourses.css";

const EnrolledCourses = () => {
  // State for courses data
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Deep Learning",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
    {
      id: 2,
      title: "Deep Learning",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
    {
      id: 3,
      title: "Deep Learning",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
  ]);

  // State for enrollment dialog
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Handle enrollment button click
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setEnrollmentKey("");
    setErrorMessage("");
    setIsEnrollDialogOpen(true);
  };

  // Handle back button click
  const handleBackClick = () => {
    window.history.back();
  };

  // Handle enrollment submission
  const handleEnrollSubmit = () => {
    // This would typically verify with a backend API
    const correctKey = "123456"; // Example key
    
    if (enrollmentKey === correctKey) {
      // Redirect to course content page
      window.location.href = `/StudentCourseContent?courseId=${selectedCourse.id}`;
    } else {
      setErrorMessage("Incorrect enrollment key. Please try again.");
    }
  };

  // Render enrollment dialog content
  const renderEnrollmentDialogContent = () => (
    <div className="enrollment-dialog-content">
      <p>Please enter the enrollment key to access this course.</p>
      <input
        type="text"
        value={enrollmentKey}
        onChange={(e) => setEnrollmentKey(e.target.value)}
        placeholder="Enrollment Key"
        className="enrollment-key-input"
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="enrollment-actions">
        <Button variant="dark" onClick={handleEnrollSubmit}>
          Enroll
        </Button>
      </div>
    </div>
  );

  return (
    <div className="enrolled-courses-page">
      <Navbar />
      
      <div className="enrolled-courses-content">
        <div className="header-section">
          <button className="back-button" onClick={handleBackClick}>
            <FaArrowLeft />
          </button>
          <h1>COURSES</h1>
        </div>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>
        
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              image={course.image}
              title={course.title}
              instructor={course.instructor}
              university={course.university}
              buttonText="Enroll"
              onButtonClick={() => handleEnrollClick(course)}
            />
          ))}
        </div>
      </div>
      
      <SimpleFooter />
      
      {/* Enrollment Dialog */}
      <DialogBox
        isOpen={isEnrollDialogOpen}
        title={selectedCourse ? `${selectedCourse.title} - Enrollment` : "Course Enrollment"}
        onClose={() => setIsEnrollDialogOpen(false)}
      >
        {renderEnrollmentDialogContent()}
      </DialogBox>
    </div>
  );
};

export default EnrolledCourses;