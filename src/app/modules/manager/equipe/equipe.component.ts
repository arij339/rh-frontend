import { environment } from '../../../../environments/environment';
// src/app/modules/manager/equipe/equipe.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="equipe-root">

    <!-- ──────────────── HEADER ──────────────── -->
    <header class="page-header">
      <div class="ph-brand">
        <div class="ph-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="ph-titles">
          <span class="ph-eyebrow">Gestion RH</span>
          <h1 class="ph-heading">Mon Équipe</h1>
        </div>
      </div>
      <div class="ph-meta">
        <div class="ph-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {{ today | date:'EEEE d MMMM yyyy' : '' : 'fr' }}
        </div>
        <button class="btn-refresh" (click)="loadData()" [disabled]="loading()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               [class.spinning]="loading()">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Actualiser
        </button>
      </div>
    </header>

    <!-- ──────────────── KPI ROW ──────────────── -->
    <section class="kpi-row">

      <div class="kpi-card kpi-total">
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-number">{{ equipe().length }}</span>
          <span class="kpi-desc">Total membres</span>
        </div>
        <div class="kpi-trend up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </div>
      </div>

      <div class="kpi-card kpi-present">
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-number">{{ presents() }}</span>
          <span class="kpi-desc">Présents aujourd'hui</span>
        </div>
        <div class="kpi-sparkbar">
          <div class="spark-fill"
               [style.width.%]="equipe().length ? (presents() / equipe().length * 100) : 0">
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-absent">
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-number">{{ absents() }}</span>
          <span class="kpi-desc">En congé</span>
        </div>
        <div class="kpi-sparkbar absent">
          <div class="spark-fill"
               [style.width.%]="equipe().length ? (absents() / equipe().length * 100) : 0">
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-pending">
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-number">{{ enAttente() }}</span>
          <span class="kpi-desc">En attente</span>
        </div>
        <div class="kpi-badge" *ngIf="enAttente() > 0">Action requise</div>
      </div>

    </section>

    <!-- ──────────────── FILTRES ──────────────── -->
    <div class="toolbar">
      <div class="search-wrap" [class.active]="searchTerm">
        <svg class="search-ico" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="search-input"
               placeholder="Rechercher un membre, poste, email…"
               [(ngModel)]="searchTerm"
               (input)="onSearch()" />
        <button class="search-clear"
                *ngIf="searchTerm"
                (click)="searchTerm = ''; onSearch()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="select-wrap">
        <svg class="select-ico" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <select [(ngModel)]="deptFilter" (change)="onSearch()">
          <option value="">Tous les départements</option>
          <option *ngFor="let d of getDepts()" [value]="d">{{ d }}</option>
        </select>
        <svg class="select-arrow" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" width="14" height="14">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div class="result-count" *ngIf="!loading()">
        <strong>{{ filtered().length }}</strong> / {{ equipe().length }} membres
      </div>
    </div>

    <!-- ──────────────── LOADING ──────────────── -->
    <div class="loading-pane" *ngIf="loading()">
      <div class="loader-ring">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none"
                  stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="loader-text">Chargement de votre équipe…</p>
    </div>

    <!-- ──────────────── GRILLE ──────────────── -->
    <div class="membre-grid" *ngIf="!loading()">

      <article class="membre-card"
               *ngFor="let m of filtered(); let i = index"
               [style.animation-delay.ms]="i * 60">

        <!-- Bande de statut -->
        <div class="mc-ribbon"
             [class.ribbon-present]="!isAbsent(m.id)"
             [class.ribbon-absent]="isAbsent(m.id)">
        </div>

        <!-- Haut : avatar + badge -->
        <div class="mc-top">
          <div class="mc-avatar-wrap">
            <div class="mc-avatar">{{ getInit(m) }}</div>
            <span class="mc-pulse"
                  [class.pulse-on]="!isAbsent(m.id)">
            </span>
          </div>
          <div class="mc-badge"
               [class.badge-ok]="!isAbsent(m.id)"
               [class.badge-off]="isAbsent(m.id)">
            <svg *ngIf="!isAbsent(m.id)" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" width="10" height="10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg *ngIf="isAbsent(m.id)" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" width="10" height="10">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {{ isAbsent(m.id) ? 'En congé' : 'Présent' }}
          </div>
        </div>

        <!-- Identité -->
        <div class="mc-identity">
          <h3 class="mc-name">{{ m.prenom }} {{ m.nom }}</h3>
          <p class="mc-poste">{{ m.poste || 'Poste non défini' }}</p>
        </div>

        <!-- Infos supplémentaires -->
        <ul class="mc-infos">
          <li *ngIf="m.departement">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            {{ m.departement }}
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1
                       0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {{ m.email || m.userEmail || '—' }}
          </li>
          <li *ngIf="m.dateEmbauche">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Depuis {{ getAnciennete(m.dateEmbauche) }}
          </li>
        </ul>

        <!-- Métriques pied -->
        <div class="mc-metrics">
          <div class="mc-metric" [class.metric-danger]="(m.soldeCongesRestant ?? 0) < 3">
            <span class="metric-val">{{ m.soldeCongesRestant != null ? m.soldeCongesRestant : '0' }}</span>
            <span class="metric-lbl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" width="11" height="11">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Solde congés
            </span>
          </div>
          <div class="mc-divider"></div>
          <div class="mc-metric" [class.metric-pending]="(m.demandesEnAttente ?? 0) > 0">
            <span class="metric-val">{{ m.demandesEnAttente ?? 0 }}</span>
            <span class="metric-lbl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" width="11" height="11">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2
                         2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Demandes
            </span>
          </div>
        </div>

      </article>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="filtered().length === 0">
        <div class="es-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <p class="es-title">Aucun membre trouvé</p>
        <p class="es-sub" *ngIf="searchTerm">
          Aucun résultat pour <em>« {{ searchTerm }} »</em>
        </p>
        <button class="es-reset" (click)="searchTerm = ''; deptFilter = ''; onSearch()">
          Réinitialiser les filtres
        </button>
      </div>

    </div>
  </div>
  `,
  styles: [`
   /* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
:host {
  --c-bg        : #F7F8FC;
  --c-surface   : #FFFFFF;
  --c-border    : #EAECF3;
  --c-border-md : #D8DCEA;
  --c-primary   : #0B4A6F;
  --c-primary-2 : #0D6B9A;
  --c-accent    : #0EA5E9;
  --c-accent-2  : #38BDF8;
  --c-present   : #10B981;
  --c-absent    : #EF4444;
  --c-pending   : #F59E0B;
  --c-text-h    : #0F172A;
  --c-text-b    : #334155;
  --c-text-s    : #64748B;
  --c-text-xs   : #94A3B8;
  --radius      : 14px;
  --radius-sm   : 9px;
  --shadow-sm   : 0 1px 2px rgba(15,23,42,.05), 0 0 0 1px rgba(15,23,42,.04);
  --shadow-md   : 0 4px 20px rgba(15,23,42,.09);
  --shadow-lg   : 0 12px 36px rgba(15,23,42,.12);
  --font        : 'DM Sans', system-ui, sans-serif;
  display: block;
  font-family: var(--font);
  background: var(--c-bg);
  min-height: 100vh;
  padding: 36px 32px;
  box-sizing: border-box;
}

.equipe-root {
  max-width: 1200px;
  margin: 0 auto;
  animation: pageFadeIn 0.5s ease both;
}

/* ── HEADER ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.ph-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ph-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: linear-gradient(145deg, var(--c-primary) 0%, var(--c-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(14,165,233,.28), 0 0 0 1px rgba(14,165,233,.15);
  color: white;
  flex-shrink: 0;
}
.ph-icon-wrap svg { width: 22px; height: 22px; }

.ph-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--c-accent);
  display: block;
  margin-bottom: 2px;
}
.ph-heading {
  font-size: 21px;
  font-weight: 800;
  color: var(--c-text-h);
  letter-spacing: -.025em;
  margin: 0;
}

.ph-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ph-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-s);
  background: var(--c-surface);
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text-b);
  transition: all .18s ease;
  font-family: var(--font);
  letter-spacing: .01em;
}
.btn-refresh svg { width: 13px; height: 13px; }
.btn-refresh:hover {
  background: var(--c-primary);
  color: white;
  border-color: var(--c-primary);
  box-shadow: 0 3px 10px rgba(11,74,111,.22);
}
.btn-refresh:disabled { opacity: .45; pointer-events: none; }
.spinning { animation: spin 0.7s linear infinite; }

/* ── KPI ROW ── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 26px;
}

.kpi-card {
  background: var(--c-surface);
  border-radius: var(--radius);
  padding: 18px 20px 20px;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
  transition: box-shadow .2s, transform .2s;
  animation: cardPop .4s ease both;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Trait coloré en haut */
.kpi-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.kpi-total::after   { background: var(--c-accent); }
.kpi-present::after { background: var(--c-present); }
.kpi-absent::after  { background: var(--c-absent); }
.kpi-pending::after { background: var(--c-pending); }

.kpi-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-total   .kpi-icon-box { background: #E0F2FE; color: var(--c-accent); }
.kpi-present .kpi-icon-box { background: #D1FAE5; color: var(--c-present); }
.kpi-absent  .kpi-icon-box { background: #FEE2E2; color: var(--c-absent); }
.kpi-pending .kpi-icon-box { background: #FEF3C7; color: var(--c-pending); }
.kpi-icon-box svg { width: 20px; height: 20px; }

.kpi-body { flex: 1; }
.kpi-number {
  font-size: 30px;
  font-weight: 800;
  color: var(--c-text-h);
  letter-spacing: -.04em;
  display: block;
  line-height: 1;
}
.kpi-desc {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-s);
  display: block;
  margin-top: 5px;
  letter-spacing: .01em;
}

.kpi-trend {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-trend.up { background: #D1FAE5; color: var(--c-present); }

.kpi-sparkbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #F1F5F9;
}

.spark-fill {
  height: 100%;
  border-radius: 0 3px 3px 0;
  transition: width .7s cubic-bezier(.4,0,.2,1);
}
.kpi-present .spark-fill { background: var(--c-present); }
.kpi-absent  .spark-fill { background: var(--c-absent); }

.kpi-badge {
  position: absolute;
  top: 13px;
  right: 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  background: var(--c-pending);
  color: white;
  padding: 3px 8px;
  border-radius: 20px;
  animation: pulse 2s infinite;
}

/* ── TOOLBAR ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border-md);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  transition: border-color .2s, box-shadow .2s;
  height: 42px;
  box-sizing: border-box;
}
.search-wrap:focus-within,
.search-wrap.active {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(14,165,233,.10);
}
.search-ico { width: 15px; height: 15px; color: var(--c-text-xs); flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: var(--font);
  color: var(--c-text-b);
  background: transparent;
}
.search-input::placeholder { color: var(--c-text-xs); }
.search-clear {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--c-border);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-s);
  transition: background .15s, color .15s;
  flex-shrink: 0;
}
.search-clear:hover { background: var(--c-absent); color: white; }

.select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.select-ico {
  position: absolute;
  left: 12px;
  width: 14px;
  height: 14px;
  color: var(--c-text-xs);
  pointer-events: none;
}
.select-wrap select {
  padding: 10px 34px 10px 34px;
  border: 1px solid var(--c-border-md);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
  background: var(--c-surface);
  cursor: pointer;
  color: var(--c-text-b);
  appearance: none;
  transition: border-color .2s;
  height: 42px;
}
.select-wrap select:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(14,165,233,.10); }
.select-arrow {
  position: absolute;
  right: 10px;
  color: var(--c-text-xs);
  pointer-events: none;
}

.result-count {
  font-size: 12px;
  color: var(--c-text-s);
  white-space: nowrap;
  padding: 0 4px;
}
.result-count strong { color: var(--c-text-h); font-weight: 700; }

/* ── LOADING ── */
.loading-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}
.loader-ring {
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
}
.loader-ring svg {
  width: 100%;
  height: 100%;
  animation: spin .9s linear infinite;
}
.loader-ring circle {
  stroke: var(--c-accent);
  stroke-dasharray: 80;
  stroke-dashoffset: 60;
}
.loader-text {
  font-size: 13px;
  color: var(--c-text-s);
  margin: 0;
}

/* ── GRILLE MEMBRES ── */
.membre-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.membre-card {
  background: var(--c-surface);
  border-radius: var(--radius);
  padding: 22px 22px 18px;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
  transition: all .22s cubic-bezier(.4,0,.2,1);
  animation: cardSlide .4s ease both;
}
.membre-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--c-border-md);
}

/* Trait top coloré à la place de la ribbon latérale */
.mc-ribbon {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.ribbon-present { background: var(--c-present); }
.ribbon-absent  { background: var(--c-absent); }

/* Top */
.mc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.mc-avatar-wrap { position: relative; }

.mc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--c-primary) 0%, var(--c-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: white;
  letter-spacing: .03em;
  box-shadow: 0 2px 8px rgba(11,74,111,.22);
}

.mc-pulse {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--c-surface);
  background: var(--c-text-xs);
}
.mc-pulse.pulse-on {
  background: var(--c-present);
  animation: pulse 2.2s infinite;
}

.mc-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  letter-spacing: .01em;
}
.badge-ok  { background: #ECFDF5; color: #065F46; }
.badge-off { background: #FEF2F2; color: #991B1B; }

/* Identité */
.mc-identity { }
.mc-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text-h);
  margin: 0 0 3px;
  letter-spacing: -.015em;
}
.mc-poste {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-accent);
  margin: 0;
  letter-spacing: .01em;
}

/* Séparateur fin entre identity et infos */
.mc-infos {
  list-style: none;
  margin: 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.mc-infos li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--c-text-s);
  line-height: 1.3;
}
.mc-infos li svg {
  width: 12px;
  height: 12px;
  color: var(--c-text-xs);
  flex-shrink: 0;
}

/* Metrics */
.mc-metrics {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid var(--c-border);
  gap: 8px;
  margin-top: auto;
}
.mc-divider {
  width: 1px;
  height: 28px;
  background: var(--c-border);
}
.mc-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
}
.metric-val {
  font-size: 20px;
  font-weight: 800;
  color: var(--c-text-h);
  letter-spacing: -.03em;
  line-height: 1;
}
.mc-metric.metric-danger .metric-val { color: var(--c-absent); }
.mc-metric.metric-pending .metric-val { color: var(--c-pending); }

.metric-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--c-text-xs);
  text-transform: uppercase;
  letter-spacing: .07em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.metric-lbl svg { color: var(--c-text-xs); }

/* Empty state */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 0;
}
.es-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--c-text-xs);
}
.es-icon svg { width: 28px; height: 28px; }
.es-title { font-size: 15px; font-weight: 700; color: var(--c-text-h); margin: 0 0 6px; }
.es-sub   { font-size: 13px; color: var(--c-text-s); margin: 0 0 18px; }
.es-sub em { font-style: normal; font-weight: 600; color: var(--c-text-b); }
.es-reset {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid var(--c-border-md);
  background: var(--c-surface);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-b);
  cursor: pointer;
  transition: all .18s ease;
}
.es-reset:hover { background: var(--c-primary); color: white; border-color: var(--c-primary); }

/* ── RESPONSIVE ── */
@media (max-width: 1000px) {
  .kpi-row        { grid-template-columns: repeat(2, 1fr); }
  .membre-grid    { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  :host           { padding: 20px 16px; }
  .kpi-row        { grid-template-columns: repeat(2, 1fr); }
  .membre-grid    { grid-template-columns: 1fr; }
  .ph-heading     { font-size: 18px; }
  .ph-date        { display: none; }
}

/* ── KEYFRAMES ── */
@keyframes pageFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cardPop {
  from { opacity: 0; transform: scale(.97); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cardSlide {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
  50%       { box-shadow: 0 0 0 5px rgba(16,185,129,.0); }
}
  `]
})
export class EquipeComponent implements OnInit {

  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private API = environment.apiUrl + '/api';

  equipe    = signal<any[]>([]);
  conges    = signal<any[]>([]);
  loading   = signal(true);
  searchTerm = '';
  deptFilter = '';
  today      = new Date();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.http.get<any[]>(`${this.API}/manager/equipe`)
      .subscribe({
        next : (data) => { this.equipe.set(data ?? []); this.loading.set(false); },
        error: (err)  => { console.error('Erreur équipe:', err); this.loading.set(false); }
      });

    const today = new Date();
    const debut = new Date(today.getFullYear(), today.getMonth(), 1);
    const fin   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const debutStr = debut.toISOString().split('T')[0];
    const finStr   = fin.toISOString().split('T')[0];

    this.http.get<any[]>(
      `${this.API}/manager/conges/calendrier?debut=${debutStr}&fin=${finStr}`
    ).subscribe({
      next : (data) => this.conges.set(data ?? []),
      error: ()     => {}
    });
  }

  // ── Filtrage ──────────────────────────────────────
  filtered(): any[] {
    return this.equipe().filter(m => {
      const t    = this.searchTerm.toLowerCase();
      const d    = this.deptFilter;
      const text = !t
        || (m.nom    ?? '').toLowerCase().includes(t)
        || (m.prenom ?? '').toLowerCase().includes(t)
        || (m.poste  ?? '').toLowerCase().includes(t)
        || (m.email  ?? '').toLowerCase().includes(t);
      const dept = !d || m.departement === d;
      return text && dept;
    });
  }

  onSearch(): void {}

  getDepts(): string[] {
    return [...new Set(
      this.equipe().map(m => m.departement).filter(Boolean)
    )];
  }

  // ── Présence ──────────────────────────────────────
  isAbsent(membreId: number): boolean {
    const today = new Date();
    return this.conges().some(c => {
      if (c.statut    !== 'VALIDEE'  ) return false;
      if (c.employeId !== membreId   ) return false;
      const d = new Date(c.dateDebut);
      const f = new Date(c.dateFin  );
      return today >= d && today <= f;
    });
  }

  // ── KPIs ──────────────────────────────────────────
  presents (): number { return this.equipe().filter(m => !this.isAbsent(m.id)).length; }
  absents  (): number { return this.equipe().filter(m =>  this.isAbsent(m.id)).length; }
  enAttente(): number {
    return this.equipe().reduce((sum, m) => sum + (m.demandesEnAttente ?? 0), 0);
  }

  getDemandesCount(membreId: number): number {
    const m = this.equipe().find(e => e.id === membreId);
    return m?.demandesEnAttente ?? 0;
  }

  // ── Helpers ───────────────────────────────────────
  getInit(m: any): string {
    return ((m.prenom?.[0] ?? '') + (m.nom?.[0] ?? '')).toUpperCase();
  }

  getAnciennete(dateStr: string): string {
    if (!dateStr) return '—';
    const d      = new Date(dateStr);
    const now    = new Date();
    const months = (now.getFullYear() - d.getFullYear()) * 12
                 + (now.getMonth()    - d.getMonth()   );
    const years  = Math.floor(months / 12);
    const rem    = months % 12;
    if (years === 0) return `${rem} mois`;
    return `${years} an${years > 1 ? 's' : ''}${rem > 0 ? ` ${rem} mois` : ''}`;
  }
}


