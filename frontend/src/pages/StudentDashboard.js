import React from "react";
import { FaHome, FaBook, FaUserGraduate,FaPlusCircle, FaCog } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import "../styles/TeacherDashboard.css";

const StudentDashboard = () => {
  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "My Courses", icon: FaBook, href: "/TeacherCourseContent" },
  ];

  // Sample course data
  const recentCourses = [
    {
      id: 1,
      title: "Introduction to Artificial Intelligence Concepts",
      instructor: "Mia Parker",
      university: "Stanford University",
      image: courseImage1,
      students: 19,
    },
    {
      id: 2,
      title: "Advanced Data Science with Python",
      instructor: "Mia Parker",
      university: "Harvard University",
      image: courseImage1,
      students: 24,
    },
    {
      id: 3,
      title: "Advanced Data Science with Python",
      instructor: "Mia Parker",
      university: "Harvard University",
      image: courseImage1,
      students: 24,
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar links={sidebarLinks} />
      
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-main">
          <div className="user-profile-section">
                      <div className="user-profile">
                        <img src={courseImage1} alt="Mia Parker" className="profile-avatar" />
                        <div className="profile-info">
                          <h2 className="profile-name">MIA PARKER</h2>
                          <p className="profile-title">Student</p>
                        </div>
                      </div>
                      <button className="all-courses-btn" onClick={() => window.location.href = "/AllCourses"}>
                        All Courses <span className="arrow">→</span>
                      </button>
                    </div>
          <h1 className="dashboard-title">Let's Study , Mia</h1>
          
          {/* Recent Courses Section */}
          <div className="recent-courses">
            <h2 className="section-title">My Courses</h2>
            
            <div className="courses-grid">
              {recentCourses.map((course) => (
                <div key={course.id} className="course-container">
                  <CourseCard
                    image={course.image}
                    title={course.title}
                    instructor={course.instructor}
                    university={course.university}
                    buttonText="Open Course"
                    onButtonClick={() => window.location.href = `/TeacherCourseContent/${course.id}`}
                  />
                  <div className="course-stats">
                    <p>{course.students} students enrolled</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <SimpleFooter />
      </div>
    </div>
  );
};

export default StudentDashboard;