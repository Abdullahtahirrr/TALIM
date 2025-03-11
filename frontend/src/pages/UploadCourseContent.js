import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import { FaGraduationCap, FaBook, FaUserGraduate, FaChevronDown,FaHome,FaPlusCircle } from "react-icons/fa";
import { BsTrash, BsPencil } from "react-icons/bs";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import "../styles/UploadCourseContent.css";

const UploadCourseContent = () => {
  // State for managing lectures
  const [lectures, setLectures] = useState([
    { id: 1, name: "Lecture 1", files: [] },
    { id: 2, name: "Lecture 2", files: [] }
  ]);

  // State for dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState(null);
  
  // State for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");
  const [currentLectureId, setCurrentLectureId] = useState(null);
  
  // File input refs
  const slidesInputRef = useRef();
  const notesInputRef = useRef();

  // Sidebar links configuration
  const sidebarLinks = [
        { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
        { label: "My Courses", icon: FaBook, href: "/TeacherMyCourses" },
        { label: "Create a Course", icon: FaPlusCircle, href: "/TeacherStudents" },
      ];

  // Handle lecture actions
  const handleAction = (action, lectureId) => {
    setDropdownVisible(null);
    setCurrentLectureId(lectureId);

    if (action === 'upload_slides') {
      slidesInputRef.current.click();
    } else if (action === 'upload_notes') {
      notesInputRef.current.click();
    } else if (action === 'edit') {
      // Open dialog for editing
      const lecture = lectures.find(l => l.id === lectureId);
      setDialogContent(lecture.name);
      setIsDialogOpen(true);
    } else if (action === 'delete') {
      // Filter out the lecture to be deleted
      setLectures(lectures.filter(lecture => lecture.id !== lectureId));
    }
  };

  // Handle file upload
  const handleFileUpload = (event, fileType) => {
    const file = event.target.files[0];
    if (file && currentLectureId) {
      const updatedLectures = lectures.map(lecture => {
        if (lecture.id === currentLectureId) {
          return {
            ...lecture,
            files: [...lecture.files, { name: file.name, type: fileType, size: file.size }]
          };
        }
        return lecture;
      });
      setLectures(updatedLectures);
      
      // Reset the file input
      event.target.value = null;
    }
  };

  // Save lecture edit
  const saveLectureEdit = () => {
    if (currentLectureId && dialogContent) {
      const updatedLectures = lectures.map(lecture => {
        if (lecture.id === currentLectureId) {
          return {
            ...lecture,
            name: dialogContent
          };
        }
        return lecture;
      });
      setLectures(updatedLectures);
      setIsDialogOpen(false);
    }
  };

  // Add new lecture
  const addLecture = () => {
    const newId = Math.max(...lectures.map(l => l.id), 0) + 1;
    setLectures([...lectures, { id: newId, name: `Lecture ${newId}`, files: [] }]);
  };

  // Handle save/submit
  const handleSave = () => {
    // Logic to save course content
    alert("Course content saved successfully!");
  };

  return (
    <div className="upload-content-container">
      {/* Sidebar */}
      <Sidebar links={sidebarLinks} />

      <div className="main-content">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="header-section">
            <h1 className="header-title">Add Curriculum to Course</h1>
            <div className="breadcrumb">
              <span>Home</span>
              <span className="separator">/</span>
              <span className="current">Curriculum Upload</span>
            </div>
          </div>

          {/* Course Content Container */}
          <div className="content-box">
            {/* Course Header */}
            <div className="course-header">
              <h2 className="course-title">Artificial Intelligence Course</h2>
              <span className="lectures-count">Lectures: {lectures.length}</span>
            </div>

            {/* Lectures List */}
            <div className="lectures-container">
              {lectures.map((lecture) => (
                <div key={lecture.id} className="lecture-item">
                  <div className="lecture-name">
                    <HiOutlineMenuAlt2 className="lecture-name-icon" />
                    <span>{lecture.name}</span>
                  </div>
                  <div className="lecture-actions">
                    {/* Action buttons */}
                    <div className="actions-group">
                      <button 
                        className="action-button"
                        onClick={() => setDropdownVisible(dropdownVisible === lecture.id ? null : lecture.id)}
                      >
                        Actions
                        <FaChevronDown className="action-dropdown" />
                      </button>
                      
                      <div className="edit-delete-buttons">
                        <button className="icon-button" onClick={() => handleAction('edit', lecture.id)}>
                          <BsPencil />
                        </button>
                        <button className="icon-button" onClick={() => handleAction('delete', lecture.id)}>
                          <BsTrash />
                        </button>
                      </div>
                    </div>
                    
                    {/* Dropdown */}
                    {dropdownVisible === lecture.id && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => handleAction('upload_slides', lecture.id)}
                        >
                          Upload Lecture Slides
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleAction('upload_notes', lecture.id)}
                        >
                          Upload Lecture Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={slidesInputRef} 
                onChange={(e) => handleFileUpload(e, 'slides')} 
                style={{ display: 'none' }} 
                accept=".pdf,.ppt,.pptx"
              />
              <input 
                type="file" 
                ref={notesInputRef} 
                onChange={(e) => handleFileUpload(e, 'notes')} 
                style={{ display: 'none' }} 
                accept=".pdf,.doc,.docx,.txt"
              />

              {/* Add Lecture Area */}
              <button 
                className="add-lecture-button"
                onClick={addLecture}
              >
                + Add New Lecture
              </button>
            </div>

            {/* Display uploaded files */}
            <div className="uploaded-files">
              {lectures.flatMap(lecture => 
                lecture.files.map((file, index) => (
                  <div key={`${lecture.id}-${index}`} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-type">{file.type === 'slides' ? 'Slides' : 'Notes'}</span>
                    <span className="file-lecture">{lecture.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="bottom-buttons">
            <Button variant="light" onClick={() => window.history.back()}>
              Previous
            </Button>
            <Button variant="dark" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>

        {/* Footer */}
        <SimpleFooter />
      </div>

      {/* Dialog Box */}
      <DialogBox isOpen={isDialogOpen} title="Edit Lecture" onClose={() => setIsDialogOpen(false)}>
        <div>
          <input 
            type="text" 
            className="dialog-input" 
            placeholder="Lecture Name" 
            value={dialogContent}
            onChange={(e) => setDialogContent(e.target.value)}
          />
          <div className="dialog-actions">
            <Button variant="dark" onClick={saveLectureEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogBox>
    </div>
  );
};

export default UploadCourseContent;