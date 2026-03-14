import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

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
  return useQuery({ queryKey: ['purchase-items', id], queryFn: () => api.getPurchaseItem(id) });
}
