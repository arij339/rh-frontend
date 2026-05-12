import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SVG = {
  logs:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  refresh:  `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  search:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  close:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  filter:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  calendar: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock:    `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  // Action icons
  plus:     `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:     `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:    `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`,
  lock:     `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  lockOpen: `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  key:      `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  logIcon:  `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  warn:     `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  // Stat icons (larger)
  statAll:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  statPlus: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  statEdit: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  statDel:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`,
  statSec:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  empty:    `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
};

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
  <div class="al-wrap">

    <!-- ═══ HEADER ═══ -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon" [innerHTML]="svg.logs |safeHtml"></div>
        <div>
          <h1>Journaux d'Activité</h1>
          <p>Historique complet des actions effectuées sur la plateforme</p>
        </div>
      </div>
      <div class="ph-right">
        <span class="count-pill">
          <span [innerHTML]="svg.logIcon |safeHtml"></span>
          {{ logs().length }} entrées
        </span>
        <button class="btn-refresh" (click)="loadLogs()" [class.spinning]="isLoading()">
          <span class="r-icon" [innerHTML]="svg.refresh |safeHtml"></span>
          Actualiser
        </button>
      </div>
    </div>

    <!-- ═══ STATS ═══ -->
    <div class="stats-row">
      <div class="stat-card" *ngFor="let s of getStats()">
        <div class="stat-icon" [class]="'si-' + s.color" [innerHTML]="s.icon |safeHtml" ></div>
        <div class="stat-body">
          <span class="stat-val">{{ s.val }}</span>
          <span class="stat-lbl">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ FILTRES ═══ -->
    <div class="filters-bar">

      <div class="search-wrap" [class.focused]="searchFocused">
        <span class="s-icon" [innerHTML]="svg.search |safeHtml"></span>
        <input placeholder="Rechercher action, email, détails..."
               [value]="search()"
               (input)="search.set($any($event.target).value)"
               (focus)="searchFocused = true"
               (blur)="searchFocused = false" />
        <button class="s-clear" *ngIf="search()"
                (click)="search.set('')"
                [innerHTML]="svg.close |safeHtml">
        </button>
      </div>

      <div class="sel-wrap">
        <span class="sel-icon" [innerHTML]="svg.filter |safeHtml"></span>
        <select class="filter-sel"
                (change)="filterAction.set($any($event.target).value)">
          <option value="">Toutes les actions</option>
          <option *ngFor="let a of uniqueActions()" [value]="a">{{ a }}</option>
        </select>
      </div>

      <div class="sel-wrap">
        <span class="sel-icon" [innerHTML]="svg.calendar |safeHtml"></span>
        <select class="filter-sel"
                (change)="filterDate.set($any($event.target).value)">
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

    </div>

    <!-- ═══ TABLE ═══ -->
    <div class="table-card">
      <table class="pro-table">
        <thead>
          <tr>
            <th>Date &amp; Heure</th>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Entité</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let l of getFiltered(); trackBy: trackById">

            <!-- Date -->
            <td class="date-col">
              <span class="log-date">{{ l.createdAt | date:'dd/MM/yyyy' }}</span>
              <span class="log-time">
                <span [innerHTML]="svg.clock |safeHtml"></span>
                {{ l.createdAt | date:'HH:mm:ss' }}
              </span>
            </td>

            <!-- Utilisateur -->
            <td>
              <div class="user-cell">
                <div class="avatar-sm" [class]="'avc-' + getUserRole(l.userEmail)">
                  {{ getEmailInit(l.userEmail) }}
                </div>
                <span class="email-txt">{{ l.userEmail }}</span>
              </div>
            </td>

            <!-- Action -->
            <td>
              <span class="action-badge" [class]="getActionClass(l.action)">
                <span [innerHTML]="getActionIcon(l.action) |safeHtml"></span>
                {{ l.action }}
              </span>
            </td>

            <!-- Entité -->
            <td>
              <span class="entity-tag">{{ l.entity }}</span>
            </td>

            <!-- Détails -->
            <td class="details-col">
              <span class="details-text" [title]="l.details">
                {{ l.details?.substring(0, 65) }}<span *ngIf="l.details?.length > 65">…</span>
              </span>
            </td>

          </tr>

          <tr *ngIf="getFiltered().length === 0">
            <td colspan="5">
              <div class="empty-state">
                <span [innerHTML]="svg.empty|safeHtml"></span>
                <p>Aucun journal trouvé</p>
                <small *ngIf="search()">pour la recherche « {{ search() }} »</small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-foot">
        <span>{{ getFiltered().length }} / {{ logs().length }} entrée(s) affichée(s)</span>
      </div>
    </div>

  </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :host {
      --primary:    #0b6e7e;
      --primary-dk: #085e6c;
      --primary-lt: #e0f7fa;
      --accent:     #00b4c8;
      --text:       #0f172a;
      --muted:      #64748b;
      --border:     #e2e8f0;
      --bg:         #f8fafc;
      --red:        #ef4444;
      --red-lt:     #fef2f2;
      --red-mid:    #fecaca;
      --green:      #22c55e;
      --green-lt:   #f0fdf4;
      --green-mid:  #bbf7d0;
      --amber:      #f59e0b;
      --amber-lt:   #fffbeb;
      --amber-mid:  #fde68a;
      --blue-lt:    #eff6ff;
      --blue-mid:   #bfdbfe;
      --blue:       #3b82f6;
      --r:          10px;
      --font:       'Plus Jakarta Sans', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .al-wrap {
      max-width: 1200px;
      font-family: var(--font);
      color: var(--text);
    }

    /* ══ HEADER ══ */
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
    }
    .ph-left { display: flex; align-items: center; gap: 14px; }
    .ph-icon {
      width: 44px; height: 44px; background: var(--primary-lt);
      border-radius: 12px; display: flex; align-items: center;
      justify-content: center; color: var(--primary); flex-shrink: 0;
    }
    .ph-icon svg { width: 22px; height: 22px; }
    .page-header h1 {
      font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.3px;
    }
    .page-header p { font-size: 12.5px; color: var(--muted); margin-top: 2px; }

    .ph-right { display: flex; align-items: center; gap: 10px; }

    .count-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--primary-lt); color: var(--primary);
      padding: 6px 14px; border-radius: 50px;
      font-size: 12px; font-weight: 700;
    }
    .count-pill svg { width: 12px; height: 12px; }

    .btn-refresh {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 16px; border: 1.5px solid var(--border);
      background: white; border-radius: var(--r); cursor: pointer;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      color: var(--muted); transition: all 0.2s;
    }
    .btn-refresh:hover { border-color: var(--accent); color: var(--primary); }
    .r-icon { display: flex; align-items: center; }
    .r-icon svg { transition: transform 0.5s; }
    .btn-refresh.spinning .r-icon svg { animation: spin 0.8s linear infinite; }

    /* ══ STATS ══ */
    .stats-row {
      display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
    }

    .stat-card {
      background: white; border-radius: 14px;
      border: 1px solid var(--border);
      padding: 14px 18px; flex: 1; min-width: 140px;
      display: flex; align-items: center; gap: 13px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.06);
      transition: transform 0.18s, box-shadow 0.18s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(11,110,126,0.1);
    }

    .stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon svg { width: 18px; height: 18px; }
    .si-primary { background: var(--primary-lt); color: var(--primary); }
    .si-success { background: var(--green-lt);   color: #166534; }
    .si-info    { background: var(--blue-lt);    color: #1d4ed8; }
    .si-danger  { background: var(--red-lt);     color: #991b1b; }
    .si-warning { background: var(--amber-lt);   color: #92400e; }

    .stat-body { display: flex; flex-direction: column; gap: 2px; }
    .stat-val {
      font-size: 22px; font-weight: 800;
      color: var(--text); letter-spacing: -0.5px; line-height: 1;
    }
    .stat-lbl { font-size: 11px; color: var(--muted); font-weight: 500; }

    /* ══ FILTERS ══ */
    .filters-bar {
      display: flex; gap: 10px; margin-bottom: 16px;
      align-items: center; flex-wrap: wrap;
    }

    .search-wrap {
      flex: 1; min-width: 220px;
      display: flex; align-items: center; gap: 8px;
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 0 12px;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .search-wrap.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,180,200,0.1);
    }
    .s-icon { display: flex; align-items: center; color: var(--muted); flex-shrink: 0; }
    .search-wrap input {
      flex: 1; border: none; outline: none;
      padding: 10px 0; font-size: 13px;
      background: transparent; font-family: var(--font); color: var(--text);
    }
    .s-clear {
      display: flex; align-items: center; background: none;
      border: none; cursor: pointer; color: var(--muted);
      padding: 2px; transition: color 0.15s;
    }
    .s-clear:hover { color: var(--red); }

    .sel-wrap {
      display: flex; align-items: center; gap: 0;
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r); overflow: hidden;
      transition: border-color 0.18s;
    }
    .sel-wrap:focus-within { border-color: var(--accent); }
    .sel-icon {
      display: flex; align-items: center;
      padding: 0 10px 0 12px; color: var(--muted); flex-shrink: 0;
    }
    .filter-sel {
      border: none; outline: none; padding: 10px 12px 10px 0;
      font-size: 13px; font-family: var(--font);
      color: var(--text); background: transparent; cursor: pointer;
    }

    /* ══ TABLE ══ */
    .table-card {
      background: white; border-radius: 16px;
      border: 1px solid var(--border); overflow: hidden;
      box-shadow: 0 2px 12px rgba(11,110,126,0.07);
    }

    .pro-table { width: 100%; border-collapse: collapse; }
    .pro-table thead tr { background: #f8fafc; }
    .pro-table thead th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.6px;
      border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    .pro-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .pro-table tbody tr:hover { background: #f8fcfc; }
    .pro-table tbody tr:last-child { border-bottom: none; }
    .pro-table tbody td { padding: 11px 16px; font-size: 13px; }

    /* Date */
    .date-col { white-space: nowrap; }
    .log-date {
      font-size: 12.5px; font-weight: 600; color: var(--text); display: block;
    }
    .log-time {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10.5px; color: var(--muted); margin-top: 2px;
    }
    .log-time svg { width: 10px; height: 10px; }

    /* User */
    .user-cell { display: flex; align-items: center; gap: 8px; }
    .avatar-sm {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .avc-admin   { background: #7c3aed; }
    .avc-rh      { background: var(--primary); }
    .avc-manager { background: #d97706; }
    .avc-employe { background: #16a34a; }
    .avc-system  { background: #94a3b8; }
    .email-txt { font-size: 12px; color: var(--muted); }

    /* Action badge */
    .action-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 600; white-space: nowrap;
    }
    .action-badge svg { width: 11px; height: 11px; flex-shrink: 0; }
    .ab-create  { background: var(--green-lt); color: #166534; }
    .ab-update  { background: var(--primary-lt); color: var(--primary); }
    .ab-delete  { background: var(--red-lt);   color: #991b1b; }
    .ab-auth    { background: var(--blue-lt);  color: #1d4ed8; }
    .ab-warning { background: var(--amber-lt); color: #92400e; }

    /* Entity */
    .entity-tag {
      background: var(--bg); color: var(--muted);
      border: 1px solid var(--border);
      padding: 2px 9px; border-radius: 6px;
      font-size: 11px; font-weight: 500;
    }

    /* Details */
    .details-col { max-width: 260px; }
    .details-text {
      font-size: 11.5px; color: var(--muted);
      display: block; cursor: default; line-height: 1.4;
    }

    /* Footer */
    .table-foot {
      padding: 10px 16px; font-size: 11.5px; color: var(--muted);
      text-align: right; border-top: 1px solid var(--border);
      background: #fafafa;
    }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; padding: 48px; color: var(--muted);
    }
    .empty-state svg { width: 28px; height: 28px; opacity: 0.35; }
    .empty-state p { font-size: 13.5px; font-weight: 600; }
    .empty-state small { font-size: 12px; }

    /* ══ SPINNER ══ */
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminLogsComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = '/api';

  svg = SVG;

  logs         = signal<any[]>([]);
  users        = signal<any[]>([]);
  search       = signal('');
  filterAction = signal('');
  filterDate   = signal('');
  isLoading    = signal(false);
  searchFocused = false;

  uniqueActions = signal<string[]>([]);

  ngOnInit(): void {
    this.loadLogs();
    this.http.get<any[]>(`${this.API}/admin/users`)
      .subscribe(d => this.users.set(d ?? []));
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.http.get<any[]>(`${this.API}/admin/logs`)
      .subscribe({
        next: d => {
          this.logs.set(d ?? []);
          this.uniqueActions.set(
            [...new Set((d ?? []).map((l: any) => l.action))].sort()
          );
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  getFiltered(): any[] {
    return this.logs().filter(l => {
      const t  = this.search().toLowerCase();
      const a  = this.filterAction();
      const dt = this.filterDate();

      const matchText = !t ||
        (l.action    ?? '').toLowerCase().includes(t) ||
        (l.userEmail ?? '').toLowerCase().includes(t) ||
        (l.details   ?? '').toLowerCase().includes(t);

      const matchAction = !a || l.action === a;

      let matchDate = true;
      if (dt && l.createdAt) {
        const logDate  = new Date(l.createdAt);
        const now      = new Date();
        const startDay = new Date(now);
        startDay.setHours(0, 0, 0, 0);

        if (dt === 'today') {
          matchDate = logDate >= startDay;
        } else if (dt === 'week') {
          const start = new Date(now);
          start.setDate(now.getDate() - 7);
          matchDate = logDate >= start;
        } else if (dt === 'month') {
          const start = new Date(now);
          start.setDate(now.getDate() - 30);
          matchDate = logDate >= start;
        }
      }

      return matchText && matchAction && matchDate;
    });
  }

  getStats() {
    const all = this.logs();
    return [
      {
        icon: SVG.statAll,
        label: 'Total actions',
        val: all.length,
        color: 'primary'
      },
      {
        icon: SVG.statPlus,
        label: 'Créations',
        val: all.filter(l => l.action?.includes('CREATE')).length,
        color: 'success'
      },
      {
        icon: SVG.statEdit,
        label: 'Modifications',
        val: all.filter(l =>
          l.action?.includes('UPDATE') ||
          l.action?.includes('CHANGE') ||
          l.action?.includes('RESET')).length,
        color: 'info'
      },
      {
        icon: SVG.statDel,
        label: 'Suppressions',
        val: all.filter(l =>
          l.action?.includes('DELETE') ||
          l.action?.includes('DISABLE')).length,
        color: 'danger'
      },
      {
        icon: SVG.statSec,
        label: 'Sécurité',
        val: all.filter(l =>
          l.action?.includes('LOCK') ||
          l.action?.includes('UNLOCK') ||
          l.action?.includes('LOGIN')).length,
        color: 'warning'
      }
    ];
  }

  /** Retourne la classe CSS de l'action badge */
  getActionClass(action: string): string {
    if (action?.includes('CREATE') || action?.includes('ENABLE'))
      return 'action-badge ab-create';
    if (action?.includes('UPDATE') || action?.includes('CHANGE') || action?.includes('RESET'))
      return 'action-badge ab-update';
    if (action?.includes('DELETE') || action?.includes('DISABLE') || action?.includes('LOCK'))
      return 'action-badge ab-delete';
    if (action?.includes('LOGIN'))
      return 'action-badge ab-auth';
    return 'action-badge ab-warning';
  }

  /** Retourne l'icône SVG correspondant à l'action */
  getActionIcon(action: string): string {
    if (action?.includes('CREATE') || action?.includes('ENABLE')) return SVG.plus;
    if (action?.includes('UPDATE') || action?.includes('CHANGE'))  return SVG.edit;
    if (action?.includes('RESET'))                                  return SVG.key;
    if (action?.includes('DELETE') || action?.includes('DISABLE')) return SVG.trash;
    if (action?.includes('LOCK'))                                   return SVG.lock;
    if (action?.includes('UNLOCK'))                                 return SVG.lockOpen;
    if (action?.includes('LOGIN'))                                  return SVG.key;
    return SVG.warn;
  }

  getUserRole(email: string): string {
    const u = this.users().find(x => x.email === email);
    return (u?.role ?? 'system').toLowerCase();
  }

  getEmailInit(email: string): string {
    return email?.substring(0, 2).toUpperCase() ?? 'SY';
  }

  trackById(_: number, l: any): any {
    return l.id ?? l.createdAt;
  }
}
