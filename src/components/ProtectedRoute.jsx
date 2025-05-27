import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, onLoginClick, children }) => {
  useEffect(() => {
    if (!isAuthenticated) {
      onLoginClick();
    }
  }, [isAuthenticated, onLoginClick]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 