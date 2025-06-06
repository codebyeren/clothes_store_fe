import { inject, Injector } from '@angular/core';
import {
  HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse, HttpInterceptorFn
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const injector = inject(Injector);

  // Pipe the request through a tap operator to add the initial token if valid
  return next(req).pipe(
    // Use tap to modify the request before it's sent
    tap(() => {
      // Get AuthService instance here, within the tap operator
      const authService = injector.get(AuthService);
      if (authService.isAccessTokenValid()) {
        const token = authService.getAccessToken();
        // Modify the request clone directly within the tap. 
        // Note: req is immutable, so cloning is necessary.
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Get AuthService instance *within* the catchError/switchMap operator
        const auth = injector.get(AuthService);
        return auth.refreshToken().pipe(
          switchMap((newToken) => {
            if (newToken) {
              const cloned = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              // After successful refresh, retry the original request with the new token
              return next(cloned);
            } else {
              // If refresh fails, logout and re-throw the error
              auth.logout();
              return throwError(() => error);
            }
          }),
          catchError(refreshError => { // Handle errors during refresh token process
             console.error('Error during token refresh', refreshError);
             // If refresh itself fails, logout
             const authAfterRefreshError = injector.get(AuthService); // Get again just in case
             authAfterRefreshError.logout();
             return throwError(() => refreshError); // Re-throw the refresh error
          })
        );
      }

      // For errors other than 401, just re-throw
      return throwError(() => error);
    })
  );
};
