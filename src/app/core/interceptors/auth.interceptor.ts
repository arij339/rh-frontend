import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const http        = inject(HttpClient);
  const token       = authService.getToken();
   console.log('Token envoyé :', token); // ← ajouter ce log
  console.log('URL :', req.url);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Token expiré → essayer refresh
      if (error.status === 401 && !req.url.includes('/auth/')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return http.post<any>(
            'http://localhost:8080/api/auth/refresh-token', {},
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