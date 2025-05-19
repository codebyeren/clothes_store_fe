import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedIn$ = new BehaviorSubject<boolean>(this.isAccessTokenValid());
  get isLoggedIn$() {
    return this.loggedIn$.asObservable();
  }
  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
  }

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  getTokenExp(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return Date.now() + 15 * 60 * 1000;
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          if (response && response.data && response.data.accessToken) {
            this.saveTokens({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              accessTokenExp: this.getTokenExp(response.data.accessToken),
              refreshTokenExp: this.getTokenExp(response.data.refreshToken),
            });
            localStorage.setItem('currentUser', JSON.stringify({ username }));
            this.setLoggedIn(true);
          }
          return response;
        }),
        catchError(error => throwError(() => error.error))
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post<any>(`${this.apiUrl}/auth/logout`, { refreshToken })
        .pipe(
          catchError(error => {
            console.error('Logout error:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          this.clearLocalStorage();
          this.setLoggedIn(false);
          this.router.navigate(['/auth/login']);
        });
    } else {
      this.clearLocalStorage();
      this.setLoggedIn(false);
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
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, { refreshToken: currentRefreshToken })
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
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        map(response => response),
        catchError(error => throwError(() => error.error))
      );
  }

  // Forgot password flow mới chỉ dùng email
  sendResetCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, null, { params: { email } })
      .pipe(
        map(response => response),
        catchError(error => throwError(() => error.error))
      );
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-code`, null, { params: { email, code } })
      .pipe(
        map(response => response),
        catchError(error => throwError(() => error.error))
      );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, null, { params: { email, newPassword } })
      .pipe(
        map(response => response),
        catchError(error => throwError(() => error.error))
      );
  }

  isLoggedIn(): boolean {
    return this.isAccessTokenValid();
  }
}
