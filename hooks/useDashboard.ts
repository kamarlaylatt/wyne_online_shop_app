import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard'], queryFn: api.getDashboardStats });
}
