import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MockupPage from "./pages/TeacherDashboard.js";
import StudentDashboard from "./pages/StudentDashboard.js"; // Ensure the correct path
import SignUp from "./pages/SignUp.js"; // Ensure the correct path
import SignIn from "./pages/SignIn";
import UserPersonalDetail from "./pages/UserPersonalDetail";
import StudentCourseContent from "./pages/StudentCourseContent";
import Quiz from "./pages/Quiz.js";
import Assignment from "./pages/Assignment.js";
import EnrolledCourses from "./pages/EnrolledCourses.js";
import CreateCourse from "./pages/CreateCourse.js";
import UploadCourseContent from "./pages/UploadCourseContent.js";
import Vta from "./pages/Vta.js";




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
          <Route path="/Assignment" element={<Assignment />} />
          <Route path="/Quiz" element={<Quiz />} />
          <Route path="/EnrolledCourses" element={<EnrolledCourses />} />
          <Route path="/CreateCourse" element={<CreateCourse />} />
          <Route path="/UploadCourseContent" element={<UploadCourseContent />} />
          <Route path="/Vta" element={<Vta />} />



          


    
        </Routes>
      </Router>

      </div>
  );
}

export default App;