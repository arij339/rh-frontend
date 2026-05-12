import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClient }       from '@angular/common/http';
import { AvanceService }    from '../../../core/services/avance.service';
import { AvanceSalaire }    from '../../../core/models/avance.model';
import { SafeHtmlPipe }     from '../../../shared/pipes/safe-html.pipe';

// ── SVG Icons ──────────────────────────────────────────────────────────
const IC = {
  money:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  check:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  card:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  close:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  search:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  versement:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
};

@Component({
  selector: 'app-rh-avances',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
    <div class="rh-avances-page">

      <!-- Header -->
      <div class="page-header">
        <div class="ph-left">
          <div class="ph-icon">
            <span [innerHTML]="ic.money | safeHtml"></span>
          </div>
          <div>
            <h1>Gestion des Avances</h1>
            <p>Suivi, versements et remboursements des avances sur salaire</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row" *ngIf="!loading()">
        <div class="stat-card" *ngFor="let s of getStats()">
          <span class="sc-value" [class]="s.color">{{ s.value }}</span>
          <span class="sc-label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <div class="search-wrap">
          <span [innerHTML]="ic.search | safeHtml"></span>
          <input type="text" placeholder="Rechercher un employé..."
                 [(ngModel)]="searchText" class="search-inp" />
        </div>
        <select class="filter-select" [(ngModel)]="filterStatut">
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE_RH">En attente RH</option>
          <option value="VALIDEE">Validée</option>
          <option value="EN_COURS">En cours</option>
          <option value="SOLDEE">Soldée</option>
          <option value="REJETEE">Rejetée</option>
        </select>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Chargement des avances...</p>
      </div>

      <!-- Table -->
      <div class="card" *ngIf="!loading()">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Demandé</th>
                <th>Accordé</th>
                <th>Remboursé</th>
                <th>Restant</th>
                <th>Prochaine éch.</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of filtered()" [class.row-soldee]="a.statut === 'SOLDEE'">
                <td>
                  <div class="user-cell">
                    <div class="mini-av">{{ getInit(a) }}</div>
                    <div>
                      <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
                      <small>{{ a.employeDepartement }}</small>
                    </div>
                  </div>
                </td>
                <td><strong>{{ a.montantDemande | number:'1.3-3' }} DT</strong></td>
                <td>
                  <span *ngIf="a.montantAccorde" class="green">{{ a.montantAccorde | number:'1.3-3' }} DT</span>
                  <span *ngIf="!a.montantAccorde" class="text-muted">—</span>
                </td>
                <td>
                  <span *ngIf="a.montantRembourse > 0" class="green">
                    {{ a.montantRembourse | number:'1.3-3' }} DT
                  </span>
                  <span *ngIf="!(a.montantRembourse > 0)" class="text-muted">—</span>
                </td>
                <td>
                  <span *ngIf="a.montantRestant && a.montantRestant > 0" class="amber">
                    <strong>{{ a.montantRestant | number:'1.3-3' }} DT</strong>
                  </span>
                  <span *ngIf="(a.montantRestant || 0) <= 0 && a.statut === 'SOLDEE'" class="green">
                    Soldée ✓
                  </span>
                  <span *ngIf="!a.montantAccorde" class="text-muted">—</span>
                </td>
                <td>
                  <span *ngIf="a.prochaineEcheance" class="badge badge-warning">
                    {{ a.prochaineEcheance | date:'dd/MM/yyyy' }}
                  </span>
                  <span *ngIf="!a.prochaineEcheance" class="text-muted">—</span>
                </td>
                <td>
                  <span class="badge" [class]="getBadgeClass(a.statut)">
                    {{ getStatutLabel(a.statut) }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <!-- Traiter la demande -->
                    <button class="act-btn primary" *ngIf="a.statut === 'EN_ATTENTE_RH'"
                            title="Valider ou rejeter la demande"
                            (click)="ouvrirTraitement(a)"
                            [disabled]="actionLoading()">
                      <span [innerHTML]="ic.check | safeHtml"></span>
                      Traiter
                    </button>
                    <!-- Enregistrer versement -->
                    <button class="act-btn" *ngIf="a.statut === 'VALIDEE'"
                            title="Enregistrer le versement"
                            (click)="enregistrerVersement(a)"
                            [disabled]="actionLoading()">
                      <span [innerHTML]="ic.versement | safeHtml"></span>
                      Verser
                    </button>
                    <!-- Gérer l'échéancier -->
                    <button class="act-btn teal" *ngIf="a.statut === 'EN_COURS'"
                            title="Gérer les remboursements"
                            (click)="ouvrirEcheancier(a)">
                      <span [innerHTML]="ic.calendar | safeHtml"></span>
                      Échéancier
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filtered().length === 0">
                <td colspan="8" class="empty-row">Aucune avance trouvée</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>{{ filtered().length }} / {{ avances().length }} avance(s)</span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL TRAITEMENT — Valider / Rejeter une demande EN_ATTENTE_RH
         ══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" *ngIf="avanceATraiter()"
         (click)="avanceATraiter.set(null)">
      <div class="modal traitement-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>Traiter la demande d'avance</h3>
            <p class="modal-sub">
              {{ avanceATraiter()?.employePrenom }} {{ avanceATraiter()?.employeNom }}
              — {{ avanceATraiter()?.montantDemande | number:'1.3-3' }} DT
              en {{ avanceATraiter()?.nombreMensualites }} mensualité(s)
            </p>
          </div>
          <button class="modal-close" (click)="avanceATraiter.set(null)">✕</button>
        </div>
        <div class="modal-body">
          <div class="traitement-info">
            <div class="ti-row">
              <span class="ti-label">Motif :</span>
              <span>{{ avanceATraiter()?.motif || '—' }}</span>
            </div>
            <div class="ti-row">
              <span class="ti-label">Mensualité :</span>
              <span>{{ avanceATraiter()?.mensualite | number:'1.3-3' }} DT / mois</span>
            </div>
          </div>
          <div class="traitement-form">
            <label class="tf-label">Montant accordé (DT)</label>
            <input type="number" class="tf-input" [(ngModel)]="traitMontant"
                   [placeholder]="avanceATraiter()?.montantDemande?.toString() ?? ''"/>
            <label class="tf-label" style="margin-top:12px">Nombre de mensualités</label>
            <input type="number" class="tf-input" [(ngModel)]="traitMensualites"
                   [placeholder]="avanceATraiter()?.nombreMensualites?.toString() ?? ''"/>
            <label class="tf-label" style="margin-top:12px">Commentaire *</label>
            <textarea class="tf-input tf-textarea" [(ngModel)]="traitCommentaire"
                      placeholder="Motif de la décision..." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" (click)="traiter(false)" [disabled]="actionLoading()">
            <span *ngIf="!actionLoading()">✕ Rejeter</span>
            <span *ngIf="actionLoading()" class="spinner-sm"></span>
          </button>
          <button class="btn btn-success" (click)="traiter(true)" [disabled]="actionLoading()">
            <span *ngIf="!actionLoading()">✓ Valider</span>
            <span *ngIf="actionLoading()" class="spinner-sm"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL ÉCHÉANCIER — Marquer les échéances comme payées
         ══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" *ngIf="avanceSelectionnee()"
         (click)="avanceSelectionnee.set(null)">
      <div class="modal echeancier-modal" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <div>
            <h3>
              <span [innerHTML]="ic.calendar | safeHtml"></span>
              Échéancier de remboursement
            </h3>
            <p class="modal-sub">
              {{ avanceSelectionnee()?.employePrenom }}
              {{ avanceSelectionnee()?.employeNom }}
            </p>
          </div>
          <button class="modal-close" (click)="avanceSelectionnee.set(null)"
                  [innerHTML]="ic.close | safeHtml"></button>
        </div>

        <div class="modal-body">

          <!-- Résumé financier -->
          <div class="ech-summary">
            <div class="ech-sum-item">
              <span>Total accordé</span>
              <strong>{{ avanceSelectionnee()?.montantAccorde | number:'1.3-3' }} DT</strong>
            </div>
            <div class="ech-sum-item">
              <span>Remboursé</span>
              <strong class="green">
                {{ avanceSelectionnee()?.montantRembourse | number:'1.3-3' }} DT
              </strong>
            </div>
            <div class="ech-sum-item">
              <span>Restant</span>
              <strong class="amber">
                {{ avanceSelectionnee()?.montantRestant | number:'1.3-3' }} DT
              </strong>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="ech-progress">
            <div class="ech-bar">
              <div class="ech-fill"
                   [style.width]="getPercent(avanceSelectionnee()!) + '%'">
              </div>
            </div>
            <span>{{ getPercent(avanceSelectionnee()!) }}% remboursé</span>
          </div>

          <!-- Table échéances -->
          <table class="ech-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of avanceSelectionnee()!.echeancier"
                  [class.ech-paye]="e.paye"
                  [class.ech-next]="isProchaine(e)">
                <td><strong>{{ e.numeroMensualite }}</strong></td>
                <td>{{ e.dateEcheance | date:'dd/MM/yyyy' }}</td>
                <td><strong>{{ e.montantEcheance | number:'1.3-3' }} DT</strong></td>
                <td>
                  <span *ngIf="e.paye" class="badge badge-success">
                    <span [innerHTML]="ic.check | safeHtml"></span>
                    Payé le {{ e.datePaiement | date:'dd/MM/yyyy' }}
                  </span>
                  <span *ngIf="!e.paye && isProchaine(e)" class="badge badge-warning">
                    Prochaine
                  </span>
                  <span *ngIf="!e.paye && !isProchaine(e)" class="badge badge-gray">
                    En attente
                  </span>
                </td>
                <td>
                  <!-- ✅ Bouton "Marquer comme payée" -->
                  <button class="btn btn-primary btn-sm"
                          *ngIf="!e.paye"
                          (click)="marquerPayee(avanceSelectionnee()!.id, e.id)"
                          [disabled]="rembLoading()">
                    <span *ngIf="!rembLoading()">
                      <span [innerHTML]="ic.card | safeHtml"></span>
                      Marquer payée
                    </span>
                    <span *ngIf="rembLoading()" class="spinner-sm"></span>
                  </button>
                  <span *ngIf="e.paye" class="text-muted" style="font-size:12px">—</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Message info -->
          <div class="info-banner" style="margin-top:16px">
            <span style="font-size:13px;color:var(--text-light)">
              💡 En marquant une échéance comme payée, l'employé reçoit
              automatiquement une notification et un email de confirmation
              avec le montant restant à rembourser.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toast().show" [class]="'toast-' + toast().type">
      {{ toast().message }}
    </div>
  `,
  styles: [`
    .rh-avances-page { padding: 24px; max-width: 1300px; margin: 0 auto; }

    /* Header */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }
    .ph-left { display: flex; align-items: center; gap: 16px; }
    .ph-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .ph-left h1 { font-size: 22px; font-weight: 700; margin: 0; }
    .ph-left p  { font-size: 13px; color: var(--text-light); margin: 4px 0 0; }

    /* Stats */
    .stats-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card {
      flex: 1; min-width: 140px; background: white; border-radius: 12px;
      padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06);
      display: flex; flex-direction: column; gap: 4px;
    }
    .sc-value { font-size: 22px; font-weight: 700; }
    .sc-label { font-size: 12px; color: var(--text-light); }
    .green  { color: #22c55e; }
    .amber  { color: #f59e0b; }
    .red    { color: #ef4444; }
    .blue   { color: var(--primary); }

    /* Filters */
    .filters-bar {
      display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1; min-width: 220px; display: flex; align-items: center;
      gap: 8px; background: white; border: 1px solid var(--border);
      border-radius: 8px; padding: 0 12px; height: 40px;
    }
    .search-inp { border: none; outline: none; flex: 1; font-size: 14px; }
    .filter-select {
      height: 40px; border: 1px solid var(--border); border-radius: 8px;
      padding: 0 12px; font-size: 14px; background: white; outline: none;
    }

    /* Table */
    .card {
      background: white; border-radius: 14px;
      box-shadow: 0 1px 6px rgba(0,0,0,.07); overflow: hidden;
    }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 12px 16px; text-align: left; font-size: 11px;
      text-transform: uppercase; letter-spacing: .5px;
      color: var(--text-light); background: var(--bg-light);
      border-bottom: 1px solid var(--border);
    }
    td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    tr:last-child td { border-bottom: none; }
    tr.row-soldee td { opacity: .65; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .mini-av {
      width: 34px; height: 34px; border-radius: 50%;
      background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .user-cell strong { display: block; font-size: 14px; }
    .user-cell small { color: var(--text-light); font-size: 12px; }

    .text-muted { color: var(--text-light); font-size: 13px; }
    .empty-row { text-align: center; padding: 40px; color: var(--text-light); }
    .table-foot {
      padding: 10px 16px; font-size: 12px; color: var(--text-light);
      border-top: 1px solid var(--border); text-align: right;
    }

    /* Action buttons */
    .action-btns { display: flex; gap: 8px; }
    .act-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 7px; font-size: 13px;
      font-weight: 500; cursor: pointer; border: none;
      background: var(--primary); color: white; transition: opacity .15s;
    }
    .act-btn:hover { opacity: .85; }
    .act-btn:disabled { opacity: .4; cursor: not-allowed; }
    .act-btn.teal { background: #0d9488; }

    /* Badges */
    .badge {
      padding: 3px 9px; border-radius: 20px; font-size: 11px;
      font-weight: 600; display: inline-flex; align-items: center; gap: 4px;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .badge-gray    { background: #f3f4f6; color: #6b7280; }
    .badge-en_attente_rh { background: #dbeafe; color: #1d4ed8; }
    .badge-validee       { background: #d1fae5; color: #065f46; }
    .badge-en_cours      { background: #e0f2fe; color: #0369a1; }
    .badge-soldee        { background: #f0fdf4; color: #15803d; }
    .badge-rejetee       { background: #fee2e2; color: #991b1b; }

    /* Loading */
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 60px; color: var(--text-light);
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
    }
    .modal {
      background: white; border-radius: 18px; width: 620px; max-width: 95vw;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.2);
    }
    .echeancier-modal  { width: 700px; }
    .traitement-modal  { width: 480px; }
    .traitement-info   { background: var(--surface); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
    .ti-row            { display: flex; gap: 8px; font-size: 13px; margin-bottom: 6px; }
    .ti-label          { font-weight: 600; color: var(--text-secondary); min-width: 80px; }
    .traitement-form   { display: flex; flex-direction: column; }
    .tf-label          { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
    .tf-input          { border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 14px; outline: none; width: 100%; box-sizing: border-box; }
    .tf-input:focus    { border-color: var(--primary); }
    .tf-textarea       { resize: vertical; min-height: 72px; }
    .modal-footer      { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border); }
    .btn               { padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-success       { background: #22c55e; color: white; }
    .btn-danger        { background: #ef4444; color: white; }
    .btn-success:hover { background: #16a34a; }
    .btn-danger:hover  { background: #dc2626; }
    .act-btn.primary   { background: var(--primary); color: white; border-color: var(--primary); }
    .act-btn.primary:hover { filter: brightness(1.1); }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 24px 0; gap: 16px;
    }
    .modal-header h3 {
      font-size: 18px; font-weight: 700; margin: 0;
      display: flex; align-items: center; gap: 8px;
    }
    .modal-sub { font-size: 14px; color: var(--text-light); margin: 4px 0 0; }
    .modal-close {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-body { padding: 20px 24px 24px; }

    /* Echéancier */
    .ech-summary {
      display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
    }
    .ech-sum-item {
      flex: 1; background: #f8fafc; border-radius: 10px;
      padding: 12px 16px; min-width: 140px;
    }
    .ech-sum-item span { display: block; font-size: 12px; color: var(--text-light); }
    .ech-sum-item strong { font-size: 16px; }

    .ech-progress { margin-bottom: 20px; }
    .ech-bar {
      height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;
      margin-bottom: 6px;
    }
    .ech-fill {
      height: 100%; background: var(--primary);
      border-radius: 4px; transition: width .5s ease;
    }
    .ech-progress span { font-size: 12px; color: var(--text-light); }

    .ech-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .ech-table th {
      padding: 10px 12px; background: #f8fafc; font-size: 11px;
      text-transform: uppercase; color: var(--text-light);
    }
    .ech-table td { padding: 12px 12px; border-bottom: 1px solid #f0f0f0; }
    .ech-table tr:last-child td { border-bottom: none; }
    .ech-paye td { background: #f0fdf4; }
    .ech-next td { background: #fffbeb; }

    .btn-sm { padding: 5px 12px; font-size: 12px; }
    .btn { padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; font-weight: 500; }
    .btn-primary { background: var(--primary); color: white; display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary:disabled { opacity: .4; cursor: not-allowed; }

    .info-banner {
      background: #f0f9ff; border: 1px solid #bae6fd;
      border-radius: 8px; padding: 12px 16px;
    }

    /* Spinner */
    .spinner {
      width: 28px; height: 28px; border: 3px solid #e5e7eb;
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    .spinner-sm {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white; border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      padding: 14px 20px; border-radius: 12px; font-size: 14px;
      font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,.15);
      animation: slideUp .3s ease;
    }
    .toast-success { background: #22c55e; color: white; }
    .toast-error   { background: #ef4444; color: white; }
    .toast-info    { background: var(--primary); color: white; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class RhAvancesComponent implements OnInit {

  private avanceService = inject(AvanceService);
  private http          = inject(HttpClient);
  private API           = '/api';

  ic = IC;

  // ── Signals ──────────────────────────────────────────────────────────
  loading            = signal(true);
  actionLoading      = signal(false);
  rembLoading        = signal(false);
  avances            = signal<AvanceSalaire[]>([]);
  avanceSelectionnee = signal<AvanceSalaire | null>(null);
  avanceATraiter     = signal<AvanceSalaire | null>(null);
  statsMap           = signal<Record<string, number>>({});
  toast              = signal<{show:boolean; message:string; type:string}>(
    { show: false, message: '', type: 'success' }
  );

  // Formulaire traitement
  traitMontant:     number | null = null;
  traitMensualites: number | null = null;
  traitCommentaire: string = '';

  // ── Filtres ──────────────────────────────────────────────────────────
  searchText   = '';
  filterStatut = '';

  // ─────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.avanceService.getToutesAvances().subscribe({
      next: (data) => {
        this.avances.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Erreur lors du chargement', 'error');
      }
    });

    this.avanceService.getStatistiques().subscribe({
      next: (s) => this.statsMap.set(s),
      error: () => {}
    });
  }

  // ── Filtrage ─────────────────────────────────────────────────────────
  filtered(): AvanceSalaire[] {
    return this.avances().filter(a => {
      const txt = this.searchText.toLowerCase();
      const matchSearch = !txt ||
        (a.employeNom + ' ' + a.employePrenom).toLowerCase().includes(txt) ||
        (a.employeDepartement ?? '').toLowerCase().includes(txt);
      const matchStatut = !this.filterStatut || a.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────

  /** Enregistrer le versement initial (VALIDEE → EN_COURS) */
  enregistrerVersement(a: AvanceSalaire): void {
    if (!confirm(`Confirmer le versement de ${a.montantAccorde?.toFixed(3)} DT à ${a.employePrenom} ${a.employeNom} ?`)) return;
    this.actionLoading.set(true);
    this.avanceService.enregistrerVersement(a.id).subscribe({
      next: (updated) => {
        this.actionLoading.set(false);
        this.avances.update(list => list.map(x => x.id === a.id ? updated : x));
        this.showToast('Versement enregistré. L\'employé a été notifié.', 'success');
      },
      error: () => {
        this.actionLoading.set(false);
        this.showToast('Erreur lors du versement', 'error');
      }
    });
  }

  /** Ouvrir la modal de traitement (validation/rejet) */
  ouvrirTraitement(a: AvanceSalaire): void {
    this.traitMontant     = a.montantDemande;
    this.traitMensualites = a.nombreMensualites;
    this.traitCommentaire = '';
    this.avanceATraiter.set(a);
  }

  /** Valider ou rejeter une demande EN_ATTENTE_RH */
  traiter(approuve: boolean): void {
    const a = this.avanceATraiter();
    if (!a) return;
    if (!this.traitCommentaire.trim()) {
      this.showToast('Le commentaire est obligatoire.', 'error');
      return;
    }
    this.actionLoading.set(true);
    this.avanceService.traiter(a.id, {
      approuve,
      montantAccorde:    approuve ? (this.traitMontant    ?? a.montantDemande)    : undefined,
      nombreMensualites: approuve ? (this.traitMensualites ?? a.nombreMensualites) : undefined,
      commentaire: this.traitCommentaire
    }).subscribe({
      next: (updated) => {
        this.actionLoading.set(false);
        this.avanceATraiter.set(null);
        this.avances.update(list => list.map(x => x.id === a.id ? updated : x));
        // Refresh stats
        this.avanceService.getStatistiques().subscribe({ next: s => this.statsMap.set(s) });
        this.showToast(
          approuve ? `✅ Avance validée — ${updated.montantAccorde?.toFixed(3)} DT accordés.`
                   : '❌ Demande rejetée. L\'employé a été notifié.',
          approuve ? 'success' : 'info'
        );
      },
      error: (err: any) => {
        this.actionLoading.set(false);
        this.showToast(err?.error?.message ?? 'Erreur lors du traitement', 'error');
      }
    });
  }

  /** Ouvrir la modal échéancier */
  ouvrirEcheancier(a: AvanceSalaire): void {
    this.avanceSelectionnee.set(a);
  }

  /**
   * Marquer une échéance comme payée.
   * ✅ Le backend envoie automatiquement une notification + email à l'employé.
   */
  marquerPayee(avanceId: number, echeanceId: number): void {
    this.rembLoading.set(true);
    this.avanceService.enregistrerRemboursement(avanceId, echeanceId).subscribe({
      next: (updated) => {
        this.rembLoading.set(false);
        // Mettre à jour la liste + la modal
        this.avances.update(list => list.map(x => x.id === avanceId ? updated : x));
        this.avanceSelectionnee.set(updated);

        const msg = updated.statut === 'SOLDEE'
          ? '🎉 Avance entièrement soldée ! L\'employé a été notifié.'
          : '✅ Échéance marquée payée. L\'employé a reçu un email de confirmation.';
        this.showToast(msg, 'success');
      },
      error: (err: any) => {
  this.rembLoading.set(false);
  this.showToast(err?.error?.message ?? 'Erreur lors du remboursement', 'error');
}
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  getInit(a: AvanceSalaire): string {
    return ((a.employeNom?.[0] ?? '') + (a.employePrenom?.[0] ?? '')).toUpperCase();
  }

  isProchaine(e: any): boolean {
    const av = this.avanceSelectionnee();
    if (!av?.prochaineEcheance) return false;
    return e.dateEcheance === av.prochaineEcheance ||
      new Date(e.dateEcheance).toDateString() ===
      new Date(av.prochaineEcheance).toDateString();
  }

  getPercent(a: AvanceSalaire): number {
    if (!a.montantAccorde || a.montantAccorde === 0) return 0;
    return Math.round(((a.montantRembourse ?? 0) / a.montantAccorde) * 100);
  }

  getStats(): any[] {
    const s = this.statsMap();
    // Les clés correspondent exactement à ce que retourne le backend
    const montantTotal = this.avances()
      .filter(a => a.statut === 'EN_COURS' || a.statut === 'VALIDEE')
      .reduce((sum, a) => sum + (a.montantAccorde ?? 0), 0);
    return [
      { label: 'En attente RH',  value: s['EN_ATTENTE_RH'] ?? 0,               color: 'blue'  },
      { label: 'En cours',        value: s['EN_COURS']      ?? 0,               color: 'amber' },
      { label: 'Montant total',   value: montantTotal.toFixed(0) + ' DT',       color: 'green' },
      { label: 'Soldées',         value: s['SOLDEE']        ?? 0,               color: 'green' },
    ];
  }

  getBadgeClass(statut: string): string {
    return 'badge-' + (statut ?? '').toLowerCase().replace(/_/g, '_');
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE_RH: 'Att. RH',
      VALIDEE:       'Validée',
      EN_COURS:      'En cours',
      SOLDEE:        'Soldée',
      REJETEE:       'Rejetée',
      ANNULEE:       'Annulée',
    };
    return map[statut] ?? statut;
  }

  private showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 4000);
  }
}
