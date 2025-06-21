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
      this.refreshToken().subscribe({
        next: (newToken) => {
          if (newToken) {
          } else {
          }
        },
        error: (error) => {
        }
      });
    } else if (!initialLoggedIn && !this.tokenService.isRefreshTokenValid()) {
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
        catchError(error => {
          return throwError(() => error.error);
        })
      );
  }

  logout(): void {
    this._logoutInitiated.next();

    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post<any>(`${this.apiUrl}/auth/logout`, { refreshToken })
        .pipe(
          catchError(error => {
            return of(null);
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
      this.logout();
      return of(null);
    }

    return this.http.post<ApiResponse<{ accessToken: string }>>(`${this.apiUrl}/auth/refresh`, { refreshToken: currentRefreshToken })
      .pipe(
        map(response => {
          if (response && response.code === 200 && response.data && response.data.accessToken) {

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
            this.logout();
            return null;
          }
        }),
        catchError((error) => {
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
        catchError(error => {
          // Handle different types of database errors
          let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại!';
          
          if (error.error) {
            // Check for specific database error messages
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
            
            // Handle common database constraint errors
            if (error.error.code === 11000 || error.error.message?.includes('duplicate')) {
              if (error.error.message?.includes('email')) {
                errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
              } else if (error.error.message?.includes('username')) {
                errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
              } else if (error.error.message?.includes('phoneNumber')) {
                errorMessage = 'Số điện thoại đã được sử dụng. Vui lòng chọn số khác.';
              } else {
                errorMessage = 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
              }
            }
          }
          
          // Show error message using toastr
          this.toastr.error(errorMessage, 'Lỗi đăng ký');
          
          return throwError(() => ({ error: { message: errorMessage } }));
        })
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
}
