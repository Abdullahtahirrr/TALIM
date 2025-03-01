import React from "react";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaPlusCircle, FaLayerGroup ,FaGripHorizontal} from "react-icons/fa";

const navLinks = [
  { label: "Dashboard", href: "#", icon: FaGripHorizontal, active: true },
  { label: "Create New Course", href: "https://github.com/", icon: FaPlusCircle, active: false },
  { label: "My Courses", href: "#", icon: FaLayerGroup, active: false },
];
const MockupPage = () => {
  const handleClick = (variant) => {
    alert(`${variant} button clicked!`);
  };

  return (
    <>
    <div className="flex">
    <Navbar />
    <Sidebar links={navLinks} /> </div>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
      {/* <Button variant="dark" onClick={handleClick}>Dark Purple</Button>
      <Button variant="light">Light Purple </Button> */}
    </div>
    <Footer />
    </>
  );
};

export default MockupPage;
