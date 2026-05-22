import {
  Component, Output, EventEmitter, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService }         from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { UserPhotoService } from '../../../core/services/user-photo.service';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  bell:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chevDown: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  user:     `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lock:     `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  logout:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  x:        `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  alertKey: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  check:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  loader:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  calendar: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  banknote: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  alert:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  bellNotif:`<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  template: `
<header class="navbar">

  <!-- Logo cliquable = toggle sidebar -->
  <button class="brand-logo-btn" (click)="toggleSidebar.emit()" title="Ouvrir/Fermer le menu">
    <img src="images/graiet_logo.jpeg" alt="Logo société" />
  </button>

  <!-- Banner mot de passe temporaire -->
  <div class="pwd-banner" *ngIf="mustChangePassword && authService.getRole() !== 'ADMIN'">
    <span [innerHTML]="ic.alertKey | safeHtml"></span>
    Mot de passe temporaire actif —
    <a routerLink="/change-password">Changer maintenant</a>
    <button class="pwd-close" (click)="dismissPwdHint()" [innerHTML]="ic.x | safeHtml"></button>
  </div>

  <!-- Titre central -->
  <div class="navbar-title">
    <span class="greeting">Bonjour, {{ user?.prenom }} 👋</span>
    <span class="date-str">{{ today | date:'EEEE d MMMM yyyy' : '' : 'fr' }}</span>
  </div>

  <div class="navbar-right">

    <!-- Bouton notifications -->
    <button class="icon-btn" (click)="toggleNotifs()">
      <span [innerHTML]="ic.bell | safeHtml"></span>
      <span class="notif-dot" *ngIf="notifCount() > 0">{{ notifCount() }}</span>
    </button>

    <!-- Dropdown notifications -->
    <div class="notif-dropdown" *ngIf="showNotifs">
      <div class="notif-header">
        <div class="nh-left">
          <span [innerHTML]="ic.bellNotif | safeHtml"></span>
          <h4>Notifications</h4>
        </div>
        <div class="nh-actions">
          <span class="notif-badge" *ngIf="notifCount() > 0">{{ notifCount() }} nouvelles</span>
          <button class="nh-btn" (click)="marquerToutesLues()" *ngIf="notifCount() > 0">
            <span [innerHTML]="ic.check | safeHtml"></span> Tout lire
          </button>
        </div>
      </div>

      <div class="notif-list" *ngIf="!notifLoading()">
        <div class="notif-item" *ngFor="let n of notifications().slice(0,15)"
             [class.unread]="!n.lu" (click)="voirNotification(n)">
          <div class="ni-icon" [class]="n.color">
            <span [innerHTML]="getNotifIconSvg(n) | safeHtml"></span>
          </div>
          <div class="ni-content">
            <strong>{{ n.titre }}</strong>
            <p>{{ n.message | slice:0:80 }}{{ n.message?.length > 80 ? '…' : '' }}</p>
            <small>{{ n.createdAt | date:'dd/MM HH:mm' }}</small>
          </div>
          <div class="ni-dot" *ngIf="!n.lu"></div>
        </div>
        <div class="notif-empty" *ngIf="notifications().length === 0">
          <span [innerHTML]="ic.bellNotif | safeHtml"></span>
          <p>Aucune notification</p>
        </div>
      </div>

      <div class="notif-loading" *ngIf="notifLoading()">
        <span class="spin-icon" [innerHTML]="ic.loader | safeHtml"></span>
        Chargement…
      </div>
    </div>

    <div class="separator"></div>

    <!-- Menu utilisateur -->
    <div class="user-menu" (click)="toggleMenu()">
      <div class="user-avatar" [class.has-photo]="photo()">
        <img *ngIf="photo()" [src]="photo()!" alt="Photo" class="nav-avatar-img" />
        <span *ngIf="!photo()">{{ initiales }}</span>
      </div>
      <div class="user-info">
        <span class="user-name">{{ user?.prenom }} {{ user?.nom }}</span>
        <span class="user-role">{{ getRoleLabel() }}</span>
      </div>
      <span class="chev" [class.rotated]="showMenu" [innerHTML]="ic.chevDown | safeHtml"></span>
    </div>

    <!-- Dropdown menu -->
    <div class="user-dropdown" *ngIf="showMenu">
      <a routerLink="/profil" class="dropdown-item" (click)="showMenu=false">
        <span class="di-icon blue" [innerHTML]="ic.user | safeHtml"></span> Mon Profil
      </a>
      <a routerLink="/change-password" class="dropdown-item" (click)="showMenu=false">
        <span class="di-icon teal" [innerHTML]="ic.lock | safeHtml"></span> Changer mot de passe
      </a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item logout" (click)="logout()">
        <span class="di-icon red" [innerHTML]="ic.logout | safeHtml"></span> Déconnexion
      </button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="overlay" *ngIf="showMenu || showNotifs" (click)="closeAll()"></div>

</header>
  `,
  styles: [`
    :host { display: block; }

    /* ── Navbar ── */
    .navbar {
      height: 72px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      display: flex; align-items: center;
      padding: 0 28px; gap: 18px;
      position: sticky; top: 0; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px);
    }

    /* ── Logo-bouton (remplace le hamburger) ── */
    .brand-logo-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 10px;
      transition: all 0.2s;

      img {
        height: 60px;
        width: auto;
        object-fit: contain;
        display: block;
        transition: transform 0.2s;
      }

      &:hover img { transform: scale(1.07); }
      &:active img { transform: scale(0.97); }
    }

    @media (max-width: 480px) {
      .brand-logo-btn img { height: 32px; }
    }

    /* ── Password banner ── */
    .pwd-banner {
      display: flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 1px solid #f59e0b; color: #92400e;
      padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(245,158,11,0.2);
      animation: slideInBanner 0.4s ease;
      svg { display: block; flex-shrink: 0; }
      a { color: #d97706; font-weight: 700; text-decoration: none; &:hover { text-decoration: underline; } }
    }
    .pwd-close {
      margin-left: 4px; background: rgba(251,191,36,0.2); border: 1px solid #f59e0b;
      border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; color: #92400e;
      svg { display: block; }
      &:hover { background: #f59e0b; color: white; }
    }
    @keyframes slideInBanner { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Title ── */
    .navbar-title { flex: 1; text-align: center; }
    .greeting {
      font-weight: 700; font-size: 17px; display: block; margin-bottom: 1px;
      background: linear-gradient(135deg, #0b7d8e, #0e9daf);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .date-str { font-size: 13px; color: #64748b; font-weight: 500; }

    /* ── Right section ── */
    .navbar-right { display: flex; align-items: center; gap: 16px; position: relative; }

    /* ── Icon button ── */
    .icon-btn {
      position: relative; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08);
      border-radius: 14px; padding: 11px; cursor: pointer; color: #64748b;
      transition: all 0.2s; display: flex; align-items: center; backdrop-filter: blur(10px);
      svg { display: block; }
      &:hover { background: rgba(14,157,175,0.1); border-color: #0e9daf; color: #0e9daf; transform: translateY(-1px); }
    }
    .notif-dot {
      position: absolute; top: -3px; right: -3px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white; font-size: 10px; font-weight: 700;
      min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(239,68,68,0.4); animation: pulseRing 2s infinite;
    }
    @keyframes pulseRing {
      0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    /* ── Notifications dropdown ── */
    .notif-dropdown {
      position: absolute; top: calc(100% + 14px); right: 100px;
      width: 370px; max-height: 520px;
      background: rgba(255,255,255,0.98); backdrop-filter: blur(25px);
      border-radius: 20px; border: 1px solid rgba(0,0,0,0.07);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1);
      animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden; z-index: 1002;
    }
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .nh-left { display: flex; align-items: center; gap: 8px; color: #0e9daf; h4 { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; } svg { display: block; } }
    .nh-actions { display: flex; align-items: center; gap: 8px; }
    .notif-badge { background: linear-gradient(135deg, #0e9daf, #0b7d8e); color: white; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .nh-btn { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #0e9daf; background: none; border: none; cursor: pointer; font-weight: 700; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; svg { display: block; } &:hover { background: rgba(14,157,175,0.1); } }

    .notif-list { max-height: 420px; overflow-y: auto; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.03);
      cursor: pointer; transition: background 0.15s; position: relative;
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(14,157,175,0.04); }
      &.unread { background: #f0fbfc; &:hover { background: #e6f7f9; } }
    }
    .ni-icon {
      width: 36px; height: 36px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      svg { display: block; }
      &.success { background: #c6f6d5; color: #38a169; }
      &.danger  { background: #fed7d7; color: #e53e3e; }
      &.warning { background: #fefcbf; color: #d69e2e; }
      &.primary { background: #e6f7f9; color: #0e9daf; }
      &.info    { background: #bee3f8; color: #3182ce; }
    }
    .ni-content { flex: 1; min-width: 0; strong { font-size: 13px; color: #1e293b; display: block; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } p { font-size: 11px; color: #718096; margin: 0 0 3px; line-height: 1.4; } small { font-size: 10px; color: #a0aec0; } }
    .ni-dot { width: 8px; height: 8px; border-radius: 50%; background: #0e9daf; flex-shrink: 0; margin-top: 4px; }

    .notif-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; color: #a0aec0; svg { display: block; opacity: 0.4; } p { font-size: 13px; font-style: italic; margin: 0; } }
    .notif-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 24px; font-size: 13px; color: #718096; }
    .spin-icon { svg { display: block; animation: spin 1s linear infinite; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Separator ── */
    .separator { width: 1px; height: 36px; background: linear-gradient(to bottom, transparent, #e2e8f0, transparent); }

    /* ── User menu ── */
    .user-menu {
      display: flex; align-items: center; gap: 12px; cursor: pointer;
      padding: 8px 14px; border-radius: 20px; transition: all 0.2s;
      background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.06);
      backdrop-filter: blur(10px);
      &:hover { background: rgba(14,157,175,0.08); border-color: rgba(14,157,175,0.2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14,157,175,0.12); }
    }
    .user-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #0e9daf, #0b7d8e); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(14,157,175,0.3); flex-shrink: 0; }
    .user-avatar.has-photo {
      background: transparent;
      overflow: hidden;
      padding: 0;
    }
    .nav-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .user-info { line-height: 1.3; }
    .user-name { font-weight: 700; font-size: 14px; color: #1e293b; display: block; }
    .user-role { font-size: 11px; color: #64748b; }
    .chev { color: #64748b; transition: transform 0.3s; svg { display: block; } &.rotated { transform: rotate(180deg); } }

    /* ── User dropdown ── */
    .user-dropdown {
      position: absolute; top: calc(100% + 14px); right: 0; width: 230px;
      background: rgba(255,255,255,0.98); backdrop-filter: blur(25px);
      border-radius: 18px; border: 1px solid rgba(0,0,0,0.07);
      box-shadow: 0 20px 50px -12px rgba(0,0,0,0.2);
      animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden; z-index: 1002; padding: 6px;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .dropdown-item {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px; color: #374151; text-decoration: none;
      transition: all 0.15s; font-weight: 500; font-size: 13px;
      border-radius: 12px; cursor: pointer; background: none; border: none; width: 100%; text-align: left;
      &:hover { background: rgba(14,157,175,0.08); color: #0b7d8e; transform: translateX(3px); }
    }
    .di-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.blue { background: #bee3f8; color: #3182ce; } &.teal { background: #e6f7f9; color: #0e9daf; } &.red { background: #fed7d7; color: #e53e3e; } }
    .dropdown-divider { height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent); margin: 4px 0; }
    .logout { &:hover { background: rgba(229,62,62,0.08) !important; color: #c53030 !important; } }

    /* ── Overlay ── */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(3px); z-index: 1001; }

    /* ── Responsive ── */
    @media (max-width: 768px) { .navbar-title { display: none; } .notif-dropdown { right: 60px; width: 300px; } }
    @media (max-width: 480px) { .notif-dropdown { position: fixed; top: 72px; right: 12px; left: 12px; width: auto; } }

    /* ── Scrollbar ── */
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-track { background: transparent; }
    .notif-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
  `]
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService   = inject(AuthService);
  private notifService  = inject(NotificationService);
  private router        = inject(Router);
  private userPhotoService = inject(UserPhotoService);
  ic    = IC;
  user  = this.authService.getCurrentUser();
  today = new Date();
  photo = this.userPhotoService.photoUrl;
  showMenu   = false;
  showNotifs = false;

  notifications = signal<any[]>([]);
  notifCount    = this.notifService.nonLuesCount;
  notifLoading  = signal(false);

  get mustChangePassword(): boolean {
    return this.authService.getMustChangePassword();
  }

  get initiales(): string {
    const u = this.user;
    if (!u) return 'RH';
    return (u.prenom[0] + u.nom[0]).toUpperCase();
  }

  ngOnInit(): void {
    this.notifService.startPolling();
    this.loadNotifications();
    this.userPhotoService.loadPhoto();
  }

  loadNotifications(): void {
    this.notifLoading.set(true);
    this.notifService.getNotifications().subscribe({
      next:  (data) => { this.notifications.set(data); this.notifLoading.set(false); },
      error: ()     => this.notifLoading.set(false)
    });
  }

  marquerToutesLues(): void {
    this.notifService.marquerToutesLues().subscribe(() => {
      this.notifications.update(n => n.map(x => ({ ...x, lu: true })));
      this.notifService.nonLuesCount.set(0);
    });
  }

  voirNotification(notif: any): void {
    if (!notif.lu) {
      this.notifService.marquerLue(notif.id).subscribe(() => {
        this.notifications.update(n => n.map(x => x.id === notif.id ? { ...x, lu: true } : x));
        this.notifService.nonLuesCount.update(c => Math.max(0, c - 1));
      });
    }
    if (notif.lien) {
      let finalLink = notif.lien;
      const role = this.authService.getRole();

      // === LOGIQUE DE REDIRECTION POUR LE MANAGER ===
      if (role === 'MANAGER' && notif.type === 'NOUVELLE_DEMANDE_EN_ATTENTE') {
        finalLink = '/validation'; // Le manager va sur sa page "Demandes à Valider"
      }

      // === LOGIQUE DE REDIRECTION POUR LE RH ===
      if (role === 'RH') {
        if (finalLink.includes('reclamations')) {
          finalLink = '/rh/reclamations';
        } 
        else if (notif.type === 'NOUVELLE_DEMANDE_EN_ATTENTE') {
          if (finalLink.includes('conges')) finalLink = '/rh/conges';
          else if (finalLink.includes('avances')) finalLink = '/rh/avances';
          else if (finalLink.includes('autorisations') || finalLink.includes('augmentations')) {
            finalLink = '/rh/validation';
          }
        }
      }

      this.router.navigate([finalLink]);
      this.showNotifs = false;
    }
  }

  getNotifIconSvg(n: any): string {
    const color = (n.color ?? n.type ?? '').toLowerCase();
    const map: Record<string, string> = {
      success: IC.calendar,
      danger:  IC.alert,
      warning: IC.alert,
      primary: IC.banknote,
      info:    IC.info,
    };
    return map[color] ?? IC.info;
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      EMPLOYE: 'Employé', MANAGER: 'Manager',
      RH: 'Responsable RH', ADMIN: 'Administrateur'
    };
    return labels[this.authService.getRole()] ?? '';
  }

  toggleMenu():  void { this.showMenu  = !this.showMenu;  this.showNotifs = false; }
  toggleNotifs():void { this.showNotifs = !this.showNotifs; this.showMenu = false; }
  closeAll():    void { this.showMenu  = false; this.showNotifs = false; }
  logout():      void { this.authService.logout(); }
  dismissPwdHint(): void { this.authService.clearMustChangePassword(); }
}
