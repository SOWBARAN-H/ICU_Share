import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useICUStore, parseJwt } from '../store/icuStore';

/**
 * Route protection guard for ICU Share.
 * Enforces authenticated JWT session validation, role-based boundary separation,
 * and preserves requested route navigation on redirection.
 */
export const ProtectedRoute = ({ role, children }) => {
  const { currentRole } = useICUStore();
  const location = useLocation();

  const token = localStorage.getItem('icu_auth_token');
  const decoded = parseJwt(token);

  // 1. Unauthenticated access check
  if (!token || !decoded) {
    const loginPath = role === 'hospital' ? '/hospital/login' : '/user/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Role-based access validation based on authenticated token payload
  const tokenRole = decoded.role ? decoded.role.toLowerCase() : currentRole;

  if (role && tokenRole !== role.toLowerCase()) {
    // Role boundary violation:
    // A USER cannot access hospital routes, and a HOSPITAL cannot access user routes.
    const loginPath = role === 'hospital' ? '/hospital/login' : '/user/login';
    return <Navigate to={loginPath} state={{ from: location, roleMismatch: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
