import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="cp-page">

      <!-- Background decoration -->
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-grid"></div>

      <div class="cp-card">

        <!-- Header -->
        <div class="cp-header">
          <div class="cp-icon-wrap">
            <svg class="cp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div class="cp-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Action requise
          </div>
          <h2>Changement de mot de passe</h2>
          <p>Votre mot de passe temporaire doit être changé avant de continuer.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Mot de passe actuel -->
          <div class="form-group" [class.has-error]="isInvalid('oldPassword')">
            <label>
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              Mot de passe actuel
            </label>
            <div class="input-wrapper">
              <input [type]="show['old'] ? 'text' : 'password'"
                     formControlName="oldPassword"
                     placeholder="Mot de passe temporaire"
                     autocomplete="current-password"
                     [class.error]="isInvalid('oldPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['old'] = !show['old']"
                      [attr.aria-label]="show['old'] ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!show['old']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['old']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="isInvalid('oldPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Champ obligatoire
            </div>
          </div>

          <!-- Séparateur -->
          <div class="divider">
            <span>Nouveau mot de passe</span>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="form-group" [class.has-error]="isInvalid('newPassword')">
            <label>
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Nouveau mot de passe
            </label>
            <div class="input-wrapper">
              <input [type]="show['new'] ? 'text' : 'password'"
                     formControlName="newPassword"
                     placeholder="Minimum 8 caractères"
                     autocomplete="new-password"
                     [class.error]="isInvalid('newPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['new'] = !show['new']">
                <svg *ngIf="!show['new']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['new']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="isInvalid('newPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Minimum 8 caractères requis
            </div>

            <!-- Barre de force -->
            <div class="strength-section" *ngIf="form.get('newPassword')?.value">
              <div class="strength-bar">
                <div class="strength-track">
                  <div class="strength-fill"
                       [style.width]="strength() + '%'"
                       [class]="'fill-' + strengthClass()">
                  </div>
                </div>
              </div>
              <div class="strength-indicators">
                <div class="strength-dot" [class.active]="strength() >= 25">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="strength-text" [class]="'text-' + strengthClass()">
                  {{ strengthLabel() }}
                </span>
              </div>
              <div class="strength-criteria">
                <span class="crit" [class.met]="hasCriteria('length')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('length')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('length')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('length')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  8+ caractères
                </span>
                <span class="crit" [class.met]="hasCriteria('upper')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('upper')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('upper')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('upper')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Majuscule
                </span>
                <span class="crit" [class.met]="hasCriteria('number')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('number')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('number')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('number')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Chiffre
                </span>
                <span class="crit" [class.met]="hasCriteria('special')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('special')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('special')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('special')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Symbole
                </span>
              </div>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="form-group" [class.has-error]="mismatch()">
            <label>
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Confirmer le nouveau mot de passe
            </label>
            <div class="input-wrapper">
              <input [type]="show['confirm'] ? 'text' : 'password'"
                     formControlName="confirmPassword"
                     placeholder="Répétez le mot de passe"
                     autocomplete="new-password"
                     [class.error]="mismatch()" />
              <button type="button" class="toggle-pass"
                      (click)="show['confirm'] = !show['confirm']">
                <svg *ngIf="!show['confirm']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['confirm']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
              <!-- Match indicator -->
              <div class="match-badge" *ngIf="form.get('confirmPassword')?.value && !mismatch()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <div class="field-error" *ngIf="mismatch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <!-- Erreur -->
          <div class="error-alert" *ngIf="errorMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <!-- Succès -->
          <div class="success-alert" *ngIf="successMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="success-text">
              <strong>{{ successMsg() }}</strong>
              <span>Redirection en cours…</span>
            </div>
            <div class="redirect-spinner"></div>
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading() || mismatch()">
            <span class="btn-content" *ngIf="!loading()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Changer le mot de passe
            </span>
            <span class="spinner" *ngIf="loading()"></span>
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page ── */
    .cp-page {
      min-height: 100vh;
      background: #0b1120;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
      font-family: 'Geist', 'DM Sans', system-ui, sans-serif;
    }

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.18;
      pointer-events: none;
    }
    .bg-orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #f59e0b, #ef4444);
      top: -120px; right: -80px;
    }
    .bg-orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #6366f1, #0ea5e9);
      bottom: -80px; left: -80px;
    }
    .bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    /* ── Card ── */
    .cp-card {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 44px 40px;
      width: 100%;
      max-width: 460px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04),
        0 32px 80px rgba(0,0,0,0.6),
        0 0 80px rgba(245,158,11,0.05);
      position: relative;
      z-index: 1;
      animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Header ── */
    .cp-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .cp-icon-wrap {
      width: 68px; height: 68px;
      background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.12));
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 0 30px rgba(245,158,11,0.1);
    }
    .cp-icon {
      width: 32px; height: 32px;
      color: #fbbf24;
    }
    .cp-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.25);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 14px;
    }
    .cp-badge svg { width: 11px; height: 11px; }
    .cp-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 8px;
      letter-spacing: -0.3px;
    }
    .cp-header p {
      color: #64748b;
      font-size: 13.5px;
      line-height: 1.6;
      margin: 0;
    }

    /* ── Divider ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 24px 0 20px;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.07);
    }
    .divider span {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #334155;
    }

    /* ── Form ── */
    .form-group { margin-bottom: 20px; }

    label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .label-icon {
      width: 14px; height: 14px;
      color: #fbbf24;
      flex-shrink: 0;
    }

    .input-wrapper { position: relative; }
    input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 12px 48px 12px 16px;
      font-size: 14px;
      color: #e2e8f0;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      box-sizing: border-box;
      font-family: inherit;
    }
    input::placeholder { color: #334155; }
    input:focus {
      border-color: rgba(251,191,36,0.4);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px rgba(251,191,36,0.07);
    }
    input.error {
      border-color: rgba(239,68,68,0.5);
      box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
    }

    .toggle-pass {
      position: absolute;
      right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center;
      color: #475569;
      transition: color 0.2s;
      border-radius: 6px;
    }
    .toggle-pass:hover { color: #94a3b8; }
    .toggle-pass svg { width: 17px; height: 17px; }

    .match-badge {
      position: absolute;
      right: 44px; top: 50%;
      transform: translateY(-50%);
      width: 20px; height: 20px;
      border-radius: 50%;
      background: rgba(34,197,94,0.15);
      color: #22c55e;
      display: flex; align-items: center; justify-content: center;
      animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .match-badge svg { width: 11px; height: 11px; }
    @keyframes popIn {
      from { transform: translateY(-50%) scale(0); }
      to   { transform: translateY(-50%) scale(1); }
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #f87171;
      font-size: 12px;
      margin-top: 6px;
      animation: slideDown 0.2s ease;
    }
    .field-error svg { width: 13px; height: 13px; flex-shrink: 0; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Strength ── */
    .strength-section { margin-top: 10px; }
    .strength-bar { margin-bottom: 6px; }
    .strength-track {
      height: 4px;
      background: rgba(255,255,255,0.07);
      border-radius: 4px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%; border-radius: 4px;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s;
    }
    .fill-weak   { background: linear-gradient(90deg, #ef4444, #f97316); }
    .fill-medium { background: linear-gradient(90deg, #f97316, #eab308); }
    .fill-strong { background: linear-gradient(90deg, #22c55e, #10b981); }

    .strength-indicators {
      display: flex; align-items: center;
      gap: 6px; margin-bottom: 8px;
    }
    .strength-dot {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s;
    }
    .strength-dot.active {
      background: rgba(34,197,94,0.15);
      border-color: #22c55e; color: #22c55e;
    }
    .strength-dot svg { width: 9px; height: 9px; }
    .strength-text { font-size: 12px; font-weight: 600; }
    .text-weak   { color: #f97316; }
    .text-medium { color: #eab308; }
    .text-strong { color: #22c55e; }

    .strength-criteria { display: flex; gap: 8px; flex-wrap: wrap; }
    .crit {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #475569;
      padding: 3px 8px; border-radius: 6px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      transition: all 0.25s;
    }
    .crit svg { width: 10px; height: 10px; flex-shrink: 0; }
    .crit.met {
      color: #34d399;
      background: rgba(34,197,94,0.08);
      border-color: rgba(34,197,94,0.25);
    }

    /* ── Alerts ── */
    .error-alert {
      display: flex; align-items: center; gap: 10px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: #fca5a5;
      padding: 12px 14px; border-radius: 12px;
      margin-bottom: 16px; font-size: 13px; line-height: 1.4;
    }
    .error-alert svg { width: 16px; height: 16px; flex-shrink: 0; color: #f87171; }

    .success-alert {
      display: flex; align-items: center; gap: 12px;
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.2);
      color: #86efac;
      padding: 14px 16px; border-radius: 12px;
      margin-bottom: 16px; font-size: 13px;
      animation: slideDown 0.3s ease;
    }
    .success-alert svg { width: 20px; height: 20px; flex-shrink: 0; color: #4ade80; }
    .success-text {
      display: flex; flex-direction: column; gap: 2px; flex: 1;
    }
    .success-text strong { font-weight: 600; color: #4ade80; font-size: 13px; }
    .success-text span   { font-size: 11.5px; color: #64748b; }
    .redirect-spinner {
      width: 16px; height: 16px; flex-shrink: 0;
      border: 2px solid rgba(74,222,128,0.2);
      border-top-color: #4ade80;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Button ── */
    .btn {
      display: inline-flex; align-items: center;
      justify-content: center; gap: 8px;
      padding: 12px 20px; border-radius: 12px;
      font-size: 14px; font-weight: 600;
      text-decoration: none; border: none;
      cursor: pointer; transition: all 0.2s;
      font-family: inherit;
    }
    .btn svg { width: 16px; height: 16px; }
    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: #fff;
      box-shadow: 0 4px 20px rgba(245,158,11,0.25);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(245,158,11,0.35);
      filter: brightness(1.08);
    }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

    .submit-btn { width: 100%; padding: 14px; margin-top: 4px; font-size: 15px; }
    .btn-content { display: flex; align-items: center; gap: 8px; }

    /* ── Spinner ── */
    .spinner {
      width: 19px; height: 19px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 500px) {
      .cp-card { padding: 32px 24px; }
    }
  `]
})
export class ChangePasswordComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    oldPassword:     ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  loading    = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  show: Record<string, boolean> = { old: false, new: false, confirm: false };

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  mismatch(): boolean {
    const n = this.form.get('newPassword')?.value;
    const c = this.form.get('confirmPassword')?.value;
    return !!(c && n !== c);
  }

  hasCriteria(type: string): boolean {
    const pwd = this.form.get('newPassword')?.value ?? '';
    switch (type) {
      case 'length':  return pwd.length >= 8;
      case 'upper':   return /[A-Z]/.test(pwd);
      case 'number':  return /[0-9]/.test(pwd);
      case 'special': return /[^A-Za-z0-9]/.test(pwd);
      default:        return false;
    }
  }

  strength(): number {
    const pwd = this.form.get('newPassword')?.value ?? '';
    let score = 0;
    if (pwd.length >= 8)          score += 25;
    if (/[A-Z]/.test(pwd))        score += 25;
    if (/[0-9]/.test(pwd))        score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  }

  strengthClass(): string {
    const s = this.strength();
    if (s <= 25) return 'weak';
    if (s <= 50) return 'medium';
    return 'strong';
  }

  strengthLabel(): string {
    const s = this.strength();
    if (s <= 25) return 'Trop faible';
    if (s <= 50) return 'Moyen';
    if (s <= 75) return 'Bon';
    return 'Très fort';
  }

  onSubmit(): void {
    if (this.form.invalid || this.mismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.changePassword(
      this.form.value.oldPassword!,
      this.form.value.newPassword!
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Mot de passe changé avec succès !');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Erreur lors du changement.');
      }
    });
  }
}