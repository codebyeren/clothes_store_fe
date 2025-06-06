import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';

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

  // Add a Subject to signal logout initiation
  private _logoutInitiated = new Subject<void>();
  logoutInitiated$ = this._logoutInitiated.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionService
  ) {
    // Initialize loggedIn$ based on access token validity
    const initialLoggedIn = this.isAccessTokenValid();
    this.loggedIn$ = new BehaviorSubject<boolean>(initialLoggedIn);

    // Attempt to auto-login using refresh token if not currently logged in
    if (!initialLoggedIn && this.isRefreshTokenValid()) {
      console.log('Attempting auto-login with refresh token...');
      this.refreshToken().subscribe({
        next: (newToken) => {
          if (newToken) {
            console.log('Auto-login successful.');
            // The refreshToken method already calls setLoggedIn(true)
          } else {
            console.log('Auto-login failed: Could not refresh token.');
            // The refreshToken method already calls logout() if refresh fails
          }
        },
        error: (error) => {
          console.error('Auto-login error:', error);
          // The refreshToken method's catchError should handle logout
        }
      });
    } else if (!initialLoggedIn && !this.isRefreshTokenValid()) {
        console.log('No valid refresh token found for auto-login.');
        // Ensure logged out state is correct if tokens are invalid
        this.clearLocalStorage();
        this.setLoggedIn(false);
    }
  }

  getTokenExp(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return Date.now() + 15 * 60 * 1000;
    }
  }

  login(username: string, password: string, remember: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          if (response && response.data && response.data.accessToken) {
            this.saveTokens({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              accessTokenExp: this.getTokenExp(response.data.accessToken),
              refreshTokenExp: this.getTokenExp(response.data.refreshToken),
              remember: remember
            });
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('currentUser', JSON.stringify({ username }));
            this.setLoggedIn(true);
          }
          return response;
        }),
        catchError(error => throwError(() => error.error))
      );
  }

  logout(): void {
    // Signal that logout is initiated
    this._logoutInitiated.next();

    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post<any>(`${this.apiUrl}/auth/logout`, { refreshToken })
        .pipe(
          catchError(error => {
            console.error('Logout error sending refresh token to backend:', error);
            return of(null); // Continue even if backend logout fails
          })
        )
        .subscribe(() => {
          this.clearLocalStorage(); // Clear auth tokens
          this.setLoggedIn(false);
          this.router.navigate(['/auth/login']);
        });
    } else {
      this.clearLocalStorage(); // Clear auth tokens
      this.setLoggedIn(false);
      this.router.navigate(['/auth/login']);
    }
  }

  private clearStorage(storage: Storage): void {
    storage.removeItem('accessToken');
    storage.removeItem('accessTokenExp');
    storage.removeItem('refreshToken');
    storage.removeItem('refreshTokenExp');
    storage.removeItem('currentUser');
  }

  private clearLocalStorage(): void {
    this.clearStorage(localStorage);
    this.clearStorage(sessionStorage);
  }

  isAccessTokenValid(): boolean {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const exp = parseInt(sessionStorage.getItem('accessTokenExp') || localStorage.getItem('accessTokenExp') || '0', 10);
    return !!token && Date.now() < exp;
  }

  isRefreshTokenValid(): boolean {
    const token = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    const exp = parseInt(sessionStorage.getItem('refreshTokenExp') || localStorage.getItem('refreshTokenExp') || '0', 10);
    return !!token && Date.now() < exp;
  }

  refreshToken(): Observable<string | null> {
    if (!this.isRefreshTokenValid()) {
      this.logout();
      return of(null);
    }
    const currentRefreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

    if (!currentRefreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, { refreshToken: currentRefreshToken })
      .pipe(
        map(response => {
          if (response && response.accessToken) {
            this.saveTokens({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              accessTokenExp: response.accessTokenExp || (Date.now() + 60 * 60 * 1000),
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
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  }

  // refreshTokenIfNeeded(): Observable<boolean> {
  //   if (this.isAccessTokenValid()) {
  //     return of(true);
  //   }
  //   return new Observable<boolean>((observer) => {
  //     this.refreshToken().subscribe((newToken) => {
  //       if (newToken) {
  //         observer.next(true);
  //       } else {
  //         observer.next(false);
  //       }
  //       observer.complete();
  //     });
  //   });
  // }

  private saveTokens(data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExp: number;
    refreshTokenExp: number;
    remember?: boolean;
  }): void {
    const storage = data.remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('accessTokenExp', data.accessTokenExp.toString());
    storage.setItem('refreshTokenExp', data.refreshTokenExp.toString());
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
    return this.http.post(`${this.apiUrl}/verify-code`, null, { 
      params: { email, code } 
    }).pipe(
      map((response: any) => {
        if (response.sessionId) {
          this.sessionService.setResetSession(response.sessionId);
        }
        return response;
      }),
      catchError(error => throwError(() => error.error))
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    const sessionId = this.sessionService.getResetSession();
    if (!sessionId) {
      return throwError(() => ({ message: 'Phiên làm việc không hợp lệ' }));
    }

    return this.http.post(`${this.apiUrl}/reset-password`, null, { 
      params: { email, newPassword },
      headers: { 'X-Session-Id': sessionId }
    }).pipe(
      map(response => {
        this.sessionService.clearResetSession();
        return response;
      }),
      catchError(error => throwError(() => error.error))
    );
  }

  isLoggedIn(): boolean {
    return this.isAccessTokenValid();
  }

  getCurrentUserId(): number | null {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
