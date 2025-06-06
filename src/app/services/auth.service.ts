import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject, Subject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { ToastrService } from 'ngx-toastr';

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

  login(username: string, password: string, remember: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
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
    if (!this.tokenService.isRefreshTokenValid()) {
      this.logout();
      return of(null);
    }
    const currentRefreshToken = this.tokenService.getRefreshToken();

    if (!currentRefreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, { refreshToken: currentRefreshToken })
      .pipe(
        map(response => {
          if (response && response.accessToken) {
            this.tokenService.saveTokens({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              accessTokenExp: response.accessTokenExp || (Date.now() + 60 * 60 * 1000),
              refreshTokenExp: response.refreshTokenExp || (Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            this.toastr.success('Phiên đăng nhập đã được gia hạn');
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

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data)
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
