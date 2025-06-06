import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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

export interface ResponseObject<T> {
  code: number;
  message: string;
  data: T;
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

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createOrder(orderData: CreateOrderRequest): Observable<ResponseObject<any>> {
    return this.http.post<ResponseObject<any>>(`${this.apiUrl}`, orderData);
  }

  getOrders(): Observable<ResponseObject<Order[]>> {
    return this.http.get<ResponseObject<Order[]>>(`${this.apiUrl}`);
  }

  /**
   * Sends a request to cancel a specific order.
   * @param orderId The ID of the order to cancel.
   * @returns Observable of the API response.
   */
  cancelOrder(orderId: number): Observable<ResponseObject<any>> {
    const body = { id: orderId, status: 'Cancelled' };
    return this.http.put<ResponseObject<any>>(`${this.apiUrl}`, body);
  }
} 