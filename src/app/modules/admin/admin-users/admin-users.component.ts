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
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const SVG = {
  users:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  userPlus: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  edit:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  close:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  search:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  user:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  briefcase:`<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  building: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>`,
  shield:   `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  lock:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  lockOpen: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  key:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  power:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
  save:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  card:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  clock:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mail:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  money:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  calendar: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  info:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  check:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  reset:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>`,
  phone:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  trash:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
  <div class="au-wrap">

    <!-- ═══ HEADER ═══ -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon" [innerHTML]="svg.users | safeHtml"></div>
        <div>
          <h1>Gestion des Utilisateurs</h1>
          <p>Administrez les comptes et les accès de votre organisation</p>
        </div>
      </div>
      <button class="btn-primary"
              (click)="showCreate.set(!showCreate())">
        <span class="btn-icon"
              [innerHTML]="(showCreate() ? svg.close : svg.userPlus) | safeHtml">
        </span>
        {{ showCreate() ? 'Fermer' : 'Créer un compte' }}
      </button>
    </div>

    <!-- ═══ PANNEAU CRÉATION ═══ -->
    <div class="create-panel" *ngIf="showCreate()">
      <div class="cp-head">
        <span class="cp-icon"
              [innerHTML]="svg.userPlus | safeHtml">
        </span>
        <h3>Nouveau compte utilisateur</h3>
      </div>

      <form [formGroup]="form" (ngSubmit)="onCreate()">
        <div class="fg-grid">

          <div class="form-group">
            <label>Nom <span class="req">*</span></label>
            <input formControlName="nom"
                   placeholder="Nom de famille"
                   [class.input-err]="inv('nom')" />
            <span class="err-txt" *ngIf="inv('nom')">
              Champ requis
            </span>
          </div>

          <div class="form-group">
            <label>Prénom <span class="req">*</span></label>
            <input formControlName="prenom"
                   placeholder="Prénom"
                   [class.input-err]="inv('prenom')" />
            <span class="err-txt" *ngIf="inv('prenom')">
              Champ requis
            </span>
          </div>

          <div class="form-group">
            <label>
              CIN <span class="req">*</span>
              <span class="badge-hint">identifiant connexion</span>
            </label>
            <input formControlName="cin"
                   placeholder="12345678"
                   [class.input-err]="inv('cin')" />
            <span class="err-txt" *ngIf="inv('cin')">
              Champ requis
            </span>
          </div>

          <div class="form-group">
            <label>Email <span class="optional">(optionnel)</span></label>
            <input type="email" formControlName="email"
                   placeholder="email@entreprise.tn"
                   [class.input-err]="inv('email')" />
            <span class="err-txt" *ngIf="inv('email')">
              Email invalide
            </span>
          </div>

          <div class="form-group">
            <label>Rôle <span class="req">*</span></label>
            <select formControlName="role"
                    [class.input-err]="inv('role')"
                    (change)="onRoleChange()">
              <option value="">— Choisir un rôle —</option>
              <option value="EMPLOYE">Employé</option>
              <option value="MANAGER">Manager</option>
              <option value="RH">Responsable RH</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            <span class="err-txt" *ngIf="inv('role')">
              Champ requis
            </span>
          </div>

          <div class="form-group">
            <label>Département</label>
            <input formControlName="departement"
                   placeholder="IT, RH, Finance..." />
          </div>

          <div class="form-group">
            <label>Date d'embauche</label>
            <input type="date" formControlName="dateEmbauche" />
          </div>

          <!-- ═══ SOCIÉTÉ (select dynamique + champ "Autre") ═══ -->
          <div class="form-group">
            <label>Société</label>
            <select formControlName="societe">
              <option value="">— Choisir ou laisser vide —</option>
              <option *ngFor="let s of getSocietesDisponibles()" [value]="s">
                {{ s }}
              </option>
              <option value="__autre__">Autre (saisir manuellement)</option>
            </select>
          </div>

          <!-- Champ texte si "Autre" sélectionné -->
          <div class="form-group"
               *ngIf="form.get('societe')?.value === '__autre__'">
            <label>Nom de la société</label>
            <input formControlName="societeCustom"
                   placeholder="Nom de la nouvelle société" />
          </div>

          <div class="form-group" *ngIf="showManagerField()">
            <label>Manager direct</label>
            <select formControlName="managerId">
              <option [ngValue]="null">— Aucun —</option>
              <option *ngFor="let m of managers()"
                      [ngValue]="m.id">
                {{ m.prenom }} {{ m.nom }}
                — {{ m.departement }}
              </option>
            </select>
          </div>

        </div>

        <div class="info-box">
          <span class="ib-icon"
                [innerHTML]="svg.info | safeHtml">
          </span>
          L'employé se connectera avec son <strong>CIN</strong>.
          Un mot de passe temporaire sera envoyé par email.
        </div>

        <div class="alert alert-err" *ngIf="createErr()">
          <span [innerHTML]="svg.warn | safeHtml"></span>
          {{ createErr() }}
        </div>
        <div class="alert alert-ok" *ngIf="createOk()">
          <span [innerHTML]="svg.check | safeHtml"></span>
          {{ createOk() }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-outline"
                  (click)="form.reset({ managerId: null })">
            Réinitialiser
          </button>
          <button type="submit" class="btn-primary"
                  [disabled]="loading()">
            <span *ngIf="!loading()" class="btn-icon"
                  [innerHTML]="svg.userPlus | safeHtml">
            </span>
            <span *ngIf="loading()" class="spin-sm"></span>
            {{ loading() ? 'Création...' : 'Créer le compte' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ═══ FILTRES ═══ -->
    <div class="filters-bar">
      <div class="search-wrap" [class.focused]="searchFocused">
        <span class="s-icon"
              [innerHTML]="svg.search | safeHtml">
        </span>
        <input placeholder="Rechercher par nom, email ou CIN..."
               [value]="search()"
               (input)="search.set($any($event.target).value)"
               (focus)="searchFocused = true"
               (blur)="searchFocused = false" />
        <button class="s-clear" *ngIf="search()"
                (click)="search.set('')"
                [innerHTML]="svg.close | safeHtml">
        </button>
      </div>

      <div class="role-pills">
        <button class="rp-btn"
                [class.rp-active]="roleF() === ''"
                (click)="roleF.set('')">
          Tous
          <span class="rp-count">{{ users().length }}</span>
        </button>
        <button *ngFor="let r of rolePills"
                class="rp-btn"
                [class.rp-active]="roleF() === r.val"
                (click)="roleF.set(r.val)">
          <span [innerHTML]="r.icon | safeHtml"></span>
          {{ r.label }}
          <span class="rp-count">{{ getCount(r.val) }}</span>
        </button>
      </div>
    </div>

    <!-- ═══ TABLE ═══ -->
    <div class="table-card">
      <table class="pro-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>CIN</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Dernière connexion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filtered(); trackBy: trackById">

            <!-- Utilisateur -->
            <td>
              <div class="user-cell">
                <div class="avatar"
                     [class]="'av-' + u.role?.toLowerCase()">
                  {{ init(u) }}
                </div>
                <div class="uc-info">
                  <span class="uc-name">
                    {{ u.nom }} {{ u.prenom }}
                  </span>
                  <span class="uc-email">{{ u.email }}</span>
                </div>
              </div>
            </td>

            <!-- CIN -->
            <td>
              <span class="cin-badge" *ngIf="getCin(u.id)">
                <span [innerHTML]="svg.card | safeHtml"></span>
                {{ getCin(u.id) }}
              </span>
              <span class="cin-none" *ngIf="!getCin(u.id)">—</span>
            </td>

            <!-- Rôle -->
            <td (click)="$event.stopPropagation()">
              <select class="role-sel"
                      [class]="'rs-' + u.role?.toLowerCase()"
                      [value]="u.role"
                      (change)="changeRole(
                        u.id, $any($event.target).value)">
                <option value="EMPLOYE">Employé</option>
                <option value="MANAGER">Manager</option>
                <option value="RH">RH</option>
                <option value="ADMIN">Admin</option>
              </select>
            </td>

            <!-- Statut -->
            <td>
              <div class="status-row">
                <span class="status-dot"
                      [class.dot-on]="u.enabled"
                      [class.dot-off]="!u.enabled">
                </span>
                <span class="status-txt">
                  {{ u.enabled ? 'Actif' : 'Désactivé' }}
                </span>
                <span class="status-tag tag-lock"
                      *ngIf="!u.accountNonLocked">
                  <span [innerHTML]="svg.lock | safeHtml"></span>
                  Verrouillé
                </span>
                <span class="status-tag tag-pwd"
                      *ngIf="u.mustChangePassword">
                  <span [innerHTML]="svg.key | safeHtml"></span>
                  MDP temp.
                </span>
              </div>
            </td>

            <!-- Dernière connexion -->
            <td>
              <span class="last-conn" *ngIf="u.lastLoginAt">
                <span [innerHTML]="svg.clock | safeHtml"></span>
                {{ u.lastLoginAt | date:'dd/MM/yy HH:mm' }}
              </span>
              <span class="never-conn" *ngIf="!u.lastLoginAt">
                Jamais connecté
              </span>
            </td>

            <!-- Actions -->
            <td (click)="$event.stopPropagation()">
              <div class="act-row">

                <!-- ✏️ Modifier le profil -->
                <button class="act-btn act-edit"
                        title="Modifier le profil"
                        (click)="openModal(u)">
                  <span [innerHTML]="svg.edit | safeHtml"></span>
                </button>

                <!-- Activer / Désactiver -->
                <button class="act-btn"
                        [class.act-danger]="u.enabled"
                        [class.act-success]="!u.enabled"
                        [title]="u.enabled ? 'Désactiver' : 'Activer'"
                        (click)="toggleStatus(u)">
                  <span [innerHTML]="svg.power | safeHtml"></span>
                </button>

                <!-- Déverrouiller -->
                <button class="act-btn act-warn"
                        *ngIf="!u.accountNonLocked"
                        title="Déverrouiller"
                        (click)="unlock(u.id)">
                  <span [innerHTML]="svg.lockOpen | safeHtml"></span>
                </button>

                <!-- Reset MDP -->
                <button class="act-btn act-info"
                        title="Réinitialiser le mot de passe"
                        (click)="resetPwd(u.id)">
                  <span [innerHTML]="svg.key | safeHtml"></span>
                </button>

                <!-- 🗑️ Supprimer -->
                <button class="act-btn act-delete"
                        title="Supprimer le compte"
                        (click)="deleteTarget.set(u)">
                  <span [innerHTML]="svg.trash | safeHtml"></span>
                </button>
                <button class="act-btn act-warning"
        title="Définir mot de passe"
        (click)="openSetPassword(u)">
  <span [innerHTML]="svg.key | safeHtml"></span>
</button>

              </div>
            </td>

          </tr>

          <tr *ngIf="filtered().length === 0">
            <td colspan="6">
              <div class="empty-state">
                <span [innerHTML]="svg.search | safeHtml"></span>
                <p>Aucun utilisateur trouvé</p>
                <small *ngIf="search()">
                  pour « {{ search() }} »
                </small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-foot">
        {{ filtered().length }} / {{ users().length }}
        utilisateur(s) affiché(s)
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         MODAL — MODIFIER LE PROFIL
    ════════════════════════════════════════════════════════════════ -->

    <!-- Overlay edit -->
    <div class="modal-overlay"
         *ngIf="modalOpen()"
         (click)="closeModal()">
    </div>

    <!-- Modal edit -->
    <div class="edit-modal" *ngIf="modalOpen()">

      <!-- En-tête -->
      <div class="modal-header">
        <div class="mh-left">
          <div class="modal-avatar"
               [class]="'av-' + editingUser()?.role?.toLowerCase()">
            {{ editingUser() ? init(editingUser()) : '' }}
          </div>
          <div>
            <h2>Modifier le profil</h2>
            <p>
              {{ editingUser()?.prenom }}
              {{ editingUser()?.nom }}
              <span class="role-badge"
                    [class]="'rb-' + editingUser()?.role?.toLowerCase()">
                {{ editingUser()?.role }}
              </span>
            </p>
          </div>
        </div>
        <button class="modal-close"
                (click)="closeModal()"
                [innerHTML]="svg.close | safeHtml">
        </button>
      </div>

      <!-- Corps -->
      <div class="modal-body" *ngIf="editForm">
        <form [formGroup]="editForm" (ngSubmit)="onSaveEdit()">

          <!-- Tabs -->
          <div class="modal-tabs">
            <button type="button"
                    class="mt-btn"
                    [class.mt-active]="editTab() === 'perso'"
                    (click)="editTab.set('perso')">
              <span [innerHTML]="svg.user | safeHtml"></span>
              Informations personnelles
            </button>
            <button type="button"
                    class="mt-btn"
                    [class.mt-active]="editTab() === 'pro'"
                    (click)="editTab.set('pro')">
              <span [innerHTML]="svg.briefcase | safeHtml"></span>
              Informations professionnelles
            </button>
          </div>

          <!-- TAB 1 — INFOS PERSONNELLES -->
          <div class="tab-content" *ngIf="editTab() === 'perso'">

            <div class="section-label">
              <span [innerHTML]="svg.user | safeHtml"></span>
              Identité
            </div>
            <div class="modal-grid">
              <div class="form-group">
                <label>Nom <span class="req">*</span></label>
                <input formControlName="nom"
                       placeholder="Nom de famille"
                       [class.input-err]="invE('nom')" />
                <span class="err-txt" *ngIf="invE('nom')">Requis</span>
              </div>
              <div class="form-group">
                <label>Prénom <span class="req">*</span></label>
                <input formControlName="prenom"
                       placeholder="Prénom"
                       [class.input-err]="invE('prenom')" />
                <span class="err-txt" *ngIf="invE('prenom')">Requis</span>
              </div>
              <div class="form-group">
                <label>
                  CIN <span class="req">*</span>
                  <span class="badge-hint">connexion</span>
                </label>
                <input formControlName="cin"
                       placeholder="12345678"
                       [class.input-err]="invE('cin')" />
                <span class="err-txt" *ngIf="invE('cin')">Requis</span>
              </div>
              <div class="form-group">
                <label>Date de naissance</label>
                <input type="date" formControlName="dateNaissance" />
              </div>
            </div>

            <div class="section-label" style="margin-top:18px">
              <span [innerHTML]="svg.mail | safeHtml"></span>
              Contact
            </div>
            <div class="modal-grid">
              <div class="form-group">
                <label>Email <span class="optional">(optionnel)</span></label>
                <input type="email" formControlName="email"
                       placeholder="email@entreprise.tn"
                       [class.input-err]="invE('email')" />
                <span class="err-txt" *ngIf="invE('email')">Email invalide</span>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input formControlName="telephone"
                       placeholder="+216 XX XXX XXX" />
              </div>
              <div class="form-group" style="grid-column: span 2">
                <label>Adresse</label>
                <input formControlName="adresse"
                       placeholder="Rue, Ville, Code postal" />
              </div>
            </div>

          </div>

          <!-- TAB 2 — INFOS PROFESSIONNELLES -->
          <div class="tab-content" *ngIf="editTab() === 'pro'">

            <div class="section-label">
              <span [innerHTML]="svg.briefcase | safeHtml"></span>
              Poste & Organisation
            </div>
            <div class="modal-grid">
              <div class="form-group">
                <label>Poste / Titre</label>
                <input formControlName="poste"
                       placeholder="Développeur, Comptable..." />
              </div>
              <div class="form-group">
                <label>Département</label>
                <input formControlName="departement"
                       placeholder="IT, RH, Finance..." />
              </div>
              <div class="form-group">
                <label>Société</label>
                <input formControlName="societe"
                       placeholder="Filiale Tunis, Siège Social..." />
              </div>
              <div class="form-group">
                <label>Date d'embauche</label>
                <input type="date" formControlName="dateEmbauche" />
              </div>
              <div class="form-group">
                <label>Type de contrat</label>
                <select formControlName="typeContrat">
                  <option value="">— Choisir —</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Manager direct</label>
                <select formControlName="managerId">
                  <option [ngValue]="null">— Aucun —</option>
                  <option *ngFor="let m of managers()"
                          [ngValue]="m.id"
                          [disabled]="m.id === editingUser()?.id">
                    {{ m.prenom }} {{ m.nom }}
                    — {{ m.departement }}
                  </option>
                </select>
              </div>
            </div>

            <div class="section-label" style="margin-top:18px">
              <span [innerHTML]="svg.money | safeHtml"></span>
              Rémunération
            </div>
            <div class="modal-grid">
              <div class="form-group">
                <label>Salaire de base (DT)</label>
                <div class="input-with-unit">
                  <input type="number"
                         formControlName="salaireBase"
                         placeholder="0.000"
                         min="0" step="0.001" />
                  <span class="input-unit">DT</span>
                </div>
              </div>
              <div class="form-group">
                <label>Ancienneté</label>
                <div class="anciennete-display">
                  <span [innerHTML]="svg.calendar | safeHtml"></span>
                  {{ getAnciennete() }}
                </div>
              </div>
            </div>

            <!-- Récap salaire -->
            <div class="salary-recap"
                 *ngIf="editForm.get('salaireBase')?.value">
              <div class="sr-row">
                <span>Salaire brut mensuel</span>
                <strong>
                  {{ editForm.get('salaireBase')?.value | number:'1.3-3' }} DT
                </strong>
              </div>
              <div class="sr-row muted">
                <span>Salaire brut annuel</span>
                <span>
                  {{ ((editForm.get('salaireBase')?.value ?? 0) * 12) | number:'1.3-3' }} DT
                </span>
              </div>
            </div>

          </div>

          <!-- Alertes -->
          <div class="alert alert-err" *ngIf="editErr()">
            <span [innerHTML]="svg.warn | safeHtml"></span>
            {{ editErr() }}
          </div>
          <div class="alert alert-ok" *ngIf="editOk()">
            <span [innerHTML]="svg.check | safeHtml"></span>
            {{ editOk() }}
          </div>

        </form>
      </div>

      <!-- Footer modal -->
      <div class="modal-footer">
        <button type="button" class="btn-outline"
                (click)="closeModal()">
          Annuler
        </button>
        <button type="button" class="btn-primary"
                [disabled]="editLoading()"
                (click)="onSaveEdit()">
          <span *ngIf="!editLoading()" class="btn-icon"
                [innerHTML]="svg.save | safeHtml">
          </span>
          <span *ngIf="editLoading()" class="spin-sm"></span>
          {{ editLoading() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
        </button>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         MODAL — CONFIRMER LA SUPPRESSION
    ════════════════════════════════════════════════════════════════ -->

    <!-- Overlay delete -->
    <div class="modal-overlay"
         *ngIf="deleteTarget()"
         (click)="deleteTarget.set(null)">
    </div>

    <!-- Delete confirm modal -->
    <div class="delete-modal" *ngIf="deleteTarget()">
      <div class="dm-header">
        <div class="dm-icon-wrap">
          <span [innerHTML]="svg.trash | safeHtml"></span>
        </div>
        <div>
          <h3>Supprimer le compte</h3>
          <p>Cette action est irréversible</p>
        </div>
      </div>
      <div class="dm-body">
        Vous allez supprimer définitivement le compte de
        <strong>{{ deleteTarget()?.prenom }} {{ deleteTarget()?.nom }}</strong>.
        <br /><br />
        Toutes les données associées (congés, historique, fiches de paie)
        seront perdues.
      </div>
      <div class="dm-footer">
        <button class="btn-outline" (click)="deleteTarget.set(null)">
          Annuler
        </button>
        <button class="btn-delete" [disabled]="deleteLoading()"
                (click)="confirmDelete()">
          <span *ngIf="!deleteLoading()"
                [innerHTML]="svg.trash | safeHtml">
          </span>
          <span *ngIf="deleteLoading()" class="spin-sm spin-red"></span>
          {{ deleteLoading() ? 'Suppression...' : 'Supprimer définitivement' }}
        </button>
      </div>
    </div>
    <!-- ═══ MODAL SET PASSWORD ═══ -->
<div class="modal-overlay"
     *ngIf="pwdModalOpen()"
     (click)="pwdModalOpen.set(false)">
</div>
<div class="edit-modal"
     style="width:420px"
     *ngIf="pwdModalOpen()">

  <div class="modal-header">
    <div class="mh-left">
      <div class="modal-avatar"
           [class]="'av-' + pwdUser()?.role?.toLowerCase()">
        {{ pwdUser() ? init(pwdUser()) : '' }}
      </div>
      <div>
        <h2>Définir un mot de passe</h2>
        <p>{{ pwdUser()?.prenom }} {{ pwdUser()?.nom }}</p>
      </div>
    </div>
    <button class="modal-close"
            (click)="pwdModalOpen.set(false)"
            [innerHTML]="svg.close | safeHtml">
    </button>
  </div>

  <div class="modal-body">

    <div class="alert alert-err"
         style="margin-bottom:14px"
         *ngIf="!pwdUser()?.email?.includes('@')">
      <span [innerHTML]="svg.warn | safeHtml"></span>
      Cet employé n'a pas d'email valide — le mot de passe
      devra lui être communiqué manuellement.
    </div>

    <div class="form-group" style="margin-bottom:14px">
      <label>Nouveau mot de passe <span class="req">*</span></label>
      <input [type]="showPwd() ? 'text' : 'password'"
             [(ngModel)]="newPassword"
             placeholder="Minimum 6 caractères" />
    </div>

    <div class="form-group" style="margin-bottom:14px">
      <label>Confirmer le mot de passe <span class="req">*</span></label>
      <input [type]="showPwd() ? 'text' : 'password'"
             [(ngModel)]="confirmPassword"
             placeholder="Répéter le mot de passe" />
    </div>

    <!-- Toggle afficher/masquer -->
    <label style="display:flex;align-items:center;gap:8px;
                  font-size:12px;color:#64748b;cursor:pointer;
                  margin-bottom:14px">
      <input type="checkbox"
             [checked]="showPwd()"
             (change)="showPwd.set(!showPwd())" />
      Afficher le mot de passe
    </label>

    <!-- Résumé visible si showPwd -->
    <div *ngIf="showPwd() && newPassword"
         style="background:#f0fdf4;border:1px solid #86efac;
                border-radius:8px;padding:10px 14px;
                font-size:13px;color:#166534;margin-bottom:14px">
      Mot de passe : <strong>{{ newPassword }}</strong>
      <br>
      <small>Notez ce mot de passe pour le communiquer à l'employé.</small>
    </div>

    <div class="alert alert-err" *ngIf="pwdError()">
      <span [innerHTML]="svg.warn | safeHtml"></span>
      {{ pwdError() }}
    </div>

  </div>

  <div class="modal-footer">
    <button class="btn-outline"
            (click)="pwdModalOpen.set(false)">
      Annuler
    </button>
    <button class="btn-primary"
            [disabled]="pwdLoading()"
            (click)="onSetPassword()">
      <span *ngIf="!pwdLoading()"
            class="btn-icon"
            [innerHTML]="svg.save | safeHtml">
      </span>
      <span *ngIf="pwdLoading()" class="spin-sm"></span>
      {{ pwdLoading() ? 'Enregistrement...' : 'Définir le mot de passe' }}
    </button>
  </div>
</div>

    <!-- ═══ TOAST ═══ -->
    <div class="g-toast"
         [class.toast-show]="toast().show"
         [class.toast-success]="toast().type === 'success'"
         [class.toast-error]="toast().type === 'error'"
         [class.toast-info]="toast().type === 'info'">
      <span *ngIf="toast().type === 'success'"
            [innerHTML]="svg.check | safeHtml">
      </span>
      <span *ngIf="toast().type === 'error'"
            [innerHTML]="svg.warn | safeHtml">
      </span>
      <span *ngIf="toast().type === 'info'"
            [innerHTML]="svg.info | safeHtml">
      </span>
      {{ toast().message }}
    </div>

  </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :host {
      --primary:    #0b6e7e;
      --primary-dk: #085e6c;
      --primary-lt: #e0f7fa;
      --accent:     #00b4c8;
      --text:       #0f172a;
      --muted:      #64748b;
      --border:     #e2e8f0;
      --bg:         #f8fafc;
      --red:        #ef4444;
      --red-lt:     #fef2f2;
      --green:      #22c55e;
      --green-lt:   #f0fdf4;
      --amber:      #f59e0b;
      --amber-lt:   #fffbeb;
      --r:          10px;
      --font:       'Plus Jakarta Sans', sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box; margin: 0; padding: 0;
    }

    .au-wrap {
      max-width: 1200px;
      font-family: var(--font);
      color: var(--text);
    }

    /* ══ HEADER ══ */
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
    }
    .ph-left {
      display: flex; align-items: center; gap: 14px;
    }
    .ph-icon {
      width: 44px; height: 44px; background: var(--primary-lt);
      border-radius: 12px; display: flex; align-items: center;
      justify-content: center; color: var(--primary); flex-shrink: 0;
    }
    .page-header h1 {
      font-size: 20px; font-weight: 700; letter-spacing: -0.3px;
    }
    .page-header p {
      font-size: 12.5px; color: var(--muted); margin-top: 2px;
    }

    /* ══ BUTTONS ══ */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--primary); color: white; border: none;
      border-radius: var(--r); padding: 10px 18px;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 2px 12px rgba(11,110,126,0.25);
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dk); transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(11,110,126,0.32);
    }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-icon { display: flex; align-items: center; }

    .btn-outline {
      display: inline-flex; align-items: center; gap: 7px;
      background: white; color: var(--muted);
      border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 10px 16px;
      font-size: 13px; font-weight: 500; font-family: var(--font);
      cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover {
      border-color: var(--primary); color: var(--primary);
    }

    /* ══ CREATE PANEL ══ */
    .create-panel {
      background: white; border-radius: 16px;
      border: 1.5px solid var(--primary-lt);
      padding: 24px; margin-bottom: 20px;
      box-shadow: 0 2px 16px rgba(11,110,126,0.07);
      animation: slideDown 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cp-head {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 20px;
    }
    .cp-icon {
      width: 34px; height: 34px; background: var(--primary-lt);
      border-radius: 8px; display: flex; align-items: center;
      justify-content: center; color: var(--primary);
    }
    .cp-head h3 { font-size: 15px; font-weight: 700; }

    .fg-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 16px;
    }
    @media (max-width: 1100px) {
      .fg-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 800px) {
      .fg-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .form-group {
      display: flex; flex-direction: column; gap: 5px;
    }
    label {
      font-size: 11.5px; font-weight: 600; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.4px;
      display: flex; align-items: center; gap: 5px;
    }
    .req { color: var(--red); font-size: 13px; }
    .badge-hint {
      font-size: 10px; background: var(--primary-lt);
      color: var(--primary); padding: 1px 7px; border-radius: 4px;
      font-weight: 500; text-transform: none; letter-spacing: 0;
    }

    input, select {
      padding: 9px 12px; border: 1.5px solid var(--border);
      border-radius: var(--r); font-size: 13px;
      font-family: var(--font); color: var(--text);
      background: white; outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      width: 100%;
    }
    input:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,180,200,0.1);
    }
    input.input-err, select.input-err { border-color: var(--red); }
    .err-txt { font-size: 11px; color: var(--red); font-weight: 500; }

    .info-box {
      display: flex; align-items: flex-start; gap: 9px;
      background: var(--primary-lt); border-radius: 8px;
      padding: 11px 14px; font-size: 12.5px;
      color: var(--primary); margin: 12px 0; line-height: 1.55;
    }
    .ib-icon { flex-shrink: 0; margin-top: 1px; }

    .alert {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 13px; border-radius: var(--r);
      margin-bottom: 12px; font-size: 13px; font-weight: 500;
    }
    .alert-err {
      background: var(--red-lt); color: var(--red);
      border: 1px solid #fecaca;
    }
    .alert-ok {
      background: var(--green-lt); color: #166534;
      border: 1px solid #bbf7d0;
    }

    .form-actions {
      display: flex; gap: 10px; justify-content: flex-end;
    }

    /* ══ FILTERS ══ */
    .filters-bar {
      display: flex; gap: 12px; flex-wrap: wrap;
      align-items: center; margin-bottom: 16px;
    }
    .search-wrap {
      flex: 1; min-width: 220px;
      display: flex; align-items: center; gap: 8px;
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 0 12px;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .search-wrap.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,180,200,0.1);
    }
    .s-icon {
      color: var(--muted); display: flex; align-items: center;
      flex-shrink: 0;
    }
    .search-wrap input {
      flex: 1; border: none; outline: none; padding: 10px 0;
      font-size: 13px; background: transparent; box-shadow: none;
      width: auto;
    }
    .search-wrap input:focus { box-shadow: none; }
    .s-clear {
      display: flex; align-items: center; background: none;
      border: none; cursor: pointer; color: var(--muted);
      padding: 2px; transition: color 0.15s;
    }
    .s-clear:hover { color: var(--red); }

    .role-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .rp-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 13px; border: 1.5px solid var(--border);
      background: white; border-radius: 50px; cursor: pointer;
      font-size: 12px; font-weight: 600; font-family: var(--font);
      color: var(--muted); transition: all 0.2s;
    }
    .rp-btn:hover:not(.rp-active) {
      border-color: var(--accent); color: var(--primary);
    }
    .rp-active {
      background: var(--primary); color: white;
      border-color: var(--primary);
    }
    .rp-count {
      padding: 1px 6px; border-radius: 10px;
      font-size: 10.5px; font-weight: 700;
    }
    .rp-active .rp-count { background: rgba(255,255,255,0.25); }
    .rp-btn:not(.rp-active) .rp-count {
      background: var(--border); color: var(--muted);
    }

    /* ══ TABLE ══ */
    .table-card {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(11,110,126,0.07);
      border: 1px solid var(--border);
    }
    .pro-table { width: 100%; border-collapse: collapse; }
    .pro-table thead tr { background: #f8fafc; }
    .pro-table thead th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.6px;
      border-bottom: 1px solid var(--border);
    }
    .pro-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .pro-table tbody tr:hover { background: #f0fafa; }
    .pro-table tbody tr:last-child { border-bottom: none; }
    .pro-table tbody td { padding: 12px 16px; font-size: 13px; }

    .user-cell { display: flex; align-items: center; gap: 11px; }
    .avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .av-admin   { background: #7c3aed; }
    .av-rh      { background: var(--primary); }
    .av-manager { background: #d97706; }
    .av-employe { background: #16a34a; }

    .uc-info { display: flex; flex-direction: column; gap: 2px; }
    .uc-name { font-size: 13px; font-weight: 600; }
    .uc-email { font-size: 11px; color: var(--muted); }

    .cin-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: #eff6ff; color: #1d4ed8;
      padding: 3px 9px; border-radius: 6px;
      font-size: 11.5px; font-weight: 600; font-family: monospace;
    }
    .cin-none { color: var(--muted); font-size: 13px; }

    .role-sel {
      padding: 5px 9px; border-radius: 8px;
      font-size: 11.5px; font-weight: 600;
      border: 1.5px solid transparent; outline: none;
      cursor: pointer; transition: all 0.2s;
      font-family: var(--font);
    }
    .rs-admin   { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }
    .rs-rh      { background: var(--primary-lt); color: var(--primary); border-color: #67e8f9; }
    .rs-manager { background: var(--amber-lt); color: #92400e; border-color: #fcd34d; }
    .rs-employe { background: var(--green-lt); color: #166534; border-color: #86efac; }

    .status-row {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-on  { background: var(--green); }
    .dot-off { background: var(--red); }
    .status-txt { font-size: 12.5px; font-weight: 500; }
    .status-tag {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 7px; border-radius: 4px;
      font-size: 10.5px; font-weight: 600;
    }
    .tag-lock { background: #fef2f2; color: #991b1b; }
    .tag-pwd  { background: var(--amber-lt); color: #92400e; }

    .last-conn {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11.5px; color: var(--muted);
    }
    .never-conn {
      font-size: 11.5px; color: var(--muted); font-style: italic;
    }

    .act-row { display: flex; gap: 5px; }
    .act-btn {
      width: 30px; height: 30px; border: 1.5px solid var(--border);
      background: white; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: all 0.18s;
    }
    .act-btn:hover { transform: scale(1.1); }
    .act-edit:hover {
      background: var(--primary-lt);
      border-color: var(--accent); color: var(--primary);
    }
    .act-danger:hover {
      background: #fef2f2; border-color: var(--red); color: var(--red);
    }
    .act-success:hover {
      background: var(--green-lt);
      border-color: var(--green); color: var(--green);
    }
    .act-warn:hover {
      background: var(--amber-lt);
      border-color: var(--amber); color: var(--amber);
    }
    .act-info:hover {
      background: var(--primary-lt);
      border-color: var(--accent); color: var(--primary);
    }
    .act-delete:hover {
      background: #fef2f2; border-color: var(--red); color: var(--red);
    }
    .act-warning {
  background: #f59e0b;
  color: white;
}

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 40px; color: var(--muted);
    }
    .empty-state p { font-size: 14px; font-weight: 600; }
    .empty-state small { font-size: 12px; }

    .table-foot {
      padding: 10px 16px; font-size: 11.5px; color: var(--muted);
      text-align: right; border-top: 1px solid var(--border);
      background: #fafafa;
    }

    /* ══════════════════════════════════════════════
       MODAL — MODIFIER LE PROFIL
    ══════════════════════════════════════════════ */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(3px);
      z-index: 900;
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .edit-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 680px; max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      background: white; border-radius: 20px;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
      z-index: 1000;
      display: flex; flex-direction: column;
      animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .modal-header {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary-lt) 0%, white 70%);
      flex-shrink: 0;
    }
    .mh-left { display: flex; align-items: center; gap: 14px; }
    .modal-avatar {
      width: 46px; height: 46px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; color: white;
      box-shadow: 0 3px 12px rgba(0,0,0,0.12); flex-shrink: 0;
    }
    .modal-header h2 {
      font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
    }
    .modal-header p {
      font-size: 12px; color: var(--muted);
      margin-top: 3px; display: flex; align-items: center; gap: 8px;
    }
    .role-badge {
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 10px; text-transform: uppercase;
    }
    .rb-admin   { background: #ede9fe; color: #5b21b6; }
    .rb-rh      { background: var(--primary-lt); color: var(--primary); }
    .rb-manager { background: var(--amber-lt); color: #92400e; }
    .rb-employe { background: var(--green-lt); color: #166534; }
    .modal-close {
      width: 32px; height: 32px; border: 1.5px solid var(--border);
      background: white; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: all 0.18s; flex-shrink: 0;
    }
    .modal-close:hover {
      background: #fef2f2; border-color: var(--red); color: var(--red);
    }
    .modal-body {
      flex: 1; overflow-y: auto; padding: 20px 24px;
    }
    .modal-body::-webkit-scrollbar { width: 5px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb {
      background: var(--border); border-radius: 10px;
    }
    .modal-tabs {
      display: flex; gap: 4px; margin-bottom: 20px;
      background: var(--bg); border-radius: 10px; padding: 4px;
    }
    .mt-btn {
      flex: 1; display: flex; align-items: center;
      justify-content: center; gap: 7px;
      padding: 9px 14px; border: none; border-radius: 8px;
      cursor: pointer; font-size: 13px; font-weight: 600;
      font-family: var(--font); color: var(--muted);
      background: transparent; transition: all 0.2s;
    }
    .mt-btn:hover { color: var(--primary); }
    .mt-active {
      background: white; color: var(--primary);
      box-shadow: 0 2px 8px rgba(11,110,126,0.1);
    }
    .tab-content { animation: tabIn 0.2s ease; }
    @keyframes tabIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .section-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.7px;
      margin-bottom: 12px; padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .modal-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    @media (max-width: 600px) {
      .modal-grid { grid-template-columns: 1fr; }
    }
    .input-with-unit {
      position: relative;
    }
    .input-unit {
      position: absolute; right: 10px; top: 50%;
      transform: translateY(-50%);
      font-size: 12px; font-weight: 600; color: var(--muted);
      pointer-events: none;
    }
    .input-with-unit input { padding-right: 36px; }
    .anciennete-display {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 12px; background: var(--bg);
      border: 1.5px solid var(--border); border-radius: var(--r);
      font-size: 13px; color: var(--primary); font-weight: 600;
    }
    .salary-recap {
      margin-top: 14px; background: var(--primary-lt);
      border-radius: 10px; padding: 14px 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .sr-row {
      display: flex; justify-content: space-between; font-size: 13px;
    }
    .sr-row strong { color: var(--primary); font-size: 15px; }
    .sr-row.muted { font-size: 12px; color: var(--muted); }
    .modal-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      background: #fafafa; flex-shrink: 0;
    }

    /* ══════════════════════════════════════════════
       MODAL — SUPPRIMER
    ══════════════════════════════════════════════ */
    .delete-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 420px; max-width: calc(100vw - 32px);
      background: white; border-radius: 16px;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
      z-index: 1000;
      overflow: hidden;
      animation: modalIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .dm-header {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 20px 16px;
      background: var(--red-lt);
      border-bottom: 1px solid #fecaca;
    }
    .dm-icon-wrap {
      width: 42px; height: 42px; background: #fee2e2;
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: var(--red); flex-shrink: 0;
    }
    .dm-header h3 {
      font-size: 15px; font-weight: 700; color: #991b1b;
    }
    .dm-header p {
      font-size: 12px; color: #b91c1c; margin-top: 3px;
    }
    .dm-body {
      padding: 20px 20px 16px;
      font-size: 13px; color: var(--muted); line-height: 1.65;
    }
    .dm-body strong { color: var(--text); font-weight: 600; }
    .dm-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      background: #fafafa;
    }
    .btn-delete {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--red); color: white; border: none;
      border-radius: var(--r); padding: 10px 16px;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      cursor: pointer; transition: all 0.2s;
    }
    .btn-delete:hover:not(:disabled) {
      background: #dc2626; transform: translateY(-1px);
    }
    .btn-delete:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ══ TOAST ══ */
    .g-toast {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; align-items: center; gap: 9px;
      padding: 12px 18px; border-radius: 12px;
      font-size: 13px; font-weight: 600; font-family: var(--font);
      transform: translateY(70px); opacity: 0;
      transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
      z-index: 2000; pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .toast-show    { transform: translateY(0); opacity: 1; }
    .toast-success { background: var(--green-lt); color: #166534; border: 1px solid #86efac; }
    .toast-error   { background: var(--red-lt); color: #991b1b; border: 1px solid #fca5a5; }
    .toast-info    { background: var(--primary-lt); color: var(--primary); border: 1px solid #67e8f9; }

    /* ══ SPINNERS ══ */
    .spin-sm {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white;
      animation: spin 0.7s linear infinite; display: block;
    }
    .spin-red {
      border-color: rgba(239,68,68,0.25);
      border-top-color: var(--red);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminUsersComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private API  = 'http://localhost:8080/api';

  svg = SVG;

  // ─── State ───────────────────────────────────────────────────────
  users      = signal<any[]>([]);
  employes   = signal<any[]>([]);
  managers   = signal<any[]>([]);
  loading    = signal(false);
  showCreate = signal(false);
  createErr  = signal('');
  createOk   = signal('');
  search     = signal('');
  roleF      = signal('');
  searchFocused = false;

  // ─── Modal édition ───────────────────────────────────────────────
  modalOpen    = signal(false);
  editingUser  = signal<any>(null);
  editLoading  = signal(false);
  editErr      = signal('');
  editOk       = signal('');
  editTab      = signal<'perso' | 'pro'>('perso');

  // ─── Modal suppression ───────────────────────────────────────────
  deleteTarget  = signal<any>(null);
  deleteLoading = signal(false);

  toast = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  rolePills = [
    { val: 'EMPLOYE', label: 'Employés', icon: SVG.user      },
    { val: 'MANAGER', label: 'Managers', icon: SVG.briefcase },
    { val: 'RH',      label: 'RH',       icon: SVG.building  },
    { val: 'ADMIN',   label: 'Admins',   icon: SVG.shield    }
  ];

  // ─── Formulaire création ─────────────────────────────────────────
  form = this.fb.group({
    nom:           ['', Validators.required],
    prenom:        ['', Validators.required],
    cin:           ['', Validators.required],
    email: ['', [Validators.email]],
    role:          ['', Validators.required],
    departement:   [''],
    dateEmbauche:  [''],
    managerId:     [null as number | null],
    societe:       [''],
    societeCustom: ['']   // ← champ pour saisie manuelle quand "Autre"
  });

  // ─── Formulaire édition ──────────────────────────────────────────
  editForm = this.fb.group({
    nom:           ['', Validators.required],
    prenom:        ['', Validators.required],
    cin:           ['', Validators.required],
    email: ['', [Validators.email]],
    telephone:     [''],
    adresse:       [''],
    dateNaissance: [''],
    poste:         [''],
    departement:   [''],
    dateEmbauche:  [''],
    typeContrat:   [''],
    managerId:     [null as number | null],
    salaireBase:   [null as number | null],
    societe:       ['']
  });

  ngOnInit(): void {
    forkJoin({
      users:    this.http.get<any[]>(`${this.API}/admin/users`),
      employes: this.http.get<any[]>(`${this.API}/rh/employes`)
    }).subscribe({
      next: (d) => {
        this.users.set(d.users ?? []);
        this.employes.set(d.employes ?? []);
        this.managers.set(
          (d.employes ?? []).filter((e: any) =>
            ['MANAGER', 'RH', 'ADMIN'].includes(e.role ?? ''))
        );
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MODAL ÉDITION
  // ═══════════════════════════════════════════════════════════════

  openModal(u: any): void {
    this.editingUser.set(u);
    this.editErr.set('');
    this.editOk.set('');
    this.editTab.set('perso');

    const emp = this.employes().find(
      e => e.userId === u.id || e.id === u.id
    );

    this.editForm.patchValue({
      nom:           u.nom           ?? '',
      prenom:        u.prenom        ?? '',
      cin:           emp?.cin        ?? '',
      email:         u.email         ?? '',
      telephone:     emp?.telephone  ?? u.telephone  ?? '',
      adresse:       emp?.adresse    ?? u.adresse    ?? '',
      dateNaissance: emp?.dateNaissance
        ? emp.dateNaissance.substring(0, 10) : '',
      poste:         emp?.poste        ?? u.poste        ?? '',
      departement:   emp?.departement  ?? u.departement  ?? '',
      dateEmbauche:  emp?.dateEmbauche
        ? emp.dateEmbauche.substring(0, 10) : '',
      typeContrat:   emp?.typeContrat  ?? '',
      managerId:     emp?.managerId    ?? u.managerId    ?? null,
      salaireBase:   emp?.salaireBase  ?? u.salaireBase  ?? null,
      societe:       emp?.societe      ?? ''
    });

    this.modalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.modalOpen.set(false);
    document.body.style.overflow = '';
    setTimeout(() => {
      this.editingUser.set(null);
      this.editErr.set('');
      this.editOk.set('');
    }, 300);
  }

  onSaveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      const hasPersoErr =
        this.editForm.get('nom')?.invalid    ||
        this.editForm.get('prenom')?.invalid ||
        this.editForm.get('cin')?.invalid    ||
        this.editForm.get('email')?.invalid;
      this.editTab.set(hasPersoErr ? 'perso' : 'pro');
      return;
    }

    const u = this.editingUser();
    if (!u) return;

    this.editLoading.set(true);
    this.editErr.set('');

    const payload = {
      ...this.editForm.value,
      managerId:   this.editForm.value.managerId
        ? Number(this.editForm.value.managerId) : null,
      salaireBase: this.editForm.value.salaireBase
        ? Number(this.editForm.value.salaireBase) : null
    };

    this.http.put(`${this.API}/admin/users/${u.id}`, payload)
      .subscribe({
        next: () => {
          this.editLoading.set(false);
          this.editOk.set('Profil mis à jour avec succès !');
          this.users.update(list =>
            list.map(x => x.id === u.id
              ? { ...x, nom: payload.nom, prenom: payload.prenom, email: payload.email }
              : x)
          );
          this.employes.update(list =>
            list.map(e =>
              (e.userId === u.id || e.id === u.id)
                ? { ...e, ...payload } : e)
          );
          this.showToast('Profil mis à jour avec succès', 'success');
          setTimeout(() => this.closeModal(), 1200);
        },
        error: (err) => {
          this.editLoading.set(false);
          this.editErr.set(err.error?.message ?? 'Erreur lors de la mise à jour.');
        }
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // MODAL SUPPRESSION
  // ═══════════════════════════════════════════════════════════════

  confirmDelete(): void {
    const u = this.deleteTarget();
    if (!u) return;

    this.deleteLoading.set(true);

    this.http.delete(`${this.API}/admin/users/${u.id}`)
      .subscribe({
        next: () => {
          this.deleteLoading.set(false);
          this.users.update(list => list.filter(x => x.id !== u.id));
          this.employes.update(list =>
            list.filter(e => e.userId !== u.id && e.id !== u.id)
          );
          this.deleteTarget.set(null);
          this.showToast(
            `Compte de ${u.prenom} ${u.nom} supprimé`, 'success');
        },
        error: (err) => {
          this.deleteLoading.set(false);
          this.deleteTarget.set(null);
          this.showToast(
            err.error?.message ?? 'Erreur lors de la suppression', 'error');
        }
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // CRÉATION
  // ═══════════════════════════════════════════════════════════════

  onCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); return;
    }
    this.loading.set(true);
    this.createErr.set('');

    // Résoudre la société finale : si "Autre", utiliser le champ texte
    let societe = this.form.value.societe ?? '';
    if (societe === '__autre__') {
      societe = this.form.value.societeCustom ?? '';
    }

    const payload = {
      ...this.form.value,
      societe,   // ← remplace la valeur "__autre__" le cas échéant
      managerId: this.form.value.managerId
        ? Number(this.form.value.managerId) : null
    };

    // Supprimer societeCustom du payload (champ interne uniquement)
    delete (payload as any).societeCustom;

    this.http.post(`${this.API}/admin/users`, payload)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.createOk.set('Compte créé ! Email de bienvenue envoyé.');
          this.form.reset({ managerId: null });
          this.reload();
          setTimeout(() => {
            this.createOk.set('');
            this.showCreate.set(false);
          }, 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.createErr.set(err.error?.message ?? 'Erreur lors de la création.');
        }
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS TABLE
  // ═══════════════════════════════════════════════════════════════

  changeRole(userId: number, role: string): void {
    this.http.put(
      `${this.API}/admin/users/${userId}/role?role=${role}`, {}
    ).subscribe({
      next: () => {
        this.users.update(u =>
          u.map(x => x.id === userId ? { ...x, role } : x));
        this.showToast('Rôle mis à jour', 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  toggleStatus(u: any): void {
    if (!confirm(
      `${u.enabled ? 'Désactiver' : 'Activer'} le compte de `
      + `${u.nom} ${u.prenom} ?`
    )) return;

    this.http.put(
      `${this.API}/admin/users/${u.id}/toggle-status`, {}
    ).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(x => x.id === u.id
            ? { ...x, enabled: !x.enabled } : x));
        this.showToast(
          u.enabled ? 'Compte désactivé' : 'Compte activé', 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  unlock(userId: number): void {
    this.http.put(
      `${this.API}/admin/users/${userId}/unlock`, {}
    ).subscribe({
      next: () => {
        this.users.update(u =>
          u.map(x => x.id === userId
            ? { ...x, accountNonLocked: true, failedAttempts: 0 } : x));
        this.showToast('Compte déverrouillé !', 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  resetPwd(userId: number): void {
    if (!confirm('Réinitialiser le mot de passe ?')) return;
    this.http.put(
      `${this.API}/admin/users/${userId}/reset-password`, {}
    ).subscribe({
      next: () => this.showToast('MDP réinitialisé — email envoyé', 'success'),
      error: () => this.showToast('Erreur', 'error')
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  getAnciennete(): string {
    const dateStr = this.editForm.get('dateEmbauche')?.value;
    if (!dateStr) return '—';
    const debut  = new Date(dateStr);
    const now    = new Date();
    const months =
      (now.getFullYear() - debut.getFullYear()) * 12 +
      (now.getMonth() - debut.getMonth());
    const years  = Math.floor(months / 12);
    const rem    = months % 12;
    if (years === 0) return `${rem} mois`;
    if (rem === 0)   return `${years} an${years > 1 ? 's' : ''}`;
    return `${years} an${years > 1 ? 's' : ''} et ${rem} mois`;
  }

  onRoleChange(): void {
    const r = this.form.get('role')?.value;
    if (r === 'ADMIN') {
      this.form.get('managerId')?.setValue(null);
    }
  }

  showManagerField(): boolean {
    const r = this.form.get('role')?.value;
    return r === 'EMPLOYE' || r === 'MANAGER';
  }

  /** Retourne la liste dédupliquée et triée des sociétés existantes */
  getSocietesDisponibles(): string[] {
    return [...new Set(
      this.employes()
        .map((e: any) => e.societe)
        .filter(Boolean)
    )].sort() as string[];
  }

  filtered(): any[] {
    const term = this.search().trim().toLowerCase();
    const role = this.roleF();
    return this.users().filter(u => {
      if (role && u.role !== role) return false;
      if (!term) return true;
      const basic =
        (u.nom    ?? '').toLowerCase().includes(term) ||
        (u.prenom ?? '').toLowerCase().includes(term) ||
        (u.email  ?? '').toLowerCase().includes(term);
      if (basic) return true;
      return (this.getCin(u.id) ?? '').toLowerCase().includes(term);
    });
  }

  getCount(role: string): number {
    return this.users().filter(u => u.role === role).length;
  }

  getCin(userId: number): string | null {
    const emp = this.employes().find(
      e => e.userId === userId || e.id === userId
    );
    return emp?.cin ?? null;
  }

  inv(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  invE(f: string): boolean {
    const c = this.editForm.get(f);
    return !!(c?.invalid && c?.touched);
  }

  init(u: any): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  trackById(_: number, u: any): number {
    return u.id;
  }

  private reload(): void {
    this.http.get<any[]>(`${this.API}/admin/users`)
      .subscribe(d => this.users.set(d ?? []));
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() =>
      this.toast.set({ show: false, message: '', type: 'success' }),
      3000
    );
  }

  // ─── Modal Set Password ───────────────────────────────────────
  pwdModalOpen    = signal(false);
  pwdUser         = signal<any>(null);
  pwdLoading      = signal(false);
  pwdError        = signal('');
  showPwd         = signal(false);
  newPassword     = '';
  confirmPassword = '';

  openSetPassword(u: any): void {
    this.pwdUser.set(u);
    this.newPassword     = '';
    this.confirmPassword = '';
    this.pwdError.set('');
    this.showPwd.set(false);
    this.pwdModalOpen.set(true);
  }

  onSetPassword(): void {
    this.pwdError.set('');

    if (!this.newPassword || this.newPassword.length < 6) {
      this.pwdError.set(
        'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.pwdError.set('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const u = this.pwdUser();
    if (!u) return;

    this.pwdLoading.set(true);

    this.http.put(
      `${this.API}/admin/users/${u.id}/set-password`,
      { password: this.newPassword }
    ).subscribe({
      next: () => {
        this.pwdLoading.set(false);
        this.pwdModalOpen.set(false);
        this.showToast(
          'Mot de passe défini — l\'employé devra le changer au prochain login',
          'success'
        );
      },
      error: (err) => {
        this.pwdLoading.set(false);
        this.pwdError.set(
          err.error?.message ?? 'Erreur lors de la définition du mot de passe.');
      }
    });
  }
}