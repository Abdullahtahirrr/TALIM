import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import "../styles/TeacherDashboard.css";
import courseImage from "../assets/course_image.jpeg";
import { FaLayerGroup, FaGripHorizontal, FaUserCircle } from "react-icons/fa";

const TeacherDashboard = () => {
  const navLinks = [
    { label: "Dashboard", href: "#", icon: FaGripHorizontal, active: true },
    { label: "My Courses", href: "#", icon: FaLayerGroup, active: false },
    { label: "Create New Course", href: "#", icon: FaLayerGroup, active: false },
  ];

  const courses = [
    {
      image: courseImage,
      instructor: "John Doe",
      university: "Harvard University",
      title: "Reiki Level I, II and Master/Teacher Program",
      buttonText: "Open Course",
      onButtonClick: () => alert("Opening Course..."),
    },
    {
      image: courseImage,
      instructor: "Jane Smith",
      university: "Stanford University",
      title: "Copywriting - Become a Freelance Copywriter",
      buttonText: "Open Course",
      onButtonClick: () => alert("Opening Course..."),
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar />

      <div className="dashboard-main">
        {/* Sidebar */}
        <Sidebar links={navLinks} />

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Profile Header */}
          <div className="dashboard-header">
            <div className="profile-section">
              <FaUserCircle size={100} className="profile-icon" />
              <div className="profile-info">
                <h2>MIA PARKER</h2>
                <p>Assistant Professor</p>
              </div>
              <Button variant="light" className="right-button">All Courses</Button>
            </div>
          </div>

          <h2 className="dashboard-heading">Dashboard</h2>

          {/* Statistics Section */}
          <div className="dashboard-stats">
            <div className="stat-box pink">
              <p>957</p>
              <span>Total Courses</span>
            </div>
            <div className="stat-box purple">
              <p>6</p>
              <span>Active Courses</span>
            </div>
          </div>

          {/* Courses Section */}
          <h3 className="learning-heading">Let’s Teach, Mia</h3>
          <div className="courses-section">
            {courses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
          <div className="footer-content">
                  {/* Center: Navigation Links */}
                  <nav className="footer-links">
                    <a href="/privacy-policy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/contact">Contact Us</a>
                  </nav>
          
                  {/* Right: Copyright Info */}
                  <div className="footer-copy">
                    <p>&copy; {new Date().getFullYear()} Talim. All rights reserved.</p>
                  </div>
                </div>
        </div>
      </div>


    </div>
  );
};

export default TeacherDashboard;
