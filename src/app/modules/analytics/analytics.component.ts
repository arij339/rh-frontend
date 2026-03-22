import {
  Component, inject, OnInit, signal,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PdfService }       from '../../core/services/pdf.service';
import { AuthService }      from '../../core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
Chart.register(...registerables);

// ─── SVG icon strings ─────────────────────────────────────────────────────────
const IC = {
  analytics: `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  download:  `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  users:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendar:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  chat:      `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  banknote:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  exit:      `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  barChart:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  lineChart: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  pie:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  donut:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
  check:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  file:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  up:        `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`,
  down:      `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  spinner:   ``,
};

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
        <p>Tableaux de bord avancés et exports PDF</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="period-picker">
        <div class="period-field">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <select [(ngModel)]="selectedMois" (change)="onPeriodChange()">
            <option *ngFor="let m of moisList" [value]="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div class="period-field">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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

  <!-- ── KPI Cards ── -->
  <div class="kpi-row" *ngIf="!loading()">
    <div class="kpi-card" *ngFor="let kpi of kpis(); let i = index"
         [class]="'kpi-card kpi-card--' + kpi.color">
      <div class="kpi-left">
        <div class="kpi-icon-wrap" [innerHTML]="kpi.iconSvg | safeHtml"></div>
        <div class="kpi-info">
          <span class="kpi-val">{{ kpi.value }}</span>
          <span class="kpi-lbl">{{ kpi.label }}</span>
        </div>
      </div>
      <div class="kpi-trend" *ngIf="kpi.trend !== undefined"
           [class.up]="kpi.trend >= 0" [class.down]="kpi.trend < 0">
        <span [innerHTML]="kpi.trend  >= 0 ? ic.up : ic.down  | safeHtml"></span>
        {{ Math.abs(kpi.trend) }}%
      </div>
      <div class="kpi-deco"></div>
    </div>
  </div>

  <!-- ── Loading ── -->
  <div class="page-loading" *ngIf="loading()">
    <div class="loading-ring"></div>
    <p>Chargement des données analytiques...</p>
  </div>

  <!-- ── Charts Grid ── -->
  <div class="charts-grid" *ngIf="!loading()">

    <!-- Bar chart (wide) -->
    <div class="chart-card wide">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <div class="chart-card-icon teal">
            <span [innerHTML]="ic.barChart | safeHtml"></span>
          </div>
          <div>
            <h3>Congés par mois</h3>
            <p>Évolution des demandes sur 6 mois</p>
          </div>
        </div>
        <div class="chart-legend">
          <span class="leg-item"><span class="leg-dot teal"></span>Total</span>
          <span class="leg-item"><span class="leg-dot green"></span>Validées</span>
          <span class="leg-item"><span class="leg-dot red"></span>Rejetées</span>
        </div>
      </div>
      <div class="chart-body" style="height:220px">
        <canvas #barChart></canvas>
      </div>
    </div>

    <!-- Line chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <div class="chart-card-icon blue">
            <span [innerHTML]="ic.lineChart | safeHtml"></span>
          </div>
          <div>
            <h3>Évolution des demandes</h3>
            <p>Tendance sur 6 mois</p>
          </div>
        </div>
      </div>
      <div class="chart-body" style="height:220px">
        <canvas #lineChart></canvas>
      </div>
    </div>

    <!-- Pie chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <div class="chart-card-icon orange">
            <span [innerHTML]="ic.pie | safeHtml"></span>
          </div>
          <div>
            <h3>Types de réclamations</h3>
            <p>Répartition par catégorie</p>
          </div>
        </div>
      </div>
      <div class="chart-body" style="height:200px">
        <canvas #pieChart></canvas>
      </div>
    </div>

    <!-- Donut chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <div class="chart-card-icon purple">
            <span [innerHTML]="ic.donut | safeHtml"></span>
          </div>
          <div>
            <h3>Statut des avances</h3>
            <p>Répartition par statut</p>
          </div>
        </div>
      </div>
      <div class="chart-body" style="height:200px">
        <canvas #donutChart></canvas>
      </div>
    </div>

    <!-- Gauge -->
    <div class="chart-card gauge-card">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <div class="chart-card-icon green">
            <span [innerHTML]="ic.check | safeHtml"></span>
          </div>
          <div>
            <h3>Taux de présence</h3>
            <p>Équipe ce mois</p>
          </div>
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
          <div class="gs-item">
            <span class="gs-val green">{{ joursPresents() }}</span>
            <span class="gs-lbl">Présents</span>
          </div>
          <div class="gs-sep"></div>
          <div class="gs-item">
            <span class="gs-val amber">{{ joursAbsents() }}</span>
            <span class="gs-lbl">En congé</span>
          </div>
          <div class="gs-sep"></div>
          <div class="gs-item">
            <span class="gs-val teal">{{ totalJours() }}</span>
            <span class="gs-lbl">Total</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Sorties Table ── -->
  <div class="section-card" *ngIf="!loading()">
    <div class="section-card-header">
      <div class="section-card-title">
        <div class="chart-card-icon teal">
          <span [innerHTML]="ic.exit | safeHtml"></span>
        </div>
        <div>
          <h3>Autorisations de sortie — {{ getMoisLabel() }}</h3>
          <p>{{ sortiesValidees().length }} sortie(s) validée(s) ce mois</p>
        </div>
      </div>
      <button class="btn-outline-sm" (click)="exportAllSortiesPDF()">
        <span [innerHTML]="ic.download | safeHtml"></span>
        Exporter tout
      </button>
    </div>

    <div class="table-wrap" *ngIf="sortiesValidees().length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Employé</th>
            <th>Date</th>
            <th>Horaire</th>
            <th>Type</th>
            <th>Durée</th>
            <th>Retour réel</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of sortiesValidees()">
            <td>
              <div class="user-cell">
                <div class="av">{{ getInitiales(s) }}</div>
                <strong>{{ s.employeNom }} {{ s.employePrenom }}</strong>
              </div>
            </td>
            <td class="td-muted">{{ s.dateSortie | date:'dd/MM/yyyy' }}</td>
            <td class="td-muted">{{ s.heureSortie }} → {{ s.heureRetourPrevue }}</td>
            <td><span class="type-tag">{{ s.typeSortie }}</span></td>
            <td class="td-muted">{{ s.dureePrevueFormatee }}</td>
            <td>
              <span *ngIf="s.heureRetourReelle" class="badge-ok">{{ s.heureRetourReelle }}</span>
              <span *ngIf="!s.heureRetourReelle" class="badge-na">—</span>
            </td>
            <td>
              <button class="btn-attestation" (click)="exportSortiePDF(s)">
                <span [innerHTML]="ic.file | safeHtml"></span>
                Attestation
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-row" *ngIf="sortiesValidees().length === 0">
      <div class="empty-icon">
        <span [innerHTML]="ic.exit | safeHtml"></span>
      </div>
      <p>Aucune autorisation de sortie validée pour cette période</p>
    </div>
  </div>

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
      margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
    }

    .page-header-left { display: flex; align-items: center; gap: 14px; }

    .page-header-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-primary));
      display: flex; align-items: center; justify-content: center;
      color: white; flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(14,157,175,0.3);
      svg { display: block; }
    }

    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin: 0 0 2px; }
    p  { font-size: 13px; color: var(--c-muted); margin: 0; }

    .header-actions { display: flex; align-items: center; gap: 12px; }

    .period-picker { display: flex; gap: 8px; }

    .period-field {
      display: flex; align-items: center; gap: 8px;
      padding: 0 12px; height: 40px;
      background: white; border: 1.5px solid var(--c-gray-200);
      border-radius: var(--r); transition: border-color 0.2s;
      svg { display: block; color: var(--c-muted); flex-shrink: 0; }

      select {
        border: none; outline: none; background: transparent;
        font-size: 13px; font-weight: 600; color: var(--c-text); cursor: pointer;
      }

      &:focus-within { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); }
    }

    .btn-export {
      display: inline-flex; align-items: center; gap: 7px;
      height: 40px; padding: 0 18px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-primary));
      color: white; font-size: 13px; font-weight: 600;
      border: none; border-radius: var(--r); cursor: pointer;
      box-shadow: 0 3px 12px rgba(14,157,175,0.3); transition: all 0.2s;
      svg { display: block; }
      span { display: inline-flex; align-items: center; gap: 7px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(14,157,175,0.4); }
      &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    }

    /* ── KPI Row ── */
    .kpi-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 16px; margin-bottom: 24px;
    }

    .kpi-card {
      background: white; border-radius: var(--r-lg); padding: 18px 20px;
      box-shadow: var(--sh); position: relative; overflow: hidden;
      border: 1px solid var(--c-gray-100);
      display: flex; flex-direction: column; justify-content: space-between;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
    }

    .kpi-card--primary .kpi-deco { background: var(--c-teal-lt); }
    .kpi-card--warning .kpi-deco { background: var(--c-amber-lt); }
    .kpi-card--danger  .kpi-deco { background: var(--c-red-lt); }
    .kpi-card--success .kpi-deco { background: var(--c-green-lt); }
    .kpi-card--info    .kpi-deco { background: var(--c-blue-lt); }

    .kpi-card--primary { border-top: 3px solid var(--c-teal); }
    .kpi-card--warning { border-top: 3px solid var(--c-amber); }
    .kpi-card--danger  { border-top: 3px solid var(--c-red); }
    .kpi-card--success { border-top: 3px solid var(--c-green); }
    .kpi-card--info    { border-top: 3px solid var(--c-blue); }

    .kpi-deco {
      position: absolute; right: -16px; bottom: -16px;
      width: 72px; height: 72px; border-radius: 50%; pointer-events: none;
    }

    .kpi-left { display: flex; align-items: center; gap: 12px; z-index: 1; }

    .kpi-icon-wrap {
      width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      svg { display: block; }
    }

    .kpi-card--primary .kpi-icon-wrap { background: var(--c-teal-lt); color: var(--c-teal); }
    .kpi-card--warning .kpi-icon-wrap { background: var(--c-amber-lt); color: var(--c-amber); }
    .kpi-card--danger  .kpi-icon-wrap { background: var(--c-red-lt); color: var(--c-red); }
    .kpi-card--success .kpi-icon-wrap { background: var(--c-green-lt); color: var(--c-green); }
    .kpi-card--info    .kpi-icon-wrap { background: var(--c-blue-lt); color: var(--c-blue); }

    .kpi-val { font-size: 26px; font-weight: 900; color: var(--c-text); display: block; line-height: 1.1; }
    .kpi-lbl { font-size: 11px; color: var(--c-muted); font-weight: 500; margin-top: 2px; }

    .kpi-trend {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 20px;
      font-size: 11px; font-weight: 700; align-self: flex-start; margin-top: 10px;
      svg { display: block; }
      &.up   { background: var(--c-green-lt); color: var(--c-green); }
      &.down { background: var(--c-red-lt); color: var(--c-red); }
    }

    /* ── Loading ── */
    .page-loading {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 90px; gap: 18px; color: var(--c-muted);
    }

    .loading-ring {
      width: 48px; height: 48px;
      border: 4px solid var(--c-teal-lt);
      border-top-color: var(--c-accent);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }

    /* ── Charts Grid ── */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px; margin-bottom: 24px;
    }

    .chart-card {
      background: white; border-radius: var(--r-lg);
      border: 1px solid var(--c-gray-100);
      box-shadow: var(--sh); padding: 20px 22px;
      &.wide { grid-column: span 2; }
    }

    .chart-card-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; margin-bottom: 18px;
    }

    .chart-card-title { display: flex; align-items: center; gap: 12px; }

    .chart-card-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      svg { display: block; }

      &.teal   { background: var(--c-teal-lt); color: var(--c-teal); }
      &.blue   { background: var(--c-blue-lt); color: var(--c-blue); }
      &.orange { background: var(--c-orange-lt); color: var(--c-orange); }
      &.purple { background: var(--c-purple-lt); color: var(--c-purple); }
      &.green  { background: var(--c-green-lt); color: var(--c-green); }
    }

    .chart-card-title h3 { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0 0 2px; }
    .chart-card-title p  { font-size: 11.5px; color: var(--c-muted); margin: 0; }

    .chart-legend {
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    }

    .leg-item {
      display: flex; align-items: center; gap: 5px;
      font-size: 11.5px; color: var(--c-muted); white-space: nowrap;
    }

    .leg-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      &.teal  { background: var(--c-teal); }
      &.green { background: var(--c-green); }
      &.red   { background: var(--c-red); }
    }

    .chart-body { position: relative; canvas { max-height: 100%; } }

    /* ── Gauge ── */
    .gauge-card { display: flex; flex-direction: column; }

    .gauge-zone {
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      flex: 1;
    }

    .gauge-canvas-wrap {
      position: relative; width: 100%; max-width: 200px; height: 120px;
      canvas { max-height: 120px; }
    }

    .gauge-overlay {
      position: absolute; bottom: 0; left: 50%;
      transform: translateX(-50%); text-align: center;
    }

    .gauge-pct { font-size: 26px; font-weight: 900; color: var(--c-text); display: block; }
    .gauge-sub { font-size: 11px; color: var(--c-muted); font-weight: 500; }

    .gauge-stats {
      display: flex; align-items: center; gap: 0;
      width: 100%; background: var(--c-gray-50);
      border-radius: var(--r); padding: 10px 0;
    }

    .gs-item { flex: 1; text-align: center; }
    .gs-sep  { width: 1px; height: 28px; background: var(--c-gray-200); }

    .gs-val {
      font-size: 20px; font-weight: 800; display: block;
      &.green { color: var(--c-green); }
      &.amber { color: var(--c-amber); }
      &.teal  { color: var(--c-teal); }
    }

    .gs-lbl { font-size: 10.5px; color: var(--c-muted); font-weight: 500; }

    /* ── Section Card ── */
    .section-card {
      background: white; border-radius: var(--r-lg);
      border: 1px solid var(--c-gray-100); box-shadow: var(--sh); overflow: hidden;
    }

    .section-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px; border-bottom: 1px solid var(--c-gray-100);
    }

    .section-card-title { display: flex; align-items: center; gap: 12px; }
    .section-card-title h3 { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0 0 2px; }
    .section-card-title p  { font-size: 11.5px; color: var(--c-muted); margin: 0; }

    .btn-outline-sm {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--r);
      background: white; border: 1.5px solid var(--c-gray-200);
      color: var(--c-muted); font-size: 12.5px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
      svg { display: block; }
      &:hover { border-color: var(--c-accent); color: var(--c-primary); }
    }

    /* ── Data Table ── */
    .table-wrap { overflow-x: auto; }

    .data-table { width: 100%; border-collapse: collapse; }

    .data-table thead tr { background: var(--c-gray-50); }

    .data-table th {
      padding: 11px 16px; font-size: 11px; font-weight: 700;
      color: var(--c-muted); text-align: left;
      text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid var(--c-gray-100);
    }

    .data-table td {
      padding: 13px 16px; font-size: 13px; color: var(--c-text);
      border-bottom: 1px solid var(--c-gray-50);
      transition: background 0.12s;
    }

    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover td { background: var(--c-gray-50); }

    .td-muted { color: var(--c-muted); font-size: 12.5px; }

    .user-cell { display: flex; align-items: center; gap: 10px; }

    .av {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--c-accent), var(--c-primary));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
    }

    .type-tag {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      background: var(--c-teal-lt); color: var(--c-teal);
      font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    }

    .badge-ok {
      display: inline-block; padding: 3px 9px; border-radius: 20px;
      background: var(--c-green-lt); color: var(--c-green);
      font-size: 11px; font-weight: 600;
    }

    .badge-na {
      display: inline-block; padding: 3px 9px; border-radius: 20px;
      background: var(--c-gray-100); color: var(--c-muted);
      font-size: 11px; font-weight: 600;
    }

    .btn-attestation {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: var(--r);
      background: var(--c-teal-lt); color: var(--c-primary);
      border: 1px solid rgba(14,157,175,0.2);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      svg { display: block; }
      &:hover { background: var(--c-accent); color: white; }
    }

    /* ── Empty ── */
    .empty-row {
      padding: 48px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }

    .empty-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--c-gray-100); color: var(--c-muted);
      display: flex; align-items: center; justify-content: center;
      svg { display: block; }
    }

    .empty-row p { font-size: 13.5px; color: var(--c-muted); margin: 0; }

    /* ── Spinner ── */
    .spinner {
      width: 16px; height: 16px; display: inline-block;
      border: 2.5px solid rgba(255,255,255,0.35);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .fade-in {
      animation: fadeUp 0.24s ease both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(7px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {

  @ViewChild('barChart')   barChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart')  lineChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart')   pieChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gaugeChart') gaugeChartRef!: ElementRef<HTMLCanvasElement>;

  private analyticsService = inject(AnalyticsService);
  private pdfService       = inject(PdfService);
  private authService      = inject(AuthService);

  Math = Math;
  ic   = IC;   // expose SVG map to template

  loading       = signal(true);
  exportLoading = signal(false);

  selectedMois  = new Date().getMonth() + 1;
  selectedAnnee = new Date().getFullYear();

  allData         = signal<any>(null);
  rapportData     = signal<any>(null);
  sortiesValidees = signal<any[]>([]);

  kpis          = signal<any[]>([]);
  tauxPresence  = signal(0);
  joursPresents = signal(0);
  joursAbsents  = signal(0);
  totalJours    = signal(0);

  private charts: Chart[] = [];

  moisList = [
    { value:  1, label: 'Janvier'   }, { value:  2, label: 'Février'   },
    { value:  3, label: 'Mars'      }, { value:  4, label: 'Avril'     },
    { value:  5, label: 'Mai'       }, { value:  6, label: 'Juin'      },
    { value:  7, label: 'Juillet'   }, { value:  8, label: 'Août'      },
    { value:  9, label: 'Septembre' }, { value: 10, label: 'Octobre'   },
    { value: 11, label: 'Novembre'  }, { value: 12, label: 'Décembre'  }
  ];

  anneeList = [2024, 2025, 2026];

  ngOnInit():      void { this.loadData(); }
  ngAfterViewInit(): void { }

  // ─── Data ────────────────────────────────────────────────────────────────
  loadData(): void {
    this.loading.set(true);
    this.destroyCharts();

    this.analyticsService.getAnalyticsRH().subscribe({
      next: (data) => {
        this.allData.set(data);
        this.computeKPIs(data);
        this.computePresence(data);
        this.sortiesValidees.set(
          (data.sorties || []).filter((s: any) => s.statut === 'VALIDEE')
        );
        this.loading.set(false);
        setTimeout(() => this.buildCharts(data), 100);
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

  // ─── KPIs ────────────────────────────────────────────────────────────────
  private computeKPIs(data: any): void {
    const conges       = data.conges       ?? [];
    const reclamations = data.reclamations ?? [];
    const avances      = data.avances      ?? [];
    const sorties      = data.sorties      ?? [];
    const employes     = data.employes     ?? [];

    this.kpis.set([
      { iconSvg: IC.users,    label: 'Total employés',      value: employes.length, color: 'primary' },
      {
        iconSvg: IC.calendar, label: 'Congés en cours',
        value: conges.filter((c: any) => c.statut === 'EN_ATTENTE_MANAGER' || c.statut === 'EN_ATTENTE_RH').length,
        color: 'warning'
      },
      {
        iconSvg: IC.chat,     label: 'Réclamations actives',
        value: reclamations.filter((r: any) => r.statut === 'NOUVELLE' || r.statut === 'EN_COURS').length,
        color: 'danger'
      },
      {
        iconSvg: IC.banknote, label: 'Avances en cours',
        value: avances.filter((a: any) => a.statut === 'EN_COURS').length,
        color: 'success'
      },
      {
        iconSvg: IC.exit,     label: 'Sorties ce mois',
        value: sorties.filter((s: any) => {
          if (!s.dateSortie) return false;
          const d = new Date(s.dateSortie);
          return d.getMonth() + 1 === new Date().getMonth() + 1 &&
                 d.getFullYear()   === new Date().getFullYear();
        }).length,
        color: 'info'
      }
    ]);
  }

  private computePresence(data: any): void {
    const employes = data.employes ?? [];
    const conges   = data.conges   ?? [];
    const total    = Math.max(employes.length, 1);
    const absents  = conges.filter((c: any) => {
      if (c.statut !== 'VALIDEE') return false;
      const today = new Date(), debut = new Date(c.dateDebut), fin = new Date(c.dateFin);
      return debut <= today && fin >= today;
    }).length;
    const presents = Math.max(total - absents, 0);
    this.totalJours.set(total);
    this.joursAbsents.set(absents);
    this.joursPresents.set(presents);
    this.tauxPresence.set(Math.round((presents / total) * 100));
  }

  // ─── Charts ──────────────────────────────────────────────────────────────
  private buildCharts(data: any): void {
    this.buildBarChart(data.conges ?? []);
    this.buildLineChart(data.conges ?? []);
    this.buildPieChart(data.reclamations ?? []);
    this.buildDonutChart(data.avances ?? []);
    this.buildGaugeChart();
  }

  private tooltipDefaults = {
    backgroundColor: '#1a202c',
    padding: 12,
    cornerRadius: 8,
    titleFont: { size: 12 },
    bodyFont:  { size: 12 }
  };

  private buildBarChart(conges: any[]): void {
    if (!this.barChartRef) return;
    const labels  = this.getLast6Months();
    const total   = labels.map(l => this.countByMonth(conges, l));
    const valides = labels.map(l => this.countByMonth(conges.filter((c: any) => c.statut === 'VALIDEE'), l));
    const rejetes = labels.map(l => this.countByMonth(conges.filter((c: any) => c.statut === 'REJETEE'), l));

    this.charts.push(new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.label),
        datasets: [
          { label: 'Total', data: total,   backgroundColor: 'rgba(14,157,175,0.75)', borderColor: '#0e9daf', borderWidth: 0, borderRadius: 6 },
          { label: 'Validées', data: valides, backgroundColor: 'rgba(56,161,105,0.75)', borderColor: '#38a169', borderWidth: 0, borderRadius: 6 },
          { label: 'Rejetées', data: rejetes, backgroundColor: 'rgba(229,62,62,0.75)',  borderColor: '#e53e3e', borderWidth: 0, borderRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: this.tooltipDefaults },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } }
        }
      }
    }));
  }

  private buildLineChart(conges: any[]): void {
    if (!this.lineChartRef) return;
    const labels     = this.getLast6Months();
    const total      = labels.map(l => this.countByMonth(conges, l));
    const sortiesAll = this.allData()?.sorties ?? [];
    const sortiesD   = labels.map(l => this.countByMonth(sortiesAll, l, 'dateSortie'));

    this.charts.push(new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels.map(l => l.label),
        datasets: [
          { label: 'Congés',  data: total,    borderColor: '#0e9daf', backgroundColor: 'rgba(14,157,175,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#0e9daf', pointRadius: 5, pointHoverRadius: 7 },
          { label: 'Sorties', data: sortiesD, borderColor: '#805ad5', backgroundColor: 'rgba(128,90,213,0.07)', tension: 0.4, fill: true, pointBackgroundColor: '#805ad5', pointRadius: 5, pointHoverRadius: 7 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 } } }, tooltip: this.tooltipDefaults },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: '#718096', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { ticks: { color: '#718096', font: { size: 11 } }, grid: { display: false } }
        }
      }
    }));
  }

  private buildPieChart(reclamations: any[]): void {
    if (!this.pieChartRef) return;
    const types: Record<string, number> = {};
    reclamations.forEach((r: any) => { types[r.typeReclamation] = (types[r.typeReclamation] || 0) + 1; });
    if (!Object.keys(types).length) types['Aucune'] = 1;
    const labels = Object.keys(types), values = Object.values(types);

    this.charts.push(new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: labels.map(l => this.getTypeLabel(l)),
        datasets: [{ data: values, backgroundColor: ['#0e9daf','#805ad5','#38a169','#d69e2e','#e53e3e','#3182ce'], borderColor: 'white', borderWidth: 3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 12 } },
          tooltip: { ...this.tooltipDefaults, callbacks: { label: (ctx) => { const t = values.reduce((a, b) => a + b, 0); return ` ${ctx.label}: ${ctx.parsed} (${Math.round((ctx.parsed / t) * 100)}%)`; } } }
        }
      }
    }));
  }

  private buildDonutChart(avances: any[]): void {
    if (!this.donutChartRef) return;
    const statuts: Record<string, number> = {};
    avances.forEach((a: any) => { statuts[a.statut] = (statuts[a.statut] || 0) + 1; });
    if (!Object.keys(statuts).length) statuts['Aucune donnée'] = 1;
    const colorMap: Record<string, string> = {
      EN_ATTENTE_MANAGER: '#d69e2e', EN_ATTENTE_RH: '#ecc94b', VALIDEE: '#38a169',
      EN_COURS: '#0e9daf', SOLDEE: '#805ad5', REJETEE: '#e53e3e', ANNULEE: '#cbd5e0', 'Aucune donnée': '#e2e8f0'
    };
    const labels = Object.keys(statuts), values = Object.values(statuts);

    this.charts.push(new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: labels.map(l => colorMap[l] ?? '#cbd5e0'), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, font: { size: 11 }, padding: 10 } },
          tooltip: this.tooltipDefaults
        }
      }
    }));
  }

  private buildGaugeChart(): void {
    if (!this.gaugeChartRef) return;
    const taux = this.tauxPresence();
    this.charts.push(new Chart(this.gaugeChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [taux, 100 - taux],
          backgroundColor: ['#0e9daf', '#eef0f3'],
          borderWidth: 0, circumference: 180, rotation: 270, hoverOffset: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    }));
  }

  // ─── Exports ──────────────────────────────────────────────────────────────
  exportRapportPDF(): void {
    this.exportLoading.set(true);
    this.analyticsService.getRapportMensuel(this.selectedAnnee, this.selectedMois).subscribe({
      next: (data) => { this.pdfService.exportRapportMensuel(data, this.selectedAnnee, this.selectedMois); this.exportLoading.set(false); },
      error: () => this.exportLoading.set(false)
    });
  }

  exportSortiePDF(sortie: any): void { this.pdfService.exportAttestationSortie(sortie); }
  exportAllSortiesPDF(): void { this.sortiesValidees().forEach(s => this.pdfService.exportAttestationSortie(s)); }

  // ─── Helpers ──────────────────────────────────────────────────────────────
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

  private getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      SALAIRE: 'Salaire', CONDITIONS_TRAVAIL: 'Conditions',
      MATERIEL_EQUIPEMENT: 'Matériel', RELATIONS_PROFESSIONNELLES: 'Relations', AUTRE: 'Autre'
    };
    return map[type] ?? type;
  }

  getMoisLabel(): string { return this.moisList.find(m => m.value === this.selectedMois)?.label ?? ''; }
  getInitiales(s: any): string { return ((s.employePrenom?.[0] ?? '') + (s.employeNom?.[0] ?? '')).toUpperCase(); }
  private destroyCharts(): void { this.charts.forEach(c => c.destroy()); this.charts = []; }
}