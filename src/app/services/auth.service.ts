import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api'; // Replace with your actual backend URL

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { username, password })
      .pipe(
        map(response => {
          if (response && response.accessToken) {
            this.saveTokens({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              accessTokenExp: response.accessTokenExp || (Date.now() + 15 * 60 * 1000),
              refreshTokenExp: response.refreshTokenExp || (Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            localStorage.setItem('currentUser', JSON.stringify({ username }));
            return true;
          }
          return false;
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'));
        })
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      this.http.post<any>(`${this.API_URL}/auth/logout`, { refreshToken })
        .pipe(
          catchError(error => {
            console.error('Logout error:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          this.clearLocalStorage();
          this.router.navigate(['/auth/login']);
        });
    } else {
      this.clearLocalStorage();
      this.router.navigate(['/auth/login']);
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExp');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExp');
    localStorage.removeItem('currentUser');
  }

  isAccessTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    const exp = parseInt(localStorage.getItem('accessTokenExp') || '0', 10);
    return !!token && Date.now() < exp;
  }

  isRefreshTokenValid(): boolean {
    const token = localStorage.getItem('refreshToken');
    const exp = parseInt(localStorage.getItem('refreshTokenExp') || '0', 10);
    return !!token && Date.now() < exp;
  }

  refreshToken(): Observable<string | null> {
    if (!this.isRefreshTokenValid()) {
      this.logout();
      return of(null);
    }

    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    return this.http.post<any>(`${this.API_URL}/auth/refresh-token`, { refreshToken: currentRefreshToken })
      .pipe(
        map(response => {
          if (response && response.accessToken) {
            this.saveTokens({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              accessTokenExp: response.accessTokenExp || (Date.now() + 15 * 60 * 1000),
              refreshTokenExp: response.refreshTokenExp || (Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return response.accessToken;
          }
          return null;
        }),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  refreshTokenIfNeeded(): Observable<boolean> {
    if (this.isAccessTokenValid()) {
      return of(true);
    }

    return new Observable<boolean>((observer) => {
      this.refreshToken().subscribe((newToken) => {
        if (newToken) {
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  private saveTokens(data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExp: number;
    refreshTokenExp: number;
  }): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('accessTokenExp', data.accessTokenExp.toString());
    localStorage.setItem('refreshTokenExp', data.refreshTokenExp.toString());
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, data)
      .pipe(
        map(response => {
          console.log('Registration response:', response);
          return response;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }
  resetPassword(data: { username: string; info: string; newPassword: string }): Observable<string> {
    return this.http.post<any>(`${this.API_URL}/auth/forgot-password`, data).pipe(
      map(response => {
        console.log('Registration response:', response);
        return response.message;
      }),
      catchError(error => {
        console.error('Reset password error:', error);
        const errorMessage = error.error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
