import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Order, OrderItem, OrderResponse, CreateOrderRequest } from '../shared/models/order.model';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../shared/models/api-response.model';

export interface OrderUpdateDto{
  id : number
  status : string
}
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
  ) {}

  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse<any>> {
    return this.http.post<OrderResponse<any>>(`${this.apiUrl}`, orderData);
  }

  getOrders(): Observable<OrderResponse<Order[]>> {
    return this.http.get<OrderResponse<Order[]>>(`${this.apiUrl}`);
  }

  /**
   * Sends a request to cancel a specific order.
   * @param orderId The ID of the order to cancel.
   * @returns Observable of the API response.
   */
  cancelOrder(orderId: number): Observable<OrderResponse<any>> {
    const body = { id: orderId, status: 'Cancelled' };
    return this.http.put<OrderResponse<any>>(`${this.apiUrl}`, body);
  }
  getAllOrder(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl).pipe(
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
  }  updateStatus( status: OrderUpdateDto): Observable<ApiResponse<any>> {

    return this.http.put<ApiResponse<any>>(`${this.apiUrl}`,status );
  }
}
