// Enums
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

// Models
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { purchaseItems: number };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  totalPrice: number;
  quantity: number;
  supplierId: string;
  purchaseDate: string;
  sellPerPrice?: number;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  _count?: { orderItems: number };
}

export interface Order {
  id: string;
  customerId: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  purchaseItemId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
  purchaseItem?: PurchaseItem;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
}
