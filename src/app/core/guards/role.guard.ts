import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const roles  = route.data['roles'] as string[];

  if (!roles || auth.hasRole(...roles)) return true;
  return router.createUrlTree(['/dashboard']);
};
