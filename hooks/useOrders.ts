import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { PaginatedResponse, Order } from '@/types/models';

export function useOrders() {
  return useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: ({ pageParam }) => api.getOrders(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

export function useOrder(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.getOrder(id),
    initialData: () => {
      const cached = qc.getQueryData<InfiniteData<PaginatedResponse<Order>>>(['orders']);
      return cached?.pages.flatMap((p) => p.data).find((o) => o.id === id);
    },
    retry: (_, err: any) => err?.response?.status !== 404,
  });
}

export function useOrderItems(orderId: string) {
  return useQuery({ queryKey: ['order-items', orderId], queryFn: () => api.getOrderItems(orderId) });
}

export function useOrderPreload({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: ['order-preload'], queryFn: api.getOrderPreload, enabled });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: import('@/services/api').UpdateOrderBody) => api.updateOrder(id, body),
    onSuccess: (updated) => {
      qc.setQueryData(['orders', id], updated);
      if (updated.orderItems) {
        qc.setQueryData(['order-items', id], updated.orderItems);
      }
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order-items', id] });
    },
  });
}
