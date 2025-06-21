import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {Category} from '../shared/models/product.model';
import { ApiResponse } from '../shared/models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'https://clothing-store-api-26.onrender.com/api/categories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }


  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  getByProductId(productId: number): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(
      `${this.baseUrl}/product/${productId}`
    ).pipe(
      map(res => res.data)
    );
  }

}
