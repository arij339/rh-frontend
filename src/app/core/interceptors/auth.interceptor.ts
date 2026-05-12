import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';


const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const http        = inject(HttpClient);
  const token       = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      const isPublicEndpoint = PUBLIC_AUTH_ENDPOINTS.some(e => req.url.includes(e));

      // Token expiré → essayer refresh (sauf sur les endpoints publics)
      if (error.status === 401 && !isPublicEndpoint) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return http.post<any>(
            '/api/auth/refresh-token', {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          ).pipe(
            switchMap(response => {
              localStorage.setItem('accessToken', response.accessToken);
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            })
          );
        }
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
