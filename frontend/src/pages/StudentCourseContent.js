import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/StudentCourseContent.css";

// Sample data - replace with API calls in production
const SAMPLE_COURSE = {
  id: "ai-101",
  title: "Artificial Intelligence Course",
  instructor: "Seemab Latif",
  lessons: [
    {
      id: "lesson-1",
      title: "Introduction to AI",
      instructor: "Seemab Latif",
      resources: [
        { type: "Lecture Slides", url: "#" },
        { type: "Lecture Notes", url: "#" }
      ],
      image: "https://via.placeholder.com/150"
    },
    {
      id: "lesson-2",
      title: "AI Intelligence",
      instructor: "Seemab Latif",
      resources: [
        { type: "Lecture Slides", url: "#" }
      ],
      image: "https://via.placeholder.com/150"
    },
    {
      id: "lesson-3",
      title: "Future of AI",
      instructor: "Seemab Latif",
      resources: [
        { type: "Lecture Slides", url: "#" }
      ],
      image: "https://via.placeholder.com/150"
    }
  ]
};

const StudentCourseContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch the specific course by ID
    // For now, we'll use the sample data
    setCourse(SAMPLE_COURSE);
    setLoading(false);
  }, [courseId]);

  const goBack = () => {
    navigate("/StudentDashboard");
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  if (loading) {
    return <div className="loading">Loading course content...</div>;
  }

  if (!course) {
    return <div className="error">Course not found</div>;
  }

  return (
    <div className="course-content-page">
      <Navbar />
      
      <div className="course-content-container">
        
        
        <div className="course-header">
          <h1>{course.title}</h1>
        </div>
        <div className="breadcrumb">
          
          <div className="breadcrumb-links">
            <Link to="/StudentDashboard" onClick={goBack}>Dashboard</Link> / <span>{course.title}</span>
          </div>
        </div>
        
        <div className="lessons-section">
            <button className="back-button" onClick={goBack}>
            <FaArrowLeft /> <span> Course</span>
          </button>
          {/* <h3>COURSE</h3> */}
          
          <div className="lessons-list">
            {course.lessons.map((lesson) => (
              <div className="lesson-card" key={lesson.id}>
                <div className="lesson-image">
                  <img src={lesson.image} alt={lesson.title} />
                </div>
                <div className="lesson-details">
                  <h3>{lesson.title}</h3>
                  <p className="instructor">Created by: {lesson.instructor}</p>
                </div>
                <div className="lesson-resources">
                  {lesson.resources.map((resource, index) => (
                    <a 
                      key={index} 
                      href={resource.url} 
                      className="resource-link"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {resource.type}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot toggle button */}
      <div className="chatbot-toggle" onClick={toggleChatbot}>
        <div className="chat-bubble">
          {showChatbot && (
            <div className="chatbot-popup">
              <p className="chatbot-message">Hey There! Do you have any questions?</p>
            </div>
          )}
          <div className="chat-icon">
            <span>💬</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseContent;