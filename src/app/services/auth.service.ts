import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject, Subject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { ToastrService } from 'ngx-toastr';
import { AuthTokensDTO, AuthResponse } from '../shared/models/auth.model';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedIn$: BehaviorSubject<boolean>;
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
    private sessionService: SessionService,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) {
    const initialLoggedIn = this.tokenService.isAccessTokenValid();
    this.loggedIn$ = new BehaviorSubject<boolean>(initialLoggedIn);

    if (!initialLoggedIn && this.tokenService.isRefreshTokenValid()) {
      console.log('Attempting auto-login with refresh token...');
      this.refreshToken().subscribe({
        next: (newToken) => {
          if (newToken) {
            console.log('Auto-login successful.');
          } else {
            console.log('Auto-login failed: Could not refresh token.');
          }
        },
        error: (error) => {
          console.error('Auto-login error:', error);
        }
      });
    } else if (!initialLoggedIn && !this.tokenService.isRefreshTokenValid()) {
      console.log('No valid refresh token found for auto-login.');
      this.tokenService.clearTokens();
      this.setLoggedIn(false);
    }
  }

  login(username: string, password: string, remember: boolean = false): Observable<AuthResponse<AuthTokensDTO>> {
    return this.http.post<AuthResponse<AuthTokensDTO>>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          if (response && response.data && response.data.accessToken) {
            this.tokenService.saveTokens({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              accessTokenExp: this.tokenService.getTokenExp(response.data.accessToken),
              refreshTokenExp: this.tokenService.getTokenExp(response.data.refreshToken),
              remember: remember
            });
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('currentUser', JSON.stringify({ username }));
            this.setLoggedIn(true);
            this.toastr.success('Đăng nhập thành công');
          }
          return response;
        }),
        catchError(error => throwError(() => error.error))
      );
  }

  logout(): void {
    // Signal that logout is initiated
    this._logoutInitiated.next();

    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post<any>(`${this.apiUrl}/auth/logout`, { refreshToken })
        .pipe(
          catchError(error => {
            console.error('Logout error sending refresh token to backend:', error);
            return of(null); // Continue even if backend logout fails
          })
        )
        .subscribe(() => {
          this.tokenService.clearTokens();
          this.setLoggedIn(false);
          this.router.navigate(['/auth/login']);
          this.toastr.success('Đăng xuất thành công');
        });
    } else {
      this.tokenService.clearTokens();
      this.setLoggedIn(false);
      this.router.navigate(['/auth/login']);
      this.toastr.success('Đăng xuất thành công');
    }
  }

  refreshToken(): Observable<string | null> {
    const currentRefreshToken = this.tokenService.getRefreshToken();

    if (!currentRefreshToken || !this.tokenService.isRefreshTokenValid()) {
      console.log('No valid refresh token found or refresh token expired, logging out.');
      this.logout();
      return of(null);
    }

    console.log('Attempting to refresh access token...');
    return this.http.post<ApiResponse<{ accessToken: string }>>(`${this.apiUrl}/auth/refresh`, { refreshToken: currentRefreshToken })
      .pipe(
        map(response => {
          if (response && response.code === 200 && response.data && response.data.accessToken) {
            console.log('Access token refreshed successfully.');

            const existingRefreshToken = this.tokenService.getRefreshToken();
            const existingRefreshTokenExp = parseInt(sessionStorage.getItem('refreshTokenExp') || localStorage.getItem('refreshTokenExp') || '0', 10);
            const rememberMe = localStorage.getItem('refreshToken') !== null;

            this.tokenService.saveTokens({
              accessToken: response.data.accessToken,
              refreshToken: existingRefreshToken || '',
              accessTokenExp: this.tokenService.getTokenExp(response.data.accessToken),
              refreshTokenExp: existingRefreshTokenExp,
              remember: rememberMe
            });

            this.toastr.success('Phiên đăng nhập đã được gia hạn');
            return response.data.accessToken;
          } else {
            console.error('Access token refresh failed:', response?.message || 'Unknown error');
            this.logout();
            return null;
          }
        }),
        catchError((error) => {
          console.error('HTTP error during access token refresh:', error);
          this.logout();
          return of(null);
        })
      );
  }

  register(data: any): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        map(response => {
          if (response.code === 200) {
            this.toastr.success('Đăng ký thành công');
          }
          return response;
        }),
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
    return this.tokenService.isAccessTokenValid();
  }

  getCurrentUserId(): number | null {
    return this.tokenService.getCurrentUserId();
  }
}
