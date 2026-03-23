import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AugmentationService } from '../../core/services/augmentation.service';
import { AuthService }         from '../../core/services/auth.service';
import { AugmentationSalaire } from '../../core/models/augmentation.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'mes-demandes' | 'nouvelle' | 'en-attente' | 'toutes';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  banknote:    `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  list:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  clock:       `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  folder:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  check:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  x:           `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  ban:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  send:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  note:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  msgCircle:   `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  user:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  building:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  thumbUp:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
  thumbDown:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`,
  barChart:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  search:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  alertCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Tips icons
  trendUp:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  anchor:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
  target:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  // Toast
  toastOk:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  toastInfo:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

@Component({
  selector: 'app-augmentations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="augmentations fade-in">

  <!-- ── Header ── -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-header-icon">
        <span [innerHTML]="ic.banknote | safeHtml"></span>
      </div>
      <div>
        <h1>Augmentations de Salaire</h1>
        <p>{{ getSubtitle() }}</p>
      </div>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'mes-demandes'" (click)="setTab('mes-demandes')">
        <span [innerHTML]="ic.list | safeHtml"></span>
        Mes demandes
        <span class="tab-count">{{ mesDemandes().length }}</span>
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
        Toutes
      </button>
    </div>
  </div>

  <!-- ===================== MES DEMANDES ===================== -->
  <div *ngIf="activeTab() === 'mes-demandes'" class="tab-content fade-in">

    <div class="aug-list" *ngIf="mesDemandes().length > 0">
      <div class="aug-card" *ngFor="let a of mesDemandes()" [class]="'aug-card ' + getStatutClass(a.statut)">
        <div class="ac-accent"></div>

        <div class="ac-header">
          <div class="ac-montant">
            <span class="am-value">+{{ a.montantDemande | number:'1.3-3' }}</span>
            <span class="am-unit">DT</span>
            <span class="am-pct" *ngIf="a.pourcentageAugmentation">({{ a.pourcentageAugmentation }}%)</span>
          </div>
          <span class="badge" [class]="getBadgeClass(a.statut)">{{ getStatutLabel(a.statut) }}</span>
        </div>

        <div class="salary-impact">
          <div class="si-block">
            <span class="si-label">Salaire actuel</span>
            <span class="si-value">{{ a.salaireActuel | number:'1.3-3' }} DT</span>
          </div>
          <div class="si-sep">→</div>
          <div class="si-block">
            <span class="si-label">Après augmentation</span>
            <span class="si-value green" *ngIf="a.salaireApresAugmentation">{{ a.salaireApresAugmentation | number:'1.3-3' }} DT</span>
          </div>
          <div class="si-block" *ngIf="a.montantAccorde && a.montantAccorde !== a.montantDemande">
            <span class="si-label">Accordé</span>
            <span class="si-value teal">+{{ a.montantAccorde | number:'1.3-3' }} DT</span>
          </div>
        </div>

        <div class="ac-motif">
          <span class="acm-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
          {{ a.motif | slice:0:150 }}{{ a.motif.length > 150 ? '...' : '' }}
        </div>

        <!-- Workflow -->
        <div class="wf-row">
          <div class="wf-step" [class.done]="isWFDone(a,'soumis')" [class.active]="a.statut === 'EN_ATTENTE_MANAGER'">
            <div class="wf-dot"></div><span>Soumis</span>
          </div>
          <div class="wf-line" [class.done]="isWFDone(a,'manager')"></div>
          <div class="wf-step" [class.done]="isWFDone(a,'manager')" [class.active]="a.statut === 'EN_ATTENTE_RH'" [class.favorable]="a.avisManager === true" [class.defavorable]="a.avisManager === false">
            <div class="wf-dot"></div>
            <span>Manager
              <span *ngIf="a.avisManager === true"  class="wf-avis green" [innerHTML]="ic.thumbUp   | safeHtml"></span>
              <span *ngIf="a.avisManager === false" class="wf-avis amber" [innerHTML]="ic.thumbDown | safeHtml"></span>
            </span>
          </div>
          <div class="wf-line" [class.done]="a.statut === 'VALIDEE' || a.statut === 'REJETEE'"></div>
          <div class="wf-step" [class.done]="a.statut === 'VALIDEE'" [class.rejected]="a.statut === 'REJETEE'">
            <div class="wf-dot"></div><span>RH</span>
          </div>
        </div>

        <!-- Commentaires -->
        <div class="ac-comments" *ngIf="a.commentaireManager || a.commentaireRH">
          <div class="acc-item" *ngIf="a.commentaireManager">
            <span class="acc-icon"><span [innerHTML]="ic.user | safeHtml"></span></span>
            <div class="acc-body">
              <span class="acc-label">{{ a.managerNom }} :</span>
              {{ a.commentaireManager }}
              <span class="avis-tag" *ngIf="a.avisManager !== null" [class.favorable]="a.avisManager" [class.defavorable]="!a.avisManager">
                <span [innerHTML]="(a.avisManager ? ic.thumbUp : ic.thumbDown) | safeHtml"></span>
                Avis {{ a.avisManager ? 'Favorable' : 'Défavorable' }}
              </span>
            </div>
          </div>
          <div class="acc-item" *ngIf="a.commentaireRH">
            <span class="acc-icon"><span [innerHTML]="ic.building | safeHtml"></span></span>
            <div class="acc-body">
              <span class="acc-label">{{ a.rhDecideurNom }} :</span>
              {{ a.commentaireRH }}
            </div>
          </div>
        </div>

        <div class="ac-actions">
          <button class="btn btn-danger" *ngIf="canAnnuler(a)" (click)="annuler(a.id)" [disabled]="actionLoading()">
            <span [innerHTML]="ic.ban | safeHtml"></span> Annuler
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="mesDemandes().length === 0">
      <div class="empty-icon"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
      <h3>Aucune demande</h3>
      <p>Vous n'avez pas encore soumis de demande d'augmentation.</p>
      <button class="btn btn-primary" (click)="setTab('nouvelle')">
        <span [innerHTML]="ic.plus | safeHtml"></span> Faire une demande
      </button>
    </div>
  </div>

  <!-- ===================== NOUVELLE ===================== -->
  <div *ngIf="activeTab() === 'nouvelle'" class="tab-content fade-in">
    <div class="form-layout">

      <div class="form-card">
        <div class="fc-header">
          <div class="fc-icon"><span [innerHTML]="ic.banknote | safeHtml"></span></div>
          <div>
            <h3>Nouvelle demande d'augmentation</h3>
            <p>Motivez votre demande de manière détaillée.</p>
          </div>
        </div>

        <form [formGroup]="augForm" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Montant d'augmentation souhaité (DT) *</label>
            <div class="amount-input">
              <span class="ai-prefix">+</span>
              <input type="number" formControlName="montantDemande" placeholder="0.000" step="0.001" min="50" [class.error]="isInvalid('montantDemande')" (input)="onMontantChange()" />
              <span class="ai-suffix">DT</span>
            </div>
            <span class="error-msg" *ngIf="isInvalid('montantDemande')">Minimum 50 DT</span>
          </div>

          <!-- Simulation -->
          <div class="sim-preview" *ngIf="simulation()">
            <div class="sp-title">
              <span [innerHTML]="ic.barChart | safeHtml"></span>
              Impact sur votre salaire
            </div>
            <div class="sp-row">
              <div class="sp-item">
                <span>Salaire actuel</span>
                <strong>{{ simulation()!.salaireActuel | number:'1.3-3' }} DT</strong>
              </div>
              <div class="sp-arrow">+</div>
              <div class="sp-item teal">
                <span>Augmentation</span>
                <strong>{{ simulation()!.montantDemande | number:'1.3-3' }} DT</strong>
              </div>
              <div class="sp-arrow">=</div>
              <div class="sp-item green">
                <span>Nouveau salaire</span>
                <strong>{{ simulation()!.salaireApres | number:'1.3-3' }} DT</strong>
              </div>
              <div class="sp-pct">+{{ simulation()!.pourcentage }}%</div>
            </div>
          </div>

          <div class="form-group">
            <label>Motif détaillé * <span class="hint">min 20 caractères</span></label>
            <textarea formControlName="motif" placeholder="Expliquez les raisons : performances, responsabilités, ancienneté, comparaison marché..." rows="5" [class.error]="isInvalid('motif')"></textarea>
            <div class="char-count">{{ augForm.get('motif')?.value?.length || 0 }} / 1000</div>
            <span class="error-msg" *ngIf="isInvalid('motif')">Minimum 20 caractères requis</span>
          </div>

          <div class="form-alert error" *ngIf="formError()"><span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ formError() }}</div>
          <div class="form-alert success" *ngIf="formSuccess()"><span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ formSuccess() }}</div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="augForm.reset()">Réinitialiser</button>
            <button type="submit" class="btn btn-primary" [disabled]="submitLoading()">
              <span *ngIf="!submitLoading()"><span [innerHTML]="ic.send | safeHtml"></span> Soumettre</span>
              <span *ngIf="submitLoading()" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <!-- Conseils -->
      <div class="tips-card">
        <h4>Conseils pour votre demande</h4>
        <div class="tip-list">
          <div class="tip-item">
            <div class="tip-icon teal"><span [innerHTML]="ic.trendUp | safeHtml"></span></div>
            <p>Mentionnez vos réalisations et performances</p>
          </div>
          <div class="tip-item">
            <div class="tip-icon blue"><span [innerHTML]="ic.clock | safeHtml"></span></div>
            <p>Précisez votre ancienneté et évolution</p>
          </div>
          <div class="tip-item">
            <div class="tip-icon amber"><span [innerHTML]="ic.target | safeHtml"></span></div>
            <p>Référencez les responsabilités prises</p>
          </div>
          <div class="tip-item">
            <div class="tip-icon green"><span [innerHTML]="ic.barChart | safeHtml"></span></div>
            <p>Comparez avec le marché si possible</p>
          </div>
        </div>

        <div class="workflow-info">
          <h4>Workflow</h4>
          <div class="wi-step">
            <span class="wi-num">1</span>
            <span>Vous soumettez la demande</span>
          </div>
          <div class="wi-step">
            <span class="wi-num">2</span>
            <span>Votre manager donne un avis</span>
          </div>
          <div class="wi-step">
            <span class="wi-num">3</span>
            <span>Le RH prend la décision finale</span>
          </div>
          <div class="wi-step success">
            <span class="wi-num"><span [innerHTML]="ic.check | safeHtml"></span></span>
            <span>Salaire mis à jour automatiquement</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ===================== EN ATTENTE ===================== -->
  <div *ngIf="activeTab() === 'en-attente'" class="tab-content fade-in">

    <div class="empty-state" *ngIf="enAttente().length === 0">
      <div class="empty-icon success-icon"><span [innerHTML]="ic.checkCircle | safeHtml"></span></div>
      <h3>Aucune demande en attente</h3>
    </div>

    <div class="aug-list" *ngIf="enAttente().length > 0">
      <div class="aug-card validation-card" *ngFor="let a of enAttente()">
        <div class="ac-accent"></div>

        <div class="ac-header">
          <div class="user-info">
            <div class="ui-avatar">{{ getInitiales(a) }}</div>
            <div>
              <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
              <span class="ui-sub">{{ a.employePoste }} — {{ a.employeDepartement }}</span>
            </div>
          </div>
          <span class="badge badge-warning">
            <span [innerHTML]="ic.clock | safeHtml"></span> En attente
          </span>
        </div>

        <div class="salary-impact">
          <div class="si-block"><span class="si-label">Salaire actuel</span><span class="si-value">{{ a.salaireActuel | number:'1.3-3' }} DT</span></div>
          <div class="si-sep">+</div>
          <div class="si-block"><span class="si-label">Demande</span><span class="si-value teal">{{ a.montantDemande | number:'1.3-3' }} DT</span></div>
          <div class="si-sep">=</div>
          <div class="si-block"><span class="si-label">Si validé</span><span class="si-value green" *ngIf="a.salaireApresAugmentation">{{ a.salaireApresAugmentation | number:'1.3-3' }} DT</span></div>
        </div>

        <div class="ac-motif">
          <span class="acm-icon"><span [innerHTML]="ic.msgCircle | safeHtml"></span></span>
          {{ a.motif }}
        </div>

        <div class="avis-info" *ngIf="isRHOrAdmin() && a.avisManager !== null">
          <span>Avis Manager :</span>
          <span class="avis-val" [class.favorable]="a.avisManager" [class.defavorable]="!a.avisManager">
            <span [innerHTML]="(a.avisManager ? ic.thumbUp : ic.thumbDown) | safeHtml"></span>
            {{ a.avisManager ? 'Favorable' : 'Défavorable' }}
          </span>
          <span *ngIf="a.commentaireManager" class="avis-comment">"{{ a.commentaireManager }}"</span>
        </div>

        <!-- Form Manager -->
        <div class="validation-form" *ngIf="!isRHOrAdmin() && validatingId() === a.id">
          <textarea [(ngModel)]="commentaire" placeholder="Commentaire..." rows="2"></textarea>
          <div class="vf-actions">
            <button class="btn btn-danger" (click)="donnerAvis(a.id, false)" [disabled]="valLoading()">
              <span [innerHTML]="ic.thumbDown | safeHtml"></span> Défavorable
            </button>
            <button class="btn btn-primary" (click)="donnerAvis(a.id, true)" [disabled]="valLoading()">
              <span *ngIf="!valLoading()"><span [innerHTML]="ic.thumbUp | safeHtml"></span> Favorable</span>
              <span *ngIf="valLoading()" class="spinner"></span>
            </button>
            <button class="btn btn-outline" (click)="validatingId.set(null)">Annuler</button>
          </div>
        </div>

        <!-- Form RH -->
        <div class="validation-form rh-form" *ngIf="isRHOrAdmin() && validatingId() === a.id">
          <div class="rh-grid">
            <div class="form-group"><label>Montant accordé (DT)</label><input type="number" [(ngModel)]="rhMontant" [placeholder]="a.montantDemande" step="0.001" /></div>
            <div class="form-group"><label>Date d'effet</label><input type="datetime-local" [(ngModel)]="rhDateEffet" /></div>
            <div class="form-group" style="grid-column:span 2"><label>Commentaire RH</label><textarea [(ngModel)]="commentaire" placeholder="Décision et justification..." rows="2"></textarea></div>
          </div>
          <div class="vf-actions">
            <button class="btn btn-danger" (click)="traiterRH(a.id, false)" [disabled]="valLoading()">
              <span [innerHTML]="ic.x | safeHtml"></span> Rejeter
            </button>
            <button class="btn btn-primary" (click)="traiterRH(a.id, true)" [disabled]="valLoading()">
              <span *ngIf="!valLoading()"><span [innerHTML]="ic.check | safeHtml"></span> Valider</span>
              <span *ngIf="valLoading()" class="spinner"></span>
            </button>
            <button class="btn btn-outline" (click)="validatingId.set(null)">Annuler</button>
          </div>
        </div>

        <div class="ac-actions" *ngIf="validatingId() !== a.id">
          <button class="btn btn-primary" (click)="validatingId.set(a.id); initValidation(a)">
            <span [innerHTML]="ic.note | safeHtml"></span> Traiter
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
        <input type="text" placeholder="Rechercher..." (input)="rhSearch.set($any($event.target).value)" class="search-inp" />
      </div>
      <select class="filter-select" (change)="rhFilterStatut.set($any($event.target).value)">
        <option value="">Tous les statuts</option>
        <option value="EN_ATTENTE_MANAGER">Attente Manager</option>
        <option value="EN_ATTENTE_RH">Attente RH</option>
        <option value="VALIDEE">Validée</option>
        <option value="REJETEE">Rejetée</option>
        <option value="ANNULEE">Annulée</option>
      </select>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Employé</th><th>Salaire actuel</th><th>Demande</th>
              <th>Accordé</th><th>%</th><th>Avis Manager</th><th>Statut</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of getFiltered()">
              <td>
                <div class="user-cell">
                  <div class="emp-av">{{ getInitiales(a) }}</div>
                  <div><strong>{{ a.employeNom }} {{ a.employePrenom }}</strong><small>{{ a.employePoste }}</small></div>
                </div>
              </td>
              <td>{{ a.salaireActuel | number:'1.3-3' }} DT</td>
              <td class="montant-cell">+{{ a.montantDemande | number:'1.3-3' }} DT</td>
              <td>
                <span *ngIf="a.montantAccorde" class="montant-ok">+{{ a.montantAccorde | number:'1.3-3' }} DT</span>
                <span *ngIf="!a.montantAccorde" class="text-muted">—</span>
              </td>
              <td>
                <span *ngIf="a.pourcentageAugmentation" class="pct-badge">+{{ a.pourcentageAugmentation }}%</span>
              </td>
              <td>
                <span *ngIf="a.avisManager === true" class="avis-ok">
                  <span [innerHTML]="ic.thumbUp | safeHtml"></span> Favorable
                </span>
                <span *ngIf="a.avisManager === false" class="avis-ko">
                  <span [innerHTML]="ic.thumbDown | safeHtml"></span> Défavorable
                </span>
                <span *ngIf="a.avisManager === null" class="text-muted">—</span>
              </td>
              <td><span class="badge" [class]="getBadgeClass(a.statut)">{{ getStatutLabel(a.statut) }}</span></td>
              <td class="date-cell">{{ a.createdAt | date:'dd/MM/yyyy' }}</td>
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
      --c-text:      #1a202c;
      --c-muted:     #718096;
      --c-gray-100:  #eef0f3;
      --c-gray-200:  #e2e8f0;
      --r:     12px;
      --r-lg:  16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .augmentations { max-width: 100%; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
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
    .aug-list { display: flex; flex-direction: column; gap: 16px; }
    .aug-card { background: white; border-radius: var(--r-lg); padding: 20px 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; &:hover { box-shadow: var(--sh-md); transform: translateY(-2px); } &.validation-card { cursor: default; &:hover { transform: none; } } }
    .ac-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--c-teal); border-radius: 4px 0 0 4px; }
    .statut-validee  .ac-accent { background: var(--c-green); }
    .statut-rejetee  .ac-accent { background: var(--c-red); }
    .statut-annulee  .ac-accent { background: var(--c-gray-200); }
    .statut-attente  .ac-accent { background: var(--c-amber); }

    .ac-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
    .ac-montant { display: flex; align-items: baseline; gap: 4px; }
    .am-value { font-size: 30px; font-weight: 800; color: var(--c-green); line-height: 1; }
    .am-unit  { font-size: 16px; color: var(--c-green); font-weight: 700; }
    .am-pct   { font-size: 14px; color: var(--c-muted); margin-left: 4px; }

    /* ── Salary impact ── */
    .salary-impact { display: flex; align-items: center; gap: 16px; background: var(--c-gray-100); border-radius: var(--r); padding: 14px 18px; margin-bottom: 14px; flex-wrap: wrap; }
    .si-block { display: flex; flex-direction: column; gap: 3px; text-align: center; .si-label { font-size: 10px; color: var(--c-muted); font-weight: 700; text-transform: uppercase; } }
    .si-value { font-size: 15px; font-weight: 700; color: var(--c-text); &.green { color: var(--c-green); } &.teal { color: var(--c-teal); } }
    .si-sep { font-size: 18px; color: var(--c-muted); }

    /* ── Motif ── */
    .ac-motif { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--c-text); padding: 9px 12px; border-left: 3px solid var(--c-teal); background: white; border-radius: 4px; margin-bottom: 14px; line-height: 1.5; }
    .acm-icon { flex-shrink: 0; color: var(--c-teal); margin-top: 1px; svg { display: block; } }

    /* ── Workflow ── */
    .wf-row { display: flex; align-items: center; margin: 14px 0; }
    .wf-step { display: flex; flex-direction: column; align-items: center; gap: 4px; .wf-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--c-gray-200); border: 2px solid var(--c-gray-200); transition: all 0.3s; } span { font-size: 10px; font-weight: 600; color: var(--c-muted); white-space: nowrap; display: flex; align-items: center; gap: 3px; } &.done .wf-dot { background: var(--c-green); border-color: var(--c-green); } &.done span { color: var(--c-green); } &.active .wf-dot { background: var(--c-amber); border-color: var(--c-amber); animation: pulse 1.5s infinite; } &.active span { color: var(--c-amber); } &.rejected .wf-dot { background: var(--c-red); border-color: var(--c-red); } &.favorable span { color: var(--c-green); } &.defavorable span { color: var(--c-amber); } }
    .wf-line { flex: 1; height: 2px; background: var(--c-gray-200); margin-bottom: 14px; &.done { background: var(--c-green); } }
    .wf-avis { display: inline-flex; svg { display: block; width: 11px; height: 11px; } &.green { color: var(--c-green); } &.amber { color: var(--c-amber); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

    /* ── Comments ── */
    .ac-comments { background: var(--c-gray-100); border-radius: var(--r); padding: 12px 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }
    .acc-item { display: flex; gap: 8px; font-size: 13px; color: var(--c-text); }
    .acc-icon { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; margin-top: 1px; color: var(--c-teal); svg { display: block; } }
    .acc-body { flex: 1; }
    .acc-label { font-weight: 700; color: var(--c-teal); margin-right: 5px; }
    .avis-tag { display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; svg { display: block; width: 11px; height: 11px; } &.favorable { background: var(--c-green-lt); color: var(--c-green); } &.defavorable { background: var(--c-amber-lt); color: var(--c-amber); } }

    .ac-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--c-gray-200); }

    /* ── User info ── */
    .user-info { display: flex; align-items: center; gap: 12px; .ui-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; } strong { font-size: 14px; color: var(--c-text); display: block; } .ui-sub { font-size: 11px; color: var(--c-muted); } }

    .avis-info { display: flex; align-items: center; gap: 10px; background: var(--c-gray-100); border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-size: 13px; flex-wrap: wrap; color: var(--c-muted); }
    .avis-val { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; svg { display: block; width: 12px; height: 12px; } &.favorable { color: var(--c-green); } &.defavorable { color: var(--c-amber); } }
    .avis-comment { font-style: italic; color: var(--c-muted); }

    /* ── Validation form ── */
    .validation-form { margin-top: 12px; padding: 14px; background: var(--c-gray-100); border-radius: var(--r); textarea { width: 100%; padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; resize: none; background: white; margin-bottom: 12px; &:focus { border-color: var(--c-teal); } } }
    .vf-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
    .rh-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; label { font-size: 11px; font-weight: 700; color: var(--c-muted); display: block; margin-bottom: 4px; text-transform: uppercase; } input, textarea { width: 100%; padding: 8px 12px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; &:focus { border-color: var(--c-teal); } } }

    /* ── Form card ── */
    .form-layout { display: grid; grid-template-columns: 1fr 270px; gap: 24px; align-items: start; }
    .form-card { background: white; border-radius: 20px; padding: 28px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .fc-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--c-gray-200); }
    .fc-icon { width: 48px; height: 48px; border-radius: 13px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .fc-header h3 { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0 0 4px; }
    .fc-header p { font-size: 12px; color: var(--c-muted); margin: 0; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 18px; label { font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; } }
    .hint { font-size: 10px; color: var(--c-muted); font-weight: 400; text-transform: none; letter-spacing: 0; }
    .error-msg { font-size: 11px; color: var(--c-red); font-weight: 500; }

    .amount-input { display: flex; align-items: center; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); overflow: hidden; transition: border-color 0.2s; &:focus-within { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); } .ai-prefix, .ai-suffix { padding: 12px 14px; background: var(--c-teal-lt); color: var(--c-teal); font-weight: 700; font-size: 14px; flex-shrink: 0; } input { flex: 1; border: none; outline: none; padding: 12px 8px; font-size: 16px; font-weight: 700; color: var(--c-text); &.error { background: var(--c-red-lt); } } }

    textarea { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; resize: vertical; width: 100%; &:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); } &.error { border-color: var(--c-red); } }
    .char-count { text-align: right; font-size: 11px; color: var(--c-muted); margin-top: 4px; }

    /* ── Simulation ── */
    .sim-preview { background: linear-gradient(135deg, var(--c-teal-lt), #d0f4f8); border: 1px solid var(--c-teal); border-radius: var(--r-lg); padding: 16px 20px; margin-bottom: 18px; }
    .sp-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--c-teal); margin-bottom: 14px; svg { display: block; } }
    .sp-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .sp-item { display: flex; flex-direction: column; gap: 3px; text-align: center; span { font-size: 10px; color: var(--c-muted); text-transform: uppercase; font-weight: 600; } strong { font-size: 15px; font-weight: 800; color: var(--c-text); } &.teal strong { color: var(--c-teal); } &.green strong { color: var(--c-green); } }
    .sp-arrow { font-size: 20px; color: var(--c-teal); font-weight: 700; }
    .sp-pct { background: var(--c-green); color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 800; margin-left: auto; }

    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 14px; svg { flex-shrink: 0; display: block; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

    /* ── Tips ── */
    .tips-card { background: white; border-radius: var(--r-lg); padding: 20px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 14px; } }
    .tip-list { display: flex; flex-direction: column; gap: 10px; }
    .tip-item { display: flex; gap: 10px; align-items: flex-start; p { font-size: 12px; color: var(--c-muted); margin: 0; line-height: 1.4; } }
    .tip-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } &.green { background: var(--c-green-lt); color: var(--c-green); } }
    .workflow-info { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--c-gray-200); h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; } }
    .wi-step { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 12px; color: var(--c-text); .wi-num { width: 22px; height: 22px; border-radius: 50%; background: var(--c-teal); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; svg { display: block; width: 12px; height: 12px; } } &.success .wi-num { background: var(--c-green); } }

    /* ── Filters ── */
    .filters-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; cursor: pointer; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-teal); } }
    .search-wrap { position: relative; flex: 1; display: flex; align-items: center; svg { position: absolute; left: 12px; color: var(--c-muted); display: block; pointer-events: none; } }
    .search-inp { width: 100%; padding: 10px 14px 10px 36px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; &:focus { border-color: var(--c-teal); } }

    /* ── Table ── */
    .card { background: white; border-radius: var(--r-lg); padding: 20px 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 20px; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--c-gray-100); border-bottom: 1px solid var(--c-gray-200); &:first-child { border-radius: 8px 0 0 8px; } &:last-child { border-radius: 0 8px 8px 0; } }
    tbody tr { transition: background 0.15s; border-bottom: 1px solid var(--c-gray-100); &:hover { background: var(--c-gray-100); } }
    tbody td { padding: 12px 14px; vertical-align: middle; }
    .date-cell { font-size: 12px; color: var(--c-muted); }
    .user-cell { display: flex; align-items: center; gap: 8px; strong { display: block; } small { font-size: 11px; color: var(--c-muted); } }
    .emp-av { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }
    .montant-cell { color: var(--c-teal); font-weight: 700; }
    .montant-ok   { color: var(--c-green); font-weight: 700; }
    .text-muted   { color: var(--c-muted); font-size: 12px; }
    .avis-ok { display: inline-flex; align-items: center; gap: 4px; color: var(--c-green); font-size: 12px; font-weight: 600; svg { display: block; width: 12px; height: 12px; } }
    .avis-ko { display: inline-flex; align-items: center; gap: 4px; color: var(--c-amber); font-size: 12px; font-weight: 600; svg { display: block; width: 12px; height: 12px; } }
    .pct-badge { background: var(--c-green-lt); color: var(--c-green); padding: 3px 8px; border-radius: 8px; font-size: 12px; font-weight: 700; }

    /* ── Badges ── */
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; svg { display: block; width: 11px; height: 11px; } }
    .badge-success { background: var(--c-green-lt); color: var(--c-green); }
    .badge-danger  { background: var(--c-red-lt);   color: var(--c-red); }
    .badge-warning { background: var(--c-amber-lt); color: var(--c-amber); }
    .badge-gray    { background: var(--c-gray-200); color: var(--c-muted); }

    /* ── Buttons ── */
    .btn { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; svg { display: block; flex-shrink: 0; } &.btn-primary { background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(14,157,175,0.4); } } &.btn-danger { background: var(--c-red-lt); color: var(--c-red); &:hover { background: var(--c-red); color: white; } } &.btn-outline { background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); &:hover { border-color: var(--c-teal); color: var(--c-teal); } } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; } }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-200); }
    .empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; svg { display: block; } &.success-icon { background: var(--c-green-lt); color: var(--c-green); } }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
    .empty-state p { color: var(--c-muted); font-size: 13px; margin-bottom: 20px; }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } &.toast--info { background: var(--c-teal-lt); color: var(--c-teal); } }

    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AugmentationsComponent implements OnInit {

  private augService  = inject(AugmentationService);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  role = this.authService.getRole();
  ic   = IC;

  activeTab     = signal<Tab>('mes-demandes');
  loading       = signal(true);
  actionLoading = signal(false);
  submitLoading = signal(false);
  valLoading    = signal(false);

  mesDemandes = signal<AugmentationSalaire[]>([]);
  enAttente   = signal<AugmentationSalaire[]>([]);
  toutesAug   = signal<AugmentationSalaire[]>([]);
  simulation  = signal<any>(null);

  validatingId   = signal<number | null>(null);
  commentaire    = '';
  rhMontant:     number | null = null;
  rhDateEffet    = '';

  rhSearch       = signal('');
  rhFilterStatut = signal('');

  formError   = signal('');
  formSuccess = signal('');

  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

  augForm = this.fb.group({
    montantDemande: [null, [Validators.required, Validators.min(50)]],
    motif: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    const obs: any = { mes: this.augService.mesDemandes() };
    if (this.isManagerOrAbove()) { obs.attente = this.isRHOrAdmin() ? this.augService.enAttenteRH() : this.augService.enAttenteManager(); }
    if (this.isRHOrAdmin()) { obs.toutes = this.augService.toutes(); }
    forkJoin(obs).subscribe({
      next: (data: any) => { this.mesDemandes.set(data.mes ?? []); if (data.attente) this.enAttente.set(data.attente); if (data.toutes) this.toutesAug.set(data.toutes); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.formError.set(''); this.formSuccess.set(''); }

  onMontantChange(): void {
    const m = this.augForm.get('montantDemande')?.value;
    if (!m || m <= 0) { this.simulation.set(null); return; }
    this.augService.simuler(m).subscribe({ next: (data) => this.simulation.set(data), error: () => this.simulation.set(null) });
  }

  onSubmit(): void {
    if (this.augForm.invalid) { this.augForm.markAllAsTouched(); return; }
    this.submitLoading.set(true); this.formError.set('');
    this.augService.creer({ montantDemande: this.augForm.value.montantDemande!, motif: this.augForm.value.motif! }).subscribe({
      next: (data) => { this.submitLoading.set(false); this.formSuccess.set('Demande soumise avec succès !'); this.mesDemandes.update(d => [data, ...d]); this.augForm.reset(); this.simulation.set(null); setTimeout(() => { this.formSuccess.set(''); this.setTab('mes-demandes'); }, 1500); },
      error: (err) => { this.submitLoading.set(false); this.formError.set(err.error?.message ?? 'Erreur.'); }
    });
  }

  annuler(id: number): void {
    if (!confirm('Annuler cette demande ?')) return;
    this.actionLoading.set(true);
    this.augService.annuler(id).subscribe({
      next: (data) => { this.actionLoading.set(false); this.mesDemandes.update(d => d.map(a => a.id === id ? data : a)); this.showToast('Demande annulée', 'info'); },
      error: () => { this.actionLoading.set(false); this.showToast('Erreur', 'error'); }
    });
  }

  initValidation(a: AugmentationSalaire): void { this.commentaire = ''; this.rhMontant = a.montantDemande; this.rhDateEffet = ''; }

  donnerAvis(id: number, favorable: boolean): void {
    this.valLoading.set(true);
    this.augService.donnerAvis(id, { favorable, commentaire: this.commentaire }).subscribe({
      next: () => { this.valLoading.set(false); this.validatingId.set(null); this.enAttente.update(d => d.filter(a => a.id !== id)); this.showToast(favorable ? 'Avis favorable envoyé !' : 'Avis défavorable envoyé', favorable ? 'success' : 'info'); },
      error: (err) => { this.valLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  traiterRH(id: number, approuve: boolean): void {
    this.valLoading.set(true);
    this.augService.traiter(id, { approuve, montantAccorde: this.rhMontant ?? undefined, dateEffet: this.rhDateEffet || undefined, commentaire: this.commentaire }).subscribe({
      next: (data) => { this.valLoading.set(false); this.validatingId.set(null); this.enAttente.update(d => d.filter(a => a.id !== id)); this.toutesAug.update(d => d.map(a => a.id === id ? data : a)); this.showToast(approuve ? 'Augmentation validée ! Salaire mis à jour' : 'Demande rejetée', approuve ? 'success' : 'error'); },
      error: (err) => { this.valLoading.set(false); this.showToast(err.error?.message ?? 'Erreur', 'error'); }
    });
  }

  getFiltered(): AugmentationSalaire[] {
    return this.toutesAug().filter(a => { const t = this.rhSearch().toLowerCase(); const s = this.rhFilterStatut(); const m = !t || a.employeNom?.toLowerCase().includes(t) || a.employePrenom?.toLowerCase().includes(t); return m && (!s || a.statut === s); });
  }

  isManagerOrAbove(): boolean { return ['MANAGER','RH','ADMIN'].includes(this.role); }
  isRHOrAdmin(): boolean      { return ['RH','ADMIN'].includes(this.role); }
  isInvalid(f: string): boolean { const c = this.augForm.get(f); return !!(c?.invalid && c?.touched); }
  canAnnuler(a: AugmentationSalaire): boolean { return ['EN_ATTENTE_MANAGER','EN_ATTENTE_RH'].includes(a.statut); }
  getInitiales(a: AugmentationSalaire): string { return ((a.employePrenom?.[0] ?? '') + (a.employeNom?.[0] ?? '')).toUpperCase(); }

  getSubtitle(): string {
    const map: Record<string,string> = { EMPLOYE: 'Demandez une augmentation de salaire', MANAGER: 'Donnez votre avis sur les demandes', RH: 'Gérez les demandes d\'augmentation', ADMIN: 'Supervision des augmentations' };
    return map[this.role] ?? '';
  }

  getBadgeClass(s: string): string { if (s === 'VALIDEE') return 'badge badge-success'; if (s === 'REJETEE') return 'badge badge-danger'; if (s === 'ANNULEE') return 'badge badge-gray'; return 'badge badge-warning'; }

  getStatutLabel(s: string): string {
    const map: Record<string,string> = { EN_ATTENTE_MANAGER: 'Attente Manager', EN_ATTENTE_RH: 'Attente RH', VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée' };
    return map[s] ?? s;
  }

  getStatutClass(s: string): string { if (s === 'VALIDEE') return 'statut-validee'; if (s === 'REJETEE') return 'statut-rejetee'; if (s === 'ANNULEE') return 'statut-annulee'; return 'statut-attente'; }

  isWFDone(a: AugmentationSalaire, step: string): boolean {
    const order: Record<string,number> = { soumis: 1, manager: 2, rh: 3 };
    const lvl: Record<string,number> = { EN_ATTENTE_MANAGER: 1, EN_ATTENTE_RH: 2, VALIDEE: 3, REJETEE: 3, ANNULEE: 0 };
    return (lvl[a.statut] ?? 0) > (order[step] ?? 0);
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}