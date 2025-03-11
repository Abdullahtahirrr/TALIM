import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';

// Enhanced ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/SignIn" />;
  }
  
  return children;
};

export default ProtectedRoute;