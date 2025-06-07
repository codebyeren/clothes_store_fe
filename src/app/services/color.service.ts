import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Color } from '../shared/models/product.model';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private baseUrl = 'http://localhost:8080/api/colors';

  constructor(private http: HttpClient) {}

  getAllColors(): Observable<Color[]> {
    return this.http.get<ApiResponse<Color[]>>(this.baseUrl).pipe(
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

  getColorById(id: number): Observable<Color> {
    return this.http.get<Color>(`${this.baseUrl}/${id}`);
  }

  createColor(color: Partial<Color>): Observable<Color> {
    return this.http.post<Color>(this.baseUrl, color);
  }

  updateColor(id: number, color: Color): Observable<Color> {
    return this.http.put<Color>(`${this.baseUrl}/${id}`, color);
  }

  deleteColor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  // color.service.ts
  checkColorExists(colorName: string) {
    return this.getAllColors().pipe(
      map((colors) => colors.some(c => c.color.toLowerCase().trim() === colorName.toLowerCase().trim()))
    );
  }

}
