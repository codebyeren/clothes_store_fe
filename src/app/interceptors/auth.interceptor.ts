import { inject } from '@angular/core';
import {
  HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse, HttpInterceptorFn
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (authService.isAccessTokenValid()) {
    const token = authService.getAccessToken();
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            if (newToken) {
              const cloned = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(cloned);
            } else {
              authService.logout();
              return throwError(() => error);
            }
          })
        );
      }

      return throwError(() => error);
    })
  );
};
