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
      <div class="cp-card">

        <!-- Header -->
        <div class="cp-header">
          <div class="cp-icon-wrap">
            <svg class="cp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h2>Changement de mot de passe</h2>
          <p>Définissez un nouveau mot de passe pour accéder à votre compte.</p>
        </div>

        <!-- Notice -->
        <div class="cp-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Votre mot de passe temporaire doit être changé avant de continuer.
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Mot de passe actuel -->
          <div class="form-group" [class.has-error]="isInvalid('oldPassword')">
            <label for="oldPassword">Mot de passe actuel</label>
            <div class="input-wrapper">
              <input [type]="show['old'] ? 'text' : 'password'"
                     id="oldPassword"
                     formControlName="oldPassword"
                     placeholder="Votre mot de passe temporaire"
                     autocomplete="current-password"
                     [class.error]="isInvalid('oldPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['old'] = !show['old']"
                      [attr.aria-label]="show['old'] ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!show['old']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['old']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="isInvalid('oldPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Champ obligatoire
            </div>
          </div>

          <div class="divider"></div>

          <!-- Nouveau mot de passe -->
          <div class="form-group" [class.has-error]="isInvalid('newPassword')">
            <label for="newPassword">Nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="show['new'] ? 'text' : 'password'"
                     id="newPassword"
                     formControlName="newPassword"
                     placeholder="Minimum 8 caractères"
                     autocomplete="new-password"
                     [class.error]="isInvalid('newPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['new'] = !show['new']"
                      [attr.aria-label]="show['new'] ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!show['new']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['new']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="isInvalid('newPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Minimum 8 caractères requis
            </div>

            <!-- Indicateur de force -->
            <div class="strength-section" *ngIf="form.get('newPassword')?.value">
              <div class="strength-bars">
                <div class="strength-bar-segment" [class]="getBarClass(1)"></div>
                <div class="strength-bar-segment" [class]="getBarClass(2)"></div>
                <div class="strength-bar-segment" [class]="getBarClass(3)"></div>
                <div class="strength-bar-segment" [class]="getBarClass(4)"></div>
              </div>
              <span class="strength-label" [class]="'label-' + strengthClass()">
                {{ strengthLabel() }}
              </span>
              <div class="strength-criteria">
                <span class="crit" [class.met]="hasCriteria('length')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('length')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('length')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('length')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  8+ caractères
                </span>
                <span class="crit" [class.met]="hasCriteria('upper')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('upper')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('upper')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('upper')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Majuscule
                </span>
                <span class="crit" [class.met]="hasCriteria('number')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <polyline *ngIf="hasCriteria('number')" points="20 6 9 17 4 12"/>
                    <line *ngIf="!hasCriteria('number')" x1="18" y1="6" x2="6" y2="18"/>
                    <line *ngIf="!hasCriteria('number')" x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Chiffre
                </span>
                <span class="crit" [class.met]="hasCriteria('special')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
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
            <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="show['confirm'] ? 'text' : 'password'"
                     id="confirmPassword"
                     formControlName="confirmPassword"
                     placeholder="Répétez le mot de passe"
                     autocomplete="new-password"
                     [class.error]="mismatch()" />
              <button type="button" class="toggle-pass"
                      (click)="show['confirm'] = !show['confirm']"
                      [attr.aria-label]="show['confirm'] ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!show['confirm']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="show['confirm']" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
              <div class="match-badge" *ngIf="form.get('confirmPassword')?.value && !mismatch()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <div class="field-error" *ngIf="mismatch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <!-- Erreur API -->
          <div class="error-alert" *ngIf="errorMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <!-- Succès -->
          <div class="success-alert" *ngIf="successMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="success-text">
              <strong>{{ successMsg() }}</strong>
              <span>Redirection en cours…</span>
            </div>
            <div class="redirect-spinner"></div>
          </div>

          <button type="submit" class="submit-btn"
                  [disabled]="loading() || mismatch()">
            <span *ngIf="!loading()" class="btn-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
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
      background: var(--color-bg-page, #f8fafc);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
    }

    /* ── Card ── */
    .cp-card {
      background: var(--color-bg-card, #ffffff);
      border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
      border-radius: 16px;
      padding: 36px 32px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.05);
    }

    /* ── Header ── */
    .cp-header {
      margin-bottom: 20px;
    }
    .cp-icon-wrap {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .cp-icon {
      width: 22px;
      height: 22px;
      color: #2563eb;
    }
    .cp-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary, #0f172a);
      margin: 0 0 6px;
      letter-spacing: -0.2px;
    }
    .cp-header p {
      color: var(--color-text-secondary, #64748b);
      font-size: 13.5px;
      line-height: 1.6;
      margin: 0;
    }

    /* ── Notice ── */
    .cp-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      color: #92400e;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .cp-notice svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      color: #d97706;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: var(--color-border, rgba(0, 0, 0, 0.07));
      margin: 20px 0;
    }

    /* ── Form ── */
    .form-group {
      margin-bottom: 18px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary, #475569);
      margin-bottom: 6px;
    }

    .input-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      background: var(--color-bg-input, #f8fafc);
      border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      padding: 10px 44px 10px 12px;
      font-size: 14px;
      color: var(--color-text-primary, #0f172a);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      box-sizing: border-box;
      font-family: inherit;
    }
    input::placeholder {
      color: #94a3b8;
    }
    input:focus {
      border-color: #2563eb;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    input.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
    }

    .toggle-pass {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      transition: color 0.15s;
      border-radius: 4px;
    }
    .toggle-pass:hover { color: #64748b; }
    .toggle-pass svg {
      width: 17px;
      height: 17px;
    }

    .match-badge {
      position: absolute;
      right: 38px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #dcfce7;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .match-badge svg {
      width: 10px;
      height: 10px;
    }
    @keyframes popIn {
      from { transform: translateY(-50%) scale(0); }
      to   { transform: translateY(-50%) scale(1); }
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #ef4444;
      font-size: 12px;
      margin-top: 5px;
      animation: slideDown 0.15s ease;
    }
    .field-error svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-3px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Strength bars ── */
    .strength-section {
      margin-top: 10px;
    }
    .strength-bars {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
    }
    .strength-bar-segment {
      flex: 1;
      height: 3px;
      border-radius: 2px;
      background: #e2e8f0;
      transition: background 0.3s ease;
    }
    .strength-bar-segment.bar-weak   { background: #ef4444; }
    .strength-bar-segment.bar-medium { background: #f59e0b; }
    .strength-bar-segment.bar-strong { background: #22c55e; }
    .strength-bar-segment.bar-empty  { background: #e2e8f0; }

    .strength-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .label-weak   { color: #ef4444; }
    .label-medium { color: #f59e0b; }
    .label-strong { color: #16a34a; }

    .strength-criteria {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .crit {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #94a3b8;
      padding: 3px 8px;
      border-radius: 20px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }
    .crit svg {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }
    .crit.met {
      color: #15803d;
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    /* ── Alerts ── */
    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 11px 13px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
      line-height: 1.4;
      animation: slideDown 0.2s ease;
    }
    .error-alert svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      color: #ef4444;
    }

    .success-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
      padding: 13px 15px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
      animation: slideDown 0.25s ease;
    }
    .success-alert svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: #22c55e;
    }
    .success-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .success-text strong {
      font-weight: 600;
      color: #15803d;
      font-size: 13px;
    }
    .success-text span {
      font-size: 12px;
      color: #4ade80;
    }
    .redirect-spinner {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      border: 2px solid #bbf7d0;
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Button ── */
    .submit-btn {
      width: 100%;
      padding: 11px 20px;
      margin-top: 6px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      background: #2563eb;
      color: #fff;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 1px 2px rgba(37, 99, 235, 0.3);
    }
    .submit-btn:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .submit-btn:active:not(:disabled) { transform: scale(0.99); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .submit-btn svg {
      width: 16px;
      height: 16px;
    }

    /* ── Spinner ── */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Dark mode ── */
    @media (prefers-color-scheme: dark) {
      .cp-page   { background: #0f172a; }
      .cp-card   { background: #1e293b; border-color: rgba(255,255,255,0.08); box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.3); }
      .cp-icon-wrap { background: rgba(37,99,235,0.15); }
      .cp-header h2 { color: #f1f5f9; }
      .cp-header p  { color: #94a3b8; }
      .cp-notice { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #fbbf24; }
      .cp-notice svg { color: #fbbf24; }
      .divider { background: rgba(255,255,255,0.07); }
      label { color: #94a3b8; }
      input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #e2e8f0; }
      input::placeholder { color: #475569; }
      input:focus { background: rgba(255,255,255,0.07); border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      .strength-bar-segment { background: rgba(255,255,255,0.1); }
      .crit { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); color: #64748b; }
      .crit.met { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); color: #4ade80; }
      .error-alert  { background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.2);  color: #fca5a5; }
      .success-alert { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2);  color: #86efac; }
      .success-text strong { color: #4ade80; }
    }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .cp-card { padding: 28px 20px; }
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

  /** Score 0–4 : nombre de critères validés */
  strengthScore(): number {
    const pwd = this.form.get('newPassword')?.value ?? '';
    return [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd)
    ].filter(Boolean).length;
  }

  /**
   * Retourne la classe CSS à appliquer sur le segment n° index (1–4).
   * Les segments remplis prennent la couleur du niveau courant.
   */
  getBarClass(index: number): string {
    const score = this.strengthScore();
    if (index > score) return 'bar-empty';
    if (score <= 1)    return 'bar-weak';
    if (score <= 2)    return 'bar-medium';
    return 'bar-strong';
  }

  strengthClass(): string {
    const s = this.strengthScore();
    if (s <= 1) return 'weak';
    if (s <= 2) return 'medium';
    return 'strong';
  }

  strengthLabel(): string {
    const s = this.strengthScore();
    if (s <= 1) return 'Trop faible';
    if (s <= 2) return 'Moyen';
    if (s <= 3) return 'Bon';
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