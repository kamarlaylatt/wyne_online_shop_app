import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: api.getOrders });
}

export function useOrder(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.getOrder(id),
    initialData: () => {
      const list = qc.getQueryData<import('@/types/models').Order[]>(['orders']);
      return list?.find((o) => o.id === id);
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
