import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SizeAdmin} from '../shared/models/product.model';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SizeService {
  private baseUrl = 'http://localhost:8080/api/sizes';

  constructor(private http: HttpClient) {}

  getAllSize(): Observable<SizeAdmin[]> {
    return this.http.get<ApiResponse<SizeAdmin[]>>(this.baseUrl).pipe(
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



  createSize(size: Partial<SizeAdmin>): Observable<SizeAdmin> {
    return this.http.post<SizeAdmin>(this.baseUrl, size);
  }

  updateSize(id: number, size: SizeAdmin): Observable<SizeAdmin> {
    return this.http.put<SizeAdmin>(`${this.baseUrl}/${id}`, size);
  }

  deleteSize(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
