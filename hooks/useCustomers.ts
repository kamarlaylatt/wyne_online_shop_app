import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Customer } from '@/types/models';

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: api.getCustomers });
}

export function useCustomer(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.getCustomer(id),
    initialData: () => {
      const cached = qc.getQueryData<Customer[]>(['customers']);
      return cached?.find((c) => c.id === id);
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.updateCustomer>[1]) => api.updateCustomer(id, body),
    onSuccess: (updated) => {
      qc.setQueryData(['customers', id], updated);
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteCustomer(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['customers', id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
