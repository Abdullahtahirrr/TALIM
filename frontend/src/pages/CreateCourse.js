import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import Button from "../components/Button";
import { FaHome, FaBook, FaCopy, FaFileAlt } from "react-icons/fa";
import "../styles/CreateCourse.css";

const CreateCourse = () => {
  // State for tracking current step
  const [currentStep, setCurrentStep] = useState("basic"); // basic, advance, curriculum
  
  // State for course data
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    semester: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: null,
    lectures: [
      { id: 1, title: "Lecture name", contentType: null, pdfFile: null, expanded: false }
    ]
  });
  
  // State for validation error
  const [validationError, setValidationError] = useState("");
  
  // State for enrollment key dialog
  const [showEnrollmentKey, setShowEnrollmentKey] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState("");
  
  // Sidebar links
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "Create New Course", icon: FaBook, href: "/CreateCourse" },
    { label: "My Courses", icon: FaCopy, href: "/TeacherMyCourses" },
  ];
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCourseData({ ...courseData, [field]: value });
  };
  
  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData({
        ...courseData,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      });
    }
  };
  
  // Add new lecture
  const addLecture = () => {
    // Check for duplicate lecture names
    setValidationError("");
    const newLectureId = Math.max(...courseData.lectures.map(l => l.id), 0) + 1;
    
    setCourseData({
      ...courseData,
      lectures: [
        ...courseData.lectures,
        { id: newLectureId, title: "Lecture name", contentType: null, pdfFile: null, expanded: false }
      ]
    });
  };
  
  // Toggle lecture expanded state
  const toggleLectureExpanded = (lectureId) => {
    const updatedLectures = courseData.lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return { ...lecture, expanded: !lecture.expanded };
      }
      return lecture;
    });
    
    setCourseData({ ...courseData, lectures: updatedLectures });
  };
  
  // Handle step navigation
  const goToStep = (step) => {
    setCurrentStep(step);
  };
  
  // Handle lecture title change
  const handleLectureTitleChange = (lectureId, newTitle) => {
    // Check for duplicate lecture names
    const isDuplicate = courseData.lectures.some(
      lecture => lecture.id !== lectureId && lecture.title.toLowerCase() === newTitle.toLowerCase()
    );
    
    if (isDuplicate) {
      setValidationError("Lecture with this name already exists. Please use a unique name.");
      return;
    }
    
    setValidationError("");
    const updatedLectures = courseData.lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return { ...lecture, title: newTitle };
      }
      return lecture;
    });
    
    setCourseData({ ...courseData, lectures: updatedLectures });
  };
  
  // Handle PDF file upload
  const handlePdfUpload = (lectureId, file) => {
    const updatedLectures = courseData.lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return { ...lecture, pdfFile: file };
      }
      return lecture;
    });
    
    setCourseData({ ...courseData, lectures: updatedLectures });
  };
  
  // Set content type for lecture (slides or notes)
  const setLectureContentType = (lectureId, contentType) => {
    const updatedLectures = courseData.lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return { ...lecture, contentType: contentType };
      }
      return lecture;
    });
    
    setCourseData({ ...courseData, lectures: updatedLectures });
  };
  
  // Delete lecture
  const deleteLecture = (lectureId) => {
    const updatedLectures = courseData.lectures.filter(lecture => lecture.id !== lectureId);
    setCourseData({ ...courseData, lectures: updatedLectures });
  };
  
  // Handle course publish
  const handlePublishCourse = () => {
    // Generate a random enrollment key
    const generatedKey = Math.floor(Math.random() * 9000000000) + 1000000000;
    setEnrollmentKey(generatedKey.toString());
    setShowEnrollmentKey(true);
  };
  
  // Render Basic Information step
  const renderBasicInfo = () => (
    <div className="form-container">
      <h2>Basic Information</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          placeholder="You course title"
          value={courseData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
        />
        <span className="character-count">{courseData.title.length}/80</span>
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Course Category</label>
        <select
          id="category"
          value={courseData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
        >
          <option value="" disabled>Select...</option>
          <option value="computerScience">Computer Science</option>
          <option value="dataScience">Data Science</option>
          <option value="artificialIntelligence">Artificial Intelligence</option>
          <option value="webDevelopment">Web Development</option>
          <option value="webDevelopment">Business Studies</option>
          <option value="webDevelopment">Others</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="semester">Semester</label>
        <input
          type="text"
          id="semester"
          placeholder="Which Semester students do you teach your course?"
          value={courseData.semester}
          onChange={(e) => handleInputChange("semester", e.target.value)}
        />
      </div>
      
      <div className="form-actions">
        <Button variant="dark" onClick={() => goToStep("advance")}>Save & Next</Button>
      </div>
    </div>
  );
  
  // Render Advance Information step
  const renderAdvanceInfo = () => (
    <div className="form-container">
      <h2>Advance Informations</h2>
      
      <div className="thumbnail-section">
        <h3>Course Thumbnail</h3>
        <div className="thumbnail-container">
          <div className="thumbnail-preview">
            {courseData.thumbnailPreview ? (
              <img src={courseData.thumbnailPreview} alt="Course thumbnail" />
            ) : (
              <div className="thumbnail-placeholder">
                <FaFileAlt size={50} color="#661083" />
              </div>
            )}
          </div>
          <div className="thumbnail-info">
            <p>Upload your course Thumbnail here. <strong>Important guidelines:</strong> 1200×800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png</p>
            <Button variant="light" onClick={() => document.getElementById("thumbnailUpload").click()}>
              Upload Image
            </Button>
            <input
              type="file"
              id="thumbnailUpload"
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={handleThumbnailChange}
            />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Course Descriptions</label>
        <textarea
          id="description"
          placeholder="Enter you course descriptions"
          value={courseData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={6}
        />
        <div className="text-editor-buttons">
          <button className="editor-btn"><strong>B</strong></button>
          <button className="editor-btn"><em>I</em></button>
          <button className="editor-btn"><u>U</u></button>
          <button className="editor-btn">S</button>
          <button className="editor-btn">Link</button>
          <button className="editor-btn">•</button>
          <button className="editor-btn">1.</button>
        </div>
      </div>
      
      <div className="form-actions">
        <Button variant="light" onClick={() => goToStep("basic")}>Previous</Button>
        <Button variant="dark" onClick={() => goToStep("curriculum")}>Save & Next</Button>
      </div>
    </div>
  );
  
  // Render Curriculum step
  const renderCurriculum = () => (
    <div className="form-container">
      <h2>Course Curriculum</h2>
      
      {validationError && (
        <div className="validation-error">
          {validationError}
        </div>
      )}
      
      <div className="curriculum-builder">
        <div className="lectures-container">
          <div className="lectures-header">
            <h3>Lectures</h3>
          </div>
          
          {courseData.lectures.map((lecture) => (
            <div key={lecture.id} className="lecture-container">
              <div className="lecture-header">
                <div className="lecture-drag-handle">≡</div>
                <input
                  type="text"
                  value={lecture.title}
                  onChange={(e) => handleLectureTitleChange(lecture.id, e.target.value)}
                  className="lecture-title-input"
                  placeholder="Enter lecture name"
                />
                <div className="lecture-actions">
                  <button
                    className={`expand-btn ${lecture.expanded ? 'expanded' : ''}`}
                    onClick={() => toggleLectureExpanded(lecture.id)}
                  >
                    Contents {lecture.expanded ? '▲' : '▼'}
                  </button>
                  <button className="delete-btn" onClick={() => deleteLecture(lecture.id)}>🗑️</button>
                </div>
              </div>
              
              {lecture.expanded && (
                <div className="lecture-content">
                  <div className="pdf-upload-container">
                    <div className="pdf-input-group">
                      <input
                        type="file"
                        id={`pdf-upload-${lecture.id}`}
                        accept=".pdf"
                        style={{ display: "none" }}
                        onChange={(e) => handlePdfUpload(lecture.id, e.target.files[0])}
                      />
                      <label className="pdf-upload-label" htmlFor={`pdf-upload-${lecture.id}`}>
                        {lecture.pdfFile ? lecture.pdfFile.name : "Upload PDF"}
                      </label>
                      <button 
                        className="pdf-upload-btn"
                        onClick={() => document.getElementById(`pdf-upload-${lecture.id}`).click()}
                      >
                        Browse
                      </button>
                    </div>
                    
                    {lecture.pdfFile && (
                      <div className="content-type-selector">
                        <p>Classify as:</p>
                        <select 
                          value={lecture.contentType || ""}
                          onChange={(e) => setLectureContentType(lecture.id, e.target.value)}
                        >
                          <option value="" disabled>Select type</option>
                          <option value="slides">Slides</option>
                          <option value="notes">Lecture Notes</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button className="add-lecture-btn" onClick={addLecture}>
            Add Lecture
          </button>
        </div>
      </div>
      
      <div className="form-actions">
        <Button variant="light" onClick={() => goToStep("advance")}>Previous</Button>
        <Button variant="dark" onClick={handlePublishCourse}>Publish Course</Button>
      </div>
    </div>
  );
  
  // Render Enrollment Key Dialog
  const renderEnrollmentKeyDialog = () => (
    <DialogBox
      isOpen={showEnrollmentKey}
      title="COURSE ENROLLMENT KEY"
      onClose={() => setShowEnrollmentKey(false)}
    >
      <div className="enrollment-key-container">
        <h3 className="enrollment-key">{enrollmentKey} <button className="copy-btn">📋</button></h3>
        <Button variant="dark" onClick={() => setShowEnrollmentKey(false)}>OK</Button>
      </div>
    </DialogBox>
  );
  
  // Render step indicators
  const renderStepIndicators = () => (
    <div className="step-indicators">
      <div className={`step-indicator ${currentStep === "basic" || currentStep === "advance" || currentStep === "curriculum" ? "active" : ""}`}>
        <div className="step-icon">
          <FaBook />
        </div>
        <div className="step-label">Basic Information</div>
        <div className="step-completion">{currentStep !== "basic" ? "✓" : "1/3"}</div>
      </div>
      
      <div className={`step-indicator ${currentStep === "advance" || currentStep === "curriculum" ? "active" : ""}`}>
        <div className="step-icon">
          <FaFileAlt />
        </div>
        <div className="step-label">Advance Information</div>
        <div className="step-completion">{currentStep === "curriculum" ? "✓" : "1/2"}</div>
      </div>
      
      <div className={`step-indicator ${currentStep === "curriculum" ? "active" : ""}`}>
        <div className="step-icon">
          <FaCopy />
        </div>
        <div className="step-label">Curriculum</div>
        <div className="step-completion">{currentStep === "curriculum" ? "7/12" : ""}</div>
      </div>
    </div>
  );
  
  return (
    <div className="create-course-page">
      <div className="layout-container">
        <Sidebar links={sidebarLinks} />
        
        <div className="main-content">
          <Navbar />
          
          <div className="content-container">
            <div className="header-section">
              <div>
                <p className="greeting">Good Morning</p>
                <h1 className="page-title">Create a new course</h1>
              </div>
            </div>
            
            {renderStepIndicators()}
            
            <div className="form-section">
              {currentStep === "basic" && renderBasicInfo()}
              {currentStep === "advance" && renderAdvanceInfo()}
              {currentStep === "curriculum" && renderCurriculum()}
            </div>
            
            
            {renderEnrollmentKeyDialog()}
          </div>
          
          <SimpleFooter />
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;