import {
  Component, Input, Output, EventEmitter, inject
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface NavItem {
  label:   string;
  icon:    string;
  route:   string;
  roles:   string[];
  section?: string; // label de section avant cet item
}

// ─── Icônes SVG ───────────────────────────────────────────────────────────────
const IC = {

  dashboard: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>`,

  conges: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/>
  </svg>`,

  autorisations: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/>
    <polyline points="17 8 21 12 17 16"/>
    <line x1="21" y1="12" x2="10" y2="12"/>
  </svg>`,

  reclamations: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none"/>
  </svg>`,

  avances: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="2.5"/>
    <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>`,

  augmentations: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>`,

  employes: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,

  validation: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>`,

  equipe: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,

  analytics: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <line x1="2" y1="20" x2="22" y2="20"/>
    <rect x="4" y="14" width="3" height="6" rx="0.5"/>
    <rect x="10.5" y="8" width="3" height="12" rx="0.5"/>
    <rect x="17" y="4" width="3" height="16" rx="0.5"/>
  </svg>`,

  mlInsights: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3
             M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12
             M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
  </svg>`,

  profil: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`,

  // Admin icons
  adminUsers: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>`,

  adminConfig: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
             a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
             A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
             a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15
             a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
             A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06
             a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68
             a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
             a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06
             a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
             a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,

  adminSecurite: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>`,

  adminLogs: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>`,

  logout: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>`,

  logo: `<svg width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, SafeHtmlPipe],
  template: `
<aside class="sidebar" [class.collapsed]="collapsed">

  <!-- Logo -->
  <div class="sidebar-logo">
    <div class="logo-icon" [innerHTML]="ic.logo | safeHtml"></div>
    @if (!collapsed) {
      <span class="logo-text">RH Manager</span>
    }
  </div>

  <!-- User card étendu -->
  @if (!collapsed) {
    <div class="sidebar-user">
      <div class="user-avatar" [class]="'av-' + role().toLowerCase()">
        {{ initiales }}
      </div>
      <div class="user-info">
        <span class="user-name">
          {{ user?.prenom }} {{ user?.nom }}
        </span>
        <span class="user-role">{{ getRoleLabel() }}</span>
      </div>
    </div>
  }

  <!-- Mini avatar réduit -->
  @if (collapsed) {
    <div class="sidebar-user-mini">
      <div class="user-avatar-mini"
           [class]="'av-' + role().toLowerCase()">
        {{ initiales }}
      </div>
    </div>
  }

  <!-- Navigation -->
  <nav class="sidebar-nav">

    @for (item of getVisibleItems(); track item.route) {

      <!-- Label de section -->
      @if (!collapsed && item.section) {
        <div class="nav-section-label">
          {{ item.section }}
        </div>
      }

      <a [routerLink]="item.route"
         routerLinkActive="active"
         class="nav-item"
         [title]="item.label">
        <span class="nav-icon"
              [innerHTML]="item.icon | safeHtml">
        </span>
        @if (!collapsed) {
          <span class="nav-label">{{ item.label }}</span>
        }
        @if (collapsed) {
          <span class="nav-tooltip">{{ item.label }}</span>
        }
      </a>
    }

  </nav>

  <!-- Footer déconnexion -->
  <div class="sidebar-footer">
    <button class="nav-item logout"
            (click)="logout()"
            title="Déconnexion">
      <span class="nav-icon"
            [innerHTML]="ic.logout | safeHtml">
      </span>
      @if (!collapsed) {
        <span class="nav-label">Déconnexion</span>
      }
      @if (collapsed) {
        <span class="nav-tooltip">Déconnexion</span>
      }
    </button>
  </div>

  <!-- Toggle collapse -->
  <button class="toggle-btn" (click)="toggleSidebar.emit()">
    @if (!collapsed) {
      <svg width="14" height="14" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    }
    @if (collapsed) {
      <svg width="14" height="14" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           viewBox="0 0 24 24">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    }
  </button>

</aside>
  `,
  styles: [`
    :host {
      --sw:      260px;
      --sc:      74px;
      --teal:    #12b5c4;
      --teal-dk: #0b8f9d;
      --bg1:     #09202f;
      --bg2:     #0d2a40;
      --bg3:     #123350;
    }

    /* ── Shell ── */
    .sidebar {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: var(--sw);
      background: linear-gradient(180deg,
        var(--bg1) 0%, var(--bg2) 40%, var(--bg3) 100%);
      box-shadow: 4px 0 28px rgba(0,0,0,0.25);
      display: flex; flex-direction: column;
      transition: width 0.3s cubic-bezier(0.2,0.9,0.4,1);
      z-index: 100; overflow: hidden;

      &.collapsed { width: var(--sc); }
    }

    /* ── Logo ── */
    .sidebar-logo {
      display: flex; align-items: center; gap: 11px;
      padding: 20px 16px 18px; flex-shrink: 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .logo-icon {
      width: 38px; height: 38px; background: var(--teal);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(18,181,196,0.4);
      transition: transform 0.25s, box-shadow 0.25s;
    }

    .sidebar-logo:hover .logo-icon {
      transform: rotate(-6deg) scale(1.07);
      box-shadow: 0 7px 22px rgba(18,181,196,0.6);
    }

    .logo-text {
      color: white; font-size: 19px; font-weight: 800;
      white-space: nowrap;
    }

    /* ── User card ── */
    .sidebar-user {
      display: flex; align-items: center; gap: 11px;
      padding: 12px 13px; margin: 12px 10px 4px;
      background: rgba(255,255,255,0.08); border-radius: 15px;
      border: 1px solid rgba(255,255,255,0.06);
      transition: all 0.22s; flex-shrink: 0;

      &:hover {
        background: rgba(255,255,255,0.14);
        transform: translateY(-1px);
      }
    }

    .user-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: white; font-size: 14px;
      flex-shrink: 0; box-shadow: 0 3px 10px rgba(0,0,0,0.3);

      &.av-employe { background: #38A169; }
      &.av-manager { background: #D69E2E; }
      &.av-rh      { background: #3182CE; }
      &.av-admin   { background: #805AD5; }
    }

    .user-name {
      color: white; font-weight: 600; font-size: 13px;
      display: block; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; max-width: 136px;
    }

    .user-role {
      color: rgba(255,255,255,0.45); font-size: 10px;
      font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    /* ── Mini avatar ── */
    .sidebar-user-mini {
      display: flex; justify-content: center; padding: 10px 0;
      margin: 10px 10px 4px;
      background: rgba(255,255,255,0.07);
      border-radius: 13px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s; flex-shrink: 0;

      &:hover { background: rgba(255,255,255,0.13); }
    }

    .user-avatar-mini {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: white; font-size: 13px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);

      &.av-employe { background: #38A169; }
      &.av-manager { background: #D69E2E; }
      &.av-rh      { background: #3182CE; }
      &.av-admin   { background: #805AD5; }
    }

    /* ── Section labels ── */
    .nav-section-label {
      font-size: 9.5px; font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase; letter-spacing: 1px;
      padding: 12px 14px 4px; white-space: nowrap;
    }

    /* ── Nav ── */
    .sidebar-nav {
      flex: 1; padding: 4px 10px 8px;
      display: flex; flex-direction: column; gap: 2px;
      overflow-y: auto; scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;

      &::-webkit-scrollbar { width: 3px; }
      &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1); border-radius: 3px;
      }
    }

    /* ── Nav item ── */
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 13px; border-radius: 12px;
      color: rgba(255,255,255,0.58); text-decoration: none;
      cursor: pointer; border: none; background: none;
      width: 100%; font-size: 14.5px; font-weight: 500;
      transition: all 0.2s cubic-bezier(0.2,0.9,0.4,1);
      white-space: nowrap; position: relative;

      .nav-icon {
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: transform 0.2s;
      }

      .nav-label { flex: 1; }

      .nav-tooltip {
        display: none; position: absolute;
        left: calc(100% + 14px); top: 50%;
        transform: translateY(-50%);
        background: rgba(18,181,196,0.95); color: white;
        padding: 5px 12px; border-radius: 8px;
        font-size: 12px; font-weight: 600;
        white-space: nowrap; pointer-events: none;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);

        &::before {
          content: '';
          position: absolute; right: 100%; top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: rgba(18,181,196,0.95);
        }
      }

      &:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.95);
        transform: translateX(4px);
        .nav-icon { transform: scale(1.14); }
      }

      &.active {
        background: linear-gradient(135deg,
          rgba(18,181,196,0.85) 0%,
          rgba(11,143,157,0.85) 100%);
        color: white; font-weight: 700;
        box-shadow: 0 5px 18px -5px rgba(18,181,196,0.55);
        transform: none;

        &::before {
          content: '';
          position: absolute; left: 0; top: 22%; bottom: 22%;
          width: 3px; background: white;
          border-radius: 0 3px 3px 0; opacity: 0.75;
        }

        .nav-icon { transform: scale(1.1); }
      }

      &.logout {
        color: rgba(255,150,150,0.6);
        &:hover {
          background: rgba(229,62,62,0.13);
          color: #fca5a5; transform: translateX(4px);
        }
      }
    }

    /* ── Mode réduit ── */
    .collapsed .nav-section-label { display: none; }

    .collapsed .nav-item {
      padding: 11px; justify-content: center; gap: 0;
      .nav-label { display: none; }
      &:hover { transform: scale(1.06); }
      &:hover .nav-tooltip { display: block; }
      &.active::before { display: none; }
    }

    /* ── Footer ── */
    .sidebar-footer {
      padding: 10px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }

    /* ── Toggle ── */
    .toggle-btn {
      position: absolute; right: -12px; top: 66px;
      width: 26px; height: 26px; background: var(--teal);
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: white; box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      transition: transform 0.25s, box-shadow 0.25s; z-index: 101;

      &:hover {
        transform: scale(1.22);
        box-shadow: 0 6px 18px rgba(18,181,196,0.55);
      }
    }
  `]
})
export class SidebarComponent {

  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  user = this.authService.getCurrentUser();
  ic   = IC;

  role = () => this.authService.getRole();

  get initiales(): string {
    const u = this.user;
    if (!u) return 'RH';
    return ((u.prenom?.[0] ?? '') +
            (u.nom?.[0]   ?? '')).toUpperCase();
  }

  // ===================================================================
  // NAV ITEMS — strictement par rôle selon cahier des charges
  // ===================================================================
  navItems: NavItem[] = [

    // ─── TOUS LES RÔLES ──────────────────────────────────────────────
    {
      label:   'Tableau de bord',
      route:   '/dashboard',
      roles:   ['EMPLOYE', 'MANAGER', 'RH'],
      icon:    IC.dashboard,
      section: 'Général'
    },

    // ─── EMPLOYÉ & MANAGER : leurs propres demandes ──────────────────
    {
      label: 'Mes Congés',
      route: '/conges',
      roles: ['EMPLOYE', 'MANAGER'],
      icon:  IC.conges
    },
    {
      label: 'Autorisations de Sortie',
      route: '/autorisations',
      roles: ['EMPLOYE', 'MANAGER'],
      icon:  IC.autorisations
    },
    {
      label: 'Réclamations',
      route: '/reclamations',
      roles: ['EMPLOYE', 'MANAGER'],
      icon:  IC.reclamations
    },
    {
      label: 'Avances sur Salaire',
      route: '/avances',
      roles: ['EMPLOYE', 'MANAGER'],
      icon:  IC.avances
    },
    {
      label: 'Augmentations',
      route: '/augmentations',
      roles: ['EMPLOYE', 'MANAGER'],
      icon:  IC.augmentations
    },

    // ─── MANAGER uniquement ──────────────────────────────────────────
    {
      label:   'Mon Équipe',
      route:   '/equipe',
      roles:   ['MANAGER'],
      icon:    IC.equipe,
      section: 'Management'
    },
    {
      label: 'Demandes à Valider',
      route: '/validation',
      roles: ['MANAGER'],
      icon:  IC.validation
    },

    // ─── PROFIL : tous sauf ADMIN ────────────────────────────────────
    {
      label:   'Mon Profil',
      route:   '/profil',
      roles:   ['EMPLOYE', 'MANAGER', 'RH'],
      icon:    IC.profil,
      section: 'Compte'
    },

    // ─── RH uniquement ───────────────────────────────────────────────
    {
      label:   'Gestion des Employés',
      route:   '/employes',
      roles:   ['RH'],
      icon:    IC.employes,
      section: 'Gestion RH'
    },
    {
      label: 'Congés',
      route: '/conges',
      roles: ['RH'],
      icon:  IC.conges
    },
    {
      label: 'Autorisations',
      route: '/autorisations',
      roles: ['RH'],
      icon:  IC.autorisations
    },
    {
      label: 'Réclamations',
      route: '/reclamations',
      roles: ['RH'],
      icon:  IC.reclamations
    },
    {
      label: 'Avances',
      route: '/avances',
      roles: ['RH'],
      icon:  IC.avances
    },
    {
      label: 'Augmentations',
      route: '/augmentations',
      roles: ['RH'],
      icon:  IC.augmentations
    },
    {
      label:   'Analytics & Rapports',
      route:   '/analytics',
      roles:   ['RH'],
      icon:    IC.analytics,
      section: 'Analyses'
    },
    {
      label: 'IA & Prédictions',
      route: '/ml-insights',
      roles: ['RH'],
      icon:  IC.mlInsights
    },

    // ─── ADMIN uniquement — exactement 5.9 ──────────────────────────
    {
      label:   'Utilisateurs',
      route:   '/admin/users',
      roles:   ['ADMIN'],
      icon:    IC.adminUsers,
      section: 'Administration'   // 5.9.1
    },
    {
      label: 'Configuration',
      route: '/admin/config',
      roles: ['ADMIN'],
      icon:  IC.adminConfig       // 5.9.2
    },
    {
      label: 'Sécurité',
      route: '/admin/securite',
      roles: ['ADMIN'],
      icon:  IC.adminSecurite     // 5.9.3
    },
    {
      label: 'Logs Système',
      route: '/admin/logs',
      roles: ['ADMIN'],
      icon:  IC.adminLogs         // 5.9.3
    }
  ];

  getVisibleItems(): NavItem[] {
    const role = this.authService.getRole();
    return this.navItems.filter(i => i.roles.includes(role));
  }

  getRoleLabel(): string {
    const map: Record<string, string> = {
      EMPLOYE: 'Employé',
      MANAGER: 'Manager',
      RH:      'Responsable RH',
      ADMIN:   'Administrateur'
    };
    return map[this.authService.getRole()] ?? '';
  }

  logout(): void { this.authService.logout(); }
}