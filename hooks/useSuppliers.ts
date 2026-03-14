import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Supplier } from '@/types/models';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: api.getSuppliers });
}

export function useSupplier(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => api.getSupplier(id),
    initialData: () => {
      const cached = qc.getQueryData<Supplier[]>(['suppliers']);
      return cached?.find((s) => s.id === id);
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.updateSupplier>[1]) => api.updateSupplier(id, body),
    onSuccess: (updated) => {
      qc.setQueryData(['suppliers', id], updated);
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteSupplier(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['suppliers', id] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
