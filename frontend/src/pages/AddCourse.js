import React from "react";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import courseImage from "../assets/course_image.jpeg";
import { FaPlusCircle, FaLayerGroup, FaGripHorizontal } from "react-icons/fa";
import "../styles/AddCourse.css";

const navLinks = [
  { label: "Dashboard", href: "#", icon: FaGripHorizontal, active: true },
  { label: "Create New Course", href: "https://github.com/", icon: FaPlusCircle, active: false },
  { label: "My Courses", href: "#", icon: FaLayerGroup, active: false },
];

const MockupPage = () => {
  const handleEnroll = () => {
    alert("You have enrolled in the course!");
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main Layout: Sidebar + CourseCard */}
      <div className="flex min-h-screen">
        {/* Sidebar (Left) */}
        {/* <Sidebar links={navLinks} /> */}

        {/* Right Content Section */}
        <div className="flex flex-1 justify-center p-8 bg-gray-100">
        <CourseCard 
  image={courseImage}
  instructor="John Doe"
  university="Harvard University"
  title="React for Beginners"
  buttonText="Open Course"
  onButtonClick={() => window.location.href = "/course-dashboard"} 
/>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default MockupPage;
