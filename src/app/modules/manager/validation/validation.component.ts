// src/app/modules/manager/validation/validation.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

type TypeDemande = 'conges' | 'autorisations' | 'augmentations';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="valid-root">

    <!-- ──────────────── HEADER ──────────────── -->
    <header class="page-header">
      <div class="ph-brand">
        <div class="ph-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div class="ph-titles">
          <span class="ph-eyebrow">Espace Manager</span>
          <h1 class="ph-heading">Demandes à Valider</h1>
        </div>
      </div>

      <div class="ph-kpi-strip">
        <div class="kpi-pill"
             *ngFor="let t of typeTabs"
             [class.kpi-active]="getCountFor(t.key) > 0">
          <div class="kpi-pill-icon" [ngClass]="'icon-' + t.key">
            <ng-container [ngSwitch]="t.key">
              <svg *ngSwitchCase="'conges'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <svg *ngSwitchCase="'autorisations'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <svg *ngSwitchCase="'avances'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <svg *ngSwitchCase="'augmentations'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </ng-container>
          </div>
          <div>
            <span class="kpi-pill-val">{{ getCountFor(t.key) }}</span>
            <span class="kpi-pill-lbl">{{ t.label }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ──────────────── TABS ──────────────── -->
    <nav class="type-tabs">
      <button class="tab-btn"
              *ngFor="let t of typeTabs"
              [class.tab-active]="activeType() === t.key"
              (click)="activeType.set(t.key)">
        <ng-container [ngSwitch]="t.key">
          <svg *ngSwitchCase="'conges'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <svg *ngSwitchCase="'autorisations'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <svg *ngSwitchCase="'avances'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <svg *ngSwitchCase="'augmentations'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </ng-container>
        {{ t.label }}
        <span class="tab-badge" [class.badge-alert]="getCountFor(t.key) > 0">
          {{ getCountFor(t.key) }}
        </span>
      </button>
    </nav>

    <!-- ──────────────── LOADING ──────────────── -->
    <div class="loading-pane" *ngIf="loading()">
      <div class="loader-ring">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="loader-text">Chargement des demandes…</p>
    </div>

    <!-- ──────────────── CONTENU ──────────────── -->
    <div class="content-area" *ngIf="!loading()">

      <!-- ══ CONGÉS ══ -->
      <ng-container *ngIf="activeType() === 'conges'">
        <div class="demandes-list">
          <article class="demande-card"
                   *ngFor="let d of getCongesEnAttente(); let i = index"
                   [style.animation-delay.ms]="i * 55">
            <div class="card-stripe stripe-conge"></div>

            <div class="dc-header">
              <div class="dc-avatar">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-info">
                <strong>{{ d.employePrenom }} {{ d.employeNom }}</strong>
                <span class="dc-dept">{{ d.employeDepartement }}</span>
              </div>
              <span class="dc-badge badge-conge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Congé {{ d.typeConge | lowercase }}
              </span>
            </div>

            <div class="dc-details">
              <div class="dd-item">
                <span class="dd-label">Date début</span>
                <span class="dd-val">{{ d.dateDebut | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Date fin</span>
                <span class="dd-val">{{ d.dateFin | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Durée</span>
                <span class="dd-val dd-highlight">{{ d.joursOuvrables != null ? d.joursOuvrables + ' j' : '—' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Solde restant</span>
                <span class="dd-val" [class.dd-danger]="d.soldeRestant < d.joursOuvrables">
                  {{ d.soldeRestant ?? '—' }} j
                </span>
              </div>
              <div class="dd-item" *ngIf="d.motif">
                <span class="dd-label">Motif</span>
                <span class="dd-val">{{ d.motif }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Soumis le</span>
                <span class="dd-val">{{ d.createdAt | date:'dd MMM yyyy' }}</span>
              </div>
            </div>

            <div class="dc-actions">
              <div class="comment-wrap">
                <svg class="comment-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <textarea [(ngModel)]="commentaires[d.id]"
                          placeholder="Commentaire optionnel…"
                          rows="2">
                </textarea>
              </div>
              <div class="action-row">
                <button class="btn-action btn-reject" (click)="validerConge(d.id, false)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Refuser
                </button>
                <button class="btn-action btn-approve" (click)="validerConge(d.id, true)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Approuver
                </button>
              </div>
            </div>
          </article>

          <div class="empty-state" *ngIf="getCongesEnAttente().length === 0">
            <div class="es-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p class="es-title">Aucune demande de congé</p>
            <p class="es-sub">Toutes les demandes ont été traitées</p>
          </div>
        </div>
      </ng-container>

      <!-- ══ AUTORISATIONS ══ -->
      <ng-container *ngIf="activeType() === 'autorisations'">
        <div class="demandes-list">
          <article class="demande-card"
                   *ngFor="let d of getAutorisationsEnAttente(); let i = index"
                   [style.animation-delay.ms]="i * 55">
            <div class="card-stripe stripe-auto"></div>

            <div class="dc-header">
              <div class="dc-avatar">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-info">
                <strong>{{ d.employePrenom }} {{ d.employeNom }}</strong>
                <span class="dc-dept">{{ d.employeDepartement }}</span>
              </div>
              <span class="dc-badge badge-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Autorisation de sortie
              </span>
            </div>

            <div class="dc-details">
              <div class="dd-item">
                <span class="dd-label">Date</span>
                <span class="dd-val">{{ d.date | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Heure sortie</span>
                <span class="dd-val dd-highlight">{{ d.heureSortie }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Heure retour</span>
                <span class="dd-val dd-highlight">{{ d.heureRetour }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Type</span>
                <span class="dd-val">{{ d.type }}</span>
              </div>
              <div class="dd-item" *ngIf="d.motif">
                <span class="dd-label">Motif</span>
                <span class="dd-val">{{ d.motif }}</span>
              </div>
            </div>

            <div class="dc-actions">
              <div class="comment-wrap">
                <svg class="comment-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <textarea [(ngModel)]="commentaires[d.id]"
                          placeholder="Commentaire optionnel…"
                          rows="2">
                </textarea>
              </div>
              <div class="action-row">
                <button class="btn-action btn-reject" (click)="validerAutorisation(d.id, false)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Refuser
                </button>
                <button class="btn-action btn-approve" (click)="validerAutorisation(d.id, true)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Approuver
                </button>
              </div>
            </div>
          </article>

          <div class="empty-state" *ngIf="getAutorisationsEnAttente().length === 0">
            <div class="es-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p class="es-title">Aucune autorisation en attente</p>
            <p class="es-sub">Toutes les demandes ont été traitées</p>
          </div>
        </div>
      </ng-container>

      <!-- ══ AUGMENTATIONS ══ -->
      <ng-container *ngIf="activeType() === 'augmentations'">
        <div class="demandes-list">
          <article class="demande-card"
                   *ngFor="let d of getAugmentationsEnAttente(); let i = index"
                   [style.animation-delay.ms]="i * 55">
            <div class="card-stripe stripe-augment"></div>

            <div class="dc-header">
              <div class="dc-avatar">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-info">
                <strong>{{ d.employePrenom }} {{ d.employeNom }}</strong>
                <span class="dc-dept">{{ d.employeDepartement }}</span>
              </div>
              <span class="dc-badge badge-augment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                Augmentation
              </span>
            </div>

            <div class="dc-details">
              <div class="dd-item">
                <span class="dd-label">Salaire actuel</span>
                <span class="dd-val">{{ d.salaireActuel | number:'1.3-3' }} DT</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Augmentation souhaitée</span>
                <span class="dd-val dd-highlight">+ {{ d.montantDemande | number:'1.3-3' }} DT</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Justification</span>
                <span class="dd-val">{{ d.justification || '—' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">Soumis le</span>
                <span class="dd-val">{{ d.createdAt | date:'dd MMM yyyy' }}</span>
              </div>
            </div>

            <div class="avis-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Votre avis est <strong>consultatif</strong>. Décision finale : Direction.
            </div>

            <div class="dc-actions">
              <div class="comment-wrap">
                <svg class="comment-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <textarea [(ngModel)]="commentaires[d.id]"
                          placeholder="Votre évaluation motivée…"
                          rows="2">
                </textarea>
              </div>
              <div class="action-row">
                <button class="btn-action btn-reject" (click)="donnerAvisAugmentation(d.id, false)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                  </svg>
                  Défavorable
                </button>
                <button class="btn-action btn-approve" (click)="donnerAvisAugmentation(d.id, true)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4.72A2.31 2.31 0 0 1 2 20V13a2.31 2.31 0 0 1 2.72-2H7"/>
                  </svg>
                  Favorable
                </button>
              </div>
            </div>
          </article>

          <div class="empty-state" *ngIf="getAugmentationsEnAttente().length === 0">
            <div class="es-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p class="es-title">Aucune augmentation en attente</p>
            <p class="es-sub">Toutes les demandes ont été traitées</p>
          </div>
        </div>
      </ng-container>

    </div>

    <!-- ──────────────── TOAST ──────────────── -->
    <div class="toast-wrap" [class.toast-show]="toast().show" [ngClass]="'toast-' + toast().type">
      <div class="toast-icon">
        <svg *ngIf="toast().type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg *ngIf="toast().type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <svg *ngIf="toast().type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      <span>{{ toast().message }}</span>
    </div>

  </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════
       DESIGN TOKENS
    ═══════════════════════════════════════════════ */
    :host {
      --c-bg        : #F4F6FA;
      --c-surface   : #FFFFFF;
      --c-border    : #E5E9F2;
      --c-primary   : #0B4A6F;
      --c-accent    : #0EA5E9;
      --c-text-h    : #0F172A;
      --c-text-b    : #334155;
      --c-text-s    : #64748B;
      --c-text-xs   : #94A3B8;
      --c-ok        : #10B981;
      --c-danger    : #EF4444;
      --c-warn      : #F59E0B;
      /* per-type colors */
      --c-conge     : #0EA5E9;
      --c-conge-bg  : #E0F2FE;
      --c-auto      : #8B5CF6;
      --c-auto-bg   : #EDE9FE;
      --c-avance    : #10B981;
      --c-avance-bg : #D1FAE5;
      --c-augment   : #F59E0B;
      --c-augment-bg: #FEF3C7;
      --radius      : 16px;
      --radius-sm   : 10px;
      --shadow-sm   : 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);
      --shadow-md   : 0 4px 16px rgba(15,23,42,.10);
      --shadow-lg   : 0 12px 32px rgba(15,23,42,.14);
      --font        : 'DM Sans', system-ui, sans-serif;
      display: block;
      font-family: var(--font);
      background: var(--c-bg);
      min-height: 100vh;
      padding: 32px 28px;
      box-sizing: border-box;
    }

    .valid-root {
      max-width: 100%;
      margin: 0 auto;
      animation: pageFadeIn .4s ease both;
    }

    /* ── HEADER ── */
    .page-header {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .ph-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .ph-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(14,165,233,.35);
      color: white; flex-shrink: 0;
    }
    .ph-icon-wrap svg { width: 26px; height: 26px; }

    .ph-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase; color: var(--c-accent); display: block; margin-bottom: 3px;
    }
    .ph-heading {
      font-size: 22px; font-weight: 800; color: var(--c-text-h);
      letter-spacing: -.02em; margin: 0;
    }

    /* KPI pills strip */
    .ph-kpi-strip {
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    .kpi-pill {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      transition: all .18s ease;
    }
    .kpi-pill.kpi-active { border-color: transparent; box-shadow: var(--shadow-md); }
    .kpi-pill-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .kpi-pill-icon svg { width: 16px; height: 16px; }
    .icon-conges        { background: var(--c-conge-bg);  color: var(--c-conge); }
    .icon-autorisations { background: var(--c-auto-bg);   color: var(--c-auto); }
    .icon-avances       { background: var(--c-avance-bg); color: var(--c-avance); }
    .icon-augmentations { background: var(--c-augment-bg);color: var(--c-augment); }

    .kpi-pill-val {
      font-size: 18px; font-weight: 800; color: var(--c-text-h);
      display: block; line-height: 1;
    }
    .kpi-pill-lbl {
      font-size: 10px; font-weight: 500; color: var(--c-text-s); display: block;
    }

    /* ── TABS ── */
    .type-tabs {
      display: flex; gap: 6px; flex-wrap: wrap;
      margin-bottom: 22px;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px;
      border: 1.5px solid var(--c-border);
      background: var(--c-surface);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13px; font-weight: 600;
      color: var(--c-text-s);
      font-family: var(--font);
      transition: all .18s ease;
    }
    .tab-btn svg { opacity: .6; }
    .tab-btn:hover {
      border-color: var(--c-accent);
      color: var(--c-accent);
    }
    .tab-btn:hover svg { opacity: 1; }
    .tab-active {
      background: var(--c-primary);
      border-color: var(--c-primary);
      color: white !important;
      box-shadow: 0 4px 14px rgba(11,74,111,.28);
    }
    .tab-active svg { opacity: 1; }

    .tab-badge {
      min-width: 20px; height: 20px; padding: 0 6px;
      border-radius: 10px;
      background: var(--c-border);
      color: var(--c-text-s);
      font-size: 11px; font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all .18s;
    }
    .tab-badge.badge-alert {
      background: var(--c-warn);
      color: white;
      animation: badgePulse 2.5s infinite;
    }
    .tab-active .tab-badge {
      background: rgba(255,255,255,.22);
      color: white;
      animation: none;
    }

    /* ── LOADING ── */
    .loading-pane {
      display: flex; flex-direction: column; align-items: center; padding: 80px 0;
    }
    .loader-ring { width: 48px; height: 48px; margin-bottom: 16px; }
    .loader-ring svg { width: 100%; height: 100%; animation: spin .9s linear infinite; }
    .loader-ring circle { stroke: var(--c-accent); stroke-dasharray: 80; stroke-dashoffset: 60; }
    .loader-text { font-size: 13px; color: var(--c-text-s); margin: 0; }

    /* ── DEMANDES LIST ── */
    .content-area { animation: pageFadeIn .3s ease both; }
    .demandes-list { display: flex; flex-direction: column; gap: 16px; }

    /* ── CARTE ── */
    .demande-card {
      background: var(--c-surface);
      border-radius: var(--radius);
      padding: 22px 22px 22px 26px;
      border: 1px solid var(--c-border);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      display: flex; flex-direction: column; gap: 18px;
      transition: all .22s cubic-bezier(.4,0,.2,1);
      animation: cardSlide .35s ease both;
    }
    .demande-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: transparent;
    }

    .card-stripe {
      position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      border-radius: 16px 0 0 16px;
    }
    .stripe-conge   { background: var(--c-conge); }
    .stripe-auto    { background: var(--c-auto); }
    .stripe-avance  { background: var(--c-avance); }
    .stripe-augment { background: var(--c-augment); }

    /* Header carte */
    .dc-header {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .dc-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 800; color: white; flex-shrink: 0;
      letter-spacing: .02em;
    }
    .dc-info { flex: 1; min-width: 0; }
    .dc-info strong {
      font-size: 14px; font-weight: 700; color: var(--c-text-h); display: block;
    }
    .dc-dept { font-size: 11px; color: var(--c-text-s); }

    .dc-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
      white-space: nowrap;
    }
    .badge-conge   { background: var(--c-conge-bg);  color: #0369A1; }
    .badge-auto    { background: var(--c-auto-bg);   color: #6D28D9; }
    .badge-avance  { background: var(--c-avance-bg); color: #065F46; }
    .badge-augment { background: var(--c-augment-bg);color: #92400E; }

    /* Détails */
    .dc-details {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: var(--c-bg);
      border-radius: var(--radius-sm);
      padding: 16px;
    }
    .dd-item { display: flex; flex-direction: column; gap: 3px; }
    .dd-label {
      font-size: 10px; font-weight: 700; color: var(--c-text-xs);
      text-transform: uppercase; letter-spacing: .07em;
    }
    .dd-val {
      font-size: 13px; font-weight: 600; color: var(--c-text-b);
    }
    .dd-highlight {
      color: var(--c-primary); font-size: 15px; font-weight: 800;
    }
    .dd-danger { color: var(--c-danger); }

    /* Avis banner */
    .avis-banner {
      display: flex; align-items: center; gap: 9px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      font-size: 12px; color: #92400E;
    }
    .avis-banner svg { color: var(--c-warn); flex-shrink: 0; }
    .avis-banner strong { color: #78350F; }

    /* Actions */
    .dc-actions { display: flex; flex-direction: column; gap: 10px; }

    .comment-wrap {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      transition: border-color .2s, box-shadow .2s;
    }
    .comment-wrap:focus-within {
      border-color: var(--c-accent);
      box-shadow: 0 0 0 3px rgba(14,165,233,.1);
    }
    .comment-ico {
      width: 15px; height: 15px; color: var(--c-text-xs);
      flex-shrink: 0; margin-top: 3px;
    }
    .comment-wrap textarea {
      flex: 1; border: none; outline: none; resize: none;
      font-size: 13px; font-family: var(--font);
      color: var(--c-text-b); background: transparent;
      line-height: 1.5;
    }
    .comment-wrap textarea::placeholder { color: var(--c-text-xs); }

    .action-row {
      display: flex; gap: 10px; justify-content: flex-end;
    }

    .btn-action {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 20px;
      border: none; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 700;
      cursor: pointer; font-family: var(--font);
      transition: all .18s ease;
    }
    .btn-reject {
      background: #FEE2E2; color: #991B1B;
    }
    .btn-reject:hover {
      background: var(--c-danger); color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239,68,68,.3);
    }
    .btn-approve {
      background: var(--c-primary); color: white;
      box-shadow: 0 2px 8px rgba(11,74,111,.25);
    }
    .btn-approve:hover {
      background: #093D5C; color: white;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(11,74,111,.35);
    }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 70px 0;
    }
    .es-icon {
      width: 68px; height: 68px; border-radius: 50%;
      background: #D1FAE5; color: var(--c-ok);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
    }
    .es-icon svg { width: 30px; height: 30px; }
    .es-title { font-size: 16px; font-weight: 700; color: var(--c-text-h); margin: 0 0 6px; }
    .es-sub   { font-size: 13px; color: var(--c-text-s); margin: 0; }

    /* Toast */
    .toast-wrap {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; align-items: center; gap: 10px;
      padding: 13px 18px;
      border-radius: 12px;
      font-size: 13px; font-weight: 600;
      font-family: var(--font);
      box-shadow: var(--shadow-lg);
      opacity: 0; transform: translateY(20px) scale(.97);
      transition: all .28s cubic-bezier(.4,0,.2,1);
      pointer-events: none; z-index: 9999;
    }
    .toast-show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .toast-icon {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .toast-success { background: #D1FAE5; color: #065F46; }
    .toast-success .toast-icon { background: #A7F3D0; }
    .toast-error   { background: #FEE2E2; color: #991B1B; }
    .toast-error   .toast-icon { background: #FECACA; }
    .toast-info    { background: #E0F2FE; color: #0369A1; }
    .toast-info    .toast-icon { background: #BAE6FD; }

    /* ── RESPONSIVE ── */
    @media (max-width: 700px) {
      :host           { padding: 20px 16px; }
      .ph-kpi-strip   { display: none; }
      .dc-details     { grid-template-columns: repeat(2, 1fr); }
      .action-row     { flex-direction: column; }
      .btn-action     { justify-content: center; }
    }

    /* ── KEYFRAMES ── */
    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cardSlide {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes badgePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,.5); }
      50%       { box-shadow: 0 0 0 4px rgba(245,158,11,0); }
    }
  `]
})
export class ValidationComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  conges        = signal<any[]>([]);
  autorisations = signal<any[]>([]);
  augmentations = signal<any[]>([]);
  loading       = signal(true);

  activeType   = signal<TypeDemande>('conges');
  commentaires : Record<number, string> = {};

  toast = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  typeTabs: { key: TypeDemande; label: string }[] = [
    { key: 'conges',        label: 'Congés'        },
    { key: 'autorisations', label: 'Autorisations'  },
    { key: 'augmentations', label: 'Augmentations'  }
  ];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      conges:        this.http.get<any[]>(`${this.API}/manager/conges/en-attente`),
      // ✅ FIX: endpoint corrigé → /manager/sorties/en-attente (pas /manager/autorisations/en-attente)
      autorisations: this.http.get<any[]>(`${this.API}/manager/sorties/en-attente`),
      augmentations: this.http.get<any[]>(`${this.API}/manager/augmentations/en-attente`)
    }).subscribe({
      next: (d) => {
        this.conges.set(d.conges ?? []);
        this.autorisations.set(d.autorisations ?? []);
        this.augmentations.set(d.augmentations ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Erreur de chargement', 'error');
      }
    });
  }

  // ── Filtres ───────────────────────────────────────
  getCongesEnAttente():        any[] { return this.conges().filter(c => c.statut === 'EN_ATTENTE_MANAGER'); }
  // ✅ FIX: accepte EN_ATTENTE et EN_ATTENTE_MANAGER pour les autorisations
  getAutorisationsEnAttente(): any[] { return this.autorisations().filter(a => a.statut === 'EN_ATTENTE' || a.statut === 'EN_ATTENTE_MANAGER'); }
  getAugmentationsEnAttente(): any[] { return this.augmentations().filter(a => a.statut === 'EN_ATTENTE_MANAGER'); }

  getCountFor(type: TypeDemande): number {
    return { conges: this.getCongesEnAttente().length,
             autorisations: this.getAutorisationsEnAttente().length,
             augmentations: this.getAugmentationsEnAttente().length }[type];
  }

  totalEnAttente(): number {
    return this.getCongesEnAttente().length
         + this.getAutorisationsEnAttente().length
         + this.getAugmentationsEnAttente().length;
  }

  // ── Actions ───────────────────────────────────────
  validerConge(id: number, approuve: boolean): void {
    // ✅ OK: /manager/conges/{id}/valider existe dans le Swagger
    this.http.put(`${this.API}/manager/conges/${id}/valider`,
      { approuve, commentaire: this.commentaires[id] ?? '' }
    ).subscribe({
      next: () => {
        this.conges.update(l => l.filter(c => c.id !== id));
        this.showToast(approuve ? 'Congé approuvé' : 'Congé refusé',
                       approuve ? 'success' : 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  validerAutorisation(id: number, approuve: boolean): void {
    // ✅ FIX: endpoint corrigé → /manager/sorties/{id}/valider (pas /manager/autorisations/{id}/valider)
    this.http.put(`${this.API}/manager/sorties/${id}/valider`,
      { approuve, commentaire: this.commentaires[id] ?? '' }
    ).subscribe({
      next: () => {
        this.autorisations.update(l => l.filter(a => a.id !== id));
        this.showToast(approuve ? 'Autorisation approuvée' : 'Autorisation refusée',
                       approuve ? 'success' : 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  donnerAvisAugmentation(id: number, favorable: boolean): void {
    // ✅ OK: /manager/augmentations/{id}/avis existe dans le Swagger
    this.http.put(`${this.API}/manager/augmentations/${id}/avis`,
      { favorable, commentaire: this.commentaires[id] ?? '' }
    ).subscribe({
      next: () => {
        this.augmentations.update(l => l.filter(a => a.id !== id));
        this.showToast(favorable ? 'Avis favorable envoyé' : 'Avis défavorable envoyé', 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  // ── Helpers ───────────────────────────────────────
  getInit(prenom: string, nom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3200);
  }
}