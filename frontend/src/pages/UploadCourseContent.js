import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import ErrorDialogBox from "../components/ErrorDialogBox";
import { FaChevronDown, FaHome, FaPlusCircle, FaBook } from "react-icons/fa";
import { BsTrash, BsPencil } from "react-icons/bs";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useAuth } from "../utils/authContext";
import { 
  getCourseDetails, 
  addLecturesToCourse, 
  uploadLectureFile, 
  updateLecture 
} from "../utils/api-service";
import "../styles/UploadCourseContent.css";

const UploadCourseContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get course context from location state
  const courseContext = location.state?.courseContext || {
    courseId: null,
    courseTitle: "Unknown Course"
  };

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
  
  // State for error dialog
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // State for success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // File input refs
  const slidesInputRef = useRef();
  const notesInputRef = useRef();

  // Fetch course data if courseId is available
  useEffect(() => {
    const fetchCourseData = async () => {
      if (courseContext.courseId && user) {
        try {
          const courseData = await getCourseDetails(courseContext.courseId);
          
          if (courseData && courseData.lectures) {
            // Map lectures to our component format
            const formattedLectures = courseData.lectures.map(lecture => {
              const files = [];
              
              // If lecture has content, add it to files
              if (lecture.lecture_content) {
                lecture.lecture_content.forEach(content => {
                  files.push({
                    id: content.id,
                    name: content.file_name,
                    type: content.content_type_id === 1 ? 'slides' : 'notes',
                    url: content.file_url,
                    size: content.file_size || 0
                  });
                });
              }
              
              return {
                id: lecture.id,
                name: lecture.title,
                files
              };
            });
            
            if (formattedLectures.length > 0) {
              setLectures(formattedLectures);
            }
          }
        } catch (error) {
          console.error("Error fetching course data:", error);
        }
      }
    };
    
    fetchCourseData();
  }, [courseContext.courseId, user]);

  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaHome, href: "/TeacherDashboard" },
    { label: "My Courses", icon: FaBook, href: "/TeacherMyCourses" },
    { label: "Create a Course", icon: FaPlusCircle, href: "/CreateCourse" },
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
  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file || !currentLectureId) return;
    
    setIsLoading(true);
    
    try {
      // Upload file to server/storage
      const uploadedContent = await uploadLectureFile(currentLectureId, file, fileType);
      
      // Update the local state to reflect the uploaded file
      const updatedLectures = lectures.map(lecture => {
        if (lecture.id === currentLectureId) {
          return {
            ...lecture,
            files: [
              ...lecture.files, 
              { 
                id: uploadedContent.id, 
                name: file.name, 
                type: fileType, 
                size: file.size,
                url: uploadedContent.file_url 
              }
            ]
          };
        }
        return lecture;
      });
      
      setLectures(updatedLectures);
      
      // Show success message
      setSuccessMessage(`${fileType === 'slides' ? 'Slides' : 'Notes'} uploaded successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage(`Failed to upload ${fileType}. Please try again.`);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = null;
    }
  };

  /// Fix for the saveLectureEdit function in UploadCourseContent.js
// Replace the existing saveLectureEdit function with this improved version

const saveLectureEdit = async () => {
  if (!currentLectureId || !dialogContent.trim()) {
    setErrorMessage("Lecture name cannot be empty");
    setShowErrorDialog(true);
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Check for duplicate names
    const isDuplicate = lectures
      .filter(lecture => lecture.id !== currentLectureId)
      .some(lecture => lecture.name.toLowerCase() === dialogContent.toLowerCase());
      
    if (isDuplicate) {
      setErrorMessage("Lecture name already exists. Please use a different name.");
      setShowErrorDialog(true);
      setIsLoading(false);
      return;
    }
    
    // If this is a real lecture (not just local), update it on the server
    if (courseContext.courseId && typeof currentLectureId !== 'undefined') {
      try {
        // Call the API to update the lecture name in the database
        console.log("Updating lecture in database:", currentLectureId, dialogContent);
        
        // Import updateLecture function from api-service if it exists, or implement it here
        const updatedLecture = await updateLecture(currentLectureId, dialogContent);
        console.log("Lecture updated in database:", updatedLecture);
      } catch (updateError) {
        console.error("Error updating lecture in database:", updateError);
        // Continue with UI update even if database update fails
      }
    }
    
    // Update lecture in local state
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
    
    // Show success message
    setSuccessMessage("Lecture name updated successfully!");
    setShowSuccessDialog(true);
  } catch (error) {
    console.error("Error updating lecture:", error);
    setErrorMessage("Failed to update lecture. Please try again.");
    setShowErrorDialog(true);
  } finally {
    setIsLoading(false);
  }
};
 // Fix for the addLecture function in UploadCourseContent.js
// Replace the existing addLecture function with this improved version

const addLecture = async () => {
  setIsLoading(true);
  
  try {
    // Get the current number of lectures to determine the new lecture number
    const lectureCount = lectures.length;
    const newLectureNumber = lectureCount + 1;
    const newLectureName = `Lecture ${newLectureNumber}`;
    
    // If courseId exists, add the lecture to the database
    if (courseContext.courseId) {
      // Add lecture to the course on the server
      const addedLectures = await addLecturesToCourse(courseContext.courseId, [
        { title: newLectureName }
      ]);
      
      if (addedLectures && addedLectures.length > 0) {
        // Use the server-generated ID but ensure we're using our formatted name
        setLectures([
          ...lectures, 
          { 
            id: addedLectures[0].id, 
            name: newLectureName, 
            files: [] 
          }
        ]);
      } else {
        // Fallback to local ID if server response is invalid
        const newId = Math.max(...lectures.map(l => l.id), 0) + 1;
        setLectures([
          ...lectures, 
          { 
            id: newId, 
            name: newLectureName, 
            files: [] 
          }
        ]);
      }
    } else {
      // Just add locally if no courseId
      const newId = Math.max(...lectures.map(l => l.id), 0) + 1;
      setLectures([
        ...lectures, 
        { 
          id: newId, 
          name: newLectureName, 
          files: [] 
        }
      ]);
    }
  } catch (error) {
    console.error("Error adding lecture:", error);
    setErrorMessage("Failed to add new lecture. Please try again.");
    setShowErrorDialog(true);
  } finally {
    setIsLoading(false);
  }
};
  // Handle save/submit
  const handleSave = () => {
    // Navigate back to course content
    navigate(`/TeacherCourseContent/${courseContext.courseId || 'unknown'}`);
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
              <span>My Courses</span>
              <span className="separator">/</span>
              <span className="current">{courseContext.courseTitle}</span>
            </div>
          </div>

          {/* Course Content Container */}
          <div className="content-box">
            {/* Course Header */}
            <div className="course-header">
              <h2 className="course-title">{courseContext.courseTitle}</h2>
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
                        disabled={isLoading}
                      >
                        Actions
                        <FaChevronDown className="action-dropdown" />
                      </button>
                      
                      <div className="edit-delete-buttons">
                        <button 
                          className="icon-button" 
                          onClick={() => handleAction('edit', lecture.id)}
                          disabled={isLoading}
                        >
                          <BsPencil />
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handleAction('delete', lecture.id)}
                          disabled={isLoading}
                        >
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
                          disabled={isLoading}
                        >
                          Upload Lecture Slides
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleAction('upload_notes', lecture.id)}
                          disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "+ Add New Lecture"}
              </button>
            </div>

            {/* Display uploaded files */}
            <div className="uploaded-files">
              <h3>Uploaded Files</h3>
              {lectures.flatMap(lecture => 
                lecture.files.map((file, index) => (
                  <div key={`${lecture.id}-${index}`} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-type">{file.type === 'slides' ? 'Slides' : 'Notes'}</span>
                    <span className="file-lecture">{lecture.name}</span>
                    {file.url && (
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-view-link"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))
              )}
              
              {lectures.flatMap(lecture => lecture.files).length === 0 && (
                <p className="no-files-message">No files uploaded yet. Use the Actions menu to upload files.</p>
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="bottom-buttons">
            <Button 
              variant="light" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="dark" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save and Return to Course"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <SimpleFooter />
      </div>

      {/* Dialog Box for editing lecture name */}
      <DialogBox 
        isOpen={isDialogOpen} 
        title="Edit Lecture" 
        onClose={() => setIsDialogOpen(false)}
      >
        <div>
          <input 
            type="text" 
            className="dialog-input" 
            placeholder="Lecture Name" 
            value={dialogContent}
            onChange={(e) => setDialogContent(e.target.value)}
          />
          <div className="dialog-actions">
            <Button 
              variant="light" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="dark" 
              onClick={saveLectureEdit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogBox>
      
      {/* Error Dialog */}
      <ErrorDialogBox
        isOpen={showErrorDialog}
        title="Error"
        message={errorMessage}
        onClose={() => setShowErrorDialog(false)}
      />
      
      {/* Success Dialog */}
      <DialogBox
        isOpen={showSuccessDialog}
        title="Success"
        onClose={() => setShowSuccessDialog(false)}
      >
        <div className="success-dialog">
          <p>{successMessage}</p>
          <Button variant="dark" onClick={() => setShowSuccessDialog(false)}>
            OK
          </Button>
        </div>
      </DialogBox>
    </div>
  );
};

export default UploadCourseContent;