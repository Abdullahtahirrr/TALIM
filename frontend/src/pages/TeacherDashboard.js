// src/pages/TeacherDashboard.js
import React, { useState, useEffect } from "react";
import { FaHome, FaBook, FaUserGraduate, FaPlusCircle } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import courseImage1 from "../assets/course_image.jpeg";
import { getUserProfile, getTeacherCourses } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import "../styles/TeacherDashboard.css";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0
  });

  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "My Courses", icon: FaBook, href: "/TeacherMyCourses" },
    { label: "Create a Course", icon: FaPlusCircle, href: "/CreateCourse" },
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
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Fetch profile data
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
          
          // Fetch teacher's courses
          const teacherCourses = await getTeacherCourses(user.id);
          
          // If courses table exists and we got data, use it
          if (teacherCourses) {
            // Format the courses to include instructor info
            const formattedCourses = teacherCourses.map(course => ({
              id: course.id,
              title: course.title,
              instructor: profileData ? `${profileData.first_name} ${profileData.last_name}` : "Instructor",
              university: "NUST", // Can be updated if you add this to user_details
              // image: course.thumbnail_url || courseImage1,
              image: courseImage1,
              students: Math.floor(Math.random() * 30) + 10 // Random count for demo purposes
            }));
            
            setCourses(formattedCourses);
            setStats({
              totalCourses: 957, // Placeholder values, can be updated with real stats
              activeCourses: formattedCourses.length
            });
          } else {
            // Fallback to sample data
            setCourses(sampleCourses);
            setStats({
              totalCourses: 957,
              activeCourses: 6
            });
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
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar links={sidebarLinks} />
      
      <div className="dashboard-content">
        <Navbar />
        
        <div className="dashboard-main">
          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-profile">
              <img src={courseImage1} alt={profile?.first_name || "Teacher"} className="profile-avatar" />
              <div className="profile-info">
                <h2 className="profile-name">
                  {profile ? `${profile.first_name.toUpperCase()} ${profile.last_name.toUpperCase()}` : "TEACHER NAME"}
                </h2>
                <p className="profile-title">Assistant Professor</p>
              </div>
            </div>
            <button className="all-courses-btn" onClick={() => window.location.href = "/TeacherMyCourses"}>
              All Courses <span className="arrow">→</span>
            </button>
          </div>
          
          <h1 className="dashboard-title">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card purple-light">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-details">
                <h2>{stats.totalCourses}</h2>
                <p>Total Courses</p>
              </div>
            </div>
            
            <div className="stat-card blue-light">
              <div className="stat-icon">
                <FaUserGraduate />
              </div>
              <div className="stat-details">
                <h2>{stats.activeCourses}</h2>
                <p>Active Courses</p>
              </div>
            </div>
          </div>
          
          {/* Recent Courses Section */}
          <div className="recent-courses">
            <h2 className="section-title">Let's Teach, {profile ? profile.first_name : "Teacher"}</h2>
            
            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-container">
                  <CourseCard
                    image={course.image || courseImage1}
                    title={course.title}
                    instructor={course.instructor}
                    university={course.university || "NUST"}
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

export default TeacherDashboard;