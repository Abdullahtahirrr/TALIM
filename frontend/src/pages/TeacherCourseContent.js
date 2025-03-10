import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import { 
  FaArrowLeft, 
  FaBook, 
  FaFileAlt, 
  FaPlayCircle, 
  FaClipboardList, 
  FaFileUpload,
  FaTasks
} from "react-icons/fa";
import "../styles/TeacherCourseContent.css";

// Sample data - replace with API calls in production
const SAMPLE_COURSE = {
  id: "ai-101",
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

const TeacherCourseContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    // In a real app, you'd fetch the specific course by ID
    // For now, we'll use the sample data
    setCourse(SAMPLE_COURSE);
    setLoading(false);
  }, [courseId]);

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
    navigate("/Quiz");
  };

  const handleGenerateAssignment = () => {
    navigate("/Assignment");
  };

  const handleAddCurriculum = () => {
    navigate("/UploadCourseContent");
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
                      {lesson.resources.map((resource, index) => (
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
                      ))}
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