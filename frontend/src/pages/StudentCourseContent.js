// src/pages/StudentCourseContent.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import { FaArrowLeft, FaRobot, FaBook, FaFileAlt, FaPlayCircle } from "react-icons/fa";
import { getCourseDetails } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import "../styles/StudentCourseContent.css";

const StudentCourseContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatbotHint, setShowChatbotHint] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // Sample data for fallback
  const SAMPLE_COURSE = {
    id: courseId || "ai-101",
    title: "Artificial Intelligence Course",
    instructor: "Seemab Latif",
    description: "Learn the fundamentals of artificial intelligence, machine learning algorithms, and practical applications in various industries. This comprehensive course covers everything from basic concepts to advanced techniques.",
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to AI",
        instructor: "Seemab Latif",
        resources: [
          { type: "Lecture Slides", url: "#", icon: FaFileAlt },
          { type: "Lecture Notes", url: "#", icon: FaBook }
        ],
        image: courseImage1
      },
      {
        id: "lesson-2",
        title: "AI Intelligence",
        instructor: "Seemab Latif",
        resources: [
          { type: "Lecture Slides", url: "#", icon: FaFileAlt },
          { type: "Lecture Notes", url: "#", icon: FaBook },
        ],
        image: courseImage1
      },
      {
        id: "lesson-3",
        title: "Future of AI",
        instructor: "Seemab Latif",
        resources: [
          { type: "Lecture Slides", url: "#", icon: FaFileAlt },
          { type: "Lecture Notes", url: "#", icon: FaBook }
        ],
        image: courseImage1
      }
    ]
  };

 // In StudentCourseContent.js - add detailed logging
useEffect(() => {
  const fetchCourseDetails = async () => {
    try {
      if (courseId && user) {
        // Try to get course details from the database
        const courseData = await getCourseDetails(courseId);
        console.log("Raw course data from API:", courseData);
        
        // Check if lectures have content
        if (courseData && courseData.lectures) {
          console.log("Lectures data:", courseData.lectures);
          
          // Check the first lecture for content
          if (courseData.lectures.length > 0) {
            console.log("First lecture:", courseData.lectures[0]);
            console.log("First lecture content:", courseData.lectures[0].lecture_content);
          }
        }
        
        if (courseData) {
          // Map the course data to our component structure
          const formattedCourse = {
            id: courseData.id,
            title: courseData.title,
            instructor: courseData.instructor_name || "Instructor",
            description: courseData.description || "No description available",
            lessons: courseData.lectures ? courseData.lectures.map(lecture => ({
              id: lecture.id,
              title: lecture.title,
              instructor: courseData.instructor_name || "Instructor",
              // IMPORTANT: Debug the resources mapping
              resources: lecture.lecture_content ? lecture.lecture_content.map(content => {
                console.log("Processing content item:", content);
                const isSlides = content.content_type_id === 1;
                return {
                  id: content.id,
                  type: isSlides ? "Lecture Slides" : "Lecture Notes",
                  url: content.file_url || "#",
                  icon: isSlides ? FaFileAlt : FaBook
                };
              }) : [],
              image: courseData.thumbnail_url || courseImage1
            })) : []
          };
          
          console.log("Formatted course:", formattedCourse);
          // Check if resources were mapped properly
          if (formattedCourse.lessons.length > 0) {
            console.log("First lesson resources:", formattedCourse.lessons[0].resources);
          }
          
          setCourse(formattedCourse);
        } else {
          // Fall back to sample data
          setCourse(SAMPLE_COURSE);
        }
      } else {
        // Use sample data if no courseId or user
        setCourse(SAMPLE_COURSE);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      // Fall back to sample data on error
      setCourse(SAMPLE_COURSE);
    } finally {
      setLoading(false);
    }
  };
  
  fetchCourseDetails();
}, [courseId, user]);
  useEffect(() => {
    // Set the first lesson as active by default when course loads
    if (course && course.lessons.length > 0 && !activeLesson) {
      setActiveLesson(course.lessons[0].id);
    }
  }, [course, activeLesson]);

  const goBack = () => {
    navigate("/StudentDashboard");
  };

  const openChatbot = () => {
    // Navigate to the VTA page with course context
    navigate("/Vta", { 
      state: { 
        courseContext: {
          courseId: course.id,
          courseTitle: course.title,
          instructor: course.instructor,
          currentLesson: course.lessons.find(lesson => lesson.id === activeLesson)?.title || course.lessons[0]?.title || "Introduction"
        } 
      } 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course content...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <h2>Course not found</h2>
        <p>The requested course could not be found.</p>
        <button className="primary-button" onClick={goBack}>Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="course-content-page">
      <Navbar />
      
      <div className="course-content-container">
        <div className="course-header">
          <h1>{course.title}</h1>
          <p className="course-instructor">Instructor: {course.instructor}</p>
          <p className="course-description">{course.description}</p>
        </div>
        
        <div className="course-navigation">
          <div className="breadcrumb">
            <Link to="/StudentDashboard">Dashboard</Link> / <span>{course.title}</span>
          </div>
          
          <button className="back-button" onClick={goBack}>
            <FaArrowLeft /> <span>Back to Courses</span>
          </button>
        </div>
        
        <div className="course-content-layout">
          {/* Side navigation for lessons */}
          <div className="lessons-nav">
            <h3>Course Content</h3>
            <ul>
              {course.lessons.map((lesson, index) => (
                <li 
                  key={lesson.id}
                  className={activeLesson === lesson.id ? "active" : ""}
                  onClick={() => setActiveLesson(lesson.id)}
                >
                  <span className="lesson-number">{index + 1}</span>
                  <span className="lesson-nav-title">{lesson.title}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main content area */}
          <div className="lessons-content">
            {course.lessons.map((lesson) => (
              <div 
                className={`lesson-detail ${activeLesson === lesson.id ? "active" : ""}`} 
                key={lesson.id}
              >
                <div className="lesson-header">
                  <div className="lesson-image">
                    <img src={lesson.image} alt={lesson.title} />
                  </div>
                  <div>
                    <h2>{lesson.title}</h2>
                    <p className="instructor">Created by: {lesson.instructor}</p>
                  </div>
                </div>
                
                <div className="lesson-body">
                  <p className="lesson-description">{lesson.description}</p>
                  
<div className="lesson-resources">
  <h4>Resources</h4>
  <div className="resources-grid">
    {lesson.resources && lesson.resources.length > 0 ? (
      lesson.resources.map((resource, index) => {
        console.log("Rendering resource:", resource);
        return (
          <a 
            key={index} 
            href={resource.url} 
            className="resource-card"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {React.createElement(resource.icon, { className: "resource-icon" })}
            <span>{resource.type}</span>
          </a>
        );
      })
    ) : (
      <p>No resources available for this lesson.</p>
    )}
  </div>
</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot Button */}
      <div className="chatbot-button" onClick={openChatbot}>
        {showChatbotHint && (
          <div className="chatbot-hint">
            <p>Need help with this course? Ask TALIM Assistant!</p>
          </div>
        )}
        <div className="chatbot-icon">
          <FaRobot />
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
};

export default StudentCourseContent;