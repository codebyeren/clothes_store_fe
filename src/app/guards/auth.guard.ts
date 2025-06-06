import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    if (this.tokenService.isAccessTokenValid()) {
      return true;
    }
    if (this.tokenService.isRefreshTokenValid()) {
      // Tự động refresh accessToken trước khi vào trang
      return this.authService.refreshToken().pipe(
        map(token => {
          if (token) return true;
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
          return false;
        })
      );
    }
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
} 