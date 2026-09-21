import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../stores/authStore';
import * as api from '../api/admin';

export function useAdminLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  return useMutation({ mutationFn: api.adminLogin, onSuccess: (result) => { login(result.admin, result, { role: result.role }); navigate('/admin'); } });
}
export const useAdminDashboard = () => useQuery({ queryKey: ['admin-dashboard'], queryFn: api.getAdminDashboard });
export const useAdminBusinesses = () => useQuery({ queryKey: ['admin-businesses'], queryFn: () => api.getAdminBusinesses({ size: 100, sort: 'createdAt,desc' }), select: (value) => value?.content || [] });
export const useAdminVenues = () => useQuery({ queryKey: ['admin-venues'], queryFn: () => api.getAdminVenues({ size: 100, sort: 'createdAt,desc' }), select: (value) => value?.content || [] });
export const useAdminCustomers = () => useQuery({ queryKey: ['admin-customers'], queryFn: () => api.getAdminCustomers({ size: 100 }), select: (value) => value?.content || [] });
export const useAdminAudit = () => useQuery({ queryKey: ['admin-audit'], queryFn: () => api.getAdminAudit({ size: 100 }), select: (value) => value?.content || [] });
export const useHomepageDraft = () => useQuery({ queryKey: ['admin-homepage'], queryFn: api.getHomepageDraft });
export function useAdminAction(mutationFn, invalidates) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: () => { invalidates.forEach((key) => client.invalidateQueries({ queryKey: [key] })); toast.success('Admin action completed'); }, onError: (error) => toast.error(error.response?.data?.message || 'Action failed') }); }
