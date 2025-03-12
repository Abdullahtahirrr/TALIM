// src/pages/TeacherCourseContent.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import BackButton from "../components/BackButton";
import { 
  FaArrowLeft, 
  FaBook, 
  FaFileAlt, 
  FaPlayCircle, 
  FaClipboardList, 
  FaFileUpload,
  FaTasks,FaHome,FaPlusCircle
} from "react-icons/fa";

import { getCourseDetails } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import "../styles/TeacherCourseContent.css";
import Sidebar from "../components/Sidebar";

const TeacherCourseContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  // Sample data for fallback
  const SAMPLE_COURSE = {
    id: courseId || "ai-101",
    title: "Artificial Intelligence Course",
    instructor: "Seemab Latif",
    description: "Learn the fundamentals of artificial intelligence, machine learning algorithms, and practical applications in various industries. This comprehensive course covers everything from basic concepts to advanced techniques.",
    enrolledStudents: 42,
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
          { type: "Lecture Notes", url: "#", icon: FaBook }
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

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (courseId && user) {
          // Try to get course details from the database
          const courseData = await getCourseDetails(courseId);
          
          // In TeacherCourseContent.js - update the mapping in fetchCourseDetails function
if (courseData) {
  // Map the course data to our component structure
  const formattedCourse = {
    id: courseData.id,
    title: courseData.title,
    instructor: courseData.instructor_name || "Instructor",
    description: courseData.description || "No description available",
    enrolledStudents: courseData.enrolledStudents || 0,
    enrollment_key: courseData.enrollment_key,
    lessons: courseData.lectures ? courseData.lectures.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      instructor: courseData.instructor_name || "Instructor",
      resources: lecture.lecture_content ? lecture.lecture_content.map(content => {
        const isSlides = content.content_type_id === 1; // Assuming 1 is slides, 2 is notes
        return {
          id: content.id,
          type: isSlides ? "Lecture Slides" : "Lecture Notes",
          url: content.file_url || "#",
          icon: isSlides ? FaFileAlt : FaBook
        };
      }) : [],
      // Use course-specific image if available
      image: courseData.thumbnail_url || courseImage1
    })) : []
  };
  
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
    navigate("/TeacherDashboard");
  };

  const handleGenerateQuiz = () => {
    const selectedLesson = course.lessons.find(lesson => lesson.id === activeLesson) || course.lessons[0];
    navigate("/Quiz", {
      state: {
        courseContext: {
          courseId: course.id,
          lectureId: selectedLesson.id,
          lectureName: selectedLesson.title || course.title,
          keyTopic: course.title
        }
      }
    });
  };

  const handleGenerateAssignment = () => {
    const selectedLesson = course.lessons.find(lesson => lesson.id === activeLesson);
    navigate("/Assignment", {
      state: {
        courseContext: {
          courseId: course.id,
          lectureId: selectedLesson?.id,
          lectureName: selectedLesson?.title || course.title,
          keyTopic: course.title
        }
      }
    });
  };

  const handleAddCurriculum = () => {
    navigate("/UploadCourseContent", {
      state: {
        courseContext: {
          courseId: course.id,
          courseTitle: course.title
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
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "My Courses", icon: FaBook, href: "/TeacherMyCourses" },
    { label: "Create a Course", icon: FaPlusCircle, href: "/CreateCourse" },
  ];
  return (
    <div className="course-content-page">
      {/* <Sidebar links={sidebarLinks} /> */}
      <Navbar />
      
      <div className="course-content-container">

<div className="course-header">
  <h1>{course.title}</h1>
  <p className="course-instructor">Instructor: {course.instructor}</p>
  <p className="course-description">{course.description}</p>
  
  <div className="enrollment-code-container">
    <div className="enrollment-code-label">Enrollment Code:</div>
    <div className="enrollment-code">
      {course.enrollment_key || "Not available"}
      <button 
        className="copy-code-button" 
        onClick={() => {
          if (course.enrollment_key) {
            navigator.clipboard.writeText(course.enrollment_key);
            // Show a brief "copied" message
            const button = document.querySelector('.copy-code-button');
            const originalText = button.textContent;
            button.textContent = "Copied!";
            setTimeout(() => {
              button.textContent = originalText;
            }, 2000);
          }
        }}
      >
        📋
      </button>
    </div>
  </div>
  
  <div className="course-stats">
    <div className="stat-item">
      <span className="stat-number">{course.enrolledStudents}</span>
      <span className="stat-label">Enrolled Students</span>
    </div>
    <div className="stat-item">
      <span className="stat-number">{course.lessons.length}</span>
      <span className="stat-label">Lessons</span>
    </div>
  </div>
</div>
        
        <div className="course-navigation">
          <div className="breadcrumb">
            <Link to="/TeacherDashboard">Dashboard</Link> / <span>{course.title}</span>
          </div>
          
          {/* <button className="back-button" onClick={goBack}>
            <FaArrowLeft /> <span>Back to Courses</span>
          </button> */}
<     BackButton to="/TeacherMyCourses" />

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
                        lesson.resources.map((resource, index) => (
                          <a 
                            key={index} 
                            href={resource.url} 
                            className="resource-card"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <resource.icon className="resource-icon" />
                            <span>{resource.type}</span>
                          </a>
                        ))
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

      {/* Teacher Action Buttons */}
      <div className="teacher-actions">
        <button className="teacher-action-button quiz-button" onClick={handleGenerateQuiz}>
          <FaClipboardList className="action-icon" />
          <span>Generate Quiz</span>
        </button>
        
        <button className="teacher-action-button assignment-button" onClick={handleGenerateAssignment}>
          <FaTasks className="action-icon" />
          <span>Generate Assignment</span>
        </button>
        
        <button className="teacher-action-button curriculum-button" onClick={handleAddCurriculum}>
          <FaFileUpload className="action-icon" />
          <span>Add Curriculum</span>
        </button>
      </div>
      
      <SimpleFooter />
    </div>
  );
};

export default TeacherCourseContent;