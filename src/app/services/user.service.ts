import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {User} from '../shared/models/product.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/auth/user';
  private  apiAdminUrl = 'http://localhost:8080/api/auth/users'
  constructor(private http: HttpClient) { }
  getAllUsers(): Observable<User[]> {
    return this.http.get<{ code: number; message: string; data: User[] }>(this.apiAdminUrl
    )
      .pipe(map(res => res.data));
  }
  getUserInfo(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getUserDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`
    );
  }


  updateUserInfo(userData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, userData);
  }
}
