import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function usePurchaseItems() {
  return useQuery({ queryKey: ['purchase-items'], queryFn: api.getPurchaseItems });
}

export function usePurchaseItem(id: string) {
  return useQuery({ queryKey: ['purchase-items', id], queryFn: () => api.getPurchaseItem(id) });
}
