import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AvanceService }  from '../../core/services/avance.service';
import { AuthService }    from '../../core/services/auth.service';
import {
  AvanceSalaire, SimulationResponse
} from '../../core/models/avance.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'mes-avances' | 'simuler' | 'nouvelle' | 'en-attente' | 'toutes';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  banknote:    `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  list:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  calculator:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="12" y1="10" x2="14" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="18" x2="14" y2="18"/></svg>`,
  plus:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  clock:       `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  folder:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  check:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  x:           `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  xCircle:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  ban:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  send:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  note:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  close:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  msgCircle:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  user:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  building:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  calendar:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  barChart:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  creditCard:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  arrowRight:  `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  alertCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  percent:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  search:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  thumbUp:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
  thumbDown:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`,
  refresh:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  toastOk:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  toastInfo:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Rules icons
  rulePercent: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  ruleStack:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  ruleDelay:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  ruleBadge:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  expand:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  collapse:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`,
};

@Component({
  selector: 'app-avances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="avances fade-in">

  <!-- ── Header ── -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-header-icon">
        <span [innerHTML]="ic.banknote | safeHtml"></span>
      </div>
      <div>
        <h1>Avances sur Salaire</h1>
        <p>{{ getSubtitle() }}</p>
      </div>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'mes-avances'" (click)="setTab('mes-avances')">
        <span [innerHTML]="ic.list | safeHtml"></span>
        Mes avances
        <span class="tab-count">{{ mesAvances().length }}</span>
      </button>
      <button class="tab" [class.active]="activeTab() === 'simuler'" (click)="setTab('simuler')">
        <span [innerHTML]="ic.calculator | safeHtml"></span>
        Simuler
      </button>
      <button class="tab" [class.active]="activeTab() === 'nouvelle'" (click)="setTab('nouvelle')">
        <span [innerHTML]="ic.plus | safeHtml"></span>
        Nouvelle demande
      </button>
      <button class="tab" *ngIf="isRHOrAdmin()" [class.active]="activeTab() === 'en-attente'" (click)="setTab('en-attente')">
        <span [innerHTML]="ic.clock | safeHtml"></span>
        En attente
        <span class="tab-count warning" *ngIf="enAttente().length > 0">{{ enAttente().length }}</span>
      </button>
      <button class="tab" *ngIf="isRHOrAdmin()" [class.active]="activeTab() === 'toutes'" (click)="setTab('toutes')">
        <span [innerHTML]="ic.folder | safeHtml"></span>
        Toutes
      </button>
    </div>
  </div>

  <!-- ===================== MES AVANCES ===================== -->
  <div *ngIf="activeTab() === 'mes-avances'" class="tab-content fade-in">

    <div class="avances-list" *ngIf="mesAvances().length > 0">
      <div class="avance-card" *ngFor="let a of mesAvances()" [class]="getStatutClass(a.statut)">
        <div class="ac-accent"></div>

        <div class="ac-header">
          <div class="ac-montant">
            <span class="montant-val">{{ a.montantDemande | number:'1.3-3' }}</span>
            <span class="montant-unit">DT</span>
            <span class="montant-label">demandé</span>
          </div>
          <div class="ac-right">
            <span class="badge" [class]="getBadgeClass(a.statut)">{{ getStatutLabel(a.statut) }}</span>
            <span class="ac-date">{{ a.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <div class="montants-row" *ngIf="a.montantAccorde">
          <div class="montant-block">
            <span class="mb-label">Accordé</span>
            <span class="mb-value green">{{ a.montantAccorde | number:'1.3-3' }} DT</span>
          </div>
          <div class="montant-block">
            <span class="mb-label">Mensualité</span>
            <span class="mb-value teal">{{ a.mensualite | number:'1.3-3' }} DT</span>
          </div>
          <div class="montant-block">
            <span class="mb-label">Durée</span>
            <span class="mb-value">{{ a.nombreMensualites }} mois</span>
          </div>
          <div class="montant-block" *ngIf="a.montantRestant !== null">
            <span class="mb-label">Restant</span>
            <span class="mb-value" [class.amber]="(a.montantRestant || 0) > 0" [class.green]="(a.montantRestant || 0) === 0">
              {{ a.montantRestant | number:'1.3-3' }} DT
            </span>
          </div>
        </div>

        <!-- Barre remboursement -->
        <div class="remboursement-progress" *ngIf="a.statut === 'EN_COURS' || a.statut === 'SOLDEE'">
          <div class="rp-header">
            <span class="rp-label">
              <span [innerHTML]="ic.barChart | safeHtml"></span> Remboursement
            </span>
            <span>{{ a.montantRembourse | number:'1.3-3' }} / {{ a.montantAccorde | number:'1.3-3' }} DT</span>
          </div>
          <div class="rp-bar">
            <div class="rp-fill" [style.width]="getRemboursementPercent(a) + '%'" [class.complete]="a.statut === 'SOLDEE'"></div>
          </div>
          <div class="rp-footer">
            <span class="rp-percent">{{ getRemboursementPercent(a) }}%</span>
            <span *ngIf="a.prochaineEcheance">
              Prochaine échéance :
              <strong>{{ a.prochaineEcheance | date:'dd/MM/yyyy' }}</strong>
            </span>
          </div>
        </div>

        <div class="ac-motif">
          <span class="ac-motif-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
          {{ a.motif }}
        </div>

        <!-- Workflow -->
        <div class="workflow-row">
          <div class="wf-item" [class.done]="isWFDone(a,'soumis')" [class.active]="a.statut === 'EN_ATTENTE_RH'">
            <div class="wf-dot"></div><span>Soumis</span>
          </div>
          <div class="wf-line" [class.done]="isWFDone(a,'rh')"></div>
          <div class="wf-item" [class.done]="isWFDone(a,'rh')" [class.rejected]="a.statut === 'REJETEE'">
            <div class="wf-dot"></div><span>RH</span>
          </div>
          <div class="wf-line" [class.done]="a.statut === 'EN_COURS' || a.statut === 'SOLDEE'"></div>
          <div class="wf-item" [class.done]="a.statut === 'EN_COURS' || a.statut === 'SOLDEE'">
            <div class="wf-dot"></div><span>Versé</span>
          </div>
        </div>

        <!-- Commentaires -->
        <div class="ac-comments" *ngIf="a.commentaireRH">
          <div class="ac-comment" *ngIf="a.commentaireRH">
            <span class="cc-icon"><span [innerHTML]="ic.building | safeHtml"></span></span>
            <div class="cc-body">
              <span class="cc-label">{{ a.rhDecideurNom }} :</span>
              {{ a.commentaireRH }}
            </div>
          </div>
        </div>

        <!-- Échéancier toggle -->
        <div class="echeancier-toggle" *ngIf="a.echeancier && a.echeancier.length > 0">
          <button class="btn-toggle" (click)="toggleEcheancier(a.id)">
            <span [innerHTML]="(showEcheancier() === a.id ? ic.collapse : ic.expand) | safeHtml"></span>
            {{ showEcheancier() === a.id ? 'Masquer' : 'Voir' }} l'échéancier ({{ a.echeancier.length }} mensualités)
          </button>
          <div class="echeancier-table" *ngIf="showEcheancier() === a.id">
            <table>
              <thead>
                <tr><th>#</th><th>Date échéance</th><th>Montant</th><th>Statut</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of a.echeancier" [class.paye]="e.paye" [class.prochain]="isProchaine(e, a)">
                  <td>{{ e.numeroMensualite }}</td>
                  <td>{{ e.dateEcheance | date:'dd/MM/yyyy' }}</td>
                  <td><strong>{{ e.montantEcheance | number:'1.3-3' }} DT</strong></td>
                  <td>
                    <span *ngIf="e.paye" class="badge badge-success"><span [innerHTML]="ic.check | safeHtml"></span> Payé ({{ e.datePaiement | date:'dd/MM' }})</span>
                    <span *ngIf="!e.paye && isProchaine(e, a)" class="badge badge-warning"><span [innerHTML]="ic.clock | safeHtml"></span> Prochaine</span>
                    <span *ngIf="!e.paye && !isProchaine(e, a)" class="badge badge-gray">En attente</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ac-actions">
          <button class="btn btn-danger" *ngIf="canAnnuler(a)" (click)="annulerAvance(a.id)" [disabled]="actionLoading()">
            <span [innerHTML]="ic.ban | safeHtml"></span> Annuler
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="mesAvances().length === 0">
      <div class="empty-icon"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
      <h3>Aucune demande d'avance</h3>
      <p>Simulez d'abord pour voir si vous êtes éligible.</p>
      <button class="btn btn-primary" (click)="setTab('simuler')">
        <span [innerHTML]="ic.calculator | safeHtml"></span> Simuler une avance
      </button>
    </div>
  </div>

  <!-- ===================== SIMULER ===================== -->
  <div *ngIf="activeTab() === 'simuler'" class="tab-content fade-in">
    <div class="simuler-layout">

      <div class="sim-form-card">
        <div class="sim-header">
          <div class="sim-header-icon"><span [innerHTML]="ic.calculator | safeHtml"></span></div>
          <div>
            <h3>Simulateur d'avance</h3>
            <p>Calculez votre mensualité avant de soumettre</p>
          </div>
        </div>

        <form [formGroup]="simForm" (ngSubmit)="onSimuler()">
          <div class="form-group">
            <label>Montant souhaité (DT) *</label>
            <div class="amount-input">
              <input type="number" formControlName="montant" placeholder="0.000" step="0.001" min="100" [class.error]="isSimInvalid('montant')" />
              <span class="amount-currency">DT</span>
            </div>
            <span class="error-msg" *ngIf="isSimInvalid('montant')">Minimum 100 DT</span>
          </div>

          <div class="form-group">
            <label>Nombre de mensualités : <strong class="teal">{{ simForm.get('nombreMensualites')?.value }}</strong></label>
            <div class="slider-wrapper">
              <input type="range" formControlName="nombreMensualites" min="1" max="12" step="1" class="mensualites-slider" />
              <div class="slider-labels"><span>1 mois</span><span>6 mois</span><span>12 mois</span></div>
            </div>
            <div class="mensualites-chips">
              <button type="button" class="chip" *ngFor="let n of [1,2,3,4,6,8,10,12]"
                      [class.active]="simForm.get('nombreMensualites')?.value == n"
                      (click)="simForm.get('nombreMensualites')?.setValue(n)">{{ n }}</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary full-btn" [disabled]="simLoading()">
            <span *ngIf="!simLoading()"><span [innerHTML]="ic.calculator | safeHtml"></span> Calculer la simulation</span>
            <span *ngIf="simLoading()" class="spinner"></span>
          </button>
        </form>
      </div>

      <!-- Résultat simulation -->
      <div class="sim-result-card" *ngIf="simulation()">

        <div class="eligibilite" [class.eligible]="simulation()!.eligible" [class.ineligible]="!simulation()!.eligible">
          <div class="elig-icon">
            <span [innerHTML]="(simulation()!.eligible ? ic.checkCircle : ic.xCircle) | safeHtml"></span>
          </div>
          <div class="elig-body">
            <strong>{{ simulation()!.eligible ? 'Vous êtes éligible' : 'Vous n\'êtes pas éligible' }}</strong>
            <span *ngIf="!simulation()!.eligible">{{ simulation()!.raisonIneligibilite }}</span>
          </div>
        </div>

        <div class="sim-kpis">
          <div class="sim-kpi">
            <span class="sk-label">Montant max autorisé</span>
            <span class="sk-value teal">{{ simulation()!.montantMaxAutorise | number:'1.3-3' }} DT</span>
            <span class="sk-sub">3 × {{ simulation()!.salaireBase | number:'1.3-3' }} DT (salaire de base)</span>
          </div>
          <div class="sim-kpi">
            <span class="sk-label">Mensualité</span>
            <span class="sk-value green">{{ simulation()!.mensualite | number:'1.3-3' }} DT</span>
            <span class="sk-sub">par mois</span>
          </div>
          <div class="sim-kpi">
            <span class="sk-label">Début remboursement</span>
            <span class="sk-value">{{ simulation()!.dateDebutRemboursement | date:'MMM yyyy' }}</span>
            <span class="sk-sub">premier prélèvement</span>
          </div>
        </div>

        <div class="sim-echeancier">
          <h4><span [innerHTML]="ic.calendar | safeHtml"></span> Échéancier prévisionnel</h4>
          <div class="sim-ech-list">
            <div class="sim-ech-item" *ngFor="let e of simulation()!.echeancier">
              <span class="se-num">{{ e.numero }}</span>
              <span class="se-date">{{ e.dateEcheance | date:'MMM yyyy' }}</span>
              <span class="se-montant">{{ e.montant | number:'1.3-3' }} DT</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary full-btn" *ngIf="simulation()!.eligible" (click)="utiliserSimulation()">
          <span [innerHTML]="ic.arrowRight | safeHtml"></span> Utiliser cette simulation
        </button>
      </div>

    </div>
  </div>

  <!-- ===================== NOUVELLE DEMANDE ===================== -->
  <div *ngIf="activeTab() === 'nouvelle'" class="tab-content fade-in">
    <div class="form-card">

      <div class="form-header">
        <div class="form-header-icon"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
        <div>
          <h3>Nouvelle demande d'avance</h3>
          <p>Remplissez le formulaire ou utilisez le simulateur</p>
        </div>
      </div>

      <div class="rules-info">
        <div class="rule-item"><span [innerHTML]="ic.rulePercent | safeHtml"></span><span>Max 50% du salaire mensuel</span></div>
        <div class="rule-item"><span [innerHTML]="ic.ruleStack   | safeHtml"></span><span>Max 2 avances simultanées</span></div>
        <div class="rule-item"><span [innerHTML]="ic.ruleDelay   | safeHtml"></span><span>Délai 3 mois entre avances</span></div>
        <div class="rule-item"><span [innerHTML]="ic.ruleBadge   | safeHtml"></span><span>6 mois d'ancienneté requis</span></div>
      </div>

      <form [formGroup]="avanceForm" (ngSubmit)="onSubmit()">

        <div class="form-group">
          <label>Montant demandé (DT) *</label>
          <div class="amount-input">
            <input type="number" formControlName="montantDemande" placeholder="0.000" step="0.001" min="100" [class.error]="isInvalid('montantDemande')" />
            <span class="amount-currency">DT</span>
          </div>
          <span class="error-msg" *ngIf="isInvalid('montantDemande')">Minimum 100 DT</span>
        </div>

        <div class="form-group">
          <label>Nombre de mensualités * <strong class="teal">{{ avanceForm.get('nombreMensualites')?.value }} mois</strong></label>
          <div class="mensualites-chips">
            <button type="button" class="chip" *ngFor="let n of [1,2,3,4,6,8,10,12]"
                    [class.active]="avanceForm.get('nombreMensualites')?.value == n"
                    (click)="avanceForm.get('nombreMensualites')?.setValue(n)">{{ n }} mois</button>
          </div>
        </div>

        <div class="mensualite-preview" *ngIf="getMensualitePreview() > 0">
          <div class="mp-icon"><span [innerHTML]="ic.creditCard | safeHtml"></span></div>
          <div class="mp-body">
            <strong>{{ getMensualitePreview() | number:'1.3-3' }} DT</strong>
            <span>par mois pendant {{ avanceForm.get('nombreMensualites')?.value }} mois</span>
          </div>
        </div>

        <div class="form-group">
          <label>Motif *</label>
          <textarea formControlName="motif" placeholder="Expliquez la raison de votre demande d'avance..." rows="4" [class.error]="isInvalid('motif')"></textarea>
          <span class="error-msg" *ngIf="isInvalid('motif')">Minimum 10 caractères</span>
        </div>

        <div class="form-alert error" *ngIf="formError()">
          <span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ formError() }}
        </div>
        <div class="form-alert success" *ngIf="formSuccess()">
          <span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ formSuccess() }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="setTab('simuler')">
            <span [innerHTML]="ic.calculator | safeHtml"></span> Simuler d'abord
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="submitLoading()">
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
      <h3>Aucune demande en attente</h3>
      <p>Toutes les demandes sont traitées.</p>
    </div>

    <div class="avances-list" *ngIf="enAttente().length > 0">
      <div class="avance-card validation-card" *ngFor="let a of enAttente()">
        <div class="ac-accent"></div>

        <div class="ac-header">
          <div class="user-info-block">
            <div class="user-avatar-md">{{ getInitiales(a) }}</div>
            <div>
              <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
              <span class="user-sub">{{ a.employeMatricule }} • {{ a.employeDepartement }}</span>
            </div>
          </div>
          <span class="badge" [class]="getBadgeClass(a.statut)">{{ getStatutLabel(a.statut) }}</span>
        </div>

        <div class="montants-row">
          <div class="montant-block">
            <span class="mb-label">Montant demandé</span>
            <span class="mb-value teal">{{ a.montantDemande | number:'1.3-3' }} DT</span>
          </div>
          <div class="montant-block" *ngIf="a.montantMaxAutorise">
            <span class="mb-label">Max autorisé</span>
            <span class="mb-value">{{ a.montantMaxAutorise | number:'1.3-3' }} DT</span>
          </div>
          <div class="montant-block">
            <span class="mb-label">Mensualités</span>
            <span class="mb-value">{{ a.nombreMensualites }} mois</span>
          </div>
          <div class="montant-block" *ngIf="a.salaireBase">
            <span class="mb-label">Salaire base</span>
            <span class="mb-value">{{ a.salaireBase | number:'1.3-3' }} DT</span>
          </div>
        </div>

        <div class="ac-motif">
          <span class="ac-motif-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
          {{ a.motif }}
        </div>

        <!-- Form RH -->
        <div class="validation-form rh-form" *ngIf="isRHOrAdmin() && validatingId() === a.id">
          <div class="rh-form-grid">
            <div class="form-group">
              <label>Montant accordé (DT)</label>
              <input type="number" [(ngModel)]="rhMontantAccorde" [placeholder]="a.montantDemande" step="0.001" />
            </div>
            <div class="form-group">
              <label>Mensualités</label>
              <select [(ngModel)]="rhMensualites">
                <option *ngFor="let n of [1,2,3,4,6,8,10,12]" [value]="n">{{ n }} mois</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date versement</label>
              <input type="date" [(ngModel)]="rhDateVersement" [min]="minDate" />
            </div>
            <div class="form-group" style="grid-column:span 3">
              <label>Commentaire</label>
              <textarea [(ngModel)]="validationCommentaire" placeholder="Commentaire..." rows="2"></textarea>
            </div>
          </div>
          <div class="vf-actions">
            <button class="btn btn-danger" (click)="traiterRH(a.id, false)" [disabled]="validationLoading()">
              <span [innerHTML]="ic.x | safeHtml"></span> Rejeter
            </button>
            <button class="btn btn-primary" (click)="traiterRH(a.id, true)" [disabled]="validationLoading()">
              <span *ngIf="!validationLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Valider</span>
              <span *ngIf="validationLoading()" class="spinner"></span>
            </button>
            <button class="btn btn-outline" (click)="validatingId.set(null)">Annuler</button>
          </div>
        </div>

        <div class="ac-actions" *ngIf="validatingId() !== a.id">
          <button class="btn btn-primary" (click)="validatingId.set(a.id); initValidationForm(a)">
            <span [innerHTML]="ic.note | safeHtml"></span> Traiter cette demande
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== TOUTES (RH) ===================== -->
  <div *ngIf="activeTab() === 'toutes'" class="tab-content fade-in">

    <div class="stats-row">
      <div class="stat-mini" *ngFor="let s of getRHStats()">
        <span class="sm-value" [class]="s.color">{{ s.value }}</span>
        <span class="sm-label">{{ s.label }}</span>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrap">
        <span [innerHTML]="ic.search | safeHtml"></span>
        <input type="text" placeholder="Rechercher..." (input)="rhSearch.set($any($event.target).value)" class="search-inp" />
      </div>
      <select class="filter-select" (change)="rhFilterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Employé</th><th>Montant</th><th>Accordé</th><th>Remboursé</th>
              <th>Mensualité</th><th>Prochaine éch.</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of getRHFiltered()">
              <td>
                <div class="user-cell">
                  <div class="mini-avatar">{{ getInitiales(a) }}</div>
                  <div>
                    <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
                    <small class="dept">{{ a.employeDepartement }}</small>
                  </div>
                </div>
              </td>
              <td>{{ a.montantDemande | number:'1.3-3' }} DT</td>
              <td>
                <span *ngIf="a.montantAccorde">{{ a.montantAccorde | number:'1.3-3' }} DT</span>
                <span *ngIf="!a.montantAccorde" class="text-muted">—</span>
              </td>
              <td>
                <span *ngIf="a.montantRembourse > 0">{{ a.montantRembourse | number:'1.3-3' }} DT</span>
                <span *ngIf="a.montantRembourse === 0" class="text-muted">—</span>
              </td>
              <td>
                <span *ngIf="a.mensualite">{{ a.mensualite | number:'1.3-3' }} DT</span>
                <span *ngIf="!a.mensualite" class="text-muted">—</span>
              </td>
              <td>
                <span *ngIf="a.prochaineEcheance" class="badge badge-warning">{{ a.prochaineEcheance | date:'dd/MM/yyyy' }}</span>
                <span *ngIf="!a.prochaineEcheance" class="text-muted">—</span>
              </td>
              <td><span class="badge" [class]="getBadgeClass(a.statut)">{{ getStatutLabel(a.statut) }}</span></td>
              <td>
                <div class="action-btns">
                  <button class="icon-action" *ngIf="a.statut === 'VALIDEE'" title="Enregistrer versement" (click)="enregistrerVersement(a.id)">
                    <span [innerHTML]="ic.creditCard | safeHtml"></span>
                  </button>
                  <button class="icon-action" *ngIf="a.statut === 'EN_COURS'" title="Gérer remboursements" (click)="ouvrirEcheancier(a)">
                    <span [innerHTML]="ic.calendar | safeHtml"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal échéancier RH -->
  <div class="modal-overlay" *ngIf="avanceEcheancier()" (click)="avanceEcheancier.set(null)">
    <div class="modal echeancier-modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>
          <span [innerHTML]="ic.calendar | safeHtml"></span>
          Échéancier — {{ avanceEcheancier()?.employeNom }} {{ avanceEcheancier()?.employePrenom }}
        </h3>
        <button class="modal-close" (click)="avanceEcheancier.set(null)" [innerHTML]="ic.close | safeHtml"></button>
      </div>
      <div class="modal-body">

        <div class="ech-summary">
          <div class="ech-sum-item">
            <span>Total accordé</span>
            <strong>{{ avanceEcheancier()?.montantAccorde | number:'1.3-3' }} DT</strong>
          </div>
          <div class="ech-sum-item">
            <span>Remboursé</span>
            <strong class="green">{{ avanceEcheancier()?.montantRembourse | number:'1.3-3' }} DT</strong>
          </div>
          <div class="ech-sum-item">
            <span>Restant</span>
            <strong class="amber">{{ avanceEcheancier()?.montantRestant | number:'1.3-3' }} DT</strong>
          </div>
        </div>

        <div class="ech-progress">
          <div class="ech-bar">
            <div class="ech-fill" [style.width]="getRemboursementPercent(avanceEcheancier()!) + '%'"></div>
          </div>
          <span>{{ getRemboursementPercent(avanceEcheancier()!) }}% remboursé</span>
        </div>

        <table class="ech-table">
          <thead>
            <tr><th>#</th><th>Date</th><th>Montant</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of avanceEcheancier()!.echeancier" [class.paye]="e.paye">
              <td>{{ e.numeroMensualite }}</td>
              <td>{{ e.dateEcheance | date:'dd/MM/yyyy' }}</td>
              <td><strong>{{ e.montantEcheance | number:'1.3-3' }} DT</strong></td>
              <td>
                <span *ngIf="e.paye" class="badge badge-success">
                  <span [innerHTML]="ic.check | safeHtml"></span> {{ e.datePaiement | date:'dd/MM/yyyy' }}
                </span>
                <span *ngIf="!e.paye" class="badge badge-gray">En attente</span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" *ngIf="!e.paye" (click)="rembourserEcheance(avanceEcheancier()!.id, e.id)" [disabled]="rembLoading()">
                  <span *ngIf="!rembLoading()"><span [innerHTML]="ic.creditCard | safeHtml"></span> Payer</span>
                  <span *ngIf="rembLoading()" class="spinner-sm"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

    .avances { max-width: 100%; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .page-header-left { display: flex; align-items: center; gap: 14px; }
    .page-header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 14px rgba(14,157,175,0.3); svg { display: block; } }
    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin: 0 0 4px; }
    .page-header p { font-size: 13px; color: var(--c-muted); margin: 0; }

    /* ── Tabs ── */
    .tabs-wrapper { margin-bottom: 24px; }
    .tabs { display: flex; gap: 2px; background: white; padding: 5px; border-radius: 14px; box-shadow: var(--sh); flex-wrap: wrap; border: 1px solid var(--c-gray-200); }
    .tab { padding: 10px 16px; border: none; background: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-muted); transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; svg { display: block; flex-shrink: 0; } &:hover { background: var(--c-gray-100); color: var(--c-text); } &.active { background: var(--c-teal); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); } &.active svg { stroke: white; } }
    .tab-count { min-width: 20px; height: 20px; padding: 0 6px; background: var(--c-gray-200); color: var(--c-muted); border-radius: 10px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; &.warning { background: var(--c-amber-lt); color: var(--c-amber); } }
    .tab.active .tab-count { background: rgba(255,255,255,0.25); color: white; }

    /* ── Cards ── */
    .avances-list { display: flex; flex-direction: column; gap: 18px; }
    .avance-card { background: white; border-radius: var(--r-lg); padding: 22px 26px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; &:hover { box-shadow: var(--sh-md); transform: translateY(-2px); } &.validation-card { cursor: default; &:hover { transform: none; } } }
    .ac-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--c-teal); border-radius: 4px 0 0 4px; }
    .statut-validee         .ac-accent { background: var(--c-green); }
    .statut-en-cours        .ac-accent { background: var(--c-teal); }
    .statut-soldee          .ac-accent { background: var(--c-blue); }
    .statut-rejetee         .ac-accent { background: var(--c-red); }
    .statut-annulee         .ac-accent { background: var(--c-gray-200); }
    .statut-attente-manager .ac-accent { background: var(--c-amber); }
    .statut-attente-rh      .ac-accent { background: var(--c-amber); }

    /* ── Header ── */
    .ac-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .ac-montant { display: flex; align-items: baseline; gap: 4px; }
    .montant-val { font-size: 34px; font-weight: 800; color: var(--c-text); line-height: 1; }
    .montant-unit { font-size: 16px; font-weight: 700; color: var(--c-teal); }
    .montant-label { font-size: 12px; color: var(--c-muted); margin-left: 4px; }
    .ac-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .ac-date { font-size: 12px; color: var(--c-muted); }

    /* ── Montants row ── */
    .montants-row { display: flex; gap: 20px; flex-wrap: wrap; background: var(--c-gray-100); border-radius: var(--r); padding: 14px 16px; margin-bottom: 14px; }
    .montant-block { display: flex; flex-direction: column; gap: 3px; }
    .mb-label { font-size: 10px; color: var(--c-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .mb-value { font-size: 15px; font-weight: 700; color: var(--c-text); &.teal { color: var(--c-teal); } &.green { color: var(--c-green); } &.amber { color: var(--c-amber); } }

    /* ── Remboursement ── */
    .remboursement-progress { margin-bottom: 14px; }
    .rp-header { display: flex; justify-content: space-between; font-size: 12px; color: var(--c-text); font-weight: 600; margin-bottom: 6px; }
    .rp-label { display: flex; align-items: center; gap: 5px; svg { display: block; } }
    .rp-bar { height: 10px; background: var(--c-gray-200); border-radius: 5px; overflow: hidden; margin-bottom: 4px; }
    .rp-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, var(--c-teal), var(--c-teal-dk)); transition: width 0.6s ease; &.complete { background: var(--c-green); } }
    .rp-footer { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); }
    .rp-percent { font-weight: 700; color: var(--c-teal); }

    /* ── Motif ── */
    .ac-motif { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--c-text); padding: 9px 12px; border-left: 3px solid var(--c-teal); background: white; border-radius: 4px; margin-bottom: 14px; }
    .ac-motif-icon { flex-shrink: 0; color: var(--c-teal); margin-top: 1px; svg { display: block; } }

    /* ── Workflow ── */
    .workflow-row { display: flex; align-items: center; margin: 14px 0; }
    .wf-item { display: flex; flex-direction: column; align-items: center; gap: 4px; .wf-dot { width: 20px; height: 20px; border-radius: 50%; background: var(--c-gray-200); border: 2px solid var(--c-gray-200); transition: all 0.3s; } span { font-size: 10px; font-weight: 600; color: var(--c-muted); white-space: nowrap; display: flex; align-items: center; gap: 3px; } &.done .wf-dot { background: var(--c-green); border-color: var(--c-green); } &.done span { color: var(--c-green); } &.active .wf-dot { background: var(--c-amber); border-color: var(--c-amber); animation: pulse 1.5s infinite; } &.active span { color: var(--c-amber); } &.rejected .wf-dot { background: var(--c-red); border-color: var(--c-red); } }
    .wf-line { flex: 1; height: 2px; background: var(--c-gray-200); margin-bottom: 14px; transition: background 0.3s; &.done { background: var(--c-green); } }
    .wf-icon { display: inline-flex; svg { display: block; } &.green { color: var(--c-green); } &.amber { color: var(--c-amber); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

    /* ── Comments ── */
    .ac-comments { background: var(--c-gray-100); border-radius: var(--r); padding: 12px 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }
    .ac-comment { display: flex; gap: 8px; font-size: 13px; color: var(--c-text); }
    .cc-icon { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; margin-top: 1px; color: var(--c-teal); svg { display: block; } }
    .cc-body { flex: 1; }
    .cc-label { font-weight: 700; color: var(--c-teal); margin-right: 4px; }
    .cc-avis { display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; svg { display: block; width: 11px; height: 11px; } &.favorable { background: var(--c-green-lt); color: var(--c-green); } &.defavorable { background: var(--c-amber-lt); color: var(--c-amber); } }

    /* ── Avis manager ── */
    .avis-manager-info { display: flex; align-items: center; gap: 10px; background: var(--c-gray-100); border-radius: var(--r); padding: 10px 14px; margin-bottom: 12px; font-size: 13px; flex-wrap: wrap; }
    .ami-label { font-weight: 700; color: var(--c-text); }
    .ami-val { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; padding: 3px 10px; border-radius: 6px; svg { display: block; width: 12px; height: 12px; } &.favorable { background: var(--c-green-lt); color: var(--c-green); } &.defavorable { background: var(--c-amber-lt); color: var(--c-amber); } }

    /* ── Écheancier toggle ── */
    .echeancier-toggle { margin-top: 12px; }
    .btn-toggle { background: none; border: 1.5px solid var(--c-gray-200); padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--c-teal); transition: all 0.2s; margin-bottom: 10px; display: inline-flex; align-items: center; gap: 6px; svg { display: block; } &:hover { background: var(--c-teal-lt); border-color: var(--c-teal); } }
    .echeancier-table { overflow-x: auto; border-radius: var(--r); border: 1px solid var(--c-gray-200); table { width: 100%; border-collapse: collapse; thead tr { background: var(--c-teal-lt); th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-teal); } } tbody tr { border-bottom: 1px solid var(--c-gray-200); &:hover { background: var(--c-gray-100); } &.paye { opacity: 0.7; } &.prochain { background: var(--c-amber-lt); font-weight: 600; } td { padding: 10px 14px; font-size: 13px; } } } }

    .ac-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--c-gray-200); }

    /* ── Simuler layout ── */
    .simuler-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }
    .sim-form-card, .sim-result-card { background: white; border-radius: 20px; padding: 26px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .sim-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .sim-header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .sim-header h3 { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0 0 3px; }
    .sim-header p { font-size: 12px; color: var(--c-muted); margin: 0; }

    /* ── Amount input ── */
    .amount-input { position: relative; input { padding-right: 44px !important; } .amount-currency { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--c-teal); font-size: 14px; } }

    .slider-wrapper { padding: 0 4px; margin-bottom: 8px; }
    .mensualites-slider { width: 100%; -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--c-gray-200); outline: none; &::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--c-teal); cursor: pointer; border: 2px solid white; box-shadow: 0 2px 6px rgba(14,157,175,0.3); } }
    .slider-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); margin-top: 4px; }

    .mensualites-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }
    .chip { padding: 6px 13px; border-radius: 20px; border: 1.5px solid var(--c-gray-200); background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--c-muted); transition: all 0.2s; &:hover { border-color: var(--c-teal); color: var(--c-teal); } &.active { background: var(--c-teal); color: white; border-color: var(--c-teal); box-shadow: 0 2px 8px rgba(14,157,175,0.3); } }

    /* ── Eligibilité ── */
    .eligibilite { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: var(--r); margin-bottom: 20px; &.eligible { background: var(--c-green-lt); border: 1px solid #9ae6b4; } &.ineligible { background: var(--c-red-lt); border: 1px solid #fc8181; } }
    .elig-icon { flex-shrink: 0; svg { display: block; width: 26px; height: 26px; } }
    .elig-body { strong { font-size: 14px; font-weight: 700; color: var(--c-text); display: block; } span { font-size: 12px; color: var(--c-red); } }

    /* ── Sim KPIs ── */
    .sim-kpis { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
    .sim-kpi { background: var(--c-gray-100); border-radius: var(--r); padding: 12px; text-align: center; }
    .sk-label { font-size: 10px; color: var(--c-muted); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .sk-value { font-size: 15px; font-weight: 800; display: block; color: var(--c-text); &.teal { color: var(--c-teal); } &.green { color: var(--c-green); } }
    .sk-sub { font-size: 10px; color: var(--c-muted); margin-top: 2px; display: block; }

    /* ── Sim écheancier ── */
    .sim-echeancier { margin-bottom: 20px; h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; svg { display: block; } } }
    .sim-ech-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }
    .sim-ech-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; background: var(--c-gray-100); font-size: 13px; transition: background 0.15s; &:hover { background: var(--c-teal-lt); } }
    .se-num { width: 24px; height: 24px; border-radius: 50%; background: var(--c-teal); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .se-date { flex: 1; color: var(--c-text); }
    .se-montant { font-weight: 700; color: var(--c-teal); }

    /* ── Form card ── */
    .form-card { background: white; border-radius: 20px; padding: 32px; max-width: 640px; margin: 0 auto; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .form-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .form-header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .form-header h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin: 0 0 4px; }
    .form-header p { font-size: 12px; color: var(--c-muted); margin: 0; }

    .rules-info { background: var(--c-teal-lt); border-radius: var(--r); padding: 12px 14px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
    .rule-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--c-teal); padding: 5px 10px; background: white; border-radius: 8px; svg { display: block; flex-shrink: 0; } }

    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; label { font-size: 12px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; } }

    input[type="number"], input[type="date"], textarea, select {
      padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; width: 100%;
      &:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); }
      &.error { border-color: var(--c-red); }
    }
    textarea { resize: vertical; }
    .error-msg { font-size: 11px; color: var(--c-red); font-weight: 500; }
    .teal { color: var(--c-teal); }

    .mensualite-preview { display: flex; align-items: center; gap: 12px; background: var(--c-teal-lt); border-radius: var(--r); padding: 14px 16px; margin-bottom: 20px; border: 1px solid rgba(14,157,175,0.2); }
    .mp-icon { width: 40px; height: 40px; border-radius: 10px; background: white; color: var(--c-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } }
    .mp-body { flex: 1; strong { font-size: 18px; font-weight: 800; color: var(--c-teal); display: block; } span { font-size: 12px; color: var(--c-muted); } }

    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 14px; svg { flex-shrink: 0; display: block; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }
    .full-btn { width: 100%; justify-content: center; }

    /* ── Validation form ── */
    .user-info-block { display: flex; align-items: center; gap: 12px; }
    .user-avatar-md { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
    .user-sub { font-size: 11px; color: var(--c-muted); display: block; }

    .validation-form { margin-top: 12px; padding: 14px; background: var(--c-gray-100); border-radius: var(--r); textarea { width: 100%; padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; resize: none; background: white; margin-bottom: 12px; &:focus { border-color: var(--c-teal); } } }
    .vf-header { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; }
    .vf-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }

    .rh-form-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 12px; label { font-size: 11px; font-weight: 700; color: var(--c-muted); display: block; margin-bottom: 4px; text-transform: uppercase; } input, select, textarea { padding: 8px 12px; border: 1.5px solid var(--c-gray-200); border-radius: 8px; font-size: 13px; outline: none; background: white; width: 100%; &:focus { border-color: var(--c-teal); } } }

    /* ── Buttons ── */
    .btn { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; svg { display: block; flex-shrink: 0; } &.btn-primary { background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(14,157,175,0.4); } } &.btn-secondary { background: var(--c-teal-lt); color: var(--c-teal); border: 1px solid rgba(14,157,175,0.3); &:hover { background: var(--c-teal); color: white; } } &.btn-danger { background: var(--c-red-lt); color: var(--c-red); &:hover { background: var(--c-red); color: white; } } &.btn-outline { background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); &:hover { border-color: var(--c-teal); color: var(--c-teal); } } &.btn-sm { padding: 5px 12px; font-size: 12px; } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; } }

    /* ── Filters ── */
    .filters-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; cursor: pointer; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-teal); } }
    .search-wrap { position: relative; flex: 1; display: flex; align-items: center; svg { position: absolute; left: 12px; color: var(--c-muted); display: block; pointer-events: none; } }
    .search-inp { width: 100%; padding: 10px 14px 10px 36px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; &:focus { border-color: var(--c-teal); } }

    /* ── Stats ── */
    .stats-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat-mini { background: white; padding: 11px 18px; border-radius: var(--r); border: 1px solid var(--c-gray-200); display: flex; flex-direction: column; gap: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .sm-value { font-size: 22px; font-weight: 800; &.primary { color: var(--c-teal); } &.success { color: var(--c-green); } &.warning { color: var(--c-amber); } &.danger { color: var(--c-red); } &.info { color: var(--c-blue); } }
    .sm-label { font-size: 11px; color: var(--c-muted); font-weight: 500; }

    /* ── Table ── */
    .card { background: white; border-radius: var(--r-lg); padding: 20px 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 20px; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--c-gray-100); border-bottom: 1px solid var(--c-gray-200); &:first-child { border-radius: 8px 0 0 8px; } &:last-child { border-radius: 0 8px 8px 0; } }
    tbody tr { transition: background 0.15s; &:hover { background: var(--c-gray-100); } }
    tbody td { padding: 12px 14px; border-bottom: 1px solid var(--c-gray-100); vertical-align: middle; }
    .user-cell { display: flex; align-items: center; gap: 8px; strong { display: block; } }
    .mini-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }
    .dept { display: block; font-size: 11px; color: var(--c-muted); }
    .text-muted { color: var(--c-muted); font-size: 12px; }
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
    .echeancier-modal { background: white; border-radius: 18px; width: 600px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--c-gray-200); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; h3 { font-size: 14px; font-weight: 700; color: var(--c-text); display: flex; align-items: center; gap: 8px; margin: 0; svg { display: block; color: var(--c-teal); } } }
    .modal-close { width: 30px; height: 30px; border: none; background: var(--c-gray-100); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-red-lt); color: var(--c-red); } }
    .modal-body { flex: 1; overflow-y: auto; padding: 18px 20px; }

    .ech-summary { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
    .ech-sum-item { flex: 1; background: var(--c-gray-100); border-radius: var(--r); padding: 12px; text-align: center; span { font-size: 11px; color: var(--c-muted); display: block; margin-bottom: 4px; } strong { font-size: 16px; font-weight: 800; color: var(--c-text); &.green { color: var(--c-green); } &.amber { color: var(--c-amber); } } }

    .ech-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ech-bar { flex: 1; height: 8px; background: var(--c-gray-200); border-radius: 4px; overflow: hidden; }
    .ech-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--c-teal), var(--c-teal-dk)); transition: width 0.5s ease; }
    .ech-progress span { font-size: 12px; font-weight: 700; color: var(--c-teal); white-space: nowrap; }

    .ech-table { width: 100%; border-collapse: collapse; font-size: 13px; thead tr { background: var(--c-teal-lt); th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-teal); } } tbody tr { border-bottom: 1px solid var(--c-gray-200); transition: background 0.15s; &:hover { background: var(--c-gray-100); } &.paye { opacity: 0.65; } td { padding: 10px 12px; } } }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-200); }
    .empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; svg { display: block; } &.success-icon { background: var(--c-green-lt); color: var(--c-green); } }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
    .empty-state p { color: var(--c-muted); font-size: 13px; margin-bottom: 20px; }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } &.toast--info { background: var(--c-teal-lt); color: var(--c-teal); } }

    /* ── Spinners ── */
    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    .spinner-sm { width: 12px; height: 12px; display: inline-block; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AvancesComponent implements OnInit {

  private avanceService = inject(AvanceService);
  private authService   = inject(AuthService);
  private fb            = inject(FormBuilder);

  role = this.authService.getRole();
  ic   = IC;

  activeTab         = signal<Tab>('mes-avances');
  loading           = signal(true);
  actionLoading     = signal(false);
  submitLoading     = signal(false);
  simLoading        = signal(false);
  validationLoading = signal(false);
  rembLoading       = signal(false);

  mesAvances    = signal<AvanceSalaire[]>([]);
  enAttente     = signal<AvanceSalaire[]>([]);
  toutesAvances = signal<AvanceSalaire[]>([]);
  statsRH       = signal<Record<string, number>>({});
  simulation    = signal<SimulationResponse | null>(null);

  filterStatut   = signal('');
  rhSearch       = signal('');
  rhFilterStatut = signal('');

  validatingId          = signal<number | null>(null);
  validationCommentaire = '';
  rhMontantAccorde:     number | null = null;
  rhMensualites         = 3;
  rhDateVersement       = '';

  showEcheancier   = signal<number | null>(null);
  avanceEcheancier = signal<AvanceSalaire | null>(null);

  formError   = signal('');
  formSuccess = signal('');

  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

  get minDate(): string { return new Date().toISOString().split('T')[0]; }

  statuts = [
    { value: 'EN_ATTENTE_RH',      label: 'Attente RH' },
    { value: 'VALIDEE',            label: 'Validée' },
    { value: 'EN_COURS',           label: 'En cours' },
    { value: 'SOLDEE',             label: 'Soldée' },
    { value: 'REJETEE',            label: 'Rejetée' },
    { value: 'ANNULEE',            label: 'Annulée' }
  ];

  simForm = this.fb.group({
    montant:           [null, [Validators.required, Validators.min(100)]],
    nombreMensualites: [3, Validators.required]
  });

  avanceForm = this.fb.group({
    montantDemande:    [null as number | null, [Validators.required, Validators.min(100)]],
    motif:             ['', [Validators.required, Validators.minLength(10)]],
    nombreMensualites: [3, Validators.required]
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    const obs: any = { avances: this.avanceService.getMesAvances() };
    if (this.isManagerOrAbove()) { obs.attente = this.avanceService.getEnAttenteRH(); }
    if (this.isRHOrAdmin()) { obs.toutes = this.avanceService.getToutesAvances(); obs.stats = this.avanceService.getStatistiques(); }
    forkJoin(obs).subscribe({
      next: (data: any) => { this.mesAvances.set(data.avances ?? []); if (data.attente) this.enAttente.set(data.attente); if (data.toutes) this.toutesAvances.set(data.toutes); if (data.stats) this.statsRH.set(data.stats); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.formError.set(''); this.formSuccess.set(''); }

  onSimuler(): void {
    if (this.simForm.invalid) { this.simForm.markAllAsTouched(); return; }
    this.simLoading.set(true);
    this.avanceService.simuler({ montant: this.simForm.value.montant!, nombreMensualites: this.simForm.value.nombreMensualites! }).subscribe({
      next:  (data) => { this.simLoading.set(false); this.simulation.set(data); },
      error: (err)  => { this.simLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  utiliserSimulation(): void {
    const sim = this.simulation(); if (!sim) return;
    this.avanceForm.patchValue({ montantDemande: sim.montantDemande, nombreMensualites: sim.nombreMensualites });
    this.setTab('nouvelle');
  }

  onSubmit(): void {
    if (this.avanceForm.invalid) { this.avanceForm.markAllAsTouched(); return; }
    this.submitLoading.set(true); this.formError.set('');
    this.avanceService.creerDemande({ montantDemande: this.avanceForm.value.montantDemande!, motif: this.avanceForm.value.motif!, nombreMensualites: this.avanceForm.value.nombreMensualites! }).subscribe({
      next: (data) => { this.submitLoading.set(false); this.formSuccess.set('Demande soumise avec succès !'); this.mesAvances.update(a => [data, ...a]); this.avanceForm.reset({ nombreMensualites: 3 }); setTimeout(() => { this.formSuccess.set(''); this.setTab('mes-avances'); }, 1500); },
      error: (err) => { this.submitLoading.set(false); this.formError.set(err.error?.message ?? 'Erreur.'); }
    });
  }

  annulerAvance(id: number): void {
    if (!confirm('Annuler cette demande ?')) return;
    this.actionLoading.set(true);
    this.avanceService.annuler(id).subscribe({
      next: (data) => { this.actionLoading.set(false); this.mesAvances.update(a => a.map(x => x.id === id ? data : x)); this.showToast('Demande annulée', 'info'); },
      error: () => { this.actionLoading.set(false); this.showToast('Erreur', 'error'); }
    });
  }

  initValidationForm(a: AvanceSalaire): void { this.validationCommentaire = ''; this.rhMontantAccorde = a.montantDemande; this.rhMensualites = a.nombreMensualites; this.rhDateVersement = ''; }

  traiterRH(id: number, approuve: boolean): void {
    this.validationLoading.set(true);
    this.avanceService.traiter(id, { approuve, montantAccorde: this.rhMontantAccorde ?? undefined, nombreMensualites: this.rhMensualites, dateVersement: this.rhDateVersement || undefined, commentaire: this.validationCommentaire }).subscribe({
      next: (data) => { this.validationLoading.set(false); this.validatingId.set(null); this.enAttente.update(a => a.filter(x => x.id !== id)); this.toutesAvances.update(a => a.map(x => x.id === id ? data : x)); this.showToast(approuve ? 'Avance validée !' : 'Avance rejetée', approuve ? 'success' : 'error'); },
      error: (err) => { this.validationLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  enregistrerVersement(id: number): void {
    this.avanceService.enregistrerVersement(id).subscribe({
      next: (data) => { this.toutesAvances.update(a => a.map(x => x.id === id ? data : x)); this.showToast('Versement enregistré !', 'success'); },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  ouvrirEcheancier(a: AvanceSalaire): void { this.avanceEcheancier.set(a); }

  rembourserEcheance(avanceId: number, echeanceId: number): void {
    this.rembLoading.set(true);
    this.avanceService.enregistrerRemboursement(avanceId, echeanceId).subscribe({
      next: (data) => { this.rembLoading.set(false); this.avanceEcheancier.set(data); this.toutesAvances.update(a => a.map(x => x.id === avanceId ? data : x)); this.showToast(data.statut === 'SOLDEE' ? 'Avance totalement soldée !' : 'Remboursement enregistré', 'success'); },
      error: () => { this.rembLoading.set(false); this.showToast('Erreur', 'error'); }
    });
  }

  toggleEcheancier(id: number): void { this.showEcheancier.set(this.showEcheancier() === id ? null : id); }

  getMensualitePreview(): number {
    const m = this.avanceForm.get('montantDemande')?.value; const n = this.avanceForm.get('nombreMensualites')?.value;
    if (!m || !n) return 0;
    return Math.round((m / n) * 1000) / 1000;
  }

  getRemboursementPercent(a: AvanceSalaire): number {
    if (!a.montantAccorde || a.montantAccorde === 0) return 0;
    return Math.round((a.montantRembourse / a.montantAccorde) * 100);
  }

  getRHFiltered(): AvanceSalaire[] {
    return this.toutesAvances().filter(a => { const term = this.rhSearch().toLowerCase(); const s = this.rhFilterStatut(); const match = !term || a.employeNom?.toLowerCase().includes(term) || a.employePrenom?.toLowerCase().includes(term); return match && (!s || a.statut === s); });
  }

  getRHStats() {
    const stats = this.statsRH();
    return [
      { value: this.toutesAvances().length, label: 'Total',         color: 'primary' },
      { value: stats['EN_ATTENTE_RH'] ?? 0, label: 'En attente RH', color: 'warning' },
      { value: stats['VALIDEE']       ?? 0, label: 'Validées',      color: 'success' },
      { value: stats['EN_COURS']      ?? 0, label: 'En cours',      color: 'info'    },
      { value: stats['SOLDEE']        ?? 0, label: 'Soldées',       color: 'success' },
      { value: stats['REJETEE']       ?? 0, label: 'Rejetées',      color: 'danger'  }
    ];
  }

  isProchaine(e: any, a: AvanceSalaire): boolean { return e.dateEcheance === a.prochaineEcheance && !e.paye; }

  isManagerOrAbove(): boolean { return ['MANAGER','RH','ADMIN'].includes(this.role); }
  isRHOrAdmin(): boolean      { return ['RH','ADMIN'].includes(this.role); }
  isInvalid(field: string): boolean    { const c = this.avanceForm.get(field); return !!(c?.invalid && c?.touched); }
  isSimInvalid(field: string): boolean { const c = this.simForm.get(field);    return !!(c?.invalid && c?.touched); }
  canAnnuler(a: AvanceSalaire): boolean { return a.statut === 'EN_ATTENTE_RH'; }
  getInitiales(a: AvanceSalaire): string { return ((a.employePrenom?.[0] ?? '') + (a.employeNom?.[0] ?? '')).toUpperCase(); }

  getSubtitle(): string {
    const map: Record<string,string> = { EMPLOYE: 'Simulez et demandez une avance sur salaire', RH: 'Gérez et validez les demandes d\'avance', ADMIN: 'Administration des avances sur salaire' };
    return map[this.role] ?? '';
  }

  getBadgeClass(statut: string): string {
    const map: Record<string,string> = { EN_ATTENTE_RH: 'badge badge-warning', VALIDEE: 'badge badge-success', EN_COURS: 'badge badge-info', SOLDEE: 'badge badge-success', REJETEE: 'badge badge-danger', ANNULEE: 'badge badge-gray' };
    return map[statut] ?? 'badge badge-gray';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string,string> = { EN_ATTENTE_RH: 'Attente RH', VALIDEE: 'Validée', EN_COURS: 'En cours', SOLDEE: 'Soldée', REJETEE: 'Rejetée', ANNULEE: 'Annulée' };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string,string> = { VALIDEE: 'statut-validee', EN_COURS: 'statut-en-cours', SOLDEE: 'statut-soldee', REJETEE: 'statut-rejetee', ANNULEE: 'statut-annulee', EN_ATTENTE_RH: 'statut-attente-rh' };
    return map[statut] ?? '';
  }

  isWFDone(a: AvanceSalaire, step: string): boolean {
    const order: Record<string, number> = { soumis: 1, rh: 2, verse: 3 };
    const statutLevel: Record<string, number> = { EN_ATTENTE_RH: 1, VALIDEE: 2, REJETEE: 2, EN_COURS: 3, SOLDEE: 3, ANNULEE: 0 };
    return (statutLevel[a.statut] ?? 0) > (order[step] ?? 0);
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}
