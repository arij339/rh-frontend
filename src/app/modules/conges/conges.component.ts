import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CongeService } from '../../core/services/conge.service';
import { AuthService }  from '../../core/services/auth.service';
import {
  DemandeConge, SoldeConge, StatutConge
} from '../../core/models/conge.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
type Tab = 'mes-demandes' | 'nouvelle' | 'en-attente'
         | 'toutes' | 'calendrier';

// ─── SVG constants ────────────────────────────────────────────────────
const SVG = {
  beach:    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 12c0 4.4-3.6 8-8 8"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M7 2.2A10 10 0 0 0 2 12"/></svg>`,
  medical:  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M18 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"/></svg>`,
  star:     `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  list:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  clock:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  folder:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  calSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  send:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  save:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  ban:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:        `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  note:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  chart:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  info:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  alert:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  user:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  chevLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevRight:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  close:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  msg:      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  success:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  refresh:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  starFill: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  home:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  filter:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
};

@Component({
  selector: 'app-conges',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
  <div class="conges fade-in">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="icon-inline" [innerHTML]="icons.beach | safeHtml"></span>
          Gestion des Congés
        </h1>
        <p>{{ getSubtitle() }}</p>
      </div>
    </div>

    <!-- Soldes Cards -->
    <div class="soldes-row" *ngIf="soldes().length > 0">
      <div class="solde-card" *ngFor="let s of soldes()">
        <div class="solde-top">
          <span class="solde-icon" [innerHTML]="getTypeIconSvg(s.typeConge) | safeHtml"></span>
          <span class="solde-type">{{ getTypeLabel(s.typeConge) }}</span>
        </div>
        <div class="solde-numbers">
          <span class="solde-restant">{{ getRestants(s) }}</span>
          <span class="solde-unit">jours restants</span>
        </div>
        <div class="solde-progress">
          <div class="sp-bar">
            <div class="sp-fill"
                 [style.width]="getSoldePercent(s) + '%'"
                 [class]="getSoldeColor(s)">
            </div>
          </div>
          <div class="sp-labels">
            <span>{{ s.joursConsommes }}j utilisés</span>
            <span>{{ s.joursAcquis }}j total</span>
          </div>
        </div>
        <div class="solde-reporte" *ngIf="s.joursReportes > 0">
          +{{ s.joursReportes }}j reportés
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab"
                [class.active]="activeTab() === 'mes-demandes'"
                (click)="setTab('mes-demandes')">
          <span [innerHTML]="icons.list | safeHtml"></span>
          Mes demandes
          <span class="tab-count">{{ mesDemandes().length }}</span>
        </button>
        <button class="tab"
                [class.active]="activeTab() === 'nouvelle'"
                (click)="setTab('nouvelle')">
          <span [innerHTML]="icons.plus | safeHtml"></span>
          Nouvelle demande
        </button>
        <button class="tab"
                *ngIf="isManagerOrAbove()"
                [class.active]="activeTab() === 'en-attente'"
                (click)="setTab('en-attente')">
          <span [innerHTML]="icons.clock | safeHtml"></span>
          En attente
          <span class="tab-count warning" *ngIf="enAttente().length > 0">
            {{ enAttente().length }}
          </span>
        </button>
        <button class="tab"
                *ngIf="isRHOrAdmin()"
                [class.active]="activeTab() === 'toutes'"
                (click)="setTab('toutes')">
          <span [innerHTML]="icons.folder | safeHtml"></span>
          Toutes les demandes
        </button>
        <button class="tab"
                *ngIf="isManagerOrAbove()"
                [class.active]="activeTab() === 'calendrier'"
                (click)="setTab('calendrier')">
          <span [innerHTML]="icons.calSmall | safeHtml"></span>
          Calendrier équipe
        </button>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : MES DEMANDES        -->
    <!-- ========================= -->
    <div *ngIf="activeTab() === 'mes-demandes'" class="tab-content fade-in">

      <div class="filters-bar">
        <select class="filter-select"
                (change)="filterStatut.set($any($event.target).value)">
          <option value="">Tous les statuts</option>
          <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
        </select>
        <select class="filter-select"
                (change)="filterType.set($any($event.target).value)">
          <option value="">Tous les types</option>
          <option value="ANNUEL">Congé Annuel</option>
          <option value="MALADIE">Congé Maladie</option>
          <option value="EXCEPTIONNEL">Congé Exceptionnel</option>
        </select>
      </div>

      <div class="demandes-list" *ngIf="getFilteredMesDemandes().length > 0">
        <div class="demande-card"
             *ngFor="let c of getFilteredMesDemandes()"
             [class]="'demande-card ' + getStatutClass(c.statut)">

          <div class="dc-header">
            <div class="dc-title">
              <span class="dc-icon" [innerHTML]="getTypeIconSvg(c.typeConge)"></span>
              <div>
                <strong>{{ getTypeLabel(c.typeConge) }}</strong>
                <span class="dc-sub">Créée le {{ c.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <span class="badge" [class]="getBadgeClass(c.statut)">
              {{ getStatutLabel(c.statut) }}
            </span>
          </div>

          <div class="dc-body">
            <div class="dc-info-row">
              <div class="dc-info">
                <span class="dc-info-label">
                  <span [innerHTML]="icons.calSmall | safeHtml"></span> Période
                </span>
                <span class="dc-info-value">
                  {{ c.dateDebut | date:'dd MMM yyyy' }} → {{ c.dateFin | date:'dd MMM yyyy' }}
                </span>
              </div>
              <div class="dc-info">
                <span class="dc-info-label">
                  <span [innerHTML]="icons.clock | safeHtml"></span> Durée
                </span>
                <span class="dc-info-value">
                  <strong>{{ c.joursOuvrables }}</strong> jour(s) ouvrable(s)
                </span>
              </div>
              <div class="dc-info" *ngIf="c.motif">
                <span class="dc-info-label">
                  <span [innerHTML]="icons.msg | safeHtml"></span> Motif
                </span>
                <span class="dc-info-value">{{ c.motif }}</span>
              </div>
            </div>

            <!-- Timeline workflow -->
            <div class="workflow-timeline">
              <div class="wf-step"
                   [class.done]="isStepDone(c, 'soumis')"
                   [class.active]="isStepActive(c, 'soumis')">
                <div class="wf-dot"></div><span>Soumis</span>
              </div>
              <div class="wf-line"></div>
              <div class="wf-step"
                   [class.done]="isStepDone(c, 'manager')"
                   [class.active]="isStepActive(c, 'manager')"
                   [class.rejected]="isStepRejected(c, 'manager')">
                <div class="wf-dot"></div><span>Manager</span>
              </div>
              <div class="wf-line"></div>
              <div class="wf-step"
                   [class.done]="isStepDone(c, 'rh')"
                   [class.active]="isStepActive(c, 'rh')"
                   [class.rejected]="isStepRejected(c, 'rh')">
                <div class="wf-dot"></div><span>RH</span>
              </div>
              <div class="wf-line"></div>
              <div class="wf-step"
                   [class.done]="isStepDone(c, 'final')"
                   [class.rejected]="c.statut === 'REJETEE'">
                <div class="wf-dot"></div><span>Final</span>
              </div>
            </div>

            <!-- Commentaires -->
            <div class="dc-comments" *ngIf="c.commentaireManager || c.commentaireRH">
              <div class="dc-comment" *ngIf="c.commentaireManager">
                <span class="dc-comment-author">
                  <span [innerHTML]="icons.user | safeHtml"></span> Manager :
                </span>
                {{ c.commentaireManager }}
              </div>
              <div class="dc-comment" *ngIf="c.commentaireRH">
                <span class="dc-comment-author">
                  <span [innerHTML]="icons.building | safeHtml"></span> RH :
                </span>
                {{ c.commentaireRH }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="dc-actions">
            <button class="btn btn-secondary"
                    *ngIf="c.statut === 'BROUILLON'"
                    (click)="soumettreConge(c.id)"
                    [disabled]="actionLoading()">
              <span [innerHTML]="icons.send | safeHtml"></span> Soumettre
            </button>
            <button class="btn btn-danger"
                    *ngIf="canAnnuler(c)"
                    (click)="annulerConge(c.id)"
                    [disabled]="actionLoading()">
              <span [innerHTML]="icons.ban | safeHtml"></span> Annuler
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="getFilteredMesDemandes().length === 0">
        <div class="empty-icon" [innerHTML]="icons.beach"></div>
        <h3>Aucune demande</h3>
        <p>Vous n'avez pas encore de demande de congé.</p>
        <button class="btn btn-primary" (click)="setTab('nouvelle')">
          <span [innerHTML]="icons.plus | safeHtml"></span> Créer une demande
        </button>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : NOUVELLE DEMANDE    -->
    <!-- ========================= -->
    <div *ngIf="activeTab() === 'nouvelle'" class="tab-content fade-in">
      <div class="form-card">

        <div class="form-header">
          <div class="form-header-icon" [innerHTML]="icons.beach | safeHtml"></div>
          <h3>Nouvelle demande de congé</h3>
          <p>Remplissez le formulaire ci-dessous</p>
        </div>

        <form [formGroup]="congeForm" (ngSubmit)="onSubmit(false)">

          <!-- Type -->
          <div class="form-group">
            <label>Type de congé *</label>
            <div class="type-selector">
              <div class="type-option"
                   *ngFor="let t of typeConges"
                   [class.selected]="congeForm.get('typeConge')?.value === t.value"
                   (click)="congeForm.get('typeConge')?.setValue(t.value)">
                <span class="type-opt-icon" [innerHTML]="t.iconSvg | safeHtml"></span>
                <div>
                  <strong>{{ t.label }}</strong>
                  <small>{{ getSoldeForType(t.value) }} j restants</small>
                </div>
              </div>
            </div>
            <span class="error-msg" *ngIf="isInvalid('typeConge')">
              Sélectionnez un type de congé
            </span>
          </div>

          <!-- Dates -->
          <div class="form-row">
            <div class="form-group">
              <label>Date de début *</label>
              <input type="date" formControlName="dateDebut" [min]="minDate"
                     [class.error]="isInvalid('dateDebut')"
                     (change)="calculerJours()" />
              <span class="error-msg" *ngIf="isInvalid('dateDebut')">Obligatoire</span>
            </div>
            <div class="form-group">
              <label>Date de fin *</label>
              <input type="date" formControlName="dateFin"
                     [min]="congeForm.get('dateDebut')?.value || minDate"
                     [class.error]="isInvalid('dateFin')"
                     (change)="calculerJours()" />
              <span class="error-msg" *ngIf="isInvalid('dateFin')">Obligatoire</span>
            </div>
          </div>

          <!-- Preview jours -->
          <div class="jours-preview" *ngIf="joursPreview() > 0">
            <div class="jp-icon" [innerHTML]="icons.chart | safeHtml"></div>
            <div class="jp-body">
              <strong>{{ joursPreview() }} jour(s) ouvrable(s)</strong>
              <span>hors week-ends et jours fériés</span>
            </div>
            <div class="jp-solde" [class.ok]="isSoldeOk()" [class.nok]="!isSoldeOk()">
              <span [innerHTML]="isSoldeOk() ? icons.check : icons.x | safeHtml"></span>
              {{ isSoldeOk() ? 'Solde suffisant' : 'Solde insuffisant' }}
            </div>
          </div>

          <!-- Motif -->
          <div class="form-group">
            <label>Motif (optionnel)</label>
            <textarea formControlName="motif"
                      placeholder="Précisez le motif de votre demande..."
                      rows="3">
            </textarea>
          </div>

          <!-- Erreur / Succès -->
          <div class="error-alert" *ngIf="formError()">
            <span [innerHTML]="icons.alert | safeHtml"></span> {{ formError() }}
          </div>
          <div class="success-alert" *ngIf="formSuccess()">
            <span [innerHTML]="icons.success | safeHtml"></span> {{ formSuccess() }}
          </div>

          <!-- Boutons -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline"
                    (click)="onSubmit(false)" [disabled]="submitLoading()">
              <span [innerHTML]="icons.save | safeHtml"></span> Sauvegarder brouillon
            </button>
            <button type="submit" class="btn btn-primary"
                    [disabled]="submitLoading() || !isSoldeOk()">
              <span *ngIf="!submitLoading()">
                <span [innerHTML]="icons.send | safeHtml"></span> Soumettre
              </span>
              <span *ngIf="submitLoading()" class="spinner"></span>
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : EN ATTENTE          -->
    <!-- ========================= -->
    <div *ngIf="activeTab() === 'en-attente'" class="tab-content fade-in">

      <div class="empty-state" *ngIf="enAttente().length === 0">
        <div class="empty-icon empty-icon-lg" [innerHTML]="icons.check | safeHtml"></div>
        <h3>Tout est traité !</h3>
        <p>Aucune demande en attente de validation.</p>
      </div>

      <div class="demandes-list" *ngIf="enAttente().length > 0">
        <div class="demande-card validation-card" *ngFor="let c of enAttente()">

          <div class="dc-header">
            <div class="dc-title">
              <div class="user-avatar-sm">{{ getInitiales(c) }}</div>
              <div>
                <strong>{{ c.employeNom }} {{ c.employePrenom }}</strong>
                <span class="dc-sub">{{ c.employeMatricule }} • {{ c.employeDepartement }}</span>
              </div>
            </div>
            <span class="badge badge-warning">
              <span [innerHTML]="icons.clock | safeHtml"></span> En attente
            </span>
          </div>

          <div class="dc-body">
            <div class="dc-info-row">
              <div class="dc-info">
                <span class="dc-info-label">Type</span>
                <span class="dc-info-value">
                  <span [innerHTML]="getTypeIconSvg(c.typeConge) | safeHtml"></span>
                  {{ getTypeLabel(c.typeConge) }}
                </span>
              </div>
              <div class="dc-info">
                <span class="dc-info-label">Période</span>
                <span class="dc-info-value">
                  {{ c.dateDebut | date:'dd/MM/yyyy' }} → {{ c.dateFin | date:'dd/MM/yyyy' }}
                </span>
              </div>
              <div class="dc-info">
                <span class="dc-info-label">Durée</span>
                <span class="dc-info-value"><strong>{{ c.joursOuvrables }}j</strong></span>
              </div>
              <div class="dc-info" *ngIf="c.motif">
                <span class="dc-info-label">Motif</span>
                <span class="dc-info-value">{{ c.motif }}</span>
              </div>
            </div>

            <div class="validation-form" *ngIf="validatingId() === c.id">
              <textarea [(ngModel)]="validationCommentaire"
                        placeholder="Commentaire (optionnel)..."
                        rows="2">
              </textarea>
              <div class="vf-actions">
                <button class="btn btn-danger"
                        (click)="valider(c.id, false)"
                        [disabled]="validationLoading()">
                  <span [innerHTML]="icons.x | safeHtml"></span> Rejeter
                </button>
                <button class="btn btn-primary"
                        (click)="valider(c.id, true)"
                        [disabled]="validationLoading()">
                  <span *ngIf="!validationLoading()">
                    <span [innerHTML]="icons.check | safeHtml"></span> Approuver
                  </span>
                  <span *ngIf="validationLoading()" class="spinner"></span>
                </button>
                <button class="btn btn-outline" (click)="validatingId.set(null)">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <div class="dc-actions" *ngIf="validatingId() !== c.id">
            <button class="btn btn-primary"
                    (click)="validatingId.set(c.id); validationCommentaire=''">
              <span [innerHTML]="icons.note | safeHtml"></span> Traiter cette demande
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : TOUTES (RH)         -->
    <!-- ========================= -->
    <div *ngIf="activeTab() === 'toutes'" class="tab-content fade-in">

      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher..."
                 (input)="rhSearch.set($any($event.target).value)"
                 class="search-input" />
        </div>
        <select class="filter-select"
                (change)="rhFilterStatut.set($any($event.target).value)">
          <option value="">Tous les statuts</option>
          <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
        </select>
        <select class="filter-select"
                (change)="rhFilterType.set($any($event.target).value)">
          <option value="">Tous les types</option>
          <option value="ANNUEL">Annuel</option>
          <option value="MALADIE">Maladie</option>
          <option value="EXCEPTIONNEL">Exceptionnel</option>
        </select>
      </div>

      <div class="rh-stats">
        <div class="rh-stat" *ngFor="let s of getRHStats()">
          <span class="rh-stat-value" [class]="s.color">{{ s.value }}</span>
          <span class="rh-stat-label">{{ s.label }}</span>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Période</th>
                <th>Jours</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of getRHFiltered()">
                <td>
                  <div class="user-cell">
                    <div class="mini-avatar">{{ getInitiales(c) }}</div>
                    <div>
                      <strong>{{ c.employeNom }} {{ c.employePrenom }}</strong>
                      <small class="d-block text-light">{{ c.employeDepartement }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-chip">
                    <span [innerHTML]="getTypeIconSvg(c.typeConge) | safeHtml"></span>
                    {{ c.typeConge }}
                  </span>
                </td>
                <td>{{ c.dateDebut | date:'dd/MM/yy' }} → {{ c.dateFin | date:'dd/MM/yy' }}</td>
                <td><strong>{{ c.joursOuvrables }}j</strong></td>
                <td>
                  <span class="badge" [class]="getBadgeClass(c.statut)">
                    {{ getStatutLabel(c.statut) }}
                  </span>
                </td>
                <td>
                  <button class="btn-action"
                          *ngIf="c.statut === 'EN_ATTENTE_RH'"
                          (click)="ouvrirValidationRH(c)">
                    <span [innerHTML]="icons.note | safeHtml"></span> Traiter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal validation RH -->
      <div class="modal-overlay" *ngIf="selectedCongeRH()"
           (click)="selectedCongeRH.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <span [innerHTML]="icons.note | safeHtml"></span>
              Valider la demande
            </h3>
            <button class="modal-close" (click)="selectedCongeRH.set(null)"
                    [innerHTML]="icons.close | safeHtml">
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-info">
              <p><strong>Employé :</strong> {{ selectedCongeRH()?.employeNom }} {{ selectedCongeRH()?.employePrenom }}</p>
              <p><strong>Type :</strong> {{ selectedCongeRH()?.typeConge }}</p>
              <p><strong>Période :</strong> {{ selectedCongeRH()?.dateDebut | date:'dd/MM/yyyy' }} → {{ selectedCongeRH()?.dateFin | date:'dd/MM/yyyy' }}</p>
              <p><strong>Durée :</strong> {{ selectedCongeRH()?.joursOuvrables }} jour(s)</p>
              <p *ngIf="selectedCongeRH()?.commentaireManager">
                <strong>Avis Manager :</strong> {{ selectedCongeRH()?.commentaireManager }}
              </p>
            </div>
            <div class="form-group" style="margin-top:16px">
              <label>Commentaire RH</label>
              <textarea [(ngModel)]="validationCommentaire"
                        placeholder="Commentaire..." rows="3">
              </textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger" (click)="validerRH(false)"
                    [disabled]="validationLoading()">
              <span [innerHTML]="icons.x | safeHtml"></span> Rejeter
            </button>
            <button class="btn btn-primary" (click)="validerRH(true)"
                    [disabled]="validationLoading()">
              <span *ngIf="!validationLoading()">
                <span [innerHTML]="icons.check | safeHtml"></span> Valider
              </span>
              <span *ngIf="validationLoading()" class="spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : CALENDRIER          -->
    <!-- ========================= -->
    <div *ngIf="activeTab() === 'calendrier'" class="tab-content fade-in">

      <!-- ── IMPROVED: header with "Aujourd'hui" button ── -->
      <div class="calendrier-header">
        <button class="btn btn-outline" (click)="prevMonth()">
          <span [innerHTML]="icons.chevLeft | safeHtml"></span> Précédent
        </button>

        <div class="cal-header-center">
          <h3>{{ currentMonthLabel() }}</h3>
          <button class="btn-today"
                  *ngIf="!isCurrentMonth()"
                  (click)="goToToday()">
            <span [innerHTML]="icons.home | safeHtml"></span> Aujourd'hui
          </button>
        </div>

        <button class="btn btn-outline" (click)="nextMonth()">
          Suivant <span [innerHTML]="icons.chevRight | safeHtml"></span>
        </button>
      </div>

      <!-- ── IMPROVED: filters bar (type + département) ── -->
      <div class="cal-filters">
        <div class="cal-filter-label">
          <span [innerHTML]="icons.filter | safeHtml"></span> Filtrer :
        </div>
        <div class="cal-filter-chips">
          <button class="cal-chip"
                  [class.active]="calFilterType() === ''"
                  (click)="calFilterType.set('')">
            Tous les types
          </button>
          <button class="cal-chip cal-chip-annuel"
                  [class.active]="calFilterType() === 'ANNUEL'"
                  (click)="calFilterType.set('ANNUEL')">
            Congé Annuel
          </button>
          <button class="cal-chip cal-chip-maladie"
                  [class.active]="calFilterType() === 'MALADIE'"
                  (click)="calFilterType.set('MALADIE')">
            Maladie
          </button>
          <button class="cal-chip cal-chip-exception"
                  [class.active]="calFilterType() === 'EXCEPTIONNEL'"
                  (click)="calFilterType.set('EXCEPTIONNEL')">
            Exceptionnel
          </button>
        </div>

        <select class="filter-select filter-select-sm"
                *ngIf="getDepartements().length > 0"
                (change)="calFilterDept.set($any($event.target).value)">
          <option value="">Tous les départements</option>
          <option *ngFor="let d of getDepartements()" [value]="d">{{ d }}</option>
        </select>
      </div>

      <div class="card">
        <div class="calendrier-grid">
          <div class="cal-day-header" *ngFor="let j of joursSemaine">{{ j }}</div>
          <div class="cal-day empty" *ngFor="let e of getEmptyDays()"></div>

          <!-- ── IMPROVED: each day uses enhanced helpers ── -->
          <div class="cal-day"
               *ngFor="let day of getDaysInMonth()"
               [class.today]="isToday(day)"
               [class.weekend]="isWeekend(day)"
               [class.has-conge]="hasConge(day)">
            <span class="cal-day-num">{{ day }}</span>
            <div class="cal-events">
              <!-- Show first 3 badges -->
              <div class="cal-event"
                   *ngFor="let c of getCongesForDayVisible(day)"
                   [class]="'cal-event cal-event-' + c.typeConge.toLowerCase()"
                   [title]="getTooltipText(c)">
                <div class="cal-event-avatar">{{ getInitiales(c) }}</div>
                <span>{{ c.employeNom }}</span>

                <!-- ── IMPROVED: inline tooltip ── -->
                <div class="cal-tooltip">
                  <div class="cal-tooltip-name">{{ c.employeNom }} {{ c.employePrenom }}</div>
                  <div class="cal-tooltip-type">{{ getTypeLabel(c.typeConge) }}</div>
                  <div class="cal-tooltip-dates">
                    {{ c.dateDebut | date:'dd/MM/yyyy' }} → {{ c.dateFin | date:'dd/MM/yyyy' }}
                    ({{ c.joursOuvrables }}j)
                  </div>
                  <div class="cal-tooltip-motif" *ngIf="c.motif">{{ c.motif }}</div>
                  <div class="cal-tooltip-dept" *ngIf="c.employeDepartement">{{ c.employeDepartement }}</div>
                </div>
              </div>

              <!-- ── IMPROVED: overflow +N badge ── -->
              <div class="cal-overflow"
                   *ngIf="getCongesOverflowCount(day) > 0"
                   (click)="openOverflowModal(day)">
                +{{ getCongesOverflowCount(day) }} autre(s)
              </div>
            </div>
          </div>
        </div>

        <!-- ── IMPROVED: legend with color-coded types ── -->
        <div class="cal-legend">
          <div class="cal-legend-item">
            <div class="cal-legend-dot today-dot"></div><span>Aujourd'hui</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-dot annuel-dot"></div><span>Congé Annuel</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-dot maladie-dot"></div><span>Congé Maladie</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-dot exception-dot"></div><span>Exceptionnel</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-dot weekend-dot"></div><span>Week-end</span>
          </div>
        </div>
      </div>

      <!-- ── IMPROVED: overflow modal ── -->
      <div class="modal-overlay" *ngIf="overflowDay() !== null"
           (click)="overflowDay.set(null)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <span [innerHTML]="icons.calSmall | safeHtml"></span>
              Absences du {{ overflowDay() }} {{ currentMonthLabel() }}
            </h3>
            <button class="modal-close" (click)="overflowDay.set(null)"
                    [innerHTML]="icons.close | safeHtml">
            </button>
          </div>
          <div class="modal-body">
            <div class="overflow-list">
              <div class="overflow-item"
                   *ngFor="let c of getCongesForDayAll(overflowDay()!)"
                   [class]="'overflow-item overflow-item-' + c.typeConge.toLowerCase()">
                <div class="overflow-avatar">{{ getInitiales(c) }}</div>
                <div class="overflow-info">
                  <strong>{{ c.employeNom }} {{ c.employePrenom }}</strong>
                  <span>{{ getTypeLabel(c.typeConge) }}</span>
                  <span>{{ c.dateDebut | date:'dd/MM/yyyy' }} → {{ c.dateFin | date:'dd/MM/yyyy' }}</span>
                  <span *ngIf="c.motif" class="overflow-motif">{{ c.motif }}</span>
                </div>
                <span class="cal-type-pill" [class]="'cal-type-pill-' + c.typeConge.toLowerCase()">
                  {{ c.typeConge }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <div class="toast" [class.show]="toast().show"
         [class]="'toast ' + toast().type">
      <span [innerHTML]="getToastIcon(toast().type) | safeHtml"></span>
      {{ toast().message }}
    </div>

  </div>
  `,
  styles: [`
    .conges { max-width: 100%; padding-bottom: 100px; }

    h1 {
      display: flex; align-items: center; gap: 10px;
      .icon-inline { color: var(--primary); display: inline-flex; }
    }

    // ===== SOLDES =====
    .soldes-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 16px; margin-bottom: 28px;
    }

    .solde-card {
      background: white; border-radius: 16px; padding: 20px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.08);
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }

      .solde-top {
        display: flex; align-items: center; gap: 10px; margin-bottom: 12px;

        .solde-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--accent); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          svg { display: block; }
        }

        .solde-type { font-size: 13px; font-weight: 700; color: var(--primary); }
      }

      .solde-numbers {
        margin-bottom: 12px;
        .solde-restant {
          font-size: 36px; font-weight: 800;
          color: var(--primary-dark); display: block; line-height: 1;
        }
        .solde-unit { font-size: 12px; color: var(--text-light); }
      }

      .sp-bar {
        height: 8px; background: var(--gray-mid);
        border-radius: 4px; overflow: hidden; margin-bottom: 6px;
        .sp-fill {
          height: 100%; border-radius: 4px; transition: width 0.6s ease;
          &.good   { background: var(--success); }
          &.medium { background: var(--warning); }
          &.low    { background: var(--danger); }
        }
      }

      .sp-labels {
        display: flex; justify-content: space-between;
        font-size: 11px; color: var(--text-light);
      }

      .solde-reporte {
        margin-top: 8px; font-size: 12px; font-weight: 600;
        color: var(--secondary); background: var(--accent);
        padding: 3px 10px; border-radius: 12px; display: inline-block;
      }
    }

    // ===== TABS =====
    .tabs-wrapper { margin-bottom: 24px; }

    .tabs {
      display: flex; gap: 4px; background: white; padding: 6px;
      border-radius: 14px; box-shadow: 0 2px 8px rgba(11,110,126,0.08);
      flex-wrap: wrap;
    }

    .tab {
      padding: 10px 18px; border: none; background: none;
      border-radius: 10px; cursor: pointer; font-size: 13px;
      font-weight: 600; color: var(--text-light); transition: all 0.2s;
      display: flex; align-items: center; gap: 8px;

      svg { display: block; flex-shrink: 0; }

      &:hover { background: var(--accent); color: var(--primary); }
      &.active {
        background: var(--primary); color: white;
        box-shadow: 0 4px 12px rgba(11,110,126,0.3);
      }

      .tab-count {
        background: var(--accent); color: var(--primary);
        padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;
        &.warning { background: #FEFCBF; color: #744210; }
      }
      &.active .tab-count { background: rgba(255,255,255,0.25); color: white; }
    }

    // ===== DEMANDES LIST =====
    .demandes-list { display: flex; flex-direction: column; gap: 16px; }

    .demande-card {
      background: white; border-radius: 16px; padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.06);
      border-left: 4px solid var(--gray-mid); transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 6px 20px rgba(11,110,126,0.1); }
      &.statut-validee   { border-left-color: var(--success); }
      &.statut-rejetee   { border-left-color: var(--danger); }
      &.statut-annulee   { border-left-color: var(--text-light); }
      &.statut-attente   { border-left-color: var(--warning); }
      &.statut-brouillon { border-left-color: var(--secondary); }
    }

    .dc-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;

      .dc-title {
        display: flex; align-items: center; gap: 12px;

        .dc-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--accent); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          svg { display: block; }
        }

        strong { font-size: 15px; color: var(--primary-dark); display: block; }
        .dc-sub { font-size: 12px; color: var(--text-light); }
      }
    }

    .dc-body { margin-bottom: 12px; }

    .dc-info-row {
      display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px;
    }

    .dc-info {
      display: flex; flex-direction: column; gap: 3px;

      .dc-info-label {
        font-size: 11px; color: var(--text-light); font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.5px;
        display: flex; align-items: center; gap: 4px;
        svg { flex-shrink: 0; }
      }
      .dc-info-value { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 5px; }
    }

    // ===== WORKFLOW TIMELINE =====
    .workflow-timeline {
      display: flex; align-items: center; gap: 0; margin: 16px 0;
    }

    .wf-step {
      display: flex; flex-direction: column; align-items: center; gap: 4px;

      .wf-dot {
        width: 20px; height: 20px; border-radius: 50%;
        background: var(--gray-mid); border: 2px solid var(--gray-mid); transition: all 0.3s;
      }

      span { font-size: 10px; font-weight: 600; color: var(--text-light); white-space: nowrap; }

      &.done .wf-dot     { background: var(--success); border-color: var(--success); }
      &.done span        { color: var(--success); }
      &.active .wf-dot   { background: var(--warning); border-color: var(--warning); animation: pulse 1.5s infinite; }
      &.active span      { color: var(--warning); }
      &.rejected .wf-dot { background: var(--danger); border-color: var(--danger); }
      &.rejected span    { color: var(--danger); }
    }

    .wf-line { flex: 1; height: 2px; background: var(--gray-mid); margin-bottom: 14px; }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.2); opacity: 0.7; }
    }

    // ===== COMMENTS =====
    .dc-comments {
      background: var(--gray-light); border-radius: 10px;
      padding: 12px 16px; display: flex; flex-direction: column; gap: 6px;

      .dc-comment {
        font-size: 13px; color: var(--text);
        display: flex; align-items: flex-start; gap: 6px;

        .dc-comment-author {
          font-weight: 700; color: var(--primary);
          white-space: nowrap; display: flex; align-items: center; gap: 4px;
          svg { flex-shrink: 0; }
        }
      }
    }

    .dc-actions {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-mid);
    }

    // ===== VALIDATION CARD =====
    .validation-card { cursor: default; }

    .user-avatar-sm {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .validation-form {
      margin-top: 12px; padding: 16px; background: var(--accent); border-radius: 12px;

      textarea {
        width: 100%; padding: 10px 14px;
        border: 2px solid var(--accent-mid); border-radius: 8px;
        font-size: 13px; outline: none; resize: none; background: white; margin-bottom: 12px;
        &:focus { border-color: var(--secondary); }
      }

      .vf-actions { display: flex; gap: 8px; justify-content: flex-end; }
    }

    // ===== FORM =====
    .form-card {
      background: white; border-radius: 20px; padding: 32px;
      max-width: 680px; margin: 0 auto;
      box-shadow: 0 4px 20px rgba(11,110,126,0.1);
    }

    .form-header {
      text-align: center; margin-bottom: 28px;

      .form-header-icon {
        width: 72px; height: 72px; border-radius: 20px;
        background: var(--accent); color: var(--primary);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 12px;
        svg { display: block; }
      }

      h3 { font-size: 20px; font-weight: 700; color: var(--primary-dark); margin-bottom: 6px; }
      p  { color: var(--text-light); font-size: 13px; }
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    // ===== TYPE SELECTOR =====
    .type-selector {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    }

    .type-option {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; border-radius: 12px;
      border: 2px solid var(--gray-mid); cursor: pointer; transition: all 0.2s;

      &:hover { border-color: var(--secondary); background: var(--accent); }
      &.selected {
        border-color: var(--primary); background: var(--accent);
        box-shadow: 0 0 0 3px rgba(11,110,126,0.1);
      }

      .type-opt-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: white; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; color: var(--primary);
        svg { display: block; }
      }

      strong { font-size: 13px; color: var(--text); display: block; }
      small  { font-size: 11px; color: var(--primary); font-weight: 600; }
    }

    // ===== JOURS PREVIEW =====
    .jours-preview {
      display: flex; align-items: center; gap: 12px;
      background: var(--accent); border-radius: 12px; padding: 14px 16px;
      margin-bottom: 20px; border: 1px solid var(--accent-mid);

      .jp-icon {
        width: 40px; height: 40px; border-radius: 10px;
        background: white; display: flex; align-items: center; justify-content: center;
        color: var(--primary); flex-shrink: 0;
        svg { display: block; }
      }

      .jp-body {
        flex: 1;
        strong { font-size: 15px; color: var(--primary-dark); display: block; }
        span   { font-size: 12px; color: var(--text-light); }
      }

      .jp-solde {
        font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 8px;
        display: flex; align-items: center; gap: 5px;
        svg { display: block; }
        &.ok  { background: #C6F6D5; color: #276749; }
        &.nok { background: #FED7D7; color: #822727; }
      }
    }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

    // ===== RH STATS =====
    .rh-stats { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }

    .rh-stat {
      display: flex; flex-direction: column; gap: 4px; background: white;
      padding: 12px 20px; border-radius: 10px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.06);

      .rh-stat-value {
        font-size: 22px; font-weight: 800;
        &.primary { color: var(--primary); }
        &.success { color: var(--success); }
        &.warning { color: var(--warning); }
        &.danger  { color: var(--danger); }
      }
      .rh-stat-label { font-size: 12px; color: var(--text-light); }
    }

    // ===== TABLE =====
    .user-cell { display: flex; align-items: center; gap: 8px; }

    .mini-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .d-block { display: block; }
    .text-light { color: var(--text-light); font-size: 11px; }

    .type-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--accent); color: var(--primary);
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      svg { display: block; width: 13px; height: 13px; }
    }

    .btn-action {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px; border: none;
      background: var(--accent); color: var(--primary);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      svg { display: block; }
      &:hover { background: var(--primary); color: white; }
    }

    // ===== SEARCH =====
    .search-wrapper {
      position: relative; flex: 1;
      .search-icon {
        position: absolute; left: 12px; top: 50%;
        transform: translateY(-50%); color: var(--text-light); pointer-events: none;
      }
      .search-input { padding-left: 38px !important; }
    }

    // ===== CALENDRIER =====

    /* ── NEW: header center with "Aujourd'hui" button ── */
    .calendrier-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
      .cal-header-center {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        h3 { font-size: 18px; font-weight: 700; color: var(--primary-dark); text-transform: capitalize; margin: 0; }
      }
    }

    /* "Aujourd'hui" pill button */
    .btn-today {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 14px; border-radius: 20px; border: none;
      background: var(--primary); color: white;
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      svg { display: block; }
      &:hover { background: var(--primary-dark); transform: scale(1.04); }
    }

    /* ── NEW: filter chips bar ── */
    .cal-filters {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px; flex-wrap: wrap;

      .cal-filter-label {
        font-size: 12px; font-weight: 700; color: var(--text-light);
        display: flex; align-items: center; gap: 5px;
        svg { display: block; }
      }

      .cal-filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    }

    .cal-chip {
      padding: 5px 14px; border-radius: 20px; border: 2px solid var(--gray-mid);
      background: white; color: var(--text-light);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--secondary); color: var(--primary); }
      &.active { color: white; border-color: transparent; }
    }

    .cal-chip.active              { background: var(--primary); }
    .cal-chip-annuel.active       { background: #2D7A4F; }
    .cal-chip-maladie.active      { background: #C0392B; }
    .cal-chip-exception.active    { background: #D97706; }

    .filter-select-sm {
      padding: 6px 10px; font-size: 12px;
    }

    /* ── Calendar grid (unchanged layout) ── */
    .calendrier-grid {
      display: grid; grid-template-columns: repeat(7, 1fr);
      gap: 1px; background: var(--gray-mid);
    }

    .cal-day-header {
      background: var(--primary); color: white;
      padding: 10px; text-align: center; font-size: 12px; font-weight: 700;
    }

    .cal-day {
      background: white; min-height: 90px; padding: 8px; position: relative;
      &.empty   { background: var(--gray-light); }
      &.today   { background: var(--accent); }
      &.weekend { background: #f8f8f8; }

      .cal-day-num { font-size: 13px; font-weight: 600; color: var(--text); }
      &.today .cal-day-num   { color: var(--primary); font-weight: 800; }
      &.weekend .cal-day-num { color: var(--text-light); }
    }

    .cal-events { margin-top: 4px; display: flex; flex-direction: column; gap: 2px; }

    /* ── NEW: color-coded event badges by type ── */
    .cal-event {
      display: flex; align-items: center; gap: 4px;
      border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 600;
      position: relative; cursor: default;

      .cal-event-avatar {
        width: 16px; height: 16px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 8px; font-weight: 700; flex-shrink: 0;
        background: rgba(255,255,255,0.3);
      }

      /* Annuel = green */
      &.cal-event-annuel {
        background: #2D7A4F; color: white;
        .cal-event-avatar { background: rgba(255,255,255,0.25); }
      }

      /* Maladie = red */
      &.cal-event-maladie {
        background: #C0392B; color: white;
        .cal-event-avatar { background: rgba(255,255,255,0.25); }
      }

      /* Exceptionnel = amber */
      &.cal-event-exceptionnel {
        background: #D97706; color: white;
        .cal-event-avatar { background: rgba(255,255,255,0.25); }
      }

      /* Fallback */
      &:not(.cal-event-annuel):not(.cal-event-maladie):not(.cal-event-exceptionnel) {
        background: var(--primary); color: white;
      }

      /* ── NEW: CSS tooltip on hover ── */
      &:hover .cal-tooltip { opacity: 1; visibility: visible; transform: translateY(0); }
    }

    /* ── NEW: tooltip bubble ── */
    .cal-tooltip {
      position: absolute; bottom: calc(100% + 6px); left: 0;
      background: #1a202c; color: white; border-radius: 10px;
      padding: 10px 12px; min-width: 200px; z-index: 100;
      opacity: 0; visibility: hidden; transform: translateY(4px);
      transition: all 0.15s ease; pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);

      /* arrow */
      &::after {
        content: ''; position: absolute; top: 100%; left: 12px;
        border: 5px solid transparent; border-top-color: #1a202c;
      }

      .cal-tooltip-name  { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
      .cal-tooltip-type  { font-size: 11px; opacity: 0.75; margin-bottom: 4px; }
      .cal-tooltip-dates { font-size: 11px; opacity: 0.9; }
      .cal-tooltip-motif { font-size: 11px; opacity: 0.75; margin-top: 4px; font-style: italic; }
      .cal-tooltip-dept  { font-size: 10px; opacity: 0.6; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    }

    /* ── NEW: overflow "+N autre(s)" button ── */
    .cal-overflow {
      font-size: 10px; font-weight: 700; color: var(--primary);
      background: var(--accent); border-radius: 4px;
      padding: 2px 6px; cursor: pointer; transition: all 0.15s;
      border: 1px solid var(--accent-mid); text-align: center;
      &:hover { background: var(--primary); color: white; }
    }

    /* ── NEW: overflow modal list ── */
    .overflow-list { display: flex; flex-direction: column; gap: 10px; }

    .overflow-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 10px; background: var(--gray-light);

      &.overflow-item-annuel     { border-left: 3px solid #2D7A4F; }
      &.overflow-item-maladie    { border-left: 3px solid #C0392B; }
      &.overflow-item-exceptionnel { border-left: 3px solid #D97706; }

      .overflow-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
      }

      .overflow-info {
        flex: 1; display: flex; flex-direction: column; gap: 2px;
        strong { font-size: 13px; color: var(--text); }
        span   { font-size: 11px; color: var(--text-light); }
        .overflow-motif { font-style: italic; }
      }
    }

    /* ── NEW: type pill in overflow modal ── */
    .cal-type-pill {
      font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 10px;
      white-space: nowrap;
      &.cal-type-pill-annuel      { background: #C6F6D5; color: #276749; }
      &.cal-type-pill-maladie     { background: #FED7D7; color: #822727; }
      &.cal-type-pill-exceptionnel { background: #FEFCBF; color: #744210; }
    }

    /* ── IMPROVED: legend with type colors ── */
    .cal-legend {
      display: flex; gap: 20px; padding: 16px; border-top: 1px solid var(--gray-mid); flex-wrap: wrap;

      .cal-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); }
      .cal-legend-dot {
        width: 12px; height: 12px; border-radius: 3px;
        &.today-dot     { background: var(--accent); border: 1px solid var(--secondary); }
        &.annuel-dot    { background: #2D7A4F; }
        &.maladie-dot   { background: #C0392B; }
        &.exception-dot { background: #D97706; }
        &.weekend-dot   { background: #f0f0f0; border: 1px solid var(--gray-mid); }
      }
    }

    // ===== MODAL =====
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }

    .modal {
      background: white; border-radius: 20px; width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);

      &.modal-sm { width: 420px; }

      .modal-header {
        padding: 20px 24px; border-bottom: 1px solid var(--gray-mid);
        display: flex; align-items: center; justify-content: space-between;

        h3 {
          font-size: 16px; font-weight: 700; color: var(--primary-dark);
          display: flex; align-items: center; gap: 8px;
          svg { color: var(--primary); }
        }

        .modal-close {
          width: 32px; height: 32px; border: none; background: var(--gray-light);
          border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
          &:hover { background: #FED7D7; color: var(--danger); }
          svg { display: block; }
        }
      }

      .modal-body { padding: 20px 24px; }
      .modal-info {
        background: var(--gray-light); border-radius: 10px; padding: 14px;
        p { font-size: 13px; color: var(--text); margin-bottom: 6px; &:last-child { margin-bottom: 0; } }
      }
      .modal-footer {
        padding: 16px 24px; border-top: 1px solid var(--gray-mid);
        display: flex; gap: 10px; justify-content: flex-end;
      }
    }

    // ===== EMPTY STATE =====
    .empty-state {
      text-align: center; padding: 60px 20px;
      background: white; border-radius: 16px;

      .empty-icon {
        width: 80px; height: 80px; border-radius: 20px;
        background: var(--accent); color: var(--primary);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        svg { display: block; }
      }

      .empty-icon-lg { width: 64px; height: 64px; }

      h3 { font-size: 18px; font-weight: 700; color: var(--primary-dark); margin-bottom: 8px; }
      p  { color: var(--text-light); margin-bottom: 20px; }
    }

    // ===== FILTERS =====
    .filters-bar {
      display: flex; gap: 12px; margin-bottom: 16px;
      align-items: center; flex-wrap: wrap;
    }

    .filter-select {
      padding: 10px 14px; border: 2px solid var(--gray-mid); border-radius: 10px;
      font-size: 13px; outline: none; background: white; cursor: pointer;
      font-weight: 500; transition: border-color 0.2s;
      &:focus { border-color: var(--secondary); }
    }

    .search-input {
      width: 100%; padding: 10px 16px; border: 2px solid var(--gray-mid);
      border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s;
      &:focus { border-color: var(--secondary); }
    }

    // ===== ALERTS =====
    .error-alert {
      background: #FFF5F5; border: 1px solid #FED7D7; color: var(--danger);
      padding: 12px; border-radius: 10px; margin-bottom: 16px; font-size: 13px;
      display: flex; align-items: center; gap: 8px;
      svg { flex-shrink: 0; }
    }

    .success-alert {
      background: #F0FFF4; border: 1px solid #C6F6D5; color: var(--success);
      padding: 12px; border-radius: 10px; margin-bottom: 16px; font-size: 13px;
      display: flex; align-items: center; gap: 8px;
      svg { flex-shrink: 0; }
    }

    // ===== BADGE / BUTTONS =====
    .badge {
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;
      svg { display: block; width: 12px; height: 12px; }
      &.badge-success { background: #C6F6D5; color: #276749; }
      &.badge-danger  { background: #FED7D7; color: #822727; }
      &.badge-warning { background: #FEFCBF; color: #744210; }
      &.badge-info    { background: var(--accent); color: var(--primary); }
      &.badge-gray    { background: var(--gray-mid); color: var(--text-light); }
    }

    .btn {
      padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px;
      transition: all 0.2s;

      svg { display: block; flex-shrink: 0; }

      &.btn-primary  { background: var(--primary); color: white; &:hover { background: var(--primary-dark); } }
      &.btn-danger   { background: #FED7D7; color: #822727; &:hover { background: #FC8181; color: white; } }
      &.btn-secondary { background: var(--accent); color: var(--primary); border: 1px solid var(--accent-mid); &:hover { background: var(--primary); color: white; } }
      &.btn-outline  { background: none; border: 2px solid var(--gray-mid); color: var(--text-light); &:hover { border-color: var(--primary); color: var(--primary); } }
      &:disabled     { opacity: 0.6; cursor: not-allowed; }
    }

    // ===== TOAST =====
    .toast {
      position: fixed; bottom: 24px; right: 24px; padding: 14px 20px;
      border-radius: 12px; font-size: 14px; font-weight: 600;
      transform: translateY(80px); opacity: 0; transition: all 0.3s ease;
      z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: flex; align-items: center; gap: 8px;
      svg { display: block; }
      &.show    { transform: translateY(0); opacity: 1; }
      &.success { background: #C6F6D5; color: #276749; }
      &.error   { background: #FED7D7; color: #822727; }
      &.info    { background: var(--accent); color: var(--primary); }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }

    .card {
      background: white; border-radius: 16px; padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.08); margin-bottom: 20px;
    }

    @keyframes spin   { to { transform: rotate(360deg); } }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in     { animation: fadeIn 0.25s ease; }
    .tab-content { animation: fadeIn 0.2s ease; }
  `]
})
export class CongesComponent implements OnInit {

  private congeService = inject(CongeService);
  private authService  = inject(AuthService);
  private fb           = inject(FormBuilder);

  readonly icons = SVG;

  role = this.authService.getRole();

  activeTab         = signal<Tab>('mes-demandes');
  loading           = signal(true);
  actionLoading     = signal(false);
  submitLoading     = signal(false);
  validationLoading = signal(false);

  mesDemandes       = signal<DemandeConge[]>([]);
  soldes            = signal<SoldeConge[]>([]);
  enAttente         = signal<DemandeConge[]>([]);
  toutesConges      = signal<DemandeConge[]>([]);
  calendrierConges  = signal<DemandeConge[]>([]);

  filterStatut       = signal('');
  filterType         = signal('');
  rhSearch           = signal('');
  rhFilterStatut     = signal('');
  rhFilterType       = signal('');

  // ── NEW: calendar filter signals ──
  calFilterType      = signal('');
  calFilterDept      = signal('');

  // ── NEW: overflow modal signal ──
  overflowDay        = signal<number | null>(null);

  validatingId          = signal<number | null>(null);
  validationCommentaire = '';
  selectedCongeRH       = signal<DemandeConge | null>(null);

  joursPreview = signal(0);
  formError    = signal('');
  formSuccess  = signal('');

  currentDate  = new Date();
  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  toast = signal<{show: boolean; message: string; type: string}>(
    { show: false, message: '', type: 'success' }
  );

  // Max badges shown per day cell before "+N"
  private readonly MAX_BADGES = 3;

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  statuts = [
    { value: 'BROUILLON',          label: 'Brouillon' },
    { value: 'EN_ATTENTE_MANAGER', label: 'Attente Manager' },
    { value: 'EN_ATTENTE_RH',      label: 'Attente RH' },
    { value: 'VALIDEE',            label: 'Validée' },
    { value: 'REJETEE',            label: 'Rejetée' },
    { value: 'ANNULEE',            label: 'Annulée' }
  ];

  typeConges = [
    {
      value: 'ANNUEL', label: 'Congé Annuel',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 12c0 4.4-3.6 8-8 8"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M7 2.2A10 10 0 0 0 2 12"/></svg>`
    },
    {
      value: 'MALADIE', label: 'Congé Maladie',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`
    },
    {
      value: 'EXCEPTIONNEL', label: 'Exceptionnel',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    {
      value: 'SANS_SOLDE', label: 'Congé Sans Solde',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M12 4v16"/></svg>`
    },
    {
      value: 'MATERNITE', label: 'Congé Maternité',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 13v7"/><path d="M9 20h6"/></svg>`
    },
    {
      value: 'PATERNITE', label: 'Congé Paternité',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M12 2v20"/><path d="M8 22h8"/></svg>`
    }
  ];

  congeForm = this.fb.group({
    typeConge: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin:   ['', Validators.required],
    motif:     ['']
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    const obs: any = {
      soldes: this.congeService.getSoldes(),
      conges: this.congeService.getMesConges()
    };
    if (this.isManagerOrAbove()) obs.attente = this.congeService.getEnAttenteManager();
    if (this.isRHOrAdmin()) {
      obs.toutes    = this.congeService.getToutesConges();
      obs.attenteRH = this.congeService.getEnAttenteRH();
    }

    forkJoin(obs).subscribe({
      next: (data: any) => {
        this.soldes.set(data.soldes ?? []);
        this.mesDemandes.set(data.conges ?? []);
        if (this.isRHOrAdmin()) {
          this.toutesConges.set(data.toutes ?? []);
          this.enAttente.set(data.attenteRH ?? []);
        } else if (this.isManagerOrAbove()) {
          this.enAttente.set(data.attente ?? []);
        }
        this.loading.set(false);
        this.loadCalendrier();
      },
      error: () => this.loading.set(false)
    });
  }

  private loadCalendrier(): void {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const debut = new Date(year, month, 1).toISOString().split('T')[0];
    const fin   = new Date(year, month + 1, 0).toISOString().split('T')[0];
    this.congeService.getCalendrierEquipe(debut, fin).subscribe({
      next: (data) => this.calendrierConges.set(data),
      error: () => {}
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.formError.set('');
    this.formSuccess.set('');
  }

  calculerJours(): void {
    const debut = this.congeForm.get('dateDebut')?.value;
    const fin   = this.congeForm.get('dateFin')?.value;
    if (!debut || !fin) { this.joursPreview.set(0); return; }
    let count = 0;
    const d = new Date(debut), f = new Date(fin);
    while (d <= f) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) count++;
      d.setDate(d.getDate() + 1);
    }
    this.joursPreview.set(count);
  }

  isSoldeOk(): boolean {
    const type = this.congeForm.get('typeConge')?.value as string;
    if (!type) return true;
    const solde = this.soldes().find(s => s.typeConge === type);
    if (!solde) return true;
    return this.getRestants(solde) >= this.joursPreview();
  }

  onSubmit(brouillon: boolean): void {
    if (this.congeForm.invalid) { this.congeForm.markAllAsTouched(); return; }
    this.submitLoading.set(true);
    this.formError.set('');
    const req = { ...this.congeForm.value, soumettre: !brouillon };
    this.congeService.creerDemande(req as any).subscribe({
      next: (data) => {
        this.submitLoading.set(false);
        this.formSuccess.set(brouillon ? 'Brouillon sauvegardé !' : 'Demande soumise avec succès !');
        this.mesDemandes.update(d => [data, ...d]);
        this.congeForm.reset();
        this.joursPreview.set(0);
        setTimeout(() => { this.formSuccess.set(''); this.setTab('mes-demandes'); }, 1500);
      },
      error: (err) => {
        this.submitLoading.set(false);
        this.formError.set(err.error?.message ?? 'Erreur lors de la création.');
      }
    });
  }

  soumettreConge(id: number): void {
    this.actionLoading.set(true);
    this.congeService.soumettre(id).subscribe({
      next: (data) => {
        this.actionLoading.set(false);
        this.mesDemandes.update(d => d.map(c => c.id === id ? data : c));
        this.showToast('Demande soumise !', 'success');
      },
      error: () => { this.actionLoading.set(false); this.showToast('Erreur lors de la soumission', 'error'); }
    });
  }

  annulerConge(id: number): void {
    if (!confirm('Annuler cette demande ?')) return;
    this.actionLoading.set(true);
    this.congeService.annuler(id).subscribe({
      next: (data) => {
        this.actionLoading.set(false);
        this.mesDemandes.update(d => d.map(c => c.id === id ? data : c));
        this.showToast('Demande annulée', 'info');
      },
      error: () => { this.actionLoading.set(false); this.showToast('Erreur lors de l\'annulation', 'error'); }
    });
  }

  valider(id: number, approuve: boolean): void {
    this.validationLoading.set(true);
    const service = this.isRHOrAdmin()
      ? this.congeService.validerRH(id, { approuve, commentaire: this.validationCommentaire })
      : this.congeService.validerManager(id, { approuve, commentaire: this.validationCommentaire });

    service.subscribe({
      next: () => {
        this.validationLoading.set(false);
        this.validatingId.set(null);
        this.enAttente.update(d => d.filter(c => c.id !== id));
        this.showToast(approuve ? 'Demande approuvée !' : 'Demande rejetée', approuve ? 'success' : 'error');
      },
      error: (err) => {
        this.validationLoading.set(false);
        this.showToast(err.error?.message ?? 'Erreur lors de la validation', 'error');
      }
    });
  }

  ouvrirValidationRH(c: DemandeConge): void {
    this.selectedCongeRH.set(c);
    this.validationCommentaire = '';
  }

  validerRH(approuve: boolean): void {
    const c = this.selectedCongeRH();
    if (!c) return;
    this.validationLoading.set(true);
    this.congeService.validerRH(c.id, { approuve, commentaire: this.validationCommentaire }).subscribe({
      next: (data) => {
        this.validationLoading.set(false);
        this.selectedCongeRH.set(null);
        this.toutesConges.update(d => d.map(x => x.id === c.id ? data : x));
        this.showToast(approuve ? 'Congé validé !' : 'Congé rejeté', approuve ? 'success' : 'error');
      },
      error: (err) => {
        this.validationLoading.set(false);
        this.showToast(err.error?.message ?? 'Erreur', 'error');
      }
    });
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadCalendrier();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadCalendrier();
  }

  // ── NEW: go back to today's month ──
  goToToday(): void {
    this.currentDate = new Date();
    this.loadCalendrier();
  }

  // ── NEW: detect if we are already on the current month ──
  isCurrentMonth(): boolean {
    const now = new Date();
    return this.currentDate.getFullYear() === now.getFullYear()
        && this.currentDate.getMonth()    === now.getMonth();
  }

  currentMonthLabel(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getEmptyDays(): number[] {
    const first = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    return Array(first === 0 ? 6 : first - 1).fill(0);
  }

  getDaysInMonth(): number[] {
    const days = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  isToday(day: number): boolean {
    const now = new Date();
    return now.getDate() === day
        && now.getMonth()    === this.currentDate.getMonth()
        && now.getFullYear() === this.currentDate.getFullYear();
  }

  isWeekend(day: number): boolean {
    const d = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  hasConge(day: number): boolean {
    return this.getCongesForDayAll(day).length > 0;
  }

  // ── Base filter shared by all day helpers ──
  private filterCalendrier(): DemandeConge[] {
    const type = this.calFilterType();
    const dept = this.calFilterDept();
    return this.calendrierConges().filter(c => {
      if (c.statut !== 'VALIDEE') return false;
      if (type && c.typeConge !== type) return false;
      if (dept && c.employeDepartement !== dept) return false;
      return true;
    });
  }

  // ── NEW: all congés for a day (filtered) ──
  getCongesForDayAll(day: number): DemandeConge[] {
    const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    return this.filterCalendrier().filter(c => {
      const debut = new Date(c.dateDebut);
      const fin   = new Date(c.dateFin);
      return debut <= date && date <= fin;
    });
  }

  // ── NEW: visible badges capped at MAX_BADGES ──
  getCongesForDayVisible(day: number): DemandeConge[] {
    return this.getCongesForDayAll(day).slice(0, this.MAX_BADGES);
  }

  // ── NEW: count of hidden badges ──
  getCongesOverflowCount(day: number): number {
    const total = this.getCongesForDayAll(day).length;
    return total > this.MAX_BADGES ? total - this.MAX_BADGES : 0;
  }

  // ── NEW: open overflow modal ──
  openOverflowModal(day: number): void {
    this.overflowDay.set(day);
  }

  // ── NEW: tooltip text (native fallback, also used by title attr) ──
  getTooltipText(c: DemandeConge): string {
    const d1 = new Date(c.dateDebut).toLocaleDateString('fr-FR');
    const d2 = new Date(c.dateFin).toLocaleDateString('fr-FR');
    let txt = `${c.employeNom} ${c.employePrenom} — ${this.getTypeLabel(c.typeConge)}\n${d1} → ${d2} (${c.joursOuvrables}j)`;
    if (c.motif) txt += `\n${c.motif}`;
    return txt;
  }

  // ── NEW: list unique departments from calendrier data ──
  getDepartements(): string[] {
    const depts = this.calendrierConges()
      .map(c => c.employeDepartement)
      .filter((d): d is string => !!d);
    return [...new Set(depts)].sort();
  }

  // ===== UNCHANGED HELPERS =====
  isManagerOrAbove(): boolean { return ['MANAGER','RH','ADMIN'].includes(this.role); }
  isRHOrAdmin(): boolean      { return ['RH','ADMIN'].includes(this.role); }

  isInvalid(field: string): boolean {
    const c = this.congeForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getRestants(s: SoldeConge): number {
    return s.joursAcquis + (s.joursReportes || 0) - s.joursConsommes;
  }

  getSoldePercent(s: SoldeConge): number {
    if (!s.joursAcquis) return 0;
    return Math.round((s.joursConsommes / s.joursAcquis) * 100);
  }

  getSoldeColor(s: SoldeConge): string {
    const p = this.getSoldePercent(s);
    if (p >= 80) return 'low';
    if (p >= 50) return 'medium';
    return 'good';
  }

  getSoldeForType(type: string): number {
    const s = this.soldes().find(x => x.typeConge === type);
    return s ? this.getRestants(s) : 0;
  }

  getTypeIconSvg(type: string): string {
    const map: Record<string, string> = {
      ANNUEL:       `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 12c0 4.4-3.6 8-8 8"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M7 2.2A10 10 0 0 0 2 12"/></svg>`,
      MALADIE:      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
      EXCEPTIONNEL: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      SANS_SOLDE:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M12 4v16"/></svg>`,
      MATERNITE:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 13v7"/><path d="M9 20h6"/></svg>`,
      PATERNITE:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M12 2v20"/><path d="M8 22h8"/></svg>`
    };
    return map[type] ?? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      ANNUEL: 'Congé Annuel',
      MALADIE: 'Congé Maladie',
      EXCEPTIONNEL: 'Congé Exceptionnel',
      SANS_SOLDE: 'Congé Sans Solde',
      MATERNITE: 'Congé Maternité',
      PATERNITE: 'Congé Paternité'
    };
    return map[type] ?? type;
  }

  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'badge badge-success', REJETEE: 'badge badge-danger',
      ANNULEE: 'badge badge-gray', EN_ATTENTE_MANAGER: 'badge badge-warning',
      EN_ATTENTE_RH: 'badge badge-warning', BROUILLON: 'badge badge-info'
    };
    return map[statut] ?? 'badge badge-gray';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée',
      EN_ATTENTE_MANAGER: 'Attente Manager', EN_ATTENTE_RH: 'Attente RH', BROUILLON: 'Brouillon'
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'statut-validee', REJETEE: 'statut-rejetee', ANNULEE: 'statut-annulee',
      EN_ATTENTE_MANAGER: 'statut-attente', EN_ATTENTE_RH: 'statut-attente', BROUILLON: 'statut-brouillon'
    };
    return map[statut] ?? '';
  }

  getInitiales(c: DemandeConge): string {
    return ((c.employePrenom?.[0] ?? '') + (c.employeNom?.[0] ?? '')).toUpperCase();
  }

  canAnnuler(c: DemandeConge): boolean {
    return ['BROUILLON','EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(c.statut);
  }

  getFilteredMesDemandes(): DemandeConge[] {
    return this.mesDemandes().filter(c => {
      const s = this.filterStatut(); const t = this.filterType();
      return (!s || c.statut === s) && (!t || c.typeConge === t);
    });
  }

  getRHFiltered(): DemandeConge[] {
    return this.toutesConges().filter(c => {
      const term = this.rhSearch().toLowerCase();
      const s = this.rhFilterStatut(); const t = this.rhFilterType();
      const match = !term || c.employeNom?.toLowerCase().includes(term) || c.employePrenom?.toLowerCase().includes(term);
      return match && (!s || c.statut === s) && (!t || c.typeConge === t);
    });
  }

  getSubtitle(): string {
    const map: Record<string, string> = {
      EMPLOYE: 'Consultez et gérez vos demandes de congé',
      MANAGER: 'Gérez vos demandes et validez celles de votre équipe',
      RH:      'Supervision complète des congés de l\'entreprise',
      ADMIN:   'Administration des congés'
    };
    return map[this.role] ?? '';
  }

  getRHStats() {
    const all = this.toutesConges();
    return [
      { value: all.length,                                           label: 'Total',         color: 'primary' },
      { value: all.filter(c => c.statut === 'EN_ATTENTE_RH').length, label: 'En attente RH', color: 'warning' },
      { value: all.filter(c => c.statut === 'VALIDEE').length,       label: 'Validées',      color: 'success' },
      { value: all.filter(c => c.statut === 'REJETEE').length,       label: 'Rejetées',      color: 'danger'  }
    ];
  }

  isStepDone(c: DemandeConge, step: string): boolean {
    const order = ['soumis','manager','rh','final'];
    const stepIndex = order.indexOf(step);
    const statutMap: Record<string, number> = {
      BROUILLON: 0, EN_ATTENTE_MANAGER: 1, EN_ATTENTE_RH: 2,
      VALIDEE: 4, REJETEE: 4, ANNULEE: 4
    };
    return (statutMap[c.statut] ?? 0) > stepIndex;
  }

  isStepActive(c: DemandeConge, step: string): boolean {
    const map: Record<string, string[]> = {
      soumis:  ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'],
      manager: ['EN_ATTENTE_MANAGER'],
      rh:      ['EN_ATTENTE_RH'],
      final:   []
    };
    return map[step]?.includes(c.statut) ?? false;
  }

  isStepRejected(c: DemandeConge, step: string): boolean {
    return c.statut === 'REJETEE' && step !== 'final';
  }

  getToastIcon(type: string): string {
    if (type === 'success') return SVG.success;
    if (type === 'error')   return SVG.error;
    return SVG.info;
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}