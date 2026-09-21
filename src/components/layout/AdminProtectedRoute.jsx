import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
export default function AdminProtectedRoute() { const { isAuthenticated, role } = useAuthStore(); return isAuthenticated && role === 'SUPER_ADMIN' ? <Outlet /> : <Navigate to="/admin/login" replace />; }
