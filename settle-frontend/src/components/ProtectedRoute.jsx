import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
 
  const { state } = useApp();

  if (!state.isAuthenticated) {
    
    return <Navigate to="/auth" replace />;
  }

  return children;
}