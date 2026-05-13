import { environment } from '../../../../environments/environment';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="admin-dash">

  <!-- ═══ HERO ═══ -->
  <div class="hero">
    <div class="hero-left">
      <div class="hero-badge">Admin</div>
      <h1>Vue d'ensemble</h1>
      <p>{{ today() | date:'EEEE d MMMM yyyy' }}</p>
    </div>
    <div class="hero-right">
      <div class="hero-stat">
        <span class="hs-val">{{ stats().totalUsers }}</span>
        <span class="hs-label">utilisateurs</span>
      </div>
      <div class="hero-sep"></div>
      <div class="hero-stat">
        <span class="hs-val">{{ getSocietes().length }}</span>
        <span class="hs-label">sociétés</span>
      </div>
      <div class="hero-sep"></div>
      <div class="hero-stat" [class.hs-alert]="stats().lockedUsers > 0">
        <span class="hs-val">{{ stats().lockedUsers }}</span>
        <span class="hs-label">verrouillés</span>
      </div>
    </div>
  </div>

  <!-- ═══ FILTRE SOCIÉTÉ ═══ -->
  <div class="societe-filter">
    <span class="sf-label">Filtrer par société</span>
    <div class="sf-pills">
      <button class="sf-pill" [class.active]="selectedSociete() === ''"
              (click)="selectedSociete.set('')">
        Toutes
        <span class="sf-count">{{ stats().totalUsers }}</span>
      </button>
      <button class="sf-pill" *ngFor="let s of getSocietes()"
              [class.active]="selectedSociete() === s"
              (click)="selectedSociete.set(s)">
        {{ s }}
        <span class="sf-count">{{ getCountBySociete(s) }}</span>
      </button>
    </div>
  </div>

  <!-- ═══ KPIs ═══ -->
  <div class="kpi-grid">
    <div class="kpi-card" *ngFor="let k of getKpis()">
      <div class="kpi-top">
        <div class="kpi-icon" [style.background]="k.bg" [style.color]="k.color">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path *ngIf="k.icon === 'users'" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            <path *ngIf="k.icon === 'active'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline *ngIf="k.icon === 'active'" points="22 4 12 14.01 9 11.01"/>
            <rect *ngIf="k.icon === 'locked'" x="3" y="11" width="18" height="11" rx="2"/><path *ngIf="k.icon === 'locked'" d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <path *ngIf="k.icon === 'pwd'" d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        </div>
        <div class="kpi-trend" [class.trend-up]="k.trend > 0" [class.trend-down]="k.trend < 0" *ngIf="k.trend !== 0">
          {{ k.trend > 0 ? '+' : '' }}{{ k.trend }}
        </div>
      </div>
      <div class="kpi-val">{{ k.val }}</div>
      <div class="kpi-label">{{ k.label }}</div>
      <div class="kpi-bar" *ngIf="k.pct">
        <div class="kpi-fill" [style.width]="k.pct + '%'" [style.background]="k.color"></div>
      </div>
    </div>
  </div>

  <!-- ═══ 3 COLONNES ═══ -->
  <div class="dash-row">

    <!-- Répartition par rôle -->
    <div class="dash-card">
      <div class="dc-head">
        <h3>Répartition par rôle</h3>
        <span class="dc-sub">{{ filteredUsers().length }} utilisateurs</span>
      </div>
      <div class="role-bars">
        <div class="rb-item" *ngFor="let r of getRoleDistrib()">
          <div class="rb-meta">
            <span class="rb-label">{{ r.label }}</span>
            <span class="rb-count">{{ r.count }}</span>
          </div>
          <div class="rb-track">
            <div class="rb-fill" [style.width]="r.pct + '%'" [style.background]="r.color"></div>
          </div>
          <span class="rb-pct">{{ r.pct }}%</span>
        </div>
      </div>
    </div>

    <!-- Activité 7 jours -->
    <div class="dash-card">
      <div class="dc-head">
        <h3>Activité — 7 derniers jours</h3>
        <span class="dc-sub">connexions</span>
      </div>
      <div class="activity-chart">
        <div class="ac-bars">
          <div class="ac-col" *ngFor="let d of getActivity()">
            <div class="ac-bar-wrap">
              <div class="ac-bar" [style.height]="d.pct + '%'" [title]="d.val + ' connexions'"></div>
            </div>
            <span class="ac-day">{{ d.day }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Répartition par société -->
    <div class="dash-card">
      <div class="dc-head">
        <h3>Par société</h3>
        <span class="dc-sub">{{ getSocietes().length }} sociétés</span>
      </div>
      <div class="societe-list" *ngIf="getSocietes().length > 0">
        <div class="sl-item" *ngFor="let s of getSocieteDistrib(); let i = index">
          <div class="sl-dot" [style.background]="getSocieteColor(i)"></div>
          <div class="sl-info">
            <span class="sl-name">{{ s.name }}</span>
            <div class="sl-track">
              <div class="sl-fill" [style.width]="s.pct + '%'" [style.background]="getSocieteColor(i)"></div>
            </div>
          </div>
          <span class="sl-count">{{ s.count }}</span>
        </div>
      </div>
      <div class="empty-societe" *ngIf="getSocietes().length === 0">
        <p>Aucune société assignée</p>
        <small>Éditez les employés pour assigner des sociétés</small>
      </div>
    </div>

  </div>

  <!-- ═══ ACTIONS RAPIDES ═══ -->
  <div class="actions-section">
    <h2>Actions rapides</h2>
    <div class="actions-grid">
      <a routerLink="/admin/users" class="action-card ac-primary">
        <div class="ac-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div>
          <strong>Gérer les utilisateurs</strong>
          <p>Créer, modifier, verrouiller</p>
        </div>
        <span class="ac-arrow">→</span>
      </a>
      <a routerLink="/admin/config" class="action-card">
        <div class="ac-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <div>
          <strong>Configuration</strong>
          <p>Paramètres, congés, workflow</p>
        </div>
        <span class="ac-arrow">→</span>
      </a>
      <a routerLink="/admin/securite" class="action-card" [class.ac-alert]="stats().lockedUsers > 0">
        <div class="ac-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <strong>Sécurité</strong>
          <p *ngIf="stats().lockedUsers === 0">Monitoring, comptes verrouillés</p>
          <p *ngIf="stats().lockedUsers > 0" style="color:#A32D2D">{{ stats().lockedUsers }} compte(s) verrouillé(s)</p>
        </div>
        <span class="ac-arrow">→</span>
      </a>
      <a routerLink="/admin/logs" class="action-card">
        <div class="ac-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <strong>Logs système</strong>
          <p>Journal d'activité complet</p>
        </div>
        <span class="ac-arrow">→</span>
      </a>
    </div>
  </div>

  <!-- ═══ TABLEAU UTILISATEURS FILTRÉS ═══ -->
  <div class="users-section">
    <div class="us-head">
      <h2>Utilisateurs{{ selectedSociete() ? ' — ' + selectedSociete() : '' }}</h2>
      <span class="us-count">{{ filteredUsers().length }} résultat(s)</span>
    </div>
    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th>Société</th>
            <th>Statut</th>
            <th>Dernière connexion</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUsers().slice(0, 8)">
            <td>
              <div class="u-cell">
                <div class="u-av" [class]="'uav-' + u.role?.toLowerCase()">
                  {{ getInit(u) }}
                </div>
                <div>
                  <strong>{{ u.nom }} {{ u.prenom }}</strong>
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>
            <td>
              <span class="role-pill" [class]="'rp-' + u.role?.toLowerCase()">
                {{ getRoleLabel(u.role) }}
              </span>
            </td>
            <td>
              <span class="societe-pill" *ngIf="getEmployeSociete(u.id)">
                {{ getEmployeSociete(u.id) }}
              </span>
              <span class="no-data" *ngIf="!getEmployeSociete(u.id)">—</span>
            </td>
            <td>
              <div class="status-row">
                <span class="status-dot" [class.dot-on]="u.enabled" [class.dot-off]="!u.enabled"></span>
                <span>{{ u.enabled ? 'Actif' : 'Désactivé' }}</span>
                <span class="lock-tag" *ngIf="!u.accountNonLocked">Verrouillé</span>
              </div>
            </td>
            <td>
              <span class="last-login" *ngIf="u.lastLoginAt">
                {{ u.lastLoginAt | date:'dd/MM/yy HH:mm' }}
              </span>
              <span class="no-data" *ngIf="!u.lastLoginAt">Jamais</span>
            </td>
          </tr>
          <tr *ngIf="filteredUsers().length === 0">
            <td colspan="5" class="empty-row">Aucun utilisateur dans cette société</td>
          </tr>
        </tbody>
      </table>
      <div class="table-foot" *ngIf="filteredUsers().length > 8">
        <a routerLink="/admin/users">
          Voir tous les {{ filteredUsers().length }} utilisateurs →
        </a>
      </div>
    </div>
  </div>

</div>
  `,
  styles: [`
    :host {
      --primary:   #0b6e7e;
      --primary-dk:#085e6c;
      --accent:    #e0f7fa;
      --text:      #0f172a;
      --muted:     #64748b;
      --border:    #e2e8f0;
      --bg:        #f8fafc;
      --r:         10px;
      --r-lg:      16px;
    }

    .admin-dash { max-width: 1200px; padding-bottom: 48px; font-family: inherit; }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #0A3D47 0%, #0B6E7E 60%, #0e8fa0 100%);
      border-radius: 20px; padding: 24px 28px;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px; flex-wrap: wrap; gap: 16px;
    }
    .hero-badge {
      display: inline-block; background: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase;
      padding: 3px 10px; border-radius: 20px; margin-bottom: 8px;
    }
    .hero h1 { font-size: 24px; font-weight: 800; color: white; margin: 0 0 4px; }
    .hero p  { font-size: 13px; color: rgba(255,255,255,0.6); margin: 0; }
    .hero-right { display: flex; align-items: center; gap: 20px; }
    .hero-stat { text-align: center; }
    .hs-val   { display: block; font-size: 28px; font-weight: 800; color: white; }
    .hs-label { display: block; font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.5px; }
    .hs-alert .hs-val { color: #fca5a5; }
    .hero-sep { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

    /* ── Filtre société ── */
    .societe-filter {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      margin-bottom: 20px; padding: 12px 16px;
      background: white; border-radius: var(--r-lg);
      border: 1px solid var(--border);
    }
    .sf-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .sf-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .sf-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; border: 1.5px solid var(--border);
      background: white; border-radius: 20px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: var(--muted);
      transition: all 0.2s; font-family: inherit;
    }
    .sf-pill:hover { border-color: var(--primary); color: var(--primary); }
    .sf-pill.active { background: var(--primary); color: white; border-color: var(--primary); }
    .sf-count {
      background: rgba(0,0,0,0.1); padding: 1px 6px; border-radius: 10px;
      font-size: 10px; font-weight: 700;
    }
    .sf-pill.active .sf-count { background: rgba(255,255,255,0.25); }

    /* ── KPIs ── */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }
    @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2,1fr); } }
    .kpi-card {
      background: white; border-radius: var(--r-lg); padding: 18px;
      border: 1px solid var(--border); transition: transform 0.2s;
    }
    .kpi-card:hover { transform: translateY(-2px); }
    .kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .kpi-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .kpi-trend { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px; }
    .trend-up   { background: #EAF3DE; color: #3B6D11; }
    .trend-down { background: #FCEBEB; color: #791F1F; }
    .kpi-val   { font-size: 28px; font-weight: 800; color: var(--text); }
    .kpi-label { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .kpi-bar   { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 10px; overflow: hidden; }
    .kpi-fill  { height: 100%; border-radius: 2px; transition: width 0.8s; }

    /* ── Dash row ── */
    .dash-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 16px; margin-bottom: 20px;
    }
    @media (max-width: 1000px) { .dash-row { grid-template-columns: 1fr; } }
    .dash-card {
      background: white; border-radius: var(--r-lg); padding: 18px;
      border: 1px solid var(--border);
    }
    .dc-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
    .dc-head h3 { font-size: 14px; font-weight: 700; color: var(--text); }
    .dc-sub { font-size: 11px; color: var(--muted); }

    /* Role bars */
    .role-bars { display: flex; flex-direction: column; gap: 10px; }
    .rb-item { display: flex; align-items: center; gap: 8px; }
    .rb-meta { display: flex; justify-content: space-between; min-width: 110px; }
    .rb-label { font-size: 12px; color: var(--text); }
    .rb-count { font-size: 12px; font-weight: 700; color: var(--text); }
    .rb-track { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .rb-fill  { height: 100%; border-radius: 3px; transition: width 0.8s; }
    .rb-pct   { font-size: 11px; color: var(--muted); min-width: 30px; text-align: right; }

    /* Activity chart */
    .activity-chart { height: 100px; }
    .ac-bars { display: flex; align-items: flex-end; gap: 6px; height: 80px; padding-bottom: 20px; position: relative; }
    .ac-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .ac-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .ac-bar {
      width: 100%; background: linear-gradient(to top, #0b6e7e, #12b5c4);
      border-radius: 4px 4px 0 0; min-height: 4px;
      transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1);
    }
    .ac-day { font-size: 10px; color: var(--muted); margin-top: 6px; position: absolute; bottom: 0; }
    .ac-col:nth-child(1) .ac-day { left: 0; }

    /* Société list */
    .societe-list { display: flex; flex-direction: column; gap: 10px; }
    .sl-item { display: flex; align-items: center; gap: 10px; }
    .sl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .sl-info { flex: 1; }
    .sl-name { font-size: 12px; font-weight: 600; color: var(--text); display: block; margin-bottom: 4px; }
    .sl-track { height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .sl-fill  { height: 100%; border-radius: 3px; transition: width 0.8s; }
    .sl-count { font-size: 12px; font-weight: 700; color: var(--muted); min-width: 20px; text-align: right; }
    .empty-societe { text-align: center; padding: 20px; color: var(--muted); }
    .empty-societe p { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .empty-societe small { font-size: 11px; }

    /* Actions */
    .actions-section { margin-bottom: 20px; }
    .actions-section h2 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
    .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    @media (max-width: 900px) { .actions-grid { grid-template-columns: repeat(2,1fr); } }
    .action-card {
      display: flex; align-items: center; gap: 12px;
      background: white; border-radius: var(--r-lg); padding: 14px 16px;
      text-decoration: none; border: 1.5px solid transparent;
      border-color: var(--border); transition: all 0.2s;
    }
    .action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .action-card.ac-primary { border-color: var(--primary); background: var(--accent); }
    .action-card.ac-alert  { border-color: #E24B4A; background: #FCEBEB; }
    .ac-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--bg); display: flex; align-items: center;
      justify-content: center; color: var(--primary); flex-shrink: 0;
    }
    .ac-primary .ac-icon { background: rgba(11,110,126,0.1); }
    .ac-alert   .ac-icon { background: #FED7D7; color: #A32D2D; }
    .action-card strong { font-size: 13px; color: var(--text); display: block; }
    .action-card p { font-size: 11px; color: var(--muted); margin: 2px 0 0; }
    .ac-arrow { margin-left: auto; color: var(--primary); font-size: 16px; opacity: 0; transition: opacity 0.2s; }
    .action-card:hover .ac-arrow { opacity: 1; }

    /* Users table */
    .users-section h2 { font-size: 16px; font-weight: 700; color: var(--text); }
    .us-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
    .us-count { font-size: 12px; color: var(--muted); }
    .users-table { background: white; border-radius: var(--r-lg); border: 1px solid var(--border); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    thead th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
    tbody tr:hover { background: #f8fcfc; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 11px 14px; font-size: 13px; }
    .u-cell { display: flex; align-items: center; gap: 10px; }
    .u-cell strong { display: block; font-size: 13px; }
    .u-cell small  { font-size: 11px; color: var(--muted); }
    .u-av {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .uav-admin   { background: #7c3aed; }
    .uav-rh      { background: var(--primary); }
    .uav-manager { background: #d97706; }
    .uav-employe { background: #16a34a; }
    .role-pill { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .rp-admin   { background: #ede9fe; color: #5b21b6; }
    .rp-rh      { background: var(--accent); color: var(--primary); }
    .rp-manager { background: #fffbeb; color: #92400e; }
    .rp-employe { background: #f0fdf4; color: #166534; }
    .societe-pill { background: #BEE3F8; color: #2A69AC; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-row { display: flex; align-items: center; gap: 5px; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .dot-on  { background: #22c55e; }
    .dot-off { background: #ef4444; }
    .lock-tag { background: #fef2f2; color: #991b1b; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
    .last-login { font-size: 12px; color: var(--muted); }
    .no-data { color: var(--muted); font-size: 12px; }
    .table-foot { padding: 10px 14px; border-top: 1px solid var(--border); text-align: right; }
    .table-foot a { font-size: 12px; color: var(--primary); text-decoration: none; font-weight: 600; }
    .table-foot a:hover { text-decoration: underline; }
    .empty-row { text-align: center; padding: 30px !important; color: var(--muted); }
  `]
})
export class AdminDashboardComponent implements OnInit {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  users    = signal<any[]>([]);
  employes = signal<any[]>([]);
  logs     = signal<any[]>([]);
  selectedSociete = signal('');

  stats = signal({
    totalUsers:   0,
    activeUsers:  0,
    lockedUsers:  0,
    tempPassword: 0
  });

  ngOnInit(): void {
    forkJoin({
      users:    this.http.get<any[]>(`${this.API}/admin/users`),
      employes: this.http.get<any[]>(`${this.API}/rh/employes`),
      stats:    this.http.get<any>(`${this.API}/admin/stats`)
    }).subscribe({
      next: (d) => {
        this.users.set(d.users ?? []);
        this.employes.set(d.employes ?? []);
        this.stats.set({
          totalUsers:   d.stats?.totalUsers   ?? (d.users ?? []).length,
          activeUsers:  d.stats?.activeUsers  ?? (d.users ?? []).filter((u:any) => u.enabled).length,
          lockedUsers:  d.stats?.lockedUsers  ?? (d.users ?? []).filter((u:any) => !u.accountNonLocked).length,
          tempPassword: d.stats?.tempPassword ?? (d.users ?? []).filter((u:any) => u.mustChangePassword).length
        });
      }
    });
  }

  filteredUsers() {
    const s = this.selectedSociete();
    if (!s) return this.users();
    return this.users().filter(u => {
      const emp = this.employes().find(e => e.userId === u.id || e.id === u.id);
      return emp?.societe === s;
    });
  }

  getSocietes(): string[] {
    return [...new Set(this.employes().map((e:any) => e.societe).filter(Boolean))].sort() as string[];
  }

  getCountBySociete(s: string): number {
    return this.users().filter(u => {
      const emp = this.employes().find(e => e.userId === u.id || e.id === u.id);
      return emp?.societe === s;
    }).length;
  }

  getEmployeSociete(userId: number): string | null {
    const emp = this.employes().find(e => e.userId === userId || e.id === userId);
    return emp?.societe ?? null;
  }

  getKpis() {
    const s = this.stats();
    const total = s.totalUsers || 1;
    return [
      {
        label: 'Total utilisateurs', val: s.totalUsers,
        icon: 'users', bg: '#E6F1FB', color: '#185FA5',
        pct: 100, trend: 0
      },
      {
        label: 'Comptes actifs', val: s.activeUsers,
        icon: 'active', bg: '#EAF3DE', color: '#3B6D11',
        pct: Math.round(s.activeUsers / total * 100), trend: 0
      },
      {
        label: 'Comptes verrouillés', val: s.lockedUsers,
        icon: 'locked', bg: '#FCEBEB', color: '#A32D2D',
        pct: Math.round(s.lockedUsers / total * 100), trend: 0
      },
      {
        label: 'MDP temporaire', val: s.tempPassword,
        icon: 'pwd', bg: '#FAEEDA', color: '#633806',
        pct: Math.round(s.tempPassword / total * 100), trend: 0
      }
    ];
  }

  getRoleDistrib() {
    const users = this.filteredUsers();
    const total = users.length || 1;
    const roles = [
      { key: 'EMPLOYE', label: 'Employés', color: '#639922' },
      { key: 'MANAGER', label: 'Managers', color: '#BA7517' },
      { key: 'RH',      label: 'RH',       color: '#0b6e7e' },
      { key: 'ADMIN',   label: 'Admins',   color: '#534AB7' }
    ];
    return roles.map(r => ({
      ...r,
      count: users.filter(u => u.role === r.key).length,
      pct:   Math.round(users.filter(u => u.role === r.key).length / total * 100)
    })).filter(r => r.count > 0);
  }

  getActivity() {
    const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const vals = [12, 18, 15, 22, 19, 8, 5];
    const max = Math.max(...vals);
    return days.map((day, i) => ({
      day,
      val: vals[i],
      pct: Math.round(vals[i] / max * 100)
    }));
  }

  getSocieteDistrib() {
    const societes = this.getSocietes();
    const max = Math.max(...societes.map(s => this.getCountBySociete(s)), 1);
    return societes.map(s => ({
      name:  s,
      count: this.getCountBySociete(s),
      pct:   Math.round(this.getCountBySociete(s) / max * 100)
    }));
  }

  getSocieteColor(i: number): string {
    const colors = ['#0b6e7e','#378ADD','#639922','#BA7517','#534AB7','#D4537E','#D85A30'];
    return colors[i % colors.length];
  }

  getInit(u: any): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const map: Record<string,string> = { EMPLOYE:'Employé', MANAGER:'Manager', RH:'RH', ADMIN:'Admin' };
    return map[role] ?? role;
  }

  today(): Date { return new Date(); }
}


