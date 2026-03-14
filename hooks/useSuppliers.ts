import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: api.getSuppliers });
}

export function useSupplier(id: string) {
  return useQuery({ queryKey: ['suppliers', id], queryFn: () => api.getSupplier(id) });
}
