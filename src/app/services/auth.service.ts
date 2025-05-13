import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { delay, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    if (username === 'admin' && password === 'admin123') {
      this.saveTokens({
        // Có BE  thay dòng dưới  bằng url từ BE nhé cu nam :

        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        accessTokenExp: Date.now() + 5 * 60 * 1000,
        refreshTokenExp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      localStorage.setItem('currentUser', JSON.stringify({ username }));
      return of(true);
    }

    return throwError(() => new Error('Tên đăng nhập hoặc mật khẩu không đúng'));
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExp');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExp');
    localStorage.removeItem('currentUser');

    this.router.navigate(['/auth/login']);
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

    const newAccessToken = 'refreshed-access-token';
    const newRefreshToken = 'refreshed-refresh-token';
    const newAccessExp = Date.now() + 5 * 60 * 1000;
    const newRefreshExp = Date.now() + 7 * 24 * 60 * 60 * 1000;

    this.saveTokens({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExp: newAccessExp,
      refreshTokenExp: newRefreshExp,
    });

    return of(newAccessToken);
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
    console.log('Gửi dữ liệu đăng ký:', data);

    // Có BE  thay dòng dưới  bằng hehe:
    // return this.http.post('/api/auth/register', data);
    // cái pipe để map nếu Be có gửi lên cả data , status , v.v 

    return of({ message: 'Register success' }).pipe(delay(1000)); 
  }
}
