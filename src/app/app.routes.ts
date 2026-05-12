import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ===== PAGES PUBLIQUES =====
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./modules/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./modules/auth/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  },

  // ===== PAGES PROTÉGÉES (avec sidebar + navbar) =====
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [

      // ── Auth ──────────────────────────────────────────────────────
      {
        path: 'change-password',
        loadComponent: () =>
          import('./modules/auth/change-password/change-password.component')
            .then(m => m.ChangePasswordComponent)
      },

      // ── Dashboard (tous rôles) ─────────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // ── Analytics ─────────────────────────────────────────────────
      {
        path: 'analytics',
        loadComponent: () =>
          import('./modules/analytics/analytics.component')
            .then(m => m.AnalyticsComponent),
        canActivate: [authGuard],
        data: { roles: ['RH'] }
      },

      

      // ── ADMIN ─────────────────────────────────────────────────────
      {
        path: 'admin',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('./modules/admin/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./modules/admin/admin-users/admin-users.component')
            .then(m => m.AdminUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/config',
        loadComponent: () =>
          import('./modules/admin/admin-config/admin-config.component')
            .then(m => m.AdminConfigComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/securite',
        loadComponent: () =>
          import('./modules/admin/admin-securite/admin-securite.component')
            .then(m => m.AdminSecuriteComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/logs',
        loadComponent: () =>
          import('./modules/admin/admin-logs/admin-logs.component')
            .then(m => m.AdminLogsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },

      // ── Employés (RH) ─────────────────────────────────────────────
      {
        path: 'employes',
        loadComponent: () =>
          import('./modules/employes/employes.component')
            .then(m => m.EmployesComponent),
        canActivate: [authGuard],
        data: { roles: ['RH', 'ADMIN'] }
      },

      // ── MANAGER ───────────────────────────────────────────────────
      {
        path: 'equipe',
        loadComponent: () =>
          import('./modules/manager/equipe/equipe.component')
            .then(m => m.EquipeComponent),
        canActivate: [authGuard],
        data: { roles: ['MANAGER'] }
      },
      {
        path: 'validation',
        loadComponent: () =>
          import('./modules/manager/validation/validation.component')
            .then(m => m.ValidationComponent),
        canActivate: [authGuard],
        data: { roles: ['MANAGER'] }
      },

      // ── RH — espace dédié ─────────────────────────────────────────
      {
        path: 'rh/validation',
        loadComponent: () =>
          import('./modules/rh/rh-validation/rh-validation.component')
            .then(m => m.RhValidationComponent),
        canActivate: [authGuard],
        data: { roles: ['RH'] }
      },
      {
        path: 'rh/conges',
        loadComponent: () =>
          import('./modules/rh/rh-conges/rh-conges.component')
            .then(m => m.RhCongesComponent),
        canActivate: [authGuard],
        data: { roles: ['RH'] }
      },
      {
        path: 'rh/reclamations',
        loadComponent: () =>
          import('./modules/rh/rh-reclamations/rh-reclamations.component')
            .then(m => m.RhReclamationsComponent),
        canActivate: [authGuard],
        data: { roles: ['RH'] }
      },

      {
  path: 'rh/avances',
  loadComponent: () =>
    import('./modules/rh/rh-avances/rh-avances.component')
      .then(m => m.RhAvancesComponent),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['RH', 'ADMIN'] }
},
      // ── Modules communs (EMPLOYE + MANAGER) ───────────────────────
      {
        path: 'conges',
        loadComponent: () =>
          import('./modules/conges/conges.component')
            .then(m => m.CongesComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER', 'RH'] }  // RH peut voir ses congés
      },
      {
        path: 'autorisations',
        loadComponent: () =>
          import('./modules/autorisations/autorisations.component')
            .then(m => m.AutorisationsComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER'] }  // RH exclu
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./modules/reclamations/reclamations.component')
            .then(m => m.ReclamationsComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER'] }  // RH exclu
      },
      {
        path: 'avances',
        loadComponent: () =>
          import('./modules/avances/avances.component')
            .then(m => m.AvancesComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER'] }  // RH exclu
      },
      {
        path: 'augmentations',
        loadComponent: () =>
          import('./modules/augmentations/augmentations.component')
            .then(m => m.AugmentationsComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER'] }  // RH exclu
      },

      // ── Profil ────────────────────────────────────────────────────
      {
        path: 'profil',
        loadComponent: () =>
          import('./modules/profil/profil.component')
            .then(m => m.ProfilComponent),
        canActivate: [authGuard],
        data: { roles: ['EMPLOYE', 'MANAGER', 'RH'] }
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
