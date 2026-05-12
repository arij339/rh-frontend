// src/app/modules/dashboard/rh-dashboard.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="rh-dash">

    <!-- ══════════ HERO ══════════ -->
    <div class="rh-hero">
      <div class="hero-left">
        <div class="hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.7"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="hero-text">
          <h1>Tableau de bord RH</h1>
          <p>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {{ today() | date:'EEEE d MMMM yyyy':'':'fr' }}
            &nbsp;·&nbsp; Bonjour {{ prenom() }}
          </p>
        </div>
      </div>
      <button class="btn-refresh" (click)="loadData()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Actualiser
      </button>
    </div>

    <!-- ══════════ KPIs ══════════ -->
    <div class="kpi-grid">

      <div class="kpi-card" style="--d:0ms" [routerLink]="'/employes'">
        <div class="kc-icon primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ kpis()[0]?.val ?? 0 }}</span>
          <span class="kc-label">Employés actifs</span>
        </div>
        <div class="kc-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>

      <div class="kpi-card" style="--d:70ms" [routerLink]="'/rh/validation'"
           [class.kc-alert]="(kpis()[1]?.val ?? 0) > 0">
        <div class="kc-icon" [class]="(kpis()[1]?.val ?? 0) > 0 ? 'warning' : 'success'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ kpis()[1]?.val ?? 0 }}</span>
          <span class="kc-label">Demandes en attente</span>
        </div>
        <div class="kc-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>

      <div class="kpi-card" style="--d:140ms" [routerLink]="'/rh/conges'">
        <div class="kc-icon info">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ kpis()[2]?.val ?? 0 }}</span>
          <span class="kc-label">En congé aujourd'hui</span>
        </div>
        <div class="kc-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>

      <div class="kpi-card" style="--d:210ms" [routerLink]="'/rh/reclamations'"
           [class.kc-alert]="(kpis()[3]?.val ?? 0) > 0">
        <div class="kc-icon" [class]="(kpis()[3]?.val ?? 0) > 0 ? 'danger' : 'success'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14
                     a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ kpis()[3]?.val ?? 0 }}</span>
          <span class="kc-label">Réclamations ouvertes</span>
        </div>
        <div class="kc-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>

    </div>

    <!-- ══════════ 3 COLONNES ══════════ -->
    <div class="dash-row">

      <!-- Demandes en attente -->
      <div class="dash-card" style="--d:80ms">
        <div class="dc-header">
          <div class="dc-title">
            <div class="dc-title-icon warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            Demandes en attente
          </div>
          <a routerLink="/rh/validation" class="dc-link">
            Traiter
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
        <div class="demandes-summary">
          <div class="ds-item" *ngFor="let d of demandesSummary(); let i = index"
               [style.animation-delay]="(100 + i*60) + 'ms'">
            <div class="dsi-icon-wrap">
              <!-- Congés -->
              <svg *ngIf="d.type === 'conges'" width="15" height="15"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <!-- Avances -->
              <svg *ngIf="d.type === 'avances'" width="15" height="15"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <!-- Augmentations -->
              <svg *ngIf="d.type === 'augmentations'" width="15" height="15"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <!-- Autorisations -->
              <svg *ngIf="d.type === 'autorisations'" width="15" height="15"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span class="dsi-label">{{ d.label }}</span>
            <span class="dsi-count" [class.urgent]="d.count > 5">
              {{ d.count }}
            </span>
          </div>
        </div>
      </div>

      <!-- Congés ce mois -->
      <div class="dash-card" style="--d:150ms">
        <div class="dc-header">
          <div class="dc-title">
            <div class="dc-title-icon primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            Congés ce mois
          </div>
          <a routerLink="/rh/conges" class="dc-link">
            Gérer
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
        <div class="conges-stats">
          <div class="cs-bar" *ngFor="let s of congesStats(); let i = index"
               [style.animation-delay]="(120 + i*70) + 'ms'">
            <div class="cs-label">{{ s.label }}</div>
            <div class="cs-track">
              <div class="cs-fill" [class]="s.color"
                   [style.width]="s.pct + '%'"></div>
            </div>
            <span class="cs-val">{{ s.count }}</span>
          </div>
        </div>
        <div class="conges-total">
          <span>Total ce mois</span>
          <strong>{{ totalCongesMois() }}</strong>
        </div>
      </div>

      <!-- Réclamations récentes -->
      <div class="dash-card" style="--d:220ms">
        <div class="dc-header">
          <div class="dc-title">
            <div class="dc-title-icon danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1
                         2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            Réclamations
          </div>
          <a routerLink="/rh/reclamations" class="dc-link">
            Voir tout
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
        <div class="reclam-list">
          <div class="rl-item"
               *ngFor="let r of reclamationsRecentes().slice(0,5); let i = index"
               [style.animation-delay]="(120 + i*55) + 'ms'">
            <div class="rli-dot" [class]="getUrgenceClass(r.urgence)"></div>
            <div class="rli-body">
              <span class="rli-objet">{{ r.objet }}</span>
              <small>{{ r.type }}</small>
            </div>
            <div class="rli-statut" [class]="getStatutClass(r.statut)">
              <div class="rls-dot"></div>
              {{ r.statut }}
            </div>
          </div>
          <div class="empty-mini" *ngIf="reclamationsRecentes().length === 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Aucune réclamation en attente
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════ ACCÈS RAPIDE ══════════ -->
    <div class="shortcuts">
      <div class="sc-heading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Accès rapide
      </div>
      <div class="sc-grid">

        <a routerLink="/employes" class="sc-card" style="--d:0ms">
          <div class="sc-icon primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="sc-text">
            <strong>Gestion des Employés</strong>
            <p>Créer et gérer les profils</p>
          </div>
          <div class="sc-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>

        <a routerLink="/rh/validation" class="sc-card"
           [class.sc-alert]="totalEnAttente() > 0"
           style="--d:70ms">
          <div class="sc-icon" [class]="totalEnAttente() > 0 ? 'warning' : 'success'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="sc-text">
            <strong>Validation des Demandes</strong>
            <p [class.alert-text]="totalEnAttente() > 0">
              {{ totalEnAttente() > 0
                 ? totalEnAttente() + ' demande(s) à traiter'
                 : 'Aucune demande en attente' }}
            </p>
          </div>
          <div class="sc-badge" *ngIf="totalEnAttente() > 0">
            {{ totalEnAttente() }}
          </div>
          <div class="sc-arrow" *ngIf="totalEnAttente() === 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>

        <a routerLink="/rh/conges" class="sc-card" style="--d:140ms">
          <div class="sc-icon info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="sc-text">
            <strong>Gestion des Congés</strong>
            <p>Soldes, historique, calendrier</p>
          </div>
          <div class="sc-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>

        <a routerLink="/rh/reclamations" class="sc-card" style="--d:210ms">
          <div class="sc-icon danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1
                       2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="sc-text">
            <strong>Réclamations</strong>
            <p>Tickets ouverts et traitement</p>
          </div>
          <div class="sc-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>

      </div>
    </div>

  </div>
  `,
  styles: [`
    :host {
      --primary:      #0B6E7E;
      --primary-dark: #074F5C;
      --secondary:    #14B8C4;
      --accent:       #E8F7F9;
      --success:      #059669;
      --success-bg:   #D1FAE5;
      --warning:      #D97706;
      --warning-bg:   #FEF3C7;
      --info:         #2563EB;
      --info-bg:      #DBEAFE;
      --danger:       #DC2626;
      --danger-bg:    #FEE2E2;
      --gray-light:   #F4F7F8;
      --gray-mid:     #E2EAEC;
      --text:         #1A2E35;
      --text-light:   #64838A;
      --white:        #FFFFFF;
      --transition:   0.22s cubic-bezier(0.4, 0, 0.2, 1);
      --shadow-sm:    0 2px 8px rgba(11,110,126,0.08);
      --shadow-md:    0 6px 24px rgba(11,110,126,0.13);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes barGrow {
      from { width: 0 !important; }
    }
    @keyframes rowSlide {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Base ── */
    .rh-dash {
      max-width: 1200px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: var(--text);
      animation: fadeIn 0.3s ease;
    }

    /* ── Hero ── */
    .rh-hero {
      background: linear-gradient(135deg, #062F38 0%, #0B6E7E 55%, #14B8C4 100%);
      border-radius: 20px; padding: 24px 30px;
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
      box-shadow: 0 8px 32px rgba(11,110,126,0.22);
      animation: slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
      position: relative; overflow: hidden;
      &::after {
        content: '';
        position: absolute; top: -40%; right: -5%;
        width: 300px; height: 300px; border-radius: 50%;
        background: rgba(255,255,255,0.04);
        pointer-events: none;
      }
    }
    .hero-left { display: flex; align-items: center; gap: 16px; }
    .hero-icon {
      width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      color: white;
    }
    .hero-text h1 {
      font-size: 21px; font-weight: 800; color: white;
      letter-spacing: -0.3px; margin-bottom: 4px;
    }
    .hero-text p {
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: rgba(255,255,255,0.65);
      svg { opacity: 0.7; flex-shrink: 0; }
    }
    .btn-refresh {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px;
      border: 1.5px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(8px);
      color: white; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 700;
      transition: all var(--transition);
      &:hover { background: rgba(255,255,255,0.22); }
      &:active svg { animation: spin 0.6s linear; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── KPIs ── */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 22px;
    }
    .kpi-card {
      background: var(--white); border-radius: 16px;
      padding: 18px 20px; box-shadow: var(--shadow-sm);
      display: flex; align-items: center; gap: 14px;
      border: 1.5px solid transparent;
      cursor: pointer; text-decoration: none; color: inherit;
      animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1)
                 calc(var(--d, 0ms)) both;
      transition: transform var(--transition),
                  box-shadow var(--transition),
                  border-color var(--transition);
      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--gray-mid);
        .kc-arrow { opacity: 1; transform: translateX(0); }
      }
      &.kc-alert { border-color: var(--warning-bg); }
    }
    .kc-icon {
      width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      &.primary { background: var(--accent);     color: var(--primary); }
      &.success { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.danger  { background: var(--danger-bg);  color: var(--danger); }
      &.info    { background: var(--info-bg);    color: var(--info); }
    }
    .kc-body { flex: 1; min-width: 0; }
    .kc-val {
      display: block; font-size: 26px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.6px; line-height: 1.1;
    }
    .kc-label { font-size: 11.5px; color: var(--text-light); font-weight: 500; }
    .kc-arrow {
      color: var(--primary); opacity: 0;
      transform: translateX(-4px);
      transition: all var(--transition); flex-shrink: 0;
    }

    /* ── 3 colonnes ── */
    .dash-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 18px; margin-bottom: 26px;
    }
    .dash-card {
      background: var(--white); border-radius: 16px; padding: 20px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-mid);
      animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1)
                 calc(var(--d, 0ms)) both;
    }
    .dc-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 16px;
    }
    .dc-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 800; color: var(--primary-dark);
    }
    .dc-title-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      &.primary { background: var(--accent);     color: var(--primary); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.danger  { background: var(--danger-bg);  color: var(--danger); }
    }
    .dc-link {
      display: flex; align-items: center; gap: 5px;
      color: var(--primary); font-size: 12px; font-weight: 700;
      text-decoration: none; transition: gap var(--transition);
      &:hover { gap: 8px; }
    }

    /* Demandes summary */
    .demandes-summary { display: flex; flex-direction: column; gap: 7px; }
    .ds-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 11px; background: var(--gray-light);
      border-radius: 10px; transition: background var(--transition);
      animation: rowSlide 0.35s cubic-bezier(0.4,0,0.2,1) both;
      cursor: default;
      &:hover { background: var(--accent); }
    }
    .dsi-icon-wrap {
      width: 28px; height: 28px; border-radius: 8px;
      background: var(--white); border: 1px solid var(--gray-mid);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light); flex-shrink: 0;
    }
    .dsi-label { flex: 1; font-size: 12.5px; font-weight: 600; color: var(--text); }
    .dsi-count {
      font-size: 14px; font-weight: 800; color: var(--primary-dark);
      min-width: 28px; height: 28px; border-radius: 50%;
      background: var(--white); border: 1.5px solid var(--gray-mid);
      display: flex; align-items: center; justify-content: center;
      &.urgent { background: var(--danger); color: white; border-color: var(--danger); }
    }

    /* Congés stats */
    .conges-stats { display: flex; flex-direction: column; gap: 11px; margin-bottom: 14px; }
    .cs-bar {
      display: flex; align-items: center; gap: 9px;
      animation: rowSlide 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }
    .cs-label { font-size: 12px; color: var(--text-light); min-width: 72px; font-weight: 500; }
    .cs-track {
      flex: 1; height: 7px; background: var(--gray-mid);
      border-radius: 4px; overflow: hidden;
    }
    .cs-fill {
      height: 100%; border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
      animation: barGrow 0.8s cubic-bezier(0.4,0,0.2,1) both;
      &.primary { background: linear-gradient(90deg, var(--primary), var(--secondary)); }
      &.warning { background: var(--warning); }
      &.danger  { background: var(--danger); }
      &.success { background: var(--success); }
    }
    .cs-val { font-size: 12px; font-weight: 800; color: var(--text); min-width: 18px; text-align: right; }
    .conges-total {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 12px; border-top: 1px solid var(--gray-mid);
      font-size: 12px; color: var(--text-light);
      strong { color: var(--primary-dark); font-size: 16px; font-weight: 800; }
    }

    /* Réclamations */
    .reclam-list { display: flex; flex-direction: column; gap: 0; }
    .rl-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 0; border-bottom: 1px solid var(--gray-light);
      animation: rowSlide 0.35s cubic-bezier(0.4,0,0.2,1) both;
      &:last-child { border-bottom: none; }
    }
    .rli-dot {
      width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
      &.haute   { background: var(--danger); }
      &.moyenne { background: var(--warning); }
      &.basse   { background: var(--success); }
    }
    .rli-body { flex: 1; min-width: 0; }
    .rli-objet {
      display: block; font-size: 12.5px; font-weight: 600;
      color: var(--text); white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis;
    }
    small { font-size: 10.5px; color: var(--text-light); }
    .rli-statut {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 6px; white-space: nowrap;
      .rls-dot { width: 5px; height: 5px; border-radius: 50%; }
      &.nouvelle {
        background: var(--info-bg); color: var(--info);
        .rls-dot { background: var(--info); }
      }
      &.en_cours {
        background: var(--warning-bg); color: var(--warning);
        .rls-dot { background: var(--warning); }
      }
      &.resolue {
        background: var(--success-bg); color: var(--success);
        .rls-dot { background: var(--success); }
      }
    }
    .empty-mini {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 14px; background: var(--success-bg);
      border-radius: 10px; font-size: 12.5px;
      font-weight: 600; color: var(--success);
    }

    /* Raccourcis */
    .shortcuts { }
    .sc-heading {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 800; color: var(--primary-dark);
      margin-bottom: 14px;
    }
    .sc-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
    }
    .sc-card {
      display: flex; align-items: center; gap: 13px;
      background: var(--white); border-radius: 16px; padding: 16px 18px;
      text-decoration: none; color: inherit;
      box-shadow: var(--shadow-sm);
      border: 1.5px solid transparent;
      animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1)
                 calc(var(--d, 0ms)) both;
      transition: transform var(--transition),
                  box-shadow var(--transition),
                  border-color var(--transition);
      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--secondary);
        .sc-arrow { opacity: 1; transform: translateX(0); }
      }
      &.sc-alert { border-color: var(--warning-bg); background: #FFFDF0; }
    }
    .sc-icon {
      width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      &.primary { background: var(--accent);     color: var(--primary); }
      &.success { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.danger  { background: var(--danger-bg);  color: var(--danger); }
      &.info    { background: var(--info-bg);    color: var(--info); }
    }
    .sc-text { flex: 1; min-width: 0; }
    .sc-text strong {
      display: block; font-size: 12.5px; font-weight: 700;
      color: var(--text); margin-bottom: 3px;
    }
    .sc-text p { font-size: 11px; color: var(--text-light); margin: 0; }
    .alert-text { color: var(--warning) !important; font-weight: 600 !important; }
    .sc-arrow {
      color: var(--primary); opacity: 0;
      transform: translateX(-4px); flex-shrink: 0;
      transition: all var(--transition);
    }
    .sc-badge {
      min-width: 24px; height: 24px; border-radius: 12px; flex-shrink: 0;
      background: var(--warning); color: white;
      font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      padding: 0 6px;
    }

    @media (max-width: 1000px) {
      .kpi-grid  { grid-template-columns: repeat(2, 1fr); }
      .dash-row  { grid-template-columns: 1fr; }
      .sc-grid   { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class RhDashboardComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = '/api';

  prenom = signal('');
  kpis   = signal<any[]>([]);
  demandesSummary      = signal<any[]>([]);
  congesStats          = signal<any[]>([]);
  reclamationsRecentes = signal<any[]>([]);
  congesMois           = signal<any[]>([]);

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('rh_user') ?? '{}');
    this.prenom.set(user?.prenom ?? '');
    this.loadData();
  }

  // APRÈS — URL corrigée + chaque requête isolée avec catchError


loadData(): void {
  forkJoin({
    employes:      this.http.get<any[]>(`${this.API}/rh/employes`)
                       .pipe(catchError(() => of([]))),
    conges:        this.http.get<any[]>(`${this.API}/rh/conges`)
                       .pipe(catchError(() => of([]))),
    reclamations:  this.http.get<any[]>(`${this.API}/rh/reclamations`)
                       .pipe(catchError(() => of([]))),
    avances:       this.http.get<any[]>(`${this.API}/rh/avances`)
                       .pipe(catchError(() => of([]))),
    augmentations: this.http.get<any[]>(`${this.API}/rh/augmentations`)
                       .pipe(catchError(() => of([]))),
    autorisations: this.http.get<any[]>(`${this.API}/rh/sorties`)  // ✅ URL corrigée
                       .pipe(catchError(() => of([])))
  }).subscribe({
    next: (d) => {
      this.buildKpis(d);
      this.buildDemandesSummary(d);
      this.buildCongesStats(d.conges);
      this.reclamationsRecentes.set(
        (d.reclamations ?? [])
          .filter((r: any) => r.statut === 'NOUVELLE' || r.statut === 'EN_COURS')
          .slice(0, 5)
      );
      this.congesMois.set(d.conges ?? []);
    },
    error: (err) => console.error('Dashboard erreur inattendue', err)
  });
}

  private buildKpis(d: any): void {
    // FIX: le compteur "Demandes en attente" inclut les sorties des Managers
    // (statut EN_ATTENTE_RH) mais PAS les sorties des employés —
    // celles-ci sont validées par le Manager, pas le RH.
    const enAttente =
      (d.conges        ?? []).filter((c: any) => c.statut === 'EN_ATTENTE_RH').length +
      (d.reclamations  ?? []).filter((r: any) => r.statut === 'NOUVELLE').length +
      (d.avances       ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length +
      (d.augmentations ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length +
      (d.autorisations ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length;

    const congesAuj = (d.conges ?? []).filter((c: any) => {
      if (c.statut !== 'VALIDEE') return false;
      const now = new Date();
      return now >= new Date(c.dateDebut) && now <= new Date(c.dateFin);
    }).length;

    const reclamOuvertes = (d.reclamations ?? []).filter(
      (r: any) => r.statut !== 'CLOTUREE').length;

    this.kpis.set([
      { label: 'Employés actifs',      val: (d.employes ?? []).length },
      { label: 'Demandes en attente',  val: enAttente },
      { label: "En congé aujourd'hui", val: congesAuj },
      { label: 'Réclamations ouvertes',val: reclamOuvertes }
    ]);
  }

  private buildDemandesSummary(d: any): void {
    this.demandesSummary.set([
      { type: 'conges',        label: 'Congés',
        count: (d.conges ?? []).filter((c: any) => c.statut === 'EN_ATTENTE_RH').length },
      { type: 'avances',       label: 'Avances',
        count: (d.avances ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length },
      { type: 'augmentations', label: 'Augmentations',
        count: (d.augmentations ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length },
      // FIX: renommé "Sorties Managers" — seuls les Managers peuvent avoir une
      // autorisation EN_ATTENTE_RH (quand ils soumettent une demande pour eux-mêmes).
      // Les sorties des employés sont validées directement par le Manager, le RH ne décide pas.
      { type: 'autorisations', label: 'Sorties Managers',
        count: (d.autorisations ?? []).filter((a: any) => a.statut === 'EN_ATTENTE_RH').length }
    ]);
  }

  private buildCongesStats(conges: any[]): void {
    // FIX: comparer aussi l'année (même correction que totalCongesMois)
    const now      = new Date();
    const filtered = (conges ?? []).filter((c: any) => {
      const d = new Date(c.dateDebut);
      return d.getMonth()    === now.getMonth()
          && d.getFullYear() === now.getFullYear();
    });
    const get = (s: string) => filtered.filter((c: any) => c.statut === s).length;
    const max = Math.max(get('VALIDEE'), get('EN_ATTENTE_RH'), get('REJETEE'), 1);

    this.congesStats.set([
      { label: 'Validés',    count: get('VALIDEE'),       color: 'primary',
        pct: Math.round(get('VALIDEE')       / max * 100) },
      { label: 'En attente', count: get('EN_ATTENTE_RH'), color: 'warning',
        pct: Math.round(get('EN_ATTENTE_RH') / max * 100) },
      // FIX: couleur 'danger' (rouge) pour les refusés, pas 'success' (vert)
      { label: 'Refusés',    count: get('REJETEE'),       color: 'danger',
        pct: Math.round(get('REJETEE')       / max * 100) }
    ]);
  }

  totalCongesMois(): number {
    // FIX: comparer aussi l'année pour éviter le bug en janvier
    // (getMonth() seul inclurait les congés de janvier N-1)
    const now = new Date();
    return (this.congesMois() ?? []).filter((c: any) => {
      const d = new Date(c.dateDebut);
      return d.getMonth()    === now.getMonth()
          && d.getFullYear() === now.getFullYear();
    }).length;
  }

  totalEnAttente(): number {
    return this.demandesSummary().reduce((sum, d) => sum + d.count, 0);
  }

  getUrgenceClass(u: string): string {
    const map: Record<string, string> = {
      HAUTE: 'haute', MOYENNE: 'moyenne', BASSE: 'basse'
    };
    return map[u?.toUpperCase()] ?? 'basse';
  }

  getStatutClass(s: string): string {
    const map: Record<string, string> = {
      NOUVELLE: 'nouvelle', EN_COURS: 'en_cours',
      RESOLUE: 'resolue',
      // FIX: CLOTUREE n'était pas mappé → tombait dans 'nouvelle' (bleu trompeur)
      CLOTUREE: 'resolue'
    };
    return map[s?.toUpperCase()] ?? 'nouvelle';
  }

  today(): Date { return new Date(); }
}
