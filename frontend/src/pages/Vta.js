import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaGraduationCap, FaBook, FaUserGraduate, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import "../styles/Vta.css";

const Vta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get course context from navigation state
  const courseContext = location.state?.courseContext || {
    courseTitle: "Artificial Intelligence Course",
    currentLesson: "Introduction to AI Concepts"
  };
  
  // State for chat messages
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content: `Hello! I am TALIM, your personal educational assistant for the course "${courseContext.courseTitle}". How may I help you with your studies on ${courseContext.currentLesson}?`,
      timestamp: new Date()
    }
  ]);
  
  // State for the current message being typed
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Reference to chat container for auto-scrolling
  const chatContainerRef = useRef(null);
  
  // Sidebar links configuration
  const sidebarLinks = [
    { label: "Dashboard", icon: FaGraduationCap, href: "/StudentDashboard" },
    { label: "My Courses", icon: FaBook, href: "/StudentMyCourses" },
    { label: "Profile", icon: FaUserGraduate, href: "/UserPersonalDetail" }
  ];
  
  // Formats the timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Formats the date for message grouping
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Handles sending a new message
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      sender: "user",
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setCurrentMessage("");
    
    // Simulate bot response (this would be replaced with your API call to your RAG system)
    setTimeout(async () => {
      let botResponse;
      
      // Simple pattern matching for demo purposes
      if (currentMessage.toLowerCase().includes("what is ai")) {
        botResponse = "Artificial intelligence is a technology that allows computers to perform tasks that typically require human intelligence, such as learning, problem-solving, and understanding natural language.";
      } else if (currentMessage.toLowerCase().includes("hello") || currentMessage.toLowerCase().includes("hi")) {
        botResponse = "Hello! How can I assist you with your studies today?";
      } else if (currentMessage.toLowerCase().includes("help") || currentMessage.toLowerCase().includes("assistance")) {
        botResponse = `I can help you understand concepts from ${courseContext.currentLesson}, explain difficult topics, or answer questions about the course materials. What specific aspect are you finding challenging?`;
      } else if (currentMessage.toLowerCase().includes("instructor") || currentMessage.toLowerCase().includes("teacher")) {
        botResponse = `This course is taught by ${courseContext.instructor || "an expert instructor"}. They have designed the curriculum to help you master the concepts step by step.`;
      } else {
        botResponse = `I'm here to help with your questions about ${courseContext.courseTitle}. Currently, we're studying ${courseContext.currentLesson}. What specific topic would you like to explore further?`;
      }
      
      const botMessage = {
        sender: "bot",
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };
  
  // Handles pressing enter to send a message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  return (
    <div className="vta-container">
      {/* Sidebar */}
      <Sidebar links={sidebarLinks} />
      
      <div className="vta-main-content">
        {/* Navbar */}
        <Navbar />
        
        {/* Chat Interface */}
        <div className="vta-chat-section">
          {/* Chat Header */}
          <div className="vta-chat-header">
            <button className="vta-back-button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            
            <div className="vta-bot-info">
              <div className="vta-bot-avatar">
                <div className="vta-bot-icon">T</div>
              </div>
              <div className="vta-bot-details">
                <h3 className="vta-bot-name">TALIM Bot</h3>
                <div className="vta-bot-status">
                  <span className="vta-status-dot"></span>
                  <span className="vta-status-text">Always active</span>
                </div>
              </div>
            </div>
            
            <div className="vta-course-info">
              <span>Currently viewing: {courseContext.courseTitle}</span>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="vta-chat-messages" ref={chatContainerRef}>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="vta-message-group">
                <div className="vta-date-divider">
                  <span>{date}</span>
                </div>
                
                {dateMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`vta-message ${message.sender === "bot" ? "vta-bot-message" : "vta-user-message"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="vta-bot-avatar-small">
                        <div className="vta-bot-icon-small">T</div>
                      </div>
                    )}
                    <div className={`vta-message-bubble ${message.sender === "bot" ? "vta-bot-bubble" : "vta-user-bubble"}`}>
                      {message.content}
                    </div>
                    <span className="vta-message-time">{formatTime(message.timestamp)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="vta-chat-input-area">
            <div className="vta-input-container">
              <input
                type="text"
                className="vta-message-input"
                placeholder="Type a message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="vta-send-button"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vta;