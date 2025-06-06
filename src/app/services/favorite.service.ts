import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = environment.apiUrl + "/favorite"; 

  constructor(private http: HttpClient) { }

  addFavorite(userId: number, productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/${productId}`, {});
  }

  removeFavorite(userId: number, productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${productId}`);
  }
} 