// src/pages/StudentMyCourses.js
import React, { useState, useEffect } from "react";
import { FaHome, FaBook } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import { getUserProfile, getEnrolledCourses } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import "../styles/StudentMyCourses.css";

const StudentMyCourses = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/StudentDashboard" },
    { label: "My Courses", icon: FaBook, href: "/StudentMyCourses" },
  ];

  // Sample course data for fallback
  const sampleCourses = [
    {
      id: 1,
      title: "Introduction to Artificial Intelligence Concepts",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage1,
      students: 19,
    },
    {
      id: 2,
      title: "Advanced Data Science with Python",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage1,
      students: 24,
    },
    {
      id: 3,
      title: "Deep Learning",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage1,
      students: 24,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Fetch profile data
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
          
          // Fetch enrolled courses
          const enrolledCourses = await getEnrolledCourses(user.id);
          
          // If courses table exists and we got data, use it
          if (enrolledCourses) {
            setCourses(enrolledCourses);
          } else {
            // Fallback to sample data
            setCourses(sampleCourses);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to sample data on error
        setCourses(sampleCourses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar links={sidebarLinks} />
      
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-main">
          <div className="user-profile-section">
            <div className="user-profile">
              <img src={courseImage1} alt={profile?.first_name || "Student"} className="profile-avatar" />
              <div className="profile-info">
                <h2 className="profile-name">
                  {profile ? `${profile.first_name.toUpperCase()} ${profile.last_name.toUpperCase()}` : "STUDENT NAME"}
                </h2>
                <p className="profile-title">Student</p>
              </div>
            </div>
            <button className="all-courses-btn" onClick={() => window.location.href = "/AllCourses"}>
              All Courses <span className="arrow">→</span>
            </button>
          </div>
          
          {/* Recent Courses Section */}
          <div className="recent-courses">
            <h2 className="section-title">My Courses</h2>
            
            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-container">
                  <CourseCard
                    image={course.image || courseImage1}
                    title={course.title}
                    instructor={course.instructor}
                    university={course.university || "NUST"}
                    buttonText="Open Course"
                    onButtonClick={() => window.location.href = `/StudentCourseContent/${course.id}`}
                  />
                  <div className="course-stats">
                    <p>{course.students || 20} students enrolled</p>
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

export default StudentMyCourses;