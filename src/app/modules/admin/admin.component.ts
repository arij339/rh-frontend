import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
type Tab = 'overview' | 'employes'
         | 'demandes' | 'audit' | 'securite';

type DemandeType = 'conges' | 'autorisations'
                 | 'reclamations' | 'avances';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
  <div class="admin fade-in">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="icon-inline">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </span>
          Espace Administrateur
        </h1>
        <p>Supervision complète du système RH</p>
      </div>
      <div class="header-badges">
        <span class="hb-item primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ users().length }} utilisateurs
        </span>
        <span class="hb-item warning"
              *ngIf="getDemandesEnAttente() > 0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ getDemandesEnAttente() }} en attente
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab"
                [class.active]="activeTab() === 'overview'"
                (click)="setTab('overview')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Vue d'ensemble
        </button>
        <button class="tab"
                [class.active]="activeTab() === 'employes'"
                (click)="setTab('employes')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Employés
          <span class="tab-count">{{ employes().length }}</span>
        </button>
        <button class="tab"
                [class.active]="activeTab() === 'demandes'"
                (click)="setTab('demandes')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Demandes
          <span class="tab-count warning"
                *ngIf="getDemandesEnAttente() > 0">
            {{ getDemandesEnAttente() }}
          </span>
        </button>
        <button class="tab"
                [class.active]="activeTab() === 'audit'"
                (click)="setTab('audit')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Audit Logs
        </button>
        <button class="tab"
                [class.active]="activeTab() === 'securite'"
                (click)="setTab('securite')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Sécurité
          <span class="tab-count danger"
                *ngIf="getLockedCount() > 0">
            {{ getLockedCount() }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="loading()">
      <div class="loading-spinner"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- ========================= -->
    <!-- TAB : VUE D'ENSEMBLE      -->
    <!-- ========================= -->
    <div *ngIf="!loading() && activeTab() === 'overview'"
         class="tab-content fade-in">

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let k of getKPIs()">
          <div class="kpi-icon" [class]="k.color"
               [innerHTML]="k.iconSvg  | safeHtml ">
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ k.value }}</span>
            <span class="kpi-label">{{ k.label }}</span>
          </div>
          <div class="kpi-trend" *ngIf="k.sub">{{ k.sub }}</div>
        </div>
      </div>

      <!-- 2 colonnes -->
      <div class="overview-cols">

        <!-- Dernières demandes -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Dernières demandes
            </h3>
            <button class="card-link" (click)="setTab('demandes')">
              Voir tout
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="demandes-preview">
            <ng-container *ngFor="let d of getDernieresDemandes()">
              <div class="dp-item">
                <div class="dp-icon" [class]="d.typeClass"
                     [innerHTML]="d.iconSvg | safeHtml">
                </div>
                <div class="dp-body">
                  <span class="dp-titre">{{ d.titre }}</span>
                  <span class="dp-sub">{{ d.employeNom }}</span>
                </div>
                <span class="badge" [class]="getBadgeClass(d.statut)">
                  {{ getStatutLabel(d.statut) }}
                </span>
              </div>
            </ng-container>
            <div class="empty-mini"
                 *ngIf="getDernieresDemandes().length === 0">
              Aucune demande récente
            </div>
          </div>
        </div>

        <!-- Répartition employés -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Répartition par rôle
            </h3>
            <button class="card-link" (click)="setTab('employes')">
              Voir tout
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="role-bars">
            <div class="rb-item" *ngFor="let r of getRoleStats()">
              <div class="rb-label">
                <span>{{ r.label }}</span>
                <strong>{{ r.count }}</strong>
              </div>
              <div class="rb-bar">
                <div class="rb-fill" [class]="r.color"
                     [style.width]="getRolePct(r.count) + '%'">
                </div>
              </div>
            </div>
          </div>

          <!-- Activité récente -->
          <div class="recent-audit">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Activité récente
            </h4>
            <div class="ra-item"
                 *ngFor="let l of auditLogs().slice(0,5)">
              <span class="ra-icon" [class]="getActionColor(l.action)"
                    [innerHTML]="getActionIconSvg(l.action) | safeHtml">
              </span>
              <div class="ra-body">
                <span>{{ l.action }}</span>
                <small>{{ l.userEmail }}</small>
              </div>
              <span class="ra-time">
                {{ l.createdAt | date:'HH:mm' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : EMPLOYÉS            -->
    <!-- ========================= -->
    <div *ngIf="!loading() && activeTab() === 'employes'"
         class="tab-content fade-in">

      <!-- Sous-onglets -->
      <div class="sub-tabs">
        <button class="sub-tab"
                [class.active]="empTab() === 'liste'"
                (click)="empTab.set('liste')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Liste ({{ employes().length }})
        </button>
        <button class="sub-tab"
                [class.active]="empTab() === 'creer'"
                (click)="empTab.set('creer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Créer un compte
        </button>
      </div>

      <!-- Liste employés -->
      <div *ngIf="empTab() === 'liste'">

        <!-- Filtres -->
        <div class="filters-bar">
          <div class="search-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text"
                   placeholder="Nom, email, CIN, matricule..."
                   (input)="empSearch.set($any($event.target).value)"
                   class="search-input" />
          </div>
          <select class="filter-select"
                  (change)="empFilterRole.set($any($event.target).value)">
            <option value="">Tous les rôles</option>
            <option value="EMPLOYE">Employé</option>
            <option value="MANAGER">Manager</option>
            <option value="RH">RH</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div class="card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Matricule</th>
                  <th>CIN</th>
                  <th>Poste / Département</th>
                  <th>Manager</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of getFilteredEmployes()">
                  <td>
                    <div class="user-cell">
                      <div class="emp-avatar">{{ getInitiales(e) }}</div>
                      <div>
                        <strong>{{ e.prenom }} {{ e.nom }}</strong>
                        <small>{{ e.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td><code class="matricule">{{ e.matricule }}</code></td>
                  <td><code class="cin-badge">{{ e.cin || '—' }}</code></td>
                  <td>
                    <span>{{ e.poste }}</span>
                    <small class="dept">{{ e.departement }}</small>
                  </td>
                  <td>
                    <span *ngIf="e.managerNom" class="manager-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      {{ e.managerNom }}
                    </span>
                    <span *ngIf="!e.managerNom" class="text-light">—</span>
                  </td>
                  <td>
                    <span class="badge" [class]="getRoleBadge(e.role)">
                      {{ e.role }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="icon-action" title="Réinitialiser mot de passe"
                              (click)="resetPassword(e)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </button>
                      <button class="icon-action" title="Activer / Désactiver"
                              (click)="toggleStatus(e)">
                        <svg *ngIf="e.enabled" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        <svg *ngIf="!e.enabled" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            {{ getFilteredEmployes().length }} / {{ employes().length }} employé(s)
          </div>
        </div>
      </div>

      <!-- Créer employé -->
      <div *ngIf="empTab() === 'creer'">
        <div class="create-layout">

          <div class="create-card">
            <div class="create-header">
              <div class="ch-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <h3>Créer un nouveau compte</h3>
              <p>Un email avec le mot de passe temporaire sera envoyé automatiquement.</p>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="onCreateUser()">

              <div class="fs-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Identité
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" formControlName="nom" placeholder="Nom"
                         [class.error]="isInvalid('nom')" />
                  <span class="error-msg" *ngIf="isInvalid('nom')">Obligatoire</span>
                </div>
                <div class="form-group">
                  <label>Prénom *</label>
                  <input type="text" formControlName="prenom" placeholder="Prénom"
                         [class.error]="isInvalid('prenom')" />
                  <span class="error-msg" *ngIf="isInvalid('prenom')">Obligatoire</span>
                </div>
                <div class="form-group">
                  <label>CIN * <span class="hint">(identifiant de connexion)</span></label>
                  <input type="text" formControlName="cin" placeholder="Ex: 12345678"
                         [class.error]="isInvalid('cin')" />
                  <span class="error-msg" *ngIf="isInvalid('cin')">Obligatoire</span>
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" formControlName="email"
                         placeholder="email@entreprise.tn"
                         [class.error]="isInvalid('email')" />
                  <span class="error-msg" *ngIf="isInvalid('email')">Email invalide</span>
                </div>
              </div>

              <div class="fs-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Rôle &amp; Poste
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Rôle *</label>
                  <select formControlName="role"
                          [class.error]="isInvalid('role')"
                          (change)="onRoleChange()">
                    <option value="">— Choisir —</option>
                    <option value="EMPLOYE">Employé</option>
                    <option value="MANAGER">Manager</option>
                    <option value="RH">Responsable RH</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                  <span class="error-msg" *ngIf="isInvalid('role')">Obligatoire</span>
                </div>
                <div class="form-group">
                  <label>Département</label>
                  <input type="text" formControlName="departement"
                         placeholder="Ex: IT, Finance..." />
                </div>
                <div class="form-group">
                  <label>Date d'embauche</label>
                  <input type="date" formControlName="dateEmbauche" />
                </div>
                <div class="form-group">
                  <label>Matricule <span class="hint">(auto si vide)</span></label>
                  <input type="text" formControlName="matricule"
                         placeholder="Ex: EMP0001" />
                </div>
              </div>

              <div class="form-group" *ngIf="showManagerField()">
                <div class="fs-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Manager direct
                </div>
                <select formControlName="managerId" class="manager-select">
                  <option [ngValue]="null">— Aucun manager —</option>
                  <option *ngFor="let m of getManagers()" [ngValue]="m.id">
                    {{ m.prenom }} {{ m.nom }} — {{ m.departement }} ({{ m.role }})
                  </option>
                </select>

                <div class="manager-preview" *ngIf="getSelectedManager()">
                  <div class="mp-avatar">
                    {{ getInitiales(getSelectedManager()!) }}
                  </div>
                  <div>
                    <strong>{{ getSelectedManager()!.prenom }} {{ getSelectedManager()!.nom }}</strong>
                    <small>{{ getSelectedManager()!.poste }} — {{ getSelectedManager()!.departement }}</small>
                  </div>
                  <span class="badge" [class]="getRoleBadge(getSelectedManager()!.role)">
                    {{ getSelectedManager()!.role }}
                  </span>
                </div>
              </div>

              <div class="info-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                L'employé se connectera avec son <strong>CIN</strong> et recevra son mot de passe temporaire par email.
              </div>

              <div class="error-alert" *ngIf="createError()">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ createError() }}
              </div>
              <div class="success-alert" *ngIf="createSuccess()">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ createSuccess() }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline"
                        (click)="resetCreateForm()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
                  Réinitialiser
                </button>
                <button type="submit" class="btn btn-primary"
                        [disabled]="createLoading()">
                  <span *ngIf="!createLoading()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Créer le compte
                  </span>
                  <span *ngIf="createLoading()" class="spinner"></span>
                </button>
              </div>

            </form>
          </div>

          <!-- Aide à droite -->
          <div class="help-card">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Ce qui sera créé automatiquement
            </h4>
            <div class="help-list">
              <div class="hl-item">
                <span class="hl-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </span>
                <div>
                  <strong>Profil employé</strong>
                  <p>Avec matricule généré automatiquement</p>
                </div>
              </div>
              <div class="hl-item">
                <span class="hl-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </span>
                <div>
                  <strong>Contrat CDI</strong>
                  <p>Contrat par défaut à la date d'embauche</p>
                </div>
              </div>
              <div class="hl-item">
                <span class="hl-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <div>
                  <strong>Soldes congés</strong>
                  <p>18j annuel + 6j maladie + 3j exceptionnel</p>
                </div>
              </div>
              <div class="hl-item">
                <span class="hl-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div>
                  <strong>Email de bienvenue</strong>
                  <p>Avec mot de passe temporaire</p>
                </div>
              </div>
            </div>

            <!-- Managers disponibles -->
            <div class="managers-available" *ngIf="getManagers().length > 0">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Managers disponibles
              </h4>
              <div class="ma-item" *ngFor="let m of getManagers()">
                <div class="ma-avatar">{{ getInitiales(m) }}</div>
                <div>
                  <strong>{{ m.prenom }} {{ m.nom }}</strong>
                  <small>{{ m.departement }} — {{ m.role }}</small>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : DEMANDES            -->
    <!-- ========================= -->
    <div *ngIf="!loading() && activeTab() === 'demandes'"
         class="tab-content fade-in">

      <!-- Sous-onglets demandes -->
      <div class="sub-tabs">
        <button class="sub-tab"
                *ngFor="let dt of demandeTypes"
                [class.active]="demandeTab() === dt.key"
                (click)="demandeTab.set(dt.key)">
          <span [innerHTML]="dt.iconSvg | safeHtml"></span>
          {{ dt.label }}
          <span class="tab-count-sm" *ngIf="getDemandeCount(dt.key) > 0">
            {{ getDemandeCount(dt.key) }}
          </span>
        </button>
      </div>

      <!-- Filtres communs -->
      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher..."
                 (input)="demandeSearch.set($any($event.target).value)"
                 class="search-input" />
        </div>
        <select class="filter-select"
                (change)="demandeFilterStatut.set($any($event.target).value)">
          <option value="">Tous les statuts</option>
          <option *ngFor="let s of getAllStatuts()" [value]="s.value">{{ s.label }}</option>
        </select>
      </div>

      <!-- ===== CONGÉS ===== -->
      <div *ngIf="demandeTab() === 'conges'">
        <div class="demande-stats">
          <div class="ds-item" *ngFor="let s of getCongesStats()">
            <span [class]="s.color">{{ s.value }}</span>
            <small>{{ s.label }}</small>
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
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of getFilteredConges()">
                  <td>
                    <div class="user-cell">
                      <div class="emp-avatar">
                        {{ getInitialesStr(c.employePrenom, c.employeNom) }}
                      </div>
                      <div>
                        <strong>{{ c.employeNom }} {{ c.employePrenom }}</strong>
                        <small>{{ c.employeDepartement }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-info">{{ c.typeConge }}</span></td>
                  <td>{{ c.dateDebut | date:'dd/MM/yy' }} → {{ c.dateFin | date:'dd/MM/yy' }}</td>
                  <td><strong>{{ c.joursOuvrables }}j</strong></td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(c.statut)">
                      {{ getStatutLabel(c.statut) }}
                    </span>
                  </td>
                  <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== AUTORISATIONS ===== -->
      <div *ngIf="demandeTab() === 'autorisations'">
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
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of getFilteredAutorisations()">
                  <td>
                    <div class="user-cell">
                      <div class="emp-avatar">
                        {{ getInitialesStr(a.employePrenom, a.employeNom) }}
                      </div>
                      <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
                    </div>
                  </td>
                  <td>{{ a.dateSortie | date:'dd/MM/yyyy' }}</td>
                  <td>{{ a.heureSortie }} → {{ a.heureRetourPrevue }}</td>
                  <td>
                    <span class="type-chip" [class]="a.typeSortie?.toLowerCase()">
                      {{ a.typeSortie }}
                    </span>
                  </td>
                  <td>{{ a.dureePrevueFormatee }}</td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(a.statut)">
                      {{ getStatutLabel(a.statut) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== RÉCLAMATIONS ===== -->
      <div *ngIf="demandeTab() === 'reclamations'">
        <div class="card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Employé</th>
                  <th>Objet</th>
                  <th>Type</th>
                  <th>Urgence</th>
                  <th>Statut</th>
                  <th>Éval.</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of getFilteredReclamations()">
                  <td><code class="ticket">{{ r.numeroTicket }}</code></td>
                  <td>
                    <span *ngIf="!r.anonyme">{{ r.employeNom }} {{ r.employePrenom }}</span>
                    <span *ngIf="r.anonyme" class="anon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Anonyme
                    </span>
                  </td>
                  <td><span class="objet-cell">{{ r.objet | slice:0:40 }}...</span></td>
                  <td>{{ getTypeReclamLabel(r.typeReclamation) }}</td>
                  <td>
                    <span class="urgence-badge" [class]="r.niveauUrgence?.toLowerCase()">
                      <span [innerHTML]="getUrgenceIconSvg(r.niveauUrgence)"></span>
                      {{ r.niveauUrgence }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(r.statut)">
                      {{ getStatutLabel(r.statut) }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="r.noteEvaluation" class="eval-stars">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {{ r.noteEvaluation }}/5
                    </span>
                    <span *ngIf="!r.noteEvaluation" class="text-light">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== AVANCES ===== -->
      <div *ngIf="demandeTab() === 'avances'">
        <div class="card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Montant</th>
                  <th>Accordé</th>
                  <th>Remboursé</th>
                  <th>Mensualités</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of getFilteredAvances()">
                  <td>
                    <div class="user-cell">
                      <div class="emp-avatar">
                        {{ getInitialesStr(a.employePrenom, a.employeNom) }}
                      </div>
                      <div>
                        <strong>{{ a.employeNom }} {{ a.employePrenom }}</strong>
                        <small>{{ a.employeDepartement }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ a.montantDemande | number:'1.3-3' }} DT</td>
                  <td>
                    <span *ngIf="a.montantAccorde">{{ a.montantAccorde | number:'1.3-3' }} DT</span>
                    <span *ngIf="!a.montantAccorde" class="text-light">—</span>
                  </td>
                  <td>
                    <span *ngIf="a.montantRembourse > 0">{{ a.montantRembourse | number:'1.3-3' }} DT</span>
                    <span *ngIf="!a.montantRembourse" class="text-light">—</span>
                  </td>
                  <td>{{ a.nombreMensualites }} mois</td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(a.statut)">
                      {{ getStatutLabel(a.statut) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : AUDIT LOGS          -->
    <!-- ========================= -->
    <div *ngIf="!loading() && activeTab() === 'audit'"
         class="tab-content fade-in">

      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Action, email, détails..."
                 (input)="auditSearch.set($any($event.target).value)"
                 class="search-input" />
        </div>
        <select class="filter-select"
                (change)="auditFilterAction.set($any($event.target).value)">
          <option value="">Toutes les actions</option>
          <option *ngFor="let a of getUniqueActions()" [value]="a">{{ a }}</option>
        </select>
      </div>

      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Entité</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of getFilteredLogs()">
                <td class="date-cell">{{ l.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                <td><span class="email-cell">{{ l.userEmail }}</span></td>
                <td>
                  <span class="action-badge" [class]="getActionColor(l.action)">
                    <span [innerHTML]="getActionIconSvg(l.action) | safeHtml"></span>
                    {{ l.action }}
                  </span>
                </td>
                <td>{{ l.entity }}</td>
                <td class="details-cell">
                  {{ l.details?.substring(0, 50) }}
                  <span *ngIf="l.details?.length > 50">...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          {{ getFilteredLogs().length }} / {{ auditLogs().length }} entrée(s)
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- TAB : SÉCURITÉ            -->
    <!-- ========================= -->
    <div *ngIf="!loading() && activeTab() === 'securite'"
         class="tab-content fade-in">

      <div class="alert-banner" *ngIf="getLockedUsers().length > 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <strong>{{ getLockedUsers().length }} compte(s) verrouillé(s)</strong>
        <span>— Action requise</span>
      </div>

      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher un utilisateur..."
                 (input)="secSearch.set($any($event.target).value)"
                 class="search-input" />
        </div>
        <div class="filter-btns">
          <button class="filter-btn" [class.active]="secFilter() === ''"
                  (click)="secFilter.set('')">Tous</button>
          <button class="filter-btn" [class.active]="secFilter() === 'locked'"
                  (click)="secFilter.set('locked')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Verrouillés
          </button>
          <button class="filter-btn" [class.active]="secFilter() === 'disabled'"
                  (click)="secFilter.set('disabled')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Désactivés
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut compte</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of getFilteredUsers()">
                <td>
                  <div class="user-cell">
                    <div class="emp-avatar">{{ getInitialesStr(u.prenom, u.nom) }}</div>
                    <strong>{{ u.nom }} {{ u.prenom }}</strong>
                  </div>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge" [class]="getRoleBadge(u.role)">{{ u.role }}</span>
                </td>
                <td>
                  <div class="statut-indicators">
                    <span class="status-dot"
                          [class.active]="u.enabled"
                          [class.inactive]="!u.enabled"
                          [title]="u.enabled ? 'Actif' : 'Désactivé'">
                      <svg *ngIf="u.enabled" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg *ngIf="!u.enabled" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </span>
                    <span *ngIf="!u.accountNonLocked" class="locked-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Verrouillé
                    </span>
                    <span *ngIf="u.mustChangePassword" class="pwd-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                      MDP temp.
                    </span>
                  </div>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="icon-action"
                            [title]="u.enabled ? 'Désactiver' : 'Activer'"
                            (click)="toggleStatus(u)">
                      <svg *ngIf="u.enabled" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <svg *ngIf="!u.enabled" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="icon-action" title="Déverrouiller"
                            *ngIf="!u.accountNonLocked"
                            (click)="unlockUser(u.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                    </button>
                    <button class="icon-action" title="Reset mot de passe"
                            (click)="resetPassword(u)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                    <button class="icon-action" title="Voir audit"
                            (click)="voirAuditUser(u)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal audit utilisateur -->
      <div class="modal-overlay" *ngIf="selectedUserAudit()"
           (click)="selectedUserAudit.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Audit — {{ selectedUserAudit()?.prenom }} {{ selectedUserAudit()?.nom }}
            </h3>
            <button class="modal-close" (click)="selectedUserAudit.set(null)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="audit-item" *ngFor="let l of userAuditLogs()">
              <span class="ai-icon" [class]="getActionColor(l.action)"
                    [innerHTML]="getActionIconSvg(l.action) | safeHtml">
              </span>
              <div class="ai-content">
                <strong>{{ l.action }}</strong>
                <p>{{ l.details }}</p>
                <small>{{ l.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
            </div>
            <div class="empty-mini" *ngIf="userAuditLogs().length === 0">
              Aucun log pour cet utilisateur
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" [class.show]="toast().show"
         [class]="'toast ' + toast().type">
      <span [innerHTML]="getToastIconSvg(toast().type) | safeHtml"></span>
      {{ toast().message }}
    </div>

  </div>
  `,
  styles: [`
    .admin { max-width: 100%; }

    // ===== HEADER =====
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
    }

    h1 {
      display: flex; align-items: center; gap: 10px;
    }

    .icon-inline {
      display: inline-flex; align-items: center;
      color: var(--primary);
    }

    .header-badges { display: flex; gap: 8px; flex-wrap: wrap; }

    .hb-item {
      padding: 6px 14px; border-radius: 20px;
      font-size: 13px; font-weight: 600;
      display: flex; align-items: center; gap: 6px;

      &.primary { background: var(--accent); color: var(--primary); }
      &.warning { background: #FEFCBF; color: #744210; }
    }

    // ===== TABS =====
    .tabs-wrapper { margin-bottom: 24px; }

    .tabs {
      display: flex; gap: 4px; background: white;
      padding: 6px; border-radius: 14px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.08);
      flex-wrap: wrap;
    }

    .tab {
      padding: 10px 18px; border: none; background: none;
      border-radius: 10px; cursor: pointer; font-size: 13px;
      font-weight: 600; color: var(--text-light);
      transition: all 0.2s;
      display: flex; align-items: center; gap: 8px;

      svg { flex-shrink: 0; }

      &:hover { background: var(--accent); color: var(--primary); }

      &.active {
        background: var(--primary); color: white;
        box-shadow: 0 4px 12px rgba(11,110,126,0.3);
      }
    }

    .tab-count {
      padding: 2px 8px; border-radius: 10px;
      font-size: 11px; font-weight: 700;
      background: var(--accent); color: var(--primary);

      &.warning { background: #FEFCBF; color: #744210; }
      &.danger  { background: #FED7D7; color: #822727; }
    }

    .tab.active .tab-count {
      background: rgba(255,255,255,0.25); color: white;
    }

    // ===== SUB TABS =====
    .sub-tabs {
      display: flex; gap: 4px; margin-bottom: 20px; flex-wrap: wrap;
    }

    .sub-tab {
      padding: 8px 16px; border: 2px solid var(--gray-mid);
      background: white; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600; color: var(--text-light);
      transition: all 0.2s; display: flex; align-items: center; gap: 6px;

      svg { flex-shrink: 0; }

      &:hover { border-color: var(--secondary); color: var(--primary); }
      &.active {
        border-color: var(--primary); color: var(--primary);
        background: var(--accent);
      }
    }

    .tab-count-sm {
      background: var(--warning); color: white;
      padding: 1px 6px; border-radius: 8px; font-size: 10px;
      font-weight: 700;
    }

    // ===== LOADING =====
    .loading-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px; gap: 16px; color: var(--text-light);

      .loading-spinner {
        width: 48px; height: 48px;
        border: 4px solid var(--accent-mid);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    // ===== KPI =====
    .kpi-grid {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 16px; margin-bottom: 24px;
    }

    .kpi-card {
      background: white; border-radius: 14px; padding: 16px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.08);
      display: flex; align-items: center; gap: 12px;
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }

    .kpi-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;

      &.primary { background: var(--accent); color: var(--primary); }
      &.success { background: #C6F6D5; color: #276749; }
      &.warning { background: #FEFCBF; color: #744210; }
      &.danger  { background: #FED7D7; color: #822727; }
      &.info    { background: #BEE3F8; color: #2A69AC; }

      svg { display: block; }
    }

    .kpi-body {
      flex: 1;
      .kpi-value {
        font-size: 22px; font-weight: 800;
        color: var(--primary-dark); display: block;
      }
      .kpi-label { font-size: 11px; color: var(--text-light); }
    }

    .kpi-trend {
      font-size: 11px; color: var(--text-light); white-space: nowrap;
    }

    // ===== OVERVIEW =====
    .overview-cols {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }

    .card {
      background: white; border-radius: 16px; padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.08);
      margin-bottom: 20px;

      .card-header {
        display: flex; align-items: center;
        justify-content: space-between; margin-bottom: 16px;

        h3 {
          font-size: 15px; font-weight: 700;
          color: var(--primary-dark);
          display: flex; align-items: center; gap: 7px;
          svg { color: var(--primary); flex-shrink: 0; }
        }

        .card-link {
          background: none; border: none; cursor: pointer;
          font-size: 13px; color: var(--primary); font-weight: 600;
          display: flex; align-items: center; gap: 3px;
          &:hover { text-decoration: underline; }
        }
      }
    }

    .demandes-preview {
      display: flex; flex-direction: column; gap: 10px;
    }

    .dp-item {
      display: flex; align-items: center; gap: 12px;
      padding: 8px; border-radius: 8px; transition: background 0.15s;
      &:hover { background: var(--accent); }

      .dp-icon {
        width: 34px; height: 34px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;

        &.conge  { background: #C6F6D5; color: #276749; }
        &.sortie { background: #BEE3F8; color: #2A69AC; }
        &.reclam { background: #FED7D7; color: #822727; }
        &.avance { background: #FEFCBF; color: #744210; }

        svg { display: block; }
      }

      .dp-body {
        flex: 1;
        .dp-titre { font-size: 13px; font-weight: 600;
                    color: var(--text); display: block; }
        .dp-sub   { font-size: 11px; color: var(--text-light); }
      }
    }

    // ===== ROLE BARS =====
    .role-bars {
      display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;
    }

    .rb-item {
      .rb-label {
        display: flex; justify-content: space-between;
        font-size: 12px; margin-bottom: 4px;
        span  { color: var(--text-light); font-weight: 600; }
        strong { color: var(--primary); }
      }
      .rb-bar {
        height: 6px; background: var(--gray-mid);
        border-radius: 3px; overflow: hidden;
        .rb-fill {
          height: 100%; border-radius: 3px; transition: width 0.5s ease;
          &.primary { background: var(--primary); }
          &.success { background: var(--success); }
          &.warning { background: var(--warning); }
          &.info    { background: var(--secondary); }
          &.danger  { background: var(--danger); }
        }
      }
    }

    .recent-audit {
      border-top: 1px solid var(--gray-mid); padding-top: 14px;

      h4 {
        font-size: 13px; font-weight: 700;
        color: var(--primary-dark); margin-bottom: 10px;
        display: flex; align-items: center; gap: 6px;
        svg { color: var(--primary); }
      }
    }

    .ra-item {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 0; border-bottom: 1px solid var(--gray-light);
      &:last-child { border-bottom: none; }

      .ra-icon {
        width: 28px; height: 28px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        svg { display: block; }
      }
      .ra-body {
        flex: 1;
        span  { font-size: 12px; font-weight: 700;
                color: var(--primary); display: block; }
        small { font-size: 11px; color: var(--text-light); }
      }
      .ra-time { font-size: 11px; color: var(--text-light); }
    }

    // ===== DEMANDE STATS =====
    .demande-stats {
      display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
    }

    .ds-item {
      background: white; padding: 10px 16px; border-radius: 10px;
      box-shadow: 0 2px 8px rgba(11,110,126,0.06);
      display: flex; flex-direction: column; gap: 3px; text-align: center;

      span  { font-size: 20px; font-weight: 800; }
      small { font-size: 11px; color: var(--text-light); }

      .primary { color: var(--primary); }
      .success { color: var(--success); }
      .warning { color: var(--warning); }
      .danger  { color: var(--danger); }
    }

    // ===== TABLE =====
    .user-cell {
      display: flex; align-items: center; gap: 8px;
      strong { font-size: 13px; color: var(--text); display: block; }
      small  { font-size: 11px; color: var(--text-light); }
    }

    .emp-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .matricule {
      background: var(--accent); color: var(--primary);
      padding: 2px 8px; border-radius: 6px; font-size: 11px;
    }

    .cin-badge {
      background: #EBF8FF; color: #2B6CB0;
      padding: 2px 8px; border-radius: 6px; font-size: 11px;
    }

    .dept  { display: block; font-size: 11px; color: var(--text-light); }

    .manager-tag {
      font-size: 12px; color: var(--text);
      display: flex; align-items: center; gap: 4px;
      svg { color: var(--primary); }
    }

    .text-light { color: var(--text-light); font-size: 12px; }

    .ticket {
      background: var(--accent); color: var(--primary);
      padding: 2px 8px; border-radius: 6px;
      font-size: 11px; font-family: monospace;
    }

    .anon {
      color: #553C9A; font-size: 12px; font-weight: 600;
      display: flex; align-items: center; gap: 4px;
    }

    .objet-cell { font-size: 13px; color: var(--text); }

    .eval-stars {
      display: flex; align-items: center; gap: 3px;
      color: #D69E2E; font-size: 12px; font-weight: 600;
    }

    .type-chip {
      padding: 3px 10px; border-radius: 12px;
      font-size: 11px; font-weight: 600;
      &.personnel     { background: #BEE3F8; color: #2A69AC; }
      &.professionnel { background: var(--accent); color: var(--primary); }
      &.medical       { background: #C6F6D5; color: #276749; }
    }

    .urgence-badge {
      padding: 3px 8px; border-radius: 6px;
      font-size: 11px; font-weight: 600;
      display: flex; align-items: center; gap: 4px;
      &.urgente { background: #FED7D7; color: #822727; }
      &.normale { background: #FEFCBF; color: #744210; }
      &.faible  { background: #C6F6D5; color: #276749; }

      svg { display: block; }
    }

    .table-footer {
      padding: 10px 16px; font-size: 12px;
      color: var(--text-light); text-align: right;
      border-top: 1px solid var(--gray-mid);
    }

    // ===== SEARCH =====
    .search-wrapper {
      position: relative; flex: 1;
      .search-icon {
        position: absolute; left: 12px; top: 50%;
        transform: translateY(-50%); color: var(--text-light);
        pointer-events: none;
      }
      .search-input { padding-left: 38px !important; }
    }

    // ===== CREATE FORM =====
    .create-layout {
      display: grid; grid-template-columns: 1fr 300px;
      gap: 24px; align-items: start;
    }

    .create-card {
      background: white; border-radius: 20px; padding: 28px;
      box-shadow: 0 4px 20px rgba(11,110,126,0.1);
    }

    .create-header {
      text-align: center; margin-bottom: 24px;

      .ch-icon {
        width: 64px; height: 64px; border-radius: 18px;
        background: var(--accent); display: flex;
        align-items: center; justify-content: center;
        margin: 0 auto 10px; color: var(--primary);
        svg { display: block; }
      }

      h3 { font-size: 18px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 4px; }
      p  { color: var(--text-light); font-size: 12px; }
    }

    .fs-title {
      font-size: 12px; font-weight: 700; color: var(--primary);
      background: var(--accent); padding: 6px 12px;
      border-radius: 6px; margin: 16px 0 10px;
      border-left: 3px solid var(--primary);
      display: flex; align-items: center; gap: 7px;
      svg { flex-shrink: 0; }
    }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }

    .hint { font-size: 11px; color: var(--text-light); font-weight: 400; }

    .manager-select {
      width: 100%; padding: 12px 14px;
      border: 2px solid var(--gray-mid); border-radius: 10px;
      font-size: 13px; outline: none; background: white;
      cursor: pointer; transition: border-color 0.2s; margin-bottom: 10px;
      &:focus { border-color: var(--secondary); }
    }

    .manager-preview {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; background: var(--accent);
      border-radius: 10px; border: 1px solid var(--accent-mid);

      .mp-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        background: var(--primary); color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; flex-shrink: 0;
      }

      strong { font-size: 13px; color: var(--text); display: block; }
      small  { font-size: 11px; color: var(--text-light); }
    }

    .info-box {
      background: var(--accent); border: 1px solid var(--accent-mid);
      border-radius: 10px; padding: 10px 14px;
      font-size: 12px; color: var(--primary);
      margin: 12px 0; line-height: 1.5;
      display: flex; align-items: center; gap: 8px;
      svg { flex-shrink: 0; }
    }

    .form-actions {
      display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px;
    }

    // ===== HELP CARD =====
    .help-card {
      background: white; border-radius: 16px; padding: 20px;
      box-shadow: 0 2px 12px rgba(11,110,126,0.08);

      h4 {
        font-size: 14px; font-weight: 700;
        color: var(--primary-dark); margin-bottom: 14px;
        display: flex; align-items: center; gap: 7px;
        svg { color: var(--primary); }
      }
    }

    .help-list { display: flex; flex-direction: column; gap: 12px; }

    .hl-item {
      display: flex; gap: 10px; align-items: flex-start;

      .hl-icon {
        width: 34px; height: 34px; border-radius: 8px;
        background: var(--accent); color: var(--primary);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        svg { display: block; }
      }

      strong { font-size: 13px; color: var(--text); display: block; }
      p      { font-size: 11px; color: var(--text-light); line-height: 1.4; }
    }

    .managers-available {
      margin-top: 16px; padding-top: 14px;
      border-top: 1px solid var(--gray-mid);

      h4 {
        font-size: 13px; font-weight: 700;
        color: var(--primary-dark); margin-bottom: 10px;
        display: flex; align-items: center; gap: 6px;
        svg { color: var(--primary); }
      }
    }

    .ma-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--gray-light);
      &:last-child { border-bottom: none; }

      .ma-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700; color: white; flex-shrink: 0;
      }

      strong { font-size: 12px; color: var(--text); display: block; }
      small  { font-size: 11px; color: var(--text-light); }
    }

    // ===== SÉCURITÉ =====
    .alert-banner {
      display: flex; align-items: center; gap: 10px;
      background: #FFF5F5; border: 1px solid #FED7D7;
      border-radius: 12px; padding: 14px 18px;
      margin-bottom: 16px; font-size: 14px;
      svg { color: var(--danger); flex-shrink: 0; }
      strong { color: var(--danger); }
    }

    .filter-btns { display: flex; gap: 6px; }

    .filter-btn {
      padding: 8px 14px; border-radius: 8px;
      border: 2px solid var(--gray-mid); background: white;
      cursor: pointer; font-size: 12px; font-weight: 600;
      color: var(--text-light); transition: all 0.2s;
      display: flex; align-items: center; gap: 5px;
      svg { flex-shrink: 0; }

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
    }

    .statut-indicators { display: flex; align-items: center; gap: 6px; }

    .status-dot {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;

      &.active   { background: #C6F6D5; color: #276749; }
      &.inactive { background: #FED7D7; color: #822727; }
    }

    .locked-tag {
      background: #FED7D7; color: #822727;
      padding: 2px 8px; border-radius: 6px; font-size: 11px;
      font-weight: 600; display: flex; align-items: center; gap: 4px;
      svg { flex-shrink: 0; }
    }

    .pwd-tag {
      background: #FEFCBF; color: #744210;
      padding: 2px 8px; border-radius: 6px; font-size: 11px;
      font-weight: 600; display: flex; align-items: center; gap: 4px;
      svg { flex-shrink: 0; }
    }

    // ===== AUDIT =====
    .date-cell    { font-size: 11px; color: var(--text-light); white-space: nowrap; }
    .email-cell   { font-size: 12px; color: var(--text); }
    .details-cell { font-size: 11px; color: var(--text-light); max-width: 200px; }

    .action-badge {
      padding: 3px 8px; border-radius: 6px; font-size: 11px;
      font-weight: 600; display: inline-flex; align-items: center; gap: 5px;

      &.create  { background: #C6F6D5; color: #276749; }
      &.update  { background: #BEE3F8; color: #2A69AC; }
      &.delete  { background: #FED7D7; color: #822727; }
      &.auth    { background: var(--accent); color: var(--primary); }
      &.warning { background: #FEFCBF; color: #744210; }

      svg { display: block; }
    }

    // ===== MODAL =====
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    }

    .modal {
      background: white; border-radius: 20px; width: 560px;
      max-height: 80vh; display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);

      .modal-header {
        padding: 20px 24px; border-bottom: 1px solid var(--gray-mid);
        display: flex; align-items: center; justify-content: space-between;

        h3 {
          font-size: 15px; font-weight: 700;
          color: var(--primary-dark);
          display: flex; align-items: center; gap: 8px;
          svg { color: var(--primary); }
        }

        .modal-close {
          width: 32px; height: 32px; border: none;
          background: var(--gray-light); border-radius: 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          &:hover { background: #FED7D7; color: var(--danger); }
        }
      }

      .modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
    }

    .audit-item {
      display: flex; gap: 10px; padding: 10px 0;
      border-bottom: 1px solid var(--gray-light);
      &:last-child { border-bottom: none; }

      .ai-icon {
        width: 32px; height: 32px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        svg { display: block; }

        &.create  { background: #C6F6D5; color: #276749; }
        &.update  { background: #BEE3F8; color: #2A69AC; }
        &.delete  { background: #FED7D7; color: #822727; }
        &.auth    { background: var(--accent); color: var(--primary); }
        &.warning { background: #FEFCBF; color: #744210; }
      }

      .ai-content {
        flex: 1;
        strong { font-size: 12px; color: var(--primary); display: block; }
        p      { font-size: 12px; color: var(--text); margin: 3px 0; }
        small  { font-size: 11px; color: var(--text-light); }
      }
    }

    // ===== BADGES =====
    .badge {
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; display: inline-block;

      &.badge-success  { background: #C6F6D5; color: #276749; }
      &.badge-warning  { background: #FEFCBF; color: #744210; }
      &.badge-danger   { background: #FED7D7; color: #822727; }
      &.badge-info     { background: var(--accent); color: var(--primary); }
      &.badge-gray     { background: var(--gray-mid); color: var(--text-light); }
      &.badge-admin    { background: #E9D8FD; color: #553C9A; }
      &.badge-rh       { background: var(--accent); color: var(--primary); }
      &.badge-manager  { background: #FEFCBF; color: #744210; }
      &.badge-employe  { background: #C6F6D5; color: #276749; }
    }

    .action-btns { display: flex; gap: 4px; }

    .icon-action {
      width: 32px; height: 32px; border: none;
      background: var(--gray-light); border-radius: 8px;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light);
      svg { display: block; }

      &:hover { background: var(--accent); color: var(--primary);
                transform: scale(1.1); }
    }

    // ===== FILTERS =====
    .filters-bar {
      display: flex; gap: 12px; margin-bottom: 16px;
      align-items: center; flex-wrap: wrap;
    }

    .search-input {
      width: 100%; padding: 10px 16px;
      border: 2px solid var(--gray-mid); border-radius: 10px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
      &:focus { border-color: var(--secondary); }
    }

    .filter-select {
      padding: 10px 14px; border: 2px solid var(--gray-mid);
      border-radius: 10px; font-size: 13px; outline: none;
      background: white; cursor: pointer;
      transition: border-color 0.2s;
      &:focus { border-color: var(--secondary); }
    }

    // ===== EMPTY =====
    .empty-mini {
      padding: 20px; text-align: center;
      color: var(--text-light); font-size: 13px;
      background: var(--gray-light); border-radius: 8px;
    }

    // ===== ALERTS =====
    .error-alert {
      background: #FFF5F5; border: 1px solid #FED7D7;
      color: var(--danger); padding: 12px; border-radius: 10px;
      margin-bottom: 12px; font-size: 13px;
      display: flex; align-items: center; gap: 8px;
      svg { flex-shrink: 0; }
    }

    .success-alert {
      background: #F0FFF4; border: 1px solid #C6F6D5;
      color: var(--success); padding: 12px; border-radius: 10px;
      margin-bottom: 12px; font-size: 13px;
      display: flex; align-items: center; gap: 8px;
      svg { flex-shrink: 0; }
    }

    // ===== TOAST =====
    .toast {
      position: fixed; bottom: 24px; right: 24px;
      padding: 14px 20px; border-radius: 12px;
      font-size: 14px; font-weight: 600;
      transform: translateY(80px); opacity: 0;
      transition: all 0.3s ease; z-index: 2000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: flex; align-items: center; gap: 8px;

      svg { display: block; flex-shrink: 0; }

      &.show    { transform: translateY(0); opacity: 1; }
      &.success { background: #C6F6D5; color: #276749; }
      &.error   { background: #FED7D7; color: #822727; }
      &.info    { background: var(--accent); color: var(--primary); }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    .btn {
      padding: 10px 20px; border-radius: 10px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      border: none; display: flex; align-items: center; gap: 6px;
      transition: all 0.2s;

      &.btn-primary {
        background: var(--primary); color: white;
        &:hover { background: var(--primary-dark); }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }

      &.btn-outline {
        background: none; border: 2px solid var(--gray-mid);
        color: var(--text-light);
        &:hover { border-color: var(--primary); color: var(--primary); }
      }

      svg { flex-shrink: 0; }
    }

    @keyframes spin   { to { transform: rotate(360deg); } }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .fade-in { animation: fadeIn 0.25s ease; }
    .tab-content { animation: fadeIn 0.2s ease; }
  `]
})
export class AdminComponent implements OnInit {

  private adminService = inject(AdminService);
  private fb           = inject(FormBuilder);

  activeTab  = signal<Tab>('overview');
  loading    = signal(true);
  empTab     = signal<'liste' | 'creer'>('liste');
  demandeTab = signal<DemandeType>('conges');

  // Data
  users         = signal<any[]>([]);
  employes      = signal<any[]>([]);
  conges        = signal<any[]>([]);
  autorisations = signal<any[]>([]);
  reclamations  = signal<any[]>([]);
  avances       = signal<any[]>([]);
  auditLogs     = signal<any[]>([]);

  selectedUserAudit = signal<any>(null);
  userAuditLogs     = signal<any[]>([]);

  // Filtres
  empSearch           = signal('');
  empFilterRole       = signal('');
  demandeSearch       = signal('');
  demandeFilterStatut = signal('');
  auditSearch         = signal('');
  auditFilterAction   = signal('');
  secSearch           = signal('');
  secFilter           = signal('');

  // Create
  createLoading = signal(false);
  createError   = signal('');
  createSuccess = signal('');

  toast = signal<{show:boolean; message:string; type:string}>(
    { show: false, message: '', type: 'success' }
  );

  // SVG inline helpers — retournent du HTML sûr à injecter via [innerHTML]
  private readonly SVG_USERS = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  private readonly SVG_CALENDAR = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  private readonly SVG_MEGAPHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`;
  private readonly SVG_BANKNOTE = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`;
  private readonly SVG_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  private readonly SVG_EXIT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

  demandeTypes = [
    {
      key: 'conges' as DemandeType,
      label: 'Congés',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      key: 'autorisations' as DemandeType,
      label: 'Autorisations',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
    },
    {
      key: 'reclamations' as DemandeType,
      label: 'Réclamations',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    },
    {
      key: 'avances' as DemandeType,
      label: 'Avances',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`
    }
  ];

  createForm = this.fb.group({
    nom:          ['', Validators.required],
    prenom:       ['', Validators.required],
    cin:          ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    role:         ['', Validators.required],
    departement:  [''],
    dateEmbauche: [''],
    matricule:    [''],
    managerId:    [null]
  });

  ngOnInit(): void {
    this.adminService.loadAllData().subscribe({
      next: (data) => {
        this.users.set(data.users                 ?? []);
        this.employes.set(data.employes           ?? []);
        this.conges.set(data.conges               ?? []);
        this.autorisations.set(data.autorisations ?? []);
        this.reclamations.set(data.reclamations   ?? []);
        this.avances.set(data.avances             ?? []);
        this.auditLogs.set(data.auditLogs         ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement admin:', err);
        this.loading.set(false);
      }
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  onRoleChange(): void {
    const role = this.createForm.get('role')?.value;
    if (role === 'ADMIN') this.createForm.get('managerId')?.setValue(null);
  }

  showManagerField(): boolean {
    const role = this.createForm.get('role')?.value;
    return !!role && role !== 'ADMIN';
  }

  getManagers(): any[] {
    return this.employes().filter(e =>
      e.role === 'MANAGER' || e.role === 'RH' || e.role === 'ADMIN'
    );
  }

  getSelectedManager(): any {
    const id = this.createForm.get('managerId')?.value;
    if (!id) return null;
    return this.employes().find(e => e.id == id) ?? null;
  }

  onCreateUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.createLoading.set(true);
    this.createError.set('');
    this.createSuccess.set('');

    const payload = {
      ...this.createForm.value,
      managerId: this.createForm.value.managerId
        ? Number(this.createForm.value.managerId) : null
    };

    this.adminService.createUser(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.createSuccess.set('Compte créé avec succès ! Email envoyé.');
        this.resetCreateForm();
        this.adminService.getAllEmployes().subscribe(d => this.employes.set(d));
        this.adminService.getAllUsers().subscribe(d => this.users.set(d));
        setTimeout(() => { this.createSuccess.set(''); this.empTab.set('liste'); }, 2000);
      },
      error: (err) => {
        this.createLoading.set(false);
        this.createError.set(err.error?.message ?? 'Erreur lors de la création.');
      }
    });
  }

  resetCreateForm(): void {
    this.createForm.reset({ managerId: null });
    this.createError.set('');
  }

  toggleStatus(user: any): void {
    if (!confirm(`${user.enabled ? 'Désactiver' : 'Activer'} le compte de ${user.nom} ${user.prenom} ?`)) return;
    this.adminService.toggleStatus(user.id).subscribe({
      next: () => {
        this.employes.update(l => l.map(e => e.id === user.id ? { ...e, enabled: !e.enabled } : e));
        this.users.update(l => l.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u));
        this.showToast(`Compte ${user.enabled ? 'désactivé' : 'activé'}`, 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  unlockUser(userId: number): void {
    this.adminService.unlockAccount(userId).subscribe({
      next: () => {
        this.users.update(l => l.map(u => u.id === userId
          ? { ...u, accountNonLocked: true, failedAttempts: 0 } : u));
        this.showToast('Compte déverrouillé !', 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  resetPassword(user: any): void {
    if (!confirm(`Réinitialiser le mot de passe de ${user.nom} ${user.prenom} ?`)) return;
    this.adminService.resetPassword(user.id).subscribe({
      next: () => this.showToast('Mot de passe réinitialisé — email envoyé', 'success'),
      error: () => this.showToast('Erreur', 'error')
    });
  }

  voirAuditUser(user: any): void {
    this.selectedUserAudit.set(user);
    this.adminService.getUserAuditLogs(user.id).subscribe({
      next: (logs) => this.userAuditLogs.set(logs),
      error: () => this.userAuditLogs.set([])
    });
  }

  // ===================================================================
  // COMPUTED
  // ===================================================================
  getKPIs() {
    return [
      {
        iconSvg: this.SVG_USERS, label: 'Employés', color: 'primary',
        value: this.employes().length,
        sub: `${this.users().length} comptes`
      },
      {
        iconSvg: this.SVG_CALENDAR, label: 'Congés', color: 'info',
        value: this.conges().length,
        sub: `${this.conges().filter(c => c.statut?.includes('ATTENTE')).length} en attente`
      },
      {
        iconSvg: this.SVG_MEGAPHONE, label: 'Réclamations', color: 'warning',
        value: this.reclamations().length,
        sub: `${this.reclamations().filter(r => r.statut === 'NOUVELLE').length} nouvelles`
      },
      {
        iconSvg: this.SVG_BANKNOTE, label: 'Avances', color: 'success',
        value: this.avances().length,
        sub: `${this.avances().filter(a => a.statut === 'EN_COURS').length} en cours`
      },
      {
        iconSvg: this.SVG_LOCK, label: 'Verrouillés', color: 'danger',
        value: this.getLockedCount(),
        sub: `${this.users().filter(u => !u.enabled).length} désactivés`
      }
    ];
  }

  getDemandesEnAttente(): number {
    return this.conges().filter(c => c.statut?.includes('ATTENTE')).length +
      this.autorisations().filter(a => a.statut?.includes('ATTENTE')).length +
      this.reclamations().filter(r => r.statut === 'NOUVELLE').length +
      this.avances().filter(a => a.statut?.includes('ATTENTE')).length;
  }

  getLockedCount(): number { return this.users().filter(u => !u.accountNonLocked).length; }
  getLockedUsers(): any[]  { return this.users().filter(u => !u.accountNonLocked); }

  getDernieresDemandes(): any[] {
    const calSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const exitSvg = this.SVG_EXIT;
    const chatSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

    const all = [
      ...this.conges().slice(0,3).map(c => ({
        iconSvg: calSvg, typeClass: 'conge',
        titre: c.typeConge,
        employeNom: `${c.employeNom} ${c.employePrenom}`,
        statut: c.statut
      })),
      ...this.autorisations().slice(0,2).map(a => ({
        iconSvg: exitSvg, typeClass: 'sortie',
        titre: a.typeSortie,
        employeNom: `${a.employeNom} ${a.employePrenom}`,
        statut: a.statut
      })),
      ...this.reclamations().slice(0,2).map(r => ({
        iconSvg: chatSvg, typeClass: 'reclam',
        titre: r.objet?.substring(0,30),
        employeNom: r.anonyme ? 'Anonyme' : `${r.employeNom} ${r.employePrenom}`,
        statut: r.statut
      }))
    ];
    return all.slice(0,8);
  }

  getRoleStats() {
    return [
      { label: 'Employés', key: 'EMPLOYE', color: 'success' },
      { label: 'Managers', key: 'MANAGER', color: 'warning' },
      { label: 'RH',       key: 'RH',      color: 'info' },
      { label: 'Admins',   key: 'ADMIN',   color: 'primary' }
    ].map(r => ({ ...r, count: this.employes().filter(e => e.role === r.key).length }));
  }

  getRolePct(count: number): number {
    const total = this.employes().length;
    return total ? Math.round((count / total) * 100) : 0;
  }

  getDemandeCount(type: DemandeType): number {
    const map: Record<DemandeType, any[]> = {
      conges: this.conges(), autorisations: this.autorisations(),
      reclamations: this.reclamations(), avances: this.avances()
    };
    return map[type].filter(d => d.statut?.includes('ATTENTE') || d.statut === 'NOUVELLE').length;
  }

  getCongesStats() {
    const c = this.conges();
    return [
      { value: c.length, label: 'Total', color: 'primary' },
      { value: c.filter(x => x.statut?.includes('ATTENTE')).length, label: 'En attente', color: 'warning' },
      { value: c.filter(x => x.statut === 'VALIDEE').length,        label: 'Validés',    color: 'success' },
      { value: c.filter(x => x.statut === 'REJETEE').length,        label: 'Rejetés',    color: 'danger'  }
    ];
  }

  getFilteredEmployes(): any[] {
    return this.employes().filter(e => {
      const t = this.empSearch().toLowerCase();
      const r = this.empFilterRole();
      const m = !t ||
        e.nom?.toLowerCase().includes(t)       ||
        e.prenom?.toLowerCase().includes(t)    ||
        e.email?.toLowerCase().includes(t)     ||
        e.matricule?.toLowerCase().includes(t) ||
        e.cin?.toLowerCase().includes(t);
      return m && (!r || e.role === r);
    });
  }

  getFilteredConges(): any[] {
    return this.conges().filter(c => {
      const t = this.demandeSearch().toLowerCase(); const s = this.demandeFilterStatut();
      return (!t || c.employeNom?.toLowerCase().includes(t) || c.employePrenom?.toLowerCase().includes(t))
        && (!s || c.statut === s);
    });
  }

  getFilteredAutorisations(): any[] {
    return this.autorisations().filter(a => {
      const t = this.demandeSearch().toLowerCase(); const s = this.demandeFilterStatut();
      return (!t || a.employeNom?.toLowerCase().includes(t) || a.employePrenom?.toLowerCase().includes(t))
        && (!s || a.statut === s);
    });
  }

  getFilteredReclamations(): any[] {
    return this.reclamations().filter(r => {
      const t = this.demandeSearch().toLowerCase(); const s = this.demandeFilterStatut();
      return (!t || r.objet?.toLowerCase().includes(t) || r.employeNom?.toLowerCase().includes(t))
        && (!s || r.statut === s);
    });
  }

  getFilteredAvances(): any[] {
    return this.avances().filter(a => {
      const t = this.demandeSearch().toLowerCase(); const s = this.demandeFilterStatut();
      return (!t || a.employeNom?.toLowerCase().includes(t) || a.employePrenom?.toLowerCase().includes(t))
        && (!s || a.statut === s);
    });
  }

  getFilteredLogs(): any[] {
    return this.auditLogs().filter(l => {
      const t = this.auditSearch().toLowerCase(); const a = this.auditFilterAction();
      return (!t || l.action?.toLowerCase().includes(t) || l.userEmail?.toLowerCase().includes(t) || l.details?.toLowerCase().includes(t))
        && (!a || l.action === a);
    });
  }

  getFilteredUsers(): any[] {
    return this.users().filter(u => {
      const t = this.secSearch().toLowerCase(); const sf = this.secFilter();
      const m = !t || u.nom?.toLowerCase().includes(t) || u.prenom?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t);
      const f = sf === 'locked' ? !u.accountNonLocked : sf === 'disabled' ? !u.enabled : true;
      return m && f;
    });
  }

  getUniqueActions(): string[] {
    return [...new Set(this.auditLogs().map(l => l.action))].sort();
  }

  getAllStatuts() {
    return [
      { value: 'EN_ATTENTE_MANAGER', label: 'Attente Manager' },
      { value: 'EN_ATTENTE_RH',      label: 'Attente RH' },
      { value: 'VALIDEE',            label: 'Validée' },
      { value: 'REJETEE',            label: 'Rejetée' },
      { value: 'ANNULEE',            label: 'Annulée' },
      { value: 'EN_COURS',           label: 'En cours' },
      { value: 'NOUVELLE',           label: 'Nouvelle' },
      { value: 'RESOLUE',            label: 'Résolue' },
      { value: 'CLOTUREE',           label: 'Clôturée' },
      { value: 'SOLDEE',             label: 'Soldée' }
    ];
  }

  // ===================================================================
  // HELPERS
  // ===================================================================
  isInvalid(field: string): boolean {
    const c = this.createForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getInitiales(e: any): string {
    return this.getInitialesStr(e.prenom, e.nom);
  }

  getInitialesStr(prenom: string, nom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  getRoleBadge(role: string): string {
    const map: Record<string,string> = {
      ADMIN: 'badge badge-admin', RH: 'badge badge-rh',
      MANAGER: 'badge badge-manager', EMPLOYE: 'badge badge-employe'
    };
    return map[role] ?? 'badge badge-gray';
  }

  getBadgeClass(statut: string): string {
    if (!statut) return 'badge badge-gray';
    if (statut.includes('ATTENTE'))                       return 'badge badge-warning';
    if (statut === 'VALIDEE' || statut === 'RESOLUE')     return 'badge badge-success';
    if (statut === 'REJETEE')                             return 'badge badge-danger';
    if (statut === 'NOUVELLE')                            return 'badge badge-info';
    if (statut === 'EN_COURS')                            return 'badge badge-warning';
    if (statut === 'SOLDEE')                              return 'badge badge-success';
    return 'badge badge-gray';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string,string> = {
      EN_ATTENTE_MANAGER: 'Attente Manager', EN_ATTENTE_RH: 'Attente RH',
      VALIDEE: 'Validée', REJETEE: 'Rejetée', ANNULEE: 'Annulée',
      EN_COURS: 'En cours', NOUVELLE: 'Nouvelle',
      EN_COURS_RECLAM: 'En cours', RESOLUE: 'Résolue',
      CLOTUREE: 'Clôturée', SOLDEE: 'Soldée'
    };
    return map[statut] ?? statut;
  }

  getTypeReclamLabel(type: string): string {
    const map: Record<string,string> = {
      SALAIRE: 'Salaire', CONDITIONS_TRAVAIL: 'Conditions',
      MATERIEL_EQUIPEMENT: 'Matériel',
      RELATIONS_PROFESSIONNELLES: 'Relations', AUTRE: 'Autre'
    };
    return map[type] ?? type;
  }

  getUrgenceIconSvg(u: string): string {
    const svgCircle = (color: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="${color}" stroke="none"><circle cx="12" cy="12" r="10"/></svg>`;
    const map: Record<string,string> = {
      URGENTE: svgCircle('#E53E3E'),
      NORMALE: svgCircle('#D69E2E'),
      FAIBLE:  svgCircle('#38A169')
    };
    return map[u] ?? svgCircle('#A0AEC0');
  }

  getActionIconSvg(action: string): string {
    if (action?.includes('CREATE'))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    if (action?.includes('UPDATE') || action?.includes('CHANGE') || action?.includes('RESET'))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    if (action?.includes('DELETE') || action?.includes('DISABLE'))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
    if (action?.includes('LOGIN'))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
    if (action?.includes('LOCK') || action?.includes('UNLOCK'))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  }

  getActionColor(action: string): string {
    if (action?.includes('CREATE'))  return 'create';
    if (action?.includes('UPDATE') || action?.includes('CHANGE')) return 'update';
    if (action?.includes('DELETE') || action?.includes('DISABLE') || action?.includes('LOCK')) return 'delete';
    if (action?.includes('LOGIN'))   return 'auth';
    return 'warning';
  }

  getToastIconSvg(type: string): string {
    if (type === 'success')
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    if (type === 'error')
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}