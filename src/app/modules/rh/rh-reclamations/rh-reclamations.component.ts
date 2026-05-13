import { environment } from '../../../../environments/environment';
// src/app/modules/rh/rh-reclamations/rh-reclamations.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rh-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="rh-reclam">

    <!-- ══════════ HEADER ══════════ -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1
                     2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="ph-text">
          <h1>Réclamations</h1>
          <p>
            <span class="ph-alert" *ngIf="getOuvertes() > 0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ getOuvertes() }} ticket(s) ouvert(s) nécessitent votre attention
            </span>
            <span *ngIf="getOuvertes() === 0" class="ph-ok">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Tout est traité
            </span>
          </p>
        </div>
      </div>
      <div class="ph-stat-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        {{ reclamations().length }} au total
      </div>
    </div>

    <!-- ══════════ KPIs ══════════ -->
    <div class="kpi-row">

      <div class="kpi-card" style="--d:0ms">
        <div class="kc-icon primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14
                     a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ reclamations().length }}</span>
          <span class="kc-label">Total</span>
        </div>
      </div>

      <div class="kpi-card" style="--d:70ms">
        <div class="kc-icon info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ getCountByStatut('NOUVELLE') }}</span>
          <span class="kc-label">Nouvelles</span>
        </div>
      </div>

      <div class="kpi-card" style="--d:140ms">
        <div class="kc-icon warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{ getCountByStatut('EN_COURS') }}</span>
          <span class="kc-label">En cours</span>
        </div>
      </div>

      <div class="kpi-card" style="--d:210ms">
        <div class="kc-icon success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kc-body">
          <span class="kc-val">{{
            getCountByStatut('RESOLUE') + getCountByStatut('CLOTUREE')
          }}</span>
          <span class="kc-label">Résolues</span>
        </div>
      </div>

    </div>

    <!-- ══════════ FILTRES ══════════ -->
    <div class="filters-bar">
      <div class="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Rechercher une réclamation..."
               [(ngModel)]="search" />
      </div>

      <div class="filter-pills">
        <button class="fp-btn"
                *ngFor="let s of statutOptions"
                [class.active]="statutFilter === s.val"
                (click)="statutFilter = s.val">
          <div class="fp-dot" [class]="'dot-' + s.key"></div>
          {{ s.label }}
          <span class="fp-count">{{ getCountByStatut(s.val) }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════ LISTE RÉCLAMATIONS ══════════ -->
    <div class="reclam-list">
      <div class="reclam-card"
           *ngFor="let r of filtered(); let i = index"
           [class.urgente]="r.urgence === 'HAUTE'"
           [style.animation-delay]="(i * 50) + 'ms'"
           (click)="openDetail(r)">

        <div class="rc-header">
          <div class="rc-ticket">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2
                       2 0 0 1 2-2h8"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            #{{ r.id?.toString().padStart(5, '0') }}
          </div>
          <div class="rc-badges">
            <span class="rc-urgence" [class]="'urg-' + r.urgence?.toLowerCase()">
              <div class="urg-dot"></div>
              {{ r.urgence }}
            </span>
            <span class="rc-type">{{ r.type }}</span>
            <div class="rc-statut" [class]="getStatutClass(r.statut)">
              <div class="sb-dot"></div>
              {{ getStatutLabel(r.statut) }}
            </div>
          </div>
        </div>

        <div class="rc-body">
          <h3 class="rc-objet">{{ r.objet }}</h3>
          <p class="rc-desc">
            {{ r.description?.substring(0, 120) }}
            <span *ngIf="r.description?.length > 120">…</span>
          </p>
        </div>

        <div class="rc-footer">
          <div class="rcf-left">
            <div class="rcf-auteur" *ngIf="!r.anonyme">
              <div class="rcf-av">
                {{ getInit(r.employePrenom, r.employeNom) }}
              </div>
              {{ r.employePrenom }} {{ r.employeNom }}
            </div>
            <div class="rcf-auteur anon" *ngIf="r.anonyme">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Anonyme
            </div>
            <div class="rcf-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ r.createdAt | date:'dd/MM/yyyy' }}
            </div>
          </div>

          <div class="rcf-actions" (click)="$event.stopPropagation()">
            <button class="rc-btn"
                    *ngIf="r.statut === 'NOUVELLE'"
                    (click)="changerStatut(r, 'EN_COURS')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Prendre en charge
            </button>
            <button class="rc-btn success"
                    *ngIf="r.statut === 'EN_COURS'"
                    (click)="changerStatut(r, 'RESOLUE')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Marquer résolue
            </button>
            <button class="rc-btn muted"
                    *ngIf="r.statut === 'RESOLUE'"
                    (click)="changerStatut(r, 'CLOTUREE')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Clôturer
            </button>
          </div>
        </div>

      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="filtered().length === 0">
        <div class="es-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.4"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14
                     a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p>Aucune réclamation trouvée</p>
        <small>Modifiez les filtres pour afficher plus de résultats</small>
      </div>
    </div>

    <!-- ══════════ DRAWER DÉTAIL ══════════ -->
    <div class="drawer-overlay"
         *ngIf="detailOpen()"
         (click)="detailOpen.set(false)">
    </div>

    <div class="detail-drawer"
         [class.open]="detailOpen()"
         *ngIf="selectedReclam()">

      <div class="dd-header">
        <div class="dd-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14
                     a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="dd-header-text">
          <h2>{{ selectedReclam()?.objet }}</h2>
          <p>Ticket #{{ selectedReclam()?.id?.toString().padStart(5,'0') }}</p>
        </div>
        <button class="dd-close" (click)="detailOpen.set(false)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="dd-body">

        <!-- Infos -->
        <div class="dd-section">
          <div class="dd-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Informations
          </div>
          <div class="dd-grid">
            <div class="dd-item">
              <span>Statut</span>
              <div class="rc-statut"
                   [class]="getStatutClass(selectedReclam()?.statut)">
                <div class="sb-dot"></div>
                {{ getStatutLabel(selectedReclam()?.statut) }}
              </div>
            </div>
            <div class="dd-item">
              <span>Urgence</span>
              <span class="rc-urgence"
                    [class]="'urg-' + selectedReclam()?.urgence?.toLowerCase()">
                <div class="urg-dot"></div>
                {{ selectedReclam()?.urgence }}
              </span>
            </div>
            <div class="dd-item">
              <span>Type</span>
              <strong>{{ selectedReclam()?.type }}</strong>
            </div>
            <div class="dd-item">
              <span>Auteur</span>
              <strong>
                <ng-container *ngIf="selectedReclam()?.anonyme">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round"
                       style="vertical-align:middle;margin-right:3px">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Anonyme
                </ng-container>
                <ng-container *ngIf="!selectedReclam()?.anonyme">
                  {{ selectedReclam()?.employePrenom }}
                  {{ selectedReclam()?.employeNom }}
                </ng-container>
              </strong>
            </div>
            <div class="dd-item">
              <span>Soumis le</span>
              <strong>
                {{ selectedReclam()?.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </strong>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="dd-section">
          <div class="dd-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="17" y1="10" x2="3" y2="10"/>
              <line x1="21" y1="6"  x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/>
              <line x1="17" y1="18" x2="3" y2="18"/>
            </svg>
            Description
          </div>
          <p class="dd-desc">{{ selectedReclam()?.description }}</p>
        </div>

        <!-- Thread réponses -->
        <div class="dd-section" *ngIf="reponses().length > 0">
          <div class="dd-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1
                       2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Historique des échanges
          </div>
          <div class="reponse-thread">
            <div class="rt-item"
                 *ngFor="let rep of reponses(); let i = index"
                 [class.rh-rep]="rep.auteur === 'RH'"
                 [style.animation-delay]="(i * 60) + 'ms'">
              <div class="rti-header">
                <div class="rti-auteur">
                  <div class="rti-av" [class.rh]="rep.auteur === 'RH'">
                    {{ rep.auteur === 'RH' ? 'RH' : 'E' }}
                  </div>
                  {{ rep.auteur === 'RH' ? 'Équipe RH' : 'Employé' }}
                </div>
                <span class="rti-date">
                  {{ rep.createdAt | date:'dd/MM HH:mm' }}
                </span>
              </div>
              <p>{{ rep.contenu }}</p>
            </div>
          </div>
        </div>

        <!-- Répondre -->
        <div class="dd-section"
             *ngIf="selectedReclam()?.statut !== 'CLOTUREE'">
          <div class="dd-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14
                       a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1
                       1-4 9.5-9.5z"/>
            </svg>
            Répondre
          </div>
          <div class="textarea-wrap">
            <textarea [(ngModel)]="reponseText"
                      placeholder="Votre réponse à l'employé..."
                      rows="4">
            </textarea>
          </div>
          <button class="btn-send" (click)="envoyerReponse()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Envoyer la réponse
          </button>
        </div>

        <!-- Actions statut -->
        <div class="dd-actions"
             *ngIf="selectedReclam()?.statut !== 'CLOTUREE'">
          <button class="btn-statut primary"
                  *ngIf="selectedReclam()?.statut === 'NOUVELLE'"
                  (click)="changerStatut(selectedReclam(), 'EN_COURS')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Prendre en charge
          </button>
          <button class="btn-statut success"
                  *ngIf="selectedReclam()?.statut === 'EN_COURS'"
                  (click)="changerStatut(selectedReclam(), 'RESOLUE')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Marquer résolue
          </button>
          <button class="btn-statut muted"
                  *ngIf="selectedReclam()?.statut === 'RESOLUE'"
                  (click)="changerStatut(selectedReclam(), 'CLOTUREE')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Clôturer le ticket
          </button>
        </div>

        <!-- Ticket clôturé -->
        <div class="closed-banner"
             *ngIf="selectedReclam()?.statut === 'CLOTUREE'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Ce ticket est clôturé
        </div>

      </div>
    </div>

    <!-- ══════════ TOAST ══════════ -->
    <div class="g-toast"
         [class.show]="toast().show"
         [class]="'g-toast ' + toast().type">
      <div class="toast-icon">
        <svg *ngIf="toast().type === 'success'"
             width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="3"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg *ngIf="toast().type === 'error'"
             width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="3"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      {{ toast().message }}
    </div>

    <!-- ══════════ MODAL RÉSOLUTION ══════════ -->
    <div class="modal-overlay" *ngIf="resolueModal()"
         (click)="resolueModal.set(false)"></div>
    <div class="modal-resolue" *ngIf="resolueModal()">
      <div class="mr-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <div>
          <h3>Marquer comme résolue</h3>
          <p>Réclamation #{{ resolueReclam()?.id }} — {{ resolueReclam()?.sujet }}</p>
        </div>
        <button class="mr-close" (click)="resolueModal.set(false)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="mr-body">
        <label>Réponse / Résolution RH <span style="color:var(--danger)">*</span></label>
        <textarea [(ngModel)]="reponseRH"
                  placeholder="Décrivez la résolution apportée à cette réclamation…"
                  rows="4"></textarea>
      </div>
      <div class="mr-actions">
        <button class="btn-outline" (click)="resolueModal.set(false)">Annuler</button>
        <button class="btn-success" (click)="confirmerResolution()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Confirmer la résolution
        </button>
      </div>
    </div>

  </div>
  `,
  styles: [`
    /* ════════════════════════════════════════
       TOKENS
    ════════════════════════════════════════ */
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
      --shadow-lg:    0 16px 48px rgba(11,110,126,0.18);
      --radius-sm:    8px;
      --radius-md:    12px;
      --radius-lg:    16px;
    }

    /* ── Keyframes ── */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes drawerIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(10px) scale(0.94); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes threadIn {
      from { opacity: 0; transform: translateX(10px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes urgentPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.2); }
      50%       { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
    }

    /* ════════════════════════════════════════
       BASE
    ════════════════════════════════════════ */
    .rh-reclam {
      max-width: 100%;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: var(--text);
      animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }

    /* ════════════════════════════════════════
       HEADER
    ════════════════════════════════════════ */
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 26px;
      animation: slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
    }
    .ph-left { display: flex; align-items: center; gap: 16px; }
    .ph-icon {
      width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      color: white;
      box-shadow: 0 8px 24px rgba(11,110,126,0.28);
    }
    .ph-text h1 {
      font-size: 21px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.3px;
    }
    .ph-text p { font-size: 12.5px; margin-top: 3px; }
    .ph-alert {
      display: inline-flex; align-items: center; gap: 5px;
      color: var(--warning); font-weight: 600;
      svg { flex-shrink: 0; }
    }
    .ph-ok {
      display: inline-flex; align-items: center; gap: 5px;
      color: var(--success); font-weight: 600;
    }
    .ph-stat-badge {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 14px; background: var(--gray-light);
      border-radius: 20px; font-size: 12.5px;
      font-weight: 600; color: var(--text-light);
      border: 1px solid var(--gray-mid);
    }

    /* ════════════════════════════════════════
       KPIs
    ════════════════════════════════════════ */
    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--white); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-sm);
      display: flex; align-items: center; gap: 14px;
      border: 1px solid transparent;
      animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1)
                 calc(var(--d, 0ms)) both;
      transition: transform var(--transition),
                  box-shadow var(--transition),
                  border-color var(--transition);
      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--gray-mid);
      }
    }
    .kc-icon {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      &.primary { background: var(--accent);      color: var(--primary); }
      &.info    { background: var(--info-bg);      color: var(--info); }
      &.warning { background: var(--warning-bg);  color: var(--warning); }
      &.success { background: var(--success-bg);  color: var(--success); }
    }
    .kc-body { flex: 1; }
    .kc-val {
      display: block; font-size: 24px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.5px; line-height: 1.1;
    }
    .kc-label { font-size: 11.5px; color: var(--text-light); font-weight: 500; }

    /* ════════════════════════════════════════
       FILTRES
    ════════════════════════════════════════ */
    .filters-bar {
      display: flex; gap: 12px; flex-wrap: wrap;
      margin-bottom: 20px; align-items: center;
    }
    .search-box {
      flex: 1; min-width: 220px;
      display: flex; align-items: center; gap: 9px;
      background: var(--white);
      border: 1.5px solid var(--gray-mid);
      border-radius: var(--radius-md); padding: 0 14px;
      transition: border-color var(--transition),
                  box-shadow var(--transition);
      &:focus-within {
        border-color: var(--secondary);
        box-shadow: 0 0 0 3px rgba(20,184,196,0.12);
      }
      svg { color: var(--text-light); flex-shrink: 0; }
      input {
        flex: 1; border: none; outline: none;
        padding: 11px 0; font-size: 13px;
        background: transparent; color: var(--text);
        &::placeholder { color: var(--text-light); }
      }
    }
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .fp-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 13px; border: 1.5px solid var(--gray-mid);
      background: var(--white); border-radius: 20px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: var(--text-light);
      transition: all var(--transition);
      &.active {
        background: var(--primary); color: var(--white);
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(11,110,126,0.25);
        .fp-count { background: rgba(255,255,255,0.22); color: white; }
        .fp-dot   { filter: brightness(5); }
      }
      &:hover:not(.active) {
        border-color: var(--primary); color: var(--primary);
        background: var(--accent);
      }
    }
    .fp-dot {
      width: 8px; height: 8px; border-radius: 50%;
      &.dot-       { background: var(--text-light); }
      &.dot-NOUVELLE  { background: var(--info); }
      &.dot-EN_COURS  { background: var(--warning); }
      &.dot-RESOLUE   { background: var(--success); }
      &.dot-CLOTUREE  { background: var(--text-light); }
    }
    .fp-count {
      background: var(--gray-light); color: var(--text-light);
      padding: 1px 7px; border-radius: 10px; font-size: 10.5px;
      font-weight: 700; transition: all var(--transition);
    }

    /* ════════════════════════════════════════
       CARTES RÉCLAMATIONS
    ════════════════════════════════════════ */
    .reclam-list { display: flex; flex-direction: column; gap: 12px; }

    .reclam-card {
      background: var(--white); border-radius: var(--radius-lg);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      border: 1.5px solid var(--gray-light);
      cursor: pointer;
      display: flex; flex-direction: column; gap: 13px;
      animation: cardIn 0.4s cubic-bezier(0.4,0,0.2,1) both;
      transition: transform var(--transition),
                  box-shadow var(--transition),
                  border-color var(--transition);
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--secondary);
      }
      &.urgente {
        border-left: 4px solid var(--danger);
        animation: cardIn 0.4s cubic-bezier(0.4,0,0.2,1) both,
                   urgentPulse 2.5s 1s ease-in-out;
      }
    }

    .rc-header {
      display: flex; align-items: center;
      justify-content: space-between; flex-wrap: wrap; gap: 8px;
    }
    .rc-ticket {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11.5px; font-weight: 800; color: var(--primary);
      background: var(--accent); padding: 4px 11px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.3px;
    }
    .rc-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .rc-urgence {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      .urg-dot { width: 6px; height: 6px; border-radius: 50%; }
      &.urg-haute {
        background: var(--danger-bg); color: var(--danger);
        .urg-dot { background: var(--danger); }
      }
      &.urg-moyenne {
        background: var(--warning-bg); color: var(--warning);
        .urg-dot { background: var(--warning); }
      }
      &.urg-basse {
        background: var(--success-bg); color: var(--success);
        .urg-dot { background: var(--success); }
      }
    }
    .rc-type {
      background: var(--gray-light); color: var(--text-light);
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
    }
    .rc-statut {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      .sb-dot { width: 6px; height: 6px; border-radius: 50%; }
      &.st-nouvelle {
        background: var(--info-bg); color: var(--info);
        .sb-dot { background: var(--info); }
      }
      &.st-en_cours {
        background: var(--warning-bg); color: var(--warning);
        .sb-dot { background: var(--warning); }
      }
      &.st-resolue {
        background: var(--success-bg); color: var(--success);
        .sb-dot { background: var(--success); }
      }
      &.st-cloturee {
        background: var(--gray-mid); color: var(--text-light);
        .sb-dot { background: var(--text-light); }
      }
    }

    .rc-body {
      .rc-objet {
        font-size: 15px; font-weight: 700;
        color: var(--primary-dark); margin-bottom: 5px;
        letter-spacing: -0.2px;
      }
      .rc-desc {
        font-size: 13px; color: var(--text-light); line-height: 1.55;
      }
    }

    .rc-footer {
      display: flex; align-items: center;
      justify-content: space-between; flex-wrap: wrap; gap: 8px;
      padding-top: 12px; border-top: 1px solid var(--gray-light);
    }
    .rcf-left { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
    .rcf-auteur {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-light); font-weight: 500;
      &.anon { color: var(--warning); font-weight: 600; }
    }
    .rcf-av {
      width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; font-weight: 800; color: white;
    }
    .rcf-date {
      display: flex; align-items: center; gap: 5px;
      font-size: 11.5px; color: var(--text-light);
    }
    .rcf-actions { display: flex; gap: 6px; }
    .rc-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 13px; border: none; border-radius: var(--radius-sm);
      font-size: 12px; font-weight: 700; cursor: pointer;
      font-family: inherit;
      background: var(--primary); color: white;
      transition: all var(--transition);
      &:hover { opacity: 0.85; transform: translateY(-1px); }
      &.success { background: var(--success); }
      &.muted {
        background: var(--gray-light); color: var(--text);
        border: 1px solid var(--gray-mid);
      }
    }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 60px 20px;
      color: var(--text-light);
      animation: fadeIn 0.4s ease;
    }
    .es-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: var(--gray-light); margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light); opacity: 0.5;
    }
    .empty-state p     { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .empty-state small { font-size: 12px; }

    /* ════════════════════════════════════════
       DRAWER DÉTAIL
    ════════════════════════════════════════ */
    .drawer-overlay {
      position: fixed; inset: 0;
      background: rgba(7,79,92,0.35);
      backdrop-filter: blur(4px);
      z-index: 900;
      animation: fadeIn 0.2s ease;
    }
    .detail-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 500px; max-width: 100vw;
      background: var(--white); z-index: 1000;
      box-shadow: -12px 0 48px rgba(0,0,0,0.14);
      transform: translateX(100%);
      transition: transform 0.38s cubic-bezier(0.22,1,0.36,1);
      display: flex; flex-direction: column;
      &.open { transform: translateX(0); }
    }
    .dd-header {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 22px 22px 18px; flex-shrink: 0;
      border-bottom: 1px solid var(--gray-mid);
      background: linear-gradient(135deg, var(--accent) 0%, white 60%);
    }
    .dd-header-icon {
      width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
      background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
    }
    .dd-header-text { flex: 1; min-width: 0; }
    .dd-header-text h2 {
      font-size: 15px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.2px;
    }
    .dd-header-text p {
      font-size: 12px; color: var(--text-light); margin-top: 3px;
    }
    .dd-close {
      width: 32px; height: 32px; border: 1.5px solid var(--gray-mid);
      background: var(--white); border-radius: 50%; cursor: pointer;
      color: var(--text-light); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      &:hover {
        background: var(--danger-bg); color: var(--danger);
        border-color: var(--danger);
      }
    }
    .dd-body { flex: 1; overflow-y: auto; padding: 20px 22px; }
    .dd-section {
      margin-bottom: 22px; padding-bottom: 20px;
      border-bottom: 1px solid var(--gray-light);
      &:last-child { border-bottom: none; }
    }
    .dd-section-title {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; font-weight: 800;
      color: var(--text-light); text-transform: uppercase;
      letter-spacing: 0.8px; margin-bottom: 12px;
    }
    .dd-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .dd-item {
      display: flex; flex-direction: column; gap: 5px;
      span:first-child {
        font-size: 10px; font-weight: 700; color: var(--text-light);
        text-transform: uppercase; letter-spacing: 0.5px;
      }
    }
    .dd-desc {
      font-size: 13.5px; color: var(--text); line-height: 1.65;
      background: var(--gray-light); border-radius: var(--radius-sm);
      padding: 12px 14px;
    }

    /* Thread */
    .reponse-thread { display: flex; flex-direction: column; gap: 10px; }
    .rt-item {
      border-radius: var(--radius-md); padding: 13px 14px;
      background: var(--gray-light);
      animation: threadIn 0.35s cubic-bezier(0.4,0,0.2,1) both;
      &.rh-rep { background: var(--accent); }
      p { font-size: 13px; color: var(--text); line-height: 1.55; }
    }
    .rti-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 8px;
    }
    .rti-auteur {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; font-weight: 700; color: var(--primary-dark);
    }
    .rti-av {
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--gray-mid); color: var(--text-light);
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; font-weight: 800;
      &.rh {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
      }
    }
    .rti-date { font-size: 10.5px; color: var(--text-light); }

    /* Textarea */
    .textarea-wrap {
      border: 1.5px solid var(--gray-mid); border-radius: var(--radius-md);
      overflow: hidden; transition: border-color var(--transition),
                                    box-shadow var(--transition);
      &:focus-within {
        border-color: var(--secondary);
        box-shadow: 0 0 0 3px rgba(20,184,196,0.12);
      }
    }
    textarea {
      width: 100%; padding: 11px 13px;
      border: none; outline: none; resize: none;
      font-size: 13px; font-family: inherit; color: var(--text);
      background: transparent; display: block;
      &::placeholder { color: var(--text-light); }
    }
    .btn-send {
      margin-top: 10px; padding: 10px 18px;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      border: none; width: 100%; border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white; cursor: pointer; font-size: 13px; font-weight: 700;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(11,110,126,0.28);
      transition: all var(--transition);
      &:hover { opacity: 0.88; transform: translateY(-1px); }
    }

    /* Actions */
    .dd-actions { display: flex; gap: 8px; }
    .btn-statut {
      flex: 1; padding: 11px 14px;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      border: none; border-radius: var(--radius-md);
      font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit;
      transition: all var(--transition);
      &.primary {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        box-shadow: 0 4px 14px rgba(11,110,126,0.28);
      }
      &.success {
        background: var(--success); color: white;
        box-shadow: 0 4px 14px rgba(5,150,105,0.28);
      }
      &.muted {
        background: var(--gray-light); color: var(--text);
        border: 1.5px solid var(--gray-mid);
      }
      &:hover { opacity: 0.85; transform: translateY(-1px); }
    }
    .closed-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; background: var(--gray-light);
      border-radius: var(--radius-md);
      font-size: 13px; font-weight: 600; color: var(--text-light);
      border: 1.5px solid var(--gray-mid);
    }

    /* ════════════════════════════════════════
       TOAST
    ════════════════════════════════════════ */
    .g-toast {
      position: fixed; bottom: 28px; right: 28px;
      display: flex; align-items: center; gap: 10px;
      padding: 13px 18px; border-radius: 14px;
      font-size: 13px; font-weight: 600;
      opacity: 0; transform: translateY(14px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      z-index: 2000; box-shadow: var(--shadow-md);
      &.show {
        opacity: 1; transform: translateY(0) scale(1);
        animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }
      &.success { background: var(--success-bg); color: var(--success); }
      &.error   { background: var(--danger-bg);  color: var(--danger); }
      &.info    { background: var(--info-bg);    color: var(--info); }
    }
    .toast-icon {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      .success & { background: var(--success); color: white; }
      .error   & { background: var(--danger);  color: white; }
    }

    /* ════════════════════════════════════════
       RESPONSIVE
    ════════════════════════════════════════ */
    @media (max-width: 768px) {
      .kpi-row        { grid-template-columns: repeat(2,1fr); }
      .detail-drawer  { width: 100vw; }
      .ph-stat-badge  { display: none; }
    }

    /* ════════════════════════════════════════
       MODAL RÉSOLUTION
    ════════════════════════════════════════ */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      z-index: 1000; backdrop-filter: blur(2px);
    }
    .modal-resolue {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(480px, 95vw);
      background: white; border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      z-index: 1001; overflow: hidden;
    }
    .mr-header {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 20px 20px 16px;
      background: var(--success-bg, #f0fdf4);
      border-bottom: 1px solid var(--success-border, #bbf7d0);
      svg { color: var(--success, #16a34a); margin-top: 2px; flex-shrink: 0; }
      h3 { margin: 0 0 2px; font-size: 15px; font-weight: 700; }
      p  { margin: 0; font-size: 12px; color: #6b7280; }
    }
    .mr-close {
      margin-left: auto; background: none; border: none;
      cursor: pointer; color: #9ca3af; padding: 2px;
      &:hover { color: #374151; }
    }
    .mr-body {
      padding: 20px;
      label { display: block; font-size: 12px; font-weight: 600;
              color: #374151; margin-bottom: 8px; }
      textarea {
        width: 100%; border: 1.5px solid #e5e7eb;
        border-radius: 8px; padding: 10px 12px;
        font-size: 13px; resize: vertical; font-family: inherit;
        transition: border-color .2s;
        &:focus { outline: none; border-color: var(--success, #16a34a); }
      }
    }
    .mr-actions {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 0 20px 20px;
    }
    .btn-outline {
      padding: 9px 16px; border: 1.5px solid #e5e7eb;
      border-radius: 8px; background: white; cursor: pointer;
      font-size: 13px; font-weight: 600; color: #374151;
      &:hover { background: #f9fafb; }
    }
    .btn-success {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border: none; border-radius: 8px;
      background: var(--success, #16a34a); color: white;
      cursor: pointer; font-size: 13px; font-weight: 700;
      &:hover { opacity: .88; }
    }
  `]
})
export class RhReclamationsComponent implements OnInit {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  reclamations   = signal<any[]>([]);
  detailOpen     = signal(false);
  selectedReclam = signal<any>(null);
  reponses       = signal<any[]>([]);

  search       = '';
  statutFilter = '';
  reponseText  = '';

  toast = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  statutOptions = [
    { val: '',          key: '',          label: 'Toutes'   },
    { val: 'NOUVELLE',  key: 'NOUVELLE',  label: 'Nouvelles' },
    { val: 'EN_COURS',  key: 'EN_COURS',  label: 'En cours'  },
    { val: 'RESOLUE',   key: 'RESOLUE',   label: 'Résolues'  },
    { val: 'CLOTUREE',  key: 'CLOTUREE',  label: 'Clôturées' }
  ];

  ngOnInit(): void {
    this.http.get<any[]>(`${this.API}/rh/reclamations`).subscribe({
      next: d => this.reclamations.set(d ?? [])
    });
  }

  filtered(): any[] {
    return this.reclamations().filter(r => {
      const t = this.search.toLowerCase();
      const m = !t ||
        (r.objet       ?? '').toLowerCase().includes(t) ||
        (r.description ?? '').toLowerCase().includes(t) ||
        (r.employeNom  ?? '').toLowerCase().includes(t);
      const s = !this.statutFilter || r.statut === this.statutFilter;
      return m && s;
    });
  }

  getOuvertes(): number {
    return this.reclamations().filter(r => r.statut !== 'CLOTUREE').length;
  }

  getCountByStatut(statut: string): number {
    if (!statut) return this.reclamations().length;
    return this.reclamations().filter(r => r.statut === statut).length;
  }

  openDetail(r: any): void {
    this.selectedReclam.set(r);
    this.reponseText = '';
    this.detailOpen.set(true);
    this.http.get<any>(
      `${this.API}/rh/reclamations/${r.id}`
    ).subscribe({
      next: d => {
        this.selectedReclam.set(d);
        this.reponses.set(d?.commentaires ?? []);
      },
      error: () => this.reponses.set([])
    });
  }

  // ── Modal réponse RH (pour marquer RESOLUE) ──────
  resolueModal  = signal(false);
  resolueReclam = signal<any | null>(null);
  reponseRH     = '';

  ouvrirResolution(r: any): void {
    this.resolueReclam.set(r);
    this.reponseRH = '';
    this.resolueModal.set(true);
  }

  confirmerResolution(): void {
    if (!this.reponseRH.trim()) {
      this.showToast('La réponse RH est obligatoire', 'error');
      return;
    }
    const r = this.resolueReclam();
    if (!r) return;
    this.http.put(
      `${this.API}/rh/reclamations/${r.id}/traiter`,
      { statut: 'RESOLUE', reponseRH: this.reponseRH }
    ).subscribe({
      next: (updated: any) => {
        this.resolueModal.set(false);
        this._appliquerStatut(r.id, 'RESOLUE', updated);
        this.showToast('Réclamation marquée résolue', 'success');
      },
      error: (err) => this.showToast(
        err?.error?.message ?? 'Erreur lors de la résolution', 'error')
    });
  }

  changerStatut(r: any, newStatut: string): void {
    if (newStatut === 'EN_COURS') {
      // → PUT /{id}/prendre-en-charge
      this.http.put(
        `${this.API}/rh/reclamations/${r.id}/prendre-en-charge`, {}
      ).subscribe({
        next: (updated: any) => {
          this._appliquerStatut(r.id, 'EN_COURS', updated);
          this.showToast('Réclamation prise en charge', 'success');
        },
        error: (err) => this.showToast(
          err?.error?.message ?? 'Erreur lors de la mise à jour', 'error')
      });
    } else if (newStatut === 'RESOLUE') {
      // → ouvre un modal pour saisir la réponse RH
      this.ouvrirResolution(r);
    } else if (newStatut === 'CLOTUREE') {
      // → PUT /{id}/cloturer
      this.http.put(
        `${this.API}/rh/reclamations/${r.id}/cloturer`, {}
      ).subscribe({
        next: (updated: any) => {
          this._appliquerStatut(r.id, 'CLOTUREE', updated);
          this.showToast('Réclamation clôturée', 'success');
        },
        error: (err) => this.showToast(
          err?.error?.message ?? 'Erreur lors de la clôture', 'error')
      });
    }
  }

  private _appliquerStatut(id: number, statut: string, updated: any): void {
    this.reclamations.update(list =>
      list.map(x => x.id === id ? { ...x, statut, ...updated } : x));
    if (this.selectedReclam()?.id === id)
      this.selectedReclam.update(x => ({ ...x, statut, ...updated }));
  }

  envoyerReponse(): void {
    if (!this.reponseText.trim()) return;
    const r = this.selectedReclam();
    if (!r) return;
    this.http.post(
      `${this.API}/rh/reclamations/${r.id}/commentaires`,
      { contenu: this.reponseText }
    ).subscribe({
      next: (rep: any) => {
        this.reponses.update(list => [...list, rep]);
        this.reponseText = '';
        this.showToast('Réponse envoyée', 'success');
      },
      error: (err) => this.showToast(
        err?.error?.message ?? 'Erreur lors de l\'envoi', 'error')
    });
  }

  getStatutClass(s: string): string {
    const map: Record<string, string> = {
      NOUVELLE: 'st-nouvelle',
      EN_COURS: 'st-en_cours',
      RESOLUE:  'st-resolue',
      CLOTUREE: 'st-cloturee'
    };
    return map[s] ?? 'st-nouvelle';
  }

  getStatutLabel(s: string): string {
    const map: Record<string, string> = {
      NOUVELLE: 'Nouvelle',
      EN_COURS: 'En cours',
      RESOLUE:  'Résolue',
      CLOTUREE: 'Clôturée'
    };
    return map[s] ?? s;
  }

  getInit(p: string, n: string): string {
    return ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase();
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() =>
      this.toast.set({ show: false, message: '', type: 'success' }),
      3000
    );
  }
}


