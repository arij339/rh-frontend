import { environment } from '../../../../environments/environment';
// src/app/modules/rh/rh-validation/rh-validation.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

type TypeDemande = 'conges' | 'avances' | 'augmentations' | 'autorisations';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  checkCircle:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  calendar:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  banknote:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  trendingUp:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  clock:        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:            `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  thumbUp:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
  thumbDown:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`,
  user:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  building:     `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>`,
  messageSquare:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  loader:       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  inboxEmpty:   `<svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  sun:          `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moonSet:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  alertTriangle:`<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

@Component({
  selector: 'app-rh-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="rh-valid fade-in">

    <!-- Header -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon">
          <svg width="26" height="26" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div>
          <h1>Validation des Demandes</h1>
          <p>
            <span class="count-pill">{{ totalEnAttente() }}</span>
            demande(s) nécessitent votre décision finale
          </p>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="type-tabs">
      <button class="tt-btn"
              *ngFor="let t of typeTabs"
              [class.active]="activeType() === t.key"
              (click)="activeType.set(t.key)">
        <span class="tt-icon" [innerHTML]="t.svg"></span>
        {{ t.label }}
        <span class="tt-badge" [class.has-items]="getCount(t.key) > 0">
          {{ getCount(t.key) }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div class="loading-box" *ngIf="loading()">
      <span class="spin-icon" [innerHTML]="ic.loader"></span>
      <p>Chargement des demandes...</p>
    </div>

    <div *ngIf="!loading()">

      <!-- ═══ CONGÉS ═══ -->
      <div *ngIf="activeType() === 'conges'">
        <div class="dem-list">
          <div class="dem-card stagger"
               *ngFor="let d of getCongesRH(); let i = index"
               [style.animation-delay]="i * 60 + 'ms'">

            <div class="dc-top">
              <div class="dc-av">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-who">
                <strong>
                  <span class="icon-inline" [innerHTML]="ic.user"></span>
                  {{ d.employePrenom }} {{ d.employeNom }}
                </strong>
                <span>
                  <span class="icon-inline sm" [innerHTML]="ic.building"></span>
                  {{ d.employeDepartement }}
                </span>
              </div>
              <span class="dc-badge conge">
                <span [innerHTML]="ic.calendar"></span>
                Congé {{ d.typeConge | lowercase }}
              </span>
            </div>

            <div class="manager-comment" *ngIf="d.commentaireManager">
              <span class="mc-icon" [innerHTML]="ic.messageSquare"></span>
              <div>
                <label>Commentaire manager</label>
                <em>{{ d.commentaireManager }}</em>
              </div>
            </div>

            <div class="dc-grid">
              <div class="dcg-item">
                <span>Date début</span>
                <strong>{{ d.dateDebut | date:'dd/MM/yyyy' }}</strong>
              </div>
              <div class="dcg-item">
                <span>Date fin</span>
                <strong>{{ d.dateFin | date:'dd/MM/yyyy' }}</strong>
              </div>
              <div class="dcg-item">
                <span>Durée</span>
                <strong class="highlight">{{ d.joursOuvrables }} jour(s)</strong>
              </div>
              <div class="dcg-item">
                <span>Solde restant</span>
                <strong [class.danger]="d.soldeRestant < d.joursOuvrables">
                  {{ d.soldeRestant ?? '—' }} j
                   <span class="icon-inline sm" *ngIf="d.soldeRestant < d.joursOuvrables" [innerHTML]="ic.alertTriangle"></span>
                </strong>
              </div>
              <div class="dcg-item" *ngIf="d.motif">
                <span>Motif</span>
                <strong>{{ d.motif }}</strong>
              </div>
              <div class="dcg-item">
                <span>Soumis le</span>
                <strong>{{ d.createdAt | date:'dd/MM/yyyy' }}</strong>
              </div>
              <div class="dcg-item dcg-justif" *ngIf="d.fichierJustificatif">
                <span>Pièce justificative</span>
                <a class="justif-link" [href]="getJustificatifUrl(d.fichierJustificatif)" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
                  📎 Voir le justificatif
                </a>
              </div>
            </div>

            <div class="dc-actions">
              <div class="textarea-wrap">
                <span class="ta-icon" [innerHTML]="ic.messageSquare"></span>
                <textarea [(ngModel)]="comments[d.id]"
                          placeholder="Motif de décision (optionnel)..."
                          rows="2"></textarea>
              </div>
              <div class="act-btns">
                <button class="btn-reject" (click)="validerConge(d.id, false)">
                  <span [innerHTML]="ic.x"></span> Refuser
                </button>
                <button class="btn-approve" (click)="validerConge(d.id, true)">
                  <span [innerHTML]="ic.check"></span> Valider définitivement
                </button>
              </div>
            </div>
          </div>

          <div class="empty-dem" *ngIf="getCongesRH().length === 0">
            <span [innerHTML]="ic.inboxEmpty"></span>
            <p>Aucun congé en attente de validation RH</p>
          </div>
        </div>
      </div>

      <!-- ═══ AUTORISATIONS ═══ -->
      <div *ngIf="activeType() === 'autorisations'">
        <div class="dem-list">
          <div class="dem-card stagger"
               *ngFor="let d of getAutorisationsRH(); let i = index"
               [style.animation-delay]="i * 60 + 'ms'">

            <div class="dc-top">
              <div class="dc-av">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-who">
                <strong>
                  <span class="icon-inline" [innerHTML]="ic.user"></span>
                  {{ d.employePrenom }} {{ d.employeNom }}
                </strong>
                <span>
                  <span class="icon-inline sm" [innerHTML]="ic.building"></span>
                  {{ d.employeDepartement }}
                </span>
              </div>
              <span class="dc-badge auto">
                <span [innerHTML]="ic.clock"></span>
                Autorisation de sortie
              </span>
            </div>

            <div class="dc-grid">
              <div class="dcg-item">
                <span>Date</span>
                <strong>{{ d.dateSortie | date:'dd/MM/yyyy' }}</strong>
              </div>
              <div class="dcg-item">
                <span>Heure sortie</span>
                <strong>
                  <span class="icon-inline sm" [innerHTML]="ic.sun"></span>
                  {{ d.heureSortie }}
                </strong>
              </div>
              <div class="dcg-item">
                <span>Retour prévu</span>
                <strong>
                  <span class="icon-inline sm" [innerHTML]="ic.moonSet"></span>
                  {{ d.heureRetourPrevue }}
                </strong>
              </div>
              <div class="dcg-item">
                <span>Type</span>
                <strong>{{ d.typeSortie || '—' }}</strong>
              </div>
              <div class="dcg-item">
                <span>Motif</span>
                <strong>{{ d.motif || '—' }}</strong>
              </div>
            </div>

            <div class="dc-actions">
              <div class="textarea-wrap">
                <span class="ta-icon" [innerHTML]="ic.messageSquare"></span>
                <textarea [(ngModel)]="comments[d.id]"
                          placeholder="Motif de décision (optionnel)..."
                          rows="2"></textarea>
              </div>
              <div class="act-btns">
                <button class="btn-reject" (click)="validerAutorisation(d.id, false)">
                  <span [innerHTML]="ic.x"></span> Refuser
                </button>
                <button class="btn-approve" (click)="validerAutorisation(d.id, true)">
                  <span [innerHTML]="ic.check"></span> Valider
                </button>
              </div>
            </div>
          </div>

          <div class="empty-dem" *ngIf="getAutorisationsRH().length === 0">
            <span [innerHTML]="ic.inboxEmpty"></span>
            <p>Aucune autorisation de sortie en attente de validation RH</p>
          </div>
        </div>
      </div>

      <!-- ═══ AVANCES ═══ -->
      <div *ngIf="activeType() === 'avances'">
        <div class="dem-list">
          <div class="dem-card stagger"
               *ngFor="let d of getAvancesRH(); let i = index"
               [style.animation-delay]="i * 60 + 'ms'">

            <div class="dc-top">
              <div class="dc-av">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-who">
                <strong>
                  <span class="icon-inline" [innerHTML]="ic.user"></span>
                  {{ d.employePrenom }} {{ d.employeNom }}
                </strong>
                <span>
                  <span class="icon-inline sm" [innerHTML]="ic.building"></span>
                  {{ d.employeDepartement }}
                </span>
              </div>
              <span class="dc-badge avance">
                <span [innerHTML]="ic.banknote"></span>
                Avance sur salaire
              </span>
            </div>

            <div class="dc-grid">
              <div class="dcg-item">
                <span>MONTANT DEMANDÉ</span>
                <strong class="highlight">{{ d.montantDemande | number:'1.3-3' }} DT</strong>
              </div>
              <div class="dcg-item">
                <span>MONTANT ACCORDÉ</span>
                <input type="number" [(ngModel)]="d.montantAccordeEdit" [placeholder]="d.montantDemande" class="edit-input" />
              </div>
              <div class="dcg-item">
                <span>MENSUALITÉS</span>
                <input type="number" [(ngModel)]="d.mensualitesEdit" [placeholder]="d.nombreMensualites" class="edit-input" />
              </div>
              <div class="dcg-item">
                <span>SALAIRE DE BASE</span>
                <strong>{{ d.salaireBase | number:'1.3-3' }} DT</strong>
              </div>
              <div class="dcg-item">
                <span>MOTIF</span>
                <strong>{{ d.motif || '—' }}</strong>
              </div>
            </div>

            <div class="dc-actions">
              <div class="textarea-wrap">
                <span class="ta-icon" [innerHTML]="ic.messageSquare"></span>
                <textarea [(ngModel)]="comments[d.id]"
                          placeholder="Décision RH..."
                          rows="2"></textarea>
              </div>
              <div class="act-btns">
                <button class="btn-reject" (click)="validerAvance(d.id, false)">
                  <span [innerHTML]="ic.x"></span> Refuser
                </button>
                <button class="btn-approve" (click)="validerAvance(d.id, true)">
                  <span [innerHTML]="ic.check"></span> Accorder l'avance
                </button>
              </div>
            </div>
          </div>

          <div class="empty-dem" *ngIf="getAvancesRH().length === 0">
            <span [innerHTML]="ic.inboxEmpty"></span>
            <p>Aucune avance en attente</p>
          </div>
        </div>
      </div>

      <!-- ═══ AUGMENTATIONS ═══ -->
      <div *ngIf="activeType() === 'augmentations'">
        <div class="dem-list">
          <div class="dem-card stagger"
               *ngFor="let d of getAugmentationsRH(); let i = index"
               [style.animation-delay]="i * 60 + 'ms'">

            <div class="dc-top">
              <div class="dc-av">{{ getInit(d.employePrenom, d.employeNom) }}</div>
              <div class="dc-who">
                <strong>
                  <span class="icon-inline" [innerHTML]="ic.user"></span>
                  {{ d.employePrenom }} {{ d.employeNom }}
                </strong>
                <span>
                  <span class="icon-inline sm" [innerHTML]="ic.building"></span>
                  {{ d.employeDepartement }}
                </span>
              </div>
              <span class="dc-badge augment">
                <span [innerHTML]="ic.trendingUp"></span>
                Augmentation
              </span>
            </div>

            <div class="avis-manager"
                 *ngIf="d.avisManager"
                 [class]="d.avisManager === 'FAVORABLE' ? 'avis-ok' : 'avis-ko'">
              <span class="avis-icon" [innerHTML]="d.avisManager === 'FAVORABLE' ? ic.thumbUp : ic.thumbDown"></span>
              <div>
                <strong>Avis manager : {{ d.avisManager }}</strong>
                <p *ngIf="d.commentaireManager">{{ d.commentaireManager }}</p>
              </div>
            </div>

            <div class="dc-grid">
              <div class="dcg-item">
                <span>Salaire actuel</span>
                <strong>{{ d.salaireActuel | number:'1.3-3' }} DT</strong>
              </div>
              <div class="dcg-item">
                <span>Augmentation souhaitée</span>
                <strong class="highlight">+{{ d.montantDemande | number:'1.3-3' }} DT</strong>
              </div>
              <div class="dcg-item">
                <span>Nouveau salaire</span>
                <strong class="success">{{ (d.salaireActuel + d.montantDemande) | number:'1.3-3' }} DT</strong>
              </div>
              <div class="dcg-item">
                <span>Justification</span>
                <strong>{{ d.motif || '—' }}</strong>
              </div>
            </div>

            <div class="dc-actions">
              <div class="textarea-wrap">
                <span class="ta-icon" [innerHTML]="ic.messageSquare"></span>
                <textarea [(ngModel)]="comments[d.id]"
                          placeholder="Analyse RH..."
                          rows="2"></textarea>
              </div>
              <div class="act-btns">
                <button class="btn-reject" (click)="validerAugmentation(d.id, false)">
                  <span [innerHTML]="ic.x"></span> Refuser
                </button>
                <button class="btn-approve" (click)="validerAugmentation(d.id, true)">
                  <span [innerHTML]="ic.check"></span> Valider l'augmentation
                </button>
              </div>
            </div>
          </div>

          <div class="empty-dem" *ngIf="getAugmentationsRH().length === 0">
            <span [innerHTML]="ic.inboxEmpty"></span>
            <p>Aucune augmentation en attente</p>
          </div>
        </div>
      </div>



    </div>

    <!-- Toast -->
    <div class="g-toast" [class.show]="toast().show" [class]="'g-toast ' + toast().type">
      <span *ngIf="toast().type === 'success'" [innerHTML]="ic.check"></span>
      <span *ngIf="toast().type === 'error'" [innerHTML]="ic.x"></span>
      {{ toast().message }}
    </div>

  </div>
  `,
  styles: [`
    .rh-valid { max-width: 100%; }

    /* ── Header ── */
    .page-header {
      display: flex; align-items: center;
      margin-bottom: 28px;
    }
    .ph-left {
      display: flex; align-items: center; gap: 16px;
    }
    .ph-icon {
      width: 56px; height: 56px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(11,110,126,0.25);
      animation: iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      svg { display: block; }
    }
    @keyframes iconPop {
      from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
      to   { transform: scale(1) rotate(0deg);     opacity: 1; }
    }

    h1 {
      font-size: 20px; font-weight: 700;
      color: var(--primary-dark); margin: 0;
    }
    p {
      font-size: 12px; color: var(--text-light);
      margin-top: 4px; display: flex; align-items: center; gap: 6px;
    }
    .count-pill {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 22px; height: 22px; padding: 0 6px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white; border-radius: 11px;
      font-size: 11px; font-weight: 700;
    }

    /* ── Tabs ── */
    .type-tabs {
      display: flex; gap: 8px; flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .tt-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      border: 1.5px solid var(--gray-mid);
      background: white; border-radius: 12px;
      cursor: pointer; font-size: 13px; font-weight: 600;
      color: var(--text-light); transition: all 0.22s ease;
      position: relative; overflow: hidden;

      &::before {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        opacity: 0; transition: opacity 0.22s;
        border-radius: inherit;
      }
      &:hover {
        border-color: var(--primary); color: var(--primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(11,110,126,0.15);
      }
      &.active {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white; border-color: transparent;
        box-shadow: 0 6px 18px rgba(11,110,126,0.3);
        transform: translateY(-2px);
      }
    }
    .tt-icon {
      display: flex; align-items: center;
      svg { display: block; width: 16px; height: 16px; }
    }
    .tt-badge {
      background: var(--gray-mid); color: var(--text-light);
      padding: 2px 8px; border-radius: 10px;
      font-size: 11px; font-weight: 700; min-width: 22px;
      text-align: center; transition: all 0.22s;
      &.has-items {
        background: #FED7D7; color: #822727;
        animation: badgePulse 2s ease infinite;
      }
    }
    .tt-btn.active .tt-badge {
      background: rgba(255,255,255,0.25); color: white;
    }
    @keyframes badgePulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.1); }
    }

    /* ── Loading ── */
    .loading-box {
      display: flex; flex-direction: column;
      align-items: center; gap: 14px;
      padding: 70px; color: var(--text-light);
    }
    .spin-icon svg {
      display: block;
      animation: spin 0.9s linear infinite;
      width: 36px; height: 36px;
      color: var(--primary);
    }

    /* ── Card list ── */
    .dem-list {
      display: flex; flex-direction: column; gap: 16px;
    }

    /* Stagger animation on cards */
    .dem-card.stagger {
      opacity: 0;
      animation: cardSlideIn 0.4s ease forwards;
    }
    @keyframes cardSlideIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .dem-card {
      background: white; border-radius: 18px; padding: 22px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.06);
      border: 1.5px solid var(--gray-light);
      display: flex; flex-direction: column; gap: 16px;
      transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
      &:hover {
        box-shadow: 0 8px 28px rgba(11,110,126,0.13);
        transform: translateY(-2px);
        border-color: rgba(11,110,126,0.15);
      }
    }

    /* ── Card top ── */
    .dc-top {
      display: flex; align-items: center;
      gap: 12px; flex-wrap: wrap;
    }
    .dc-av {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(11,110,126,0.25);
    }
    .dc-who {
      flex: 1;
      strong {
        font-size: 14px; color: var(--text); display: flex;
        align-items: center; gap: 5px; font-weight: 700;
      }
      span {
        font-size: 11px; color: var(--text-light);
        display: flex; align-items: center; gap: 4px; margin-top: 2px;
      }
    }
    .icon-inline {
      display: inline-flex; align-items: center;
      svg { display: block; }
      &.sm svg { width: 11px; height: 11px; }
    }

    .dc-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      svg { display: block; width: 14px; height: 14px; }
      &.conge   { background: var(--accent); color: var(--primary); }
      &.avance  { background: #C6F6D5; color: #276749; }
      &.augment { background: #FEFCBF; color: #744210; }
      &.auto    { background: #BEE3F8; color: #2A69AC; }
    }

    /* ── Manager comment ── */
    .manager-comment {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--gray-light); border-radius: 10px;
      padding: 10px 14px; font-size: 12px; color: var(--text-light);
      label { font-weight: 700; font-size: 10px;
               text-transform: uppercase; letter-spacing: 0.5px;
               color: var(--text-light); display: block; margin-bottom: 2px; }
      em { color: var(--text); font-style: italic; }
    }
    .mc-icon {
      display: flex; align-items: center; color: var(--primary); margin-top: 2px;
      svg { display: block; }
    }

    /* ── Avis manager ── */
    .avis-manager {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; border-radius: 12px; font-size: 13px;
      strong { display: block; font-size: 13px; font-weight: 700; }
      p { font-size: 11px; margin: 3px 0 0; }
      &.avis-ok {
        background: #F0FFF4; border: 1px solid #C6F6D5;
        strong, p { color: #276749; }
      }
      &.avis-ko {
        background: #FFF5F5; border: 1px solid #FED7D7;
        strong, p { color: #822727; }
      }
    }
    .avis-icon {
      display: flex; align-items: center; margin-top: 1px;
      svg { display: block; width: 18px; height: 18px; }
    }

    /* ── Info grid ── */
    .dc-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 10px; background: var(--gray-light);
      border-radius: 12px; padding: 16px;
      @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
    }
    .dcg-item {
      display: flex; flex-direction: column; gap: 3px;
      span {
        font-size: 10px; font-weight: 700;
        color: var(--text-light); text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      strong {
        font-size: 13px; font-weight: 600; color: var(--text);
        display: flex; align-items: center; gap: 4px;
        &.highlight { color: var(--primary); font-size: 15px; font-weight: 700; }
        &.success   { color: var(--success); }
        &.danger    { color: var(--danger); }
      }
    }

    /* ── Actions ── */
    .dc-actions {
      display: flex; flex-direction: column; gap: 10px;
      border-top: 1px solid var(--gray-light);
      padding-top: 14px;
    }
    .textarea-wrap {
      position: relative;
      textarea {
        width: 100%; padding: 10px 12px 10px 36px;
        border: 1.5px solid var(--gray-mid); border-radius: 10px;
        font-size: 13px; resize: none; outline: none;
        font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s;
        color: var(--text); background: var(--gray-light);
        &:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(14,157,175,0.1);
          background: white;
        }
      }
    }
    .ta-icon {
      position: absolute; left: 10px; top: 11px;
      color: var(--text-light); pointer-events: none;
      svg { display: block; width: 14px; height: 14px; }
    }

    .act-btns {
      display: flex; gap: 10px; justify-content: flex-end;
    }
    .btn-reject, .btn-approve {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 20px; border: none; border-radius: 10px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all 0.22s ease; font-family: inherit;
      svg { display: block; }
    }
    .btn-reject {
      background: #FED7D7; color: #822727;
      &:hover {
        background: var(--danger); color: white;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(229,62,62,0.3);
      }
      &:active { transform: translateY(0); }
    }
    .btn-approve {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      box-shadow: 0 4px 14px rgba(11,110,126,0.25);
      &:hover {
        background: linear-gradient(135deg, var(--primary-dark), var(--primary));
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(11,110,126,0.35);
      }
      &:active { transform: translateY(0); }
    }

    /* ── Empty state ── */
    .empty-dem {
      text-align: center; padding: 60px 40px;
      color: var(--text-light);
      animation: fadeIn 0.4s ease;
      > span {
        display: flex; justify-content: center;
        margin-bottom: 14px; opacity: 0.3;
        svg { display: block; }
      }
      p { font-size: 15px; font-weight: 600; }
    }

    /* ── Toast ── */
    .g-toast {
      position: fixed; bottom: 28px; right: 28px;
      display: flex; align-items: center; gap: 8px;
      padding: 13px 20px; border-radius: 14px;
      font-size: 13px; font-weight: 600;
      transform: translateY(80px) scale(0.95);
      opacity: 0; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      z-index: 2000;
      svg { display: block; }
      &.show    { transform: translateY(0) scale(1); opacity: 1; }
      &.success { background: #C6F6D5; color: #276749; box-shadow: 0 8px 24px rgba(39,103,73,0.2); }
      &.error   { background: #FED7D7; color: #822727; box-shadow: 0 8px 24px rgba(130,39,39,0.2); }
      &.info    { background: var(--accent); color: var(--primary); box-shadow: 0 8px 24px rgba(11,110,126,0.2); }
    }

    /* ── Animations ── */
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.35s ease; }

    /* ── Edit Input ── */
    .edit-input {
      width: 100%; padding: 6px 10px; border: 1.5px solid var(--gray-mid);
      border-radius: 6px; font-size: 13px; font-weight: 600;
      color: var(--primary); background: white; transition: all 0.2s;
      &:focus { border-color: var(--secondary); outline: none; box-shadow: 0 0 0 3px rgba(14,157,175,0.1); }
    }

    .dcg-justif { grid-column: 1 / -1; }

    .justif-link {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px;
      background: linear-gradient(135deg, rgba(11,110,126,0.08), rgba(14,157,175,0.12));
      color: var(--primary); font-size: 12px; font-weight: 600;
      text-decoration: none; transition: all 0.25s ease;
      border: 1px solid rgba(11,110,126,0.15);
      &:hover {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white; transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(11,110,126,0.25);
        border-color: transparent;
      }
    }
  `]
})
export class RhValidationComponent implements OnInit {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  ic = IC;

  conges        = signal<any[]>([]);
  autorisations = signal<any[]>([]);
  avances       = signal<any[]>([]);
  augmentations = signal<any[]>([]);
  loading       = signal(true);
  activeType    = signal<TypeDemande>('conges');
  comments: Record<number, string> = {};

  toast = signal<{show:boolean; message:string; type:string}>(
    { show: false, message: '', type: 'success' }
  );

  typeTabs = [
    { key: 'conges'        as TypeDemande, svg: IC.calendar,   label: 'Congés'        },
    { key: 'autorisations' as TypeDemande, svg: IC.clock,      label: 'Autorisations' },
    { key: 'avances'       as TypeDemande, svg: IC.banknote,   label: 'Avances'       },
    { key: 'augmentations' as TypeDemande, svg: IC.trendingUp, label: 'Augmentations' }
  ];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      conges:        this.http.get<any[]>(`${this.API}/rh/conges/en-attente`),
      autorisations: this.http.get<any[]>(`${this.API}/rh/sorties/en-attente`),
      avances:       this.http.get<any[]>(`${this.API}/rh/avances/en-attente`),
      augmentations: this.http.get<any[]>(`${this.API}/rh/augmentations/en-attente`)
    }).subscribe({
      next: (d) => {
        this.conges.set(d.conges ?? []);
        this.autorisations.set(d.autorisations ?? []);
        // Initialiser les champs d'édition pour les avances
        const avances = (d.avances ?? []).map((a: any) => ({
          ...a,
          montantAccordeEdit: a.montantDemande,
          mensualitesEdit: a.nombreMensualites
        }));
        this.avances.set(avances);
        this.augmentations.set(d.augmentations ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCongesRH():        any[] { return this.conges().filter(c => c.statut === 'EN_ATTENTE_RH'); }
  getAutorisationsRH(): any[] { return this.autorisations().filter(a => a.statut === 'EN_ATTENTE_RH'); }
  getAvancesRH():       any[] { return this.avances().filter(a => a.statut === 'EN_ATTENTE_RH'); }
  getAugmentationsRH(): any[] { return this.augmentations().filter(a => a.statut === 'EN_ATTENTE_RH'); }

  getCount(type: TypeDemande): number {
    return { conges: this.getCongesRH().length, autorisations: this.getAutorisationsRH().length,
             avances: this.getAvancesRH().length, augmentations: this.getAugmentationsRH().length }[type];
  }

  totalEnAttente(): number {
    return this.getCongesRH().length + this.getAutorisationsRH().length +
           this.getAvancesRH().length + this.getAugmentationsRH().length;
  }

  validerConge(id: number, approuve: boolean): void {
    // ✅ OK: /rh/conges/{id}/valider existe dans le Swagger
    this.http.put(`${this.API}/rh/conges/${id}/valider`,
      { approuve, commentaire: this.comments[id] ?? '' }
    ).subscribe({
      next:  () => { this.conges.update(l => l.filter(c => c.id !== id));
                     this.showToast(approuve ? 'Congé validé' : 'Congé refusé', approuve ? 'success' : 'info'); },
      error: () => this.showToast('Erreur serveur', 'error')
    });
  }

  validerAvance(id: number, approuve: boolean): void {
    const avance = this.avances().find((a: any) => a.id === id);
    this.http.put(`${this.API}/rh/avances/${id}/traiter`,
      approuve
        ? { approuve: true,
            montantAccorde:    avance?.montantAccordeEdit || avance?.montantDemande,
            nombreMensualites: avance?.mensualitesEdit || avance?.nombreMensualites,
            commentaire: this.comments[id] ?? '' }
        : { approuve: false, commentaire: this.comments[id] ?? '' }
    ).subscribe({
      next:  (res: any) => { 
        this.avances.update(l => l.filter((a: any) => a.id !== id));
        if (res && res.statut === 'MODIFIEE_PAR_RH') {
          this.showToast('Modifications envoyées à l\'employé pour confirmation', 'info');
        } else {
          this.showToast(approuve ? 'Avance accordée — employé notifié' : 'Avance refusée', approuve ? 'success' : 'info'); 
        }
      },
      error: (err: any) => this.showToast(err?.error?.message ?? 'Erreur serveur', 'error')
    });
  }

  validerAugmentation(id: number, approuve: boolean): void {
    // ✅ FIX: "traiter" au lieu de "valider" → /rh/augmentations/{id}/traiter
    this.http.put(`${this.API}/rh/augmentations/${id}/traiter`,
      { approuve, commentaire: this.comments[id] ?? '' }
    ).subscribe({
      next:  () => { this.augmentations.update(l => l.filter(a => a.id !== id));
                     this.showToast(approuve ? 'Augmentation validée — salaire mis à jour' : 'Augmentation refusée', approuve ? 'success' : 'info'); },
      error: () => this.showToast('Erreur serveur', 'error')
    });
  }

  validerAutorisation(id: number, approuve: boolean): void {
    this.http.put(`${this.API}/rh/sorties/${id}/valider`,
      { approuve, commentaire: this.comments[id] ?? '' }
    ).subscribe({
      next:  () => { this.autorisations.update(l => l.filter(a => a.id !== id));
                     this.showToast(approuve ? 'Autorisation approuvée' : 'Autorisation refusée', approuve ? 'success' : 'info'); },
      error: () => this.showToast('Erreur serveur', 'error')
    });
  }


  getInit(p: string, n: string): string {
    return ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase();
  }

  getJustificatifUrl(path: string): string {
    return environment.apiUrl + path;
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}


