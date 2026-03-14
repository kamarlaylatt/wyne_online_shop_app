import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: api.getCustomers });
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: ['customers', id], queryFn: () => api.getCustomer(id) });
}
