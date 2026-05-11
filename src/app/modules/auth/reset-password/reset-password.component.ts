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

      <!-- Ambient background -->
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="bg-noise"></div>
      <div class="bg-grid"></div>

      <div class="rp-card">

        <!-- Top accent bar -->
        <div class="card-accent"></div>

        <!-- Header -->
        <div class="rp-header">
          <div class="rp-icon-wrap">
            <div class="rp-icon-ring"></div>
            <svg class="rp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5"/>
              <path d="M21 2l-9.6 9.6"/>
              <path d="M15.5 6.5L17 8l2.5-2.5"/>
              <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h2>Nouveau mot de passe</h2>
          <p>Choisissez un mot de passe sécurisé<br>pour protéger votre compte.</p>
        </div>

        <!-- Token invalide -->
        <div class="state-panel" *ngIf="tokenInvalid()">
          <div class="state-icon-wrap state-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h3>Lien invalide ou expiré</h3>
          <p>Ce lien de réinitialisation n'est plus valide.<br>Demandez un nouveau lien pour continuer.</p>
          <a routerLink="/forgot-password" class="action-btn action-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <div class="field-group" [class.field-has-error]="isInvalid('newPassword')">
            <label class="field-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Nouveau mot de passe
            </label>
            <div class="input-shell">
              <input [type]="show['new'] ? 'text' : 'password'"
                     formControlName="newPassword"
                     placeholder="Minimum 8 caractères"
                     autocomplete="new-password"
                     [class.input-error]="isInvalid('newPassword')" />
              <button type="button" class="eye-btn"
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

            <div class="inline-error" *ngIf="isInvalid('newPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Minimum 8 caractères requis
            </div>

            <!-- Indicateur de force -->
            <div class="strength-wrap" *ngIf="form.get('newPassword')?.value">
              <div class="strength-track">
                <div class="strength-fill"
                     [style.width]="strength() + '%'"
                     [class]="'sf-' + strengthClass()">
                </div>
              </div>
              <div class="strength-row">
                <div class="strength-badge" [class]="'sb-' + strengthClass()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                       *ngIf="strength() >= 25">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                       *ngIf="strength() < 25">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                <span class="strength-label" [class]="'sl-' + strengthClass()">
                  {{ strengthLabel() }}
                </span>
                <div class="criteria-pills">
                  <span class="pill" [class.pill-ok]="hasCriteria('length')">8+</span>
                  <span class="pill" [class.pill-ok]="hasCriteria('upper')">Aa</span>
                  <span class="pill" [class.pill-ok]="hasCriteria('number')">123</span>
                  <span class="pill" [class.pill-ok]="hasCriteria('special')">#!@</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="field-group" [class.field-has-error]="mismatch()">
            <label class="field-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Confirmer le mot de passe
            </label>
            <div class="input-shell">
              <input [type]="show['confirm'] ? 'text' : 'password'"
                     formControlName="confirmPassword"
                     placeholder="Répétez le mot de passe"
                     autocomplete="new-password"
                     [class.input-error]="mismatch()" />
              <button type="button" class="eye-btn"
                      (click)="show['confirm'] = !show['confirm']">
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
              <div class="match-tick" *ngIf="form.get('confirmPassword')?.value && !mismatch()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <div class="inline-error" *ngIf="mismatch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <!-- Erreur globale -->
          <div class="global-error" *ngIf="errorMsg()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <button type="submit" class="submit-btn"
                  [disabled]="loading() || mismatch()">
            <span class="submit-inner" *ngIf="!loading()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Réinitialiser le mot de passe
            </span>
            <span class="spinner" *ngIf="loading()"></span>
          </button>

        </form>

        <!-- Succès -->
        <div class="state-panel" *ngIf="success()">
          <div class="state-icon-wrap state-success">
            <div class="success-ring"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>Mot de passe mis à jour !</h3>
          <p>Votre mot de passe a été réinitialisé avec succès.<br>Vous pouvez maintenant vous connecter.</p>
          <a routerLink="/login" class="action-btn action-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter
          </a>
        </div>

        <a routerLink="/login" class="back-link"
           *ngIf="!success() && !tokenInvalid()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour à la connexion
        </a>

      </div>
    </div>
  `,
  styles: [`
    /* ── Google Font import (via @import in host or index.html ideally) ── */
    /* Using system stack as fallback; add to index.html:
       <link rel="preconnect" href="https://fonts.googleapis.com">
       <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    */

    /* ── CSS Variables ── */
    :host {
      --c-bg:        #080d18;
      --c-card:      #0d1525;
      --c-border:    rgba(255,255,255,0.07);
      --c-border-hi: rgba(255,255,255,0.12);
      --c-input-bg:  rgba(255,255,255,0.04);
      --c-text:      #e2e8f0;
      --c-muted:     #64748b;
      --c-subtle:    #334155;
      --c-accent:    #38bdf8;
      --c-accent-2:  #818cf8;
      --c-success:   #34d399;
      --c-danger:    #f87171;
      --c-warn:      #fbbf24;
      --font:        'Outfit', 'DM Sans', system-ui, sans-serif;
      --radius-card: 22px;
      --radius-input: 11px;
      --radius-btn:  12px;
    }

    /* ── Page ── */
    .rp-page {
      min-height: 100vh;
      background: var(--c-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
      font-family: var(--font);
    }

    /* ── Background layers ── */
    .bg-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(120px);
      opacity: 0.12;
    }
    .bg-glow-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle at center, #0ea5e9 0%, transparent 70%);
      top: -200px; left: -150px;
    }
    .bg-glow-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle at center, #6366f1 0%, transparent 70%);
      bottom: -150px; right: -100px;
    }
    .bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,
        black 40%, transparent 100%);
    }
    .bg-noise {
      position: absolute; inset: 0;
      opacity: 0.025;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
    }

    /* ── Card ── */
    .rp-card {
      background: var(--c-card);
      border: 1px solid var(--c-border);
      border-radius: var(--radius-card);
      padding: 0;
      width: 100%;
      max-width: 460px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.03),
        0 40px 100px rgba(0,0,0,0.7),
        0 0 60px rgba(14,165,233,0.05);
      position: relative;
      z-index: 1;
      overflow: hidden;
      animation: cardIn 0.55s cubic-bezier(0.34,1.4,0.64,1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(28px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Accent line at top of card */
    .card-accent {
      height: 3px;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--c-accent) 30%,
        var(--c-accent-2) 70%,
        transparent 100%);
      opacity: 0.8;
    }

    /* Card inner content */
    .rp-card > *:not(.card-accent) {
      padding-left: 40px;
      padding-right: 40px;
    }
    .rp-card > form {
      padding-left: 40px;
      padding-right: 40px;
      padding-bottom: 36px;
    }
    .rp-card > .back-link,
    .rp-card > .state-panel {
      padding-left: 40px;
      padding-right: 40px;
    }

    /* ── Header ── */
    .rp-header {
      text-align: center;
      padding-top: 36px;
      padding-bottom: 32px;
    }

    .rp-icon-wrap {
      width: 72px; height: 72px;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
    }

    .rp-icon-ring {
      position: absolute; inset: 0;
      border-radius: 22px;
      background: linear-gradient(135deg,
        rgba(14,165,233,0.12) 0%,
        rgba(99,102,241,0.12) 100%);
      border: 1px solid rgba(56,189,248,0.2);
      box-shadow:
        0 0 0 6px rgba(14,165,233,0.04),
        inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .rp-icon {
      width: 32px; height: 32px;
      color: var(--c-accent);
      position: relative; z-index: 1;
    }

    .rp-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--c-text);
      margin: 0 0 8px;
      letter-spacing: -0.4px;
    }

    .rp-header p {
      color: var(--c-muted);
      font-size: 13.5px;
      line-height: 1.65;
      margin: 0;
    }

    /* Divider before form */
    form {
      border-top: 1px solid var(--c-border);
      padding-top: 28px;
    }

    /* ── Field groups ── */
    .field-group {
      margin-bottom: 22px;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--c-muted);
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin-bottom: 9px;
    }

    .field-label svg {
      width: 13px; height: 13px;
      color: var(--c-accent);
      flex-shrink: 0;
    }

    /* ── Input ── */
    .input-shell {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-shell input {
      width: 100%;
      background: var(--c-input-bg);
      border: 1px solid var(--c-border-hi);
      border-radius: var(--radius-input);
      padding: 12px 50px 12px 16px;
      font-size: 14px;
      color: var(--c-text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      box-sizing: border-box;
      font-family: var(--font);
    }

    .input-shell input::placeholder {
      color: var(--c-subtle);
      font-size: 13px;
    }

    .input-shell input:focus {
      border-color: rgba(56,189,248,0.45);
      background: rgba(56,189,248,0.04);
      box-shadow: 0 0 0 3px rgba(56,189,248,0.07);
    }

    .input-shell input.input-error {
      border-color: rgba(248,113,113,0.45);
      box-shadow: 0 0 0 3px rgba(248,113,113,0.07);
    }

    /* ── Eye toggle ── */
    .eye-btn {
      position: absolute;
      right: 12px;
      background: none; border: none;
      cursor: pointer;
      padding: 5px;
      display: flex; align-items: center; justify-content: center;
      color: var(--c-subtle);
      transition: color 0.2s;
      border-radius: 6px;
    }
    .eye-btn:hover { color: var(--c-muted); }
    .eye-btn svg { width: 16px; height: 16px; }

    /* ── Match tick ── */
    .match-tick {
      position: absolute;
      right: 44px;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: rgba(52,211,153,0.12);
      border: 1px solid rgba(52,211,153,0.3);
      display: flex; align-items: center; justify-content: center;
      color: var(--c-success);
      animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    .match-tick svg { width: 10px; height: 10px; }
    @keyframes popIn {
      from { transform: scale(0) rotate(-10deg); opacity: 0; }
      to   { transform: scale(1) rotate(0); opacity: 1; }
    }

    /* ── Inline error ── */
    .inline-error {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--c-danger);
      font-size: 12px;
      margin-top: 7px;
      animation: slideDown 0.2s ease both;
    }
    .inline-error svg { width: 13px; height: 13px; flex-shrink: 0; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-5px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Strength indicator ── */
    .strength-wrap {
      margin-top: 12px;
    }

    .strength-track {
      height: 3px;
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .strength-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.45s cubic-bezier(0.4,0,0.2,1),
                  background 0.45s;
    }
    .sf-weak   { background: linear-gradient(90deg, #ef4444, #f97316); }
    .sf-medium { background: linear-gradient(90deg, #f97316, #eab308); }
    .sf-strong { background: linear-gradient(90deg, #10b981, #34d399); }

    .strength-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .strength-badge {
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s;
    }
    .strength-badge svg { width: 10px; height: 10px; }
    .sb-weak   { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
    .sb-medium { background: rgba(234,179,8,0.15);  color: #fbbf24; border: 1px solid rgba(234,179,8,0.3); }
    .sb-strong { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }

    .strength-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .sl-weak   { color: #f87171; }
    .sl-medium { color: #fbbf24; }
    .sl-strong { color: #34d399; }

    /* Criteria pills */
    .criteria-pills {
      display: flex;
      gap: 5px;
      margin-left: auto;
    }

    .pill {
      padding: 2px 8px;
      border-radius: 5px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--c-subtle);
      transition: all 0.25s;
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .pill.pill-ok {
      background: rgba(52,211,153,0.1);
      border-color: rgba(52,211,153,0.3);
      color: var(--c-success);
    }

    /* ── Global error ── */
    .global-error {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239,68,68,0.07);
      border: 1px solid rgba(239,68,68,0.18);
      color: #fca5a5;
      padding: 12px 14px;
      border-radius: var(--radius-input);
      margin-bottom: 18px;
      font-size: 13px;
      line-height: 1.45;
    }
    .global-error svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--c-danger); }

    /* ── Submit button ── */
    .submit-btn {
      width: 100%;
      padding: 14px 20px;
      margin-top: 6px;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border: none;
      border-radius: var(--radius-btn);
      color: #fff;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: var(--font);
      letter-spacing: 0.1px;
      box-shadow:
        0 4px 20px rgba(14,165,233,0.2),
        inset 0 1px 0 rgba(255,255,255,0.12);
      transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(14,165,233,0.3);
      filter: brightness(1.07);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .submit-inner {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .submit-inner svg { width: 16px; height: 16px; }

    /* ── State panels ── */
    .state-panel {
      text-align: center;
      padding: 28px 0 36px;
    }

    .state-icon-wrap {
      width: 76px; height: 76px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      position: relative;
    }
    .state-icon-wrap svg { width: 34px; height: 34px; position: relative; z-index: 1; }

    .state-error {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: var(--c-danger);
      box-shadow: 0 0 40px rgba(239,68,68,0.08);
    }

    .state-success {
      background: rgba(52,211,153,0.08);
      border: 1px solid rgba(52,211,153,0.2);
      color: var(--c-success);
      box-shadow: 0 0 40px rgba(52,211,153,0.1);
    }

    /* Pulsing ring on success */
    .success-ring {
      position: absolute; inset: -8px;
      border-radius: 50%;
      border: 1px solid rgba(52,211,153,0.2);
      animation: pulse 2.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50%       { transform: scale(1.08); opacity: 0.15; }
    }

    .state-panel h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--c-text);
      margin: 0 0 10px;
      letter-spacing: -0.3px;
    }
    .state-panel p {
      color: var(--c-muted);
      font-size: 14px;
      line-height: 1.65;
      margin: 0 0 28px;
    }

    /* ── Action buttons (in state panels) ── */
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-btn);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      font-family: var(--font);
      transition: all 0.2s;
    }
    .action-btn svg { width: 15px; height: 15px; }

    .action-btn-primary {
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff;
      box-shadow: 0 4px 20px rgba(14,165,233,0.2);
    }
    .action-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(14,165,233,0.3);
      filter: brightness(1.07);
    }

    /* ── Back link ── */
    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 4px;
      padding-bottom: 28px;
      color: var(--c-subtle);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link svg {
      width: 14px; height: 14px;
      transition: transform 0.2s;
    }
    .back-link:hover {
      color: var(--c-accent);
    }
    .back-link:hover svg { transform: translateX(-3px); }

    /* ── Spinner ── */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 500px) {
      .rp-card > *:not(.card-accent) { padding-left: 24px; padding-right: 24px; }
      .rp-card > form { padding-left: 24px; padding-right: 24px; }
      .rp-card > .back-link,
      .rp-card > .state-panel { padding-left: 24px; padding-right: 24px; }
      .criteria-pills { display: none; }
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
    }, { responseType: 'text' }).subscribe({
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