import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'liste' | 'creer' | 'modifier';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  users:       `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  list:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  userPlus:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  search:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  x:           `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrowLeft:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  save:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  // Section title icons
  user:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lock:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  briefcase:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  userTie:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  alertOctagon:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Help card icons
  folderPlus:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
  fileText:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  beach:       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.5 12c0 4.4-3.6 8-8 8"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M7 2.2A10 10 0 0 0 2 12"/></svg>`,
  mail:        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  // No manager warning
  alertTriangle:`<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  infoCircle:  `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Ticket
  ticket:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>`,
  // Toast
  toastOk:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
};

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="employes fade-in">

  <!-- ── Header ── -->
  <div class="page-header">
    <div class="ph-left">
      <div class="ph-icon">
        <span [innerHTML]="ic.users | safeHtml"></span>
      </div>
      <div>
        <h1>Gestion des Employés</h1>
        <p>Créez et gérez les comptes employés</p>
      </div>
    </div>
    <button class="btn btn-primary" (click)="setTab('creer')">
      <span [innerHTML]="ic.plus | safeHtml"></span> Nouvel employé
    </button>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-bar">
    <button class="tab-btn" [class.active]="activeTab() === 'liste'" (click)="setTab('liste')">
      <span [innerHTML]="ic.list | safeHtml"></span>
      Liste des employés
      <span class="tc">{{ employes().length }}</span>
    </button>
    <button class="tab-btn" [class.active]="activeTab() === 'creer'" (click)="setTab('creer')">
      <span [innerHTML]="ic.userPlus | safeHtml"></span>
      Créer un employé
    </button>
    <button class="tab-btn" *ngIf="selectedEmploye()" [class.active]="activeTab() === 'modifier'" (click)="setTab('modifier')">
      <span [innerHTML]="ic.edit | safeHtml"></span>
      {{ selectedEmploye()?.prenom }} {{ selectedEmploye()?.nom }}
    </button>
  </div>

  <!-- ===================== LISTE ===================== -->
  <div *ngIf="activeTab() === 'liste'" class="tab-content fade-in">

    <div class="stats-row">
      <div class="stat-card" *ngFor="let s of getRoleStats()" [class.clickable]="true" [class.active]="s.role === filterRole()" (click)="filterRole.set(s.role === filterRole() ? '' : s.role)">
        <span class="sc-value" [class]="s.color">{{ s.count }}</span>
        <span class="sc-label">{{ s.label }}</span>
        <div class="sc-indicator" *ngIf="s.role === filterRole()">
          <span [innerHTML]="ic.check | safeHtml"></span>
        </div>
      </div>
    </div>

    <div class="filters-row">
      <div class="search-box">
        <span [innerHTML]="ic.search | safeHtml"></span>
        <input type="text" placeholder="Rechercher par nom, email, CIN..."
               [value]="search()" (input)="search.set($any($event.target).value)" class="sb-input" />
        <button class="sb-clear" *ngIf="search()" (click)="search.set('')">
          <span [innerHTML]="ic.x | safeHtml"></span>
        </button>
      </div>
      <select class="filter-sel" [value]="filterRole()" (change)="filterRole.set($any($event.target).value)">
        <option value="">Tous les rôles</option>
        <option value="EMPLOYE">Employé</option>
        <option value="MANAGER">Manager</option>
        <option value="RH">RH</option>
        <option value="ADMIN">Admin</option>
      </select>
      <select class="filter-sel" [value]="filterDept()" (change)="filterDept.set($any($event.target).value)">
        <option value="">Tous les départements</option>
        <option *ngFor="let d of getDepts()" [value]="d">{{ d }}</option>
      </select>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EMPLOYÉ</th><th>MATRICULE</th><th>POSTE</th>
              <th>DÉPARTEMENT</th><th>MANAGER</th><th>RÔLE</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of getFiltered()" class="tr-hover">
              <td>
                <div class="emp-cell">
                  <div class="emp-av" [style.background]="getAvatarColor(e)">{{ getInitiales(e) }}</div>
                  <div class="emp-info">
                    <strong>{{ e.nom }} {{ e.prenom }}</strong>
                    <small>{{ e.email }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="matricule-tag">
                  <span [innerHTML]="ic.ticket | safeHtml"></span>
                  {{ e.matricule }}
                </div>
              </td>
              <td>{{ e.poste }}</td>
              <td><span class="dept-tag">{{ e.departement }}</span></td>
              <td>
                <div class="manager-cell" *ngIf="e.managerNom">
                  <div class="mgr-av" [style.background]="getAvatarColor({nom: e.managerNom, prenom: e.managerPrenom})">
                    {{ (e.managerPrenom?.[0] ?? '') + (e.managerNom?.[0] ?? '') }}
                  </div>
                  {{ e.managerNom }}
                </div>
                <span *ngIf="!e.managerNom" class="no-data">—</span>
              </td>
              <td>
                <span class="role-badge" [class]="'role-' + e.role?.toLowerCase()">{{ getRoleLabel(e.role) }}</span>
              </td>
              <td>
                <button class="action-btn" title="Modifier" (click)="ouvrirModifier(e)">
                  <span [innerHTML]="ic.edit | safeHtml"></span>
                </button>
              </td>
            </tr>
            <tr *ngIf="getFiltered().length === 0">
              <td colspan="7" class="empty-row">Aucun employé trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">{{ getFiltered().length }} / {{ employes().length }} employé(s)</div>
    </div>
  </div>

  <!-- ===================== CRÉER ===================== -->
  <div *ngIf="activeTab() === 'creer'" class="tab-content fade-in">
    <div class="form-layout">

      <div class="form-main">
        <div class="form-card">
          <div class="fc-header">
            <div class="fch-icon"><span [innerHTML]="ic.userPlus | safeHtml"></span></div>
            <div>
              <h3>Créer un nouveau compte</h3>
              <p>Un email avec mot de passe temporaire sera envoyé automatiquement.</p>
            </div>
          </div>

          <form [formGroup]="createForm" (ngSubmit)="onCreate()">

            <div class="section-label">
              <span [innerHTML]="ic.user | safeHtml"></span> Identité
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" formControlName="nom" placeholder="Nom de famille" [class.error]="isInvalid('nom')" />
                <span class="err" *ngIf="isInvalid('nom')">Obligatoire</span>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" formControlName="prenom" placeholder="Prénom" [class.error]="isInvalid('prenom')" />
                <span class="err" *ngIf="isInvalid('prenom')">Obligatoire</span>
              </div>
              <div class="form-group">
                <label>CIN * <span class="hint">connexion</span></label>
                <input type="text" formControlName="cin" placeholder="Ex: 12345678" [class.error]="isInvalid('cin')" />
                <span class="err" *ngIf="isInvalid('cin')">Obligatoire</span>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" formControlName="email" placeholder="email@entreprise.tn" [class.error]="isInvalid('email')" />
                <span class="err" *ngIf="isInvalid('email')">Email invalide</span>
              </div>
            </div>

            <div class="section-label">
              <span [innerHTML]="ic.lock | safeHtml"></span> Rôle & Poste
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Rôle *</label>
                <select formControlName="role" [class.error]="isInvalid('role')" (change)="onRoleChange()">
                  <option value="">— Choisir —</option>
                  <option value="EMPLOYE">Employé</option>
                  <option value="MANAGER">Manager</option>
                  <option value="RH">Responsable RH</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <span class="err" *ngIf="isInvalid('role')">Obligatoire</span>
              </div>
              <div class="form-group">
                <label>Département</label>
                <input type="text" formControlName="departement" placeholder="IT, Finance, RH..." />
              </div>
              <div class="form-group">
                <label>Date d'embauche</label>
                <input type="date" formControlName="dateEmbauche" />
              </div>
              <div class="form-group">
                <label>Matricule <span class="hint">auto si vide</span></label>
                <input type="text" formControlName="matricule" placeholder="Ex: EMP0001" />
              </div>
            </div>

            <div class="section-label" *ngIf="showManagerSelect()">
              <span [innerHTML]="ic.userTie | safeHtml"></span>
              Manager direct <span class="hint">optionnel</span>
            </div>

            <div class="form-group manager-field" *ngIf="showManagerSelect()">
              <div class="manager-list-select">
                <div class="mls-option" [class.selected]="!createForm.get('managerId')?.value" (click)="createForm.get('managerId')?.setValue(null)">
                  <div class="mls-av none-av">—</div>
                  <span>Aucun manager</span>
                </div>
                <div class="mls-option" *ngFor="let m of getManagersList()"
                     [class.selected]="createForm.get('managerId')?.value == m.id"
                     (click)="createForm.get('managerId')?.setValue(m.id)">
                  <div class="mls-av" [style.background]="getAvatarColor(m)">{{ getInitiales(m) }}</div>
                  <div class="mls-info">
                    <strong>{{ m.prenom }} {{ m.nom }}</strong>
                    <small>{{ m.poste }} — {{ m.departement }}
                      <span class="role-badge sm" [class]="'role-' + m.role?.toLowerCase()">{{ getRoleLabel(m.role) }}</span>
                    </small>
                  </div>
                  <span class="mls-check" *ngIf="createForm.get('managerId')?.value == m.id">
                    <span [innerHTML]="ic.check | safeHtml"></span>
                  </span>
                </div>
                <div class="mls-empty" *ngIf="getManagersList().length === 0">
                  <span [innerHTML]="ic.alertTriangle | safeHtml"></span>
                  Aucun manager disponible. Créez d'abord un compte Manager.
                </div>
              </div>
            </div>

            <div class="info-notice">
              <span [innerHTML]="ic.infoCircle | safeHtml"></span>
              Connexion : <strong>CIN</strong> + mot de passe temporaire envoyé par email
            </div>

            <div class="form-alert error" *ngIf="createError()">
              <span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ createError() }}
            </div>
            <div class="form-alert success" *ngIf="createSuccess()">
              <span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ createSuccess() }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="resetCreate()">Réinitialiser</button>
              <button type="submit" class="btn btn-primary" [disabled]="createLoading()">
                <span *ngIf="!createLoading()"><span [innerHTML]="ic.plus | safeHtml"></span> Créer le compte</span>
                <span *ngIf="createLoading()" class="spinner"></span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Help side -->
      <div class="help-side">
        <div class="help-card">
          <h4><span [innerHTML]="ic.checkCircle | safeHtml"></span> Créé automatiquement</h4>
          <div class="hc-list">
            <div class="hc-item">
              <div class="hc-icon teal"><span [innerHTML]="ic.folderPlus | safeHtml"></span></div>
              <div><strong>Profil employé</strong><p>Matricule généré automatiquement</p></div>
            </div>
            <div class="hc-item">
              <div class="hc-icon blue"><span [innerHTML]="ic.fileText | safeHtml"></span></div>
              <div><strong>Contrat CDI</strong><p>À la date d'embauche</p></div>
            </div>
            <div class="hc-item">
              <div class="hc-icon green"><span [innerHTML]="ic.beach | safeHtml"></span></div>
              <div><strong>Soldes congés</strong><p>18j + 6j + 3j initialisés</p></div>
            </div>
            <div class="hc-item">
              <div class="hc-icon amber"><span [innerHTML]="ic.mail | safeHtml"></span></div>
              <div><strong>Email de bienvenue</strong><p>Avec mot de passe temporaire</p></div>
            </div>
          </div>
        </div>

        <div class="managers-card" *ngIf="getManagersList().length > 0">
          <h4><span [innerHTML]="ic.userTie | safeHtml"></span> Managers ({{ getManagersList().length }})</h4>
          <div class="mc-item" *ngFor="let m of getManagersList()">
            <div class="mc-av" [style.background]="getAvatarColor(m)">{{ getInitiales(m) }}</div>
            <div><strong>{{ m.prenom }} {{ m.nom }}</strong><small>{{ m.departement }}</small></div>
          </div>
        </div>

        <div class="no-managers-card" *ngIf="getManagersList().length === 0">
          <div class="nm-icon"><span [innerHTML]="ic.alertTriangle | safeHtml"></span></div>
          <p>Aucun manager disponible.<br/>Créez d'abord un compte Manager ou RH pour l'assigner.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== MODIFIER ===================== -->
  <div *ngIf="activeTab() === 'modifier' && selectedEmploye()" class="tab-content fade-in">
    <div class="modifier-layout">

      <div class="emp-hero">
        <div class="eh-avatar" [style.background]="getAvatarColor(selectedEmploye()!)">
          {{ getInitiales(selectedEmploye()!) }}
        </div>
        <div class="eh-info">
          <h2>{{ selectedEmploye()!.prenom }} {{ selectedEmploye()!.nom }}</h2>
          <p>{{ selectedEmploye()!.poste }} — {{ selectedEmploye()!.departement }}</p>
          <span class="role-badge" [class]="'role-' + selectedEmploye()!.role?.toLowerCase()">{{ getRoleLabel(selectedEmploye()!.role) }}</span>
        </div>
        <button class="btn btn-outline" (click)="setTab('liste')">
          <span [innerHTML]="ic.arrowLeft | safeHtml"></span> Retour
        </button>
      </div>

      <form [formGroup]="editForm" (ngSubmit)="onSaveEdit()">

        <div class="edit-card">
          <div class="ec-header">
            <div class="ec-header-left">
              <div class="ec-icon amber"><span [innerHTML]="ic.briefcase | safeHtml"></span></div>
              <h3>Informations professionnelles</h3>
            </div>
            <span class="ec-badge">Admin / RH uniquement</span>
          </div>
          <div class="grid-3">
            <div class="form-group"><label>Poste</label><input type="text" formControlName="poste" placeholder="Poste actuel" /></div>
            <div class="form-group"><label>Département</label><input type="text" formControlName="departement" placeholder="Département" /></div>
            <div class="form-group"><label>Salaire de base (DT)</label><input type="number" formControlName="salaireBase" placeholder="0.000" step="0.001" /></div>
            <div class="form-group"><label>Matricule</label><input type="text" formControlName="matricule" placeholder="Matricule" /></div>
            <div class="form-group"><label>Date d'embauche</label><input type="date" formControlName="dateEmbauche" /></div>
          </div>

          <div class="form-group" style="margin-top: 16px">
            <label>Manager direct</label>
            <div class="manager-list-select">
              <div class="mls-option" [class.selected]="!editForm.get('managerId')?.value" (click)="editForm.get('managerId')?.setValue(null)">
                <div class="mls-av none-av">—</div><span>Aucun manager</span>
              </div>
              <div class="mls-option" *ngFor="let m of getManagersList()"
                   [class.selected]="editForm.get('managerId')?.value == m.id"
                   (click)="editForm.get('managerId')?.setValue(m.id)">
                <div class="mls-av" [style.background]="getAvatarColor(m)">{{ getInitiales(m) }}</div>
                <div class="mls-info">
                  <strong>{{ m.prenom }} {{ m.nom }}</strong>
                  <small>{{ m.poste }} — {{ m.departement }}</small>
                </div>
                <span class="mls-check" *ngIf="editForm.get('managerId')?.value == m.id">
                  <span [innerHTML]="ic.check | safeHtml"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="edit-card">
          <div class="ec-header">
            <div class="ec-header-left">
              <div class="ec-icon teal"><span [innerHTML]="ic.user | safeHtml"></span></div>
              <h3>Informations personnelles</h3>
            </div>
          </div>
          <div class="grid-3">
            <div class="form-group"><label>CIN</label><input type="text" formControlName="cin" placeholder="CIN" /></div>
            <div class="form-group"><label>Téléphone</label><input type="tel" formControlName="telephone" placeholder="Téléphone" /></div>
            <div class="form-group"><label>Ville</label><input type="text" formControlName="ville" placeholder="Ville" /></div>
            <div class="form-group"><label>Code postal</label><input type="text" formControlName="codePostal" placeholder="Code postal" /></div>
            <div class="form-group"><label>Nationalité</label><input type="text" formControlName="nationalite" placeholder="Nationalité" /></div>
            <div class="form-group"><label>Situation familiale</label><select formControlName="situationFamiliale"><option value="">— Sélectionner —</option><option>Célibataire</option><option>Marié(e)</option><option>Divorcé(e)</option><option>Veuf(ve)</option></select></div>
            <div class="form-group" style="grid-column:span 3"><label>Adresse</label><input type="text" formControlName="adresse" placeholder="Adresse complète" /></div>
          </div>
        </div>

        <div class="edit-card">
          <div class="ec-header">
            <div class="ec-header-left">
              <div class="ec-icon red"><span [innerHTML]="ic.alertOctagon | safeHtml"></span></div>
              <h3>Contact d'urgence</h3>
            </div>
          </div>
          <div class="grid-3">
            <div class="form-group"><label>Nom</label><input type="text" formControlName="contactUrgenceNom" placeholder="Nom du contact" /></div>
            <div class="form-group"><label>Téléphone</label><input type="tel" formControlName="contactUrgenceTelephone" placeholder="Téléphone" /></div>
            <div class="form-group"><label>Relation</label><select formControlName="contactUrgenceRelation"><option value="">— Sélectionner —</option><option>Père</option><option>Mère</option><option>Conjoint(e)</option><option>Frère/Sœur</option><option>Ami(e)</option><option>Autre</option></select></div>
          </div>
        </div>

        <div class="form-alert error" *ngIf="editError()"><span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ editError() }}</div>
        <div class="form-alert success" *ngIf="editSuccess()"><span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ editSuccess() }}</div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="setTab('liste')">Annuler</button>
          <button type="submit" class="btn btn-primary" [disabled]="editLoading()">
            <span *ngIf="!editLoading()"><span [innerHTML]="ic.save | safeHtml"></span> Enregistrer les modifications</span>
            <span *ngIf="editLoading()" class="spinner"></span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" [class.show]="toast().show" [class]="'toast toast--' + toast().type">
    <span *ngIf="toast().type === 'success'" [innerHTML]="ic.toastOk  | safeHtml"></span>
    <span *ngIf="toast().type === 'error'"   [innerHTML]="ic.toastErr | safeHtml"></span>
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

    .employes { max-width: 1200px; padding-bottom: 48px; }

    /* ── Header ── */
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .ph-left { display: flex; align-items: center; gap: 14px; }
    .ph-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 14px rgba(14,157,175,0.3); svg { display: block; } }
    h1 { font-size: 22px; font-weight: 800; color: var(--c-text); margin-bottom: 2px; }
    .page-header p { font-size: 13px; color: var(--c-muted); margin: 0; }

    /* ── Tabs ── */
    .tabs-bar { display: flex; gap: 2px; margin-bottom: 24px; background: white; padding: 5px; border-radius: 14px; box-shadow: var(--sh); flex-wrap: wrap; border: 1px solid var(--c-gray-200); }
    .tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: none; background: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-muted); transition: all 0.2s; white-space: nowrap; svg { display: block; flex-shrink: 0; } .tc { background: var(--c-gray-200); color: var(--c-muted); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; } &:hover { background: var(--c-gray-100); color: var(--c-text); } &.active { background: var(--c-teal); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); svg { stroke: white; } .tc { background: rgba(255,255,255,0.25); color: white; } } }

    /* ── Stats ── */
    .stats-row { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .stat-card { background: white; padding: 14px 20px; border-radius: var(--r); box-shadow: var(--sh); border: 1px solid var(--c-gray-200); display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: all 0.2s; position: relative; &:hover { transform: translateY(-2px); box-shadow: var(--sh-md); } &.active { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.15); } }
    .sc-value { font-size: 26px; font-weight: 800; &.primary { color: var(--c-teal); } &.success { color: var(--c-green); } &.warning { color: var(--c-amber); } &.info { color: var(--c-blue); } &.danger { color: var(--c-red); } }
    .sc-label { font-size: 12px; color: var(--c-muted); font-weight: 500; }
    .sc-indicator { position: absolute; top: 8px; right: 8px; color: var(--c-teal); svg { display: block; width: 13px; height: 13px; } }

    /* ── Filters ── */
    .filters-row { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); padding: 0 12px; transition: border-color 0.2s; min-width: 200px; &:focus-within { border-color: var(--c-teal); } svg { display: block; flex-shrink: 0; color: var(--c-muted); } }
    .sb-input { flex: 1; border: none; outline: none; padding: 10px 0; font-size: 13px; background: transparent; }
    .sb-clear { background: none; border: none; cursor: pointer; color: var(--c-muted); display: flex; align-items: center; svg { display: block; } &:hover { color: var(--c-red); } }
    .filter-sel { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; cursor: pointer; color: var(--c-text); transition: border-color 0.2s; &:focus { border-color: var(--c-teal); } }

    /* ── Table ── */
    .table-card { background: white; border-radius: var(--r-lg); box-shadow: var(--sh); border: 1px solid var(--c-gray-200); overflow: hidden; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: var(--c-gray-100); }
    thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--c-muted); letter-spacing: 0.5px; white-space: nowrap; border-bottom: 1px solid var(--c-gray-200); }
    tbody tr { border-bottom: 1px solid var(--c-gray-100); transition: background 0.15s; &.tr-hover:hover { background: var(--c-gray-100); } }
    tbody td { padding: 13px 16px; font-size: 13px; vertical-align: middle; }

    .emp-cell { display: flex; align-items: center; gap: 10px; strong { display: block; font-size: 13px; color: var(--c-text); } small { font-size: 11px; color: var(--c-muted); } }
    .emp-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
    .emp-info { flex: 1; }
    .matricule-tag { display: inline-flex; align-items: center; gap: 4px; background: var(--c-teal-lt); color: var(--c-teal); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: monospace; svg { display: block; width: 11px; height: 11px; } }
    .dept-tag { background: var(--c-gray-100); color: var(--c-text); padding: 3px 10px; border-radius: 20px; font-size: 12px; }
    .manager-cell { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--c-text); }
    .mgr-av { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: white; flex-shrink: 0; }
    .no-data { color: var(--c-muted); font-size: 13px; }
    .action-btn { width: 32px; height: 32px; border: none; background: var(--c-gray-100); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: all 0.2s; svg { display: block; } &:hover { background: var(--c-teal-lt); color: var(--c-teal); transform: scale(1.1); } }
    .table-foot { padding: 12px 16px; font-size: 12px; color: var(--c-muted); text-align: right; border-top: 1px solid var(--c-gray-200); }
    .empty-row { text-align: center; padding: 40px !important; color: var(--c-muted); font-style: italic; }

    /* ── Role badges ── */
    .role-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; &.sm { font-size: 10px; padding: 1px 6px; } }
    .role-employe  { background: var(--c-green-lt);  color: var(--c-green); }
    .role-manager  { background: var(--c-amber-lt);  color: var(--c-amber); }
    .role-rh       { background: var(--c-teal-lt);   color: var(--c-teal); }
    .role-admin    { background: var(--c-purple-lt); color: var(--c-purple); }

    /* ── Form layout ── */
    .form-layout { display: grid; grid-template-columns: 1fr 270px; gap: 22px; align-items: start; }
    .form-main { display: flex; flex-direction: column; }
    .form-card { background: white; border-radius: 20px; padding: 28px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .fc-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--c-gray-200); }
    .fch-icon { width: 48px; height: 48px; border-radius: 13px; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; svg { display: block; } }
    .fc-header h3 { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0 0 4px; }
    .fc-header p { font-size: 12px; color: var(--c-muted); margin: 0; }

    .section-label { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: var(--c-teal); background: var(--c-teal-lt); padding: 7px 12px; border-radius: 8px; margin: 18px 0 12px; border-left: 3px solid var(--c-teal); svg { display: block; flex-shrink: 0; } }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; label { font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; } }
    .hint { font-size: 10px; color: var(--c-muted); font-weight: 400; text-transform: none; letter-spacing: 0; background: var(--c-gray-200); padding: 1px 6px; border-radius: 4px; margin-left: 4px; }
    .err { font-size: 11px; color: var(--c-red); font-weight: 500; }

    input, select, textarea { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; width: 100%; &:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); } &.error { border-color: var(--c-red); } }

    /* ── Manager list select ── */
    .manager-field { margin-top: 4px; }
    .manager-list-select { border: 1.5px solid var(--c-gray-200); border-radius: var(--r); overflow: hidden; max-height: 270px; overflow-y: auto; transition: border-color 0.2s; &:focus-within { border-color: var(--c-teal); } }
    .mls-option { display: flex; align-items: center; gap: 12px; padding: 11px 14px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--c-gray-100); &:last-child { border-bottom: none; } &:hover { background: var(--c-gray-100); } &.selected { background: var(--c-teal-lt); border-left: 3px solid var(--c-teal); } }
    .mls-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
    .none-av { background: var(--c-gray-200); color: var(--c-muted); font-size: 14px; }
    .mls-info { flex: 1; strong { font-size: 13px; color: var(--c-text); display: block; margin-bottom: 2px; } small { font-size: 11px; color: var(--c-muted); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; } }
    .mls-check { color: var(--c-teal); flex-shrink: 0; svg { display: block; } }
    .mls-empty { display: flex; align-items: center; gap: 8px; padding: 18px; text-align: center; color: var(--c-amber); font-size: 13px; font-weight: 600; background: var(--c-amber-lt); svg { display: block; flex-shrink: 0; color: var(--c-amber); } }

    .info-notice { display: flex; align-items: center; gap: 7px; background: var(--c-teal-lt); border-radius: var(--r); padding: 10px 14px; font-size: 12px; color: var(--c-teal); margin: 16px 0; svg { display: block; flex-shrink: 0; } strong { color: var(--c-teal-dk); } }

    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 12px; svg { flex-shrink: 0; display: block; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--c-gray-200); }

    /* ── Help side ── */
    .help-side { display: flex; flex-direction: column; gap: 14px; }
    .help-card, .managers-card, .no-managers-card { background: white; border-radius: var(--r-lg); padding: 18px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; svg { display: block; } } }
    .hc-list { display: flex; flex-direction: column; gap: 11px; }
    .hc-item { display: flex; gap: 10px; align-items: flex-start; }
    .hc-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); } &.green { background: var(--c-green-lt); color: var(--c-green); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } }
    .hc-item strong { font-size: 12px; color: var(--c-text); display: block; }
    .hc-item p { font-size: 11px; color: var(--c-muted); margin: 0; }
    .mc-item { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--c-gray-100); &:last-child { border-bottom: none; } .mc-av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; } strong { font-size: 12px; color: var(--c-text); display: block; } small { font-size: 11px; color: var(--c-muted); } }
    .no-managers-card { display: flex; gap: 10px; align-items: flex-start; background: var(--c-amber-lt); border: 1px solid #ecc94b; }
    .nm-icon { flex-shrink: 0; color: var(--c-amber); svg { display: block; } }
    .no-managers-card p { font-size: 12px; color: var(--c-amber); line-height: 1.5; margin: 0; }

    /* ── Modifier ── */
    .modifier-layout { display: flex; flex-direction: column; gap: 18px; }
    .emp-hero { background: white; border-radius: var(--r-lg); padding: 18px 22px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .eh-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: white; flex-shrink: 0; }
    .eh-info { flex: 1; h2 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 3px; } p { font-size: 13px; color: var(--c-muted); margin-bottom: 6px; } }

    .edit-card { background: white; border-radius: var(--r-lg); padding: 22px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); margin-bottom: 16px; }
    .ec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--c-gray-200); }
    .ec-header-left { display: flex; align-items: center; gap: 10px; h3 { font-size: 15px; font-weight: 700; color: var(--c-text); margin: 0; } }
    .ec-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } &.red   { background: var(--c-red-lt);   color: var(--c-red); } }
    .ec-badge { font-size: 11px; background: var(--c-teal-lt); color: var(--c-teal); padding: 3px 10px; border-radius: 20px; font-weight: 600; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

    /* ── Buttons ── */
    .btn { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; svg { display: block; flex-shrink: 0; } &.btn-primary { background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(14,157,175,0.4); } } &.btn-outline { background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); &:hover { border-color: var(--c-teal); color: var(--c-teal); } } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; } }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } }

    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class EmployesComponent implements OnInit {

  private http  = inject(HttpClient);
  private auth  = inject(AuthService);
  private fb    = inject(FormBuilder);
  private API   = 'http://localhost:8080/api';

  ic = IC;

  activeTab     = signal<Tab>('liste');
  loading       = signal(true);
  createLoading = signal(false);
  editLoading   = signal(false);
  createError   = signal('');
  createSuccess = signal('');
  editError     = signal('');
  editSuccess   = signal('');

  employes        = signal<any[]>([]);
  selectedEmploye = signal<any>(null);

  search     = signal('');
  filterRole = signal('');
  filterDept = signal('');

  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

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

  editForm = this.fb.group({
    poste: [''], departement: [''], salaireBase: [null], matricule: [''],
    dateEmbauche: [''], managerId: [null], cin: [''], telephone: [''],
    adresse: [''], ville: [''], codePostal: [''], nationalite: [''],
    situationFamiliale: [''], contactUrgenceNom: [''],
    contactUrgenceTelephone: [''], contactUrgenceRelation: ['']
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.http.get<any[]>(`${this.API}/rh/employes`).subscribe({
      next: (data) => { this.employes.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.createError.set(''); this.createSuccess.set(''); this.editError.set(''); this.editSuccess.set(''); }

  onRoleChange(): void { if (this.createForm.get('role')?.value === 'ADMIN') this.createForm.get('managerId')?.setValue(null); }

  showManagerSelect(): boolean { const r = this.createForm.get('role')?.value; return !!r && r !== 'ADMIN'; }

  getManagersList(): any[] { return this.employes().filter(e => ['MANAGER','RH','ADMIN'].includes((e.role ?? '').toUpperCase())); }

  onCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.createLoading.set(true); this.createError.set('');
    const payload = { ...this.createForm.value, managerId: this.createForm.value.managerId ? Number(this.createForm.value.managerId) : null };
    this.http.post(`${this.API}/admin/users`, payload).subscribe({
      next: () => { this.createLoading.set(false); this.createSuccess.set('Compte créé ! Email de bienvenue envoyé.'); this.resetCreate(); this.loadData(); setTimeout(() => { this.createSuccess.set(''); this.setTab('liste'); }, 2000); },
      error: (err) => { this.createLoading.set(false); this.createError.set(err.error?.message ?? 'Erreur lors de la création.'); }
    });
  }

  resetCreate(): void { this.createForm.reset({ managerId: null }); this.createError.set(''); }

  ouvrirModifier(e: any): void {
    this.selectedEmploye.set(e);
    this.editForm.patchValue({
      poste: e.poste ?? '', departement: e.departement ?? '', salaireBase: e.salaireBase ?? null,
      matricule: e.matricule ?? '', dateEmbauche: e.dateEmbauche ?? '', managerId: e.managerId ?? null,
      cin: e.cin ?? '', telephone: e.telephone ?? '', adresse: e.adresse ?? '', ville: e.ville ?? '',
      codePostal: e.codePostal ?? '', nationalite: e.nationalite ?? '',
      situationFamiliale: e.situationFamiliale ?? '', contactUrgenceNom: e.contactUrgenceNom ?? '',
      contactUrgenceTelephone: e.contactUrgenceTelephone ?? '', contactUrgenceRelation: e.contactUrgenceRelation ?? ''
    });
    this.setTab('modifier');
  }

  onSaveEdit(): void {
    const emp = this.selectedEmploye(); if (!emp) return;
    this.editLoading.set(true); this.editError.set('');
    const payload = { ...this.editForm.value, managerId: this.editForm.value.managerId ? Number(this.editForm.value.managerId) : null };
    this.http.put(`${this.API}/rh/employes/${emp.id}`, payload).subscribe({
      next: (data: any) => { this.editLoading.set(false); this.editSuccess.set('Modifications enregistrées avec succès !'); this.employes.update(l => l.map(e => e.id === emp.id ? data : e)); this.selectedEmploye.set(data); setTimeout(() => this.editSuccess.set(''), 3000); },
      error: (err) => { this.editLoading.set(false); this.editError.set(err.error?.message ?? 'Erreur lors de la mise à jour.'); }
    });
  }

  // ── Computed ──
  getRoleStats() {
    const all = this.employes();
    return [
      { role: '',        label: 'Total',    color: 'primary', count: all.length },
      { role: 'EMPLOYE', label: 'Employés', color: 'success', count: all.filter(e => (e.role ?? '').toUpperCase() === 'EMPLOYE').length },
      { role: 'MANAGER', label: 'Managers', color: 'warning', count: all.filter(e => (e.role ?? '').toUpperCase() === 'MANAGER').length },
      { role: 'RH',      label: 'RH',       color: 'info',    count: all.filter(e => (e.role ?? '').toUpperCase() === 'RH').length },
      { role: 'ADMIN',   label: 'Admins',   color: 'danger',  count: all.filter(e => (e.role ?? '').toUpperCase() === 'ADMIN').length }
    ];
  }

  getFiltered(): any[] {
    return this.employes().filter(e => {
      const t = this.search().toLowerCase(); const r = (this.filterRole() ?? '').toUpperCase(); const d = this.filterDept();
      const ms = !t || ['nom','prenom','email','matricule','cin','poste'].some(k => (e[k] ?? '').toLowerCase().includes(t));
      return ms && (!r || (e.role ?? '').toUpperCase() === r) && (!d || e.departement === d);
    });
  }

  getDepts(): string[] { return [...new Set(this.employes().map(e => e.departement).filter(Boolean))].sort() as string[]; }

  // ── Helpers ──
  getInitiales(e: any): string { return ((e.prenom?.[0] ?? '') + (e.nom?.[0] ?? '')).toUpperCase(); }

  getAvatarColor(e: any): string {
    const colors = ['#0B6E7E','#12B5C4','#38A169','#D69E2E','#E53E3E','#805AD5','#DD6B20','#2B6CB0'];
    const key = (e.nom ?? '') + (e.prenom ?? ''); let hash = 0;
    for (const c of key) hash += c.charCodeAt(0);
    return colors[hash % colors.length];
  }

  getRoleLabel(role: string): string {
    const map: Record<string,string> = { EMPLOYE: 'Employé', MANAGER: 'Manager', RH: 'RH', ADMIN: 'Admin' };
    return map[(role ?? '').toUpperCase()] ?? role ?? '—';
  }

  isInvalid(field: string): boolean { const c = this.createForm.get(field); return !!(c?.invalid && c?.touched); }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}