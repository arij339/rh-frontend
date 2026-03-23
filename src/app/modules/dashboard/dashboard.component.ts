import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
  star:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  medical:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
  alertCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  lock:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  fileText:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  loader:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  pieChart:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  building:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  urgentDot:   `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>`,
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  template: `
<div class="dashboard fade-in">

  <!-- ===== HEADER ===== -->
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

  <!-- ===== LOADING ===== -->
  <div class="loading-grid" *ngIf="loading()">
    <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
  </div>

  <!-- ============================= -->
  <!-- DASHBOARD EMPLOYÉ            -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && role === 'EMPLOYE'">

    <div class="stats-grid">

      <div class="stat-card stat-teal">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap teal">
          <span [innerHTML]="ic.beach | safeHtml"></span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ congesRestants() }}</span>
          <span class="stat-title">Jours de congé restants</span>
          <span class="stat-sub">Congé annuel {{ currentYear }}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" [style.width]="congesPercent() + '%'"></div>
        </div>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap green">
          <span [innerHTML]="ic.check | safeHtml"></span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ congesValides() }}</span>
          <span class="stat-title">Congés validés</span>
          <span class="stat-sub">Cette année</span>
        </div>
      </div>

      <div class="stat-card stat-amber">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap amber">
          <span [innerHTML]="ic.clock | safeHtml"></span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ demandesEnAttente() }}</span>
          <span class="stat-title">Demandes en attente</span>
          <span class="stat-sub">Congés + autorisations</span>
        </div>
      </div>

      <div class="stat-card stat-blue">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap blue">
          <span [innerHTML]="ic.ticket | safeHtml"></span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ reclamationsOuvertes() }}</span>
          <span class="stat-title">Réclamations ouvertes</span>
          <span class="stat-sub">En cours de traitement</span>
        </div>
      </div>

    </div>

    <div class="section-grid">

      <!-- Soldes -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon teal"><span [innerHTML]="ic.calendar | safeHtml"></span></div>
            <h3>Mes soldes de congés</h3>
          </div>
          <a routerLink="/conges" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
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

      <!-- Dernières demandes -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon amber"><span [innerHTML]="ic.fileText | safeHtml"></span></div>
            <h3>Mes dernières demandes</h3>
          </div>
          <a routerLink="/conges" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
        </div>
        <div class="demandes-list">
          <div class="demande-item" *ngFor="let c of dernieresConges()">
            <div class="demande-type-icon teal">
              <span [innerHTML]="ic.beach | safeHtml"></span>
            </div>
            <div class="demande-body">
              <span class="demande-title">{{ c.typeConge }} — {{ c.dateDebut | date:'dd/MM' }} au {{ c.dateFin | date:'dd/MM/yyyy' }}</span>
              <span class="demande-sub">{{ c.joursOuvrables }} jours ouvrables</span>
            </div>
            <span class="badge" [class]="getBadgeClass(c.statut)">
              <span [innerHTML]="getStatutIcon(c.statut) | safeHtml"></span>
              {{ getStatutLabel(c.statut) }}
            </span>
          </div>
          <div class="empty-small" *ngIf="dernieresConges().length === 0">Aucune demande récente</div>
        </div>
      </div>

    </div>

    <!-- Actions rapides -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon blue"><span [innerHTML]="ic.activity | safeHtml"></span></div>
          <h3>Actions rapides</h3>
        </div>
      </div>
      <div class="actions-grid">
        <a routerLink="/conges" class="action-btn action-teal">
          <div class="action-icon-wrap"><span [innerHTML]="ic.beach | safeHtml"></span></div>
          <span class="action-label">Demander un congé</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/autorisations" class="action-btn action-blue">
          <div class="action-icon-wrap"><span [innerHTML]="ic.door | safeHtml"></span></div>
          <span class="action-label">Autorisation de sortie</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/reclamations" class="action-btn action-amber">
          <div class="action-icon-wrap"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
          <span class="action-label">Créer une réclamation</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
        <a routerLink="/avances" class="action-btn action-green">
          <div class="action-icon-wrap"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
          <span class="action-label">Demande d'avance</span>
          <span class="action-arrow" [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>
    </div>

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
        <a routerLink="/conges" class="stat-action">
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
        <a routerLink="/autorisations" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-teal">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap teal"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ mgAvancesAttente() }}</span>
          <span class="stat-title">Avances à traiter</span>
          <span class="stat-sub">Avis manager requis</span>
        </div>
        <a routerLink="/avances" class="stat-action">
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
      </div>

    </div>

    <div class="section-grid">

      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon amber"><span [innerHTML]="ic.clock | safeHtml"></span></div>
            <h3>Congés en attente de validation</h3>
          </div>
          <a routerLink="/conges" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
        </div>
        <div class="table-container" *ngIf="mgCongesListe().length > 0">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Période</th>
                <th>Jours</th>
                <th>Action</th>
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
                <td><strong>{{ c.joursOuvrables }}j</strong></td>
                <td>
                  <a routerLink="/conges" class="btn-sm">
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
          </div>
        </div>
      </div>

    </div>

  </ng-container>

  <!-- ============================= -->
  <!-- DASHBOARD RH / ADMIN         -->
  <!-- ============================= -->
  <ng-container *ngIf="!loading() && (role === 'RH' || role === 'ADMIN')">

    <div class="stats-grid">

      <div class="stat-card stat-teal">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap teal"><span [innerHTML]="ic.users | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ rhTotalEmployes() }}</span>
          <span class="stat-title">Total employés</span>
          <span class="stat-sub">Actifs dans le système</span>
        </div>
      </div>

      <div class="stat-card stat-amber">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap amber"><span [innerHTML]="ic.calendar | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ rhCongesAttente() }}</span>
          <span class="stat-title">Congés à valider</span>
          <span class="stat-sub">En attente RH</span>
        </div>
        <a routerLink="/conges" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-red">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap red"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ rhReclamationsNouv() }}</span>
          <span class="stat-title">Nouvelles réclamations</span>
          <span class="stat-sub">Non traitées</span>
        </div>
        <a routerLink="/reclamations" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-card-bg"></div>
        <div class="stat-icon-wrap green"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
        <div class="stat-body">
          <span class="stat-value">{{ rhAvancesAttente() }}</span>
          <span class="stat-title">Avances en attente</span>
          <span class="stat-sub">Décision RH requise</span>
        </div>
        <a routerLink="/avances" class="stat-action">
          Traiter <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </a>
      </div>

    </div>

    <div class="section-grid">

      <!-- Congés en attente RH -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon amber"><span [innerHTML]="ic.calendar | safeHtml"></span></div>
            <h3>Congés en attente — RH</h3>
          </div>
          <a routerLink="/conges" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
        </div>
        <div class="table-container" *ngIf="rhCongesListe().length > 0">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Jours</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of rhCongesListe().slice(0,5)">
                <td>
                  <div class="user-cell">
                    <div class="mini-av">{{ getInitiales(c) }}</div>
                    <strong>{{ c.employeNom }}</strong>
                  </div>
                </td>
                <td>{{ c.typeConge }}</td>
                <td><strong>{{ c.joursOuvrables }}j</strong></td>
                <td>
                  <span class="badge" [class]="getBadgeClass(c.statut)">
                    <span [innerHTML]="getStatutIcon(c.statut) | safeHtml"></span>
                    {{ getStatutLabel(c.statut) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-small" *ngIf="rhCongesListe().length === 0">
          <span [innerHTML]="ic.check | safeHtml"></span> Aucun congé en attente
        </div>
      </div>

      <!-- Nouvelles réclamations -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-icon red"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
            <h3>Nouvelles réclamations</h3>
          </div>
          <a routerLink="/reclamations" class="card-link">
            Voir tout <span [innerHTML]="ic.arrowRight | safeHtml"></span>
          </a>
        </div>
        <div class="demandes-list">
          <div class="demande-item" *ngFor="let r of rhReclamationsListe().slice(0,5)">
            <div class="demande-type-icon" [class]="'urgence-' + r.niveauUrgence?.toLowerCase()">
              <span [innerHTML]="getUrgenceIconSvg(r.niveauUrgence) | safeHtml"></span>
            </div>
            <div class="demande-body">
              <span class="demande-title">{{ r.objet }}</span>
              <span class="demande-sub">
                {{ r.anonyme ? 'Anonyme' : r.employeNom + ' ' + r.employePrenom }} · {{ r.typeReclamation }}
              </span>
            </div>
            <span class="badge badge-red">Nouvelle</span>
          </div>
          <div class="empty-small" *ngIf="rhReclamationsListe().length === 0">
            <span [innerHTML]="ic.check | safeHtml"></span> Aucune nouvelle réclamation
          </div>
        </div>
      </div>

    </div>

    <!-- Vue d'ensemble -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon blue"><span [innerHTML]="ic.pieChart | safeHtml"></span></div>
          <h3>Vue d'ensemble</h3>
        </div>
      </div>
      <div class="overview-grid">
        <div class="overview-item" *ngFor="let item of getOverviewItems()">
          <div class="overview-circle" [class]="'ov-' + item.color">
            <span class="overview-value">{{ item.value }}</span>
          </div>
          <span class="overview-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

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
      --c-white:     #ffffff;
      --r:     12px;
      --r-lg:  16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .dashboard { max-width:100%; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 1px solid var(--c-gray-200);
    }
    .header-day {
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: var(--c-teal); margin-bottom: 4px;
    }
    h1 {
      font-size: 26px; font-weight: 800; color: var(--c-text);
      margin: 0 0 4px; line-height: 1.2;
    }
    .page-header p { font-size: 13px; color: var(--c-muted); margin: 0; }
    .header-date {
      display: flex; align-items: center; gap: 12px;
      background: white; border: 1px solid var(--c-gray-200);
      border-radius: var(--r-lg); padding: 12px 18px; box-shadow: var(--sh);
    }
    .date-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--c-teal-lt); color: var(--c-teal);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; svg { display: block; }
    }
    .date-num  { font-size: 22px; font-weight: 800; color: var(--c-text); display: block; line-height: 1; }
    .date-rest { font-size: 12px; color: var(--c-muted); display: block; text-transform: capitalize; }

    /* ── Loading skeletons ── */
    .loading-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 24px; }
    .skeleton-card {
      height: 140px; border-radius: var(--r-lg);
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    /* ── Stats Grid ── */
    .stats-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 18px; margin-bottom: 24px;
    }

    .stat-card {
      background: white; border-radius: var(--r-lg); padding: 22px;
      box-shadow: var(--sh); position: relative; overflow: hidden;
      display: flex; flex-direction: column; gap: 14px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--c-gray-200);
      &:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
    }

    .stat-card-bg {
      position: absolute; top: -20px; right: -20px;
      width: 100px; height: 100px; border-radius: 50%; opacity: 0.06;
    }
    .stat-teal  .stat-card-bg { background: var(--c-teal); }
    .stat-green .stat-card-bg { background: var(--c-green); }
    .stat-amber .stat-card-bg { background: var(--c-amber); }
    .stat-blue  .stat-card-bg { background: var(--c-blue); }
    .stat-red   .stat-card-bg { background: var(--c-red); }

    .stat-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; svg { display: block; }
      &.teal  { background: var(--c-teal-lt); color: var(--c-teal); }
      &.green { background: var(--c-green-lt); color: var(--c-green); }
      &.amber { background: var(--c-amber-lt); color: var(--c-amber); }
      &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); }
      &.red   { background: var(--c-red-lt);   color: var(--c-red); }
    }

    .stat-body { display: flex; flex-direction: column; gap: 3px; }
    .stat-value { font-size: 34px; font-weight: 800; color: var(--c-text); line-height: 1; }
    .stat-title { font-size: 13px; font-weight: 600; color: var(--c-text); }
    .stat-sub   { font-size: 11px; color: var(--c-muted); }

    .stat-bar { height: 3px; background: var(--c-gray-200); border-radius: 2px; overflow: hidden; }
    .stat-bar-fill { height: 100%; background: var(--c-teal); border-radius: 2px; transition: width 0.6s ease; }

    .stat-action {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 700; color: var(--c-teal);
      text-decoration: none; background: var(--c-teal-lt);
      padding: 5px 12px; border-radius: 8px; align-self: flex-start; transition: all 0.2s;
      svg { display: block; }
      &:hover { background: var(--c-teal); color: white; }
    }

    /* ── Section grid ── */
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }

    /* ── Card ── */
    .card {
      background: white; border-radius: var(--r-lg); padding: 22px 24px;
      box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 24px;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
    }
    .card-header-left { display: flex; align-items: center; gap: 10px; }
    .card-icon {
      width: 34px; height: 34px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      svg { display: block; }
      &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); }
      &.amber { background: var(--c-amber-lt); color: var(--c-amber); }
      &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); }
      &.red   { background: var(--c-red-lt);   color: var(--c-red); }
      &.green { background: var(--c-green-lt); color: var(--c-green); }
    }
    .card h3 { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0; }
    .card-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; color: var(--c-teal); text-decoration: none;
      svg { display: block; }
      &:hover { text-decoration: underline; }
    }

    /* ── Soldes ── */
    .soldes-list { display: flex; flex-direction: column; gap: 16px; }
    .solde-item { display: flex; flex-direction: column; gap: 6px; }
    .solde-header { display: flex; align-items: center; justify-content: space-between; }
    .solde-type-row { display: flex; align-items: center; gap: 8px; }
    .solde-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; &.good { background: var(--c-green); } &.medium { background: var(--c-amber); } &.low { background: var(--c-red); } }
    .solde-type   { font-size: 13px; font-weight: 600; color: var(--c-text); }
    .solde-restant { font-size: 13px; font-weight: 800; color: var(--c-teal); }
    .solde-sub { font-size: 11px; color: var(--c-muted); }

    .progress-bar { height: 6px; background: var(--c-gray-200); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; &.good { background: var(--c-green); } &.medium { background: var(--c-amber); } &.low { background: var(--c-red); } }

    /* ── Demandes ── */
    .demandes-list { display: flex; flex-direction: column; gap: 10px; }
    .demande-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      border-radius: var(--r); transition: background 0.15s; border: 1px solid transparent;
      &:hover { background: var(--c-gray-100); border-color: var(--c-gray-200); }
    }
    .demande-type-icon {
      width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      svg { display: block; }
      &.teal { background: var(--c-teal-lt); color: var(--c-teal); }
      &.urgence-urgente { background: var(--c-red-lt);   color: var(--c-red); }
      &.urgence-normale { background: var(--c-amber-lt); color: var(--c-amber); }
      &.urgence-faible  { background: var(--c-green-lt); color: var(--c-green); }
    }
    .demande-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .demande-title { font-size: 13px; font-weight: 600; color: var(--c-text); }
    .demande-sub   { font-size: 11px; color: var(--c-muted); }

    /* ── Actions rapides ── */
    .actions-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
    .action-btn {
      display: flex; align-items: center; gap: 12px; padding: 16px;
      border-radius: var(--r-lg); text-decoration: none; cursor: pointer; transition: all 0.2s;
      border: 1.5px solid transparent;
    }
    .action-icon-wrap {
      width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      svg { display: block; }
    }
    .action-label { flex: 1; font-size: 13px; font-weight: 600; }
    .action-arrow { flex-shrink: 0; svg { display: block; } opacity: 0; transition: opacity 0.2s; }
    .action-btn:hover .action-arrow { opacity: 1; }

    .action-teal  { background: var(--c-teal-lt);  .action-icon-wrap { background: white; color: var(--c-teal); } .action-label { color: var(--c-teal); } .action-arrow { color: var(--c-teal); } &:hover { background: var(--c-teal); border-color: var(--c-teal); .action-label, .action-arrow { color: white; } .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; } transform: translateY(-2px); box-shadow: 0 6px 16px rgba(14,157,175,0.3); } }
    .action-blue  { background: var(--c-blue-lt);  .action-icon-wrap { background: white; color: var(--c-blue); } .action-label { color: var(--c-blue); } .action-arrow { color: var(--c-blue); } &:hover { background: var(--c-blue); border-color: var(--c-blue); .action-label, .action-arrow { color: white; } .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; } transform: translateY(-2px); box-shadow: 0 6px 16px rgba(49,130,206,0.3); } }
    .action-amber { background: var(--c-amber-lt); .action-icon-wrap { background: white; color: var(--c-amber); } .action-label { color: var(--c-amber); } .action-arrow { color: var(--c-amber); } &:hover { background: var(--c-amber); border-color: var(--c-amber); .action-label, .action-arrow { color: white; } .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; } transform: translateY(-2px); box-shadow: 0 6px 16px rgba(214,158,46,0.3); } }
    .action-green { background: var(--c-green-lt); .action-icon-wrap { background: white; color: var(--c-green); } .action-label { color: var(--c-green); } .action-arrow { color: var(--c-green); } &:hover { background: var(--c-green); border-color: var(--c-green); .action-label, .action-arrow { color: white; } .action-icon-wrap { background: rgba(255,255,255,0.2); color: white; } transform: translateY(-2px); box-shadow: 0 6px 16px rgba(56,161,105,0.3); } }

    /* ── Table ── */
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--c-gray-100); border-bottom: 1px solid var(--c-gray-200); &:first-child { border-radius: 8px 0 0 8px; } &:last-child { border-radius: 0 8px 8px 0; } }
    tbody tr { transition: background 0.15s; &:hover { background: var(--c-gray-100); } }
    tbody td { padding: 12px 14px; color: var(--c-text); border-bottom: 1px solid var(--c-gray-100); vertical-align: middle; }
    .date-cell { font-size: 12px; color: var(--c-muted); white-space: nowrap; }

    .user-cell { display: flex; align-items: center; gap: 8px; }
    .mini-av { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }

    .type-chip { display: inline-flex; align-items: center; background: var(--c-teal-lt); color: var(--c-teal); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .btn-sm { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 7px; background: var(--c-teal); color: white; font-size: 11px; font-weight: 600; text-decoration: none; transition: background 0.2s; svg { display: block; } &:hover { background: var(--c-teal-dk); } }

    /* ── Badges ── */
    .badge {
      display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
      border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap;
      svg { display: block; width: 11px; height: 11px; }
    }
    .badge-success { background: var(--c-green-lt); color: var(--c-green); }
    .badge-danger  { background: var(--c-red-lt);   color: var(--c-red); }
    .badge-warning { background: var(--c-amber-lt); color: var(--c-amber); }
    .badge-info    { background: var(--c-teal-lt);  color: var(--c-teal); }
    .badge-gray    { background: var(--c-gray-200); color: var(--c-muted); }
    .badge-red     { background: var(--c-red-lt);   color: var(--c-red); }

    /* ── Overview ── */
    .overview-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; text-align: center; }
    .overview-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .overview-circle {
      width: 70px; height: 70px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 800;
      &.ov-primary { background: var(--c-teal-lt);  color: var(--c-teal); }
      &.ov-success { background: var(--c-green-lt); color: var(--c-green); }
      &.ov-warning { background: var(--c-amber-lt); color: var(--c-amber); }
      &.ov-danger  { background: var(--c-red-lt);   color: var(--c-red); }
      &.ov-info    { background: var(--c-blue-lt);  color: var(--c-blue); }
      &.ov-gray    { background: var(--c-gray-200); color: var(--c-muted); }
    }
    .overview-value { font-size: 22px; font-weight: 800; }
    .overview-label { font-size: 11px; font-weight: 600; color: var(--c-muted); text-align: center; line-height: 1.4; }

    /* ── Empty states ── */
    .empty-small {
      display: flex; align-items: center; gap: 8px; justify-content: center;
      padding: 24px; color: var(--c-muted); font-size: 13px;
      background: var(--c-gray-100); border-radius: var(--r);
      svg { display: block; flex-shrink: 0; }
    }

    /* ── Animations ── */
    .fade-in { animation: fadeUp 0.25s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .stats-grid .stat-card {
      animation: fadeUp 0.3s ease both;
      &:nth-child(1) { animation-delay: 0.05s; }
      &:nth-child(2) { animation-delay: 0.1s; }
      &:nth-child(3) { animation-delay: 0.15s; }
      &:nth-child(4) { animation-delay: 0.2s; }
    }
  `]
})
export class DashboardComponent implements OnInit {

  private authService      = inject(AuthService);
  private dashboardService = inject(DashboardService);

  role        = this.authService.getRole();
  today       = new Date();
  currentYear = new Date().getFullYear();
  loading     = signal(true);
  ic          = IC;

  // ===== EMPLOYÉ =====
  soldes               = signal<any[]>([]);
  dernieresConges      = signal<any[]>([]);
  demandesEnAttente    = signal(0);
  reclamationsOuvertes = signal(0);
  congesRestants       = signal(0);
  congesValides        = signal(0);

  // ===== MANAGER =====
  mgCongesAttente        = signal(0);
  mgAutorisationsAttente = signal(0);
  mgAvancesAttente       = signal(0);
  mgEquipe               = signal(0);
  mgCongesListe          = signal<any[]>([]);

  // ===== RH =====
  rhTotalEmployes     = signal(0);
  rhCongesAttente     = signal(0);
  rhReclamationsNouv  = signal(0);
  rhAvancesAttente    = signal(0);
  rhCongesListe       = signal<any[]>([]);
  rhReclamationsListe = signal<any[]>([]);
  rhAvancesStats      = signal<any>({});
  rhReclamationsStats = signal<any>({});

  ngOnInit(): void {
    switch (this.role) {
      case 'EMPLOYE': this.loadEmploye(); break;
      case 'MANAGER': this.loadManager(); break;
      case 'RH':      this.loadRH();      break;
      case 'ADMIN':   this.loadRH();      break;
    }
  }

  private loadEmploye(): void {
    forkJoin({
      soldes:        this.dashboardService.getSoldesConges(),
      conges:        this.dashboardService.getMesConges(),
      autorisations: this.dashboardService.getMesAutorisations(),
      reclamations:  this.dashboardService.getMesReclamations()
    }).subscribe({
      next: (data) => {
        this.soldes.set(data.soldes);
        const annuel = data.soldes.find((s: any) => s.typeConge === 'ANNUEL');
        if (annuel) this.congesRestants.set(annuel.joursAcquis - annuel.joursConsommes);
        this.dernieresConges.set(data.conges.slice(0, 5));
        this.congesValides.set(data.conges.filter((c: any) => c.statut === 'VALIDEE').length);
        const enAttente = [
          ...data.conges.filter((c: any) => ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(c.statut)),
          ...data.autorisations.filter((a: any) => ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(a.statut))
        ];
        this.demandesEnAttente.set(enAttente.length);
        this.reclamationsOuvertes.set(data.reclamations.filter((r: any) => ['NOUVELLE','EN_COURS'].includes(r.statut)).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadManager(): void {
    forkJoin({
      congesAttente:        this.dashboardService.getCongesEnAttenteManager(),
      autorisationsAttente: this.dashboardService.getAutorisationsEnAttenteManager(),
      avancesAttente:       this.dashboardService.getAvancesEnAttenteManager(),
      soldes:               this.dashboardService.getSoldesConges()
    }).subscribe({
      next: (data) => {
        this.mgCongesAttente.set(data.congesAttente.length);
        this.mgAutorisationsAttente.set(data.autorisationsAttente.length);
        this.mgAvancesAttente.set(data.avancesAttente.length);
        this.mgCongesListe.set(data.congesAttente);
        this.soldes.set(data.soldes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadRH(): void {
    forkJoin({
      employes:     this.dashboardService.getTousEmployes(),
      conges:       this.dashboardService.getCongesEnAttenteRH(),
      reclamations: this.dashboardService.getReclamationsNouvelles(),
      avances:      this.dashboardService.getAvancesEnAttenteRH(),
      statsReclam:  this.dashboardService.getStatsReclamations(),
      statsAvances: this.dashboardService.getStatsAvances()
    }).subscribe({
      next: (data) => {
        this.rhTotalEmployes.set(data.employes.length);
        this.rhCongesAttente.set(data.conges.length);
        this.rhReclamationsNouv.set(data.reclamations.length);
        this.rhAvancesAttente.set(data.avances.length);
        this.rhCongesListe.set(data.conges);
        this.rhReclamationsListe.set(data.reclamations);
        this.rhAvancesStats.set(data.statsAvances);
        this.rhReclamationsStats.set(data.statsReclam);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getSubtitle(): string {
    const map: Record<string, string> = {
      EMPLOYE: 'Consultez vos demandes et soldes en un coup d\'œil',
      MANAGER: 'Gérez les demandes de votre équipe',
      RH:      'Vue d\'ensemble des ressources humaines',
      ADMIN:   'Administration globale du système'
    };
    return map[this.role] ?? '';
  }

  congesPercent(): number {
    const s = this.soldes().find((s: any) => s.typeConge === 'ANNUEL');
    if (!s || s.joursAcquis === 0) return 0;
    return Math.round((s.joursConsommes / s.joursAcquis) * 100);
  }

  getSoldePercent(s: any): number {
    if (!s.joursAcquis) return 0;
    return Math.round((s.joursConsommes / s.joursAcquis) * 100);
  }

  getSoldeColor(s: any): string {
    const pct = this.getSoldePercent(s);
    if (pct >= 80) return 'low';
    if (pct >= 50) return 'medium';
    return 'good';
  }

  getTypeCongeLabel(type: string): string {
    const map: Record<string, string> = {
      ANNUEL:       'Congé Annuel',
      MALADIE:      'Congé Maladie',
      EXCEPTIONNEL: 'Congé Exceptionnel'
    };
    return map[type] ?? type;
  }

  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'badge badge-success', REJETEE: 'badge badge-danger',
      ANNULEE: 'badge badge-gray', EN_ATTENTE_MANAGER: 'badge badge-warning',
      EN_ATTENTE_RH: 'badge badge-warning', BROUILLON: 'badge badge-gray',
      NOUVELLE: 'badge badge-info', EN_COURS: 'badge badge-warning',
      RESOLUE: 'badge badge-success', CLOTUREE: 'badge badge-gray'
    };
    return map[statut] ?? 'badge badge-gray';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée',
      EN_ATTENTE_MANAGER: 'Attente Manager', EN_ATTENTE_RH: 'Attente RH',
      BROUILLON: 'Brouillon', NOUVELLE: 'Nouvelle', EN_COURS: 'En cours',
      RESOLUE: 'Résolue', CLOTUREE: 'Clôturée'
    };
    return map[statut] ?? statut;
  }

  getStatutIcon(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: IC.checkCircle, RESOLUE: IC.checkCircle,
      REJETEE: IC.xCircle, ANNULEE: IC.xCircle,
      EN_ATTENTE_MANAGER: IC.clock, EN_ATTENTE_RH: IC.clock,
      BROUILLON: IC.fileText, NOUVELLE: IC.alertCircle,
      EN_COURS: IC.loader, CLOTUREE: IC.lock
    };
    return map[statut] ?? IC.alertCircle;
  }

  getUrgenceIconSvg(urgence: string): string {
    const map: Record<string, string> = {
      URGENTE: IC.alertCircle,
      NORMALE: IC.clock,
      FAIBLE:  IC.checkCircle
    };
    return map[urgence] ?? IC.alertCircle;
  }

  getInitiales(c: any): string {
    return ((c?.employePrenom?.[0] ?? '') + (c?.employeNom?.[0] ?? '')).toUpperCase();
  }

  getOverviewItems() {
    const stats  = this.rhAvancesStats();
    const reclam = this.rhReclamationsStats();
    return [
      { value: this.rhTotalEmployes(),    label: 'Employés',        color: 'primary' },
      { value: this.rhCongesAttente(),    label: 'Congés en attente', color: 'warning' },
      { value: this.rhReclamationsNouv(), label: 'Réclamations',    color: 'danger'  },
      { value: this.rhAvancesAttente(),   label: 'Avances RH',      color: 'info'    },
      { value: stats['EN_COURS'] ?? 0,   label: 'Avances en cours', color: 'success' },
      { value: reclam['EN_COURS'] ?? 0,  label: 'Réclam. en cours', color: 'gray'    }
    ];
  }
}