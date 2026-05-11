// src/app/modules/rh/rh-conges/rh-conges.component.ts

import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rh-conges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="rh-conges">

    <!-- ══════════ HEADER ══════════ -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
          </svg>
        </div>
        <div class="ph-text">
          <h1>Gestion des Congés</h1>
          <p>Historique, soldes et administration des congés</p>
        </div>
      </div>
      <div class="ph-right">
        <div class="ph-badge">
          <div class="pulse-dot"></div>
          Synchronisé
        </div>
        <button class="btn-correction-header" (click)="openCorrection()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Corriger / Ajouter
        </button>
      </div>
    </div>

    <!-- ══════════ STATS ══════════ -->
    <div class="stats-row">
      <div class="stat-card" style="--d:0ms">
        <div class="sc-icon primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="sc-body">
          <span class="sc-val">{{ stats()[0]?.val ?? 0 }}</span>
          <span class="sc-label">Total demandes</span>
        </div>
        <div class="sc-trend up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
      </div>

      <div class="stat-card" style="--d:80ms">
        <div class="sc-icon success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="sc-body">
          <span class="sc-val">{{ stats()[1]?.val ?? 0 }}</span>
          <span class="sc-label">Validés ce mois</span>
        </div>
        <div class="sc-trend up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
      </div>

      <div class="stat-card" style="--d:160ms">
        <div class="sc-icon warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="sc-body">
          <span class="sc-val">{{ stats()[2]?.val ?? 0 }}</span>
          <span class="sc-label">En attente RH</span>
        </div>
        <div class="sc-trend neutral">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>

      <div class="stat-card" style="--d:240ms">
        <div class="sc-icon info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="sc-body">
          <span class="sc-val">{{ stats()[3]?.val ?? 0 }}</span>
          <span class="sc-label">Absents aujourd'hui</span>
        </div>
        <div class="sc-trend up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ══════════ ONGLETS ══════════ -->
    <div class="view-tabs">
      <button class="vt-btn" [class.active]="view() === 'liste'"
              (click)="view.set('liste')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="8"  y1="6"  x2="21" y2="6"/>
          <line x1="8"  y1="12" x2="21" y2="12"/>
          <line x1="8"  y1="18" x2="21" y2="18"/>
          <line x1="3"  y1="6"  x2="3.01" y2="6"/>
          <line x1="3"  y1="12" x2="3.01" y2="12"/>
          <line x1="3"  y1="18" x2="3.01" y2="18"/>
        </svg>
        Liste des demandes
      </button>
      <button class="vt-btn" [class.active]="view() === 'soldes'"
              (click)="view.set('soldes')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        Soldes par employé
      </button>
      <button class="vt-btn" [class.active]="view() === 'calendrier'"
              (click)="view.set('calendrier')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        Calendrier
      </button>
      <div class="vt-slider" [style.left.%]="
        view() === 'liste' ? 0 : view() === 'soldes' ? 33.33 : 66.66">
      </div>
    </div>

    <!-- ═══════════════════ VUE LISTE ═══════════════════ -->
    <div *ngIf="view() === 'liste'" class="view-panel">

      <div class="filters-bar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Rechercher un employé..."
                 [(ngModel)]="search"
                 (input)="applyFilter()" />
        </div>

        <div class="select-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"
               class="select-icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <select [(ngModel)]="statutFilter" (change)="applyFilter()">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE_MANAGER">Att. Manager</option>
            <option value="EN_ATTENTE_RH">Att. RH</option>
            <option value="VALIDEE">Validé</option>
            <option value="REJETEE">Refusé</option>
          </select>
        </div>

        <div class="select-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"
               class="select-icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <select [(ngModel)]="typeFilter" (change)="applyFilter()">
            <option value="">Tous les types</option>
            <option value="ANNUEL">Annuel</option>
            <option value="MALADIE">Maladie</option>
            <option value="EXCEPTIONNEL">Exceptionnel</option>
            <option value="SANS_SOLDE">Sans solde</option>
          </select>
        </div>
      </div>

      <div class="table-card">
        <table class="pro-table">
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
            <tr *ngFor="let c of filteredConges(); let i = index"
                [style.animation-delay]="(i * 40) + 'ms'"
                class="tr-anim">
              <td>
                <div class="user-cell">
                  <div class="uc-av">
                    {{ getInit(c.employePrenom, c.employeNom) }}
                  </div>
                  <div>
                    <strong>{{ c.employePrenom }} {{ c.employeNom }}</strong>
                    <small>{{ c.employeDepartement }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="type-badge"
                      [class]="'tb-' + c.typeConge?.toLowerCase()">
                  {{ c.typeConge }}
                </span>
              </td>
              <td>
                <div class="period-cell">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ c.dateDebut | date:'dd/MM' }}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                  {{ c.dateFin | date:'dd/MM/yyyy' }}
                </div>
              </td>
              <td>
                <div class="jours-pill">
                  {{ calcJours(c) }}<span>j</span>
                </div>
              </td>
              <td>
                <div class="statut-badge" [class]="getStatutClass(c.statut)">
                  <div class="sb-dot"></div>
                  {{ getStatutLabel(c.statut) }}
                </div>
              </td>
              <td>
                <div class="act-row">
                  <!-- Modifier : toujours disponible -->
                  <button class="act-btn edit-btn"
                          title="Modifier ce congé"
                          (click)="openModification(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <!-- Annuler : uniquement si VALIDEE et date de début pas encore arrivée -->
                  <button class="act-btn cancel-btn"
                          title="Annuler ce congé validé"
                          *ngIf="c.statut === 'VALIDEE' && !congeEstCommence(c)"
                          (click)="demanderAnnulation(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </button>
                  <!-- Historique -->
                  <button class="act-btn hist-btn"
                          title="Voir historique"
                          (click)="voirHistorique(c.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </button>
                  <!-- Voir détail -->
                  <button class="act-btn view-btn" title="Voir détail" (click)="ouvrirDetail(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredConges().length === 0">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <div class="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.4"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <p>Aucune demande trouvée</p>
                  <span>Modifiez vos filtres pour voir plus de résultats</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-foot">
          <span class="tf-count">
            <strong>{{ filteredConges().length }}</strong>
            / {{ conges().length }} demande(s)
          </span>
        </div>
      </div>

      <!-- ── Panneau historique ── -->
      <div class="historique-panel" *ngIf="selectedCongeId() !== null">
        <div class="hist-header">
          <div class="hist-title-row">
            <div class="hist-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h4>Historique des modifications — Congé #{{ selectedCongeId() }}</h4>
          </div>
          <button class="hist-close" (click)="historique.set([]); selectedCongeId.set(null)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="hist-timeline">
          <!-- état chargement -->
          <div *ngIf="loadingHist()" style="padding:20px;text-align:center;color:var(--text-light);font-size:13px">
            Chargement…
          </div>
          <!-- état vide -->
          <div *ngIf="!loadingHist() && historique().length === 0"
               style="padding:20px;text-align:center;color:var(--text-light);font-size:13px">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                 style="opacity:.35;display:block;margin:0 auto 8px">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Aucun historique enregistré pour ce congé.
          </div>
          <!-- items -->
          <div class="hist-item" *ngFor="let h of historique()">
            <div class="hist-line"></div>
            <div class="hist-dot" [class]="'hd-' + h.action?.toLowerCase()"></div>
            <div class="hist-content">
              <div class="hist-top">
                <span class="hist-action" [class]="'ha-' + h.action?.toLowerCase()">
                  {{ h.action }}
                </span>
                <span class="hist-par">par <strong>{{ h.modifiePar }}</strong></span>
                <span class="hist-date">{{ h.date | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="hist-values" *ngIf="h.anciennesValeurs">
                <div class="hv-old">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Avant : {{ h.anciennesValeurs }}
                </div>
                <div class="hv-new">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Après : {{ h.nouvellesValeurs }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════ VUE SOLDES ═══════════════════ -->
    <div *ngIf="view() === 'soldes'" class="view-panel">

      <div class="search-box" style="margin-bottom:16px; max-width:340px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Rechercher un employé..."
               [(ngModel)]="soldeSearch" />
      </div>

      <div class="table-card">
        <table class="pro-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Département</th>
              <th>
                <span style="color:var(--primary)">🏖</span> Annuel
              </th>
              <th>
                <span style="color:#e67e22">🏥</span> Maladie
              </th>
              <th>
                <span style="color:#8e44ad">⭐</span> Exceptionnel
              </th>
              <th>Ajustement (annuel)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of getFilteredEmployes(); let i = index"
                [style.animation-delay]="(i * 40) + 'ms'"
                class="tr-anim">
              <td>
                <div class="user-cell">
                  <div class="uc-av">{{ getInit(e.prenom, e.nom) }}</div>
                  <div>
                    <strong>{{ e.prenom }} {{ e.nom }}</strong>
                    <small>{{ e.poste }}</small>
                  </div>
                </div>
              </td>
              <td><span class="dept-tag">{{ e.departement }}</span></td>

              <!-- Solde Annuel -->
              <td>
                <strong class="solde-total">{{ getSoldeAnnuel(e) }}j</strong>
                <small style="color:var(--text-light);display:block">
                  restants / {{ getSoldeAnnuel(e) + getConsoForEmploye(e) }}j total
                </small>
              </td>

              <!-- Solde Maladie -->
              <td>
                <strong [class.low]="getSoldeMaladie(e) === 0">
                  {{ getSoldeMaladie(e) }}j
                  <svg *ngIf="getSoldeMaladie(e) === 0"
                       width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </strong>
              </td>

              <!-- Solde Exceptionnel -->
              <td>
                <strong [class.low]="getSoldeExceptionnel(e) === 0">
                  {{ getSoldeExceptionnel(e) }}j
                  <svg *ngIf="getSoldeExceptionnel(e) === 0"
                       width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </strong>
              </td>

              <!-- Ajustement solde annuel -->
              <td>
                <div class="solde-adjust">
                  <input type="number"
                         [(ngModel)]="ajustements[e.id]"
                         placeholder="±0"
                         style="width:64px" />
                  <button class="btn-apply" (click)="ajusterSolde(e.id)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Appliquer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════ CALENDRIER ═══════════════════ -->
    <div *ngIf="view() === 'calendrier'" class="view-panel">
      <div class="calendar-wrap">
        <div class="cal-nav">
          <button class="cal-arrow" (click)="prevMois()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="cal-title">
            <h3>{{ getMoisLabel() }}</h3>
          </div>
          <button class="cal-arrow" (click)="nextMois()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div class="cal-legend">
          <div class="cl-item"><div class="cl-dot valide"></div>Congé validé</div>
          <div class="cl-item"><div class="cl-dot attente"></div>En attente</div>
          <div class="cl-item"><div class="cl-dot ferie"></div>Jour férié</div>
        </div>

        <div class="cal-grid">
          <div class="cal-day-header" *ngFor="let j of joursLabel">{{ j }}</div>
          <div class="cal-empty" *ngFor="let _ of getEmptyCells()"></div>
          <div class="cal-cell"
               *ngFor="let day of getDaysInMonth()"
               [class.today]="isToday(day)"
               [class.ferie]="isFerie(day)"
               [class.weekend]="isWeekend(day)"
               [title]="getFerieLabel(day)">
            <span class="cal-num">{{ day | date:'d' }}</span>
            <span class="cal-ferie-label" *ngIf="isFerie(day)">
              {{ getFerieLabel(day) }}
            </span>
            <div class="cal-markers">
              <div class="cal-marker valide"
                   *ngIf="hasCongesOnDay(day, 'VALIDEE')"
                   [title]="getCongesOnDay(day, 'VALIDEE')">
              </div>
              <div class="cal-marker attente"
                   *ngIf="hasCongesOnDay(day, 'EN_ATTENTE_RH')"
                   [title]="getCongesOnDay(day, 'EN_ATTENTE_RH')">
              </div>
            </div>
            <div class="cal-names"
                 *ngIf="hasCongesOnDay(day, 'VALIDEE') || hasCongesOnDay(day, 'EN_ATTENTE_RH')">
              <span *ngFor="let init of getCongesNamesOnDay(day)"
                    class="cal-name-badge">{{ init }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ MODAL CONFIRMATION ANNULATION ══════════ -->
    <div class="modal-overlay"
         *ngIf="annulationModal().open"
         (click)="annulationModal.set({ open: false, conge: null })">
    </div>
    <div class="modal-sm" *ngIf="annulationModal().open">
      <div class="modal-header">
        <div class="modal-icon" style="background:var(--danger-bg);color:var(--danger)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div>
          <h3>Annuler ce congé ?</h3>
          <p>{{ annulationModal().conge?.employePrenom }} {{ annulationModal().conge?.employeNom }}
            — {{ annulationModal().conge?.dateDebut | date:'dd/MM/yyyy' }}
            → {{ annulationModal().conge?.dateFin | date:'dd/MM/yyyy' }}</p>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text-light);margin-bottom:16px;line-height:1.6">
        Les <strong style="color:var(--primary)">{{ calcJours(annulationModal().conge) }} jour(s)</strong>
        seront réintégrés au solde de l'employé.
        Cette action est irréversible.
      </div>
      <div class="form-group">
        <label>Motif d'annulation <span class="req">*</span></label>
        <textarea [(ngModel)]="motifAnnulation"
                  placeholder="Ex : Congé annulé suite à accord mutuel…"
                  rows="2"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-outline"
                (click)="annulationModal.set({ open: false, conge: null })">Fermer</button>
        <button class="btn-danger" (click)="confirmerAnnulation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Confirmer l'annulation
        </button>
      </div>
    </div>
    <div class="modal-overlay"
     *ngIf="detailConge()"
     (click)="detailConge.set(null)">
  <div class="modal-sm" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <h3>Détail de la demande</h3>
      <button class="modal-close" (click)="detailConge.set(null)">✕</button>
    </div>
    <div class="modal-body" style="padding:20px 24px">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Employé</span>
          <strong>{{ detailConge()?.employePrenom }} {{ detailConge()?.employeNom }}</strong>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Type</span>
          <span class="type-badge" [class]="'tb-' + detailConge()?.typeConge?.toLowerCase()">
            {{ detailConge()?.typeConge }}
          </span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Période</span>
          <strong>{{ detailConge()?.dateDebut | date:'dd/MM/yyyy' }}
            → {{ detailConge()?.dateFin | date:'dd/MM/yyyy' }}</strong>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Durée</span>
          <strong>{{ detailConge()?.joursOuvrables }} jour(s)</strong>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Statut</span>
          <span class="statut-badge" [class]="getStatutClass(detailConge()?.statut)">
            {{ getStatutLabel(detailConge()?.statut) }}
          </span>
        </div>
        <div style="display:flex;justify-content:space-between" *ngIf="detailConge()?.motif">
          <span style="color:var(--text-light);font-size:13px">Motif</span>
          <strong>{{ detailConge()?.motif }}</strong>
        </div>
        <div style="display:flex;justify-content:space-between" *ngIf="detailConge()?.commentaireRh">
          <span style="color:var(--text-light);font-size:13px">Commentaire RH</span>
          <em style="font-size:13px">{{ detailConge()?.commentaireRh }}</em>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-light);font-size:13px">Soumis le</span>
          <strong>{{ detailConge()?.createdAt | date:'dd/MM/yyyy' }}</strong>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="padding:12px 24px;display:flex;justify-content:flex-end">
      <button class="btn btn-outline" (click)="detailConge.set(null)">Fermer</button>
    </div>
  </div>
</div>

    <!-- ══════════ MODAL CORRECTION / MODIFICATION ══════════ -->
    <div class="modal-overlay"
         *ngIf="correctionModal()"
         (click)="correctionModal.set(false)">
    </div>
    <div class="modal-correction" *ngIf="correctionModal()">
      <div class="modal-header">
        <div class="modal-icon correction-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <div>
          <h3>{{ correctionIdConge() ? 'Modifier un congé' : 'Ajouter un congé' }}</h3>
          <p *ngIf="correctionIdConge()">Modification RH — tracée dans l'historique</p>
          <p *ngIf="!correctionIdConge()">Saisie RH — toute modification est tracée</p>
        </div>
        <button class="modal-close-x" (click)="correctionModal.set(false)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="alert-info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span *ngIf="!correctionIdConge()">
          Ce congé sera directement <strong>validé</strong> et le solde sera déduit. Les dates passées sont autorisées.
        </span>
        <span *ngIf="correctionIdConge()">
          La modification sera <strong>immédiatement appliquée</strong>. L'ancien solde sera restitué et le nouveau déduit.
        </span>
      </div>

      <div class="form-grid">
        <div class="form-group fg-full">
          <label>Employé <span class="req">*</span></label>
          <div class="select-wrap-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 class="select-icon">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <select [(ngModel)]="correctionForm.employeId" [disabled]="!!correctionIdConge()">
              <option [ngValue]="null">— Choisir un employé —</option>
              <option *ngFor="let e of employes()" [ngValue]="e.id">
                {{ e.prenom }} {{ e.nom }} — {{ e.departement }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group fg-full">
          <label>Type de congé <span class="req">*</span></label>
          <div class="type-radio-group">
            <label class="type-radio" *ngFor="let t of typeOptions"
                   [class.selected]="correctionForm.typeConge === t.val">
              <input type="radio" [(ngModel)]="correctionForm.typeConge" [value]="t.val" />
              <span class="tr-badge" [class]="'trb-' + t.val.toLowerCase()">{{ t.label }}</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Date début <span class="req">*</span></label>
          <input type="date" [(ngModel)]="correctionForm.dateDebut" />
        </div>
        <div class="form-group">
          <label>Date fin <span class="req">*</span></label>
          <input type="date" [(ngModel)]="correctionForm.dateFin" />
        </div>

        <div class="form-group fg-full">
          <label>Motif du congé</label>
          <input type="text" [(ngModel)]="correctionForm.motif"
                 placeholder="Ex : Raison médicale, événement familial…" />
        </div>

        <div class="form-group fg-full">
          <label>
            Motif de la correction
            <span class="req">*</span>
            <span class="trace-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Tracé
            </span>
          </label>
          <textarea [(ngModel)]="correctionForm.motifCorrection"
                    placeholder="Ex : Absence non déclarée en janvier, régularisation administrative…"
                    rows="3"></textarea>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-outline" (click)="correctionModal.set(false)">Annuler</button>
        <button class="btn-primary" (click)="soumettreCorrection()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ correctionIdConge() ? 'Enregistrer la modification' : 'Enregistrer le congé' }}
        </button>
      </div>
    </div>

    <!-- ══════════ TOAST ══════════ -->
    <div class="g-toast"
         [class.show]="toast().show"
         [class]="'g-toast ' + toast().type">
      <div class="toast-icon">
        <svg *ngIf="toast().type === 'success'"
             width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg *ngIf="toast().type === 'error'"
             width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <svg *ngIf="toast().type === 'info'"
             width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      {{ toast().message }}
    </div>

  </div>
  `,
  styles: [`
    /* ════════════════════════════════════════
       TOKENS & KEYFRAMES
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
      --purple:       #7C3AED;
      --purple-bg:    #EDE9FE;
      --gray-light:   #F4F7F8;
      --gray-mid:     #E2EAEC;
      --text:         #1A2E35;
      --text-light:   #64838A;
      --white:        #FFFFFF;
      --radius-sm:    8px;
      --radius-md:    12px;
      --radius-lg:    16px;
      --radius-xl:    20px;
      --shadow-sm:    0 2px 8px rgba(11,110,126,0.08);
      --shadow-md:    0 4px 20px rgba(11,110,126,0.12);
      --shadow-lg:    0 12px 40px rgba(11,110,126,0.18);
      --shadow-xl:    0 20px 60px rgba(11,110,126,0.22);
      --transition:   0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(5,150,105,0); }
    }
    @keyframes rowIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes histSlide {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ════════════════════════════════════════
       BASE
    ════════════════════════════════════════ */
    .rh-conges {
      max-width: 1120px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: var(--text);
      animation: fadeIn 0.35s ease;
    }

    /* ════════════════════════════════════════
       PAGE HEADER
    ════════════════════════════════════════ */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px;
      animation: slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
    }
    .ph-left {
      display: flex; align-items: center; gap: 16px;
    }
    .ph-right {
      display: flex; align-items: center; gap: 12px;
    }
    .ph-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      color: white;
      box-shadow: 0 8px 24px rgba(11,110,126,0.28);
    }
    .ph-text h1 {
      font-size: 21px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.3px;
    }
    .ph-text p {
      font-size: 12.5px; color: var(--text-light); margin-top: 3px;
    }
    .ph-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 14px; background: var(--success-bg);
      border-radius: 20px; font-size: 12px; font-weight: 600;
      color: var(--success);
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--success);
      animation: pulse 2s infinite;
    }
    .btn-correction-header {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 16px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white; border: none; border-radius: var(--radius-md);
      font-size: 13px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 14px rgba(11,110,126,0.3);
      transition: all var(--transition);
      &:hover {
        opacity: 0.88; transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(11,110,126,0.38);
      }
    }

    /* ════════════════════════════════════════
       STATS
    ════════════════════════════════════════ */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 16px 18px;
      box-shadow: var(--shadow-sm);
      display: flex; align-items: center; gap: 14px;
      position: relative; overflow: hidden;
      border: 1px solid transparent;
      animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) calc(var(--d, 0ms)) both;
      transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
      &::before {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%);
        pointer-events: none;
      }
      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--gray-mid);
      }
    }
    .sc-icon {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      &.primary { background: var(--accent);     color: var(--primary); }
      &.success { background: var(--success-bg); color: var(--success); }
      &.warning { background: var(--warning-bg); color: var(--warning); }
      &.info    { background: var(--info-bg);    color: var(--info); }
    }
    .sc-body { flex: 1; min-width: 0; }
    .sc-val {
      display: block;
      font-size: 24px; font-weight: 800;
      color: var(--primary-dark); letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .sc-label { font-size: 11.5px; color: var(--text-light); font-weight: 500; }
    .sc-trend {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      &.up      { background: var(--success-bg); color: var(--success); }
      &.down    { background: var(--danger-bg);  color: var(--danger); }
      &.neutral { background: var(--gray-light); color: var(--text-light); }
    }

    /* ════════════════════════════════════════
       VIEW TABS
    ════════════════════════════════════════ */
    .view-tabs {
      position: relative;
      display: grid; grid-template-columns: repeat(3, 1fr);
      background: var(--gray-light);
      border-radius: var(--radius-md);
      padding: 5px; margin-bottom: 22px;
      animation: slideUp 0.45s cubic-bezier(0.4,0,0.2,1) 160ms both;
    }
    .vt-btn {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      gap: 7px; padding: 10px 14px;
      border: none; border-radius: var(--radius-sm);
      cursor: pointer; font-size: 13px; font-weight: 600;
      color: var(--text-light); background: transparent;
      transition: color var(--transition);
      &:hover { color: var(--primary); }
      &.active { color: var(--primary); }
    }
    .vt-slider {
      position: absolute; top: 5px; bottom: 5px;
      width: calc(33.33% - 3px);
      background: var(--white);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    /* ════════════════════════════════════════
       VIEW PANEL
    ════════════════════════════════════════ */
    .view-panel { animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

    /* ════════════════════════════════════════
       FILTERS BAR
    ════════════════════════════════════════ */
    .filters-bar {
      display: flex; gap: 10px; flex-wrap: wrap;
      margin-bottom: 16px; align-items: center;
    }
    .search-box {
      flex: 1; min-width: 200px;
      display: flex; align-items: center; gap: 9px;
      background: var(--white);
      border: 1.5px solid var(--gray-mid);
      border-radius: var(--radius-md);
      padding: 0 14px;
      transition: border-color var(--transition), box-shadow var(--transition);
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
    .select-wrap {
      position: relative;
      .select-icon {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        color: var(--text-light); pointer-events: none;
      }
      select {
        appearance: none;
        padding: 11px 34px 11px 14px;
        border: 1.5px solid var(--gray-mid);
        border-radius: var(--radius-md);
        font-size: 13px; font-weight: 500;
        background: var(--white); cursor: pointer;
        color: var(--text); outline: none;
        transition: border-color var(--transition);
        &:focus { border-color: var(--secondary); }
      }
    }

    /* ════════════════════════════════════════
       TABLE
    ════════════════════════════════════════ */
    .table-card {
      background: var(--white);
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-mid);
    }
    .pro-table {
      width: 100%; border-collapse: collapse;
      thead tr {
        background: #F8FAFA;
        th {
          padding: 13px 16px; text-align: left;
          font-size: 10.5px; font-weight: 700;
          color: var(--text-light); text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid var(--gray-mid);
        }
      }
      tbody tr {
        border-bottom: 1px solid var(--gray-light);
        transition: background var(--transition);
        &:hover { background: #F8FCFC; }
        &:last-child { border-bottom: none; }
        td { padding: 13px 16px; font-size: 13px; }
      }
    }
    .tr-anim { animation: rowIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }
    .user-cell {
      display: flex; align-items: center; gap: 10px;
      strong { display: block; font-size: 13px; font-weight: 600; }
      small  { font-size: 11px; color: var(--text-light); margin-top: 1px; display: block; }
    }
    .uc-av {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; color: white;
      letter-spacing: 0.5px;
    }
    .type-badge {
      display: inline-flex; align-items: center;
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
      &.tb-annuel       { background: var(--accent);     color: var(--primary); }
      &.tb-maladie      { background: var(--danger-bg);  color: var(--danger); }
      &.tb-exceptionnel { background: var(--warning-bg); color: var(--warning); }
      &.tb-sans_solde   { background: var(--gray-light); color: var(--text-light); }
    }
    .period-cell {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-light); font-weight: 500;
      svg { flex-shrink: 0; }
    }
    .jours-pill {
      display: inline-flex; align-items: baseline; gap: 1px;
      font-size: 15px; font-weight: 800; color: var(--primary);
      span { font-size: 11px; font-weight: 600; }
    }
    .statut-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 11px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      .sb-dot { width: 6px; height: 6px; border-radius: 50%; }
      &.att-mgr { background: var(--info-bg);    color: var(--info);    .sb-dot { background: var(--info); } }
      &.att-rh  { background: var(--warning-bg); color: var(--warning); .sb-dot { background: var(--warning); } }
      &.valide  { background: var(--success-bg); color: var(--success); .sb-dot { background: var(--success); } }
      &.rejete  { background: var(--danger-bg);  color: var(--danger);  .sb-dot { background: var(--danger); } }
    }
    .act-row { display: flex; gap: 6px; align-items: center; }
    .act-btn {
      width: 30px; height: 30px;
      border: 1.5px solid var(--gray-mid);
      background: var(--white); border-radius: var(--radius-sm);
      cursor: pointer; color: var(--text-light);
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      &:hover {
        background: var(--accent); color: var(--primary);
        border-color: var(--secondary); transform: scale(1.08);
      }
    }
    .view-btn:hover { background: var(--info-bg); color: var(--info); border-color: var(--info); }
    .hist-btn:hover { background: var(--purple-bg); color: var(--purple); border-color: var(--purple); }
    .edit-btn:hover { background: var(--warning-bg); color: var(--warning); border-color: var(--warning); }
    .cancel-btn:hover { background: var(--danger-bg); color: var(--danger); border-color: var(--danger); }
    .table-foot {
      padding: 11px 16px;
      border-top: 1px solid var(--gray-mid);
      text-align: right;
    }
    .tf-count {
      font-size: 11.5px; color: var(--text-light);
      strong { color: var(--primary); }
    }
    .empty-row { padding: 0 !important; }
    .empty-state {
      text-align: center; padding: 48px 16px;
      color: var(--text-light);
      display: flex; flex-direction: column;
      align-items: center; gap: 8px;
    }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--gray-light);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
      svg { opacity: 0.35; }
    }
    .empty-state p { font-size: 14px; font-weight: 600; color: var(--text); }
    .empty-state span { font-size: 12px; }

    /* ════════════════════════════════════════
       HISTORIQUE PANEL
    ════════════════════════════════════════ */
    .historique-panel {
      margin-top: 20px;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-mid);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      animation: histSlide 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }
    .hist-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--purple-bg), #F5F3FF);
      border-bottom: 1px solid #DDD6FE;
    }
    .hist-title-row {
      display: flex; align-items: center; gap: 10px;
    }
    .hist-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: var(--purple); color: white;
      display: flex; align-items: center; justify-content: center;
    }
    .hist-header h4 {
      font-size: 14px; font-weight: 800;
      color: var(--purple); margin: 0;
    }
    .hist-close {
      width: 28px; height: 28px; border-radius: 6px;
      border: 1.5px solid #DDD6FE;
      background: white; cursor: pointer; color: var(--purple);
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      &:hover { background: var(--purple); color: white; }
    }
    .hist-timeline {
      padding: 16px 20px;
      display: flex; flex-direction: column; gap: 0;
    }
    .hist-item {
      display: flex; gap: 14px; position: relative;
      padding-bottom: 16px;
      &:last-child { padding-bottom: 0; }
      &:last-child .hist-line { display: none; }
    }
    .hist-line {
      position: absolute; left: 9px; top: 20px;
      width: 2px; bottom: 0;
      background: linear-gradient(to bottom, var(--gray-mid), transparent);
    }
    .hist-dot {
      width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
      margin-top: 1px;
      border: 2.5px solid;
      &.hd-creation  { border-color: var(--success); background: var(--success-bg); }
      &.hd-validation { border-color: var(--success); background: var(--success-bg); }
      &.hd-modification { border-color: var(--warning); background: var(--warning-bg); }
      &.hd-rejet     { border-color: var(--danger);  background: var(--danger-bg); }
    }
    .hist-content { flex: 1; }
    .hist-top {
      display: flex; align-items: center; gap: 10px;
      flex-wrap: wrap; margin-bottom: 6px;
    }
    .hist-action {
      padding: 2px 9px; border-radius: 20px;
      font-size: 10.5px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.5px;
      &.ha-creation   { background: var(--success-bg); color: var(--success); }
      &.ha-validation { background: var(--success-bg); color: var(--success); }
      &.ha-modification { background: var(--warning-bg); color: var(--warning); }
      &.ha-rejet      { background: var(--danger-bg);  color: var(--danger); }
    }
    .hist-par { font-size: 12px; color: var(--text); strong { color: var(--primary); } }
    .hist-date { font-size: 11px; color: var(--text-light); margin-left: auto; }
    .hist-values {
      display: flex; flex-direction: column; gap: 4px;
    }
    .hv-old, .hv-new {
      display: flex; align-items: center; gap: 6px;
      font-size: 11.5px; padding: 5px 10px;
      border-radius: var(--radius-sm);
      svg { flex-shrink: 0; }
    }
    .hv-old { background: var(--danger-bg); color: var(--danger); }
    .hv-new { background: var(--success-bg); color: var(--success); }

    /* ════════════════════════════════════════
       SOLDES TABLE EXTRAS
    ════════════════════════════════════════ */
    .dept-tag {
      padding: 3px 9px; background: var(--gray-light);
      border-radius: 6px; font-size: 11.5px;
      color: var(--text-light); font-weight: 500;
    }
    .solde-total { font-size: 14px; color: var(--primary-dark); }
    .progress-cell { display: flex; flex-direction: column; gap: 4px; span { font-size: 12.5px; font-weight: 600; } }
    .mini-bar { width: 60px; height: 4px; background: var(--gray-mid); border-radius: 99px; overflow: hidden; }
    .mini-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, var(--secondary), var(--primary));
      transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .low { color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 4px; }
    .danger { color: var(--danger); }
    .solde-adjust { display: flex; gap: 8px; align-items: center; }
    input[type=number] {
      padding: 7px 10px; border: 1.5px solid var(--gray-mid);
      border-radius: var(--radius-sm); font-size: 13px; outline: none;
      color: var(--text); text-align: center;
      transition: border-color var(--transition);
      &:focus { border-color: var(--secondary); }
    }
    .btn-apply {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 12px; border: none; border-radius: var(--radius-sm);
      background: var(--primary); color: white;
      font-size: 11.5px; font-weight: 700; cursor: pointer;
      transition: all var(--transition);
      &:hover { background: var(--primary-dark); transform: scale(1.03); }
    }

    /* ════════════════════════════════════════
       CALENDRIER
    ════════════════════════════════════════ */
    .calendar-wrap {
      background: var(--white); border-radius: var(--radius-lg);
      padding: 24px; box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-mid);
    }
    .cal-nav { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 20px; }
    .cal-title h3 { font-size: 17px; font-weight: 800; color: var(--primary-dark); min-width: 180px; text-align: center; letter-spacing: -0.2px; }
    .cal-arrow {
      width: 34px; height: 34px; border-radius: 50%;
      border: 1.5px solid var(--gray-mid);
      background: var(--white); cursor: pointer; color: var(--text-light);
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      &:hover { background: var(--accent); color: var(--primary); border-color: var(--secondary); }
    }
    .cal-legend { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .cl-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-light); font-weight: 500; }
    .cl-dot {
      width: 10px; height: 10px; border-radius: 3px;
      &.valide  { background: var(--primary); }
      &.attente { background: var(--warning); }
      &.ferie   { background: var(--danger-bg); border: 1.5px solid #FCA5A5; }
    }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .cal-day-header { text-align: center; font-size: 10.5px; font-weight: 800; color: var(--text-light); padding: 6px 0; text-transform: uppercase; letter-spacing: 0.8px; }
    .cal-empty { background: transparent; }
    .cal-cell {
      min-height: 68px; border-radius: var(--radius-sm);
      padding: 7px; background: var(--gray-light);
      position: relative; transition: all var(--transition); cursor: default;
      &:hover { background: var(--accent); transform: scale(1.03); }
      &.today { background: linear-gradient(135deg, var(--accent), #CCF0F4); border: 2px solid var(--secondary); .cal-num { color: var(--primary); font-weight: 800; } }
      &.ferie  { background: #FFF0F0; border: 1px solid #FCA5A5; }
      &.weekend { background: #F5F5F5; opacity: 0.7; }
    }
    .cal-num { font-size: 12px; font-weight: 600; color: var(--text); }
    .cal-ferie-label { display: block; font-size: 7px; font-weight: 700; color: var(--danger); line-height: 1.2; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .cal-markers { display: flex; gap: 3px; margin-top: 4px; flex-wrap: wrap; }
    .cal-marker { width: 8px; height: 8px; border-radius: 50%; &.valide { background: var(--primary); } &.attente { background: var(--warning); } }
    .cal-names { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 4px; }
    .cal-name-badge { font-size: 8px; font-weight: 800; background: var(--primary); color: white; border-radius: 3px; padding: 1px 3px; line-height: 1.4; letter-spacing: 0.3px; }

    /* ════════════════════════════════════════
       MODAL COMMUN
    ════════════════════════════════════════ */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(7,79,92,0.35);
      backdrop-filter: blur(4px);
      z-index: 900;
      animation: fadeIn 0.2s ease;
    }
    .modal-header {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 20px; position: relative;
      h3 { font-size: 16px; font-weight: 800; color: var(--primary-dark); margin: 0; }
      p  { font-size: 12px; color: var(--text-light); margin: 3px 0 0; }
    }
    .modal-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: var(--accent); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
    }
    .correction-icon {
      background: var(--warning-bg); color: var(--warning);
    }
    .modal-close-x {
      margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
      border: 1.5px solid var(--gray-mid);
      background: var(--white); cursor: pointer; color: var(--text-light);
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      &:hover { background: var(--danger-bg); color: var(--danger); border-color: var(--danger); }
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-outline {
      padding: 10px 18px; border: 1.5px solid var(--gray-mid);
      background: var(--white); border-radius: var(--radius-md);
      cursor: pointer; font-size: 13px; font-weight: 600;
      color: var(--text-light); transition: all var(--transition);
      &:hover { border-color: var(--text-light); color: var(--text); }
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; border: none; border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white; cursor: pointer; font-size: 13px; font-weight: 700;
      box-shadow: 0 4px 14px rgba(11,110,126,0.3);
      transition: all var(--transition);
      &:hover { opacity: 0.88; transform: translateY(-1px); }
    }
    .form-group {
      display: flex; flex-direction: column; gap: 7px;
      label {
        font-size: 11.5px; font-weight: 700;
        color: var(--text-light); text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex; align-items: center; gap: 6px;
      }
      input, select, textarea {
        padding: 10px 14px; border: 1.5px solid var(--gray-mid);
        border-radius: var(--radius-md); font-size: 13px;
        outline: none; color: var(--text); background: var(--white);
        font-family: inherit;
        transition: border-color var(--transition), box-shadow var(--transition);
        &:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(20,184,196,0.12);
        }
      }
      textarea { resize: vertical; line-height: 1.5; }
    }

    /* ════════════════════════════════════════
       MODAL AJUSTEMENT (petite)
    ════════════════════════════════════════ */
    .modal-sm {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: var(--white); border-radius: var(--radius-xl);
      padding: 28px; width: 380px; z-index: 1000;
      box-shadow: var(--shadow-xl);
      animation: scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
      .form-group input {
        width: 100%; box-sizing: border-box;
        padding: 11px 14px; font-size: 14px;
      }
    }

    /* ════════════════════════════════════════
       MODAL CORRECTION (grande)
    ════════════════════════════════════════ */
    .modal-correction {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: var(--white); border-radius: var(--radius-xl);
      padding: 30px; width: 560px; max-width: calc(100vw - 32px);
      max-height: 90vh; overflow-y: auto;
      z-index: 1000; box-shadow: var(--shadow-xl);
      animation: scaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .fg-full { grid-column: 1 / -1; }
    .req { color: var(--danger); }
    .trace-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 7px; border-radius: 20px;
      background: var(--purple-bg); color: var(--purple);
      font-size: 10px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.4px;
    }

    /* Select full width dans modal */
    .select-wrap-full {
      position: relative;
      .select-icon {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        color: var(--text-light); pointer-events: none;
      }
      select {
        width: 100%; box-sizing: border-box;
        appearance: none;
        padding: 10px 34px 10px 14px;
        border: 1.5px solid var(--gray-mid);
        border-radius: var(--radius-md);
        font-size: 13px; font-weight: 500;
        background: var(--white); cursor: pointer;
        color: var(--text); outline: none;
        font-family: inherit;
        transition: border-color var(--transition), box-shadow var(--transition);
        &:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(20,184,196,0.12);
        }
      }
    }

    /* Radio type congé */
    .type-radio-group {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .type-radio {
      cursor: pointer;
      input[type=radio] { display: none; }
      .tr-badge {
        display: inline-flex; align-items: center;
        padding: 6px 12px; border-radius: 20px;
        font-size: 12px; font-weight: 700;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all var(--transition);
        &.trb-annuel       { background: var(--accent);     color: var(--primary);    border-color: transparent; }
        &.trb-maladie      { background: var(--danger-bg);  color: var(--danger);     border-color: transparent; }
        &.trb-exceptionnel { background: var(--warning-bg); color: var(--warning);    border-color: transparent; }
        &.trb-sans_solde   { background: var(--gray-light); color: var(--text-light); border-color: transparent; }
      }
      &.selected .trb-annuel       { border-color: var(--primary);    box-shadow: 0 0 0 3px rgba(11,110,126,0.15); }
      &.selected .trb-maladie      { border-color: var(--danger);     box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
      &.selected .trb-exceptionnel { border-color: var(--warning);    box-shadow: 0 0 0 3px rgba(217,119,6,0.12); }
      &.selected .trb-sans_solde   { border-color: var(--text-light); box-shadow: 0 0 0 3px rgba(100,131,138,0.12); }
    }

    /* Alert info */
    .alert-info {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: var(--radius-md);
      background: var(--info-bg);
      border: 1px solid #BFDBFE;
      font-size: 12.5px; color: var(--info);
      margin-bottom: 20px; line-height: 1.5;
      svg { flex-shrink: 0; }
      strong { font-weight: 700; }
    }

    /* ════════════════════════════════════════
       BTN DANGER & DISABLED FIELD
    ════════════════════════════════════════ */
    .btn-danger {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; border: none; border-radius: var(--radius-md);
      background: var(--danger); color: white;
      cursor: pointer; font-size: 13px; font-weight: 700;
      box-shadow: 0 4px 14px rgba(220,38,38,0.3);
      transition: all var(--transition);
      &:hover { opacity: 0.88; transform: translateY(-1px); }
    }
    .disabled-field select { opacity: 0.6; cursor: not-allowed; background: var(--gray-light); }

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
      z-index: 2000;
      box-shadow: var(--shadow-md);
      &.show { opacity: 1; transform: translateY(0) scale(1); animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
      &.success { background: var(--success-bg); color: var(--success); }
      &.error   { background: var(--danger-bg);  color: var(--danger); }
      &.info    { background: var(--info-bg);    color: var(--info); }
    }
    .toast-icon {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      .success & { background: var(--success); color: white; }
      .error   & { background: var(--danger);  color: white; }
      .info    & { background: var(--info);    color: white; }
    }

    /* ════════════════════════════════════════
       RESPONSIVE
    ════════════════════════════════════════ */
    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .modal-sm, .modal-correction { width: calc(100vw - 32px); }
      .ph-badge  { display: none; }
      .ph-right  { gap: 8px; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RhCongesComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  conges   = signal<any[]>([]);
  employes = signal<any[]>([]);
  view     = signal<'liste' | 'soldes' | 'calendrier'>('liste');
  loading  = signal(true);

  search       = '';
  statutFilter = '';
  typeFilter   = '';
  soldeSearch  = '';
  currentDate  = signal(new Date());

  ajustements: Record<number, number> = {};
  annulationModal = signal<{ open: boolean; conge: any }>({ open: false, conge: null });
  motifAnnulation = '';
  detailConge = signal<any | null>(null);

  toast = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  joursLabel = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  stats = signal<any[]>([]);

  // ── Correction / Historique ────────────────────────
  correctionModal = signal(false);
  correctionIdConge = signal<number | null>(null);
  selectedCongeId = signal<number | null>(null);
  historique      = signal<any[]>([]);
  loadingHist     = signal(false);

  // ── Soldes par employé (ANNUEL + MALADIE + EXCEPTIONNEL) ──
  soldesParEmploye = signal<Record<number, any[]>>({});

  correctionForm = {
    employeId:       null as number | null,
    typeConge:       'ANNUEL',
    dateDebut:       '',
    dateFin:         '',
    motif:           '',
    motifCorrection: '',
  };

  typeOptions = [
    { val: 'ANNUEL',       label: 'Annuel' },
    { val: 'MALADIE',      label: 'Maladie' },
    { val: 'EXCEPTIONNEL', label: 'Exceptionnel' },
    { val: 'SANS_SOLDE',   label: 'Sans solde' },
  ];

  // Jours fériés tunisiens
  private FERIES: Record<string, string> = {
    '01-01': 'Nouvel An',
    '03-20': 'Indépendance',
    '04-09': 'Martyrs',
    '05-01': 'Fête du Travail',
    '06-01': 'Fête Jeunesse',
    '06-25': 'Fête République',
    '07-25': 'Proclamation Rép.',
    '08-13': 'Fête de la Femme',
    '10-15': 'Fête Évacuation',
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      conges:   this.http.get<any[]>(`${this.API}/rh/conges`),
      employes: this.http.get<any[]>(`${this.API}/rh/employes`)
    }).subscribe({
      next: (d) => {
        this.conges.set(d.conges ?? []);
        this.employes.set(d.employes ?? []);
        this.buildStats(d.conges ?? []);
        this.loading.set(false);
        // Charger les soldes pour chaque employé (ANNUEL + MALADIE + EXCEPTIONNEL)
        const ids = (d.employes ?? []).map((e: any) => e.id);
        this.loadSoldesParEmploye(ids);
      }
    });
  }

  private loadSoldesParEmploye(employeIds: number[]): void {
    if (employeIds.length === 0) return;
    const soldesMap: Record<number, any[]> = {};
    let remaining = employeIds.length;

    employeIds.forEach(id => {
      this.http.get<any[]>(`${this.API}/rh/conges/soldes/${id}`).subscribe({
        next: (soldes) => {
          soldesMap[id] = soldes ?? [];
          remaining--;
          if (remaining === 0) {
            this.soldesParEmploye.set({ ...soldesMap });
          }
        },
        error: () => {
          soldesMap[id] = [];
          remaining--;
          if (remaining === 0) {
            this.soldesParEmploye.set({ ...soldesMap });
          }
        }
      });
    });
  }

  private buildStats(conges: any[]): void {
    const now  = new Date();
    const mois = now.getMonth();
    const enAuj = conges.filter(c => {
      if (c.statut !== 'VALIDEE') return false;
      return now >= new Date(c.dateDebut) && now <= new Date(c.dateFin);
    }).length;

    this.stats.set([
      { label: 'Total demandes',     val: conges.length },
      { label: 'Validés ce mois',    val: conges.filter(c => c.statut === 'VALIDEE' && new Date(c.dateDebut).getMonth() === mois).length },
      { label: 'En attente RH',      val: conges.filter(c => c.statut === 'EN_ATTENTE_RH').length },
      { label: "Absents aujourd'hui", val: enAuj }
    ]);
  }

  filteredConges(): any[] {
    return this.conges().filter(c => {
      const t  = this.search.toLowerCase();
      const m  = !t || (c.employeNom ?? '').toLowerCase().includes(t) || (c.employePrenom ?? '').toLowerCase().includes(t);
      const s  = !this.statutFilter || c.statut    === this.statutFilter;
      const tp = !this.typeFilter   || c.typeConge === this.typeFilter;
      return m && s && tp;
    });
  }

  applyFilter(): void {}

  getFilteredEmployes(): any[] {
    const t = this.soldeSearch.toLowerCase();
    return this.employes().filter(e =>
      !t || (e.nom ?? '').toLowerCase().includes(t) || (e.prenom ?? '').toLowerCase().includes(t)
    );
  }

  calcJours(c: any): number {
    if (c.joursOuvrables && c.joursOuvrables > 0) return c.joursOuvrables;
    if (!c.dateDebut || !c.dateFin) return 0;
    const d1 = new Date(c.dateDebut);
    const d2 = new Date(c.dateFin);
    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  getConsoForEmploye(e: any): number {
    return this.conges()
      .filter(c =>
        c.statut === 'VALIDEE' &&
        (c.employeNom    ?? '').toLowerCase() === (e.nom    ?? '').toLowerCase() &&
        (c.employePrenom ?? '').toLowerCase() === (e.prenom ?? '').toLowerCase()
      )
      .reduce((sum, c) => sum + this.calcJours(c), 0);
  }

  // ── Helpers soldes par type ──────────────────────────
  getSoldeByType(employeId: number, type: string): number {
    const soldes = this.soldesParEmploye()[employeId] ?? [];
    const s = soldes.find((x: any) => x.typeConge === type);
    return s ? (s.joursRestants ?? 0) : 0;
  }

  getSoldeAnnuel(e: any): number {
    return this.getSoldeByType(e.id, 'ANNUEL');
  }

  getSoldeMaladie(e: any): number {
    return this.getSoldeByType(e.id, 'MALADIE');
  }

  getSoldeExceptionnel(e: any): number {
    return this.getSoldeByType(e.id, 'EXCEPTIONNEL');
  }

  // ── CORRECTION 1 : URL corrigée pour ajusterSolde() ──
  ajusterSolde(employeId: number): void {
    const val = this.ajustements[employeId];
    if (!val && val !== 0) return;

    this.http.put<any>(
      `${this.API}/rh/conges/employes/${employeId}/ajuster-solde`,
      { ajustement: val }
    ).subscribe({
      next: () => {
        this.loadData();
        delete this.ajustements[employeId];
        this.showToast('Solde ajusté avec succès', 'success');
      },
      error: (err) => this.showToast(
        err.error?.message ?? 'Erreur lors de la mise à jour', 'error'
      )
    });
  }

  // ── Ouvrir en mode AJOUT ──────────────────────────
  openCorrection(): void {
    Object.assign(this.correctionForm, {
      employeId: null, typeConge: 'ANNUEL',
      dateDebut: '', dateFin: '',
      motif: '', motifCorrection: ''
    });
    this.correctionIdConge.set(null);
    this.correctionModal.set(true);
  }

  // ── Ouvrir en mode MODIFICATION ──────────────────
  openModification(c: any): void {
    const toDateInput = (d: string | null) => {
      if (!d) return '';
      return d.length >= 10 ? d.substring(0, 10) : d;
    };

    // employeId est maintenant dans la réponse API (après correction backend)
    // Fallback : chercher par nom/prénom dans la liste des employés
    let employeId = c.employeId ?? null;
    if (!employeId && c.employeNom && c.employePrenom) {
      const found = this.employes().find(e =>
        (e.nom ?? '').toLowerCase() === (c.employeNom ?? '').toLowerCase() &&
        (e.prenom ?? '').toLowerCase() === (c.employePrenom ?? '').toLowerCase()
      );
      employeId = found?.id ?? null;
    }

    Object.assign(this.correctionForm, {
      employeId:       employeId,
      typeConge:       c.typeConge ?? 'ANNUEL',
      dateDebut:       toDateInput(c.dateDebut),
      dateFin:         toDateInput(c.dateFin),
      motif:           c.motif ?? '',
      motifCorrection: ''
    });
    this.correctionIdConge.set(c.id);
    this.correctionModal.set(true);
  }

  // ── Soumettre ajout OU modification ──────────────
  soumettreCorrection(): void {
    if (!this.correctionForm.employeId ||
        !this.correctionForm.dateDebut ||
        !this.correctionForm.dateFin) {
      this.showToast('Remplissez tous les champs obligatoires', 'error');
      return;
    }

    const id = this.correctionIdConge();
    if (id) {
      // Mode modification — PUT /rh/conges/conges/{id}/modifier
      this.http.put(`${this.API}/rh/conges/conges/${id}/modifier`, this.correctionForm)
        .subscribe({
          next: () => {
            this.correctionModal.set(false);
            this.correctionIdConge.set(null);
            this.showToast('Congé modifié avec succès', 'success');
            this.loadData();
          },
          error: (err) => this.showToast(err.error?.message ?? 'Erreur lors de la modification', 'error')
        });
    } else {
      // Mode ajout — POST /rh/conges/conges/correction
      this.http.post(`${this.API}/rh/conges/conges/correction`, this.correctionForm)
        .subscribe({
          next: () => {
            this.correctionModal.set(false);
            this.showToast('Congé enregistré avec succès', 'success');
            this.loadData();
          },
          error: (err) => this.showToast(err.error?.message ?? 'Erreur', 'error')
        });
    }
  }

  // ── Annulation d'un congé validé ─────────────────
  congeEstCommence(c: any): boolean {
    if (!c?.dateDebut) return false;
    const debut = new Date(c.dateDebut);
    debut.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return debut <= today;
  }

  demanderAnnulation(c: any): void {
    this.motifAnnulation = '';
    this.annulationModal.set({ open: true, conge: c });
  }

  confirmerAnnulation(): void {
    const c = this.annulationModal().conge;
    if (!c) return;
    if (!this.motifAnnulation.trim()) {
      this.showToast('Veuillez saisir un motif d\'annulation', 'error');
      return;
    }
    // On utilise l'endpoint annuler existant de l'employé côté RH
    // Le RH appelle PUT /api/rh/conges/{id}/annuler
    this.http.put(`${this.API}/rh/conges/${c.id}/annuler`, { motif: this.motifAnnulation })
      .subscribe({
        next: () => {
          this.annulationModal.set({ open: false, conge: null });
          this.showToast('Congé annulé — solde réintégré', 'success');
          this.loadData();
        },
        error: (err) => this.showToast(err.error?.message ?? 'Erreur lors de l\'annulation', 'error')
      });
  }

  // ── Historique ──────────────────────────────────────
  voirHistorique(congeId: number): void {
    // toggle : re-cliquer sur le même congé ferme le panneau
    if (this.selectedCongeId() === congeId) {
      this.historique.set([]);
      this.selectedCongeId.set(null);
      return;
    }
    this.selectedCongeId.set(congeId);
    this.historique.set([]);
    this.loadingHist.set(true);
    this.http.get<any[]>(`${this.API}/rh/conges/conges/${congeId}/historique`)
      .subscribe({
        next: (d) => {
          this.historique.set(d ?? []);
          this.loadingHist.set(false);
        },
        error: () => {
          this.loadingHist.set(false);
          this.showToast('Impossible de charger l\'historique', 'error');
        }
      });
  }

  /* ── Calendrier ── */
  getDaysInMonth(): Date[] {
    const d  = this.currentDate();
    const nb = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return Array.from({ length: nb }, (_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1));
  }

  getEmptyCells(): any[] {
    const d   = this.currentDate();
    let first = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    first = first === 0 ? 6 : first - 1;
    return Array(first).fill(null);
  }

  prevMois(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMois(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  getMoisLabel(): string {
    return this.currentDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  isToday(d: Date): boolean {
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }

  isWeekend(d: Date): boolean { return d.getDay() === 0 || d.getDay() === 6; }

  isFerie(d: Date): boolean { return !!this.FERIES[this.getFerieKey(d)]; }

  getFerieLabel(d: Date): string { return this.FERIES[this.getFerieKey(d)] ?? ''; }

  private getFerieKey(d: Date): string {
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  hasCongesOnDay(day: Date, statut: string): boolean {
    return this.conges().some(c => {
      if (c.statut !== statut) return false;
      const s = new Date(c.dateDebut); const e = new Date(c.dateFin);
      const d = new Date(day);
      d.setHours(12, 0, 0, 0); s.setHours(0, 0, 0, 0); e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    });
  }

  getCongesOnDay(day: Date, statut: string): string {
    return this.conges()
      .filter(c => {
        if (c.statut !== statut) return false;
        const s = new Date(c.dateDebut); const e = new Date(c.dateFin);
        return day >= s && day <= e;
      })
      .map(c => `${c.employePrenom} ${c.employeNom}`)
      .join(', ');
  }

  getCongesNamesOnDay(day: Date): string[] {
    return this.conges()
      .filter(c => {
        if (c.statut !== 'VALIDEE' && c.statut !== 'EN_ATTENTE_RH') return false;
        const s = new Date(c.dateDebut); s.setHours(0, 0, 0, 0);
        const e = new Date(c.dateFin);   e.setHours(23, 59, 59, 999);
        const d = new Date(day);         d.setHours(12, 0, 0, 0);
        return d >= s && d <= e;
      })
      .map(c => `${c.employePrenom?.[0] ?? ''}${c.employeNom?.[0] ?? ''}`);
  }

  getStatutClass(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE_MANAGER: 'att-mgr',
      EN_ATTENTE_RH:      'att-rh',
      VALIDEE:            'valide',
      REJETEE:            'rejete'
    };
    return map[s] ?? 'att-rh';
  }

  getStatutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE_MANAGER: 'Att. Manager',
      EN_ATTENTE_RH:      'Att. RH',
      VALIDEE:            'Validé',
      REJETEE:            'Refusé'
    };
    return map[s] ?? s;
  }

  getInit(p: string, n: string): string {
    return ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase();
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }

  ouvrirDetail(c: any): void {
    this.detailConge.set(c);
  }
}