import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="rp-page">

      <!-- Background decoration -->
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-grid"></div>

      <div class="rp-card">

        <!-- Header -->
        <div class="rp-header">
          <div class="rp-icon-wrap">
            <svg class="rp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5"/>
              <path d="M21 2l-9.6 9.6"/>
              <path d="M15.5 6.5L17 8l2.5-2.5"/>
              <path d="M7.5 15.5v.01"/>
            </svg>
          </div>
          <h2>Nouveau mot de passe</h2>
          <p>Choisissez un mot de passe sécurisé pour protéger votre compte.</p>
        </div>

        <!-- Token invalide -->
        <div class="state-panel error-state" *ngIf="tokenInvalid()">
          <div class="state-icon-wrap error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h3>Lien invalide ou expiré</h3>
          <p>Ce lien de réinitialisation n'est plus valide ou a expiré.<br>Demandez un nouveau lien pour continuer.</p>
          <a routerLink="/forgot-password" class="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Demander un nouveau lien
          </a>
        </div>

        <!-- Formulaire -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()"
              *ngIf="!tokenInvalid() && !success()">

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
                      (click)="show['new'] = !show['new']"
                      [attr.aria-label]="show['new'] ? 'Masquer' : 'Afficher'">
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
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Confirmer le mot de passe
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
              <div class="match-badge success" *ngIf="form.get('confirmPassword')?.value && !mismatch()">
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

          <!-- Erreur globale -->
          <div class="error-alert" *ngIf="errorMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading() || mismatch()">
            <span class="btn-content" *ngIf="!loading()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Réinitialiser le mot de passe
            </span>
            <span class="spinner" *ngIf="loading()"></span>
          </button>

        </form>

        <!-- Succès -->
        <div class="state-panel success-state" *ngIf="success()">
          <div class="state-icon-wrap success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>Mot de passe mis à jour !</h3>
          <p>Votre mot de passe a été réinitialisé avec succès.<br>Vous pouvez maintenant vous connecter.</p>
          <a routerLink="/login" class="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter
          </a>
        </div>

        <a routerLink="/login" class="back-link"
           *ngIf="!success() && !tokenInvalid()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour à la connexion
        </a>

      </div>
    </div>
  `,
  styles: [`
    /* ── Page Layout ── */
    .rp-page {
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

    /* Background decoration */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.18;
      pointer-events: none;
    }
    .bg-orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #0ea5e9, #2563eb);
      top: -100px; left: -100px;
    }
    .bg-orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #6366f1, #a855f7);
      bottom: -80px; right: -80px;
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
    .rp-card {
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
        0 0 80px rgba(14, 165, 233, 0.06);
      position: relative;
      z-index: 1;
      animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Header ── */
    .rp-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .rp-icon-wrap {
      width: 68px; height: 68px;
      background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15));
      border: 1px solid rgba(14,165,233,0.25);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 0 30px rgba(14,165,233,0.12);
    }
    .rp-icon {
      width: 32px; height: 32px;
      color: #38bdf8;
    }
    .rp-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 8px;
      letter-spacing: -0.3px;
    }
    .rp-header p {
      color: #64748b;
      font-size: 13.5px;
      line-height: 1.6;
      margin: 0;
    }

    /* ── Form ── */
    .form-group {
      margin-bottom: 20px;
    }
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
      color: #38bdf8;
      flex-shrink: 0;
    }

    .input-wrapper {
      position: relative;
    }
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
      border-color: rgba(56,189,248,0.5);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
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
      cursor: pointer;
      padding: 4px;
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
      display: flex; align-items: center; justify-content: center;
      animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .match-badge.success {
      background: rgba(34,197,94,0.15);
      color: #22c55e;
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
    .strength-section {
      margin-top: 10px;
    }
    .strength-bar { margin-bottom: 6px; }
    .strength-track {
      height: 4px;
      background: rgba(255,255,255,0.07);
      border-radius: 4px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s;
    }
    .fill-weak   { background: linear-gradient(90deg, #ef4444, #f97316); }
    .fill-medium { background: linear-gradient(90deg, #f97316, #eab308); }
    .fill-strong { background: linear-gradient(90deg, #22c55e, #10b981); }

    .strength-indicators {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
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
      border-color: #22c55e;
      color: #22c55e;
    }
    .strength-dot svg { width: 9px; height: 9px; }
    .strength-text {
      font-size: 12px;
      font-weight: 600;
    }
    .text-weak   { color: #f97316; }
    .text-medium { color: #eab308; }
    .text-strong { color: #22c55e; }

    .strength-criteria {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .crit {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
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
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: #fca5a5;
      padding: 12px 14px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-size: 13px;
      line-height: 1.4;
    }
    .error-alert svg { width: 16px; height: 16px; flex-shrink: 0; color: #f87171; }

    /* ── Button ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn svg { width: 16px; height: 16px; }

    .btn-primary {
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff;
      box-shadow: 0 4px 20px rgba(14,165,233,0.25);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(14,165,233,0.35);
      filter: brightness(1.08);
    }
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      margin-top: 4px;
      font-size: 15px;
    }
    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── State Panels ── */
    .state-panel {
      text-align: center;
      padding: 12px 0 4px;
    }
    .state-icon-wrap {
      width: 72px; height: 72px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .state-icon-wrap svg { width: 34px; height: 34px; }
    .state-icon-wrap.error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171;
      box-shadow: 0 0 30px rgba(239,68,68,0.1);
    }
    .state-icon-wrap.success {
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.2);
      color: #4ade80;
      box-shadow: 0 0 30px rgba(34,197,94,0.1);
    }
    .state-panel h3 {
      font-size: 20px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 10px;
      letter-spacing: -0.3px;
    }
    .state-panel p {
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 28px;
    }

    /* ── Back Link ── */
    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 20px;
      color: #475569;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link svg { width: 14px; height: 14px; }
    .back-link:hover { color: #38bdf8; }

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
      .rp-card { padding: 32px 24px; }
    }
  `]
})
export class ResetPasswordComponent {
  private fb    = inject(FormBuilder);
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  loading      = signal(false);
  errorMsg     = signal('');
  success      = signal(false);
  tokenInvalid = signal(false);
  show: Record<string, boolean> = { new: false, confirm: false };

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  constructor() {
    if (!this.token) this.tokenInvalid.set(true);
  }

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

    this.http.post('http://localhost:8080/api/auth/reset-password', {
      token:       this.token,
      newPassword: this.form.value.newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? '';
        if (msg.includes('Token')) {
          this.tokenInvalid.set(true);
        } else {
          this.errorMsg.set(msg || 'Erreur lors de la réinitialisation.');
        }
      }
    });
  }
}