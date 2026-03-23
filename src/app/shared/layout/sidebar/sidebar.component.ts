import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">

      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">RH</div>
        <span class="logo-text" *ngIf="!collapsed">RH Manager</span>
      </div>

      <!-- User Info (Card style) -->
      <div class="sidebar-user" *ngIf="!collapsed">
        <div class="user-avatar">{{ initiales }}</div>
        <div class="user-info">
          <span class="user-name">{{ user?.prenom }} {{ user?.nom }}</span>
          <span class="user-role">{{ getRoleLabel() }}</span>
        </div>
      </div>
      <div class="sidebar-user-mini" *ngIf="collapsed">
        <div class="user-avatar-mini">{{ initiales }}</div>
      </div>

      <!-- Navigation with animated items -->
      <nav class="sidebar-nav">
        <ng-container *ngFor="let item of getVisibleItems()">
          <a [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [title]="collapsed ? item.label : ''">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>

      <!-- Logout button -->
      <div class="sidebar-footer">
        <button class="nav-item logout" (click)="logout()">
          <span class="nav-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor"
                 stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span class="nav-label" *ngIf="!collapsed">Déconnexion</span>
        </button>
      </div>

      <!-- Toggle Button with animation -->
      <button class="toggle-btn" (click)="toggleSidebar.emit()">
        <svg width="16" height="16" fill="none" stroke="currentColor"
             stroke-width="2.5" viewBox="0 0 24 24">
          <polyline *ngIf="!collapsed" points="15 18 9 12 15 6"/>
          <polyline *ngIf="collapsed"  points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </aside>
  `,
  styles: [`
    /* Modern SaaS Sidebar with Card & Animations */
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: var(--sidebar-width, 260px);
      background: linear-gradient(180deg,
        var(--primary-dark, #0f2b4b) 0%,
        var(--primary, #1a3b5c) 100%);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
      z-index: 100;
      overflow: hidden;

      &.collapsed {
        width: var(--sidebar-collapsed, 80px);
      }
    }

    /* Logo section */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.1);

      .logo-icon {
        width: 36px; height: 36px;
        background: var(--secondary, #12b5c4);
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; color: white; font-size: 13px;
        flex-shrink: 0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 4px 10px rgba(18, 181, 196, 0.3);
      }

      .logo-text {
        color: white;
        font-size: 18px;
        font-weight: 700;
        white-space: nowrap;
        letter-spacing: 0.5px;
      }

      &:hover .logo-icon {
        transform: rotate(-5deg) scale(1.05);
        box-shadow: 0 6px 14px rgba(18, 181, 196, 0.5);
      }
    }

    /* User card (expanded) */
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px;
      margin: 16px 12px 8px 12px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(4px);
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 16px -6px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.3);
      }

      .user-avatar {
        width: 42px; height: 42px;
        background: var(--secondary, #12b5c4);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: white; font-size: 15px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .user-name {
        color: white;
        font-weight: 600;
        font-size: 13px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
      }

      .user-role {
        color: rgba(255,255,255,0.7);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
    }

    /* Mini user (collapsed) */
    .sidebar-user-mini {
      display: flex;
      justify-content: center;
      padding: 16px 0;
      margin: 8px 12px;
      background: rgba(255,255,255,0.08);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s;

      &:hover {
        background: rgba(255,255,255,0.15);
      }

      .user-avatar-mini {
        width: 40px; height: 40px;
        background: var(--secondary, #12b5c4);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: white; font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;

      /* Hide scrollbar for cleaner look (optional) */
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.2) transparent;
      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
    }

    /* Nav items with card-like animations */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1);
      white-space: nowrap;
      position: relative;
      overflow: hidden;

      /* Subtle shine effect on hover */
      &::after {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        width: 0; height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        transform: translate(-50%, -50%);
        transition: width 0.4s, height 0.4s;
        z-index: 0;
        pointer-events: none;
      }

      &:hover {
        background: rgba(255,255,255,0.1);
        color: white;
        transform: translateX(6px) scale(1.02);
        box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.4);
      }

      &:hover::after {
        width: 200px;
        height: 200px;
      }

      &.active {
        background: var(--secondary, #12b5c4);
        color: white;
        box-shadow: 0 10px 20px -8px rgba(18, 181, 196, 0.5);
        transform: scale(1.02);
      }

      &.logout:hover {
        background: rgba(229,62,62,0.2);
        color: #FEB2B2;
        transform: translateX(6px) scale(1.02);
        box-shadow: 0 8px 16px -8px rgba(229,62,62,0.3);
      }

      .nav-icon {
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        z-index: 1;
      }

      .nav-label {
        flex: 1;
        z-index: 1;
      }
    }

    /* Footer */
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: auto;
    }

    /* Animated toggle button */
    .toggle-btn {
      position: absolute;
      right: -12px;
      top: 72px;
      width: 28px; height: 28px;
      background: var(--secondary, #12b5c4);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      z-index: 101;

      &:hover {
        transform: scale(1.15) rotate(0deg);
        box-shadow: 0 6px 16px rgba(18, 181, 196, 0.5);
      }

      svg {
        transition: transform 0.3s ease;
      }

      &:hover svg {
        transform: scale(1.1);
      }
    }

    /* Custom properties fallback */
    :host {
      --sidebar-width: 260px;
      --sidebar-collapsed: 80px;
      --primary-dark: #0f2b4b;
      --primary: #1a3b5c;
      --secondary: #12b5c4;
      --accent-mid: #a0b8cc;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  user = this.authService.getCurrentUser();

  get initiales(): string {
    const u = this.user;
    if (!u) return 'RH';
    return (u.prenom[0] + u.nom[0]).toUpperCase();
  }

  navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    route: '/dashboard',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <rect x="3" y="3" width="7" height="7"/>
             <rect x="14" y="3" width="7" height="7"/>
             <rect x="14" y="14" width="7" height="7"/>
             <rect x="3" y="14" width="7" height="7"/>
           </svg>`
  },
  {
    label: 'Congés',
    route: '/conges',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <rect x="3" y="4" width="18" height="18" rx="2"/>
             <line x1="16" y1="2" x2="16" y2="6"/>
             <line x1="8"  y1="2" x2="8"  y2="6"/>
             <line x1="3"  y1="10" x2="21" y2="10"/>
           </svg>`
  },
  {
    label: 'Autorisations',
    route: '/autorisations',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <circle cx="12" cy="12" r="10"/>
             <polyline points="12 6 12 12 16 14"/>
           </svg>`
  },
  {
    label: 'Réclamations',
    route: '/reclamations',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5
                      a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
           </svg>`
  },
  {
    label: 'Avances',
    route: '/avances',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <line x1="12" y1="1" x2="12" y2="23"/>
             <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5
                      a3.5 3.5 0 0 1 0 7H6"/>
           </svg>`
  },
  {
    label: 'Employés',
    route: '/employes',
    roles: ['RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5
                      a4 4 0 0 0-4 4v2"/>
             <circle cx="9" cy="7" r="4"/>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
             <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
           </svg>`
  },
  {
    label: 'Analytics',
    route: '/analytics',
    roles: ['RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <line x1="18" y1="20" x2="18" y2="10"/>
             <line x1="12" y1="20" x2="12" y2="4"/>
             <line x1="6"  y1="20" x2="6"  y2="14"/>
           </svg>`
  },
  {
    label: 'Administration',
    route: '/admin',
    roles: ['ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7
                      c0 6 8 10 8 10z"/>
           </svg>`
  },
  {
    label: 'Mon Profil',
    route: '/profil',
    roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
    icon: `<svg width="20" height="20" fill="none"
                stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8
                      a4 4 0 0 0-4 4v2"/>
             <circle cx="12" cy="7" r="4"/>
           </svg>`
  },
  {
  label: 'Augmentations',
  route: '/augmentations',
  roles: ['EMPLOYE','MANAGER','RH','ADMIN'],
  icon: `<svg width="20" height="20" fill="none"
               stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24">
           <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
           <polyline points="17 6 23 6 23 12"/>
         </svg>`
},
];

  getVisibleItems(): NavItem[] {
    const role = this.authService.getRole();
    return this.navItems.filter(item => item.roles.includes(role));
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      EMPLOYE: 'Employé', MANAGER: 'Manager',
      RH: 'Responsable RH', ADMIN: 'Administrateur'
    };
    return labels[this.authService.getRole()] ?? '';
  }

  logout(): void {
    this.authService.logout();
  }
}