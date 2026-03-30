import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="admin-dash fade-in">

    <!-- Header -->
    <div class="dash-header">
      <div class="dh-left">
        <div class="dh-icon">⚙️</div>
        <div>
          <h1>Administration Système</h1>
          <p>Vue d'ensemble • Monitoring • Activité</p>
        </div>
      </div>
      <div class="dh-stats" *ngIf="stats()">
        <div class="dhs-item">
          <span class="dhs-val">{{ stats()?.totalUsers }}</span>
          <span class="dhs-label">Utilisateurs</span>
        </div>
        <div class="dhs-sep"></div>
        <div class="dhs-item">
          <span class="dhs-val success">
            {{ stats()?.activeUsers }}
          </span>
          <span class="dhs-label">Actifs</span>
        </div>
        <div class="dhs-sep"></div>
        <div class="dhs-item">
          <span class="dhs-val"
                [class.danger]="stats()?.lockedUsers > 0">
            {{ stats()?.lockedUsers }}
          </span>
          <span class="dhs-label">Verrouillés</span>
        </div>
        <div class="dhs-sep"></div>
        <div class="dhs-item">
          <span class="dhs-val info">{{ stats()?.uptime }}</span>
          <span class="dhs-label">Uptime</span>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-row">
      <div class="kpi-card" *ngFor="let k of getKPIs()">
        <div class="kc-icon" [class]="k.color">{{ k.icon }}</div>
        <div class="kc-body">
          <span class="kc-val">{{ k.val }}</span>
          <span class="kc-label">{{ k.label }}</span>
        </div>
        <a [routerLink]="k.link" class="kc-link">→</a>
      </div>
    </div>

    <!-- Raccourcis rapides -->
    <div class="shortcuts">
      <h2>⚡ Accès rapide</h2>
      <div class="sc-grid">
        <a routerLink="/admin/users" class="sc-card">
          <span class="sc-icon">👥</span>
          <div>
            <strong>Gestion Utilisateurs</strong>
            <p>Créer, modifier, gérer les comptes</p>
          </div>
          <span class="sc-arrow">→</span>
        </a>
        <a routerLink="/admin/config" class="sc-card">
          <span class="sc-icon">⚙️</span>
          <div>
            <strong>Configuration</strong>
            <p>Paramètres entreprise, congés, workflow</p>
          </div>
          <span class="sc-arrow">→</span>
        </a>
        <a routerLink="/admin/securite" class="sc-card"
           [class.alert]="stats()?.lockedUsers > 0">
          <span class="sc-icon">🛡️</span>
          <div>
            <strong>Sécurité</strong>
            <p>
              {{ stats()?.lockedUsers > 0
                 ? stats()?.lockedUsers + ' compte(s) verrouillé(s)'
                 : 'Monitoring des accès' }}
            </p>
          </div>
          <span class="sc-arrow">→</span>
        </a>
        <a routerLink="/admin/logs" class="sc-card">
          <span class="sc-icon">📋</span>
          <div>
            <strong>Logs d'activité</strong>
            <p>Historique complet des actions</p>
          </div>
          <span class="sc-arrow">→</span>
        </a>
      </div>
    </div>

    <!-- 2 colonnes : activité + système -->
    <div class="dash-cols">

      <!-- Activité récente -->
      <div class="dash-card">
        <div class="dc-header">
          <h3>🕐 Activité récente</h3>
          <a routerLink="/admin/logs" class="dc-link">
            Voir tout →
          </a>
        </div>
        <div class="activity-list">
          <div class="al-item"
               *ngFor="let l of logs().slice(0,8)">
            <div class="ali-icon"
                 [class]="getLogColor(l.action)">
              {{ getLogIcon(l.action) }}
            </div>
            <div class="ali-body">
              <span>{{ l.action }}</span>
              <small>{{ l.userEmail }}</small>
            </div>
            <span class="ali-time">
              {{ l.createdAt | date:'HH:mm' }}
            </span>
          </div>
          <div class="empty-act" *ngIf="logs().length === 0">
            Aucune activité récente
          </div>
        </div>
      </div>

      <!-- Monitoring système -->
      <div class="dash-card">
        <div class="dc-header">
          <h3>🖥️ État du système</h3>
          <button class="dc-link" (click)="loadData()">
            🔄 Actualiser
          </button>
        </div>
        <div class="monitor-list">
          <div class="ml-item ok">
            <span>🟢</span>
            <div>
              <strong>Application</strong>
              <small>Opérationnelle</small>
            </div>
          </div>
          <div class="ml-item ok">
            <span>🗄️</span>
            <div>
              <strong>Base de données</strong>
              <small>Connectée</small>
            </div>
          </div>
          <div class="ml-item ok">
            <span>📧</span>
            <div>
              <strong>Service Email</strong>
              <small>Actif (SMTP)</small>
            </div>
          </div>
          <div class="ml-item">
            <span>⏱️</span>
            <div>
              <strong>Uptime</strong>
              <small>{{ monitoring()?.uptime ?? 'Calcul...' }}</small>
            </div>
          </div>
          <div class="ml-item">
            <span>💾</span>
            <div>
              <strong>Mémoire</strong>
              <small>
                {{ monitoring()?.memoire?.utilise ?? '—' }}
                / {{ monitoring()?.memoire?.total ?? '—' }}
              </small>
            </div>
          </div>
          <div class="ml-item">
            <span>☕</span>
            <div>
              <strong>Java Version</strong>
              <small>{{ monitoring()?.java?.version ?? '—' }}</small>
            </div>
          </div>
        </div>

        <!-- Répartition rôles -->
        <div class="role-distrib">
          <h4>👥 Répartition par rôle</h4>
          <div class="rd-row" *ngFor="let r of getRoles()">
            <span class="rd-label">{{ r.label }}</span>
            <div class="rd-track">
              <div class="rd-bar" [class]="r.color"
                   [style.width]="getPct(r.count) + '%'">
              </div>
            </div>
            <span class="rd-val">{{ r.count }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    .admin-dash { max-width: 1200px; }

    // ===== HEADER =====
    .dash-header {
      background: linear-gradient(135deg,
        #0A3D47, #0B6E7E, #12B5C4);
      border-radius: 18px; padding: 22px 28px;
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }

    .dh-left {
      display: flex; align-items: center; gap: 14px;
      .dh-icon {
        font-size: 36px; width: 54px; height: 54px;
        background: rgba(255,255,255,0.15);
        border-radius: 14px;
        display: flex; align-items: center;
        justify-content: center;
      }
      h1 { font-size: 20px; font-weight: 800;
           color: white; margin-bottom: 3px; }
      p  { font-size: 12px; color: rgba(255,255,255,0.7); }
    }

    .dh-stats {
      display: flex; align-items: center;
      background: rgba(255,255,255,0.1);
      border-radius: 12px; padding: 10px 18px;
    }

    .dhs-item {
      display: flex; flex-direction: column;
      align-items: center; padding: 0 14px;
      .dhs-val {
        font-size: 20px; font-weight: 800; color: white;
        &.success { color: #68D391; }
        &.danger  { color: #FC8181; }
        &.info    { color: #63B3ED; }
      }
      .dhs-label { font-size: 10px;
                    color: rgba(255,255,255,0.6); }
    }

    .dhs-sep {
      width: 1px; height: 28px;
      background: rgba(255,255,255,0.2);
    }

    // ===== KPIs =====
    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 24px;

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .kpi-card {
      background: white; border-radius: 12px; padding: 16px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.07);
      display: flex; align-items: center; gap: 12px;
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }

      .kc-icon {
        width: 42px; height: 42px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; flex-shrink: 0;
        &.primary { background: var(--accent); }
        &.success { background: #C6F6D5; }
        &.danger  { background: #FED7D7; }
        &.warning { background: #FEFCBF; }
      }

      .kc-val   { font-size: 22px; font-weight: 800;
                   color: var(--primary-dark); display: block; }
      .kc-label { font-size: 11px; color: var(--text-light); }

      .kc-link {
        margin-left: auto; color: var(--primary);
        text-decoration: none; font-size: 18px; font-weight: 700;
        opacity: 0; transition: opacity 0.2s;
      }

      &:hover .kc-link { opacity: 1; }
    }

    // ===== SHORTCUTS =====
    .shortcuts {
      margin-bottom: 24px;
      h2 { font-size: 16px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 14px; }
    }

    .sc-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px;

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .sc-card {
      display: flex; align-items: center; gap: 12px;
      background: white; border-radius: 14px; padding: 16px;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(11,110,126,0.07);
      border: 2px solid transparent; transition: all 0.2s;

      &:hover {
        border-color: var(--secondary);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(11,110,126,0.12);
      }

      &.alert {
        border-color: var(--warning);
        background: #FFFFF0;
        p { color: var(--warning); font-weight: 600; }
      }

      .sc-icon { font-size: 28px; flex-shrink: 0; }

      strong { font-size: 13px; color: var(--text);
               display: block; margin-bottom: 3px; }
      p { font-size: 11px; color: var(--text-light); margin: 0; }

      .sc-arrow { margin-left: auto; color: var(--primary);
                   font-size: 18px; font-weight: 700;
                   opacity: 0; transition: opacity 0.2s; }

      &:hover .sc-arrow { opacity: 1; }
    }

    // ===== 2 COLS =====
    .dash-cols {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .dash-card {
      background: white; border-radius: 14px; padding: 20px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.07);
    }

    .dc-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 14px;
      h3 { font-size: 14px; font-weight: 700;
           color: var(--primary-dark); }
      .dc-link {
        color: var(--primary); font-size: 12px;
        font-weight: 600; text-decoration: none;
        background: none; border: none; cursor: pointer;
        &:hover { text-decoration: underline; }
      }
    }

    // ===== ACTIVITY =====
    .activity-list {
      display: flex; flex-direction: column; gap: 6px;
    }

    .al-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--gray-light);
      &:last-child { border-bottom: none; }

      .ali-icon {
        width: 26px; height: 26px; border-radius: 6px;
        display: flex; align-items: center;
        justify-content: center; font-size: 12px;
        flex-shrink: 0;
        &.create  { background: #C6F6D5; }
        &.update  { background: var(--accent); }
        &.delete  { background: #FED7D7; }
        &.auth    { background: #BEE3F8; }
        &.warning { background: #FEFCBF; }
      }

      .ali-body {
        flex: 1;
        span  { font-size: 12px; font-weight: 600;
                color: var(--primary); display: block; }
        small { font-size: 10px; color: var(--text-light); }
      }

      .ali-time { font-size: 10px; color: var(--text-light); }
    }

    .empty-act {
      padding: 20px; text-align: center;
      color: var(--text-light); font-size: 13px;
      background: var(--gray-light); border-radius: 8px;
    }

    // ===== MONITOR =====
    .monitor-list {
      display: flex; flex-direction: column; gap: 8px;
      margin-bottom: 16px;
    }

    .ml-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; background: var(--gray-light);
      border-radius: 8px;

      &.ok { background: #F0FFF4; }

      > span { font-size: 18px; flex-shrink: 0; }

      strong { font-size: 12px; color: var(--text);
               display: block; }
      small  { font-size: 11px; color: var(--text-light); }
    }

    // ===== RÔLES =====
    .role-distrib {
      border-top: 1px solid var(--gray-mid); padding-top: 14px;
      h4 { font-size: 12px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 10px; }
    }

    .rd-row {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px;

      .rd-label { font-size: 11px; color: var(--text-light);
                   min-width: 65px; }
      .rd-track {
        flex: 1; height: 5px; background: var(--gray-mid);
        border-radius: 3px; overflow: hidden;
        .rd-bar {
          height: 100%; border-radius: 3px;
          transition: width 0.5s;
          &.primary { background: var(--primary); }
          &.warning { background: var(--warning); }
          &.info    { background: var(--secondary); }
          &.danger  { background: var(--danger); }
        }
      }
      .rd-val { font-size: 11px; font-weight: 700;
                 color: var(--text); min-width: 16px; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  stats      = signal<any>(null);
  logs       = signal<any[]>([]);
  monitoring = signal<any>(null);

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    forkJoin({
      stats:   this.http.get<any>(`${this.API}/admin/stats`),
      logs:    this.http.get<any[]>(`${this.API}/admin/logs`),
      monitor: this.http.get<any>(`${this.API}/admin/monitoring`)
    }).subscribe({
      next: (d) => {
        this.stats.set(d.stats);
        this.logs.set(d.logs ?? []);
        this.monitoring.set(d.monitor);
      }
    });
  }

  getKPIs() {
    const s = this.stats();
    return [
      {
        icon: '👥', label: 'Total utilisateurs',
        val: s?.totalUsers ?? 0,
        color: 'primary', link: '/admin/users'
      },
      {
        icon: '🟢', label: 'Comptes actifs',
        val: s?.activeUsers ?? 0,
        color: 'success', link: '/admin/users'
      },
      {
        icon: '🔒', label: 'Verrouillés',
        val: s?.lockedUsers ?? 0,
        color: 'danger', link: '/admin/securite'
      },
      {
        icon: '🔑', label: 'MDP temporaires',
        val: s?.tempPassword ?? 0,
        color: 'warning', link: '/admin/users'
      }
    ];
  }

  getRoles() {
    const pr    = this.stats()?.parRole ?? {};
    const total = this.stats()?.totalUsers || 1;
    return [
      { label: 'Employés', count: pr['EMPLOYE'] ?? 0,
        color: 'primary' },
      { label: 'Managers', count: pr['MANAGER'] ?? 0,
        color: 'warning' },
      { label: 'RH',       count: pr['RH']      ?? 0,
        color: 'info' },
      { label: 'Admins',   count: pr['ADMIN']   ?? 0,
        color: 'danger' }
    ];
  }

  getPct(count: number): number {
    const t = this.stats()?.totalUsers || 1;
    return Math.round((count / t) * 100);
  }

  getLogIcon(a: string): string {
    if (a?.includes('CREATE') || a?.includes('ENABLE')) return '➕';
    if (a?.includes('UPDATE') || a?.includes('CHANGE') ||
        a?.includes('RESET'))  return '✏️';
    if (a?.includes('DELETE') || a?.includes('DISABLE') ||
        a?.includes('LOCK'))   return '🗑️';
    if (a?.includes('LOGIN'))  return '🔑';
    return '📋';
  }

  getLogColor(a: string): string {
    if (a?.includes('CREATE') || a?.includes('ENABLE')) return 'create';
    if (a?.includes('UPDATE') || a?.includes('CHANGE')) return 'update';
    if (a?.includes('DELETE') || a?.includes('DISABLE') ||
        a?.includes('LOCK'))   return 'delete';
    if (a?.includes('LOGIN'))  return 'auth';
    return 'warning';
  }
}