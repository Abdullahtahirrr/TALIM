import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SimpleFooter from "../components/SimpleFooter";
import Button from "../components/Button";
import DialogBox from "../components/DialogBox";
import { FaChartBar, FaBook, FaPlus, FaUserGraduate, FaQuestionCircle } from "react-icons/fa";
import "../styles/Quiz.css";

const Quiz = () => {
  // Sidebar links configuration
  const sidebarLinks = [
    { icon: FaChartBar, label: "Dashboard", href: "/TeacherDashboard" },
    { icon: FaPlus, label: "Create New Course", href: "/CreateCourse" },
    { icon: FaBook, label: "My Courses", href: "/TeacherMyCourses" },
  ];

  // Form state
  const [lectureName, setLectureName] = useState("");
  const [keyTopic, setKeyTopic] = useState("");
  const [mcqs, setMcqs] = useState("");
  const [theoreticalQuestions, setTheoreticalQuestions] = useState("");
  const [numericals, setNumericals] = useState("");
  const [versions, setVersions] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [rubric, setRubric] = useState("");
  const [additionalReq, setAdditionalReq] = useState("");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Here you would handle the form submission logic
    setIsDialogOpen(true);
  };

  // Dialog content renderer
  const renderDialogContent = () => (
    <div className="quiz-dialog-content">
      <p>Your quiz has been generated successfully!</p>
      <Button variant="dark" onClick={() => console.log("Download clicked")}>
        Download <span className="download-icon">↓</span>
      </Button>
    </div>
  );

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="quiz-page-container">
      <Sidebar links={sidebarLinks} />
      
      <div className="quiz-main-content">
        <Navbar />
        
        <div className="quiz-content-area">
          <div className="greeting-section">
            <p>{getGreeting()}</p>
            <h1>Generate Quiz</h1>
          </div>
          
          <div className="quiz-form-container">
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="lectureName">Lecture Name</label>
                <input
                  type="text"
                  id="lectureName"
                  placeholder="Lecture Title Here"
                  value={lectureName}
                  onChange={(e) => setLectureName(e.target.value)}
                  maxLength="80"
                />
                <div className="character-count">{lectureName.length}/80</div>
                <label htmlFor="keyTopic">Key Topic</label>
                <input
                  type="text"
                  id="keyTopic"
                  placeholder="Key Topic Here"
                  value={keyTopic}
                  onChange={(e) => setKeyTopic(e.target.value)}
                  maxLength="80"
                />
                <div className="character-count">{keyTopic.length}/80</div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mcqs">Number of MCQs</label>
                  <select 
                    id="mcqs"
                    value={mcqs}
                    onChange={(e) => setMcqs(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="theoretical">Number of Theoretical Questions</label>
                  <select 
                    id="theoretical"
                    value={theoreticalQuestions}
                    onChange={(e) => setTheoreticalQuestions(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numericals">Number of Numericals</label>
                  <select 
                    id="numericals"
                    value={numericals}
                    onChange={(e) => setNumericals(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty Level</label>
                  <select 
                    id="difficulty"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="versions">Number of Versions</label>
                  <select 
                    id="versions"
                    value={versions}
                    onChange={(e) => setVersions(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="rubric">Generate Rubric</label>
                  <select 
                    id="rubric"
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="additionalReq">Additional Requirements: </label>
                <input
                  type="text"
                  id="additionalReq"
                  placeholder="Enter Additional Requirements Here"
                  value={additionalReq}
                  onChange={(e) => setAdditionalReq(e.target.value)}
                  maxLength="200"
                />
                <div className="character-count">{additionalReq.length}/200</div>
                </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Generate 
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <SimpleFooter />
      </div>
      
      <DialogBox 
        isOpen={isDialogOpen} 
        title="QUIZ GENERATED" 
        onClose={() => setIsDialogOpen(false)}
      >
        {renderDialogContent()}
      </DialogBox>
    </div>
  );
};

export default Quiz;