// =====================================================================
// reclamations.component.ts — VERSION CORRIGÉE
// Tous les [innerHTML] utilisent le pipe | safeHtml
// =====================================================================
import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReclamationService } from '../../core/services/reclamation.service';
import { AuthService }        from '../../core/services/auth.service';
import { Reclamation, StatutReclamation } from '../../core/models/reclamation.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'mes-reclamations' | 'nouvelle' | 'en-attente' | 'toutes';

const IC = {
  megaphone: `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  list:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  bell:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  folder:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  ticket:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>`,
  salary:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  building:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  monitor:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  handshake: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>`,
  file:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  send:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  user:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  rh:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  lock:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  calendar:  `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  chat:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  check:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  eye:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  clip:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  search:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  anon:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  star:      `<svg width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starEmpty: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  settings:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  history:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  arrow:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  toastOk:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  toastInfo: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="reclamations">

  <!-- ── Page Header ── -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-header-icon">
        <span [innerHTML]="ic.megaphone | safeHtml"></span>
      </div>
      <div>
        <h1>Réclamations</h1>
        <p>{{ getSubtitle() }}</p>
      </div>
    </div>
    <button class="btn-new" (click)="setTab('nouvelle')">
      <span [innerHTML]="ic.plus | safeHtml"></span>
      Nouvelle réclamation
    </button>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-bar">
    <button class="tab-btn" [class.active]="activeTab() === 'mes-reclamations'" (click)="setTab('mes-reclamations')">
      <span [innerHTML]="ic.list | safeHtml"></span>
      Mes réclamations
      <span class="tab-pill">{{ mesReclamations().length }}</span>
    </button>
    <button class="tab-btn" [class.active]="activeTab() === 'nouvelle'" (click)="setTab('nouvelle')">
      <span [innerHTML]="ic.plus | safeHtml"></span>
      Nouvelle réclamation
    </button>
    <button class="tab-btn" *ngIf="isRHOrAdmin()" [class.active]="activeTab() === 'en-attente'" (click)="setTab('en-attente')">
      <span [innerHTML]="ic.bell | safeHtml"></span>
      Nouvelles
      <span class="tab-pill warning" *ngIf="nouvelles().length > 0">{{ nouvelles().length }}</span>
    </button>
    <button class="tab-btn" *ngIf="isRHOrAdmin()" [class.active]="activeTab() === 'toutes'" (click)="setTab('toutes')">
      <span [innerHTML]="ic.folder | safeHtml"></span>
      Toutes
    </button>
  </div>

  <!-- ===================== MES RÉCLAMATIONS ===================== -->
  <div *ngIf="activeTab() === 'mes-reclamations'" class="tab-content fade-in">
    <div class="filters-row">
      <select class="sel" (change)="filterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
      </select>
      <select class="sel" (change)="filterType.set($any($event.target).value)">
        <option value="">Tous les types</option>
        <option *ngFor="let t of typesReclamation" [value]="t.value">{{ t.label }}</option>
      </select>
    </div>

    <div class="cards-stack" *ngIf="getFilteredMes().length > 0">
      <div class="reclam-card" *ngFor="let r of getFilteredMes()"
           [class]="'reclam-card ' + getStatutClass(r.statut)"
           (click)="ouvrirDetail(r)">
        <div class="rc-accent"></div>
        <div class="rc-header">
          <div class="rc-ticket-wrap">
            <div class="rc-ticket">
              <span [innerHTML]="ic.ticket | safeHtml"></span>{{ r.numeroTicket }}
            </div>
            <span class="rc-date">
              <span [innerHTML]="ic.calendar | safeHtml"></span>{{ r.createdAt | date:'dd/MM/yyyy' }}
            </span>
          </div>
          <div class="rc-tags">
            <span class="urgence-tag" [class]="getUrgenceClass(r.niveauUrgence)">
              <span class="urgence-dot" [class]="getUrgenceClass(r.niveauUrgence)"></span>{{ r.niveauUrgence }}
            </span>
            <span class="status-badge" [class]="getBadgeClass(r.statut)">{{ getStatutLabel(r.statut) }}</span>
          </div>
        </div>
        <div class="rc-body">
          <div class="rc-type-chip">
            <span [innerHTML]="getTypeIconSvg(r.typeReclamation) | safeHtml"></span>{{ getTypeLabel(r.typeReclamation) }}
          </div>
          <h3 class="rc-objet">{{ r.objet }}</h3>
          <p class="rc-desc">{{ r.description | slice:0:120 }}{{ r.description.length > 120 ? '...' : '' }}</p>
        </div>
        <div class="wf-progress">
          <div class="wfp-step" [class.done]="isStatutDone(r.statut,'NOUVELLE')">
            <div class="wfp-dot"><svg *ngIf="isStatutDone(r.statut,'NOUVELLE')" width="8" height="8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>Créée</span>
          </div>
          <div class="wfp-line" [class.done]="isStatutDone(r.statut,'EN_COURS')"></div>
          <div class="wfp-step" [class.done]="isStatutDone(r.statut,'EN_COURS')" [class.active]="r.statut === 'EN_COURS'">
            <div class="wfp-dot"><svg *ngIf="isStatutDone(r.statut,'EN_COURS')" width="8" height="8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>En cours</span>
          </div>
          <div class="wfp-line" [class.done]="isStatutDone(r.statut,'RESOLUE')"></div>
          <div class="wfp-step" [class.done]="isStatutDone(r.statut,'RESOLUE')" [class.active]="r.statut === 'RESOLUE'">
            <div class="wfp-dot"><svg *ngIf="isStatutDone(r.statut,'RESOLUE')" width="8" height="8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>Résolue</span>
          </div>
          <div class="wfp-line" [class.done]="r.statut === 'CLOTUREE'"></div>
          <div class="wfp-step" [class.done]="r.statut === 'CLOTUREE'">
            <div class="wfp-dot"><svg *ngIf="r.statut === 'CLOTUREE'" width="8" height="8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>Clôturée</span>
          </div>
        </div>
        <div class="rc-footer">
          <div class="rc-footer-meta">
            <span *ngIf="r.rhTraitantNom" class="rc-meta-item">
              <span [innerHTML]="ic.rh | safeHtml"></span>{{ r.rhTraitantNom }}
            </span>
            <span *ngIf="r.noteEvaluation" class="rc-meta-item">
              <svg width="12" height="12" fill="#d69e2e" stroke="#d69e2e" stroke-width="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {{ r.noteEvaluation }}/5
            </span>
            <span class="rc-meta-item">
              <span [innerHTML]="ic.chat | safeHtml"></span>{{ r.commentaires ? r.commentaires.length : 0 }} commentaire(s)
            </span>
          </div>
          <span class="rc-hint">Voir les détails <span [innerHTML]="ic.arrow | safeHtml"></span></span>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="getFilteredMes().length === 0">
      <div class="empty-icon"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
      <h3>Aucune réclamation</h3>
      <p>Vous n'avez pas encore soumis de réclamation.</p>
      <button class="btn-primary" (click)="setTab('nouvelle')">
        <span [innerHTML]="ic.plus | safeHtml"></span> Créer une réclamation
      </button>
    </div>
  </div>

  <!-- ===================== NOUVELLE ===================== -->
  <div *ngIf="activeTab() === 'nouvelle'" class="tab-content fade-in">
    <div class="form-shell">
      <div class="form-card">
        <div class="form-card-header">
          <div class="form-card-icon"><span [innerHTML]="ic.megaphone | safeHtml"></span></div>
          <div>
            <h2>Nouvelle réclamation</h2>
            <p>Votre réclamation sera traitée en toute confidentialité</p>
          </div>
        </div>
        <form [formGroup]="reclamForm" (ngSubmit)="onSubmit()">
          <div class="field-section-title">Catégorie *</div>
          <div class="type-grid">
            <div class="type-card" *ngFor="let t of typesReclamation"
                 [class.selected]="reclamForm.get('typeReclamation')?.value === t.value"
                 (click)="reclamForm.get('typeReclamation')?.setValue(t.value)">
              <div class="type-card-icon" [innerHTML]="t.iconSvg | safeHtml"></div>
              <span>{{ t.label }}</span>
              <div class="type-card-check" *ngIf="reclamForm.get('typeReclamation')?.value === t.value">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
          <div class="field-error" *ngIf="isInvalid('typeReclamation')">Sélectionnez une catégorie</div>

          <div class="field-section-title" style="margin-top:22px">Niveau d'urgence *</div>
          <div class="urgence-grid">
            <div class="urgence-card" *ngFor="let u of niveauxUrgence"
                 [class]="'urgence-card urgence-card--' + u.value.toLowerCase()"
                 [class.selected]="reclamForm.get('niveauUrgence')?.value === u.value"
                 (click)="reclamForm.get('niveauUrgence')?.setValue(u.value)">
              <div class="urgence-indicator"></div>
              <div class="urgence-body"><strong>{{ u.label }}</strong><small>{{ u.desc }}</small></div>
              <div class="urgence-check" *ngIf="reclamForm.get('niveauUrgence')?.value === u.value">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>

          <div class="field-section-title" style="margin-top:22px">Objet *</div>
          <div class="field-group">
            <input type="text" formControlName="objet" placeholder="Résumez votre réclamation en une phrase" [class.error]="isInvalid('objet')" />
            <div class="field-error" *ngIf="isInvalid('objet')">Entre 5 et 200 caractères</div>
          </div>

          <div class="field-section-title" style="margin-top:18px">Description détaillée *</div>
          <div class="field-group">
            <textarea formControlName="description" placeholder="Décrivez votre réclamation en détail..." rows="5" [class.error]="isInvalid('description')"></textarea>
            <div class="char-count">{{ reclamForm.get('description')?.value?.length || 0 }} / 2000</div>
            <div class="field-error" *ngIf="isInvalid('description')">Entre 10 et 2000 caractères</div>
          </div>

          <div class="anon-toggle" [class.active]="reclamForm.get('anonyme')?.value" (click)="toggleAnonyme()">
            <div class="toggle-track" [class.on]="reclamForm.get('anonyme')?.value"><div class="toggle-thumb"></div></div>
            <div class="toggle-text">
              <strong>{{ reclamForm.get('anonyme')?.value ? 'Réclamation anonyme' : 'Réclamation nominative' }}</strong>
              <small>{{ reclamForm.get('anonyme')?.value ? 'Votre identité ne sera pas révélée' : 'Votre nom sera visible par le RH' }}</small>
            </div>
            <span class="anon-pill" [class.on]="reclamForm.get('anonyme')?.value">
              <span [innerHTML]="(reclamForm.get('anonyme')?.value ? ic.anon : ic.user) | safeHtml"></span>
              {{ reclamForm.get('anonyme')?.value ? 'Anonyme' : 'Nominatif' }}
            </span>
          </div>

          <div class="form-alert error" *ngIf="formError()">
            <span [innerHTML]="ic.toastErr | safeHtml"></span> {{ formError() }}
          </div>
          <div class="form-alert success" *ngIf="formSuccess()">
            <span [innerHTML]="ic.toastOk | safeHtml"></span> {{ formSuccess() }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-ghost" (click)="reclamForm.reset()">Réinitialiser</button>
            <button type="submit" class="btn-primary" [disabled]="submitLoading()">
              <span *ngIf="!submitLoading()"><span [innerHTML]="ic.send | safeHtml"></span> Soumettre</span>
              <span *ngIf="submitLoading()" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <div class="form-help">
        <h4>Comment ça fonctionne ?</h4>
        <div class="help-steps">
          <div class="help-step"><div class="hs-num">1</div><div><strong>Soumission</strong><p>Décrivez votre réclamation avec le maximum de détails.</p></div></div>
          <div class="help-step"><div class="hs-num">2</div><div><strong>Prise en charge</strong><p>Un responsable RH prend en charge et vous répond.</p></div></div>
          <div class="help-step"><div class="hs-num">3</div><div><strong>Résolution</strong><p>Votre réclamation est résolue et clôturée.</p></div></div>
          <div class="help-step"><div class="hs-num">4</div><div><strong>Évaluation</strong><p>Notez la qualité du traitement reçu.</p></div></div>
        </div>
        <div class="help-tip">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Le mode anonyme protège votre identité tout au long du traitement.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== EN ATTENTE (RH) ===================== -->
  <div *ngIf="activeTab() === 'en-attente'" class="tab-content fade-in">
    <div class="empty-state" *ngIf="nouvelles().length === 0">
      <div class="empty-icon success-icon"><span [innerHTML]="ic.check | safeHtml"></span></div>
      <h3>Aucune nouvelle réclamation</h3>
      <p>Toutes les réclamations sont en cours de traitement.</p>
    </div>
    <div class="cards-stack" *ngIf="nouvelles().length > 0">
      <div class="reclam-card nouvelle-card" *ngFor="let r of nouvelles()">
        <div class="rc-accent"></div>
        <div class="rc-header">
          <div class="rc-ticket-wrap">
            <div class="rc-ticket"><span [innerHTML]="ic.ticket | safeHtml"></span>{{ r.numeroTicket }}</div>
            <span class="rc-date"><span [innerHTML]="ic.calendar | safeHtml"></span>{{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="rc-tags">
            <span class="urgence-tag" [class]="getUrgenceClass(r.niveauUrgence)">
              <span class="urgence-dot" [class]="getUrgenceClass(r.niveauUrgence)"></span>{{ r.niveauUrgence }}
            </span>
            <span class="anon-chip" *ngIf="r.anonyme"><span [innerHTML]="ic.anon | safeHtml"></span> Anonyme</span>
          </div>
        </div>
        <div class="rc-body">
          <div class="rc-type-chip"><span [innerHTML]="getTypeIconSvg(r.typeReclamation) | safeHtml"></span>{{ getTypeLabel(r.typeReclamation) }}</div>
          <h3 class="rc-objet">{{ r.objet }}</h3>
          <p class="rc-desc">{{ r.description }}</p>
          <div class="rc-employee" *ngIf="!r.anonyme">
            <div class="mini-av">{{ getInitiales2(r) }}</div>
            <strong>{{ r.employeNom }} {{ r.employePrenom }}</strong>
          </div>
        </div>
        <div class="rc-footer-actions">
          <button class="btn-primary" (click)="prendreEnCharge(r.id)" [disabled]="actionLoading()">
            <span *ngIf="!actionLoading()"><span [innerHTML]="ic.clip | safeHtml"></span> Prendre en charge</span>
            <span *ngIf="actionLoading()" class="spinner"></span>
          </button>
          <button class="btn-outline-sm" (click)="ouvrirDetailRH(r)">
            <span [innerHTML]="ic.eye | safeHtml"></span> Voir détails
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== TOUTES (RH) ===================== -->
  <div *ngIf="activeTab() === 'toutes'" class="tab-content fade-in">
    <div class="stat-chips">
      <div class="stat-chip" *ngFor="let s of getStatsRH()">
        <span class="stat-val" [class]="s.color">{{ s.value }}</span>
        <span class="stat-lbl">{{ s.label }}</span>
      </div>
    </div>
    <div class="toolbar">
      <div class="search-wrap">
        <span [innerHTML]="ic.search | safeHtml"></span>
        <input type="text" placeholder="Rechercher..." (input)="rhSearch.set($any($event.target).value)" class="search-inp" />
      </div>
      <select class="sel" (change)="rhFilterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
      </select>
      <select class="sel" (change)="rhFilterUrgence.set($any($event.target).value)">
        <option value="">Toutes urgences</option>
        <option value="URGENTE">Urgente</option>
        <option value="NORMALE">Normale</option>
        <option value="FAIBLE">Faible</option>
      </select>
    </div>
    <div class="cards-stack">
      <div class="reclam-card rh-row" *ngFor="let r of getRHFiltered()" (click)="ouvrirDetailRH(r)">
        <div class="rc-accent"></div>
        <div class="rh-row-left">
          <div class="rc-ticket"><span [innerHTML]="ic.ticket | safeHtml"></span>{{ r.numeroTicket }}</div>
          <div class="rc-type-chip sm"><span [innerHTML]="getTypeIconSvg(r.typeReclamation) | safeHtml"></span>{{ getTypeLabel(r.typeReclamation) }}</div>
        </div>
        <div class="rh-row-body">
          <strong class="rc-objet-sm">{{ r.objet }}</strong>
          <div class="rh-row-meta">
            <span *ngIf="!r.anonyme" class="meta-item"><span [innerHTML]="ic.user | safeHtml"></span>{{ r.employeNom }} {{ r.employePrenom }}</span>
            <span *ngIf="r.anonyme" class="meta-item"><span [innerHTML]="ic.anon | safeHtml"></span>Anonyme</span>
            <span class="meta-item"><span [innerHTML]="ic.calendar | safeHtml"></span>{{ r.createdAt | date:'dd/MM/yyyy' }}</span>
            <span *ngIf="r.rhTraitantNom" class="meta-item"><span [innerHTML]="ic.rh | safeHtml"></span>{{ r.rhTraitantNom }}</span>
            <span *ngIf="r.noteEvaluation" class="meta-item">
              <svg width="11" height="11" fill="#d69e2e" stroke="#d69e2e" stroke-width="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {{ r.noteEvaluation }}/5
            </span>
          </div>
        </div>
        <div class="rh-row-right">
          <span class="urgence-tag" [class]="getUrgenceClass(r.niveauUrgence)">
            <span class="urgence-dot" [class]="getUrgenceClass(r.niveauUrgence)"></span>{{ r.niveauUrgence }}
          </span>
          <span class="status-badge" [class]="getBadgeClass(r.statut)">{{ getStatutLabel(r.statut) }}</span>
          <span class="rc-hint sm"><span [innerHTML]="ic.arrow | safeHtml"></span></span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL DETAIL EMPLOYÉ ===================== -->
  <div class="modal-backdrop" *ngIf="detailReclamation()" (click)="detailReclamation.set(null)">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <div class="modal-head-left">
          <div class="rc-ticket"><span [innerHTML]="ic.ticket | safeHtml"></span>{{ detailReclamation()?.numeroTicket }}</div>
          <span class="status-badge" [class]="getBadgeClass(detailReclamation()?.statut || '')">{{ getStatutLabel(detailReclamation()?.statut || '') }}</span>
        </div>
        <button class="modal-x" (click)="detailReclamation.set(null)" [innerHTML]="ic.x | safeHtml"></button>
      </div>
      <div class="modal-body-scroll">
        <div class="detail-head">
          <div class="detail-type-chip">
            <span [innerHTML]="getTypeIconSvg(detailReclamation()?.typeReclamation || '') | safeHtml"></span>
            {{ getTypeLabel(detailReclamation()?.typeReclamation || '') }}
          </div>
          <span class="urgence-tag" [class]="getUrgenceClass(detailReclamation()?.niveauUrgence || '')">
            <span class="urgence-dot" [class]="getUrgenceClass(detailReclamation()?.niveauUrgence || '')"></span>
            {{ detailReclamation()?.niveauUrgence }}
          </span>
        </div>
        <h3 class="detail-objet">{{ detailReclamation()?.objet }}</h3>
        <p class="detail-desc">{{ detailReclamation()?.description }}</p>

        <div class="rh-reply" *ngIf="detailReclamation()?.reponseRH">
          <div class="rh-reply-head">
            <span [innerHTML]="ic.rh | safeHtml"></span>
            <strong>Réponse du service RH</strong>
            <span class="rh-name">{{ detailReclamation()?.rhTraitantNom }}</span>
          </div>
          <p>{{ detailReclamation()?.reponseRH }}</p>
        </div>

        <div class="eval-box" *ngIf="(detailReclamation()?.statut === 'RESOLUE' || detailReclamation()?.statut === 'CLOTUREE') && !detailReclamation()?.noteEvaluation">
          <h4>Évaluez le traitement de votre réclamation</h4>
          <div class="stars-row">
            <button class="star-btn" *ngFor="let i of [1,2,3,4,5]" [class.active]="evalNote() >= i" (click)="evalNote.set(i)">
              <span *ngIf="evalNote() >= i" [innerHTML]="ic.star      | safeHtml"></span>
              <span *ngIf="evalNote() < i"  [innerHTML]="ic.starEmpty | safeHtml"></span>
            </button>
          </div>
          <textarea [(ngModel)]="evalCommentaire" placeholder="Commentaire (optionnel)..." rows="2"></textarea>
          <button class="btn-primary" [disabled]="evalNote() === 0 || evalLoading()" (click)="soumettrEvaluation()">
            <span *ngIf="!evalLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Envoyer l'évaluation</span>
            <span *ngIf="evalLoading()" class="spinner"></span>
          </button>
        </div>

        <div class="eval-done-row" *ngIf="detailReclamation()?.noteEvaluation">
          <div class="stars-display">
            <span *ngFor="let i of [1,2,3,4,5]" class="star-disp" [class.filled]="(detailReclamation()?.noteEvaluation || 0) >= i">
              <span *ngIf="(detailReclamation()?.noteEvaluation || 0) >= i" [innerHTML]="ic.star      | safeHtml"></span>
              <span *ngIf="(detailReclamation()?.noteEvaluation || 0) < i"  [innerHTML]="ic.starEmpty | safeHtml"></span>
            </span>
            <strong>{{ detailReclamation()?.noteEvaluation }}/5</strong>
          </div>
          <em *ngIf="detailReclamation()?.commentaireEvaluation">"{{ detailReclamation()?.commentaireEvaluation }}"</em>
        </div>

        <div class="comments-section">
          <h4><span [innerHTML]="ic.chat | safeHtml"></span> Échanges ({{ getCommentairesPublics().length }})</h4>
          <div class="comments-list">
            <div class="comment-item" *ngFor="let c of getCommentairesPublics()" [class.rh]="c.auteurRole === 'RH' || c.auteurRole === 'ADMIN'">
              <div class="ci-av" [class.rh-av]="c.auteurRole === 'RH' || c.auteurRole === 'ADMIN'">
                <span *ngIf="c.auteurRole === 'RH' || c.auteurRole === 'ADMIN'" [innerHTML]="ic.rh   | safeHtml"></span>
                <span *ngIf="c.auteurRole !== 'RH' && c.auteurRole !== 'ADMIN'" [innerHTML]="ic.user | safeHtml"></span>
              </div>
              <div class="ci-body">
                <div class="ci-meta">
                  <strong>{{ c.auteurNom }}</strong><span class="ci-role">{{ c.auteurRole }}</span>
                  <span class="ci-time">{{ c.createdAt | date:'dd/MM HH:mm' }}</span>
                </div>
                <p>{{ c.contenu }}</p>
              </div>
            </div>
            <div class="no-comments" *ngIf="getCommentairesPublics().length === 0">Aucun échange pour le moment</div>
          </div>
          <div class="new-comment" *ngIf="detailReclamation()?.statut !== 'CLOTUREE'">
            <textarea [(ngModel)]="nouveauCommentaire" placeholder="Ajouter un commentaire..." rows="2"></textarea>
            <button class="btn-send" [disabled]="!nouveauCommentaire.trim() || commentLoading()" (click)="ajouterCommentaire()">
              <span *ngIf="!commentLoading()" [innerHTML]="ic.send | safeHtml"></span>
              <span *ngIf="commentLoading()" class="spinner sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL DETAIL RH ===================== -->
  <div class="modal-backdrop" *ngIf="detailRH()" (click)="detailRH.set(null)">
    <div class="modal-box rh-modal" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <div class="modal-head-left">
          <div class="rc-ticket"><span [innerHTML]="ic.ticket | safeHtml"></span>{{ detailRH()?.numeroTicket }}</div>
          <span class="urgence-tag" [class]="getUrgenceClass(detailRH()?.niveauUrgence || '')">
            <span class="urgence-dot" [class]="getUrgenceClass(detailRH()?.niveauUrgence || '')"></span>{{ detailRH()?.niveauUrgence }}
          </span>
          <span class="status-badge" [class]="getBadgeClass(detailRH()?.statut || '')">{{ getStatutLabel(detailRH()?.statut || '') }}</span>
        </div>
        <button class="modal-x" (click)="detailRH.set(null)" [innerHTML]="ic.x | safeHtml"></button>
      </div>
      <div class="rh-modal-cols">
        <div class="rh-modal-left">
          <div class="detail-head">
            <div class="detail-type-chip">
              <span [innerHTML]="getTypeIconSvg(detailRH()?.typeReclamation || '') | safeHtml"></span>
              {{ getTypeLabel(detailRH()?.typeReclamation || '') }}
            </div>
          </div>
          <h3 class="detail-objet">{{ detailRH()?.objet }}</h3>
          <p class="detail-desc">{{ detailRH()?.description }}</p>

          <div class="identity-row" *ngIf="!detailRH()?.anonyme">
            <div class="mini-av">{{ getInitiales2(detailRH()!) }}</div>
            <div><strong>{{ detailRH()?.employeNom }} {{ detailRH()?.employePrenom }}</strong><small>{{ detailRH()?.employeMatricule }}</small></div>
          </div>
          <div class="identity-row anon-row" *ngIf="detailRH()?.anonyme">
            <span [innerHTML]="ic.anon | safeHtml"></span><strong>Réclamation anonyme</strong>
          </div>

          <div class="comments-section">
            <h4><span [innerHTML]="ic.chat | safeHtml"></span> Tous les échanges</h4>
            <div class="comments-list">
              <div class="comment-item" *ngFor="let c of detailRH()?.commentaires"
                   [class.rh]="c.auteurRole === 'RH' || c.auteurRole === 'ADMIN'"
                   [class.internal]="c.interne">
                <div class="ci-av" [class.rh-av]="c.auteurRole === 'RH' || c.auteurRole === 'ADMIN'" [class.lock-av]="c.interne">
                  <span *ngIf="c.interne"                                                         [innerHTML]="ic.lock | safeHtml"></span>
                  <span *ngIf="!c.interne && (c.auteurRole === 'RH' || c.auteurRole === 'ADMIN')" [innerHTML]="ic.rh   | safeHtml"></span>
                  <span *ngIf="!c.interne && c.auteurRole !== 'RH' && c.auteurRole !== 'ADMIN'"   [innerHTML]="ic.user | safeHtml"></span>
                </div>
                <div class="ci-body">
                  <div class="ci-meta">
                    <strong>{{ c.auteurNom }}</strong><span class="ci-role">{{ c.auteurRole }}</span>
                    <span class="interne-chip" *ngIf="c.interne"><span [innerHTML]="ic.lock | safeHtml"></span> Interne</span>
                    <span class="ci-time">{{ c.createdAt | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <p>{{ c.contenu }}</p>
                </div>
              </div>
            </div>
            <div class="new-comment rh-comment-form" *ngIf="detailRH()?.statut !== 'CLOTUREE'">
              <textarea [(ngModel)]="nouveauCommentaireRH" placeholder="Ajouter un commentaire..." rows="2"></textarea>
              <div class="rh-comment-controls">
                <label class="interne-label">
                  <input type="checkbox" [(ngModel)]="commentaireInterne" />
                  <span [innerHTML]="ic.lock | safeHtml"></span> Commentaire interne
                </label>
                <button class="btn-send" [disabled]="!nouveauCommentaireRH.trim() || commentLoading()" (click)="ajouterCommentaireRH()">
                  <span *ngIf="!commentLoading()" [innerHTML]="ic.send | safeHtml"></span>
                  <span *ngIf="commentLoading()" class="spinner sm"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="rh-modal-right">
          <div class="action-card" *ngIf="detailRH()?.statut !== 'CLOTUREE'">
            <h4><span [innerHTML]="ic.settings | safeHtml"></span> Traitement</h4>
            <button class="btn-primary full" *ngIf="detailRH()?.statut === 'NOUVELLE'" (click)="prendreEnChargeRH()" [disabled]="actionLoading()">
              <span *ngIf="!actionLoading()"><span [innerHTML]="ic.clip | safeHtml"></span> Prendre en charge</span>
              <span *ngIf="actionLoading()" class="spinner"></span>
            </button>
            <ng-container *ngIf="detailRH()?.statut === 'EN_COURS' || detailRH()?.statut === 'RESOLUE'">
              <div class="field-group">
                <label class="field-label">Nouveau statut</label>
                <select [(ngModel)]="nouveauStatut">
                  <option value="EN_COURS">En cours</option>
                  <option value="RESOLUE">Résolue</option>
                  <option value="CLOTUREE">Clôturée</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Réponse RH *</label>
                <textarea [(ngModel)]="reponseRH" placeholder="Réponse officielle au demandeur..." rows="4"></textarea>
              </div>
              <button class="btn-primary full" [disabled]="!reponseRH.trim() || traitementLoading()" (click)="traiterReclamation()">
                <span *ngIf="!traitementLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Enregistrer</span>
                <span *ngIf="traitementLoading()" class="spinner"></span>
              </button>
            </ng-container>
          </div>

          <div class="timeline-card">
            <h4><span [innerHTML]="ic.history | safeHtml"></span> Historique</h4>
            <div class="tl">
              <div class="tl-item"><div class="tl-dot teal"></div><div class="tl-body"><strong>Réclamation créée</strong><span>{{ detailRH()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span></div></div>
              <div class="tl-item" *ngIf="detailRH()?.datePriseEnCharge"><div class="tl-dot amber"></div><div class="tl-body"><strong>Prise en charge</strong><span>{{ detailRH()?.datePriseEnCharge | date:'dd/MM/yyyy HH:mm' }}</span><small>par {{ detailRH()?.rhTraitantNom }}</small></div></div>
              <div class="tl-item" *ngIf="detailRH()?.dateResolution"><div class="tl-dot green"></div><div class="tl-body"><strong>Résolue</strong><span>{{ detailRH()?.dateResolution | date:'dd/MM/yyyy HH:mm' }}</span></div></div>
              <div class="tl-item" *ngIf="detailRH()?.dateCloture"><div class="tl-dot gray"></div><div class="tl-body"><strong>Clôturée</strong><span>{{ detailRH()?.dateCloture | date:'dd/MM/yyyy HH:mm' }}</span></div></div>
            </div>
          </div>

          <div class="eval-result-card" *ngIf="detailRH()?.noteEvaluation">
            <h4>
              <svg width="14" height="14" fill="#d69e2e" stroke="#d69e2e" stroke-width="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Évaluation employé
            </h4>
            <div class="eval-stars-row">
              <span *ngFor="let i of [1,2,3,4,5]">
                <span *ngIf="(detailRH()?.noteEvaluation || 0) >= i" class="star-filled" [innerHTML]="ic.star      | safeHtml"></span>
                <span *ngIf="(detailRH()?.noteEvaluation || 0) < i"  class="star-empty"  [innerHTML]="ic.starEmpty | safeHtml"></span>
              </span>
              <strong>{{ detailRH()?.noteEvaluation }}/5</strong>
            </div>
            <em *ngIf="detailRH()?.commentaireEvaluation">"{{ detailRH()?.commentaireEvaluation }}"</em>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" [class.show]="toast().show" [class]="'toast toast--' + toast().type">
    <span *ngIf="toast().type === 'success'" [innerHTML]="ic.toastOk   | safeHtml"></span>
    <span *ngIf="toast().type === 'error'"   [innerHTML]="ic.toastErr  | safeHtml"></span>
    <span *ngIf="toast().type === 'info'"    [innerHTML]="ic.toastInfo | safeHtml"></span>
    {{ toast().message }}
  </div>
</div>
  `,
  styles: [`
    :host {
      --c-primary:   #0b6e7e; --c-accent:    #0e9daf; --c-accent-lt: #e6f7f9;
      --c-green:     #38a169; --c-green-lt:  #c6f6d5;
      --c-amber:     #d69e2e; --c-amber-lt:  #fefcbf;
      --c-red:       #e53e3e; --c-red-lt:    #fed7d7;
      --c-purple:    #805ad5; --c-purple-lt: #e9d8fd;
      --c-gray-50:   #f7f8fa; --c-gray-100:  #eef0f3;
      --c-gray-200:  #d8dde5; --c-gray-500:  #718096;
      --c-text:      #1a202c; --c-muted:     #64748b;
      --r: 12px; --r-lg: 16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .reclamations { max-width: 100%; padding-bottom: 48px; }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 14px; }
    .page-header-left { display: flex; align-items: center; gap: 14px; }
    .page-header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 14px rgba(14,157,175,0.3); svg { display: block; } }
    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin: 0 0 2px; }
    p  { font-size: 13px; color: var(--c-muted); margin: 0; }
    .btn-new { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 18px; background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); color: white; font-size: 13px; font-weight: 600; border: none; border-radius: var(--r); cursor: pointer; box-shadow: 0 3px 12px rgba(14,157,175,0.3); transition: all 0.2s; svg { display: block; } &:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(14,157,175,0.4); } }

    .tabs-bar { display: flex; gap: 2px; background: white; padding: 5px; border-radius: 14px; box-shadow: var(--sh); margin-bottom: 24px; flex-wrap: wrap; border: 1px solid var(--c-gray-200); }
    .tab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 16px; border: none; background: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-muted); transition: all 0.2s; white-space: nowrap; svg { display: block; flex-shrink: 0; } &:hover { background: var(--c-gray-50); color: var(--c-text); } &.active { background: var(--c-accent); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); } &.active svg { stroke: white; } }
    .tab-pill { min-width: 20px; height: 20px; padding: 0 6px; background: var(--c-gray-200); color: var(--c-muted); border-radius: 10px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; &.warning { background: var(--c-amber-lt); color: var(--c-amber); } }
    .tab-btn.active .tab-pill { background: rgba(255,255,255,0.25); color: white; }

    .cards-stack { display: flex; flex-direction: column; gap: 12px; }
    .reclam-card { background: white; border-radius: var(--r-lg); padding: 18px 20px; box-shadow: var(--sh); border: 1px solid var(--c-gray-100); position: relative; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; &:hover { box-shadow: var(--sh-md); transform: translateY(-2px); } &.nouvelle-card { cursor: default; &:hover { transform: none; } } &.rh-row { padding: 14px 20px; } }
    .rc-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--c-accent); border-radius: 4px 0 0 4px; }
    .statut-nouvelle .rc-accent { background: var(--c-accent); }
    .statut-en-cours .rc-accent { background: var(--c-amber); }
    .statut-resolue  .rc-accent { background: var(--c-green); }
    .statut-cloturee .rc-accent { background: var(--c-gray-200); }

    .rc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .rc-ticket-wrap { display: flex; align-items: center; gap: 10px; }
    .rc-ticket { display: inline-flex; align-items: center; gap: 5px; background: var(--c-accent-lt); color: var(--c-primary); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: monospace; svg { display: block; flex-shrink: 0; } }
    .rc-date { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--c-muted); svg { display: block; flex-shrink: 0; } }
    .rc-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .urgence-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; &.urgente { background: var(--c-red-lt); color: var(--c-red); } &.normale { background: var(--c-amber-lt); color: var(--c-amber); } &.faible { background: var(--c-green-lt); color: var(--c-green); } }
    .urgence-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; &.urgente { background: var(--c-red); } &.normale { background: var(--c-amber); } &.faible { background: var(--c-green); } }
    .anon-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--c-purple-lt); color: var(--c-purple); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; svg { display: block; } }
    .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-info    { background: var(--c-accent-lt); color: var(--c-primary); }
    .badge-warning { background: var(--c-amber-lt); color: var(--c-amber); }
    .badge-success { background: var(--c-green-lt); color: var(--c-green); }
    .badge-gray    { background: var(--c-gray-100); color: var(--c-muted); }

    .rc-body { margin-bottom: 14px; }
    .rc-type-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--c-muted); margin-bottom: 6px; svg { display: block; flex-shrink: 0; } &.sm { font-size: 11px; } }
    .rc-objet { font-size: 15px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
    .rc-desc  { font-size: 13px; color: var(--c-muted); line-height: 1.5; }
    .rc-employee { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
    .mini-av { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; }

    .wf-progress { display: flex; align-items: center; margin: 14px 0; }
    .wfp-step { display: flex; flex-direction: column; align-items: center; gap: 4px; .wfp-dot { width: 22px; height: 22px; border-radius: 50%; background: var(--c-gray-200); border: 2px solid var(--c-gray-200); display: flex; align-items: center; justify-content: center; transition: all 0.25s; } span { font-size: 10px; font-weight: 600; color: var(--c-muted); white-space: nowrap; } &.done .wfp-dot { background: var(--c-green); border-color: var(--c-green); } &.done span { color: var(--c-green); } &.active .wfp-dot { background: var(--c-amber); border-color: var(--c-amber); animation: puls 1.6s infinite; } &.active span { color: var(--c-amber); } }
    .wfp-line { flex: 1; height: 2px; background: var(--c-gray-200); margin-bottom: 14px; min-width: 24px; transition: background 0.3s; &.done { background: var(--c-green); } }
    @keyframes puls { 0%,100% { box-shadow: 0 0 0 0 rgba(214,158,46,0.4); } 50% { box-shadow: 0 0 0 5px rgba(214,158,46,0); } }

    .rc-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--c-gray-100); flex-wrap: wrap; gap: 8px; }
    .rc-footer-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .rc-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--c-muted); svg { display: block; flex-shrink: 0; } }
    .rc-hint { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--c-accent); font-weight: 600; svg { display: block; } &.sm { font-size: 11px; } }
    .rc-footer-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--c-gray-100); margin-top: 12px; }

    .rh-row { display: flex; align-items: center; gap: 14px; }
    .rh-row-left { display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; min-width: 120px; }
    .rh-row-body { flex: 1; min-width: 0; }
    .rc-objet-sm { font-size: 13.5px; font-weight: 700; color: var(--c-text); display: block; margin-bottom: 5px; }
    .rh-row-meta { display: flex; gap: 10px; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--c-muted); svg { display: block; flex-shrink: 0; } }
    .rh-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }

    .empty-state { text-align: center; padding: 64px 24px; background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-200); }
    .empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--c-accent-lt); color: var(--c-accent); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; svg { display: block; } }
    .empty-icon.success-icon { background: var(--c-green-lt); color: var(--c-green); }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
    .empty-state p  { color: var(--c-muted); font-size: 13px; margin-bottom: 20px; }

    .filters-row, .toolbar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .sel { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; cursor: pointer; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-accent); } }
    .search-wrap { position: relative; flex: 1; display: flex; align-items: center; svg { position: absolute; left: 12px; color: var(--c-muted); display: block; } }
    .search-inp { width: 100%; padding: 10px 14px 10px 36px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; &:focus { border-color: var(--c-accent); } }

    .stat-chips { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat-chip { display: flex; flex-direction: column; gap: 3px; background: white; padding: 11px 18px; border-radius: var(--r); border: 1px solid var(--c-gray-200); text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .stat-val { font-size: 22px; font-weight: 800; &.primary { color: var(--c-accent); } &.info { color: var(--c-primary); } &.warning { color: var(--c-amber); } &.success { color: var(--c-green); } &.danger { color: var(--c-red); } }
    .stat-lbl { font-size: 11px; color: var(--c-muted); font-weight: 500; }

    .form-shell { display: grid; grid-template-columns: 1fr 260px; gap: 24px; align-items: start; }
    .form-card { background: white; border-radius: var(--r-lg); padding: 28px 32px; border: 1px solid var(--c-gray-200); box-shadow: var(--sh); }
    .form-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .form-card-icon { width: 46px; height: 46px; border-radius: 13px; background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .form-card-header h2 { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0 0 3px; }
    .form-card-header p  { font-size: 12px; color: var(--c-muted); margin: 0; }
    .field-section-title { font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }

    .type-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .type-card { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 12px 8px; border-radius: var(--r); border: 2px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; text-align: center; position: relative; background: white; .type-card-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--c-gray-100); display: flex; align-items: center; justify-content: center; color: var(--c-accent); svg { display: block; } } span { font-size: 11px; font-weight: 600; color: var(--c-text); } &:hover { border-color: var(--c-accent); background: var(--c-accent-lt); } &.selected { border-color: var(--c-accent); background: var(--c-accent-lt); box-shadow: 0 0 0 3px rgba(14,157,175,0.12); .type-card-icon { background: white; } } }
    .type-card-check { position: absolute; top: 6px; right: 6px; width: 16px; height: 16px; border-radius: 50%; background: var(--c-accent); display: flex; align-items: center; justify-content: center; svg { display: block; } }

    .urgence-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .urgence-card { display: flex; align-items: center; gap: 10px; padding: 13px 14px; border-radius: var(--r); border: 2px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; position: relative; background: white; .urgence-indicator { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; } .urgence-body { flex: 1; strong { font-size: 13px; color: var(--c-text); display: block; } small { font-size: 11px; color: var(--c-muted); } } &--faible .urgence-indicator { background: var(--c-green); } &--normale .urgence-indicator { background: var(--c-amber); } &--urgente .urgence-indicator { background: var(--c-red); } &--faible.selected { border-color: var(--c-green); background: var(--c-green-lt); } &--normale.selected { border-color: var(--c-amber); background: var(--c-amber-lt); } &--urgente.selected { border-color: var(--c-red); background: var(--c-red-lt); } &:hover { border-color: var(--c-accent); } }
    .urgence-check { width: 16px; height: 16px; border-radius: 50%; background: var(--c-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } }

    .field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }
    .field-label { font-size: 12px; font-weight: 600; color: var(--c-muted); }
    .field-error { font-size: 11px; color: var(--c-red); font-weight: 500; }
    .char-count  { text-align: right; font-size: 11px; color: var(--c-muted); }

    input, textarea, select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); } &.error { border-color: var(--c-red); } }
    textarea { resize: vertical; }

    .anon-toggle { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: var(--r); border: 2px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; &.active { border-color: var(--c-accent); background: var(--c-accent-lt); } }
    .toggle-track { width: 42px; height: 22px; border-radius: 11px; background: var(--c-gray-200); position: relative; transition: background 0.3s; flex-shrink: 0; &.on { background: var(--c-accent); } }
    .toggle-thumb { width: 16px; height: 16px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
    .toggle-track.on .toggle-thumb { transform: translateX(20px); }
    .toggle-text { flex: 1; strong { font-size: 13.5px; color: var(--c-text); display: block; } small { font-size: 11.5px; color: var(--c-muted); } }
    .anon-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; svg { display: block; } &.on { background: var(--c-accent-lt); color: var(--c-primary); } &:not(.on) { background: var(--c-gray-100); color: var(--c-muted); } }

    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 14px; svg { flex-shrink: 0; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

    .form-help { background: white; border-radius: var(--r-lg); padding: 20px 22px; border: 1px solid var(--c-gray-200); box-shadow: 0 1px 4px rgba(0,0,0,0.05); h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 16px; } }
    .help-steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
    .help-step { display: flex; gap: 10px; align-items: flex-start; }
    .hs-num { width: 24px; height: 24px; border-radius: 50%; background: var(--c-accent-lt); color: var(--c-primary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
    .help-step strong { font-size: 12.5px; color: var(--c-text); display: block; }
    .help-step p { font-size: 11.5px; color: var(--c-muted); margin: 2px 0 0; line-height: 1.4; }
    .help-tip { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; background: var(--c-gray-50); border-radius: var(--r); font-size: 11.5px; color: var(--c-muted); line-height: 1.5; svg { flex-shrink: 0; color: var(--c-accent); margin-top: 1px; } }

    .btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: var(--r); background: linear-gradient(135deg, var(--c-accent), var(--c-primary)); color: white; font-size: 13px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 3px 12px rgba(14,157,175,0.3); transition: all 0.2s; svg { display: block; } &:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(14,157,175,0.4); } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; } &.full { width: 100%; justify-content: center; } }
    .btn-ghost { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: var(--r); background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { border-color: var(--c-accent); color: var(--c-primary); } }
    .btn-outline-sm { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: var(--r); background: white; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; svg { display: block; } &:hover { border-color: var(--c-accent); color: var(--c-primary); } }
    .btn-send { width: 38px; height: 38px; border-radius: var(--r); background: var(--c-accent); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-primary); } &:disabled { opacity: 0.5; cursor: not-allowed; } }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
    .modal-box { background: white; border-radius: 18px; width: 580px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.2); &.rh-modal { width: 920px; max-width: 95vw; } }
    .modal-head { padding: 16px 20px; border-bottom: 1px solid var(--c-gray-100); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .modal-head-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .modal-x { width: 30px; height: 30px; border: none; background: var(--c-gray-100); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-red-lt); color: var(--c-red); } }
    .modal-body-scroll { flex: 1; overflow-y: auto; padding: 18px 22px; }

    .detail-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .detail-type-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--c-muted); svg { display: block; } }
    .detail-objet { font-size: 17px; font-weight: 800; color: var(--c-text); margin-bottom: 10px; }
    .detail-desc { font-size: 13px; color: var(--c-muted); line-height: 1.6; margin-bottom: 16px; }

    .rh-reply { background: var(--c-accent-lt); border-left: 3px solid var(--c-accent); border-radius: var(--r); padding: 14px; margin-bottom: 16px; }
    .rh-reply-head { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; font-size: 12px; font-weight: 700; color: var(--c-primary); svg { display: block; } .rh-name { font-size: 11px; color: var(--c-muted); margin-left: auto; } }
    .rh-reply p { font-size: 13px; color: var(--c-text); line-height: 1.5; }

    .eval-box { background: var(--c-amber-lt); border: 1px solid #ecc94b; border-radius: var(--r); padding: 16px; margin-bottom: 16px; h4 { font-size: 13px; font-weight: 700; color: #744210; margin-bottom: 12px; } textarea { background: white; border-color: #ecc94b; margin-bottom: 12px; } }
    .stars-row { display: flex; gap: 4px; margin-bottom: 12px; }
    .star-btn { background: none; border: none; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; svg { display: block; } &.active svg { fill: #d69e2e; stroke: #d69e2e; } &:not(.active) svg { fill: none; stroke: var(--c-gray-200); } &:hover { transform: scale(1.2); } }
    .eval-done-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 12px; background: var(--c-amber-lt); border-radius: var(--r); margin-bottom: 16px; }
    .stars-display { display: flex; align-items: center; gap: 2px; }
    .star-disp { display: flex; }
    .star-filled svg { fill: #d69e2e; stroke: #d69e2e; display: block; }
    .star-empty  svg { fill: none; stroke: var(--c-gray-200); display: block; }
    .stars-display strong { font-size: 13px; color: var(--c-text); margin-left: 6px; }

    .comments-section { margin-top: 16px; h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; svg { display: block; } } }
    .comments-list { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; padding-right: 2px; margin-bottom: 12px; }
    .comment-item { display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--c-gray-50); &.rh { background: var(--c-accent-lt); border-left: 2px solid var(--c-accent); } &.internal { background: var(--c-red-lt); border-left: 2px solid var(--c-red); opacity: 0.85; } }
    .ci-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--c-gray-200); color: var(--c-muted); svg { display: block; } &.rh-av { background: var(--c-accent-lt); color: var(--c-primary); } &.lock-av { background: var(--c-red-lt); color: var(--c-red); } }
    .ci-body { flex: 1; }
    .ci-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; strong { font-size: 12px; color: var(--c-text); } }
    .ci-role { font-size: 10px; background: var(--c-gray-200); color: var(--c-muted); padding: 1px 5px; border-radius: 4px; }
    .ci-time { font-size: 11px; color: var(--c-muted); margin-left: auto; }
    .interne-chip { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; background: var(--c-red-lt); color: var(--c-red); padding: 1px 5px; border-radius: 4px; svg { display: block; } }
    .ci-body p { font-size: 13px; color: var(--c-text); line-height: 1.4; }
    .no-comments { text-align: center; padding: 18px; color: var(--c-muted); font-size: 13px; background: var(--c-gray-50); border-radius: 8px; }

    .new-comment { display: flex; gap: 8px; align-items: flex-start; textarea { flex: 1; } }
    .rh-comment-form { flex-direction: column; textarea { width: 100%; } }
    .rh-comment-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .interne-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--c-text); cursor: pointer; input { width: auto; } svg { display: block; flex-shrink: 0; } }

    .identity-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--c-gray-50); border-radius: var(--r); margin-bottom: 14px; strong { font-size: 13px; color: var(--c-text); display: block; } small { font-size: 11px; color: var(--c-muted); } svg { display: block; } &.anon-row { color: var(--c-purple); font-size: 13px; background: var(--c-purple-lt); svg { color: var(--c-purple); } } }

    .rh-modal-cols { display: grid; grid-template-columns: 1fr 320px; flex: 1; overflow: hidden; }
    .rh-modal-left { padding: 18px 20px; overflow-y: auto; border-right: 1px solid var(--c-gray-100); }
    .rh-modal-right { padding: 18px 20px; overflow-y: auto; background: var(--c-gray-50); }

    .action-card { background: white; border: 1px solid var(--c-gray-200); border-radius: var(--r); padding: 16px; margin-bottom: 14px; h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 14px; display: flex; align-items: center; gap: 7px; svg { display: block; } } label { font-size: 12px; font-weight: 600; color: var(--c-muted); display: block; margin-bottom: 5px; } textarea { margin-bottom: 10px; } }
    .timeline-card { background: white; border: 1px solid var(--c-gray-200); border-radius: var(--r); padding: 16px; margin-bottom: 14px; h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 14px; display: flex; align-items: center; gap: 7px; svg { display: block; } } }
    .tl { display: flex; flex-direction: column; }
    .tl-item { display: flex; gap: 10px; position: relative; padding-bottom: 14px; &:last-child { padding-bottom: 0; } &:not(:last-child)::before { content: ''; position: absolute; left: 8px; top: 18px; width: 2px; height: calc(100% - 18px); background: var(--c-gray-200); } }
    .tl-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; &.teal { background: var(--c-accent); } &.amber { background: var(--c-amber); } &.green { background: var(--c-green); } &.gray { background: var(--c-muted); } }
    .tl-body { flex: 1; strong { font-size: 12.5px; color: var(--c-text); display: block; margin-bottom: 2px; } span { font-size: 11px; color: var(--c-muted); display: block; } small { font-size: 11px; color: var(--c-accent); } }

    .eval-result-card { background: white; border: 1px solid #ecc94b; border-radius: var(--r); padding: 14px; h4 { font-size: 13px; font-weight: 700; color: #744210; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; svg { display: block; } } em { font-size: 12px; color: var(--c-muted); display: block; margin-top: 6px; } }
    .eval-stars-row { display: flex; align-items: center; gap: 2px; strong { font-size: 13px; color: var(--c-text); margin-left: 6px; } }
    .star-filled svg { display: block; fill: #d69e2e; stroke: #d69e2e; }
    .star-empty  svg { display: block; fill: none; stroke: var(--c-gray-200); }

    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } &.toast--info { background: var(--c-accent-lt); color: var(--c-primary); } }

    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; &.sm { width: 14px; height: 14px; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ReclamationsComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private authService        = inject(AuthService);
  private fb                 = inject(FormBuilder);

  role = this.authService.getRole();
  ic   = IC;

  activeTab         = signal<Tab>('mes-reclamations');
  loading           = signal(true);
  actionLoading     = signal(false);
  submitLoading     = signal(false);
  commentLoading    = signal(false);
  traitementLoading = signal(false);
  evalLoading       = signal(false);

  mesReclamations = signal<Reclamation[]>([]);
  nouvelles       = signal<Reclamation[]>([]);
  toutesRH        = signal<Reclamation[]>([]);
  statsRH         = signal<Record<string, number>>({});

  filterStatut    = signal('');
  filterType      = signal('');
  rhSearch        = signal('');
  rhFilterStatut  = signal('');
  rhFilterUrgence = signal('');

  detailReclamation = signal<Reclamation | null>(null);
  detailRH          = signal<Reclamation | null>(null);

  nouveauCommentaire   = '';
  nouveauCommentaireRH = '';
  commentaireInterne   = false;
  evalNote             = signal(0);
  evalCommentaire      = '';
  nouveauStatut        = 'EN_COURS';
  reponseRH            = '';
  formError   = signal('');
  formSuccess = signal('');
  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

  statuts = [
    { value: 'NOUVELLE', label: 'Nouvelle' }, { value: 'EN_COURS', label: 'En cours' },
    { value: 'RESOLUE',  label: 'Résolue'  }, { value: 'CLOTUREE', label: 'Clôturée' }
  ];

  typesReclamation = [
    { value: 'SALAIRE',                    label: 'Salaire',    iconSvg: IC.salary    },
    { value: 'CONDITIONS_TRAVAIL',         label: 'Conditions', iconSvg: IC.building  },
    { value: 'MATERIEL_EQUIPEMENT',        label: 'Matériel',   iconSvg: IC.monitor   },
    { value: 'RELATIONS_PROFESSIONNELLES', label: 'Relations',  iconSvg: IC.handshake },
    { value: 'AUTRE',                      label: 'Autre',      iconSvg: IC.file      }
  ];

  niveauxUrgence = [
    { value: 'FAIBLE',  label: 'Faible',  desc: 'Peut attendre',      color: 'faible'  },
    { value: 'NORMALE', label: 'Normale', desc: 'Traitement standard', color: 'normale' },
    { value: 'URGENTE', label: 'Urgente', desc: 'Priorité haute',      color: 'urgente' }
  ];

  reclamForm = this.fb.group({
    typeReclamation: ['', Validators.required],
    niveauUrgence:   ['NORMALE', Validators.required],
    objet:       ['', [Validators.required, Validators.minLength(5),  Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    anonyme: [false]
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    const obs: any = { mes: this.reclamationService.getMesReclamations() };
    if (this.isRHOrAdmin()) {
      obs.toutes    = this.reclamationService.getToutesRH();
      obs.nouvelles = this.reclamationService.parStatut('NOUVELLE');
      obs.stats     = this.reclamationService.getStatistiques();
    }
    forkJoin(obs).subscribe({
      next: (data: any) => {
        this.mesReclamations.set(data.mes ?? []);
        if (data.toutes)    this.toutesRH.set(data.toutes);
        if (data.nouvelles) this.nouvelles.set(data.nouvelles);
        if (data.stats)     this.statsRH.set(data.stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.formError.set(''); this.formSuccess.set(''); }
  toggleAnonyme(): void { this.reclamForm.get('anonyme')?.setValue(!this.reclamForm.get('anonyme')?.value); }

  onSubmit(): void {
    if (this.reclamForm.invalid) { this.reclamForm.markAllAsTouched(); return; }
    this.submitLoading.set(true); this.formError.set('');
    this.reclamationService.creer(this.reclamForm.value as any).subscribe({
      next: (data) => { this.submitLoading.set(false); this.formSuccess.set(`Réclamation créée ! Ticket : ${data.numeroTicket}`); this.mesReclamations.update(r => [data, ...r]); this.reclamForm.reset({ niveauUrgence: 'NORMALE', anonyme: false }); setTimeout(() => { this.formSuccess.set(''); this.setTab('mes-reclamations'); }, 2000); },
      error: (err) => { this.submitLoading.set(false); this.formError.set(err.error?.message ?? 'Erreur lors de la création.'); }
    });
  }

  ouvrirDetail(r: Reclamation): void {
    this.reclamationService.getDetail(r.id).subscribe({ next: (data) => { this.detailReclamation.set(data); this.evalNote.set(0); this.evalCommentaire = ''; this.nouveauCommentaire = ''; }, error: () => this.detailReclamation.set(r) });
  }

  ouvrirDetailRH(r: Reclamation): void {
    this.reclamationService.getDetailRH(r.id).subscribe({ next: (data) => { this.detailRH.set(data); this.nouveauCommentaireRH = ''; this.commentaireInterne = false; this.reponseRH = data.reponseRH ?? ''; this.nouveauStatut = data.statut; }, error: () => this.detailRH.set(r) });
  }

  ajouterCommentaire(): void {
    const r = this.detailReclamation(); if (!r || !this.nouveauCommentaire.trim()) return;
    this.commentLoading.set(true);
    this.reclamationService.commenterEmploye(r.id, { contenu: this.nouveauCommentaire }).subscribe({ next: () => { this.commentLoading.set(false); this.nouveauCommentaire = ''; this.ouvrirDetail(r); this.showToast('Commentaire ajouté', 'success'); }, error: () => { this.commentLoading.set(false); this.showToast('Erreur', 'error'); } });
  }

  ajouterCommentaireRH(): void {
    const r = this.detailRH(); if (!r || !this.nouveauCommentaireRH.trim()) return;
    this.commentLoading.set(true);
    this.reclamationService.commenterRH(r.id, { contenu: this.nouveauCommentaireRH, interne: this.commentaireInterne }).subscribe({ next: () => { this.commentLoading.set(false); this.nouveauCommentaireRH = ''; this.ouvrirDetailRH(r); this.showToast('Commentaire ajouté', 'success'); }, error: () => { this.commentLoading.set(false); this.showToast('Erreur', 'error'); } });
  }

  prendreEnCharge(id: number): void {
    this.actionLoading.set(true);
    this.reclamationService.prendreEnCharge(id).subscribe({ next: (data) => { this.actionLoading.set(false); this.nouvelles.update(n => n.filter(r => r.id !== id)); this.toutesRH.update(t => t.map(r => r.id === id ? data : r)); this.showToast('Réclamation prise en charge !', 'success'); }, error: () => { this.actionLoading.set(false); this.showToast('Erreur', 'error'); } });
  }

  prendreEnChargeRH(): void {
    const r = this.detailRH(); if (!r) return; this.actionLoading.set(true);
    this.reclamationService.prendreEnCharge(r.id).subscribe({ next: (data) => { this.actionLoading.set(false); this.detailRH.set(data); this.nouvelles.update(n => n.filter(x => x.id !== r.id)); this.showToast('Prise en charge !', 'success'); }, error: () => { this.actionLoading.set(false); this.showToast('Erreur', 'error'); } });
  }

  traiterReclamation(): void {
    const r = this.detailRH(); if (!r || !this.reponseRH.trim()) return; this.traitementLoading.set(true);
    this.reclamationService.traiter(r.id, { statut: this.nouveauStatut as StatutReclamation, reponseRH: this.reponseRH }).subscribe({ next: (data) => { this.traitementLoading.set(false); this.detailRH.set(data); this.toutesRH.update(t => t.map(x => x.id === r.id ? data : x)); this.showToast(`Réclamation ${this.nouveauStatut.toLowerCase()} !`, 'success'); }, error: (err) => { this.traitementLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); } });
  }

  soumettrEvaluation(): void {
    const r = this.detailReclamation(); if (!r || this.evalNote() === 0) return; this.evalLoading.set(true);
    this.reclamationService.evaluer(r.id, { note: this.evalNote(), commentaire: this.evalCommentaire }).subscribe({ next: (data) => { this.evalLoading.set(false); this.detailReclamation.set(data); this.mesReclamations.update(list => list.map(x => x.id === r.id ? data : x)); this.showToast('Évaluation envoyée !', 'success'); }, error: () => { this.evalLoading.set(false); this.showToast('Erreur lors de l\'évaluation', 'error'); } });
  }

  isRHOrAdmin(): boolean { return ['RH','ADMIN'].includes(this.role); }
  isInvalid(f: string): boolean { const c = this.reclamForm.get(f); return !!(c?.invalid && c?.touched); }
  getSubtitle(): string { const m: Record<string,string> = { EMPLOYE: 'Soumettez et suivez vos réclamations', MANAGER: 'Consultez les réclamations', RH: 'Gérez et traitez les réclamations', ADMIN: 'Administration des réclamations' }; return m[this.role] ?? ''; }
  getFilteredMes(): Reclamation[] { return this.mesReclamations().filter(r => (!this.filterStatut() || r.statut === this.filterStatut()) && (!this.filterType() || r.typeReclamation === this.filterType())); }
  getRHFiltered(): Reclamation[] { return this.toutesRH().filter(r => { const term = this.rhSearch().toLowerCase(); const m = !term || r.objet?.toLowerCase().includes(term) || r.employeNom?.toLowerCase().includes(term) || r.numeroTicket?.toLowerCase().includes(term); return m && (!this.rhFilterStatut() || r.statut === this.rhFilterStatut()) && (!this.rhFilterUrgence() || r.niveauUrgence === this.rhFilterUrgence()); }); }
  getCommentairesPublics() { return (this.detailReclamation()?.commentaires ?? []).filter(c => !c.interne); }
  getStatsRH() { const s = this.statsRH(); return [ { value: this.toutesRH().length, label: 'Total', color: 'primary' }, { value: s['NOUVELLE'] ?? 0, label: 'Nouvelles', color: 'info' }, { value: s['EN_COURS'] ?? 0, label: 'En cours', color: 'warning' }, { value: s['RESOLUE'] ?? 0, label: 'Résolues', color: 'success' }, { value: s['CLOTUREE'] ?? 0, label: 'Clôturées', color: 'danger' } ]; }
  isStatutDone(statut: StatutReclamation, step: string): boolean { const order = ['NOUVELLE','EN_COURS','RESOLUE','CLOTUREE']; return order.indexOf(statut) >= order.indexOf(step); }
  getTypeIconSvg(type: string): string { const map: Record<string, string> = { SALAIRE: IC.salary, CONDITIONS_TRAVAIL: IC.building, MATERIEL_EQUIPEMENT: IC.monitor, RELATIONS_PROFESSIONNELLES: IC.handshake, AUTRE: IC.file }; return map[type] ?? IC.megaphone; }
  getTypeLabel(type: string): string { const map: Record<string, string> = { SALAIRE: 'Salaire', CONDITIONS_TRAVAIL: 'Conditions de travail', MATERIEL_EQUIPEMENT: 'Matériel & équipement', RELATIONS_PROFESSIONNELLES: 'Relations professionnelles', AUTRE: 'Autre' }; return map[type] ?? type; }
  getUrgenceClass(u: string): string { return u?.toLowerCase() ?? ''; }
  getBadgeClass(statut: string): string { const map: Record<string, string> = { NOUVELLE: 'status-badge badge-info', EN_COURS: 'status-badge badge-warning', RESOLUE: 'status-badge badge-success', CLOTUREE: 'status-badge badge-gray' }; return map[statut] ?? 'status-badge badge-gray'; }
  getStatutLabel(statut: string): string { const map: Record<string, string> = { NOUVELLE: 'Nouvelle', EN_COURS: 'En cours', RESOLUE: 'Résolue', CLOTUREE: 'Clôturée' }; return map[statut] ?? statut; }
  getStatutClass(statut: string): string { const map: Record<string, string> = { NOUVELLE: 'statut-nouvelle', EN_COURS: 'statut-en-cours', RESOLUE: 'statut-resolue', CLOTUREE: 'statut-cloturee' }; return map[statut] ?? ''; }
  getInitiales2(r: any): string { return ((r?.employePrenom?.[0] ?? '') + (r?.employeNom?.[0] ?? '')).toUpperCase(); }
  showToast(message: string, type: string): void { this.toast.set({ show: true, message, type }); setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000); }
}