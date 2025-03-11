import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaHome, FaBook, FaUserGraduate, FaPlusCircle, FaCog } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import VerificationWarning from "../components/VerificationWarning";
import courseImage1 from "../assets/course_image.jpeg";
import "../styles/StudentDashboard.css";
import { useAuth } from "../utils/authContext";
import { supabase } from "../supabaseClient";

const StudentDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/StudentDashboard" },
    { label: "My Courses", icon: FaBook, href: "/StudentMyCourses" },
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
  
  useEffect(() => {
    // Check if there's a verification warning flag from location state
    if (location.state?.showVerificationWarning) {
      setShowVerificationWarning(true);
    }
    
    // Otherwise check profile for verification status
    const checkVerification = async () => {
      if (user) {
        setUserEmail(user.email);
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('email_verified, created_at')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data && !data.email_verified) {
            const createdAt = new Date(data.created_at);
            const now = new Date();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
            
            // Show warning if not verified and more than 1 hour old
            if (hoursDiff > 1) {
              setShowVerificationWarning(true);
            }
          }
        } catch (error) {
          console.error("Error checking verification:", error);
        }
      }
    };
    
    checkVerification();
  }, [location, user]);
  
  const dismissVerificationWarning = () => {
    setShowVerificationWarning(false);
  };

  return (
    <div className="dashboard-container">
      {/* Verification Warning Banner */}
      {showVerificationWarning && (
        <VerificationWarning 
          email={userEmail}
          onDismiss={dismissVerificationWarning}
        />
      )}
      
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
            <button className="all-courses-btn" onClick={() => window.location.href = "/EnrolledCourses"}>
              All Courses <span className="arrow">→</span>
            </button>
          </div>
          {/* Stats Cards */}
          <h2 className="section-title">Dashboard</h2>
          <div className="stats-container">
          
          <div className="stat-card pink-light">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-details">
                <h2>957</h2>
                <p>Total Courses</p>
              </div>
            </div>

            <div className="stat-card purple-light">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-details">
                <h2>97</h2>
                <p>Enrolled</p>
              </div>
            </div>
            
            <div className="stat-card blue-light">
              <div className="stat-icon">
                <FaUserGraduate />
              </div>
              <div className="stat-details">
                <h2>6</h2>
                <p>Completed</p>
              </div>
            </div>
          </div>
          <h1 className="dashboard-title">Let's Study , Mia</h1>
          
          {/* Recent Courses Section */}
          <div className="recent-courses">
            
            
            <div className="courses-grid">
              {recentCourses.map((course) => (
                <div key={course.id} className="course-container">
                  <CourseCard
                    image={course.image}
                    title={course.title}
                    instructor={course.instructor}
                    university={course.university}
                    buttonText="Open Course"
                    onButtonClick={() => window.location.href = `/StudentCourseContent/${course.id}`}
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