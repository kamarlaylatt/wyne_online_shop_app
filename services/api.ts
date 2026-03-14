import http from '@/services/http';
import type { Supplier, Customer, PurchaseItem, Order, OrderItem, OrderStatus, PaymentStatus, PaginatedResponse } from '@/types/models';

export type OrderItemInput = { purchaseItemId: string; quantity: number; unitPrice: number };

export type UpdateOrderBody = {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  items?: OrderItemInput[];
};

export type CreateOrderBody =
  | { customer: { name: string; phone?: string; address?: string }; items: OrderItemInput[]; status?: OrderStatus; paymentStatus?: PaymentStatus }
  | { customerId: string; items: OrderItemInput[]; status?: OrderStatus; paymentStatus?: PaymentStatus };

export const api = {
  // Suppliers
  getSuppliers: (): Promise<Supplier[]> =>
    http.get('/suppliers').then((r) => r.data),
  getSupplier: (id: string): Promise<Supplier> =>
    http.get(`/suppliers/${id}`).then((r) => r.data),
  createSupplier: (body: { name: string; phone?: string; email?: string }): Promise<Supplier> =>
    http.post('/suppliers', body).then((r) => r.data),
  updateSupplier: (id: string, body: { name?: string; phone?: string; email?: string | null }): Promise<Supplier> =>
    http.put(`/suppliers/${id}`, body).then((r) => r.data),
  deleteSupplier: (id: string): Promise<Supplier> =>
    http.delete(`/suppliers/${id}`).then((r) => r.data),

  // Customers
  getCustomers: (): Promise<Customer[]> =>
    http.get('/customers').then((r) => r.data),
  getCustomer: (id: string): Promise<Customer> =>
    http.get(`/customers/${id}`).then((r) => r.data),
  createCustomer: (body: { name: string; phone?: string; address?: string }): Promise<Customer> =>
    http.post('/customers', body).then((r) => r.data),
  updateCustomer: (id: string, body: { name?: string; phone?: string; address?: string | null }): Promise<Customer> =>
    http.put(`/customers/${id}`, body).then((r) => r.data),
  deleteCustomer: (id: string): Promise<Customer> =>
    http.delete(`/customers/${id}`).then((r) => r.data),

  // Purchase Items
  getPurchaseItems: (page = 1, limit = 20): Promise<PaginatedResponse<PurchaseItem>> =>
    http.get('/purchase-items', { params: { page, limit } }).then((r) => r.data),
  getPurchaseItem: (id: string): Promise<PurchaseItem> =>
    http.get(`/purchase-items/${id}`).then((r) => r.data),
  createPurchaseItem: (body: { name: string; totalPrice: number; quantity: number; supplierId: string; purchaseDate: string; sellPerPrice?: number }): Promise<PurchaseItem> =>
    http.post('/purchase-items', body).then((r) => r.data),
  updatePurchaseItem: (id: string, body: { name?: string; totalPrice?: number; quantity?: number; supplierId?: string; purchaseDate?: string; sellPerPrice?: number | null }): Promise<PurchaseItem> =>
    http.put(`/purchase-items/${id}`, body).then((r) => r.data),
  deletePurchaseItem: (id: string): Promise<PurchaseItem> =>
    http.delete(`/purchase-items/${id}`).then((r) => r.data),

  // Orders
  getOrders: (page = 1, limit = 20): Promise<PaginatedResponse<Order>> =>
    http.get('/orders', { params: { page, limit } }).then((r) => r.data),
  getOrder: (id: string): Promise<Order> =>
    http.get(`/orders/${id}`).then((r) => r.data),
  getOrderPreload: (): Promise<{ purchaseItems: PurchaseItem[]; customers: Customer[] }> =>
    http.get('/orders/preload').then((r) => r.data),
  createOrder: (body: CreateOrderBody): Promise<Order> =>
    http.post('/orders', body).then((r) => r.data),
  updateOrder: (id: string, body: UpdateOrderBody): Promise<Order> =>
    http.put(`/orders/${id}`, body).then((r) => r.data),

  // Order Items
  getOrderItems: (orderId: string): Promise<OrderItem[]> =>
    http.get('/order-items', { params: { orderId } }).then((r) => r.data),
};
