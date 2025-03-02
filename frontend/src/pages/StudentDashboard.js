import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import "../styles/StudentDashboard.css";
import courseImage from "../assets/course_image.jpeg";
import { FaLayerGroup, FaGripHorizontal, FaUserCircle } from "react-icons/fa";

const StudentDashboard = () => {
  const navLinks = [
    { label: "Dashboard", href: "#", icon: FaGripHorizontal, active: true },
    { label: "My Courses", href: "#", icon: FaLayerGroup, active: false },
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
              <FaUserCircle size={80} className="profile-icon" />
              <div className="profile-info">
                <h2>MIA PARKER</h2>
                <p>7th Semester</p>
              </div>
              <Button variant="light" className="right-button">All Courses →</Button>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="dashboard-stats">
            <div className="stat-box pink">
              <p>957</p>
              <span>Enrolled Courses</span>
            </div>
            <div className="stat-box purple">
              <p>6</p>
              <span>Active Courses</span>
            </div>
            <div className="stat-box green">
              <p>951</p>
              <span>Completed Courses</span>
            </div>
          </div>

          {/* Courses Section */}
          <h3 className="learning-heading">Let’s start learning, Mia</h3>
          <div className="courses-section">
            {courses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
