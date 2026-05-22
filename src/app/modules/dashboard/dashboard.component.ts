import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { RhDashboardComponent } from './rh-dashboard.component';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard.component';
import { EmployeDashboardComponent } from './employe-dashboard.component';


const IC = {
  calendar:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  beach:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.5 12c0 4.4-3.6 8-8 8"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M7 2.2A10 10 0 0 0 2 12"/></svg>`,
  check:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  clock:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  ticket:      `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>`,
  door:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M13 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  megaphone:   `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  banknote:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  users:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  activity:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  arrowRight:  `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  pieChart:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  alertCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  lock:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  fileText:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  loader:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafeHtmlPipe,
    RhDashboardComponent,
    AdminDashboardComponent,
    EmployeDashboardComponent,
  ],
  template: `
<div class="dashboard fade-in">

  <!-- ═══ BANNER EXPIRATION MOT DE PASSE TEMPORAIRE ═══ -->
  <div class="pwd-expiry-banner"
       *ngIf="mustChangePassword && role !== 'ADMIN'"
       [class.banner-urgent]="daysRemaining <= 2"
       [class.banner-warn]="daysRemaining > 2 && daysRemaining <= 4">
    <div class="peb-left">
      <div class="peb-icon" [class.icon-urgent]="daysRemaining <= 2">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <div class="peb-text">
        <strong>Mot de passe temporaire actif</strong>
        <span *ngIf="daysRemaining > 0">
          Vous devez changer votre mot de passe.
          Il vous reste <strong>{{ daysRemaining }} jour{{ daysRemaining > 1 ? 's' : '' }}</strong>
          avant le blocage de votre compte.
        </span>
        <span *ngIf="daysRemaining === 0" class="last-chance">
          Délai expiré aujourd'hui — changez votre mot de passe maintenant avant minuit !
        </span>
      </div>
    </div>
    <div class="peb-right">
      <div class="peb-counter" [class.counter-urgent]="daysRemaining <= 2">
        <span class="counter-num">{{ daysRemaining }}</span>
        <span class="counter-label">jour{{ daysRemaining > 1 ? 's' : '' }}</span>
      </div>
      <a routerLink="/change-password" class="peb-btn">
        Changer maintenant
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
  </div>

  <!-- ===== HEADER (uniquement pour MANAGER) ===== -->
  <ng-container *ngIf="role === 'MANAGER'">
    <div class="page-header">
      <div class="page-header-left">
        <div class="header-day">{{ today | date:'EEEE' }}</div>
        <h1>Tableau de bord</h1>
        <p>{{ getSubtitle() }}</p>
      </div>
      <div class="header-date">
        <span class="date-icon" [innerHTML]="ic.calendar | safeHtml"></span>
        <div>
          <span class="date-num">{{ today | date:'d' }}</span>
          <span class="date-rest">{{ today | date:'MMMM yyyy' }}</span>
        </div>
      </div>
    </div>
  </ng-container>

  <!-- ===== LOADING — uniquement pour MANAGER qui charge ses données ===== -->
  <div class="loading-grid" *ngIf="loading() && role === 'MANAGER'">
    <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
  </div>

  <!-- ============================= -->
  <!-- DASHBOARD EMPLOYÉ            -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && role === 'EMPLOYE'">
    <app-employe-dashboard></app-employe-dashboard>
  </ng-container>

  <!-- ============================= -->
  <!-- DASHBOARD MANAGER            -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && role === 'MANAGER'">

    <div class="stats-grid">
      <div class="stat-card stat-amber">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap amber"><span [innerHTML]="ic.clock | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ mgCongesAttente() }}</span>
          <span class="stat-title">Congés à valider</span>
          <span class="stat-sub">En attente de votre avis</span>
        </div>
        <a routerLink="/validation" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-blue">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap blue"><span [innerHTML]="ic.door | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ mgAutorisationsAttente() }}</span>
          <span class="stat-title">Autorisations à valider</span>
          <span class="stat-sub">Demandes en attente</span>
        </div>
        <a routerLink="/validation" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-teal">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap teal"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ mgAugmentationsAttente() }}</span>
          <span class="stat-title">Augmentations à traiter</span>
          <span class="stat-sub">Avis manager requis</span>
        </div>
        <a routerLink="/validation" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap green"><span [innerHTML]="ic.users | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ mgEquipe() }}</span>
          <span class="stat-title">Membres d'équipe</span>
          <span class="stat-sub">Sous votre responsabilité</span>
        </div>
        <a routerLink="/equipe" class="stat-action">
          Voir <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>
    </div>

    <div class="section-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon amber"><span [innerHTML]="ic.clock | safeHtml"></span></div>
            <h3>Congés en attente de validation</h3>
          </div>
          <a routerLink="/validation" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
        </div>
        <div class="table-container" *ngIf="mgCongesListe().length > 0">
          <table>
            <thead>
              <tr>
                <th>Employé</th><th>Type</th>
                <th>Période</th><th>Jours</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of mgCongesListe().slice(0,5)">
                <td>
                  <div class="user-cell">
                    <div class="mini-av">{{ getInitiales(c) }}</div>
                    <strong>{{ c.employeNom }} {{ c.employePrenom }}</strong>
                  </div>
                </td>
                <td><span class="type-chip">{{ c.typeConge }}</span></td>
                <td class="date-cell">{{ c.dateDebut | date:'dd/MM' }} → {{ c.dateFin | date:'dd/MM/yy' }}</td>
                <td><strong>{{ c.nombreJours ?? c.joursOuvrables }}j</strong></td>
                <td>
                  <a routerLink="/validation" class="btn-sm">
                    Valider <span [innerHTML]="ic.arrowRight | safeHtml"></span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-small" *ngIf="mgCongesListe().length === 0">
          <span [innerHTML]="ic.check | safeHtml"></span> Aucun congé en attente
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon teal"><span [innerHTML]="ic.calendar | safeHtml"></span></div>
            <h3>Mes soldes de congés</h3>
          </div>
        </div>
        <div class="soldes-list">
          <div class="solde-item" *ngFor="let s of soldes()">
            <div class="solde-header">
              <div class="solde-type-row">
                <span class="solde-dot" [class]="getSoldeColor(s)"></span>
                <span class="solde-type">{{ getTypeCongeLabel(s.typeConge) }}</span>
              </div>
              <span class="solde-restant">{{ s.joursRestants }}j</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="getSoldePercent(s) + '%'" [class]="getSoldeColor(s)"></div>
            </div>
            <div class="solde-sub">{{ s.joursConsommes }} / {{ s.joursAcquis }} jours utilisés</div>
          </div>
          <div class="empty-small" *ngIf="soldes().length === 0">Aucun solde disponible</div>
        </div>
      </div>
    </div>

    <!-- Actions rapides Manager -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon blue"><span [innerHTML]="ic.activity | safeHtml"></span></div>
          <h3>Actions rapides</h3>
        </div>
      </div>
      <div class="actions-grid">
        <a routerLink="/validation" class="action-btn action-amber">
          <div class="action-icon-wrap"><span [innerHTML]="ic.clock | safeHtml"></span></div>
          <span class="action-label">Demandes à valider</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/equipe" class="action-btn action-teal">
          <div class="action-icon-wrap"><span [innerHTML]="ic.users | safeHtml"></span></div>
          <span class="action-label">Mon équipe</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/conges" class="action-btn action-blue">
          <div class="action-icon-wrap"><span [innerHTML]="ic.beach | safeHtml"></span></div>
          <span class="action-label">Mes congés</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/reclamations" class="action-btn action-green">
          <div class="action-icon-wrap"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
          <span class="action-label">Mes réclamations</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>
    </div>

  </ng-container>

  <!-- ============================= -->
  <!-- DASHBOARD RH                 -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && role === 'RH'">
    <app-rh-dashboard></app-rh-dashboard>
  </ng-container>

  <!-- ============================= -->
  <!-- DASHBOARD ADMIN              -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && role === 'ADMIN'">
    <app-admin-dashboard></app-admin-dashboard>
  </ng-container>

</div>
  `,
  styles: [`
    :host {
      --c-teal:      #0e9daf;
      --c-teal-dk:   #0b7d8e;
      --c-teal-lt:   #e6f7f9;
      --c-green:     #38a169;
      --c-green-lt:  #c6f6d5;
      --c-amber:     #d69e2e;
      --c-amber-lt:  #fefcbf;
      --c-blue:      #3182ce;
      --c-blue-lt:   #bee3f8;
      --c-red:       #e53e3e;
      --c-red-lt:    #fed7d7;
      --c-text:      #1a202c;
      --c-muted:     #718096;
      --c-gray-100:  #eef0f3;
      --c-gray-200:  #e2e8f0;
      --r:     12px;
      --r-lg:  16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .dashboard { max-width: 100%; padding-bottom: 48px; }

    /* ── Header (Manager) ── */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 1px solid var(--c-gray-200);
    }
    .header-day { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--c-teal); margin-bottom: 4px; }
    h1 { font-size: 26px; font-weight: 800; color: var(--c-text); margin: 0 0 4px; line-height: 1.2; }
    .page-header p { font-size: 13px; color: var(--c-muted); margin: 0; }
    .header-date {
      display: flex; align-items: center; gap: 12px;
      background: white; border: 1px solid var(--c-gray-200);
      border-radius: var(--r-lg); padding: 12px 18px; box-shadow: var(--sh);
    }
    .date-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .date-num  { font-size: 22px; font-weight: 800; color: var(--c-text); display: block; line-height: 1; }
    .date-rest { font-size: 12px; color: var(--c-muted); display: block; text-transform: capitalize; }

    /* ── Loading ── */
    .loading-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 24px; }
    .skeleton-card { height: 140px; border-radius: var(--r-lg); background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    /* ── Stats Grid ── */
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; margin-bottom: 24px; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

    .stat-card {
      background: white; border-radius: var(--r-lg); padding: 22px;
      box-shadow: var(--sh); position: relative; overflow: hidden;
      display: flex; flex-direction: column; gap: 14px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--c-gray-200);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
    .stat-card-bg { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.06; }
    .stat-teal  .stat-card-bg { background: var(--c-teal); }
    .stat-green .stat-card-bg { background: var(--c-green); }
    .stat-amber .stat-card-bg { background: var(--c-amber); }
    .stat-blue  .stat-card-bg { background: var(--c-blue); }
    .stat-red   .stat-card-bg { background: var(--c-red); }

    .stat-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon-wrap.teal  { background: var(--c-teal-lt);  color: var(--c-teal); }
    .stat-icon-wrap.green { background: var(--c-green-lt); color: var(--c-green); }
    .stat-icon-wrap.amber { background: var(--c-amber-lt); color: var(--c-amber); }
    .stat-icon-wrap.blue  { background: var(--c-blue-lt);  color: var(--c-blue); }
    .stat-icon-wrap.red   { background: var(--c-red-lt);   color: var(--c-red); }

    .stat-body { display: flex; flex-direction: column; gap: 3px; }
    .stat-value { font-size: 34px; font-weight: 800; color: var(--c-text); line-height: 1; }
    .stat-title { font-size: 13px; font-weight: 600; color: var(--c-text); }
    .stat-sub   { font-size: 11px; color: var(--c-muted); }

    .stat-action {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 700; color: var(--c-teal);
      text-decoration: none; background: var(--c-teal-lt);
      padding: 5px 12px; border-radius: 8px; align-self: flex-start; transition: all 0.2s;
    }
    .stat-action:hover { background: var(--c-teal); color: white; }

    /* ── Section grid ── */
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 800px) { .section-grid { grid-template-columns: 1fr; } }

    /* ── Card ── */
    .card { background: white; border-radius: var(--r-lg); padding: 22px 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 24px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .card-header-left { display: flex; align-items: center; gap: 10px; }
    .card-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon.teal  { background: var(--c-teal-lt);  color: var(--c-teal); }
    .card-icon.amber { background: var(--c-amber-lt); color: var(--c-amber); }
    .card-icon.blue  { background: var(--c-blue-lt);  color: var(--c-blue); }
    .card-icon.green { background: var(--c-green-lt); color: var(--c-green); }
    .card h3 { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0; }
    .card-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--c-teal); text-decoration: none; }
    .card-link:hover { text-decoration: underline; }

    /* ── Soldes ── */
    .soldes-list { display: flex; flex-direction: column; gap: 16px; }
    .solde-item  { display: flex; flex-direction: column; gap: 6px; }
    .solde-header { display: flex; align-items: center; justify-content: space-between; }
    .solde-type-row { display: flex; align-items: center; gap: 8px; }
    .solde-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .solde-dot.good   { background: var(--c-green); }
    .solde-dot.medium { background: var(--c-amber); }
    .solde-dot.low    { background: var(--c-red); }
    .solde-type    { font-size: 13px; font-weight: 600; color: var(--c-text); }
    .solde-restant { font-size: 13px; font-weight: 800; color: var(--c-teal); }
    .solde-sub     { font-size: 11px; color: var(--c-muted); }
    .progress-bar  { height: 6px; background: var(--c-gray-200); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
    .progress-fill.good   { background: var(--c-green); }
    .progress-fill.medium { background: var(--c-amber); }
    .progress-fill.low    { background: var(--c-red); }

    /* ── Table ── */
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--c-gray-100); border-bottom: 1px solid var(--c-gray-200); }
    tbody tr { transition: background 0.15s; }
    tbody tr:hover { background: var(--c-gray-100); }
    tbody td { padding: 12px 14px; color: var(--c-text); border-bottom: 1px solid var(--c-gray-100); vertical-align: middle; }
    .date-cell { font-size: 12px; color: var(--c-muted); white-space: nowrap; }

    .user-cell { display: flex; align-items: center; gap: 8px; }
    .mini-av { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }
    .type-chip { display: inline-flex; align-items: center; background: var(--c-teal-lt); color: var(--c-teal); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .btn-sm { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 7px; background: var(--c-teal); color: white; font-size: 11px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
    .btn-sm:hover { background: var(--c-teal-dk); }

    /* ── Actions rapides ── */
    .actions-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
    @media (max-width: 900px) { .actions-grid { grid-template-columns: repeat(2,1fr); } }
    .action-btn {
      display: flex; align-items: center; gap: 12px; padding: 16px;
      border-radius: var(--r-lg); text-decoration: none; transition: all 0.2s;
      border: 1.5px solid transparent;
    }
    .action-icon-wrap { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .action-label { flex: 1; font-size: 13px; font-weight: 600; }
    .action-arrow { flex-shrink: 0; opacity: 0; transition: opacity 0.2s; }
    .action-btn:hover .action-arrow { opacity: 1; }

    .action-teal  { background: var(--c-teal-lt);  }
    .action-teal  .action-icon-wrap { background: white; color: var(--c-teal); }
    .action-teal  .action-label { color: var(--c-teal); }
    .action-teal:hover { background: var(--c-teal); border-color: var(--c-teal); transform: translateY(-2px); }
    .action-teal:hover .action-label, .action-teal:hover .action-arrow { color: white; }
    .action-teal:hover .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; }

    .action-blue  { background: var(--c-blue-lt);  }
    .action-blue  .action-icon-wrap { background: white; color: var(--c-blue); }
    .action-blue  .action-label { color: var(--c-blue); }
    .action-blue:hover { background: var(--c-blue); border-color: var(--c-blue); transform: translateY(-2px); }
    .action-blue:hover .action-label, .action-blue:hover .action-arrow { color: white; }
    .action-blue:hover .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; }

    .action-amber { background: var(--c-amber-lt); }
    .action-amber .action-icon-wrap { background: white; color: var(--c-amber); }
    .action-amber .action-label { color: var(--c-amber); }
    .action-amber:hover { background: var(--c-amber); border-color: var(--c-amber); transform: translateY(-2px); }
    .action-amber:hover .action-label, .action-amber:hover .action-arrow { color: white; }
    .action-amber:hover .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; }

    .action-green { background: var(--c-green-lt); }
    .action-green .action-icon-wrap { background: white; color: var(--c-green); }
    .action-green .action-label { color: var(--c-green); }
    .action-green:hover { background: var(--c-green); border-color: var(--c-green); transform: translateY(-2px); }
    .action-green:hover .action-label, .action-green:hover .action-arrow { color: white; }
    .action-green:hover .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; }

    /* ── Banner expiration mot de passe ── */
    .pwd-expiry-banner {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border: 1.5px solid #f59e0b; border-radius: 14px;
      padding: 16px 20px; margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(245,158,11,0.12);
      animation: fadeUp 0.3s ease both;
    }
    .banner-urgent {
      background: linear-gradient(135deg, #fff1f2, #ffe4e6);
      border-color: #f43f5e;
      box-shadow: 0 4px 16px rgba(244,63,94,0.15);
    }
    .banner-warn {
      background: linear-gradient(135deg, #fff7ed, #ffedd5);
      border-color: #f97316;
      box-shadow: 0 4px 16px rgba(249,115,22,0.15);
    }
    .peb-left { display: flex; align-items: center; gap: 14px; flex: 1; }
    .peb-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: rgba(245,158,11,0.12); color: #d97706;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-urgent { background: rgba(244,63,94,0.1); color: #f43f5e; }
    .peb-text { display: flex; flex-direction: column; gap: 3px; font-size: 13.5px; color: #92400e; }
    .peb-text strong { font-size: 14px; font-weight: 700; color: #78350f; }
    .banner-urgent .peb-text, .banner-urgent .peb-text strong { color: #be123c; }
    .banner-warn .peb-text, .banner-warn .peb-text strong { color: #9a3412; }
    .last-chance { font-weight: 600; color: #dc2626; }
    .peb-right { display: flex; align-items: center; gap: 12px; }
    .peb-counter {
      display: flex; flex-direction: column; align-items: center;
      min-width: 52px; padding: 8px 12px; border-radius: 10px;
      background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3);
    }
    .counter-num { font-size: 24px; font-weight: 800; line-height: 1; color: #d97706; }
    .counter-label { font-size: 10px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; }
    .counter-urgent { background: rgba(244,63,94,0.12); border-color: rgba(244,63,94,0.3); }
    .counter-urgent .counter-num { color: #f43f5e; }
    .counter-urgent .counter-label { color: #be123c; }
    .peb-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #f59e0b; color: #fff;
      padding: 9px 16px; border-radius: 10px;
      font-size: 13px; font-weight: 600; text-decoration: none;
      transition: all 0.2s; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(245,158,11,0.3);
    }
    .peb-btn:hover { background: #d97706; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245,158,11,0.4); }
    .banner-urgent .peb-btn { background: #f43f5e; box-shadow: 0 2px 8px rgba(244,63,94,0.3); }
    .banner-urgent .peb-btn:hover { background: #e11d48; }
    @media (max-width: 640px) {
      .pwd-expiry-banner { flex-direction: column; align-items: flex-start; }
      .peb-right { width: 100%; justify-content: space-between; }
    }

    /* ── Empty ── */
    .empty-small { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 24px; color: var(--c-muted); font-size: 13px; background: var(--c-gray-100); border-radius: var(--r); }

    /* ── Animations ── */
    .fade-in { animation: fadeUp 0.25s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .stats-grid .stat-card:nth-child(1) { animation: fadeUp 0.3s ease 0.05s both; }
    .stats-grid .stat-card:nth-child(2) { animation: fadeUp 0.3s ease 0.10s both; }
    .stats-grid .stat-card:nth-child(3) { animation: fadeUp 0.3s ease 0.15s both; }
    .stats-grid .stat-card:nth-child(4) { animation: fadeUp 0.3s ease 0.20s both; }
  `]
})
export class DashboardComponent implements OnInit {

  private authService      = inject(AuthService);
  private dashboardService = inject(DashboardService);

  role               = this.authService.getRole();
  today              = new Date();
  currentYear        = new Date().getFullYear();
  loading            = signal(true);
  ic                 = IC;
  mustChangePassword = this.authService.getMustChangePassword();
  daysRemaining      = this.authService.getDaysRemaining();

  // ===== MANAGER =====
  soldes                 = signal<any[]>([]);
  mgCongesAttente        = signal(0);
  mgAutorisationsAttente = signal(0);
  mgAugmentationsAttente = signal(0);
  mgEquipe               = signal(0);
  mgCongesListe          = signal<any[]>([]);

  ngOnInit(): void {
    switch (this.role) {
      case 'EMPLOYE':
        // EmployeDashboardComponent charge ses propres données
        this.loading.set(false);
        break;
      case 'MANAGER':
        this.loadManager();
        break;
      case 'RH':
        // RhDashboardComponent charge ses propres données
        this.loading.set(false);
        break;
      case 'ADMIN':
        // AdminDashboardComponent charge ses propres données
        this.loading.set(false);
        break;
      default:
        this.loading.set(false);
    }
  }

  private loadManager(): void {
    forkJoin({
      congesAttente:        this.dashboardService.getCongesEnAttenteManager().pipe(catchError(() => of([]))),
      autorisationsAttente: this.dashboardService.getAutorisationsEnAttenteManager().pipe(catchError(() => of([]))),
      augmentationsAttente: this.dashboardService.getAugmentationsEnAttenteManager().pipe(catchError(() => of([]))),
      soldes:               this.dashboardService.getSoldesConges().pipe(catchError(() => of([]))),
      equipe:               this.dashboardService.getEquipe().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.mgCongesAttente.set((data.congesAttente ?? []).length);
        this.mgAutorisationsAttente.set((data.autorisationsAttente ?? []).length);
        this.mgAugmentationsAttente.set((data.augmentationsAttente ?? []).length);
        this.mgCongesListe.set(data.congesAttente ?? []);
        this.soldes.set(data.soldes ?? []);
        this.mgEquipe.set((data.equipe ?? []).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Helpers ──

  getSubtitle(): string {
    const map: Record<string,string> = {
      MANAGER: 'Gérez les demandes de votre équipe',
    };
    return map[this.role] ?? '';
  }

  getSoldePercent(s: any): number {
    const acquis    = s?.joursAcquis    ?? 0;
    const consommes = s?.joursConsommes ?? 0; // FIX: null → 0, évite NaN
    if (acquis <= 0) return 0;
    return Math.min(100, Math.round((consommes / acquis) * 100)); // FIX: plafonné à 100
  }

  getSoldeColor(s: any): string {
    const pct = this.getSoldePercent(s);
    if (pct >= 80) return 'low';
    if (pct >= 50) return 'medium';
    return 'good';
  }

  getTypeCongeLabel(type: string): string {
    const map: Record<string,string> = {
      ANNUEL: 'Congé Annuel', MALADIE: 'Congé Maladie', EXCEPTIONNEL: 'Congé Exceptionnel'
    };
    return map[type] ?? type;
  }

  getInitiales(c: any): string {
    return ((c?.employePrenom?.[0] ?? '') + (c?.employeNom?.[0] ?? '')).toUpperCase();
  }
}
