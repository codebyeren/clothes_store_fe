import { ApiResponse } from './api-response.model';

export interface OrderItem {
  id: number;
  productName: string;
  price: number;
  img: string;
  slug: string;
  color: string;
  size: string;
  quantity: number;
  discount: number;
  total: number;
}

export interface Order {
  id: number;
  userId: number;
  paymentTime: string;
  total: number;
  status: string;
  orderItems: OrderItem[];
}

export interface CreateOrderRequest {
  orderItems: {
    productId: number;
    color: string;
    size: string;
    quantity: number;
    discount: number;
  }[];
}

export type OrderResponse<T> = ApiResponse<T>; 