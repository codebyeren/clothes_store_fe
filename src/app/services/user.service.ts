import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/auth/user';

  constructor(private http: HttpClient) { }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateUserInfo(userData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, userData);
  }
}
