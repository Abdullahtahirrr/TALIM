import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SimpleFooter from "../components/SimpleFooter";
import Button from "../components/Button";
import DialogBox from "../components/DialogBox";
import { FaChartBar, FaBook, FaPlus, FaSpinner, FaDownload } from "react-icons/fa";
import { generateAssessment } from "../utils/api-service";
import { jsPDF } from "jspdf";
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
  const [totalMarks, setTotalMarks] = useState("");
  const [rubric, setRubric] = useState("");
  const [additionalReq, setAdditionalReq] = useState("");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Loading and results state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate form
    if (!lectureName || !keyTopic) {
      alert("Please provide at least the lecture name and key topic");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data object for backend
      const quizData = {
        Assessment_type: "Quiz",
        lecture_name: lectureName,
        KeyTopics: keyTopic,
        MCQS: mcqs || "1",
        Theortical: theoreticalQuestions || "1",
        Numerical: numericals || "1",
        Difficulty: difficultyLevel || "Medium",
        Version: versions || "1",
        Total_marks: totalMarks || "10",
        Rubric: rubric || "No",
        Additional_requirements: additionalReq || ""
      };
      
      // Call the API service
      const result = await generateAssessment(quizData);
      
      if (result.assessment) {
        // Store result without displaying it
        setGeneratedQuiz(result.assessment);
        
        // Open dialog
        setIsDialogOpen(true);
      } else {
        alert("Failed to generate quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quiz download as PDF
  const handleDownload = () => {
    if (!generatedQuiz) return;
    
    try {
      // Create PDF document
      const doc = new jsPDF();
      
      // Set title
      doc.setFontSize(16);
      doc.text(`Quiz: ${lectureName}`, 20, 20);
      
      // Add metadata
      doc.setFontSize(12);
      doc.text(`Topic: ${keyTopic}`, 20, 30);
      doc.text(`Difficulty: ${difficultyLevel || "Medium"}`, 20, 40);
      doc.text(`Total Marks: ${totalMarks || "10"}`, 20, 50);
      
      // Split content into lines and add to PDF with proper formatting
      const contentLines = generatedQuiz.split('\n');
      let yPosition = 60;
      const maxWidth = 170;
      
      contentLines.forEach(line => {
        // Skip empty lines
        if (line.trim() === '') {
          yPosition += 5;
          return;
        }
        
        // Check if line is a heading (starts with # or ##)
        if (line.startsWith('# ')) {
          yPosition += 10;
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(line.substring(2), 20, yPosition);
          doc.setFont(undefined, 'normal');
          doc.setFontSize(12);
          yPosition += 10;
        } else if (line.startsWith('## ')) {
          yPosition += 7;
          doc.setFontSize(13);
          doc.setFont(undefined, 'bold');
          doc.text(line.substring(3), 20, yPosition);
          doc.setFont(undefined, 'normal');
          doc.setFontSize(12);
          yPosition += 7;
        } else {
          // Handle text wrapping for long lines
          const splitText = doc.splitTextToSize(line, maxWidth);
          splitText.forEach(textLine => {
            // Add a new page if we're near the bottom
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            
            doc.text(textLine, 20, yPosition);
            yPosition += 7;
          });
        }
      });
      
      // Save the PDF
      doc.save(`Quiz_${lectureName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Could not generate PDF. Downloading as text file instead.");
      
      // Fallback to text file if PDF generation fails
      const blob = new Blob([generatedQuiz], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quiz_${lectureName.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Dialog content renderer - simplified to just show success message and download button
  const renderDialogContent = () => (
    <div className="quiz-dialog-content">
      <div className="success-message">
        <FaDownload size={40} className="success-icon" />
        <h3>Your quiz has been generated successfully!</h3>
        <p>Click the button below to download your quiz as a PDF file.</p>
      </div>
      
      <Button variant="dark" onClick={handleDownload}>
        Download Quiz
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
                  required
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
                  required
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
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
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
                    <option value="0">0</option>
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
                    <option value="0">0</option>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalmarks">Total Marks</label>
                  <select 
                    id="totalmarks"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
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
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
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