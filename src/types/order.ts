export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderUser {
  _id: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  phone?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  zipCode?: string;
  postalCode?: string;
  state?: string;
  country: string;
}

export interface OrderItemProduct {
  _id: string;
  name?: string;
  title?: string;
  images?: string[];
  imageUrl?: string;
  price?: number;
  stock?: number;
}

export interface OrderItem {
  _id?: string;
  product?: OrderItemProduct | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
  subtotal?: number;
}

export interface PaymentInfo {
  method: "STRIPE" | "COD" | "PAYPAL" | string;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  paidAt?: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: OrderUser;
  status: OrderStatus;
  paymentInfo: PaymentInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  cancelReason?: string;
  timeline?: TimelineEvent[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderSummaryMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface OrdersPagination {
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  cancelReason?: string;
}
