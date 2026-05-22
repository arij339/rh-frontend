import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/2fa/verify',   // verify n'a pas d'access token — pas de retry
];
const SKIP_AUTH_URLS = ['/uploads/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const http        = inject(HttpClient);
  const token       = authService.getToken();
  const isStaticResource = SKIP_AUTH_URLS.some(u => req.url.includes(u));
  if (isStaticResource) return next(req);


  // Ne pas écraser un header Authorization déjà présent (ex : requête de refresh)
  const alreadyHasAuth = req.headers.has('Authorization');
  const authReq = (token && !alreadyHasAuth)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      const isPublicEndpoint = PUBLIC_AUTH_ENDPOINTS.some(e => req.url.includes(e));

      // 403 = l'utilisateur est authentifié mais n'a PAS les droits → ne pas logout, propager l'erreur
      // 401 = token absent ou expiré → tenter le refresh
      if (error.status === 401 && !isPublicEndpoint) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return http.post<any>(
            `${environment.apiUrl}/api/auth/refresh-token`, {},
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
              // Refresh échoué (expiré) → déconnexion propre
              authService.logout();
              return throwError(() => error);
            })
          );
        }
        // Pas de refreshToken → déconnexion
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};