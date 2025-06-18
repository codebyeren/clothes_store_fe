import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { Discount } from '../shared/models/discount.model';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private apiUrl = 'https://clothing-store-api-7ieq.onrender.com/api/discounts';

  constructor(private http: HttpClient) {}


  createDiscount(discount: Partial<Discount>): Observable<Discount> {
    return this.http.post<{ code: number, message: string, data: Discount }>(this.apiUrl, discount)
      .pipe(map(res => res.data));
  }
  getALlDisCount(): Observable<Discount[]> {
    return this.http.get<ApiResponse<Discount[]>>(this.apiUrl).pipe(
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
  updateDiscount(id: number, discount: Partial<Discount>): Observable<Discount> {
    return this.http.put<{ code: number, message: string, data: Discount }>(`${this.apiUrl}/${id}`, discount)
      .pipe(map(res => res.data));
  }

}
