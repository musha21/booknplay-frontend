import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const isCustomer = isAuthenticated && role === 'CUSTOMER';

  if (!isCustomer) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location, reason: 'booking' }}
      />
    );
  }

  return <Outlet />;
}
