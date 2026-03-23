import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
      // Change password DANS le layout
      {
        path: 'change-password',
        loadComponent: () =>
          import('./modules/auth/change-password/change-password.component')
            .then(m => m.ChangePasswordComponent)
      },
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      // Analytics ✅ FIX : dans le layout
      {
        path: 'analytics',
        loadComponent: () =>
          import('./modules/analytics/analytics.component')
            .then(m => m.AnalyticsComponent)
      },
      // Admin
      {
        path: 'admin',
        loadComponent: () =>
          import('./modules/admin/admin.component')
            .then(m => m.AdminComponent)
      },
      //page employés séparée
      {
        path: 'employes',
        loadComponent: () =>
          import('./modules/employes/employes.component')
            .then(m => m.EmployesComponent)
      },
      // Modules RH
      {
        path: 'conges',
        loadComponent: () =>
          import('./modules/conges/conges.component')
            .then(m => m.CongesComponent)
      },
      {
        path: 'autorisations',
        loadComponent: () =>
          import('./modules/autorisations/autorisations.component')
            .then(m => m.AutorisationsComponent)
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./modules/reclamations/reclamations.component')
            .then(m => m.ReclamationsComponent)
      },
      {
        path: 'avances',
        loadComponent: () =>
          import('./modules/avances/avances.component')
            .then(m => m.AvancesComponent)
      },
      {
  path: 'augmentations',
  loadComponent: () =>
    import('./modules/augmentations/augmentations.component')
      .then(m => m.AugmentationsComponent),
  canActivate: [authGuard]
},
      {
        path: 'profil',
        loadComponent: () =>
          import('./modules/profil/profil.component')
            .then(m => m.ProfilComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];