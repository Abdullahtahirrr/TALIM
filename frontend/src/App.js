import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MockupPage from "./pages/TeacherDashboard.js";
import StudentDashboard from "./pages/StudentDashboard.js"; // Ensure the correct path
import SignUp from "./pages/SignUp.js"; // Ensure the correct path
import SignIn from "./pages/SignIn";
import UserPersonalDetail from "./pages/UserPersonalDetail";
import StudentCourseContent from "./pages/StudentCourseContent";


function App() {
  return (
    <div>
      {/* <MockupPage /> */}
      <Router>
        <Routes>
          <Route path="/" element={<MockupPage />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />   
          <Route path="/UserPersonalDetail" element={<UserPersonalDetail />} />
          <Route path="/course" element={<StudentCourseContent />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />


    
        </Routes>
      </Router>

      </div>
  );
}

export default App;