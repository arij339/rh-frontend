import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AutorisationService } from '../../core/services/autorisation.service';
import { AuthService }         from '../../core/services/auth.service';
import { PdfService }          from '../../core/services/pdf.service';
import {
  AutorisationSortie, StatutAutorisation
} from '../../core/models/autorisation.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'mes-sorties' | 'nouvelle' | 'en-attente' | 'toutes';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  door:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M13 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  list:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  clock:       `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  folder:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  calendar:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  mapPin:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  timer:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:           `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  ban:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  fileText:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  send:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  user:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  briefcase:   `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  medical:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
  note:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  close:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  download:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  arrowRight:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  alertCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  msgCircle:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  clockReturn: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  limitTime:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  calRule:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  noOverlap:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  search:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  toastOk:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  toastInfo:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

@Component({
  selector: 'app-autorisations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="autorisations fade-in">

  <!-- ── Header ── -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-header-icon">
        <span [innerHTML]="ic.door | safeHtml"></span>
      </div>
      <div>
        <h1>Autorisations de Sortie</h1>
        <p>{{ getSubtitle() }}</p>
      </div>
    </div>
    <div class="compteur-card">
      <div class="compteur-circle" [class.full]="compteurMois() >= 3">
        <span class="compteur-val">{{ compteurMois() }}</span>
        <span class="compteur-sep">/</span>
        <span class="compteur-max">3</span>
      </div>
      <div class="compteur-info">
        <strong>Sorties ce mois</strong>
        <span>Maximum 3 autorisé</span>
      </div>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'mes-sorties'" (click)="setTab('mes-sorties')">
        <span [innerHTML]="ic.list | safeHtml"></span>
        Mes sorties
        <span class="tab-count">{{ mesSorties().length }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'nouvelle'" (click)="setTab('nouvelle')">
        <span [innerHTML]="ic.plus | safeHtml"></span>
        Nouvelle demande
      </button>
      <button class="tab" *ngIf="isManagerOrAbove()" [class.active]="activeTab() === 'en-attente'" (click)="setTab('en-attente')">
        <span [innerHTML]="ic.clock | safeHtml"></span>
        En attente
        <span class="tab-count warning" *ngIf="enAttente().length > 0">{{ enAttente().length }}</span>
      </button>
      <button class="tab" *ngIf="isRHOrAdmin()" [class.active]="activeTab() === 'toutes'" (click)="setTab('toutes')">
        <span [innerHTML]="ic.folder | safeHtml"></span>
        Toutes les sorties
      </button>
    </div>
  </div>

  <!-- ===================== MES SORTIES ===================== -->
  <div *ngIf="activeTab() === 'mes-sorties'" class="tab-content fade-in">

    <div class="filters-bar">
      <select class="filter-select" (change)="filterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
      </select>
      <select class="filter-select" (change)="filterType.set($any($event.target).value)">
        <option value="">Tous les types</option>
        <option value="PERSONNEL">Personnel</option>
        <option value="PROFESSIONNEL">Professionnel</option>
        <option value="MEDICAL">Médical</option>
      </select>
    </div>

    <!-- Banner aujourd'hui -->
    <div class="today-banner" *ngIf="getSortiesToday().length > 0">
      <div class="today-banner-icon">
        <span [innerHTML]="ic.mapPin | safeHtml"></span>
      </div>
      <div class="today-banner-body">
        <strong>Sortie prévue aujourd'hui</strong>
        <span *ngFor="let s of getSortiesToday()">
          {{ s.heureSortie }} → {{ s.heureRetourPrevue }} ({{ s.dureePrevueFormatee }})
        </span>
      </div>
      <button class="btn btn-secondary"
              *ngIf="getSortiesToday()[0]?.statut === 'VALIDEE' && !getSortiesToday()[0]?.heureRetourReelle"
              (click)="ouvrirPointage(getSortiesToday()[0])">
        <span [innerHTML]="ic.clockReturn | safeHtml"></span> Pointer retour
      </button>
    </div>

    <div class="sorties-list" *ngIf="getFilteredMesSorties().length > 0">
      <div class="sortie-card" *ngFor="let s of getFilteredMesSorties()"
           [class]="'sortie-card ' + getStatutClass(s.statut)">
        <div class="sc-accent"></div>

        <div class="sc-header">
          <div class="sc-left">
            <div class="sc-type-badge" [class]="getTypeBadgeClass(s.typeSortie)">
              <span [innerHTML]="getTypeIconSvg(s.typeSortie) | safeHtml"></span>
              {{ s.typeSortie }}
            </div>
            <div class="sc-date">
              <span [innerHTML]="ic.calendar | safeHtml"></span>
              {{ s.dateSortie | date:'EEEE d MMMM yyyy' }}
            </div>
          </div>
          <span class="badge" [class]="getBadgeClass(s.statut)">{{ getStatutLabel(s.statut) }}</span>
        </div>

        <div class="sc-body">
          <div class="horaires-row">
            <div class="horaire-block">
              <span class="horaire-label">Départ</span>
              <span class="horaire-value">{{ s.heureSortie }}</span>
            </div>
            <div class="horaire-sep"><span [innerHTML]="ic.arrowRight | safeHtml"></span></div>
            <div class="horaire-block">
              <span class="horaire-label">Retour prévu</span>
              <span class="horaire-value">{{ s.heureRetourPrevue }}</span>
            </div>
            <div class="horaire-sep">|</div>
            <div class="horaire-block">
              <span class="horaire-label">Durée prévue</span>
              <span class="horaire-value teal">{{ s.dureePrevueFormatee }}</span>
            </div>
            <ng-container *ngIf="s.heureRetourReelle">
              <div class="horaire-sep"><span [innerHTML]="ic.arrowRight | safeHtml"></span></div>
              <div class="horaire-block">
                <span class="horaire-label">Retour réel</span>
                <span class="horaire-value green">{{ s.heureRetourReelle }}</span>
              </div>
              <div class="horaire-block">
                <span class="horaire-label">Durée réelle</span>
                <span class="horaire-value green">{{ s.dureeReelleFormatee }}</span>
              </div>
            </ng-container>
          </div>

          <div class="sc-motif" *ngIf="s.motif">
            <span class="sc-motif-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
            {{ s.motif }}
          </div>

          <div class="sc-validation" *ngIf="s.managerValideurNom">
            <span class="sv-icon"><span [innerHTML]="ic.user | safeHtml"></span></span>
            <span class="sv-by">{{ s.managerValideurNom }}</span>
            <span class="sv-date">{{ s.dateValidation | date:'dd/MM/yyyy HH:mm' }}</span>
            <span class="sv-comment" *ngIf="s.commentaireManager">"{{ s.commentaireManager }}"</span>
          </div>
        </div>

        <div class="sc-actions">
          <button class="btn btn-secondary"
                  *ngIf="s.statut === 'VALIDEE' && !s.heureRetourReelle && isToday(s.dateSortie)"
                  (click)="ouvrirPointage(s)">
            <span [innerHTML]="ic.clockReturn | safeHtml"></span> Pointer retour
          </button>
          <button class="btn btn-danger" *ngIf="canAnnuler(s)" (click)="annulerSortie(s.id)" [disabled]="actionLoading()">
            <span [innerHTML]="ic.ban | safeHtml"></span> Annuler
          </button>
          <button class="btn btn-outline" *ngIf="s.statut === 'VALIDEE'" (click)="exportAttestation(s)">
            <span [innerHTML]="ic.download | safeHtml"></span> Attestation PDF
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="getFilteredMesSorties().length === 0">
      <div class="empty-icon"><span [innerHTML]="ic.door | safeHtml"></span></div>
      <h3>Aucune autorisation</h3>
      <p>Vous n'avez pas encore de demande de sortie.</p>
      <button class="btn btn-primary" (click)="setTab('nouvelle')">
        <span [innerHTML]="ic.plus | safeHtml"></span> Créer une demande
      </button>
    </div>
  </div>

  <!-- ===================== NOUVELLE DEMANDE ===================== -->
  <div *ngIf="activeTab() === 'nouvelle'" class="tab-content fade-in">
    <div class="form-card">

      <div class="form-header">
        <div class="form-header-icon"><span [innerHTML]="ic.door | safeHtml"></span></div>
        <div>
          <h3>Nouvelle autorisation de sortie</h3>
          <p>Maximum 4h — 3 sorties par mois</p>
        </div>
      </div>

      <div class="rules-info">
        <div class="rule-item">
          <span [innerHTML]="ic.limitTime | safeHtml"></span>
          <span>Maximum 4h par sortie</span>
        </div>
        <div class="rule-item">
          <span [innerHTML]="ic.calRule | safeHtml"></span>
          <span>3 sorties maximum par mois</span>
        </div>
        <div class="rule-item">
          <span [innerHTML]="ic.noOverlap | safeHtml"></span>
          <span>Pas de chevauchement d'horaires</span>
        </div>
        <div class="rule-item">
          <span [innerHTML]="ic.calendar | safeHtml"></span>
          <span>Date non passée uniquement</span>
        </div>
      </div>

      <form [formGroup]="sortieForm" (ngSubmit)="onSubmit()">

        <div class="form-group">
          <label>Type de sortie *</label>
          <div class="type-selector">
            <div class="type-option" *ngFor="let t of typesSortie"
                 [class.selected]="sortieForm.get('typeSortie')?.value === t.value"
                 (click)="sortieForm.get('typeSortie')?.setValue(t.value)">
              <div class="type-opt-icon" [class]="t.color">
                <span [innerHTML]="t.iconSvg | safeHtml"></span>
              </div>
              <div>
                <strong>{{ t.label }}</strong>
                <small>{{ t.desc }}</small>
              </div>
              <div class="type-check" *ngIf="sortieForm.get('typeSortie')?.value === t.value">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
          <span class="error-msg" *ngIf="isInvalid('typeSortie')">Sélectionnez un type</span>
        </div>

        <div class="form-group">
          <label>Date de sortie *</label>
          <input type="date" formControlName="dateSortie" [min]="minDate" [class.error]="isInvalid('dateSortie')" />
          <span class="error-msg" *ngIf="isInvalid('dateSortie')">Obligatoire</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Heure de sortie *</label>
            <input type="time" formControlName="heureSortie" [class.error]="isInvalid('heureSortie')" (change)="calculerDuree()" />
            <span class="error-msg" *ngIf="isInvalid('heureSortie')">Obligatoire</span>
          </div>
          <div class="form-group">
            <label>Heure de retour prévue *</label>
            <input type="time" formControlName="heureRetourPrevue" [class.error]="isInvalid('heureRetourPrevue')" (change)="calculerDuree()" />
            <span class="error-msg" *ngIf="isInvalid('heureRetourPrevue')">Obligatoire</span>
          </div>
        </div>

        <div class="duree-preview" *ngIf="dureePreview() !== null">
          <div class="dp-content" [class.error]="dureePreview()! > 240" [class.ok]="dureePreview()! > 0 && dureePreview()! <= 240">
            <span class="dp-icon" [innerHTML]="(dureePreview()! > 240 ? ic.toastErr : ic.checkCircle) | safeHtml"></span>
            <div>
              <strong>Durée : {{ formatDuree(dureePreview()!) }}</strong>
              <span *ngIf="dureePreview()! > 240">Dépasse la limite de 4h</span>
              <span *ngIf="dureePreview()! <= 240 && dureePreview()! > 0">Dans la limite autorisée</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Motif *</label>
          <textarea formControlName="motif" placeholder="Décrivez le motif de votre sortie..." rows="3" [class.error]="isInvalid('motif')"></textarea>
          <span class="error-msg" *ngIf="isInvalid('motif')">Minimum 5 caractères requis</span>
        </div>

        <div class="form-alert error" *ngIf="formError()">
          <span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ formError() }}
        </div>
        <div class="form-alert success" *ngIf="formSuccess()">
          <span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ formSuccess() }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="sortieForm.reset()">Réinitialiser</button>
          <button type="submit" class="btn btn-primary" [disabled]="submitLoading() || (dureePreview() ?? 0) > 240">
            <span *ngIf="!submitLoading()"><span [innerHTML]="ic.send | safeHtml"></span> Soumettre</span>
            <span *ngIf="submitLoading()" class="spinner"></span>
          </button>
        </div>

      </form>
    </div>
  </div>

  <!-- ===================== EN ATTENTE ===================== -->
  <div *ngIf="activeTab() === 'en-attente'" class="tab-content fade-in">

    <div class="empty-state" *ngIf="enAttente().length === 0">
      <div class="empty-icon success-icon"><span [innerHTML]="ic.checkCircle | safeHtml"></span></div>
      <h3>Tout est traité !</h3>
      <p>Aucune autorisation en attente.</p>
    </div>

    <div class="sorties-list" *ngIf="enAttente().length > 0">
      <div class="sortie-card validation-card" *ngFor="let s of enAttente()">
        <div class="sc-accent"></div>

        <div class="sc-header">
          <div class="sc-left">
            <div class="user-info-block">
              <div class="user-avatar-md">{{ getInitiales(s) }}</div>
              <div>
                <strong>{{ s.employeNom }} {{ s.employePrenom }}</strong>
                <span class="user-sub">{{ s.employeMatricule }} • {{ s.employeDepartement }}</span>
              </div>
            </div>
          </div>
          <div class="sc-right">
            <div class="sc-type-badge" [class]="getTypeBadgeClass(s.typeSortie)">
              <span [innerHTML]="getTypeIconSvg(s.typeSortie) | safeHtml"></span>
              {{ s.typeSortie }}
            </div>
            <span class="badge badge-warning">
              <span [innerHTML]="ic.clock | safeHtml"></span> En attente
            </span>
          </div>
        </div>

        <div class="sc-body">
          <div class="horaires-row">
            <div class="horaire-block">
              <span class="horaire-label">Date</span>
              <span class="horaire-value">{{ s.dateSortie | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="horaire-block">
              <span class="horaire-label">Départ</span>
              <span class="horaire-value">{{ s.heureSortie }}</span>
            </div>
            <div class="horaire-sep"><span [innerHTML]="ic.arrowRight | safeHtml"></span></div>
            <div class="horaire-block">
              <span class="horaire-label">Retour</span>
              <span class="horaire-value">{{ s.heureRetourPrevue }}</span>
            </div>
            <div class="horaire-block">
              <span class="horaire-label">Durée</span>
              <span class="horaire-value teal">{{ s.dureePrevueFormatee }}</span>
            </div>
          </div>

          <div class="sc-motif" *ngIf="s.motif">
            <span class="sc-motif-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
            {{ s.motif }}
          </div>

          <div class="validation-form" *ngIf="validatingId() === s.id">
            <textarea [(ngModel)]="validationCommentaire" placeholder="Commentaire (optionnel)..." rows="2"></textarea>
            <div class="vf-actions">
              <button class="btn btn-danger" (click)="valider(s.id, false)" [disabled]="validationLoading()">
                <span [innerHTML]="ic.x | safeHtml"></span> Rejeter
              </button>
              <button class="btn btn-primary" (click)="valider(s.id, true)" [disabled]="validationLoading()">
                <span *ngIf="!validationLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Approuver</span>
                <span *ngIf="validationLoading()" class="spinner"></span>
              </button>
              <button class="btn btn-outline" (click)="validatingId.set(null)">Annuler</button>
            </div>
          </div>
        </div>

        <div class="sc-actions" *ngIf="validatingId() !== s.id">
          <button class="btn btn-primary" (click)="validatingId.set(s.id); validationCommentaire = ''">
            <span [innerHTML]="ic.note | safeHtml"></span> Traiter cette demande
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== TOUTES (RH) ===================== -->
  <div *ngIf="activeTab() === 'toutes'" class="tab-content fade-in">

    <div class="filters-bar">
      <div class="search-wrap">
        <span [innerHTML]="ic.search | safeHtml"></span>
        <input type="text" placeholder="Rechercher un employé..." (input)="rhSearch.set($any($event.target).value)" class="search-inp" />
      </div>
      <select class="filter-select" (change)="rhFilterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
      </select>
      <select class="filter-select" (change)="rhFilterType.set($any($event.target).value)">
        <option value="">Tous les types</option>
        <option value="PERSONNEL">Personnel</option>
        <option value="PROFESSIONNEL">Professionnel</option>
        <option value="MEDICAL">Médical</option>
      </select>
      <button class="btn btn-primary" (click)="exportRapportPDF()">
        <span [innerHTML]="ic.download | safeHtml"></span> Export PDF
      </button>
    </div>

    <div class="rh-stats">
      <div class="rh-stat" *ngFor="let stat of getRHStats()">
        <span class="rh-stat-value" [class]="stat.color">{{ stat.value }}</span>
        <span class="rh-stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Type</th>
              <th>Durée</th>
              <th>Retour réel</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of getRHFiltered()">
              <td>
                <div class="user-cell">
                  <div class="mini-avatar">{{ getInitiales(s) }}</div>
                  <div>
                    <strong>{{ s.employeNom }} {{ s.employePrenom }}</strong>
                    <small class="dept">{{ s.employeDepartement }}</small>
                  </div>
                </div>
              </td>
              <td class="date-cell">{{ s.dateSortie | date:'dd/MM/yyyy' }}</td>
              <td class="date-cell">{{ s.heureSortie }} → {{ s.heureRetourPrevue }}</td>
              <td>
                <span class="type-chip" [class]="getTypeBadgeClass(s.typeSortie)">
                  <span [innerHTML]="getTypeIconSvg(s.typeSortie) | safeHtml"></span>
                  {{ s.typeSortie }}
                </span>
              </td>
              <td><strong>{{ s.dureePrevueFormatee }}</strong></td>
              <td>
                <span *ngIf="s.heureRetourReelle" class="badge badge-success">{{ s.heureRetourReelle }}</span>
                <span *ngIf="!s.heureRetourReelle" class="badge badge-gray">—</span>
              </td>
              <td>
                <span class="badge" [class]="getBadgeClass(s.statut)">{{ getStatutLabel(s.statut) }}</span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-action" title="Traiter" *ngIf="s.statut === 'EN_ATTENTE_RH'" (click)="ouvrirValidationRH(s)">
                    <span [innerHTML]="ic.note | safeHtml"></span>
                  </button>
                  <button class="icon-action" title="Attestation PDF" *ngIf="s.statut === 'VALIDEE'" (click)="exportAttestation(s)">
                    <span [innerHTML]="ic.download | safeHtml"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal validation RH -->
    <div class="modal-overlay" *ngIf="selectedSortieRH()" (click)="selectedSortieRH.set(null)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><span [innerHTML]="ic.note | safeHtml"></span> Valider l'autorisation</h3>
          <button class="modal-close" (click)="selectedSortieRH.set(null)" [innerHTML]="ic.close | safeHtml"></button>
        </div>
        <div class="modal-body">
          <div class="modal-info">
            <p><strong>Employé :</strong> {{ selectedSortieRH()?.employeNom }} {{ selectedSortieRH()?.employePrenom }}</p>
            <p><strong>Date :</strong> {{ selectedSortieRH()?.dateSortie | date:'dd/MM/yyyy' }}</p>
            <p><strong>Horaire :</strong> {{ selectedSortieRH()?.heureSortie }} → {{ selectedSortieRH()?.heureRetourPrevue }}</p>
            <p><strong>Durée :</strong> {{ selectedSortieRH()?.dureePrevueFormatee }}</p>
            <p><strong>Type :</strong> {{ selectedSortieRH()?.typeSortie }}</p>
            <p><strong>Motif :</strong> {{ selectedSortieRH()?.motif }}</p>
          </div>
          <div class="form-group" style="margin-top:16px">
            <label>Commentaire</label>
            <textarea [(ngModel)]="validationCommentaire" placeholder="Commentaire..." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" (click)="validerRH(false)" [disabled]="validationLoading()">
            <span [innerHTML]="ic.x | safeHtml"></span> Rejeter
          </button>
          <button class="btn btn-primary" (click)="validerRH(true)" [disabled]="validationLoading()">
            <span *ngIf="!validationLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Valider</span>
            <span *ngIf="validationLoading()" class="spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal pointage retour -->
  <div class="modal-overlay" *ngIf="sortieAPointer()" (click)="sortieAPointer.set(null)">
    <div class="modal pointage-modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3><span [innerHTML]="ic.clockReturn | safeHtml"></span> Pointer votre retour</h3>
        <button class="modal-close" (click)="sortieAPointer.set(null)" [innerHTML]="ic.close | safeHtml"></button>
      </div>
      <div class="modal-body">
        <div class="pointage-info">
          <p>Sortie : <strong>{{ sortieAPointer()?.heureSortie }}</strong></p>
          <p>Retour prévu : <strong>{{ sortieAPointer()?.heureRetourPrevue }}</strong></p>
        </div>
        <div class="form-group" style="margin-top:16px">
          <label>Heure de retour réelle</label>
          <input type="time" [(ngModel)]="heureRetourReelle" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="sortieAPointer.set(null)">Annuler</button>
        <button class="btn btn-primary" (click)="confirmerPointage()" [disabled]="!heureRetourReelle || pointageLoading()">
          <span *ngIf="!pointageLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Confirmer le retour</span>
          <span *ngIf="pointageLoading()" class="spinner"></span>
        </button>
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
      --c-purple:    #805ad5;
      --c-purple-lt: #e9d8fd;
      --c-text:      #1a202c;
      --c-muted:     #718096;
      --c-gray-100:  #eef0f3;
      --c-gray-200:  #e2e8f0;
      --r:     12px;
      --r-lg:  16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .autorisations { max-width: 1100px; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .page-header-left { display: flex; align-items: center; gap: 14px; }
    .page-header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 14px rgba(14,157,175,0.3); svg { display: block; } }
    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin: 0 0 4px; }
    .page-header p { font-size: 13px; color: var(--c-muted); margin: 0; }

    .compteur-card { display: flex; align-items: center; gap: 14px; background: white; padding: 14px 20px; border-radius: var(--r-lg); box-shadow: var(--sh); border: 1px solid var(--c-gray-200); }
    .compteur-circle { width: 54px; height: 54px; border-radius: 50%; background: var(--c-teal-lt); border: 3px solid var(--c-teal); display: flex; align-items: center; justify-content: center; gap: 1px; flex-shrink: 0; &.full { background: var(--c-red-lt); border-color: var(--c-red); .compteur-val { color: var(--c-red); } } }
    .compteur-val  { font-size: 18px; font-weight: 800; color: var(--c-teal); line-height: 1; }
    .compteur-sep  { font-size: 12px; color: var(--c-muted); }
    .compteur-max  { font-size: 13px; color: var(--c-muted); font-weight: 600; }
    .compteur-info { strong { font-size: 13px; color: var(--c-text); font-weight: 700; display: block; } span { font-size: 11px; color: var(--c-muted); } }

    /* ── Tabs ── */
    .tabs-wrapper { margin-bottom: 24px; }
    .tabs { display: flex; gap: 2px; background: white; padding: 5px; border-radius: 14px; box-shadow: var(--sh); flex-wrap: wrap; border: 1px solid var(--c-gray-200); }
    .tab { padding: 10px 16px; border: none; background: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-muted); transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; svg { display: block; flex-shrink: 0; } &:hover { background: var(--c-gray-100); color: var(--c-text); } &.active { background: var(--c-teal); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); } &.active svg { stroke: white; } }
    .tab-count { min-width: 20px; height: 20px; padding: 0 6px; background: var(--c-gray-200); color: var(--c-muted); border-radius: 10px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; &.warning { background: var(--c-amber-lt); color: var(--c-amber); } }
    .tab.active .tab-count { background: rgba(255,255,255,0.25); color: white; }

    /* ── Today banner ── */
    .today-banner { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg, var(--c-teal-lt), #d0f4f8); border: 1px solid var(--c-teal); border-radius: var(--r-lg); padding: 14px 20px; margin-bottom: 20px; }
    .today-banner-icon { width: 40px; height: 40px; border-radius: 10px; background: white; color: var(--c-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } }
    .today-banner-body { flex: 1; strong { display: block; font-size: 14px; color: var(--c-teal-dk); font-weight: 700; } span { font-size: 13px; color: var(--c-text); display: block; } }

    /* ── Cards ── */
    .sorties-list { display: flex; flex-direction: column; gap: 14px; }
    .sortie-card { background: white; border-radius: var(--r-lg); padding: 18px 22px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; &:hover { box-shadow: var(--sh-md); transform: translateY(-2px); } &.validation-card { cursor: default; &:hover { transform: none; } } }
    .sc-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--c-teal); border-radius: 4px 0 0 4px; }
    .statut-validee  .sc-accent { background: var(--c-green); }
    .statut-rejetee  .sc-accent { background: var(--c-red); }
    .statut-annulee  .sc-accent { background: var(--c-gray-200); }
    .statut-attente  .sc-accent { background: var(--c-amber); }

    .sc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
    .sc-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .sc-right { display: flex; align-items: center; gap: 8px; }
    .sc-date { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--c-text); font-weight: 600; svg { display: block; flex-shrink: 0; color: var(--c-muted); } }
    .sc-type-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; svg { display: block; width: 13px; height: 13px; } &.personnel { background: var(--c-blue-lt); color: var(--c-blue); } &.professionnel { background: var(--c-teal-lt); color: var(--c-teal); } &.medical { background: var(--c-green-lt); color: var(--c-green); } }

    .sc-body { margin-bottom: 12px; }

    /* ── Horaires ── */
    .horaires-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: var(--c-gray-100); border-radius: var(--r); padding: 14px 16px; margin-bottom: 12px; }
    .horaire-block { display: flex; flex-direction: column; gap: 3px; }
    .horaire-label { font-size: 10px; color: var(--c-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .horaire-value { font-size: 16px; font-weight: 700; color: var(--c-text); &.teal { color: var(--c-teal); } &.green { color: var(--c-green); } }
    .horaire-sep { color: var(--c-muted); font-size: 16px; display: flex; align-items: center; margin-bottom: 2px; svg { display: block; } }

    .sc-motif { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--c-text); padding: 9px 12px; background: white; border-radius: 8px; border-left: 3px solid var(--c-teal); margin-bottom: 10px; }
    .sc-motif-icon { flex-shrink: 0; color: var(--c-teal); margin-top: 1px; svg { display: block; } }

    .sc-validation { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--c-muted); flex-wrap: wrap; }
    .sv-icon { flex-shrink: 0; svg { display: block; } }
    .sv-by { font-weight: 600; color: var(--c-text); }
    .sv-comment { font-style: italic; }

    .sc-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--c-gray-200); }

    /* ── Validation card ── */
    .user-info-block { display: flex; align-items: center; gap: 12px; }
    .user-avatar-md { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
    .user-sub { font-size: 11px; color: var(--c-muted); display: block; }

    .validation-form { margin-top: 12px; padding: 14px; background: var(--c-gray-100); border-radius: var(--r); textarea { width: 100%; padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; resize: none; background: white; margin-bottom: 12px; &:focus { border-color: var(--c-teal); } } }
    .vf-actions { display: flex; gap: 8px; justify-content: flex-end; }

    /* ── Form ── */
    .form-card { background: white; border-radius: 20px; padding: 32px; max-width: 680px; margin: 0 auto; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .form-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .form-header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .form-header h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin: 0 0 4px; }
    .form-header p { font-size: 12px; color: var(--c-muted); margin: 0; }

    .rules-info { background: var(--c-teal-lt); border-radius: var(--r); padding: 12px 14px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
    .rule-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--c-teal); padding: 5px 10px; background: white; border-radius: 8px; svg { display: block; flex-shrink: 0; } }

    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; label { font-size: 12px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    input[type="date"], input[type="time"], textarea {
      padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; width: 100%;
      &:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); }
      &.error { border-color: var(--c-red); }
    }
    textarea { resize: vertical; }

    .error-msg { font-size: 11px; color: var(--c-red); font-weight: 500; }

    /* ── Type selector ── */
    .type-selector { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
    .type-option { display: flex; align-items: center; gap: 10px; padding: 13px 14px; border-radius: var(--r); border: 2px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; position: relative; background: white; &:hover { border-color: var(--c-teal); background: var(--c-teal-lt); } &.selected { border-color: var(--c-teal); background: var(--c-teal-lt); box-shadow: 0 0 0 3px rgba(14,157,175,0.12); } strong { font-size: 13px; color: var(--c-text); display: block; } small { font-size: 11px; color: var(--c-muted); } }
    .type-opt-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.blue { background: var(--c-blue-lt); color: var(--c-blue); } &.teal { background: var(--c-teal-lt); color: var(--c-teal); } &.green { background: var(--c-green-lt); color: var(--c-green); } }
    .type-check { position: absolute; top: 6px; right: 6px; width: 16px; height: 16px; border-radius: 50%; background: var(--c-teal); display: flex; align-items: center; justify-content: center; svg { display: block; } }

    /* ── Durée preview ── */
    .duree-preview { margin-bottom: 18px; }
    .dp-content { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--r); &.ok { background: var(--c-green-lt); border: 1px solid #9ae6b4; } &.error { background: var(--c-red-lt); border: 1px solid #fc8181; } strong { font-size: 13px; color: var(--c-text); display: block; } span { font-size: 12px; color: var(--c-muted); } }
    .dp-icon { flex-shrink: 0; svg { display: block; } }

    /* ── Form alerts ── */
    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 14px; svg { flex-shrink: 0; display: block; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

    /* ── Buttons ── */
    .btn { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; svg { display: block; flex-shrink: 0; } &.btn-primary { background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(14,157,175,0.4); } } &.btn-secondary { background: var(--c-teal-lt); color: var(--c-teal); border: 1px solid rgba(14,157,175,0.3); &:hover { background: var(--c-teal); color: white; } } &.btn-danger { background: var(--c-red-lt); color: var(--c-red); &:hover { background: var(--c-red); color: white; } } &.btn-outline { background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); &:hover { border-color: var(--c-teal); color: var(--c-teal); } } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; } }

    /* ── Filters ── */
    .filters-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; cursor: pointer; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-teal); } }
    .search-wrap { position: relative; flex: 1; display: flex; align-items: center; svg { position: absolute; left: 12px; color: var(--c-muted); display: block; pointer-events: none; } }
    .search-inp { width: 100%; padding: 10px 14px 10px 36px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; &:focus { border-color: var(--c-teal); } }

    /* ── RH Stats ── */
    .rh-stats { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .rh-stat { background: white; padding: 11px 18px; border-radius: var(--r); border: 1px solid var(--c-gray-200); display: flex; flex-direction: column; gap: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .rh-stat-value { font-size: 22px; font-weight: 800; &.primary { color: var(--c-teal); } &.success { color: var(--c-green); } &.warning { color: var(--c-amber); } &.danger { color: var(--c-red); } &.info { color: var(--c-blue); } }
    .rh-stat-label { font-size: 11px; color: var(--c-muted); font-weight: 500; }

    /* ── Table ── */
    .card { background: white; border-radius: var(--r-lg); padding: 20px 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 20px; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--c-gray-100); border-bottom: 1px solid var(--c-gray-200); &:first-child { border-radius: 8px 0 0 8px; } &:last-child { border-radius: 0 8px 8px 0; } }
    tbody tr { transition: background 0.15s; &:hover { background: var(--c-gray-100); } }
    tbody td { padding: 12px 14px; border-bottom: 1px solid var(--c-gray-100); vertical-align: middle; }
    .date-cell { font-size: 12px; color: var(--c-muted); white-space: nowrap; }
    .user-cell { display: flex; align-items: center; gap: 8px; strong { display: block; } }
    .mini-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }
    .dept { display: block; font-size: 11px; color: var(--c-muted); }
    .type-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; svg { display: block; width: 11px; height: 11px; } &.personnel { background: var(--c-blue-lt); color: var(--c-blue); } &.professionnel { background: var(--c-teal-lt); color: var(--c-teal); } &.medical { background: var(--c-green-lt); color: var(--c-green); } }
    .action-btns { display: flex; gap: 4px; }
    .icon-action { width: 32px; height: 32px; border: none; background: var(--c-gray-100); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-teal-lt); color: var(--c-teal); transform: scale(1.1); } }

    /* ── Badges ── */
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; svg { display: block; width: 11px; height: 11px; } }
    .badge-success { background: var(--c-green-lt); color: var(--c-green); }
    .badge-danger  { background: var(--c-red-lt);   color: var(--c-red); }
    .badge-warning { background: var(--c-amber-lt); color: var(--c-amber); }
    .badge-info    { background: var(--c-teal-lt);  color: var(--c-teal); }
    .badge-gray    { background: var(--c-gray-200); color: var(--c-muted); }

    /* ── Modal ── */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
    .modal { background: white; border-radius: 18px; width: 500px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.2); &.pointage-modal { width: 420px; } }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--c-gray-200); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; h3 { font-size: 15px; font-weight: 700; color: var(--c-text); display: flex; align-items: center; gap: 8px; margin: 0; svg { display: block; color: var(--c-teal); } } }
    .modal-close { width: 30px; height: 30px; border: none; background: var(--c-gray-100); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-red-lt); color: var(--c-red); } }
    .modal-body { padding: 18px 20px; overflow-y: auto; }
    .modal-info { background: var(--c-gray-100); border-radius: var(--r); padding: 14px; p { font-size: 13px; color: var(--c-text); margin-bottom: 6px; &:last-child { margin: 0; } strong { color: var(--c-teal); } } }
    .modal-footer { padding: 14px 20px; border-top: 1px solid var(--c-gray-200); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; }
    .pointage-info { background: var(--c-teal-lt); border-radius: var(--r); padding: 14px; p { font-size: 14px; color: var(--c-text); margin-bottom: 6px; strong { color: var(--c-teal); } } }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-200); }
    .empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; svg { display: block; } &.success-icon { background: var(--c-green-lt); color: var(--c-green); } }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
    .empty-state p  { color: var(--c-muted); font-size: 13px; margin-bottom: 20px; }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } &.toast--info { background: var(--c-teal-lt); color: var(--c-teal); } }

    /* ── Spinner ── */
    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AutorisationsComponent implements OnInit {

  private autorisationService = inject(AutorisationService);
  private authService         = inject(AuthService);
  private pdfService          = inject(PdfService);
  private fb                  = inject(FormBuilder);

  role = this.authService.getRole();
  ic   = IC;

  activeTab         = signal<Tab>('mes-sorties');
  loading           = signal(true);
  actionLoading     = signal(false);
  submitLoading     = signal(false);
  validationLoading = signal(false);
  pointageLoading   = signal(false);

  mesSorties    = signal<AutorisationSortie[]>([]);
  enAttente     = signal<AutorisationSortie[]>([]);
  toutesSorties = signal<AutorisationSortie[]>([]);

  filterStatut   = signal('');
  filterType     = signal('');
  rhSearch       = signal('');
  rhFilterStatut = signal('');
  rhFilterType   = signal('');

  validatingId          = signal<number | null>(null);
  validationCommentaire = '';
  selectedSortieRH      = signal<AutorisationSortie | null>(null);
  sortieAPointer        = signal<AutorisationSortie | null>(null);
  heureRetourReelle     = '';

  dureePreview = signal<number | null>(null);
  formError    = signal('');
  formSuccess  = signal('');

  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

  get minDate(): string { return new Date().toISOString().split('T')[0]; }

  statuts = [
    { value: 'EN_ATTENTE_MANAGER', label: 'Attente Manager' },
    { value: 'EN_ATTENTE_RH',      label: 'Attente RH' },
    { value: 'VALIDEE',            label: 'Validée' },
    { value: 'REJETEE',            label: 'Rejetée' },
    { value: 'ANNULEE',            label: 'Annulée' }
  ];

  typesSortie = [
    { value: 'PERSONNEL',     label: 'Personnel',     desc: 'Raison personnelle',  color: 'blue',  iconSvg: IC.user      },
    { value: 'PROFESSIONNEL', label: 'Professionnel', desc: 'Mission ou réunion',  color: 'teal',  iconSvg: IC.briefcase },
    { value: 'MEDICAL',       label: 'Médical',       desc: 'Consultation médicale', color: 'green', iconSvg: IC.medical  }
  ];

  sortieForm = this.fb.group({
    typeSortie:        ['', Validators.required],
    dateSortie:        ['', Validators.required],
    heureSortie:       ['', Validators.required],
    heureRetourPrevue: ['', Validators.required],
    motif: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    const obs: any = { sorties: this.autorisationService.getMesSorties() };
    if (this.isManagerOrAbove()) {
      obs.attente = this.isRHOrAdmin()
        ? this.autorisationService.getEnAttenteRH()
        : this.autorisationService.getEnAttenteManager();
    }
    if (this.isRHOrAdmin()) obs.toutes = this.autorisationService.getToutesSorties();

    forkJoin(obs).subscribe({
      next: (data: any) => {
        this.mesSorties.set(data.sorties ?? []);
        if (data.attente) this.enAttente.set(data.attente);
        if (data.toutes)  this.toutesSorties.set(data.toutes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.formError.set(''); this.formSuccess.set(''); }

  calculerDuree(): void {
    const h = this.sortieForm.get('heureSortie')?.value;
    const r = this.sortieForm.get('heureRetourPrevue')?.value;
    if (!h || !r) { this.dureePreview.set(null); return; }
    const [hh, hm] = h.split(':').map(Number);
    const [rh, rm] = r.split(':').map(Number);
    const minutes = (rh * 60 + rm) - (hh * 60 + hm);
    this.dureePreview.set(minutes > 0 ? minutes : null);
  }

  formatDuree(minutes: number): string {
    const h = Math.floor(minutes / 60); const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2,'0') : '00'}` : `${m} min`;
  }

  onSubmit(): void {
    if (this.sortieForm.invalid) { this.sortieForm.markAllAsTouched(); return; }
    this.submitLoading.set(true); this.formError.set('');
    this.autorisationService.creerDemande(this.sortieForm.value as any).subscribe({
      next: (data) => {
        this.submitLoading.set(false);
        this.formSuccess.set('Demande soumise avec succès !');
        this.mesSorties.update(s => [data, ...s]);
        this.sortieForm.reset(); this.dureePreview.set(null);
        setTimeout(() => { this.formSuccess.set(''); this.setTab('mes-sorties'); }, 1500);
      },
      error: (err) => { this.submitLoading.set(false); this.formError.set(err.error?.message ?? 'Erreur lors de la création.'); }
    });
  }

  annulerSortie(id: number): void {
    if (!confirm('Annuler cette autorisation ?')) return;
    this.actionLoading.set(true);
    this.autorisationService.annuler(id).subscribe({
      next: (data) => { this.actionLoading.set(false); this.mesSorties.update(s => s.map(x => x.id === id ? data : x)); this.showToast('Autorisation annulée', 'info'); },
      error: () => { this.actionLoading.set(false); this.showToast('Erreur lors de l\'annulation', 'error'); }
    });
  }

  ouvrirPointage(s: AutorisationSortie): void { this.sortieAPointer.set(s); this.heureRetourReelle = ''; }

  confirmerPointage(): void {
    const s = this.sortieAPointer(); if (!s || !this.heureRetourReelle) return;
    this.pointageLoading.set(true);
    this.autorisationService.pointerRetour(s.id, { heureRetourReelle: this.heureRetourReelle }).subscribe({
      next: (data) => { this.pointageLoading.set(false); this.sortieAPointer.set(null); this.mesSorties.update(list => list.map(x => x.id === s.id ? data : x)); this.showToast('Retour pointé avec succès !', 'success'); },
      error: () => { this.pointageLoading.set(false); this.showToast('Erreur lors du pointage', 'error'); }
    });
  }

  valider(id: number, approuve: boolean): void {
    this.validationLoading.set(true);
    const service = this.isRHOrAdmin()
      ? this.autorisationService.validerRH(id, { approuve, commentaire: this.validationCommentaire })
      : this.autorisationService.validerManager(id, { approuve, commentaire: this.validationCommentaire });
    service.subscribe({
      next: () => { this.validationLoading.set(false); this.validatingId.set(null); this.enAttente.update(d => d.filter(s => s.id !== id)); this.showToast(approuve ? 'Autorisation approuvée !' : 'Autorisation rejetée', approuve ? 'success' : 'error'); },
      error: (err) => { this.validationLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  ouvrirValidationRH(s: AutorisationSortie): void { this.selectedSortieRH.set(s); this.validationCommentaire = ''; }

  validerRH(approuve: boolean): void {
    const s = this.selectedSortieRH(); if (!s) return;
    this.validationLoading.set(true);
    this.autorisationService.validerRH(s.id, { approuve, commentaire: this.validationCommentaire }).subscribe({
      next: (data) => { this.validationLoading.set(false); this.selectedSortieRH.set(null); this.toutesSorties.update(list => list.map(x => x.id === s.id ? data : x)); this.showToast(approuve ? 'Validée !' : 'Rejetée', approuve ? 'success' : 'error'); },
      error: (err) => { this.validationLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  exportAttestation(s: AutorisationSortie): void { this.pdfService.exportAttestationSortie(s); }

  exportRapportPDF(): void {
    const now = new Date();
    this.autorisationService.getRapportMensuel(now.getFullYear(), now.getMonth() + 1).subscribe(data => {
      this.pdfService.exportRapportMensuel({ sorties: data, conges: [], reclamations: [], avances: [] }, now.getFullYear(), now.getMonth() + 1);
    });
  }

  // ── Computed ──
  compteurMois(): number {
    const now = new Date();
    return this.mesSorties().filter(s => {
      if (!s.dateSortie) return false;
      const d = new Date(s.dateSortie);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && !['ANNULEE','REJETEE'].includes(s.statut);
    }).length;
  }

  getSortiesToday(): AutorisationSortie[] {
    const today = new Date().toISOString().split('T')[0];
    return this.mesSorties().filter(s => s.dateSortie === today && ['VALIDEE','EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(s.statut));
  }

  getFilteredMesSorties(): AutorisationSortie[] {
    return this.mesSorties().filter(s => (!this.filterStatut() || s.statut === this.filterStatut()) && (!this.filterType() || s.typeSortie === this.filterType()));
  }

  getRHFiltered(): AutorisationSortie[] {
    return this.toutesSorties().filter(s => {
      const term = this.rhSearch().toLowerCase();
      const match = !term || s.employeNom?.toLowerCase().includes(term) || s.employePrenom?.toLowerCase().includes(term);
      return match && (!this.rhFilterStatut() || s.statut === this.rhFilterStatut()) && (!this.rhFilterType() || s.typeSortie === this.rhFilterType());
    });
  }

  getRHStats() {
    const all = this.toutesSorties();
    return [
      { value: all.length,                                                label: 'Total',             color: 'primary' },
      { value: all.filter(s => s.statut === 'EN_ATTENTE_RH').length,     label: 'En attente RH',     color: 'warning' },
      { value: all.filter(s => s.statut === 'VALIDEE').length,           label: 'Validées',          color: 'success' },
      { value: all.filter(s => s.statut === 'REJETEE').length,           label: 'Rejetées',          color: 'danger'  },
      { value: all.filter(s => s.heureRetourReelle != null).length,      label: 'Pointage effectué', color: 'info'    }
    ];
  }

  // ── Helpers ──
  isManagerOrAbove(): boolean { return ['MANAGER','RH','ADMIN'].includes(this.role); }
  isRHOrAdmin(): boolean      { return ['RH','ADMIN'].includes(this.role); }
  isInvalid(field: string): boolean { const c = this.sortieForm.get(field); return !!(c?.invalid && c?.touched); }
  isToday(dateStr: string): boolean { return dateStr === new Date().toISOString().split('T')[0]; }
  canAnnuler(s: AutorisationSortie): boolean { return ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(s.statut) || (s.statut === 'VALIDEE' && new Date(s.dateSortie) > new Date()); }
  getInitiales(s: AutorisationSortie): string { return ((s.employePrenom?.[0] ?? '') + (s.employeNom?.[0] ?? '')).toUpperCase(); }

  getSubtitle(): string {
    const map: Record<string,string> = { EMPLOYE: 'Gérez vos autorisations de sortie', MANAGER: 'Gérez les sorties de votre équipe', RH: 'Supervision de toutes les autorisations', ADMIN: 'Administration des autorisations de sortie' };
    return map[this.role] ?? '';
  }

  getTypeIconSvg(type: string): string {
    const map: Record<string,string> = { PERSONNEL: IC.user, PROFESSIONNEL: IC.briefcase, MEDICAL: IC.medical };
    return map[type] ?? IC.door;
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string,string> = { PERSONNEL: 'personnel', PROFESSIONNEL: 'professionnel', MEDICAL: 'medical' };
    return map[type] ?? '';
  }

  getBadgeClass(statut: string): string {
    const map: Record<string,string> = { VALIDEE: 'badge badge-success', REJETEE: 'badge badge-danger', ANNULEE: 'badge badge-gray', EN_ATTENTE_MANAGER: 'badge badge-warning', EN_ATTENTE_RH: 'badge badge-warning' };
    return map[statut] ?? 'badge badge-gray';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string,string> = { VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée', EN_ATTENTE_MANAGER: 'Attente Manager', EN_ATTENTE_RH: 'Attente RH' };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string,string> = { VALIDEE: 'statut-validee', REJETEE: 'statut-rejetee', ANNULEE: 'statut-annulee', EN_ATTENTE_MANAGER: 'statut-attente', EN_ATTENTE_RH: 'statut-attente' };
    return map[statut] ?? '';
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}