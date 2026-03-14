import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { PaginatedResponse, PurchaseItem } from '@/types/models';

export function usePurchaseItems() {
  return useInfiniteQuery({
    queryKey: ['purchase-items'],
    queryFn: ({ pageParam }) => api.getPurchaseItems(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

export function usePurchaseItem(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['purchase-items', id],
    queryFn: () => api.getPurchaseItem(id),
    initialData: () => {
      const cached = qc.getQueryData<InfiniteData<PaginatedResponse<PurchaseItem>>>(['purchase-items']);
      return cached?.pages.flatMap((p) => p.data).find((i) => i.id === id);
    },
  });
}

export function useCreatePurchaseItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPurchaseItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-items'] }),
  });
}

export function useUpdatePurchaseItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.updatePurchaseItem>[1]) => api.updatePurchaseItem(id, body),
    onSuccess: (updated) => {
      qc.setQueryData(['purchase-items', id], updated);
      qc.invalidateQueries({ queryKey: ['purchase-items'] });
    },
  });
}

export function useDeletePurchaseItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deletePurchaseItem(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['purchase-items', id] });
      qc.invalidateQueries({ queryKey: ['purchase-items'] });
    },
  });
}
