import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const STAFF_RESTRICTED_PATHS = [
  '/owner/earnings',
  '/owner/reports',
  '/owner/profile',
  '/owner/venues/new',
  '/owner/billing',
  '/owner/team',
];

export default function OwnerProtectedRoute() {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />;
  }

  if (role !== 'BUSINESS_OWNER' && role !== 'STAFF') {
    return <Navigate to="/owner/login" replace />;
  }

  if (role === 'STAFF' && STAFF_RESTRICTED_PATHS.some((path) => location.pathname.startsWith(path))) {
    return <Navigate to="/owner" replace />;
  }

  return <Outlet />;
}

