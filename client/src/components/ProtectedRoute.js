// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/sign-up" />;
};

export default ProtectedRoute;
