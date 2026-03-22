import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="navbar">
      <!-- Toggle Sidebar -->
      <button class="toggle-btn" (click)="toggleSidebar.emit()">
        <svg width="20" height="20" fill="none" stroke="currentColor"
             stroke-width="2.5" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Bannière mustChangePassword -->
      <div class="pwd-hint-banner" *ngIf="mustChangePassword">
        🔐 Mot de passe temporaire actif —
        <a routerLink="/change-password">Changer maintenant</a>
        <button (click)="dismissPwdHint()">✕</button>
      </div>

      <!-- Page Title -->
      <div class="navbar-title">
        <span class="greeting">Bonjour, {{ user?.prenom }} 👋</span>
        <span class="date">{{ today | date:'EEEE d MMMM yyyy' : '' : 'fr' }}</span>
      </div>

      <div class="navbar-right">
        <!-- Notifications -->
        <button class="icon-btn" (click)="toggleNotifs()">
          <svg width="20" height="20" fill="none" stroke="currentColor"
               stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notif-dot" *ngIf="notifCount > 0">{{ notifCount }}</span>
        </button>

        <!-- Dropdown Notifications -->
        <div class="notif-dropdown" *ngIf="showNotifs">
          <div class="notif-header">
            <h4>Notifications</h4>
            <span class="notif-count">{{ notifCount }} nouvelles</span>
          </div>
          <div class="notif-list">
            <div class="notif-item" *ngFor="let n of notifications">
              <div class="notif-icon" [class]="n.type">{{ n.icon }}</div>
              <div class="notif-content">
                <p>{{ n.message }}</p>
                <span>{{ n.time }}</span>
              </div>
            </div>
            <div class="notif-empty" *ngIf="notifications.length === 0">
              Aucune nouvelle notification
            </div>
          </div>
        </div>

        <div class="separator"></div>

        <!-- User Menu -->
        <div class="user-menu" (click)="toggleMenu()">
          <div class="user-avatar">{{ initiales }}</div>
          <div class="user-info">
            <span class="user-name">{{ user?.prenom }} {{ user?.nom }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <svg width="16" height="16" fill="none" stroke="currentColor"
               stroke-width="2" viewBox="0 0 24 24"
               [class.rotated]="showMenu">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <!-- Dropdown Menu -->
        <div class="user-dropdown" *ngIf="showMenu">
          <a routerLink="/profil" class="dropdown-item" (click)="showMenu=false">
            <span>👤</span> Mon Profil
          </a>
          <a routerLink="/change-password" class="dropdown-item" (click)="showMenu=false">
            <span>🔐</span> Changer mot de passe
          </a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" (click)="logout()">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      <!-- Overlay -->
      <div class="overlay" *ngIf="showMenu || showNotifs" (click)="closeAll()"></div>
    </header>
  `,

  // ==================== CSS COMPLET ET CORRIGÉ ====================
 // Remplacez la section styles par ce CSS amélioré :

styles: [`
  /* ==================== RESET & BASE ==================== */
  * {
    box-sizing: border-box;
  }

  /* ==================== NAVBAR PRINCIPALE ==================== */
  .navbar {
    height: 72px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    padding: 0 28px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(20px);
    gap: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ==================== TOGGLE SIDEBAR ==================== */
  .toggle-btn {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    color: #475569;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .toggle-btn:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    color: #3b82f6;
    transform: scale(1.05);
  }

  .toggle-btn:active {
    transform: scale(0.98);
  }

  /* ==================== BANNER MOT DE PASSE ==================== */
  .pwd-hint-banner {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
    color: #92400e;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    animation: slideInBanner 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .pwd-hint-banner a {
    color: #d97706;
    font-weight: 600;
    text-decoration: none;
  }

  .pwd-hint-banner a:hover {
    text-decoration: underline;
  }

  .pwd-hint-banner button {
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid #f59e0b;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pwd-hint-banner button:hover {
    background: #f59e0b;
    color: white;
  }

  @keyframes slideInBanner {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ==================== TITRE CENTRAL ==================== */
  .navbar-title {
    flex: 1;
    text-align: center;
    position: relative;
  }

  .greeting {
    font-weight: 700;
    font-size: 17px;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
    margin-bottom: 2px;
  }

  .date {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  /* ==================== SECTION DROITE ==================== */
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* ==================== NOTIFICATIONS ==================== */
  .icon-btn {
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 12px;
    cursor: pointer;
    color: #64748b;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateY(-1px);
  }

  .notif-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }

  /* ==================== MENU UTILISATEUR ==================== */
  .user-menu {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    padding: 10px 16px;
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
  }

  .user-menu:hover {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  }

  .user-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }

  .user-info {
    line-height: 1.3;
  }

  .user-name {
    font-weight: 700;
    font-size: 15px;
    color: #1e293b;
    display: block;
  }

  .user-role {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  .rotated {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(180deg);
  }

  /* ==================== SÉPARATEUR ==================== */
  .separator {
    width: 1px;
    height: 36px;
    background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
  }

  /* ==================== DROPDOWNS ==================== */
  .user-dropdown, .notif-dropdown {
    position: absolute;
    top: 85px;
    right: 28px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(25px);
    border-radius: 20px;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    z-index: 1001;
  }

  .notif-dropdown {
    right: 160px;
    width: 380px;
    max-height: 500px;
  }

  .user-dropdown {
    width: 240px;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-12px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 24px;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    border-radius: 16px;
    margin: 4px 8px;
    position: relative;
  }

  .dropdown-item:hover {
    background: rgba(59, 130, 246, 0.08);
    color: #1d4ed8;
    transform: translateX(4px);
  }

  .dropdown-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e5e7eb, transparent);
    margin: 12px 16px;
  }

  .logout {
    color: #dc2626 !important;
  }

  .logout:hover {
    background: rgba(220, 38, 38, 0.08) !important;
    color: #b91c1c !important;
  }

  /* ==================== NOTIFICATIONS SPÉCIFIQUES ==================== */
  .notif-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .notif-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  .notif-count {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .notif-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .notif-item {
    display: flex;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;
  }

  .notif-item:hover {
    background: rgba(59, 130, 246, 0.04);
  }

  .notif-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .notif-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .notif-icon.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
  .notif-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

  .notif-content p {
    margin: 0 0 4px 0;
    font-weight: 600;
    color: #1e293b;
  }

  .notif-content span {
    font-size: 13px;
    color: #64748b;
  }

  .notif-empty {
    padding: 40px 24px;
    text-align: center;
    color: #9ca3af;
    font-style: italic;
  }

  /* ==================== OVERLAY ==================== */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .overlay[style*="visibility: visible"] {
    opacity: 1;
    visibility: visible;
  }

  /* ==================== RESPONSIVE ==================== */
  @media (max-width: 1024px) {
    .navbar {
      padding: 0 20px;
      gap: 16px;
    }
    
    .navbar-right {
      gap: 12px;
    }
    
    .user-dropdown {
      right: 20px;
      width: 220px;
    }
    
    .notif-dropdown {
      right: 120px;
      width: 340px;
    }
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 0 16px;
      height: 68px;
    }
    
    .greeting {
      font-size: 15px;
    }
    
    .navbar-title {
      display: none;
    }
    
    .notif-dropdown {
      right: 80px;
      width: 300px;
    }
  }

  @media (max-width: 480px) {
    .notif-dropdown {
      position: fixed;
      top: 72px;
      right: 16px;
      left: 16px;
      width: auto;
    }
  }

  /* ==================== SCROLLBAR PERSONNALISÉE ==================== */
  .notif-list::-webkit-scrollbar {
    width: 4px;
  }

  .notif-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 2px;
  }

  .notif-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  .notif-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }
`]})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);

  user = this.authService.getCurrentUser();
  today = new Date();
  showMenu = false;
  showNotifs = false;
  notifCount = 3;

  get mustChangePassword(): boolean {
    return this.authService.getMustChangePassword();
  }

  notifications = [
    { icon: '📅', type: 'info', message: 'Votre demande de congé a été validée', time: 'Il y a 10 min' },
    { icon: '💰', type: 'success', message: 'Avance sur salaire accordée', time: 'Il y a 1 heure' },
    { icon: '⚠️', type: 'warning', message: 'Réclamation en attente de réponse', time: 'Hier' }
  ];

  get initiales(): string {
    const u = this.user;
    if (!u) return 'RH';
    return (u.prenom[0] + u.nom[0]).toUpperCase();
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      EMPLOYE: 'Employé',
      MANAGER: 'Manager',
      RH: 'Responsable RH',
      ADMIN: 'Administrateur'
    };
    return labels[this.authService.getRole()] ?? '';
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
    this.showNotifs = false;
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    this.showMenu = false;
  }

  closeAll(): void {
    this.showMenu = false;
    this.showNotifs = false;
  }

  logout(): void {
    this.authService.logout();
  }

  dismissPwdHint(): void {
    this.authService.clearMustChangePassword();
  }
}