// client/src/components/PrivateRoute.js

// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wrap any protected element in <PrivateRoute>…</PrivateRoute>.
 * If a token exists in localStorage, render children; otherwise redirect.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;