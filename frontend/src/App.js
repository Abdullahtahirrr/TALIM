import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/authContext';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentMyCourses from './pages/StudentMyCourses';
import TeacherMyCourses from './pages/TeacherMyCourses';
import StudentCourseContent from './pages/StudentCourseContent';
import TeacherCourseContent from './pages/TeacherCourseContent';
import CreateCourse from './pages/CreateCourse';
import UploadCourseContent from './pages/UploadCourseContent';
import UserPersonalDetail from './pages/UserPersonalDetail';
import EnrolledCourses from './pages/EnrolledCourses';
import Quiz from './pages/Quiz';
import Assignment from './pages/Assignment';
import Vta from './pages/Vta';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/SignIn" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/SignIn" />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route path="/StudentDashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/TeacherDashboard" element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/StudentMyCourses" element={
            <ProtectedRoute>
              <StudentMyCourses />
            </ProtectedRoute>
          } />
          
          <Route path="/TeacherMyCourses" element={
            <ProtectedRoute>
              <TeacherMyCourses />
            </ProtectedRoute>
          } />
          
          <Route path="/StudentCourseContent/:courseId" element={
            <ProtectedRoute>
              <StudentCourseContent />
            </ProtectedRoute>
          } />
          
          <Route path="/TeacherCourseContent/:courseId" element={
            <ProtectedRoute>
              <TeacherCourseContent />
            </ProtectedRoute>
          } />
          
          <Route path="/CreateCourse" element={
            <ProtectedRoute>
              <CreateCourse />
            </ProtectedRoute>
          } />
          
          <Route path="/UploadCourseContent" element={
            <ProtectedRoute>
              <UploadCourseContent />
            </ProtectedRoute>
          } />
          
          <Route path="/UserPersonalDetail" element={<UserPersonalDetail />} />
          
          <Route path="/EnrolledCourses" element={
            <ProtectedRoute>
              <EnrolledCourses />
            </ProtectedRoute>
          } />
          
          <Route path="/Quiz" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />
          
          <Route path="/Assignment" element={
            <ProtectedRoute>
              <Assignment />
            </ProtectedRoute>
          } />
          
          <Route path="/Vta" element={
            <ProtectedRoute>
              <Vta />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;