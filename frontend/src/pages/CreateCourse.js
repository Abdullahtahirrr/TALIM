import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import Button from "../components/Button";
import ErrorDialogBox from "../components/ErrorDialogBox";
import { FaHome, FaBook, FaCopy, FaFileAlt } from "react-icons/fa";
import { getCourseCategories, addLecturesToCourse, uploadLectureFile } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import "../styles/CreateCourse.css";

import { 
  createStorageBucketIfNotExists, 
  uploadLectureContentFile, 
  createNewCourse, 
  publishCourse,
  
} from "../utils/api-service";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  
  
  // State for categories
  const [categories, setCategories] = useState([]);
  
  // State for validation error
  const [validationError, setValidationError] = useState("");
  
  // State for enrollment key dialog
  const [showEnrollmentKey, setShowEnrollmentKey] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState("");
  
  // State for error dialog
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  // New states for error and success handling
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Sidebar links
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "Create New Course", icon: FaBook, href: "/CreateCourse" },
    { label: "My Courses", icon: FaCopy, href: "/TeacherMyCourses" },
  ];
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCourseCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
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
    // Validate current step before proceeding
    if (currentStep === "basic" && step === "advance") {
      if (!courseData.title.trim()) {
        setValidationError("Course title is required");
        return;
      }
    }
    
    if (currentStep === "advance" && step === "curriculum") {
      if (!courseData.description.trim()) {
        setValidationError("Course description is required");
        return;
      }
    }
    
    setCurrentStep(step);
    setValidationError("");
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
  
  // Validate all lectures before publishing
  const validateLecturesBeforePublish = () => {
    // Check if there are any lectures with missing fields
    const invalidLectures = courseData.lectures.filter(lecture => 
      !lecture.title.trim() || 
      (lecture.pdfFile && !lecture.contentType)
    );
    
    if (invalidLectures.length > 0) {
      setValidationError("Please provide a title and content type for all lectures with uploaded files");
      return false;
    }
    
    return true;
  };
  
  const handlePublishCourse = async () => {
    try {
      setIsLoading(true);
      
      // Validate and convert category to a number if needed
      const categoryId = courseData.category 
        ? parseInt(courseData.category, 10) 
        : null;
      
      // Existing course creation logic
      const course = await createNewCourse({
        title: courseData.title,
        description: courseData.description,
        categoryId: categoryId,
        semester: courseData.semester,
        thumbnail: courseData.thumbnail,
        isPublished: true,
        lectures: courseData.lectures
      }, user.id);
  
      // Add lectures to the course
      if (courseData.lectures && courseData.lectures.length > 0) {
        const lectureInsertPromises = courseData.lectures.map(async (lecture, index) => {
          try {
            // Create lecture
            const newLecture = await addLecturesToCourse(course.id, [{
              title: lecture.title,
              order: index + 1
            }]);
  
            // Upload lecture content if PDF exists
            if (lecture.pdfFile && newLecture && newLecture[0]) {
              await uploadLectureContentFile(
                newLecture[0].id, 
                lecture.pdfFile, 
                lecture.contentType || 'slides'
              );
            }
          } catch (lectureError) {
            console.error(`Error processing lecture ${lecture.title}:`, lectureError);
          }
        });
  
        await Promise.allSettled(lectureInsertPromises);
      }
  
      // Final publication step
      await publishCourse(course.id);
  
      // Show success message
      setSuccessMessage('Course published successfully!');
      setEnrollmentKey(course.enrollment_key);
      setShowEnrollmentKey(true);
      
    } catch (error) {
      console.error('Comprehensive course publish error:', error);
      setErrorMessage(`Failed to publish course: ${error.message || 'Unknown error'}`);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Copy Enrollment Key
  const copyEnrollmentKey = () => {
    navigator.clipboard.writeText(enrollmentKey)
      .then(() => {
        // Show a temporary message that copying was successful
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
          copyBtn.textContent = '✓';
          setTimeout(() => {
            copyBtn.textContent = '📋';
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // After successful enrollment key dialog close, navigate to teacher courses
  const handleEnrollmentKeyClose = () => {
    setShowEnrollmentKey(false);
    navigate("/TeacherMyCourses");
  };
  
  // Render Basic Information step
  const renderBasicInfo = () => (
    <div className="form-container">
      <h2>Basic Information</h2>
      
      {validationError && (
        <div className="validation-error">
          {validationError}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          placeholder="Your course title"
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
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
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
      <h2>Advance Information</h2>
      
      {validationError && (
        <div className="validation-error">
          {validationError}
        </div>
      )}
      
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
        <Button 
          variant="dark" 
          onClick={handlePublishCourse}
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : "Publish Course"}
        </Button>
      </div>
    </div>
  );
  
  // Render Enrollment Key Dialog
  const renderEnrollmentKeyDialog = () => (
    <DialogBox
      isOpen={showEnrollmentKey}
      title="COURSE ENROLLMENT KEY"
      onClose={handleEnrollmentKeyClose}
    >
      <div className="enrollment-key-container">
        <p>Your course has been successfully published! Share this enrollment key with your students:</p>
        <h3 className="enrollment-key">
          {enrollmentKey} 
          <button className="copy-btn" onClick={copyEnrollmentKey}>📋</button>
        </h3>
        <Button variant="dark" onClick={handleEnrollmentKeyClose}>OK</Button>
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
        <div className="step-completion">{currentStep === "curriculum" ? "✓" : "2/3"}</div>
      </div>
      
      <div className={`step-indicator ${currentStep === "curriculum" ? "active" : ""}`}>
        <div className="step-icon">
          <FaCopy />
        </div>
        <div className="step-label">Curriculum</div>
        <div className="step-completion">{currentStep === "curriculum" ? "3/3" : ""}</div>
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
                <p className="greeting">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}</p>
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
            
            <ErrorDialogBox
              isOpen={showErrorDialog}
              title="Error"
              message={errorMessage}
              onClose={() => setShowErrorDialog(false)}
            />
          </div>
          
          <SimpleFooter />
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;