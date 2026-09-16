import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function OwnerProtectedRoute() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />;
  }

  if (role !== 'BUSINESS_OWNER' && role !== 'STAFF') {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
}
