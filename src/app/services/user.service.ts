import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../shared/models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/auth/user`;
  private apiAdminUrl = `${environment.apiUrl}/auth/users`;

  constructor(private http: HttpClient) { }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateUserInfo(userData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, userData);
  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<{ code: number; message: string; data: User[] }>(this.apiAdminUrl
    )
      .pipe(map(res => res.data));
  }
  deleteSize(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


}
