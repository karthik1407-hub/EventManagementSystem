export interface Order {
  id: string;
  userId: string;
  email?: string;
  paymentId: string;
  status: OrderStatus;
  createdDate: string;
  updatedDate: string;
  statusString: string;
  items?: OrderItem[];
  paymentAmount?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string;
  createdDate: string;
}

export enum OrderStatus {
  Processing = 0,
  Confirmed = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}

export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}

export interface UpdateOrderDto {
  status: number;
}
