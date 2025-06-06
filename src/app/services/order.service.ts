import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import {catchError, map} from 'rxjs/operators';

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

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createOrder(orderData: CreateOrderRequest): Observable<ResponseObject<any>> {
    return this.http.post<ResponseObject<any>>(`${this.apiUrl}`, orderData, {
      headers: this.getHeaders()
    });
  }

  getOrders(): Observable<ResponseObject<Order[]>> {
    return this.http.get<ResponseObject<Order[]>>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    });
  }

  getAllOrder(): Observable<Order[]> {
    return this.http.get<ResponseObject<Order[]>>(this.apiUrl).pipe(
      map(res => {
        if (res && Array.isArray(res.data)) {
          return res.data;
        } else {
          console.warn('Dữ liệu trả về không hợp lệ:', res);
          return [];
        }
      }),
      catchError(err => {
        console.error('Lỗi khi gọi API lấy màu:', err);
        return of([]);
      })
    );
  }
  cancelOrder(orderId: number): Observable<ResponseObject<any>> {
    const headers = this.getHeaders();
    // Change endpoint to match backend Controller: PUT /api/orders with body { id: orderId, status: 'Cancelled' }
    const body = { id: orderId, status: 'Cancelled' };
    return this.http.put<ResponseObject<any>>(`${this.apiUrl}`, body, { // Use this.apiUrl which is /api/orders
      headers: headers
    });
  }
  updateStatus(orderId: number, status: string): Observable<ResponseObject<any>> {
    const headers = this.getHeaders();
    const body = { id: orderId, status: status };
    return this.http.put<ResponseObject<any>>(`${this.apiUrl}`, body, { headers });
  }

}
