import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators, FormsModule
} from '@angular/forms';
import { ProfilService } from '../../core/services/profil.service';
import { AuthService }   from '../../core/services/auth.service';
import { ProfilEmploye } from '../../core/models/profil.model';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'apercu' | 'infos' | 'contrat' | 'historique' | 'securite' | 'rgpd';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  // Header & tabs
  eye:         `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  fileText:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  history:     `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  lock:        `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  shield:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  // Section icons
  user:        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  phone:       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  briefcase:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  alertOctagon:`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Info labels
  calendar:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  mail:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mapPin:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  idCard:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h2"/></svg>`,
  building:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  userTie:     `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  banknote:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  ticket:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>`,
  // Hero role badges
  roleEmploye: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  roleManager: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  roleRH:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  roleAdmin:   `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  // Buttons
  save:        `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  lockPwd:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  bell:        `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  shieldBig:   `<svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  eyeOn:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  checkCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  alertCircle: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  // Historique
  star:        `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  trendUp:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  refresh:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  // RGPD droits
  eyeDroit:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  editDroit:   `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  upload:      `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  // Contrat
  infinity:    `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg>`,
  graduationCap:`<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  // Toast
  toastOk:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  toastErr:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  toastInfo:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  clockSmall:  `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafeHtmlPipe],
  template: `
<div class="profil fade-in">

  <!-- ── Hero ── -->
  <div class="profil-hero" *ngIf="profil()">
    <div class="hero-bg"></div>
    <div class="hero-content">
      <div class="hero-avatar">
        <div class="avatar-circle">{{ getInitiales() }}</div>
        <div class="avatar-role-badge">
          <span [innerHTML]="getRoleIconSvg() | safeHtml"></span>
        </div>
      </div>
      <div class="hero-info">
        <h1>{{ profil()!.prenom }} {{ profil()!.nom }}</h1>
        <div class="hero-meta">
          <span class="hero-chip">
            <span [innerHTML]="ic.briefcase | safeHtml"></span>
            {{ profil()!.poste }}
          </span>
          <span class="hero-chip">
            <span [innerHTML]="ic.building | safeHtml"></span>
            {{ profil()!.departement }}
          </span>
          <span class="hero-chip">
            <span [innerHTML]="ic.ticket | safeHtml"></span>
            {{ profil()!.matricule }}
          </span>
        </div>
        <div class="hero-stats">
          <div class="hs-item">
            <span class="hs-value">{{ getAnciennete() }}</span>
            <span class="hs-label">Ancienneté</span>
          </div>
          <div class="hs-divider"></div>
          <div class="hs-item">
            <span class="hs-value">{{ profil()!.contrat?.typeContrat || 'CDI' }}</span>
            <span class="hs-label">Contrat</span>
          </div>
          <div class="hs-divider" *ngIf="isRHOrAdmin()"></div>
          <div class="hs-item" *ngIf="isRHOrAdmin()">
            <span class="hs-value">{{ profil()!.salaireBase ? (profil()!.salaireBase | number:'1.3-3') + ' DT' : '—' }}</span>
            <span class="hs-label">Salaire base</span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-hero" (click)="setTab('infos')">
          <span [innerHTML]="ic.edit | safeHtml"></span> Modifier le profil
        </button>
      </div>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'apercu'" (click)="setTab('apercu')">
        <span [innerHTML]="ic.eye | safeHtml"></span> Aperçu
      </button>
      <button class="tab" [class.active]="activeTab() === 'infos'" (click)="setTab('infos')">
        <span [innerHTML]="ic.edit | safeHtml"></span> Informations
      </button>
      <button class="tab" [class.active]="activeTab() === 'contrat'" (click)="setTab('contrat')">
        <span [innerHTML]="ic.fileText | safeHtml"></span> Contrat
      </button>
      <button class="tab" [class.active]="activeTab() === 'historique'" (click)="setTab('historique')">
        <span [innerHTML]="ic.history | safeHtml"></span> Historique
      </button>
      <button class="tab" [class.active]="activeTab() === 'securite'" (click)="setTab('securite')">
        <span [innerHTML]="ic.lock | safeHtml"></span> Sécurité
      </button>
      <button class="tab" [class.active]="activeTab() === 'rgpd'" (click)="setTab('rgpd')">
        <span [innerHTML]="ic.shield | safeHtml"></span> RGPD
      </button>
    </div>
  </div>

  <!-- ===================== APERÇU ===================== -->
  <div *ngIf="activeTab() === 'apercu' && profil()" class="tab-content fade-in">
    <div class="apercu-grid">

      <!-- Informations personnelles -->
      <div class="info-card">
        <div class="ic-header">
          <div class="ic-header-icon teal"><span [innerHTML]="ic.user | safeHtml"></span></div>
          <h3>Informations personnelles</h3>
        </div>
        <div class="info-list">
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.calendar | safeHtml"></span> Naissance</span><span class="ii-value">{{ profil()!.dateNaissance ? (profil()!.dateNaissance | date:'dd/MM/yyyy') : '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.mapPin | safeHtml"></span> Lieu</span><span class="ii-value">{{ profil()!.lieuNaissance || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.idCard | safeHtml"></span> Nationalité</span><span class="ii-value">{{ profil()!.nationalite || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.user | safeHtml"></span> Genre</span><span class="ii-value">{{ profil()!.genre || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.user | safeHtml"></span> Situation</span><span class="ii-value">{{ profil()!.situationFamiliale || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.idCard | safeHtml"></span> CIN</span><span class="ii-value">{{ profil()!.cin || '—' }}</span></div>
        </div>
      </div>

      <!-- Coordonnées -->
      <div class="info-card">
        <div class="ic-header">
          <div class="ic-header-icon blue"><span [innerHTML]="ic.phone | safeHtml"></span></div>
          <h3>Coordonnées</h3>
        </div>
        <div class="info-list">
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.mail | safeHtml"></span> Email</span><span class="ii-value email">{{ profil()!.email }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.phone | safeHtml"></span> Téléphone</span><span class="ii-value">{{ profil()!.telephone || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.mapPin | safeHtml"></span> Adresse</span><span class="ii-value">{{ profil()!.adresse || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.mapPin | safeHtml"></span> Ville</span><span class="ii-value">{{ profil()!.ville || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.mapPin | safeHtml"></span> Code postal</span><span class="ii-value">{{ profil()!.codePostal || '—' }}</span></div>
        </div>
      </div>

      <!-- Infos professionnelles -->
      <div class="info-card">
        <div class="ic-header">
          <div class="ic-header-icon amber"><span [innerHTML]="ic.briefcase | safeHtml"></span></div>
          <h3>Informations professionnelles</h3>
        </div>
        <div class="info-list">
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.ticket | safeHtml"></span> Matricule</span><span class="ii-value">{{ profil()!.matricule }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.briefcase | safeHtml"></span> Poste</span><span class="ii-value">{{ profil()!.poste }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.building | safeHtml"></span> Département</span><span class="ii-value">{{ profil()!.departement }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.calendar | safeHtml"></span> Embauche</span><span class="ii-value">{{ profil()!.dateEmbauche | date:'dd/MM/yyyy' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.history | safeHtml"></span> Ancienneté</span><span class="ii-value teal">{{ getAnciennete() }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.userTie | safeHtml"></span> Manager</span><span class="ii-value">{{ profil()!.managerNom || '—' }}</span></div>
          <div class="info-item" *ngIf="isRHOrAdmin()"><span class="ii-label"><span [innerHTML]="ic.banknote | safeHtml"></span> Salaire</span><span class="ii-value teal">{{ profil()!.salaireBase ? (profil()!.salaireBase | number:'1.3-3') + ' DT' : '—' }}</span></div>
        </div>
      </div>

      <!-- Contact urgence -->
      <div class="info-card">
        <div class="ic-header">
          <div class="ic-header-icon red"><span [innerHTML]="ic.alertOctagon | safeHtml"></span></div>
          <h3>Contact d'urgence</h3>
        </div>
        <div class="info-list" *ngIf="profil()!.contactUrgenceNom">
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.user | safeHtml"></span> Nom</span><span class="ii-value">{{ profil()!.contactUrgenceNom }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.phone | safeHtml"></span> Téléphone</span><span class="ii-value">{{ profil()!.contactUrgenceTelephone || '—' }}</span></div>
          <div class="info-item"><span class="ii-label"><span [innerHTML]="ic.user | safeHtml"></span> Relation</span><span class="ii-value">{{ profil()!.contactUrgenceRelation || '—' }}</span></div>
        </div>
        <div class="empty-contact" *ngIf="!profil()!.contactUrgenceNom">
          <span [innerHTML]="ic.alertCircle | safeHtml"></span>
          <p>Contact d'urgence non renseigné</p>
          <button class="btn btn-secondary btn-sm" (click)="setTab('infos')">Ajouter</button>
        </div>
      </div>

    </div>
  </div>

  <!-- ===================== INFOS ===================== -->
  <div *ngIf="activeTab() === 'infos'" class="tab-content fade-in">
    <form [formGroup]="profilForm" (ngSubmit)="onSaveProfil()">
      <div class="form-sections">

        <div class="form-section">
          <div class="fs-header">
            <div class="fs-icon teal"><span [innerHTML]="ic.user | safeHtml"></span></div>
            <h3>État civil</h3>
          </div>
          <div class="form-grid">
            <div class="form-group"><label>Date de naissance</label><input type="date" formControlName="dateNaissance" /></div>
            <div class="form-group"><label>Lieu de naissance</label><input type="text" formControlName="lieuNaissance" placeholder="Ville de naissance" /></div>
            <div class="form-group"><label>Nationalité</label><input type="text" formControlName="nationalite" placeholder="Ex: Tunisienne" /></div>
            <div class="form-group"><label>Genre</label><select formControlName="genre"><option value="">— Sélectionner —</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select></div>
            <div class="form-group"><label>Situation familiale</label><select formControlName="situationFamiliale"><option value="">— Sélectionner —</option><option value="Célibataire">Célibataire</option><option value="Marié(e)">Marié(e)</option><option value="Divorcé(e)">Divorcé(e)</option><option value="Veuf(ve)">Veuf(ve)</option></select></div>
            <div class="form-group"><label>CIN</label><input type="text" formControlName="cin" placeholder="Numéro CIN" /></div>
          </div>
        </div>

        <div class="form-section">
          <div class="fs-header">
            <div class="fs-icon blue"><span [innerHTML]="ic.phone | safeHtml"></span></div>
            <h3>Coordonnées</h3>
          </div>
          <div class="form-grid">
            <div class="form-group"><label>Téléphone</label><input type="tel" formControlName="telephone" placeholder="Ex: 55 123 456" /></div>
            <div class="form-group"><label>Ville</label><input type="text" formControlName="ville" placeholder="Ex: Tunis" /></div>
            <div class="form-group"><label>Code postal</label><input type="text" formControlName="codePostal" placeholder="Ex: 1000" /></div>
            <div class="form-group full-width"><label>Adresse complète</label><input type="text" formControlName="adresse" placeholder="Rue, numéro, appartement..." /></div>
          </div>
        </div>

        <div class="form-section">
          <div class="fs-header">
            <div class="fs-icon red"><span [innerHTML]="ic.alertOctagon | safeHtml"></span></div>
            <h3>Contact d'urgence</h3>
          </div>
          <div class="form-grid">
            <div class="form-group"><label>Nom complet</label><input type="text" formControlName="contactUrgenceNom" placeholder="Nom du contact" /></div>
            <div class="form-group"><label>Téléphone</label><input type="tel" formControlName="contactUrgenceTelephone" placeholder="Ex: 99 123 456" /></div>
            <div class="form-group"><label>Relation</label><select formControlName="contactUrgenceRelation"><option value="">— Sélectionner —</option><option value="Père">Père</option><option value="Mère">Mère</option><option value="Conjoint(e)">Conjoint(e)</option><option value="Frère/Sœur">Frère/Sœur</option><option value="Ami(e)">Ami(e)</option><option value="Autre">Autre</option></select></div>
          </div>
        </div>

      </div>

      <div class="form-alert error" *ngIf="saveError()"><span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ saveError() }}</div>
      <div class="form-alert success" *ngIf="saveSuccess()"><span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ saveSuccess() }}</div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" (click)="resetForm()">Annuler</button>
        <button type="submit" class="btn btn-primary" [disabled]="saveLoading()">
          <span *ngIf="!saveLoading()"><span [innerHTML]="ic.save | safeHtml"></span> Enregistrer</span>
          <span *ngIf="saveLoading()" class="spinner"></span>
        </button>
      </div>
    </form>
  </div>

  <!-- ===================== CONTRAT ===================== -->
  <div *ngIf="activeTab() === 'contrat' && profil()" class="tab-content fade-in">
    <div class="contrat-layout" *ngIf="profil()!.contrat; else noContrat">
      <div class="contrat-card">
        <div class="cc-header">
          <div class="cc-type-badge" [class]="getContratColor(profil()!.contrat!.typeContrat)">
            <span [innerHTML]="getContratIconSvg(profil()!.contrat!.typeContrat) | safeHtml"></span>
            {{ profil()!.contrat!.typeContrat }}
          </div>
          <div class="cc-status active">
            <span class="status-dot green"></span> Contrat actif
          </div>
        </div>
        <div class="contrat-details">
          <div class="cd-item"><span class="cd-label">Type de contrat</span><span class="cd-value">{{ profil()!.contrat!.typeContrat }}</span></div>
          <div class="cd-item"><span class="cd-label">Poste contractuel</span><span class="cd-value">{{ profil()!.contrat!.posteContrat }}</span></div>
          <div class="cd-item"><span class="cd-label">Date de début</span><span class="cd-value">{{ profil()!.contrat!.dateDebut | date:'dd/MM/yyyy' }}</span></div>
          <div class="cd-item"><span class="cd-label">Date de fin</span><span class="cd-value" [class.amber]="profil()!.contrat!.dateFin">{{ profil()!.contrat!.dateFin ? (profil()!.contrat!.dateFin | date:'dd/MM/yyyy') : 'Indéterminée (CDI)' }}</span></div>
          <div class="cd-item"><span class="cd-label">Durée</span><span class="cd-value teal">{{ getAnciennete() }}</span></div>
        </div>
        <div class="contrat-alert" *ngIf="profil()!.contrat!.dateFin && isFinContratProche()">
          <span [innerHTML]="ic.alertCircle | safeHtml"></span>
          Votre contrat arrive à échéance le <strong>{{ profil()!.contrat!.dateFin | date:'dd/MM/yyyy' }}</strong> — Contactez le service RH.
        </div>
      </div>
    </div>
    <ng-template #noContrat>
      <div class="empty-state">
        <div class="empty-icon"><span [innerHTML]="ic.fileText | safeHtml"></span></div>
        <h3>Aucun contrat enregistré</h3>
        <p>Contactez le service RH pour plus d'informations.</p>
      </div>
    </ng-template>
  </div>

  <!-- ===================== HISTORIQUE ===================== -->
  <div *ngIf="activeTab() === 'historique' && profil()" class="tab-content fade-in">
    <div class="historique-timeline" *ngIf="profil()!.historique && profil()!.historique.length > 0">
      <div class="ht-item" *ngFor="let h of profil()!.historique; let last = last">
        <div class="ht-left">
          <div class="ht-dot" [class]="getHistoriqueClass(h.typeEvenement)">
            <span [innerHTML]="getHistoriqueIconSvg(h.typeEvenement) | safeHtml"></span>
          </div>
          <div class="ht-line" *ngIf="!last"></div>
        </div>
        <div class="ht-content">
          <div class="ht-header">
            <span class="ht-type-badge" [class]="getHistoriqueClass(h.typeEvenement)">{{ h.typeEvenement }}</span>
            <span class="ht-date">{{ h.dateDebut | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="ht-body">
            <div class="ht-poste" *ngIf="h.posteAvant && h.posteAvant !== '-'">
              <span class="ht-avant">{{ h.posteAvant }}</span>
              <span class="ht-arrow">→</span>
              <span class="ht-apres">{{ h.posteApres }}</span>
            </div>
            <div class="ht-poste" *ngIf="!h.posteAvant || h.posteAvant === '-'">
              <span class="ht-apres">{{ h.posteApres }}</span>
            </div>
            <div class="ht-dept" *ngIf="h.departementApres">
              <span [innerHTML]="ic.building | safeHtml"></span> {{ h.departementApres }}
            </div>
            <p class="ht-comment" *ngIf="h.commentaire">{{ h.commentaire }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-state" *ngIf="!profil()!.historique || profil()!.historique.length === 0">
      <div class="empty-icon"><span [innerHTML]="ic.history | safeHtml"></span></div>
      <h3>Aucun historique</h3>
      <p>Votre historique professionnel apparaîtra ici.</p>
    </div>
  </div>

  <!-- ===================== SÉCURITÉ ===================== -->
  <div *ngIf="activeTab() === 'securite'" class="tab-content fade-in">
    <div class="securite-grid">

      <!-- Changer MDP -->
      <div class="securite-card">
        <div class="sc-icon-wrap teal"><span [innerHTML]="ic.lockPwd | safeHtml"></span></div>
        <h3>Changer le mot de passe</h3>
        <p>Changez régulièrement votre mot de passe pour sécuriser votre compte.</p>
        <form [formGroup]="mdpForm" (ngSubmit)="onChangeMdp()">
          <div class="form-group">
            <label>Mot de passe actuel</label>
            <div class="pwd-input">
              <input [type]="showPwd['old'] ? 'text' : 'password'" formControlName="oldPassword" placeholder="Mot de passe actuel" [class.error]="isMdpInvalid('oldPassword')" />
              <button type="button" class="pwd-toggle" (click)="showPwd['old'] = !showPwd['old']" [innerHTML]="(showPwd['old'] ? ic.eyeOff : ic.eyeOn) | safeHtml"></button>
            </div>
          </div>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <div class="pwd-input">
              <input [type]="showPwd['new'] ? 'text' : 'password'" formControlName="newPassword" placeholder="Minimum 8 caractères" [class.error]="isMdpInvalid('newPassword')" />
              <button type="button" class="pwd-toggle" (click)="showPwd['new'] = !showPwd['new']" [innerHTML]="(showPwd['new'] ? ic.eyeOff : ic.eyeOn) | safeHtml"></button>
            </div>
            <div class="strength-bar" *ngIf="mdpForm.get('newPassword')?.value">
              <div class="sb-fill" [style.width]="getMdpStrength() + '%'" [class]="getMdpStrengthClass()"></div>
            </div>
            <span class="strength-label" *ngIf="mdpForm.get('newPassword')?.value">{{ getMdpStrengthLabel() }}</span>
          </div>
          <div class="form-group">
            <label>Confirmer</label>
            <div class="pwd-input">
              <input [type]="showPwd['conf'] ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Répétez le mot de passe" [class.error]="mdpMismatch()" />
              <button type="button" class="pwd-toggle" (click)="showPwd['conf'] = !showPwd['conf']" [innerHTML]="(showPwd['conf'] ? ic.eyeOff : ic.eyeOn) | safeHtml"></button>
            </div>
            <span class="error-msg" *ngIf="mdpMismatch()">Les mots de passe ne correspondent pas</span>
          </div>
          <div class="form-alert error" *ngIf="mdpError()"><span [innerHTML]="ic.alertCircle | safeHtml"></span> {{ mdpError() }}</div>
          <div class="form-alert success" *ngIf="mdpSuccess()"><span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ mdpSuccess() }}</div>
          <button type="submit" class="btn btn-primary full-btn" [disabled]="mdpLoading() || mdpMismatch()">
            <span *ngIf="!mdpLoading()"><span [innerHTML]="ic.lock | safeHtml"></span> Changer le mot de passe</span>
            <span *ngIf="mdpLoading()" class="spinner"></span>
          </button>
        </form>
      </div>

      <!-- Notifications + historique connexions -->
      <div class="securite-card">
        <div class="sc-icon-wrap blue"><span [innerHTML]="ic.bell | safeHtml"></span></div>
        <h3>Préférences de notification</h3>
        <p>Choisissez comment vous souhaitez être notifié.</p>
        <div class="notif-options">
          <div class="notif-opt" [class.active]="notifEmail()" (click)="notifEmail.set(!notifEmail())">
            <div class="no-toggle" [class.on]="notifEmail()"><div class="not-knob"></div></div>
            <div class="no-info">
              <strong><span [innerHTML]="ic.mail | safeHtml"></span> Notifications par email</strong>
              <small>Recevez les alertes sur votre adresse email</small>
            </div>
          </div>
          <div class="notif-opt" [class.active]="notifInApp()" (click)="notifInApp.set(!notifInApp())">
            <div class="no-toggle" [class.on]="notifInApp()"><div class="not-knob"></div></div>
            <div class="no-info">
              <strong><span [innerHTML]="ic.bell | safeHtml"></span> Notifications in-app</strong>
              <small>Recevez les alertes dans l'application</small>
            </div>
          </div>
        </div>
        <button class="btn btn-primary full-btn" style="margin-top:16px" (click)="saveNotifSettings()" [disabled]="notifLoading()">
          <span *ngIf="!notifLoading()"><span [innerHTML]="ic.save | safeHtml"></span> Enregistrer</span>
          <span *ngIf="notifLoading()" class="spinner"></span>
        </button>

        <div class="login-history">
          <h4><span [innerHTML]="ic.clockSmall | safeHtml"></span> Dernières connexions</h4>
          <div class="lh-item" *ngFor="let l of loginHistory()">
            <div class="lh-status">
              <span [innerHTML]="(l.success ? ic.checkCircle : ic.xCircle) | safeHtml"></span>
            </div>
            <div class="lh-info">
              <span>{{ l.loginTime | date:'dd/MM/yyyy HH:mm' }}</span>
              <small>{{ l.ipAddress }}</small>
            </div>
            <span class="lh-reason" *ngIf="!l.success && l.failureReason">{{ l.failureReason }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ===================== RGPD ===================== -->
  <div *ngIf="activeTab() === 'rgpd'" class="tab-content fade-in">
    <div class="rgpd-layout">
      <div class="rgpd-card">
        <div class="rgpd-icon-wrap"><span [innerHTML]="ic.shieldBig | safeHtml"></span></div>
        <h3>Protection des données personnelles</h3>
        <p>Conformément au règlement général sur la protection des données (RGPD), vous disposez de droits sur vos données personnelles.</p>

        <div class="rgpd-section">
          <h4>Consentement au traitement</h4>
          <div class="rgpd-toggle" [class.active]="rgpdConsent()" (click)="toggleRgpdConsent()">
            <div class="rgt-toggle" [class.on]="rgpdConsent()"><div class="rgt-knob"></div></div>
            <div class="rgt-info">
              <strong>
                <span [innerHTML]="(rgpdConsent() ? ic.checkCircle : ic.xCircle) | safeHtml"></span>
                {{ rgpdConsent() ? 'Consentement accordé' : 'Consentement non accordé' }}
              </strong>
              <small>J'accepte que mes données soient utilisées dans le cadre de la gestion RH</small>
            </div>
          </div>
        </div>

        <div class="rgpd-section">
          <h4>Vos droits</h4>
          <div class="droits-list">
            <div class="droit-item">
              <div class="droit-icon teal"><span [innerHTML]="ic.eyeDroit | safeHtml"></span></div>
              <div><strong>Droit d'accès</strong><p>Consultez toutes vos données depuis cet espace</p></div>
            </div>
            <div class="droit-item">
              <div class="droit-icon blue"><span [innerHTML]="ic.editDroit | safeHtml"></span></div>
              <div><strong>Droit de rectification</strong><p>Modifiez vos informations dans l'onglet "Informations"</p></div>
            </div>
            <div class="droit-item">
              <div class="droit-icon red"><span [innerHTML]="ic.trash | safeHtml"></span></div>
              <div>
                <strong>Droit à l'oubli</strong>
                <p>Demandez la suppression de vos données personnelles</p>
                <button class="btn btn-danger btn-sm" style="margin-top:8px" (click)="demanderSuppression()" [disabled]="deletionLoading()">
                  <span *ngIf="!deletionLoading()"><span [innerHTML]="ic.trash | safeHtml"></span> Demander la suppression</span>
                  <span *ngIf="deletionLoading()" class="spinner"></span>
                </button>
              </div>
            </div>
            <div class="droit-item">
              <div class="droit-icon amber"><span [innerHTML]="ic.upload | safeHtml"></span></div>
              <div><strong>Droit à la portabilité</strong><p>Contactez le service RH pour exporter vos données</p></div>
            </div>
          </div>
        </div>

        <div class="form-alert success" *ngIf="rgpdSuccess()">
          <span [innerHTML]="ic.checkCircle | safeHtml"></span> {{ rgpdSuccess() }}
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
      --c-text:      #1a202c;
      --c-muted:     #718096;
      --c-gray-100:  #eef0f3;
      --c-gray-200:  #e2e8f0;
      --r:     12px;
      --r-lg:  16px;
      --sh:    0 2px 12px rgba(11,110,126,0.08);
      --sh-md: 0 6px 24px rgba(11,110,126,0.13);
    }

    .profil { max-width: 100%; padding-bottom: 48px; }

    /* ── Hero ── */
    .profil-hero { position: relative; border-radius: 20px; overflow: hidden; margin-bottom: 28px; box-shadow: 0 6px 24px rgba(11,110,126,0.18); }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #073b4c 0%, var(--c-teal-dk) 50%, var(--c-teal) 100%); }
    .hero-content { position: relative; padding: 32px 36px; display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
    .hero-avatar { position: relative; flex-shrink: 0; }
    .avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 3px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; backdrop-filter: blur(10px); }
    .avatar-role-badge { position: absolute; bottom: -4px; right: -4px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; border: 2px solid white; color: var(--c-teal); svg { display: block; } }
    .hero-info { flex: 1; h1 { font-size: 26px; font-weight: 800; color: white; margin-bottom: 10px; } }
    .hero-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .hero-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 500; background: rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 20px; svg { display: block; flex-shrink: 0; } }
    .hero-stats { display: flex; align-items: center; }
    .hs-item { display: flex; flex-direction: column; gap: 2px; padding: 0 16px; &:first-child { padding-left: 0; } .hs-value { font-size: 16px; font-weight: 800; color: white; } .hs-label { font-size: 11px; color: rgba(255,255,255,0.65); } }
    .hs-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.25); }
    .hero-actions { flex-shrink: 0; }
    .btn-hero { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: rgba(255,255,255,0.15); color: white; border: 1.5px solid rgba(255,255,255,0.4); border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(4px); svg { display: block; } &:hover { background: rgba(255,255,255,0.25); } }

    /* ── Tabs ── */
    .tabs-wrapper { margin-bottom: 24px; }
    .tabs { display: flex; gap: 2px; background: white; padding: 5px; border-radius: 14px; box-shadow: var(--sh); flex-wrap: wrap; border: 1px solid var(--c-gray-200); }
    .tab { padding: 10px 16px; border: none; background: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-muted); transition: all 0.2s; display: flex; align-items: center; gap: 7px; white-space: nowrap; svg { display: block; flex-shrink: 0; } &:hover { background: var(--c-gray-100); color: var(--c-text); } &.active { background: var(--c-teal); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); } &.active svg { stroke: white; } }

    /* ── Aperçu grid ── */
    .apercu-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; }
    .info-card { background: white; border-radius: var(--r-lg); padding: 20px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); }
    .ic-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--c-gray-200); h3 { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0; } }
    .ic-header-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } &.red   { background: var(--c-red-lt);   color: var(--c-red); } }
    .info-list { display: flex; flex-direction: column; gap: 8px; }
    .info-item { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: var(--c-gray-100); border-radius: 8px; }
    .ii-label { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: var(--c-muted); svg { display: block; flex-shrink: 0; } }
    .ii-value { font-size: 13px; color: var(--c-text); font-weight: 500; text-align: right; &.email { color: var(--c-teal); font-size: 12px; } &.teal { color: var(--c-teal); font-weight: 700; } }
    .empty-contact { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--c-amber-lt); border-radius: var(--r); margin-top: 10px; svg { flex-shrink: 0; color: var(--c-amber); display: block; } p { font-size: 12px; color: var(--c-amber); flex: 1; margin: 0; } }

    /* ── Form sections ── */
    .form-sections { display: flex; flex-direction: column; gap: 20px; }
    .form-section { background: white; border-radius: var(--r-lg); padding: 24px; box-shadow: var(--sh); border: 1px solid var(--c-gray-200); }
    .fs-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--c-gray-200); h3 { font-size: 15px; font-weight: 700; color: var(--c-text); margin: 0; } }
    .fs-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } &.red   { background: var(--c-red-lt);   color: var(--c-red); } }
    .form-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; .full-width { grid-column: span 3; } }
    .form-group { display: flex; flex-direction: column; gap: 5px; label { font-size: 11px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; } }
    input, select, textarea { padding: 10px 14px; border: 1.5px solid var(--c-gray-200); border-radius: var(--r); font-size: 13px; outline: none; background: white; color: var(--c-text); transition: border-color 0.2s; width: 100%; &:focus { border-color: var(--c-teal); box-shadow: 0 0 0 3px rgba(14,157,175,0.1); } &.error { border-color: var(--c-red); } }
    .error-msg { font-size: 11px; color: var(--c-red); font-weight: 500; }
    .form-alert { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r); font-size: 13px; margin-bottom: 14px; svg { flex-shrink: 0; display: block; } &.error { background: var(--c-red-lt); color: var(--c-red); } &.success { background: var(--c-green-lt); color: var(--c-green); } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding: 18px 20px; background: white; border-radius: var(--r-lg); box-shadow: var(--sh); border: 1px solid var(--c-gray-200); }

    /* ── Contrat ── */
    .contrat-layout { max-width: 580px; }
    .contrat-card { background: white; border-radius: 20px; padding: 28px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .cc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
    .cc-type-badge { display: inline-flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: 20px; font-size: 14px; font-weight: 700; svg { display: block; } &.cdi   { background: var(--c-green-lt); color: var(--c-green); } &.cdd   { background: var(--c-blue-lt);  color: var(--c-blue); } &.stage { background: var(--c-amber-lt); color: var(--c-amber); } }
    .cc-status { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; &.active { color: var(--c-green); } }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; &.green { background: var(--c-green); animation: blink 2s infinite; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .contrat-details { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
    .cd-item { display: flex; justify-content: space-between; padding: 10px 14px; background: var(--c-gray-100); border-radius: var(--r); .cd-label { font-size: 12px; color: var(--c-muted); font-weight: 600; } .cd-value { font-size: 13px; color: var(--c-text); font-weight: 600; &.teal { color: var(--c-teal); } &.amber { color: var(--c-amber); } } }
    .contrat-alert { display: flex; align-items: center; gap: 8px; background: var(--c-amber-lt); border: 1px solid #ecc94b; border-radius: var(--r); padding: 12px 14px; font-size: 13px; color: #744210; svg { flex-shrink: 0; display: block; } }

    /* ── Historique ── */
    .historique-timeline { display: flex; flex-direction: column; }
    .ht-item { display: flex; gap: 16px; }
    .ht-left { display: flex; flex-direction: column; align-items: center; }
    .ht-dot { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.recrutement { background: var(--c-green-lt); color: var(--c-green); } &.promotion { background: var(--c-teal-lt); color: var(--c-teal); } &.mutation { background: var(--c-blue-lt); color: var(--c-blue); } &.autre { background: var(--c-gray-200); color: var(--c-muted); } }
    .ht-line { width: 2px; flex: 1; background: var(--c-gray-200); margin: 4px 0; min-height: 24px; }
    .ht-content { flex: 1; padding-bottom: 24px; }
    .ht-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .ht-type-badge { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; &.recrutement { background: var(--c-green-lt); color: var(--c-green); } &.promotion { background: var(--c-teal-lt); color: var(--c-teal); } &.mutation { background: var(--c-blue-lt); color: var(--c-blue); } &.autre { background: var(--c-gray-200); color: var(--c-muted); } }
    .ht-date { font-size: 12px; color: var(--c-muted); }
    .ht-body { background: white; border-radius: var(--r); padding: 14px; border: 1px solid var(--c-gray-200); }
    .ht-poste { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; .ht-avant { font-size: 13px; color: var(--c-muted); } .ht-arrow { color: var(--c-teal); font-weight: 700; } .ht-apres { font-size: 13px; font-weight: 700; color: var(--c-teal); } }
    .ht-dept { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--c-muted); margin-bottom: 6px; svg { display: block; flex-shrink: 0; } }
    .ht-comment { font-size: 12px; color: var(--c-text); font-style: italic; margin: 0; }

    /* ── Sécurité ── */
    .securite-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    .securite-card { background: white; border-radius: 20px; padding: 28px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); h3 { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0 0 8px; } p { font-size: 13px; color: var(--c-muted); margin-bottom: 20px; line-height: 1.5; } }
    .sc-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; flex-shrink: 0; svg { display: block; } &.teal { background: var(--c-teal-lt); color: var(--c-teal); } &.blue { background: var(--c-blue-lt); color: var(--c-blue); } }

    .pwd-input { position: relative; display: flex; }
    .pwd-input input { flex: 1; padding-right: 44px; }
    .pwd-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--c-muted); display: flex; align-items: center; padding: 0; svg { display: block; } &:hover { color: var(--c-teal); } }

    .strength-bar { height: 4px; background: var(--c-gray-200); border-radius: 2px; margin-top: 6px; overflow: hidden; .sb-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; &.weak { background: var(--c-red); } &.medium { background: var(--c-amber); } &.strong { background: var(--c-green); } } }
    .strength-label { font-size: 11px; font-weight: 600; display: block; margin-top: 4px; color: var(--c-muted); }
    .full-btn { width: 100%; justify-content: center; }

    .notif-options { display: flex; flex-direction: column; gap: 10px; }
    .notif-opt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--r); border: 1.5px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; &.active { border-color: var(--c-teal); background: var(--c-teal-lt); } }
    .no-toggle { width: 40px; height: 22px; border-radius: 11px; background: var(--c-gray-200); position: relative; transition: background 0.3s; flex-shrink: 0; &.on { background: var(--c-teal); } .not-knob { width: 16px; height: 16px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); } &.on .not-knob { transform: translateX(18px); } }
    .no-info { flex: 1; strong { font-size: 13px; color: var(--c-text); display: flex; align-items: center; gap: 5px; svg { display: block; width: 13px; height: 13px; } } small { font-size: 11px; color: var(--c-muted); display: block; margin-top: 2px; } }

    .login-history { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--c-gray-200); h4 { font-size: 13px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; display: flex; align-items: center; gap: 5px; svg { display: block; } } }
    .lh-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--c-gray-100); &:last-child { border-bottom: none; } }
    .lh-status { flex-shrink: 0; svg { display: block; } }
    .lh-info { flex: 1; span { font-size: 12px; color: var(--c-text); display: block; } small { font-size: 11px; color: var(--c-muted); } }
    .lh-reason { font-size: 11px; color: var(--c-red); background: var(--c-red-lt); padding: 2px 8px; border-radius: 4px; }

    /* ── RGPD ── */
    .rgpd-layout { max-width: 680px; }
    .rgpd-card { background: white; border-radius: 20px; padding: 32px; box-shadow: var(--sh-md); border: 1px solid var(--c-gray-200); }
    .rgpd-icon-wrap { width: 64px; height: 64px; border-radius: 16px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; svg { display: block; } }
    .rgpd-card h3 { font-size: 20px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; }
    .rgpd-card > p { font-size: 14px; color: var(--c-muted); line-height: 1.6; margin-bottom: 24px; }
    .rgpd-section { margin-bottom: 28px; h4 { font-size: 14px; font-weight: 700; color: var(--c-text); margin-bottom: 14px; } }
    .rgpd-toggle { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: var(--r); border: 1.5px solid var(--c-gray-200); cursor: pointer; transition: all 0.2s; &.active { border-color: var(--c-teal); background: var(--c-teal-lt); } }
    .rgt-toggle { width: 44px; height: 24px; border-radius: 12px; background: var(--c-gray-200); position: relative; transition: background 0.3s; flex-shrink: 0; &.on { background: var(--c-teal); } .rgt-knob { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); } &.on .rgt-knob { transform: translateX(20px); } }
    .rgt-info { flex: 1; strong { font-size: 14px; color: var(--c-text); display: flex; align-items: center; gap: 6px; svg { display: block; } } small { font-size: 12px; color: var(--c-muted); } }
    .droits-list { display: flex; flex-direction: column; gap: 14px; }
    .droit-item { display: flex; gap: 14px; padding: 16px; background: var(--c-gray-100); border-radius: var(--r); align-items: flex-start; }
    .droit-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal  { background: var(--c-teal-lt);  color: var(--c-teal); } &.blue  { background: var(--c-blue-lt);  color: var(--c-blue); } &.red   { background: var(--c-red-lt);   color: var(--c-red); } &.amber { background: var(--c-amber-lt); color: var(--c-amber); } }
    .droit-item strong { font-size: 14px; color: var(--c-text); display: block; margin-bottom: 4px; }
    .droit-item p { font-size: 12px; color: var(--c-muted); line-height: 1.4; margin: 0; }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: var(--r-lg); border: 1px solid var(--c-gray-200); }
    .empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--c-teal-lt); color: var(--c-teal); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; svg { display: block; } }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
    .empty-state p { color: var(--c-muted); font-size: 13px; margin-bottom: 20px; }

    /* ── Buttons ── */
    .btn { padding: 10px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; svg { display: block; flex-shrink: 0; } &.btn-primary { background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); color: white; box-shadow: 0 3px 10px rgba(14,157,175,0.3); &:hover { transform: translateY(-1px); } } &.btn-secondary { background: var(--c-teal-lt); color: var(--c-teal); border: 1px solid rgba(14,157,175,0.3); &:hover { background: var(--c-teal); color: white; } } &.btn-danger { background: var(--c-red-lt); color: var(--c-red); &:hover { background: var(--c-red); color: white; } } &.btn-outline { background: none; border: 1.5px solid var(--c-gray-200); color: var(--c-muted); &:hover { border-color: var(--c-teal); color: var(--c-teal); } } &.btn-sm { padding: 5px 12px; font-size: 12px; } &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; } }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 18px; border-radius: var(--r); font-size: 13px; font-weight: 600; transform: translateY(80px); opacity: 0; transition: all 0.3s ease; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 8px; svg { display: block; } &.show { transform: translateY(0); opacity: 1; } &.toast--success { background: var(--c-green-lt); color: var(--c-green); } &.toast--error { background: var(--c-red-lt); color: var(--c-red); } &.toast--info { background: var(--c-teal-lt); color: var(--c-teal); } }

    .spinner { width: 18px; height: 18px; display: inline-block; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeUp 0.22s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfilComponent implements OnInit {

  private profilService = inject(ProfilService);
  private authService   = inject(AuthService);
  private fb            = inject(FormBuilder);

  role = this.authService.getRole();
  ic   = IC;

  activeTab       = signal<Tab>('apercu');
  loading         = signal(true);
  saveLoading     = signal(false);
  mdpLoading      = signal(false);
  notifLoading    = signal(false);
  deletionLoading = signal(false);

  profil       = signal<ProfilEmploye | null>(null);
  loginHistory = signal<any[]>([]);

  saveError   = signal('');
  saveSuccess = signal('');
  mdpError    = signal('');
  mdpSuccess  = signal('');
  rgpdSuccess = signal('');

  notifEmail  = signal(true);
  notifInApp  = signal(true);
  rgpdConsent = signal(false);

  showPwd: Record<string, boolean> = { old: false, new: false, conf: false };

  toast = signal<{show:boolean; message:string; type:string}>({ show: false, message: '', type: 'success' });

  profilForm = this.fb.group({
    dateNaissance: [''], lieuNaissance: [''], nationalite: [''],
    genre: [''], situationFamiliale: [''], cin: [''], numeroCnss: [''],
    telephone: [''], adresse: [''], ville: [''], codePostal: [''],
    contactUrgenceNom: [''], contactUrgenceTelephone: [''], contactUrgenceRelation: ['']
  });

  mdpForm = this.fb.group({
    oldPassword:     ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void { this.loadProfil(); }

  private loadProfil(): void {
    this.profilService.getMonProfil().subscribe({
      next: (data) => { this.profil.set(data); this.patchForm(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private patchForm(p: ProfilEmploye): void {
    this.profilForm.patchValue({
      dateNaissance: p.dateNaissance ?? '', lieuNaissance: p.lieuNaissance ?? '',
      nationalite: p.nationalite ?? '', genre: p.genre ?? '',
      situationFamiliale: p.situationFamiliale ?? '', cin: p.cin ?? '',
      numeroCnss: p.numeroCnss ?? '', telephone: p.telephone ?? '',
      adresse: p.adresse ?? '', ville: p.ville ?? '', codePostal: p.codePostal ?? '',
      contactUrgenceNom: p.contactUrgenceNom ?? '',
      contactUrgenceTelephone: p.contactUrgenceTelephone ?? '',
      contactUrgenceRelation: p.contactUrgenceRelation ?? ''
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.saveError.set(''); this.saveSuccess.set(''); }

  onSaveProfil(): void {
    this.saveLoading.set(true); this.saveError.set('');
    this.profilService.updateMonProfil(this.profilForm.value as any).subscribe({
      next: (data) => { this.saveLoading.set(false); this.profil.set(data); this.saveSuccess.set('Profil mis à jour avec succès !'); setTimeout(() => this.saveSuccess.set(''), 3000); },
      error: (err) => { this.saveLoading.set(false); this.saveError.set(err.error?.message ?? 'Erreur lors de la mise à jour.'); }
    });
  }

  resetForm(): void { const p = this.profil(); if (p) this.patchForm(p); }

  onChangeMdp(): void {
    if (this.mdpForm.invalid || this.mdpMismatch()) { this.mdpForm.markAllAsTouched(); return; }
    this.mdpLoading.set(true); this.mdpError.set('');
    this.authService.changePassword(this.mdpForm.value.oldPassword!, this.mdpForm.value.newPassword!).subscribe({
      next: () => { this.mdpLoading.set(false); this.mdpSuccess.set('Mot de passe changé avec succès !'); this.mdpForm.reset(); setTimeout(() => this.mdpSuccess.set(''), 3000); },
      error: (err) => { this.mdpLoading.set(false); this.mdpError.set(err.error?.message ?? 'Erreur.'); }
    });
  }

  saveNotifSettings(): void {
    this.notifLoading.set(true);
    this.profilService.updateNotifSettings({ notifEmail: this.notifEmail(), notifInApp: this.notifInApp() }).subscribe({
      next: () => { this.notifLoading.set(false); this.showToast('Préférences enregistrées !', 'success'); },
      error: () => { this.notifLoading.set(false); this.showToast('Erreur', 'error'); }
    });
  }

  toggleRgpdConsent(): void {
    const newVal = !this.rgpdConsent(); this.rgpdConsent.set(newVal);
    this.profilService.updateRgpdConsent(newVal).subscribe({
      next: () => this.rgpdSuccess.set(newVal ? 'Consentement accordé' : 'Consentement retiré'),
      error: () => this.rgpdConsent.set(!newVal)
    });
  }

  demanderSuppression(): void {
    if (!confirm('Êtes-vous sûr de vouloir demander la suppression de vos données ?')) return;
    this.deletionLoading.set(true);
    this.profilService.requestDataDeletion().subscribe({
      next: () => { this.deletionLoading.set(false); this.rgpdSuccess.set('Demande de suppression envoyée au service RH.'); },
      error: () => { this.deletionLoading.set(false); this.showToast('Erreur', 'error'); }
    });
  }

  // ── Helpers ──
  isRHOrAdmin(): boolean { return ['RH','ADMIN'].includes(this.role); }
  isMdpInvalid(field: string): boolean { const c = this.mdpForm.get(field); return !!(c?.invalid && c?.touched); }
  mdpMismatch(): boolean { const n = this.mdpForm.get('newPassword')?.value; const c = this.mdpForm.get('confirmPassword')?.value; return !!(c && n !== c); }

  getMdpStrength(): number {
    const pwd = this.mdpForm.get('newPassword')?.value ?? ''; let s = 0;
    if (pwd.length >= 8)          s += 25;
    if (/[A-Z]/.test(pwd))        s += 25;
    if (/[0-9]/.test(pwd))        s += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 25;
    return s;
  }
  getMdpStrengthClass(): string { const s = this.getMdpStrength(); if (s <= 25) return 'weak'; if (s <= 50) return 'medium'; return 'strong'; }
  getMdpStrengthLabel(): string { const s = this.getMdpStrength(); if (s <= 25) return 'Faible'; if (s <= 50) return 'Moyen'; if (s <= 75) return 'Bon'; return 'Très fort'; }

  getInitiales(): string { const p = this.profil(); if (!p) return 'RH'; return (p.prenom[0] + p.nom[0]).toUpperCase(); }

  getRoleIconSvg(): string {
    const map: Record<string, string> = { EMPLOYE: IC.roleEmploye, MANAGER: IC.roleManager, RH: IC.roleRH, ADMIN: IC.roleAdmin };
    return map[this.role] ?? IC.roleEmploye;
  }

  getAnciennete(): string {
    const p = this.profil(); if (!p?.dateEmbauche) return '—';
    const debut = new Date(p.dateEmbauche); const now = new Date();
    const totalM = (now.getFullYear() - debut.getFullYear()) * 12 + (now.getMonth() - debut.getMonth());
    if (totalM < 12) return `${totalM} mois`;
    const y = Math.floor(totalM / 12); const m = totalM % 12;
    return m > 0 ? `${y} an(s) ${m} mois` : `${y} an(s)`;
  }

  getContratColor(type: string): string { const map: Record<string,string> = { CDI: 'cdi', CDD: 'cdd', STAGE: 'stage' }; return map[type] ?? 'cdi'; }

  getContratIconSvg(type: string): string {
    const map: Record<string, string> = { CDI: IC.infinity, CDD: IC.calendar, STAGE: IC.graduationCap };
    return map[type] ?? IC.fileText;
  }

  isFinContratProche(): boolean {
    const dateFin = this.profil()?.contrat?.dateFin; if (!dateFin) return false;
    const diffDays = (new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays < 60;
  }

  getHistoriqueClass(type: string): string { return type?.toLowerCase() ?? 'autre'; }

  getHistoriqueIconSvg(type: string): string {
    const map: Record<string, string> = { RECRUTEMENT: IC.star, PROMOTION: IC.trendUp, MUTATION: IC.refresh, AUTRE: IC.fileText };
    return map[type] ?? IC.fileText;
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}