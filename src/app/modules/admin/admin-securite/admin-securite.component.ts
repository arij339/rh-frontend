import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SVG = {
  shield:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  refresh:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  lock:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  lockOpen: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  lockSm:   `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  slash:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  key:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  keySm:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  warn:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  warnSm:   `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  power:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
  search:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  user:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  briefcase:`<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  building: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>`,
  shieldSm: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  info:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  close:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

@Component({
  selector: 'app-admin-securite',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
  <div class="as-wrap">

    <!-- ═══ HEADER ═══ -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon" [innerHTML]="svg.shield |safeHtml"></div>
        <div>
          <h1>Sécurité et Maintenance</h1>
          <p>Surveillance des comptes et gestion des accès</p>
        </div>
      </div>
      <button class="btn-refresh" (click)="loadData()" [class.spinning]="isLoading()">
        <span class="refresh-icon" [innerHTML]="svg.refresh |safeHtml"></span>
        Actualiser
      </button>
    </div>

    <!-- ═══ ALERTES SÉCURITÉ ═══ -->
    <div class="alerts-row">

      <div class="alert-card alert-critical" *ngIf="locked().length > 0">
        <div class="alc-left">
          <div class="alc-icon-wrap alc-red">
            <span [innerHTML]="svg.lock |safeHtml"></span>
          </div>
          <div>
            <strong>{{ locked().length }} compte(s) verrouillé(s)</strong>
            <p>Trop de tentatives d'authentification échouées</p>
          </div>
        </div>
        <span class="alc-badge badge-red">Intervention requise</span>
      </div>

      <div class="alert-card alert-warn" *ngIf="disabled().length > 0">
        <div class="alc-left">
          <div class="alc-icon-wrap alc-amber">
            <span [innerHTML]="svg.slash |safeHtml"></span>
          </div>
          <div>
            <strong>{{ disabled().length }} compte(s) désactivé(s)</strong>
            <p>Comptes inactifs ou suspendus</p>
          </div>
        </div>
        <span class="alc-badge badge-amber">À vérifier</span>
      </div>

      <div class="alert-card alert-ok"
           *ngIf="locked().length === 0 && disabled().length === 0">
        <div class="alc-left">
          <div class="alc-icon-wrap alc-green">
            <span [innerHTML]="svg.checkCircle |safeHtml"></span>
          </div>
          <strong>Aucun problème de sécurité détecté</strong>
        </div>
        <span class="alc-badge badge-green">Système sain</span>
      </div>

    </div>

    <!-- ═══ COMPTES VERROUILLÉS ═══ -->
    <div class="section-card" *ngIf="locked().length > 0">
      <div class="sc-header">
        <div class="sc-title">
          <span class="sc-icon sc-icon-red" [innerHTML]="svg.lock |safeHtml"></span>
          <h2>Comptes Verrouillés</h2>
        </div>
        <span class="badge-pill badge-red">{{ locked().length }} à débloquer</span>
      </div>

      <table class="pro-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Tentatives</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of locked(); trackBy: trackById">
            <td>
              <div class="user-cell">
                <div class="avatar" [class]="'av-' + u.role?.toLowerCase()">{{ init(u) }}</div>
                <span class="uc-name">{{ u.nom }} {{ u.prenom }}</span>
              </div>
            </td>
            <td><span class="email-txt">{{ u.email }}</span></td>
            <td>
              <span class="role-tag" [class]="'rt-' + u.role?.toLowerCase()">
                <span [innerHTML]="getRoleIcon(u.role) |safeHtml"></span>
                {{ u.role }}
              </span>
            </td>
            <td>
              <div class="attempts-bar">
                <span class="attempts-num">{{ u.failedAttempts }} / 5</span>
                <div class="bar-track">
                  <div class="bar-fill"
                       [style.width.%]="(u.failedAttempts / 5) * 100">
                  </div>
                </div>
              </div>
            </td>
            <td>
              <button class="btn-action btn-unlock" (click)="unlock(u.id)">
                <span [innerHTML]="svg.lockOpen |safeHtml"></span>
                Déverrouiller
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ COMPTES À RISQUE ═══ -->
    <div class="section-card">
      <div class="sc-header">
        <div class="sc-title">
          <span class="sc-icon sc-icon-amber" [innerHTML]="svg.warn |safeHtml"></span>
          <h2>Comptes nécessitant attention</h2>
        </div>
        <div class="filter-tabs">
          <button class="ft-btn" [class.ft-active]="secFilter() === ''"
                  (click)="secFilter.set('')">
            Tous
            <span class="ft-count">{{ atRisk().length }}</span>
          </button>
          <button class="ft-btn" [class.ft-active]="secFilter() === 'locked'"
                  (click)="secFilter.set('locked')">
            <span [innerHTML]="svg.lockSm |safeHtml"></span>
            Verrouillés
          </button>
          <button class="ft-btn" [class.ft-active]="secFilter() === 'disabled'"
                  (click)="secFilter.set('disabled')">
            <span [innerHTML]="svg.slash |safeHtml"></span>
            Désactivés
          </button>
          <button class="ft-btn" [class.ft-active]="secFilter() === 'pwd'"
                  (click)="secFilter.set('pwd')">
            <span [innerHTML]="svg.keySm |safeHtml"></span>
            MDP temp.
          </button>
        </div>
      </div>

      <!-- Recherche -->
      <div class="search-wrap" [class.focused]="searchFocused">
        <span class="s-icon" [innerHTML]="svg.search |safeHtml"></span>
        <input placeholder="Rechercher un utilisateur..."
               [value]="secSearch()"
               (input)="secSearch.set($any($event.target).value)"
               (focus)="searchFocused = true"
               (blur)="searchFocused = false" />
        <button class="s-clear" *ngIf="secSearch()"
                (click)="secSearch.set('')"
                [innerHTML]="svg.close|safeHtml">
        </button>
      </div>

      <table class="pro-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th>Problèmes détectés</th>
            <th>Tentatives</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of getFilteredAtRisk(); trackBy: trackById">

            <td>
              <div class="user-cell">
                <div class="avatar" [class]="'av-' + u.role?.toLowerCase()">{{ init(u) }}</div>
                <div class="uc-info">
                  <span class="uc-name">{{ u.nom }} {{ u.prenom }}</span>
                  <span class="uc-email">{{ u.email }}</span>
                </div>
              </div>
            </td>

            <td>
              <span class="role-tag" [class]="'rt-' + u.role?.toLowerCase()">
                <span [innerHTML]="getRoleIcon(u.role) |safeHtml"></span>
                {{ u.role }}
              </span>
            </td>

            <td>
              <div class="problems">
                <span class="prob-tag prob-lock" *ngIf="!u.accountNonLocked">
                  <span [innerHTML]="svg.lockSm |safeHtml"></span> Verrouillé
                </span>
                <span class="prob-tag prob-inactive" *ngIf="!u.enabled">
                  <span [innerHTML]="svg.slash |safeHtml"></span> Désactivé
                </span>
                <span class="prob-tag prob-pwd" *ngIf="u.mustChangePassword">
                  <span [innerHTML]="svg.keySm |safeHtml"></span> MDP temp.
                </span>
                <span class="prob-tag prob-warn"
                      *ngIf="u.failedAttempts > 2 && u.accountNonLocked">
                  <span [innerHTML]="svg.warnSm |safeHtml"></span>
                  {{ u.failedAttempts }} tentatives
                </span>
              </div>
            </td>

            <td>
              <div class="attempts-bar">
                <span class="attempts-num"
                      [class.num-danger]="u.failedAttempts >= 4"
                      [class.num-warn]="u.failedAttempts >= 2 && u.failedAttempts < 4">
                  {{ u.failedAttempts }} / 5
                </span>
                <div class="bar-track" *ngIf="u.failedAttempts > 0">
                  <div class="bar-fill"
                       [class.bar-danger]="u.failedAttempts >= 4"
                       [class.bar-warn]="u.failedAttempts >= 2 && u.failedAttempts < 4"
                       [style.width.%]="(u.failedAttempts / 5) * 100">
                  </div>
                </div>
              </div>
            </td>

            <td>
              <div class="act-row">
                <button class="act-btn act-unlock"
                        *ngIf="!u.accountNonLocked"
                        title="Déverrouiller le compte"
                        (click)="unlock(u.id)">
                  <span [innerHTML]="svg.lockOpen |safeHtml"></span>
                </button>
                <button class="act-btn"
                        [class.act-danger]="u.enabled"
                        [class.act-success]="!u.enabled"
                        [title]="u.enabled ? 'Désactiver' : 'Activer'"
                        (click)="toggleStatus(u)">
                  <span [innerHTML]="svg.power |safeHtml"></span>
                </button>
                <button class="act-btn act-info"
                        title="Réinitialiser le mot de passe"
                        (click)="resetPwd(u.id)">
                  <span [innerHTML]="svg.key|safeHtml"></span>
                </button>
              </div>
            </td>

          </tr>

          <tr *ngIf="getFilteredAtRisk().length === 0">
            <td colspan="5">
              <div class="empty-state">
                <span [innerHTML]="svg.checkCircle |safeHtml"></span>
                <p>Aucun compte à risque dans cette catégorie</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ TOAST ═══ -->
    <div class="g-toast"
         [class.toast-show]="toast().show"
         [class.toast-success]="toast().type === 'success'"
         [class.toast-error]="toast().type === 'error'"
         [class.toast-info]="toast().type === 'info'">
      <span *ngIf="toast().type === 'success'" [innerHTML]="svg.check |safeHtml"></span>
      <span *ngIf="toast().type === 'error'"   [innerHTML]="svg.warn |safeHtml"></span>
      <span *ngIf="toast().type === 'info'"    [innerHTML]="svg.info |safeHtml"></span>
      {{ toast().message }}
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
      --r:          10px;
      --font:       'Plus Jakarta Sans', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .as-wrap {
      max-width: 1100px;
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
      font-size: 20px; font-weight: 700; color: var(--text);
      letter-spacing: -0.3px;
    }
    .page-header p { font-size: 12.5px; color: var(--muted); margin-top: 2px; }

    .btn-refresh {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 16px; border: 1.5px solid var(--border);
      background: white; border-radius: var(--r); cursor: pointer;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      color: var(--muted); transition: all 0.2s;
    }
    .btn-refresh:hover { border-color: var(--accent); color: var(--primary); }
    .refresh-icon { display: flex; align-items: center; }
    .refresh-icon svg { transition: transform 0.5s; }
    .btn-refresh.spinning .refresh-icon svg { animation: spin 0.8s linear infinite; }

    /* ══ ALERT CARDS ══ */
    .alerts-row {
      display: flex; flex-direction: column;
      gap: 10px; margin-bottom: 20px;
    }

    .alert-card {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 16px 20px; border-radius: 14px;
      border: 1px solid transparent; flex-wrap: wrap; gap: 12px;
      animation: slideIn 0.3s ease both;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .alert-critical { background: var(--red-lt);   border-color: var(--red-mid); }
    .alert-warn     { background: var(--amber-lt); border-color: var(--amber-mid); }
    .alert-ok       { background: var(--green-lt); border-color: var(--green-mid); }

    .alc-left {
      display: flex; align-items: center; gap: 14px;
    }
    .alc-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .alc-red   { background: var(--red-mid);   color: #991b1b; }
    .alc-amber { background: var(--amber-mid); color: #92400e; }
    .alc-green { background: var(--green-mid); color: #166534; }
    .alc-icon-wrap svg { width: 18px; height: 18px; }

    .alert-critical .alc-left strong { color: #991b1b; font-size: 14px; }
    .alert-critical .alc-left p      { font-size: 12px; color: #b91c1c; margin-top: 2px; }
    .alert-warn .alc-left strong     { color: #92400e; font-size: 14px; }
    .alert-warn .alc-left p          { font-size: 12px; color: #b45309; margin-top: 2px; }
    .alert-ok .alc-left strong       { color: #166534; font-size: 14px; }

    .alc-badge {
      padding: 5px 14px; border-radius: 50px;
      font-size: 11.5px; font-weight: 700;
    }
    .badge-red   { background: var(--red-mid);   color: #991b1b; }
    .badge-amber { background: var(--amber-mid); color: #92400e; }
    .badge-green { background: var(--green-mid); color: #166534; }

    /* ══ SECTION CARDS ══ */
    .section-card {
      background: white; border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 2px 12px rgba(11,110,126,0.07);
      margin-bottom: 20px; overflow: hidden;
    }

    .sc-header {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap; gap: 10px;
    }
    .sc-title {
      display: flex; align-items: center; gap: 10px;
    }
    .sc-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sc-icon svg { width: 16px; height: 16px; }
    .sc-icon-red   { background: var(--red-lt);   color: var(--red); }
    .sc-icon-amber { background: var(--amber-lt); color: var(--amber); }

    .sc-header h2 { font-size: 15px; font-weight: 700; color: var(--text); }

    .badge-pill {
      padding: 4px 13px; border-radius: 50px;
      font-size: 11.5px; font-weight: 700;
    }

    /* ══ FILTER TABS ══ */
    .filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
    .ft-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border: 1.5px solid var(--border);
      background: white; border-radius: 8px; cursor: pointer;
      font-size: 12px; font-weight: 600; font-family: var(--font);
      color: var(--muted); transition: all 0.18s;
    }
    .ft-btn svg { width: 12px; height: 12px; }
    .ft-btn:hover:not(.ft-active) { border-color: var(--accent); color: var(--primary); }
    .ft-active { background: var(--primary); color: white; border-color: var(--primary); }
    .ft-count {
      background: rgba(255,255,255,0.22); padding: 0 6px;
      border-radius: 8px; font-size: 10.5px; font-weight: 700;
    }
    .ft-btn:not(.ft-active) .ft-count { background: var(--border); color: var(--muted); }

    /* ══ SEARCH ══ */
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      margin: 0 20px 14px;
      border: 1.5px solid var(--border); border-radius: var(--r);
      background: var(--bg); padding: 0 12px;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .search-wrap.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,180,200,0.1);
      background: white;
    }
    .s-icon { display: flex; align-items: center; color: var(--muted); flex-shrink: 0; }
    .search-wrap input {
      flex: 1; border: none; outline: none;
      padding: 9px 0; font-size: 13px;
      background: transparent; font-family: var(--font); color: var(--text);
    }
    .s-clear {
      display: flex; align-items: center; background: none;
      border: none; cursor: pointer; color: var(--muted);
      padding: 2px; transition: color 0.15s;
    }
    .s-clear:hover { color: var(--red); }

    /* ══ TABLE ══ */
    .pro-table { width: 100%; border-collapse: collapse; }

    .pro-table thead tr { background: #f8fafc; }
    .pro-table thead th {
      padding: 11px 20px; text-align: left;
      font-size: 11px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.6px;
      border-bottom: 1px solid var(--border);
    }

    .pro-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .pro-table tbody tr:hover { background: #f8fcfc; }
    .pro-table tbody tr:last-child { border-bottom: none; }
    .pro-table tbody td { padding: 13px 20px; font-size: 13px; }

    /* User cell */
    .user-cell { display: flex; align-items: center; gap: 11px; }
    .avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .av-admin   { background: #7c3aed; }
    .av-rh      { background: var(--primary); }
    .av-manager { background: #d97706; }
    .av-employe { background: #16a34a; }

    .uc-info { display: flex; flex-direction: column; gap: 2px; }
    .uc-name  { font-size: 13px; font-weight: 600; color: var(--text); }
    .uc-email { font-size: 11px; color: var(--muted); }
    .email-txt { font-size: 12.5px; color: var(--muted); }

    /* Role tag */
    .role-tag {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 50px;
      font-size: 11px; font-weight: 600;
    }
    .role-tag svg { width: 11px; height: 11px; }
    .rt-admin   { background: #ede9fe; color: #5b21b6; }
    .rt-rh      { background: var(--primary-lt); color: var(--primary); }
    .rt-manager { background: var(--amber-lt); color: #92400e; }
    .rt-employe { background: var(--green-lt); color: #166534; }

    /* Attempts bar */
    .attempts-bar { display: flex; flex-direction: column; gap: 4px; }
    .attempts-num {
      font-size: 12px; font-weight: 700; color: var(--muted);
    }
    .num-danger { color: var(--red); }
    .num-warn   { color: var(--amber); }
    .bar-track {
      width: 80px; height: 4px; background: var(--border);
      border-radius: 4px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; background: var(--red);
      border-radius: 4px; transition: width 0.4s ease;
    }
    .bar-warn   { background: var(--amber); }
    .bar-danger { background: var(--red); }

    /* Problems */
    .problems { display: flex; gap: 4px; flex-wrap: wrap; }
    .prob-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 4px;
      font-size: 10.5px; font-weight: 600;
    }
    .prob-tag svg { width: 10px; height: 10px; }
    .prob-lock     { background: var(--red-lt);   color: #991b1b; }
    .prob-inactive { background: var(--border);   color: var(--muted); }
    .prob-pwd      { background: var(--amber-lt); color: #92400e; }
    .prob-warn     { background: #fef3c7;         color: #92400e; }

    /* Action buttons */
    .btn-action {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 13px; border-radius: 8px;
      font-size: 12.5px; font-weight: 600; font-family: var(--font);
      border: 1.5px solid transparent; cursor: pointer; transition: all 0.2s;
    }
    .btn-action svg { width: 13px; height: 13px; }

    .btn-unlock {
      background: var(--green-lt); color: #166534;
      border-color: var(--green-mid);
    }
    .btn-unlock:hover {
      background: #dcfce7; transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(34,197,94,0.2);
    }

    .act-row { display: flex; gap: 5px; }
    .act-btn {
      width: 30px; height: 30px; border: 1.5px solid var(--border);
      background: white; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: all 0.18s;
    }
    .act-btn svg { width: 14px; height: 14px; }
    .act-btn:hover { transform: scale(1.1); }
    .act-unlock:hover  { background: var(--green-lt); border-color: var(--green);  color: #166534; }
    .act-danger:hover  { background: var(--red-lt);   border-color: var(--red);    color: var(--red); }
    .act-success:hover { background: var(--green-lt); border-color: var(--green);  color: var(--green); }
    .act-info:hover    { background: var(--primary-lt); border-color: var(--accent); color: var(--primary); }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; padding: 36px; color: var(--muted);
    }
    .empty-state svg { width: 26px; height: 26px; opacity: 0.4; }
    .empty-state p { font-size: 13.5px; font-weight: 600; }

    /* ══ TOAST ══ */
    .g-toast {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; align-items: center; gap: 9px;
      padding: 12px 18px; border-radius: 12px;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      transform: translateY(70px); opacity: 0;
      transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
      z-index: 2000; pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .g-toast svg { flex-shrink: 0; }
    .toast-show    { transform: translateY(0); opacity: 1; pointer-events: auto; }
    .toast-success { background: var(--green-lt); color: #166534; border: 1px solid var(--green-mid); }
    .toast-error   { background: var(--red-lt);   color: #991b1b; border: 1px solid var(--red-mid); }
    .toast-info    { background: var(--primary-lt); color: var(--primary); border: 1px solid #67e8f9; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminSecuriteComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  svg = SVG;

  users     = signal<any[]>([]);
  monitor   = signal<any>(null);
  secFilter = signal('');
  secSearch = signal('');
  isLoading = signal(false);
  searchFocused = false;

  toast = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      users:   this.http.get<any[]>(`${this.API}/admin/users`),
      monitor: this.http.get<any>(`${this.API}/admin/monitoring`)
    }).subscribe({
      next: (d) => {
        this.users.set(d.users ?? []);
        this.monitor.set(d.monitor);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  locked(): any[] {
    return this.users().filter(u => !u.accountNonLocked);
  }

  disabled(): any[] {
    return this.users().filter(u => !u.enabled);
  }

  atRisk(): any[] {
    return this.users().filter(u =>
      !u.accountNonLocked ||
      !u.enabled          ||
      u.failedAttempts > 2 ||
      u.mustChangePassword
    );
  }

  getFilteredAtRisk(): any[] {
    return this.atRisk().filter(u => {
      const t  = this.secSearch().toLowerCase();
      const sf = this.secFilter();
      const matchSearch = !t ||
        (u.nom    ?? '').toLowerCase().includes(t) ||
        (u.prenom ?? '').toLowerCase().includes(t) ||
        (u.email  ?? '').toLowerCase().includes(t);
      const matchFilter =
        sf === 'locked'   ? !u.accountNonLocked :
        sf === 'disabled' ? !u.enabled :
        sf === 'pwd'      ? u.mustChangePassword : true;
      return matchSearch && matchFilter;
    });
  }

  unlock(userId: number): void {
    this.http.put(`${this.API}/admin/users/${userId}/unlock`, {})
      .subscribe({
        next: () => {
          this.users.update(u =>
            u.map(x => x.id === userId
              ? { ...x, accountNonLocked: true, failedAttempts: 0 } : x));
          this.showToast('Compte déverrouillé avec succès', 'success');
        },
        error: () => this.showToast('Erreur lors du déverrouillage', 'error')
      });
  }

  toggleStatus(u: any): void {
    this.http.put(`${this.API}/admin/users/${u.id}/toggle-status`, {})
      .subscribe({
        next: () => {
          this.users.update(list =>
            list.map(x => x.id === u.id ? { ...x, enabled: !x.enabled } : x));
          this.showToast(
            u.enabled ? 'Compte désactivé' : 'Compte activé', 'info');
        },
        error: () => this.showToast('Erreur lors du changement de statut', 'error')
      });
  }

  resetPwd(userId: number): void {
    if (!confirm('Réinitialiser le mot de passe de cet utilisateur ?')) return;
    this.http.put(`${this.API}/admin/users/${userId}/reset-password`, {})
      .subscribe({
        next: () => this.showToast('Mot de passe réinitialisé — email envoyé', 'success'),
        error: () => this.showToast('Erreur lors de la réinitialisation', 'error')
      });
  }

  getRoleIcon(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':   return SVG.shieldSm;
      case 'RH':      return SVG.building;
      case 'MANAGER': return SVG.briefcase;
      default:        return SVG.user;
    }
  }

  init(u: any): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  trackById(_: number, u: any): number {
    return u.id;
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() =>
      this.toast.set({ show: false, message: '', type: 'success' }),
      3000
    );
  }
}