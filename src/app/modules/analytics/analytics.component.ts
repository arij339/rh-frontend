import {
  Component, inject, OnInit, signal,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PdfService }       from '../../core/services/pdf.service';
import { Chart, registerables } from 'chart.js';
import { SafeHtmlPipe }    from '../../shared/pipes/safe-html.pipe';
Chart.register(...registerables);

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IC = {
  analytics:   `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  download:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  users:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendar:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  chat:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  banknote:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  exit:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  trend:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  clock:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  barChart:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  lineChart:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  pie:         `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  donut:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
  check:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  file:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  up:          `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`,
  down:        `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  warning:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  filter:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  salary:      `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
};

type ActiveTab = 'overview' | 'conges' | 'rh-social' | 'effectifs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="analytics">

  <!-- ── Page Header ── -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-header-icon">
        <span [innerHTML]="ic.analytics | safeHtml"></span>
      </div>
      <div>
        <h1>Analytics &amp; Rapports</h1>
        <p>Tableaux de bord RH avancés et exports PDF</p>
      </div>
    </div>

    <div class="header-actions">
      <!-- Filtre département -->
      <div class="period-field">
        <span [innerHTML]="ic.filter | safeHtml"></span>
        <select [(ngModel)]="selectedDept" (change)="applyFilters()">
          <option value="">Tous les depts</option>
          <option *ngFor="let d of departments()" [value]="d">{{ d }}</option>
        </select>
      </div>

      <!-- Sélecteur période -->
      <div class="period-picker">
        <div class="period-field">
          <span [innerHTML]="ic.calendar | safeHtml"></span>
          <select [(ngModel)]="selectedMois" (change)="onPeriodChange()">
            <option *ngFor="let m of moisList" [value]="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div class="period-field">
          <select [(ngModel)]="selectedAnnee" (change)="onPeriodChange()">
            <option *ngFor="let a of anneeList" [value]="a">{{ a }}</option>
          </select>
        </div>
      </div>

      <button class="btn-export" (click)="exportRapportPDF()" [disabled]="exportLoading()">
        <span *ngIf="!exportLoading()">
          <span [innerHTML]="ic.download | safeHtml"></span>
          Exporter PDF
        </span>
        <span *ngIf="exportLoading()" class="spinner"></span>
      </button>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-bar">
    <button class="tab-btn" [class.active]="activeTab() === 'overview'"  (click)="setTab('overview')">Vue globale</button>
    <button class="tab-btn" [class.active]="activeTab() === 'conges'"    (click)="setTab('conges')">Congés & Absences</button>
    <button class="tab-btn" [class.active]="activeTab() === 'rh-social'" (click)="setTab('rh-social')">Social & Finance</button>
    <button class="tab-btn" [class.active]="activeTab() === 'effectifs'" (click)="setTab('effectifs')">Effectifs</button>
  </div>

  <!-- ── Loading ── -->
  <div class="page-loading" *ngIf="loading()">
    <div class="loading-ring"></div>
    <p>Chargement des données analytiques...</p>
  </div>

  <ng-container *ngIf="!loading()">

    <!-- ══════════════════════════════════════════════
         TAB : VUE GLOBALE
    ═══════════════════════════════════════════════ -->
    <div *ngIf="activeTab() === 'overview'">

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card kpi-card--primary">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.users | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ filteredEmployes().length }}</span>
              <span class="kpi-lbl">Employés{{ selectedDept ? ' — ' + selectedDept : '' }}</span>
            </div>
          </div>
          <div class="kpi-deco"></div>
        </div>

        <div class="kpi-card kpi-card--warning">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.calendar | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ congesEnAttente() }}</span>
              <span class="kpi-lbl">Congés en attente</span>
            </div>
          </div>
          <div class="kpi-sub-row">
            <span class="kpi-badge amber">{{ congesEnAttenteManager() }} manager</span>
            <span class="kpi-badge orange">{{ congesEnAttenteRH() }} RH</span>
          </div>
          <div class="kpi-deco"></div>
        </div>

        <div class="kpi-card kpi-card--danger">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.chat | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ reclamationsActives() }}</span>
              <span class="kpi-lbl">Réclamations actives</span>
            </div>
          </div>
          <div class="kpi-sub-row">
            <span class="kpi-badge red">{{ reclamationsCritiques() }} critiques</span>
          </div>
          <div class="kpi-deco"></div>
        </div>

        <div class="kpi-card kpi-card--success">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.banknote | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ avancesEnAttente() }}</span>
              <span class="kpi-lbl">Avances en attente</span>
            </div>
          </div>
          <div class="kpi-sub-row">
            <span class="kpi-badge green">{{ montantTotalAvances() }} DT total</span>
          </div>
          <div class="kpi-deco"></div>
        </div>

        <div class="kpi-card kpi-card--purple">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.salary | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ augmentationsEnAttente() }}</span>
              <span class="kpi-lbl">Augmentations</span>
            </div>
          </div>
          <div class="kpi-sub-row">
            <span class="kpi-badge purple">{{ augmentationsApprouvees() }} approuvées</span>
          </div>
          <div class="kpi-deco"></div>
        </div>

        <div class="kpi-card kpi-card--info">
          <div class="kpi-left">
            <div class="kpi-icon-wrap" [innerHTML]="ic.exit | safeHtml"></div>
            <div class="kpi-info">
              <span class="kpi-val">{{ sortiesToday() }}</span>
              <span class="kpi-lbl">Absents aujourd'hui</span>
            </div>
          </div>
          <div class="kpi-sub-row">
            <span class="kpi-badge teal">{{ tauxPresence() }}% présence</span>
          </div>
          <div class="kpi-deco"></div>
        </div>
      </div>

      <!-- Charts row 1: congés + types -->
      <div class="charts-grid grid-3">

        <div class="chart-card span-2">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon teal" [innerHTML]="ic.barChart | safeHtml"></div>
              <div><h3>Congés par mois</h3><p>Total / Validés / Rejetés — 6 mois</p></div>
            </div>
            <div class="chart-legend">
              <span class="leg-item"><span class="leg-dot teal"></span>Total</span>
              <span class="leg-item"><span class="leg-dot green"></span>Validés</span>
              <span class="leg-item"><span class="leg-dot red"></span>Rejetés</span>
            </div>
          </div>
          <div class="chart-body" style="height:220px"><canvas #barChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon orange" [innerHTML]="ic.pie | safeHtml"></div>
              <div><h3>Types de congés</h3><p>Répartition par catégorie</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:220px"><canvas #typeCongeChart></canvas></div>
        </div>

      </div>

      <!-- Charts row 2: évolution + présence + réclamations -->
      <div class="charts-grid grid-3">

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon blue" [innerHTML]="ic.lineChart | safeHtml"></div>
              <div><h3>Tendance globale</h3><p>Congés et sorties sur 6 mois</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:200px"><canvas #lineChart></canvas></div>
        </div>

        <div class="chart-card gauge-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon green" [innerHTML]="ic.check | safeHtml"></div>
              <div><h3>Présence aujourd'hui</h3><p>Effectif actif vs congés en cours</p></div>
            </div>
          </div>
          <div class="gauge-zone">
            <div class="gauge-canvas-wrap">
              <canvas #gaugeChart></canvas>
              <div class="gauge-overlay">
                <span class="gauge-pct">{{ tauxPresence() }}%</span>
                <span class="gauge-sub">Présence</span>
              </div>
            </div>
            <div class="gauge-stats">
              <div class="gs-item"><span class="gs-val green">{{ joursPresents() }}</span><span class="gs-lbl">Présents</span></div>
              <div class="gs-sep"></div>
              <div class="gs-item"><span class="gs-val amber">{{ joursAbsents() }}</span><span class="gs-lbl">En congé</span></div>
              <div class="gs-sep"></div>
              <div class="gs-item"><span class="gs-val teal">{{ filteredEmployes().length }}</span><span class="gs-lbl">Total</span></div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon red" [innerHTML]="ic.chat | safeHtml"></div>
              <div><h3>Réclamations</h3><p>Par type et urgence</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:200px"><canvas #reclamChart></canvas></div>
        </div>

      </div>

      <!-- Alertes -->
      <div class="alerts-section" *ngIf="alertes().length > 0">
        <div class="section-title-row">
          <span [innerHTML]="ic.warning | safeHtml"></span>
          <h3>Alertes RH</h3>
          <span class="count-badge red">{{ alertes().length }}</span>
        </div>
        <div class="alerts-grid">
          <div class="alert-item" *ngFor="let a of alertes()" [class]="'alert-item--' + a.level">
            <div class="alert-icon" [innerHTML]="a.icon | safeHtml"></div>
            <div class="alert-content">
              <strong>{{ a.title }}</strong>
              <p>{{ a.message }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════
         TAB : CONGÉS & ABSENCES
    ═══════════════════════════════════════════════ -->
    <div *ngIf="activeTab() === 'conges'">

      <!-- Soldes par employé -->
      <div class="section-card">
        <div class="section-card-header">
          <div class="section-card-title">
            <div class="chart-card-icon teal" [innerHTML]="ic.calendar | safeHtml"></div>
            <div><h3>Soldes de congés — Employés à surveiller</h3><p>Employés avec moins de 5 jours restants cette année</p></div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table" *ngIf="emploesFaibleSolde().length > 0">
            <thead><tr><th>Employé</th><th>Département</th><th>Solde restant</th><th>Statut</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of emploesFaibleSolde()">
                <td>
                  <div class="user-cell">
                    <div class="av">{{ getInitialesE(e) }}</div>
                    <div><strong>{{ e.prenom }} {{ e.nom }}</strong><br><small class="td-muted">{{ e.matricule }}</small></div>
                  </div>
                </td>
                <td class="td-muted">{{ e.departement }}</td>
                <td>
                  <span class="solde-bar-wrap">
                    <span class="solde-bar" [style.width.%]="(e.soldeRestant / 21) * 100" [class.critical]="e.soldeRestant <= 2" [class.warning]="e.soldeRestant > 2 && e.soldeRestant <= 5"></span>
                    <span class="solde-val" [class.text-red]="e.soldeRestant <= 2" [class.text-amber]="e.soldeRestant > 2 && e.soldeRestant <= 5">{{ e.soldeRestant }} j</span>
                  </span>
                </td>
                <td>
                  <span class="badge-status" [class.red]="e.soldeRestant <= 2" [class.amber]="e.soldeRestant > 2 && e.soldeRestant <= 5">
                    {{ e.soldeRestant <= 2 ? 'Critique' : 'Faible' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-row" *ngIf="emploesFaibleSolde().length === 0">
            <div class="empty-icon" [innerHTML]="ic.check | safeHtml"></div>
            <p>Tous les employés ont un solde suffisant ✓</p>
          </div>
        </div>
      </div>

      <!-- Charts congés détaillés -->
      <div class="charts-grid grid-2" style="margin-top: 20px">

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon teal" [innerHTML]="ic.barChart | safeHtml"></div>
              <div><h3>Congés par département</h3><p>Nombre de jours validés par département</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:240px"><canvas #deptChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon purple" [innerHTML]="ic.donut | safeHtml"></div>
              <div><h3>Statut des demandes</h3><p>Répartition actuelle de toutes les demandes</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:240px"><canvas #statutCongeChart></canvas></div>
        </div>

      </div>

      <!-- Top absences -->
      <div class="section-card" style="margin-top: 20px">
        <div class="section-card-header">
          <div class="section-card-title">
            <div class="chart-card-icon amber" [innerHTML]="ic.warning | safeHtml"></div>
            <div><h3>Top absences — cette année</h3><p>Employés avec le plus de jours de congé validés</p></div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>#</th><th>Employé</th><th>Département</th><th>Jours pris</th><th>Nb demandes</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of topAbsences(); let i = index">
                <td><span class="rank-badge" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">{{ i + 1 }}</span></td>
                <td>
                  <div class="user-cell">
                    <div class="av">{{ getInitialesE(e) }}</div>
                    <strong>{{ e.prenom }} {{ e.nom }}</strong>
                  </div>
                </td>
                <td class="td-muted">{{ e.departement }}</td>
                <td><strong>{{ e.joursPris }} j</strong></td>
                <td class="td-muted">{{ e.nbDemandes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════
         TAB : SOCIAL & FINANCE
    ═══════════════════════════════════════════════ -->
    <div *ngIf="activeTab() === 'rh-social'">

      <div class="charts-grid grid-2">

        <!-- Avances -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon green" [innerHTML]="ic.banknote | safeHtml"></div>
              <div><h3>Avances sur salaire</h3><p>Répartition par statut</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:200px"><canvas #avanceChart></canvas></div>
        </div>

        <!-- Augmentations -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon purple" [innerHTML]="ic.salary | safeHtml"></div>
              <div><h3>Augmentations salariales</h3><p>Demandées vs accordées</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:200px"><canvas #augmentChart></canvas></div>
        </div>

      </div>

      <!-- Stats avances + augmentations -->
      <div class="stats-row" style="margin-top: 20px">
        <div class="stat-block stat-block--green">
          <span class="stat-icon" [innerHTML]="ic.banknote | safeHtml"></span>
          <span class="stat-val">{{ montantTotalAvances() }} DT</span>
          <span class="stat-lbl">En attente d'avances</span>
        </div>
        <div class="stat-block stat-block--purple">
          <span class="stat-icon" [innerHTML]="ic.salary | safeHtml"></span>
          <span class="stat-val">{{ montantTotalAugmentDemande() }} DT</span>
          <span class="stat-lbl">Total demandé augmentations</span>
        </div>
        <div class="stat-block stat-block--teal">
          <span class="stat-icon" [innerHTML]="ic.trend | safeHtml"></span>
          <span class="stat-val">{{ montantTotalAugmentAccorde() }} DT</span>
          <span class="stat-lbl">Total accordé augmentations</span>
        </div>
        <div class="stat-block stat-block--amber">
          <span class="stat-icon" [innerHTML]="ic.chat | safeHtml"></span>
          <span class="stat-val">{{ tauxResolutionReclamations() }}%</span>
          <span class="stat-lbl">Taux résolution réclamations</span>
        </div>
      </div>

      <!-- Réclamations table -->
      <div class="section-card" style="margin-top: 20px">
        <div class="section-card-header">
          <div class="section-card-title">
            <div class="chart-card-icon red" [innerHTML]="ic.chat | safeHtml"></div>
            <div><h3>Réclamations — Top réclamants</h3><p>Employés avec le plus de réclamations</p></div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Employé</th><th>Nb réclamations</th><th>Dernière urgence</th><th>Statut dernier</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of topReclamants()">
                <td>
                  <div class="user-cell">
                    <div class="av">{{ getInitialesE(e) }}</div>
                    <strong>{{ e.prenom }} {{ e.nom }}</strong>
                  </div>
                </td>
                <td><strong>{{ e.nbReclamations }}</strong></td>
                <td><span class="urgence-badge" [class]="'urgence--' + e.derniereUrgence?.toLowerCase()">{{ e.derniereUrgence }}</span></td>
                <td><span class="statut-badge" [class]="getStatutClass(e.dernierStatut)">{{ e.dernierStatut }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════
         TAB : EFFECTIFS
    ═══════════════════════════════════════════════ -->
    <div *ngIf="activeTab() === 'effectifs'">

      <div class="charts-grid grid-3">

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon teal" [innerHTML]="ic.pie | safeHtml"></div>
              <div><h3>Répartition par département</h3><p>Effectif actuel</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:220px"><canvas #deptPieChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon blue" [innerHTML]="ic.donut | safeHtml"></div>
              <div><h3>Types de contrats</h3><p>CDI, CDD, Stage...</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:220px"><canvas #contratChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <div class="chart-card-icon purple" [innerHTML]="ic.barChart | safeHtml"></div>
              <div><h3>Ancienneté</h3><p>Répartition par tranche</p></div>
            </div>
          </div>
          <div class="chart-body" style="height:220px"><canvas #ancienneteChart></canvas></div>
        </div>

      </div>

      <!-- Tableau effectif complet -->
      <div class="section-card" style="margin-top: 20px">
        <div class="section-card-header">
          <div class="section-card-title">
            <div class="chart-card-icon teal" [innerHTML]="ic.users | safeHtml"></div>
            <div><h3>Effectif complet</h3><p>{{ filteredEmployes().length }} employé(s){{ selectedDept ? ' — ' + selectedDept : '' }}</p></div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Poste</th>
                <th>Département</th>
                <th>Contrat</th>
                <th>Ancienneté</th>
                <th>Solde congés</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of filteredEmployes()">
                <td>
                  <div class="user-cell">
                    <div class="av">{{ getInitialesE(e) }}</div>
                    <div>
                      <strong>{{ e.prenom }} {{ e.nom }}</strong>
                      <br><small class="td-muted">{{ e.matricule }}</small>
                    </div>
                  </div>
                </td>
                <td class="td-muted">{{ e.poste }}</td>
                <td class="td-muted">{{ e.departement }}</td>
                <td>
                  <span class="type-tag" [class.cdi]="e.typeContrat === 'CDI'" [class.cdd]="e.typeContrat === 'CDD'">
                    {{ e.typeContrat || '—' }}
                  </span>
                </td>
                <td class="td-muted">{{ e.anciennete }}</td>
                <td>
                  <span class="solde-pill" [class.low]="getSoldeEmploye(e.id) <= 5">
                    {{ getSoldeEmploye(e.id) }} j
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </ng-container>
</div>
  `,
  styles: [`
    :host {
      --c-primary:    #0b6e7e;
      --c-accent:     #0e9daf;
      --c-accent-lt:  #e6f7f9;
      --c-teal:       #0e9daf;
      --c-teal-lt:    #e6f7f9;
      --c-green:      #38a169;
      --c-green-lt:   #c6f6d5;
      --c-amber:      #d69e2e;
      --c-amber-lt:   #fefcbf;
      --c-red:        #e53e3e;
      --c-red-lt:     #fed7d7;
      --c-blue:       #3182ce;
      --c-blue-lt:    #bee3f8;
      --c-orange:     #dd6b20;
      --c-orange-lt:  #feebc8;
      --c-purple:     #805ad5;
      --c-purple-lt:  #e9d8fd;
      --c-gray-50:    #f7f8fa;
      --c-gray-100:   #eef0f3;
      --c-gray-200:   #d8dde5;
      --c-gray-500:   #718096;
      --c-text:       #1a202c;
      --c-muted:      #64748b;
      --r:    12px;
      --r-lg: 16px;
      --sh:   0 2px 12px rgba(11,110,126,0.09);
      --sh-md:0 4px 20px rgba(11,110,126,0.13);
    }

    .analytics { max-width: 100%; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px; flex-wrap: wrap; gap: 16px;
    }
    .page-header-left { display: flex; align-items: center; gap: 14px; }
    .page-header-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-primary));
      display: flex; align-items: center; justify-content: center; color: white;
      box-shadow: 0 4px 14px rgba(14,157,175,0.3);
    }
    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin: 0 0 2px; }
    p  { font-size: 13px; color: var(--c-muted); margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .period-picker  { display: flex; gap: 8px; }
    .period-field {
      display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 40px;
      background: white; border: 1.5px solid var(--c-gray-200); border-radius: var(--r);
      transition: border-color 0.2s;
      select { border: none; outline: none; background: transparent; font-size: 13px; font-weight: 600; color: var(--c-text); cursor: pointer; }
      &:focus-within { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); }
    }
    .btn-export {
      display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 18px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); color: white;
      font-size: 13px; font-weight: 600; border: none; border-radius: var(--r); cursor: pointer;
      box-shadow: 0 3px 12px rgba(14,157,175,0.3); transition: all 0.2s;
      span { display: inline-flex; align-items: center; gap: 7px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(14,157,175,0.4); }
      &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    }

    /* ── Tabs ── */
    .tabs-bar {
      display: flex; gap: 4px; margin-bottom: 24px;
      background: var(--c-gray-100); padding: 4px; border-radius: var(--r);
      width: fit-content;
    }
    .tab-btn {
      padding: 8px 20px; border-radius: 9px; border: none; background: transparent;
      font-size: 13px; font-weight: 600; color: var(--c-muted); cursor: pointer; transition: all 0.18s;
      &:hover  { color: var(--c-primary); background: rgba(255,255,255,0.7); }
      &.active { background: white; color: var(--c-primary); box-shadow: 0 2px 8px rgba(11,110,126,0.13); }
    }

    /* ── KPI Row ── */
    .kpi-row {
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: 14px; margin-bottom: 22px;
    }
    .kpi-card {
      background: white; border-radius: var(--r-lg); padding: 16px 18px;
      box-shadow: var(--sh); position: relative; overflow: hidden;
      border: 1px solid var(--c-gray-100); display: flex; flex-direction: column;
      gap: 8px; transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
    }
    .kpi-card--primary { border-top: 3px solid var(--c-teal); }
    .kpi-card--warning  { border-top: 3px solid var(--c-amber); }
    .kpi-card--danger   { border-top: 3px solid var(--c-red); }
    .kpi-card--success  { border-top: 3px solid var(--c-green); }
    .kpi-card--purple   { border-top: 3px solid var(--c-purple); }
    .kpi-card--info     { border-top: 3px solid var(--c-blue); }
    .kpi-deco { position: absolute; right: -16px; bottom: -16px; width: 72px; height: 72px; border-radius: 50%; pointer-events: none; opacity: 0.4; }
    .kpi-card--primary .kpi-deco { background: var(--c-teal-lt); }
    .kpi-card--warning  .kpi-deco { background: var(--c-amber-lt); }
    .kpi-card--danger   .kpi-deco { background: var(--c-red-lt); }
    .kpi-card--success  .kpi-deco { background: var(--c-green-lt); }
    .kpi-card--purple   .kpi-deco { background: var(--c-purple-lt); }
    .kpi-card--info     .kpi-deco { background: var(--c-blue-lt); }
    .kpi-left { display: flex; align-items: center; gap: 10px; z-index: 1; }
    .kpi-icon-wrap {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .kpi-card--primary .kpi-icon-wrap { background: var(--c-teal-lt); color: var(--c-teal); }
    .kpi-card--warning  .kpi-icon-wrap { background: var(--c-amber-lt); color: var(--c-amber); }
    .kpi-card--danger   .kpi-icon-wrap { background: var(--c-red-lt); color: var(--c-red); }
    .kpi-card--success  .kpi-icon-wrap { background: var(--c-green-lt); color: var(--c-green); }
    .kpi-card--purple   .kpi-icon-wrap { background: var(--c-purple-lt); color: var(--c-purple); }
    .kpi-card--info     .kpi-icon-wrap { background: var(--c-blue-lt); color: var(--c-blue); }
    .kpi-val { font-size: 24px; font-weight: 900; color: var(--c-text); display: block; line-height: 1.1; }
    .kpi-lbl { font-size: 11px; color: var(--c-muted); font-weight: 500; margin-top: 2px; }
    .kpi-sub-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .kpi-badge {
      display: inline-block; padding: 2px 8px; border-radius: 20px;
      font-size: 10.5px; font-weight: 700;
      &.amber  { background: var(--c-amber-lt); color: var(--c-amber); }
      &.orange { background: #fff5eb; color: var(--c-orange); }
      &.red    { background: var(--c-red-lt); color: var(--c-red); }
      &.green  { background: var(--c-green-lt); color: var(--c-green); }
      &.purple { background: var(--c-purple-lt); color: var(--c-purple); }
      &.teal   { background: var(--c-teal-lt); color: var(--c-teal); }
    }

    /* ── Loading ── */
    .page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 90px; gap: 18px; color: var(--c-muted); }
    .loading-ring { width: 48px; height: 48px; border: 4px solid var(--c-teal-lt); border-top-color: var(--c-accent); border-radius: 50%; animation: spin 0.9s linear infinite; }

    /* ── Grids ── */
    .charts-grid { display: grid; gap: 18px; margin-bottom: 18px; }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .span-2 { grid-column: span 2; }

    /* ── Chart Cards ── */
    .chart-card {
      background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-100);
      box-shadow: var(--sh); padding: 20px 22px;
    }
    .chart-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
    .chart-card-title { display: flex; align-items: center; gap: 12px; }
    .chart-card-icon {
      width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      &.teal   { background: var(--c-teal-lt); color: var(--c-teal); }
      &.blue   { background: var(--c-blue-lt); color: var(--c-blue); }
      &.orange { background: var(--c-orange-lt); color: var(--c-orange); }
      &.purple { background: var(--c-purple-lt); color: var(--c-purple); }
      &.green  { background: var(--c-green-lt); color: var(--c-green); }
      &.red    { background: var(--c-red-lt); color: var(--c-red); }
      &.amber  { background: var(--c-amber-lt); color: var(--c-amber); }
    }
    .chart-card-title h3 { font-size: 13.5px; font-weight: 700; color: var(--c-text); margin: 0 0 2px; }
    .chart-card-title p  { font-size: 11px; color: var(--c-muted); margin: 0; }
    .chart-body { position: relative; }
    .chart-legend { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--c-muted); }
    .leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; &.teal { background: var(--c-teal); } &.green { background: var(--c-green); } &.red { background: var(--c-red); } }

    /* ── Gauge ── */
    .gauge-card { display: flex; flex-direction: column; }
    .gauge-zone { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; }
    .gauge-canvas-wrap { position: relative; width: 100%; max-width: 200px; height: 110px; canvas { max-height: 110px; } }
    .gauge-overlay { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); text-align: center; }
    .gauge-pct { font-size: 24px; font-weight: 900; color: var(--c-text); display: block; }
    .gauge-sub { font-size: 11px; color: var(--c-muted); font-weight: 500; }
    .gauge-stats { display: flex; align-items: center; width: 100%; background: var(--c-gray-50); border-radius: var(--r); padding: 10px 0; }
    .gs-item { flex: 1; text-align: center; }
    .gs-sep { width: 1px; height: 26px; background: var(--c-gray-200); }
    .gs-val { font-size: 18px; font-weight: 800; display: block; &.green { color: var(--c-green); } &.amber { color: var(--c-amber); } &.teal { color: var(--c-teal); } }
    .gs-lbl { font-size: 10px; color: var(--c-muted); font-weight: 500; }

    /* ── Section Card ── */
    .section-card { background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-100); box-shadow: var(--sh); overflow: hidden; }
    .section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--c-gray-100); }
    .section-card-title { display: flex; align-items: center; gap: 12px; }
    .section-card-title h3 { font-size: 13.5px; font-weight: 700; color: var(--c-text); margin: 0 0 2px; }
    .section-card-title p  { font-size: 11px; color: var(--c-muted); margin: 0; }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead tr { background: var(--c-gray-50); }
    .data-table th { padding: 10px 16px; font-size: 11px; font-weight: 700; color: var(--c-muted); text-align: left; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--c-gray-100); }
    .data-table td { padding: 12px 16px; font-size: 13px; color: var(--c-text); border-bottom: 1px solid var(--c-gray-50); transition: background 0.12s; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover td { background: var(--c-gray-50); }
    .td-muted { color: var(--c-muted); font-size: 12px; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .av { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; }

    /* ── Badges & Pills ── */
    .type-tag {
      display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
      background: var(--c-teal-lt); color: var(--c-teal);
      &.cdi { background: var(--c-green-lt); color: var(--c-green); }
      &.cdd { background: var(--c-amber-lt); color: var(--c-amber); }
    }
    .badge-status {
      display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
      &.red   { background: var(--c-red-lt); color: var(--c-red); }
      &.amber { background: var(--c-amber-lt); color: var(--c-amber); }
    }
    .statut-badge {
      display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700;
      background: var(--c-gray-100); color: var(--c-muted);
      &.green  { background: var(--c-green-lt); color: var(--c-green); }
      &.red    { background: var(--c-red-lt); color: var(--c-red); }
      &.amber  { background: var(--c-amber-lt); color: var(--c-amber); }
      &.blue   { background: var(--c-blue-lt); color: var(--c-blue); }
    }
    .urgence-badge {
      display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700;
      background: var(--c-gray-100); color: var(--c-muted);
      &.urgence--critique { background: var(--c-red-lt); color: var(--c-red); }
      &.urgence--urgent   { background: var(--c-orange-lt); color: var(--c-orange); }
      &.urgence--normal   { background: var(--c-blue-lt); color: var(--c-blue); }
      &.urgence--faible   { background: var(--c-green-lt); color: var(--c-green); }
    }
    .solde-pill {
      display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
      background: var(--c-green-lt); color: var(--c-green);
      &.low { background: var(--c-red-lt); color: var(--c-red); }
    }

    /* ── Solde bar ── */
    .solde-bar-wrap { display: flex; align-items: center; gap: 10px; }
    .solde-bar {
      display: inline-block; height: 6px; border-radius: 3px; min-width: 4px;
      background: var(--c-green); flex-shrink: 0; max-width: 80px;
      &.critical { background: var(--c-red); }
      &.warning  { background: var(--c-amber); }
    }
    .solde-val { font-size: 12.5px; font-weight: 700; white-space: nowrap; color: var(--c-green); &.text-red { color: var(--c-red); } &.text-amber { color: var(--c-amber); } }

    /* ── Rank ── */
    .rank-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 800;
      background: var(--c-gray-100); color: var(--c-muted);
      &.gold   { background: #fff3d0; color: #b7791f; }
      &.silver { background: #edf2f7; color: #718096; }
      &.bronze { background: #fff0e6; color: #c05621; }
    }

    /* ── Stats Row ── */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-block {
      background: white; border-radius: var(--r-lg); padding: 20px 22px;
      box-shadow: var(--sh); border: 1px solid var(--c-gray-100);
      display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
    }
    .stat-icon { opacity: 0.7; }
    .stat-val { font-size: 22px; font-weight: 900; color: var(--c-text); }
    .stat-lbl { font-size: 11px; color: var(--c-muted); font-weight: 500; }
    .stat-block--green  { border-top: 3px solid var(--c-green); .stat-icon { color: var(--c-green); } }
    .stat-block--purple { border-top: 3px solid var(--c-purple); .stat-icon { color: var(--c-purple); } }
    .stat-block--teal   { border-top: 3px solid var(--c-teal); .stat-icon { color: var(--c-teal); } }
    .stat-block--amber  { border-top: 3px solid var(--c-amber); .stat-icon { color: var(--c-amber); } }

    /* ── Alertes ── */
    .alerts-section { margin-top: 8px; }
    .section-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; h3 { font-size: 15px; font-weight: 700; color: var(--c-text); margin: 0; } }
    .count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; border-radius: 11px; padding: 0 6px; font-size: 11px; font-weight: 800; &.red { background: var(--c-red); color: white; } }
    .alerts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .alert-item {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: var(--r);
      .alert-content strong { font-size: 13px; color: var(--c-text); display: block; margin-bottom: 2px; }
      .alert-content p { font-size: 12px; color: var(--c-muted); margin: 0; }
      &--warning { background: #fffbf0; border: 1px solid #f0c040; .alert-icon { color: var(--c-amber); } }
      &--danger  { background: #fff5f5; border: 1px solid #feb2b2; .alert-icon { color: var(--c-red); } }
      &--info    { background: #eff6ff; border: 1px solid #bdd7fb; .alert-icon { color: var(--c-blue); } }
    }

    /* ── Empty ── */
    .empty-row { padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--c-gray-100); color: var(--c-muted); display: flex; align-items: center; justify-content: center; }
    .empty-row p { font-size: 13px; color: var(--c-muted); margin: 0; }

    /* ── Misc ── */
    .spinner { width: 16px; height: 16px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Animations (Design Amélioré) ── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kpi-card { animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .kpi-row .kpi-card:nth-child(1) { animation-delay: 0.05s; }
    .kpi-row .kpi-card:nth-child(2) { animation-delay: 0.10s; }
    .kpi-row .kpi-card:nth-child(3) { animation-delay: 0.15s; }
    .kpi-row .kpi-card:nth-child(4) { animation-delay: 0.20s; }
    .kpi-row .kpi-card:nth-child(5) { animation-delay: 0.25s; }
    .kpi-row .kpi-card:nth-child(6) { animation-delay: 0.30s; }

    .chart-card { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .charts-grid .chart-card:nth-child(1) { animation-delay: 0.15s; }
    .charts-grid .chart-card:nth-child(2) { animation-delay: 0.25s; }
    .charts-grid .chart-card:nth-child(3) { animation-delay: 0.35s; }

    .section-card { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.3s; }
    .alerts-section { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.4s; }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {

  // ─── Canvas refs ─────────────────────────────────────────────────────
  @ViewChild('barChart')        barChartRef!:        ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart')       lineChartRef!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('typeCongeChart')  typeCongeChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('gaugeChart')      gaugeChartRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('reclamChart')     reclamChartRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('deptChart')       deptChartRef!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('statutCongeChart') statutCongeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('avanceChart')     avanceChartRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('augmentChart')    augmentChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('deptPieChart')    deptPieChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('contratChart')    contratChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('ancienneteChart') ancienneteChartRef!: ElementRef<HTMLCanvasElement>;

  private analyticsService = inject(AnalyticsService);
  private pdfService       = inject(PdfService);

  ic   = IC;
  Math = Math;

  loading       = signal(true);
  exportLoading = signal(false);
  activeTab     = signal<ActiveTab>('overview');

  selectedMois  = new Date().getMonth() + 1;
  selectedAnnee = new Date().getFullYear();
  selectedDept  = '';

  allData     = signal<any>(null);
  rapportData = signal<any>(null);

  // ─── Computed signals ─────────────────────────────────────────────
  filteredEmployes  = signal<any[]>([]);
  departments       = signal<string[]>([]);
  joursPresents     = signal(0);
  joursAbsents      = signal(0);
  tauxPresence      = signal(0);

  // KPIs
  congesEnAttente         = signal(0);
  congesEnAttenteManager  = signal(0);
  congesEnAttenteRH       = signal(0);
  reclamationsActives     = signal(0);
  reclamationsCritiques   = signal(0);
  avancesEnAttente        = signal(0);
  montantTotalAvances     = signal(0);
  augmentationsEnAttente  = signal(0);
  augmentationsApprouvees = signal(0);
  sortiesToday            = signal(0);

  // Finance
  montantTotalAugmentDemande  = signal(0);
  montantTotalAugmentAccorde  = signal(0);
  tauxResolutionReclamations  = signal(0);

  // Tables
  emploesFaibleSolde = signal<any[]>([]);
  topAbsences        = signal<any[]>([]);
  topReclamants      = signal<any[]>([]);
  alertes            = signal<any[]>([]);

  private soldesMap: Record<number, number> = {};
  private charts: Chart[] = [];

  moisList = [
    { value: 1,  label: 'Janvier'  }, { value: 2,  label: 'Février'   },
    { value: 3,  label: 'Mars'     }, { value: 4,  label: 'Avril'     },
    { value: 5,  label: 'Mai'      }, { value: 6,  label: 'Juin'      },
    { value: 7,  label: 'Juillet'  }, { value: 8,  label: 'Août'      },
    { value: 9,  label: 'Septembre'}, { value: 10, label: 'Octobre'   },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre'  },
  ];
  anneeList = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);

  ngOnInit():      void { this.loadData(); }
  ngAfterViewInit(): void { }

  // ─── Load ────────────────────────────────────────────────────────────
  loadData(): void {
    this.loading.set(true);
    this.destroyCharts();

    this.analyticsService.getAnalyticsRH().subscribe({
      next: (data) => {
        this.allData.set(data);
        this.computeDepartements(data);
        this.applyFilters();
        this.loading.set(false);
        setTimeout(() => this.buildChartsForTab(), 80);
      },
      error: () => this.loading.set(false)
    });

    this.analyticsService.getRapportMensuel(this.selectedAnnee, this.selectedMois)
      .subscribe({ next: (r) => this.rapportData.set(r) });
  }

  onPeriodChange(): void {
    this.analyticsService.getRapportMensuel(this.selectedAnnee, this.selectedMois)
      .subscribe({ next: (r) => this.rapportData.set(r) });
  }

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    setTimeout(() => this.buildChartsForTab(), 80);
  }

  applyFilters(): void {
    const data = this.allData();
    if (!data) return;
    const employes = (data.employes ?? []).filter((e: any) =>
      !this.selectedDept || e.departement === this.selectedDept
    );
    this.filteredEmployes.set(employes);
    this.computeAll(data, employes);
    setTimeout(() => this.buildChartsForTab(), 80);
  }

  // ─── Compute ─────────────────────────────────────────────────────────
  private computeDepartements(data: any): void {
    const depts = [...new Set((data.employes ?? []).map((e: any) => e.departement).filter(Boolean))] as string[];
    this.departments.set(depts.sort());
  }

  private computeAll(data: any, employes: any[]): void {
    const conges       = data.conges       ?? [];
    const reclamations = data.reclamations ?? [];
    const avances      = data.avances      ?? [];
    const augmentations = data.augmentations ?? [];
    const sorties      = data.sorties      ?? [];
    const today        = new Date();

    // Congés en attente
    const enAttenteM = conges.filter((c: any) => c.statut === 'EN_ATTENTE_MANAGER').length;
    const enAttenteR = conges.filter((c: any) => c.statut === 'EN_ATTENTE_RH').length;
    this.congesEnAttenteManager.set(enAttenteM);
    this.congesEnAttenteRH.set(enAttenteR);
    this.congesEnAttente.set(enAttenteM + enAttenteR);

    // Réclamations
    const recActives = reclamations.filter((r: any) => ['SOUMISE','EN_COURS'].includes(r.statut));
    this.reclamationsActives.set(recActives.length);
    this.reclamationsCritiques.set(recActives.filter((r: any) => r.niveauUrgence === 'CRITIQUE').length);
    const recResolues = reclamations.filter((r: any) => r.statut === 'RESOLUE').length;
    this.tauxResolutionReclamations.set(reclamations.length > 0 ? Math.round((recResolues / reclamations.length) * 100) : 0);

    // Avances
    // FIX : Inclut le statut MODIFIEE_PAR_RH qui est en attente de l'employé
    const avAttente = avances.filter((a: any) => ['EN_ATTENTE_RH', 'MODIFIEE_PAR_RH'].includes(a.statut));
    this.avancesEnAttente.set(avAttente.length);
    this.montantTotalAvances.set(avAttente.reduce((s: number, a: any) => s + (a.montantDemande || 0), 0));

    // Augmentations — FIX : vrais statuts = EN_ATTENTE_MANAGER, EN_ATTENTE_RH, VALIDEE, REJETEE, ANNULEE
    this.augmentationsEnAttente.set(augmentations.filter((a: any) => ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(a.statut)).length);
    this.augmentationsApprouvees.set(augmentations.filter((a: any) => a.statut === 'VALIDEE').length);
    this.montantTotalAugmentDemande.set(augmentations.reduce((s: number, a: any) => s + (Number(a.montantDemande) || 0), 0));
    this.montantTotalAugmentAccorde.set(augmentations.filter((a: any) => a.statut === 'VALIDEE').reduce((s: number, a: any) => s + (Number(a.montantAccorde) || 0), 0));

    // Présence
    // CORRECTION : compte aussi les autorisations de sortie validées du jour
    const absentsCongeIds = conges
      .filter((c: any) => {
        if (c.statut !== 'VALIDEE') return false;
        const debut = new Date(c.dateDebut), fin = new Date(c.dateFin);
        return debut <= today && fin >= today;
      })
      // FIX : champ plat employeId, pas employe.id
      .map((c: any) => c.employeId)
      .filter(Boolean);

    const absentsSortieIds = sorties
      .filter((s: any) => {
        if (s.statut !== 'VALIDEE') return false;
        const dateSortie = new Date(s.dateSortie ?? s.createdAt);
        return dateSortie.toDateString() === today.toDateString();
      })
      // FIX : champ plat employeId
      .map((s: any) => s.employeId)
      .filter(Boolean);

    const absentsIds = new Set([...absentsCongeIds, ...absentsSortieIds]);
    const nbAbsents  = absentsIds.size;
    const total      = Math.max(employes.length, 1);
    const presents   = Math.max(total - nbAbsents, 0);
    this.joursAbsents.set(nbAbsents);
    this.joursPresents.set(presents);
    this.tauxPresence.set(Math.round((presents / total) * 100));
    this.sortiesToday.set(nbAbsents);

    // Top absences
    this.computeTopAbsences(employes, conges);

    // Top réclamants
    this.computeTopReclamants(employes, reclamations);

    // Alertes (sans les soldes pour l'instant — mise à jour après chargement)
    this.computeAlertes(data);

    // Soldes depuis l'API (réels, tient compte des reports et ajustements).
    // computeFaibleSolde et computeAlertes sont rappelés à la fin du chargement.
    this.loadSoldesReels(employes, data);
  }

  // FIX : les soldes sont chargés de façon asynchrone.
  // On ne calcule emploesFaibleSolde et alertes QU'APRÈS avoir reçu TOUTES
  // les réponses, pour éviter que les employés avec un solde non encore chargé
  // (valeur temporaire 0) soient faussement classés "solde insuffisant".
  private loadSoldesReels(employes: any[], data: any): void {
    if (!employes.length) return;

    // Réinitialiser complètement la map pour éviter des valeurs obsolètes
    // d'un précédent chargement (changement d'année ou de département).
    this.soldesMap = {};

    let pending = employes.length;

    employes.forEach((e: any) => {
      this.analyticsService.getSoldeEmploye(e.id).subscribe({
        next: (soldes: any[]) => {
          const soldeAnnuel = soldes.find((s: any) =>
            s.typeConge === 'ANNUEL' && s.annee === this.selectedAnnee
          );
          // FIX : utiliser joursRestants réel, pas 0 par défaut
          this.soldesMap[e.id] = soldeAnnuel?.joursRestants ?? 21;
        },
        error: () => {
          // En cas d'erreur réseau, on suppose le solde complet (21j)
          // pour ne pas générer de fausse alerte.
          this.soldesMap[e.id] = 21;
        },
        complete: () => {
          pending--;
          // Recalculer seulement quand TOUS les soldes sont reçus
          if (pending === 0) {
            this.computeFaibleSolde(this.filteredEmployes());
            this.computeAlertes(data);
          }
        }
      });
    });
  }

  getSoldeEmploye(id: number): number { return this.soldesMap[id] ?? 0; }

  private computeFaibleSolde(employes: any[]): void {
    const faibles = employes
      .map((e: any) => ({ ...e, soldeRestant: this.getSoldeEmploye(e.id) }))
      .filter((e: any) => e.soldeRestant <= 5)
      .sort((a: any, b: any) => a.soldeRestant - b.soldeRestant);
    this.emploesFaibleSolde.set(faibles);
  }

  private computeTopAbsences(employes: any[], conges: any[]): void {
    const annee = this.selectedAnnee;
    const map: Record<number, any> = {};
    // FIX : DemandeCongeResponse expose employeId (plat), pas employe.id (objet imbriqué)
    conges.filter((c: any) => c.statut === 'VALIDEE' && new Date(c.dateDebut).getFullYear() === annee)
      .forEach((c: any) => {
        const eid = c.employeId;
        if (!eid) return;
        if (!map[eid]) { const e = employes.find((emp: any) => emp.id === eid); if (!e) return; map[eid] = { ...e, joursPris: 0, nbDemandes: 0 }; }
        map[eid].joursPris += (c.joursOuvrables || 0);
        map[eid].nbDemandes++;
      });
    const sorted = Object.values(map).sort((a: any, b: any) => b.joursPris - a.joursPris).slice(0, 8);
    this.topAbsences.set(sorted);
  }

  // CORRECTION : garde l'urgence la plus élevée (pas la dernière de la liste)
  // et le statut le plus récent (en triant par date).
  private computeTopReclamants(employes: any[], reclamations: any[]): void {
    const URGENCE_PRIO: Record<string, number> = {
      CRITIQUE: 4, URGENT: 3, NORMAL: 2, FAIBLE: 1
    };
    const map: Record<number, any> = {};

    // Trier par date ASC pour que le dernier = le plus récent
    const sorted = [...reclamations].sort((a: any, b: any) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    );

    sorted.forEach((r: any) => {
      // FIX : ReclamationResponse expose employeId (plat), pas employe.id
      const eid = r.employeId;
      if (!eid) return;
      if (!map[eid]) {
        const e = employes.find((emp: any) => emp.id === eid);
        if (!e) return;
        map[eid] = { ...e, nbReclamations: 0, derniereUrgence: null, dernierStatut: null };
      }
      map[eid].nbReclamations++;
      // Garder l'urgence la plus haute
      const prioCurrent = URGENCE_PRIO[r.niveauUrgence] ?? 0;
      const prioStored  = URGENCE_PRIO[map[eid].derniereUrgence] ?? 0;
      if (prioCurrent >= prioStored) {
        map[eid].derniereUrgence = r.niveauUrgence;
      }
      // Statut le plus récent (dernier dans le tableau trié)
      map[eid].dernierStatut = r.statut;
    });
    this.topReclamants.set(Object.values(map).sort((a: any, b: any) => b.nbReclamations - a.nbReclamations).slice(0, 6));
  }

  private computeAlertes(data: any): void {
    const alertes: any[] = [];
    if (this.congesEnAttente() >= 5) alertes.push({ level: 'warning', icon: IC.calendar, title: 'Congés en attente', message: `${this.congesEnAttente()} demandes nécessitent votre validation` });
    if (this.reclamationsCritiques() > 0) alertes.push({ level: 'danger', icon: IC.chat, title: 'Réclamations critiques', message: `${this.reclamationsCritiques()} réclamation(s) CRITIQUE en attente` });
    if (this.augmentationsEnAttente() >= 3) alertes.push({ level: 'info', icon: IC.salary, title: 'Augmentations en attente', message: `${this.augmentationsEnAttente()} dossiers d'augmentation à traiter` });
    // FIX : n'ajouter l'alerte soldes critiques que si la liste est déjà calculée
    // (après chargement async des soldes). Filtre sur <= 2 jours restants.
    const critique = this.emploesFaibleSolde().filter((e: any) => e.soldeRestant <= 2);
    if (critique.length > 0)
      alertes.push({ level: 'warning', icon: IC.warning, title: 'Soldes critiques', message: `${critique.length} employé(s) avec moins de 2 jours de congé` });
    this.alertes.set(alertes);
  }

  // ─── Charts ──────────────────────────────────────────────────────────
  private buildChartsForTab(): void {
    this.destroyCharts();
    const data = this.allData();
    if (!data) return;
    const tab = this.activeTab();

    if (tab === 'overview') {
      this.buildBarChart(data.conges ?? []);
      this.buildTypeCongeChart(data.conges ?? []);
      this.buildLineChart(data.conges ?? [], data.sorties ?? []);
      this.buildGaugeChart();
      this.buildReclamChart(data.reclamations ?? []);
    } else if (tab === 'conges') {
      this.buildDeptChart(data.conges ?? [], this.filteredEmployes());
      this.buildStatutCongeChart(data.conges ?? []);
    } else if (tab === 'rh-social') {
      this.buildAvanceChart(data.avances ?? []);
      this.buildAugmentChart(data.augmentations ?? []);
    } else if (tab === 'effectifs') {
      this.buildDeptPieChart(this.filteredEmployes());
      this.buildContratChart(this.filteredEmployes());
      this.buildAncienneteChart(this.filteredEmployes());
    }
  }

  private tp = { backgroundColor: '#1a202c', padding: 12, cornerRadius: 8, titleFont: { size: 12 }, bodyFont: { size: 12 } };

  private buildBarChart(conges: any[]): void {
    if (!this.barChartRef) return;
    const labels = this.getLast6Months();
    const total  = labels.map(l => this.countByMonth(conges, l));
    const valide = labels.map(l => this.countByMonth(conges.filter((c: any) => c.statut === 'VALIDEE'), l));
    const rejete = labels.map(l => this.countByMonth(conges.filter((c: any) => c.statut === 'REJETEE'), l));
    this.charts.push(new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: { labels: labels.map(l => l.label), datasets: [
        { label: 'Total', data: total, backgroundColor: 'rgba(14,157,175,0.75)', borderRadius: 6 },
        { label: 'Validés', data: valide, backgroundColor: 'rgba(56,161,105,0.75)', borderRadius: 6 },
        { label: 'Rejetés', data: rejete, backgroundColor: 'rgba(229,62,62,0.75)', borderRadius: 6 }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: this.tp },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  private buildTypeCongeChart(conges: any[]): void {
    if (!this.typeCongeChartRef) return;
    const types: Record<string, number> = {};
    conges.forEach((c: any) => { types[c.typeConge] = (types[c.typeConge] || 0) + 1; });
    if (!Object.keys(types).length) types['Aucun'] = 1;
    const labelMap: Record<string,string> = { ANNUEL: 'Annuel', MALADIE: 'Maladie', MATERNITE: 'Maternité', PATERNITE: 'Paternité', EXCEPTIONNEL: 'Exceptionnel', SANS_SOLDE: 'Sans solde' };
    const labels = Object.keys(types), vals = Object.values(types);
    this.charts.push(new Chart(this.typeCongeChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels: labels.map(l => labelMap[l] ?? l), datasets: [{ data: vals, backgroundColor: ['#0e9daf','#e53e3e','#d69e2e','#38a169','#805ad5','#3182ce'], borderColor: 'white', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } }, tooltip: this.tp } }
    }));
  }

  private buildLineChart(conges: any[], sorties: any[]): void {
    if (!this.lineChartRef) return;
    const labels = this.getLast6Months();
    this.charts.push(new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: { labels: labels.map(l => l.label), datasets: [
        { label: 'Congés', data: labels.map(l => this.countByMonth(conges, l)), borderColor: '#0e9daf', backgroundColor: 'rgba(14,157,175,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#0e9daf', pointRadius: 4 },
        { label: 'Sorties', data: labels.map(l => this.countByMonth(sorties, l, 'dateSortie')), borderColor: '#805ad5', backgroundColor: 'rgba(128,90,213,0.07)', tension: 0.4, fill: true, pointBackgroundColor: '#805ad5', pointRadius: 4 }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 } } }, tooltip: this.tp },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  private buildGaugeChart(): void {
    if (!this.gaugeChartRef) return;
    const taux = this.tauxPresence();
    this.charts.push(new Chart(this.gaugeChartRef.nativeElement, {
      type: 'doughnut',
      data: { datasets: [{ data: [taux, 100 - taux], backgroundColor: taux >= 80 ? ['#38a169','#eef0f3'] : taux >= 60 ? ['#d69e2e','#eef0f3'] : ['#e53e3e','#eef0f3'], borderWidth: 0, circumference: 180, rotation: 270, hoverOffset: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    }));
  }

  private buildReclamChart(reclamations: any[]): void {
    if (!this.reclamChartRef) return;
    const types: Record<string, number> = {};
    reclamations.forEach((r: any) => { types[r.typeReclamation] = (types[r.typeReclamation] || 0) + 1; });
    if (!Object.keys(types).length) types['Aucune'] = 1;
    const labelMap: Record<string,string> = { SALAIRE: 'Salaire', CONDITIONS_TRAVAIL: 'Conditions', HARCELEMENT: 'Harcèlement', CONGE: 'Congé', AUTRE: 'Autre' };
    const labels = Object.keys(types), vals = Object.values(types);
    this.charts.push(new Chart(this.reclamChartRef.nativeElement, {
      type: 'bar',
      data: { labels: labels.map(l => labelMap[l] ?? l), datasets: [{ data: vals, backgroundColor: ['#e53e3e','#d69e2e','#805ad5','#0e9daf','#3182ce'], borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, tooltip: this.tp },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  private buildDeptChart(conges: any[], employes: any[]): void {
    if (!this.deptChartRef) return;
    const depts = this.departments();
    if (!depts.length) return;
    const joursParDept = depts.map(d => {
      const empIds = employes.filter((e: any) => e.departement === d).map((e: any) => e.id);
      // FIX : champ plat employeId, pas employe.id
      return conges.filter((c: any) => c.statut === 'VALIDEE' && empIds.includes(c.employeId))
        .reduce((s: number, c: any) => s + (c.joursOuvrables || 0), 0);
    });
    this.charts.push(new Chart(this.deptChartRef.nativeElement, {
      type: 'bar',
      data: { labels: depts, datasets: [{ label: 'Jours validés', data: joursParDept, backgroundColor: ['#0e9daf','#805ad5','#38a169','#d69e2e','#e53e3e','#3182ce'], borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: this.tp },
        scales: { y: { beginAtZero: true, ticks: { color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  private buildStatutCongeChart(conges: any[]): void {
    if (!this.statutCongeChartRef) return;
    const statutMap: Record<string,string> = { EN_ATTENTE_MANAGER: 'Attente manager', EN_ATTENTE_RH: 'Attente RH', VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée', BROUILLON: 'Brouillon' };
    const colorMap: Record<string,string> = { EN_ATTENTE_MANAGER: '#d69e2e', EN_ATTENTE_RH: '#ecc94b', VALIDEE: '#38a169', REJETEE: '#e53e3e', ANNULEE: '#cbd5e0', BROUILLON: '#a0aec0' };
    const statuts: Record<string, number> = {};
    conges.forEach((c: any) => { statuts[c.statut] = (statuts[c.statut] || 0) + 1; });
    if (!Object.keys(statuts).length) statuts['Aucun'] = 1;
    const labels = Object.keys(statuts);
    this.charts.push(new Chart(this.statutCongeChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels: labels.map(l => statutMap[l] ?? l), datasets: [{ data: Object.values(statuts), backgroundColor: labels.map(l => colorMap[l] ?? '#cbd5e0'), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } }, tooltip: this.tp } }
    }));
  }

  private buildAvanceChart(avances: any[]): void {
    if (!this.avanceChartRef) return;
    // FIX : les statuts réels sont EN_ATTENTE_RH, VALIDEE, REJETEE, ANNULEE, EN_COURS, SOLDEE
    const colorMap: Record<string,string> = { EN_ATTENTE_RH: '#d69e2e', VALIDEE: '#38a169', REJETEE: '#e53e3e', EN_COURS: '#0e9daf', SOLDEE: '#805ad5', ANNULEE: '#cbd5e0' };
    const statuts: Record<string, number> = {};
    avances.forEach((a: any) => { statuts[a.statut] = (statuts[a.statut] || 0) + 1; });
    if (!Object.keys(statuts).length) statuts['Aucune'] = 1;
    const labels = Object.keys(statuts);
    this.charts.push(new Chart(this.avanceChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: Object.values(statuts), backgroundColor: labels.map(l => colorMap[l] ?? '#cbd5e0'), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } }, tooltip: this.tp } }
    }));
  }

  private buildAugmentChart(augmentations: any[]): void {
    if (!this.augmentChartRef) return;
    // FIX : vrais statuts = EN_ATTENTE_MANAGER, EN_ATTENTE_RH, VALIDEE, REJETEE, ANNULEE
    const labels = ['EN_ATTENTE_MANAGER', 'EN_ATTENTE_RH', 'VALIDEE', 'REJETEE', 'ANNULEE'];
    const labelMap: Record<string,string> = { EN_ATTENTE_MANAGER: 'Avis manager', EN_ATTENTE_RH: 'Attente RH', VALIDEE: 'Approuvée', REJETEE: 'Rejetée', ANNULEE: 'Annulée' };
    const colorMap: Record<string,string> = { EN_ATTENTE_MANAGER: '#d69e2e', EN_ATTENTE_RH: '#ecc94b', VALIDEE: '#0e9daf', REJETEE: '#e53e3e', ANNULEE: '#cbd5e0' };
    const counts = labels.map(l => augmentations.filter((a: any) => a.statut === l).length);
    this.charts.push(new Chart(this.augmentChartRef.nativeElement, {
      type: 'bar',
      data: { labels: labels.map(l => labelMap[l]), datasets: [{ data: counts, backgroundColor: labels.map(l => colorMap[l]), borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: this.tp },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  private buildDeptPieChart(employes: any[]): void {
    if (!this.deptPieChartRef) return;
    const counts: Record<string, number> = {};
    employes.forEach((e: any) => { counts[e.departement ?? 'N/A'] = (counts[e.departement ?? 'N/A'] || 0) + 1; });
    if (!Object.keys(counts).length) counts['Aucun'] = 1;
    this.charts.push(new Chart(this.deptPieChartRef.nativeElement, {
      type: 'pie',
      data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#0e9daf','#805ad5','#38a169','#d69e2e','#e53e3e','#3182ce','#dd6b20'], borderColor: 'white', borderWidth: 3 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } }, tooltip: this.tp } }
    }));
  }

  private buildContratChart(employes: any[]): void {
    if (!this.contratChartRef) return;
    const counts: Record<string, number> = {};
    employes.forEach((e: any) => { counts[e.typeContrat ?? 'N/A'] = (counts[e.typeContrat ?? 'N/A'] || 0) + 1; });
    if (!Object.keys(counts).length) counts['N/A'] = 1;
    const colorMap: Record<string,string> = { CDI: '#38a169', CDD: '#d69e2e', STAGE: '#3182ce', ALTERNANCE: '#805ad5', 'N/A': '#cbd5e0' };
    const labels = Object.keys(counts);
    this.charts.push(new Chart(this.contratChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: Object.values(counts), backgroundColor: labels.map(l => colorMap[l] ?? '#cbd5e0'), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } }, tooltip: this.tp } }
    }));
  }

  private buildAncienneteChart(employes: any[]): void {
    if (!this.ancienneteChartRef) return;
    const tranches = ['-1 an', '1-3 ans', '3-5 ans', '5-10 ans', '+10 ans'];
    const counts = [0, 0, 0, 0, 0];
    const now = new Date();
    employes.forEach((e: any) => {
      if (!e.dateEmbauche) return;
      const annees = (now.getTime() - new Date(e.dateEmbauche).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if      (annees < 1)  counts[0]++;
      else if (annees < 3)  counts[1]++;
      else if (annees < 5)  counts[2]++;
      else if (annees < 10) counts[3]++;
      else                  counts[4]++;
    });
    this.charts.push(new Chart(this.ancienneteChartRef.nativeElement, {
      type: 'bar',
      data: { labels: tranches, datasets: [{ data: counts, backgroundColor: ['#bee3f8','#90cdf4','#63b3ed','#3182ce','#1a365d'], borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: this.tp },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } } } }
    }));
  }

  // ─── Exports ─────────────────────────────────────────────────────────
  exportRapportPDF(): void {
    this.exportLoading.set(true);
    this.analyticsService.getRapportMensuel(this.selectedAnnee, this.selectedMois).subscribe({
      next: (data) => { this.pdfService.exportRapportMensuel(data, this.selectedAnnee, this.selectedMois); this.exportLoading.set(false); },
      error: () => this.exportLoading.set(false)
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────
  private getLast6Months(): { label: string; month: number; year: number }[] {
    const result = [], now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({ label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), month: d.getMonth() + 1, year: d.getFullYear() });
    }
    return result;
  }

  private countByMonth(items: any[], period: { month: number; year: number }, dateField = 'createdAt'): number {
    return items.filter((item: any) => {
      if (!item[dateField]) return false;
      const d = new Date(item[dateField]);
      return d.getMonth() + 1 === period.month && d.getFullYear() === period.year;
    }).length;
  }

  getInitialesE(e: any): string { return ((e.prenom?.[0] ?? '') + (e.nom?.[0] ?? '')).toUpperCase(); }

  getStatutClass(statut: string): string {
    const map: Record<string,string> = { RESOLUE: 'green', REJETEE: 'red', EN_COURS: 'blue', SOUMISE: 'amber', FERMEE: '' };
    return map[statut] ?? '';
  }

  getMoisLabel(): string { return this.moisList.find(m => m.value === this.selectedMois)?.label ?? ''; }

  private destroyCharts(): void { this.charts.forEach(c => c.destroy()); this.charts = []; }
}
