import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="fp-page">
      <div class="fp-card">

        <div class="fp-header">
          <div class="fp-icon">
            <!-- Lock icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h2>Mot de passe oublié</h2>
          <p>
            Entrez votre <strong>CIN</strong> ou votre
            <strong>email</strong> pour recevoir un lien
            de réinitialisation.
          </p>
        </div>

        <!-- Toggle CIN / Email -->
        <div class="mode-toggle">
          <button class="mt-btn"
                  [class.active]="mode() === 'cin'"
                  (click)="switchMode('cin')">
            <!-- ID Card icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <circle cx="8" cy="12" r="2"/>
              <path d="M14 9h4M14 12h4M14 15h2"/>
            </svg>
            CIN
          </button>
          <button class="mt-btn"
                  [class.active]="mode() === 'email'"
                  (click)="switchMode('email')">
            <!-- Mail icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
            Email
          </button>
        </div>

        <form [formGroup]="form"
              (ngSubmit)="onSubmit()"
              *ngIf="!sent()">

          <div class="form-group">
            <label>
              {{ mode() === 'cin' ? 'Numéro CIN' : 'Adresse email' }}
            </label>
            <div class="input-wrapper">
              <!-- CIN icon -->
              <span class="input-icon" *ngIf="mode() === 'cin'">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <circle cx="8" cy="12" r="2"/>
                  <path d="M14 9h4M14 12h4M14 15h2"/>
                </svg>
              </span>
              <!-- Mail icon -->
              <span class="input-icon" *ngIf="mode() === 'email'">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
              </span>
              <input
                [type]="mode() === 'email' ? 'email' : 'text'"
                formControlName="identifiant"
                [placeholder]="mode() === 'cin' ? 'Ex: 12345678' : 'votre@email.com'"
                [class.error]="isInvalid('identifiant')" />
            </div>
            <span class="error-msg" *ngIf="isInvalid('identifiant')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ mode() === 'cin' ? 'CIN invalide (minimum 6 caractères)' : 'Email invalide' }}
            </span>
          </div>

          <div class="info-box">
            <span class="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </span>
            Le lien de réinitialisation sera envoyé à
            l'adresse email associée à votre compte.
          </div>

          <div class="error-alert" *ngIf="errorMsg()">
            <span class="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </span>
            {{ errorMsg() }}
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading()">
            <span *ngIf="!loading()" class="btn-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Envoyer le lien
            </span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>

        <!-- Succès -->
        <div class="success-state" *ngIf="sent()">
          <div class="ss-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>Email envoyé !</h3>
          <p>
            Si un compte correspond à cet identifiant,
            vous recevrez un email de réinitialisation.
          </p>
          <p class="ss-note">
            Le lien est valable <strong>15 minutes</strong>.
          </p>
        </div>

        <a routerLink="/login" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor"
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
    .fp-page {
      min-height: 100vh;
      background: linear-gradient(135deg,
        var(--primary-dark), var(--primary), var(--secondary));
      display: flex; align-items: center;
      justify-content: center; padding: 20px;
    }

    .fp-card {
      background: white; border-radius: 20px;
      padding: 40px; width: 100%; max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    /* ── Header ── */
    .fp-header {
      text-align: center; margin-bottom: 28px;
    }

    .fp-icon {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 18px;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
      box-shadow: 0 8px 24px rgba(11,110,126,0.25);
    }

    .fp-icon svg {
      width: 30px; height: 30px; color: white;
    }

    .fp-header h2 {
      font-size: 22px; font-weight: 700;
      color: var(--primary-dark); margin-bottom: 8px;
    }

    .fp-header p {
      color: var(--text-light); font-size: 13.5px; line-height: 1.6;
    }

    /* ── Toggle ── */
    .mode-toggle {
      display: flex; gap: 6px;
      background: var(--gray-light);
      padding: 5px; border-radius: 12px; margin-bottom: 24px;
    }

    .mt-btn {
      flex: 1; padding: 10px 12px;
      border: none; background: none;
      border-radius: 9px; cursor: pointer;
      font-size: 13px; font-weight: 600;
      color: var(--text-light);
      transition: all 0.2s ease;
      display: flex; align-items: center;
      justify-content: center; gap: 7px;
    }

    .mt-btn svg {
      width: 15px; height: 15px; flex-shrink: 0;
    }

    .mt-btn.active {
      background: white; color: var(--primary);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .mt-btn:hover:not(.active) {
      color: var(--primary);
    }

    /* ── Form ── */
    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block; font-size: 13px; font-weight: 600;
      color: var(--text-dark, #1a202c); margin-bottom: 7px;
    }

    .input-wrapper {
      position: relative; display: flex; align-items: center;
    }

    .input-icon {
      position: absolute; left: 13px;
      display: flex; align-items: center;
      color: var(--text-light);
      pointer-events: none;
    }

    .input-icon svg {
      width: 16px; height: 16px;
    }

    .input-wrapper input {
      width: 100%;
      padding: 11px 14px 11px 42px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      color: var(--text-dark, #1a202c);
      background: #f8fafc;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      box-sizing: border-box;
    }

    .input-wrapper input:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 3px rgba(11,110,126,0.1);
    }

    .input-wrapper input.error {
      border-color: var(--danger, #e53e3e);
      background: #fff5f5;
    }

    .error-msg {
      display: flex; align-items: center; gap: 5px;
      color: var(--danger, #e53e3e);
      font-size: 12px; margin-top: 6px;
    }

    .error-msg svg {
      width: 13px; height: 13px; flex-shrink: 0;
    }

    /* ── Info box ── */
    .info-box {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--accent, #e6f4f6);
      border: 1px solid var(--accent-mid, #b2dde3);
      border-radius: 10px; padding: 12px 14px;
      font-size: 12.5px; color: var(--primary);
      margin-bottom: 18px; line-height: 1.5;
    }

    .info-icon {
      flex-shrink: 0; margin-top: 1px;
    }

    .info-icon svg {
      width: 15px; height: 15px;
    }

    /* ── Error alert ── */
    .error-alert {
      display: flex; align-items: center; gap: 10px;
      background: #fff5f5; border: 1px solid #fed7d7;
      color: var(--danger, #e53e3e); padding: 12px 14px;
      border-radius: 10px; margin-bottom: 16px; font-size: 13px;
    }

    .alert-icon svg {
      width: 16px; height: 16px; flex-shrink: 0;
    }

    /* ── Submit button ── */
    .submit-btn {
      width: 100%; justify-content: center;
      padding: 13px 20px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border: none; border-radius: 10px;
      color: white; font-size: 14px; font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(11,110,126,0.3);
      transition: opacity 0.2s, transform 0.15s;
      display: flex; align-items: center;
    }

    .submit-btn:hover:not(:disabled) {
      opacity: 0.92; transform: translateY(-1px);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.7; cursor: not-allowed;
    }

    .btn-content {
      display: flex; align-items: center;
      justify-content: center; gap: 8px;
    }

    .btn-content svg {
      width: 15px; height: 15px;
    }

    /* ── Success state ── */
    .success-state {
      text-align: center; padding: 16px 0 8px;
    }

    .ss-icon {
      width: 68px; height: 68px;
      background: linear-gradient(135deg, #38a169, #48bb78);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
      box-shadow: 0 8px 24px rgba(56,161,105,0.25);
    }

    .ss-icon svg {
      width: 32px; height: 32px; color: white;
    }

    .success-state h3 {
      font-size: 18px; font-weight: 700;
      color: #38a169; margin-bottom: 10px;
    }

    .success-state p {
      color: var(--text-light); font-size: 14px; line-height: 1.6;
    }

    .ss-note {
      margin-top: 10px; font-size: 13px;
    }

    .ss-note strong { color: var(--primary); }

    /* ── Back link ── */
    .back-link {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; margin-top: 22px;
      color: var(--primary); font-size: 13px;
      font-weight: 500; text-decoration: none;
      transition: gap 0.2s;
    }

    .back-link svg {
      width: 14px; height: 14px; flex-shrink: 0;
      transition: transform 0.2s;
    }

    .back-link:hover { text-decoration: underline; }
    .back-link:hover svg { transform: translateX(-3px); }

    /* ── Spinner ── */
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordComponent {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);

  mode     = signal<'cin' | 'email'>('cin');
  loading  = signal(false);
  errorMsg = signal('');
  sent     = signal(false);

  form = this.fb.group({
    identifiant: ['', [Validators.required, Validators.minLength(6)]]
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  switchMode(m: 'cin' | 'email'): void {
    this.mode.set(m);
    this.form.reset();
    const ctrl = this.form.get('identifiant');
    if (m === 'email') {
      ctrl?.setValidators([Validators.required, Validators.email]);
    } else {
      ctrl?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    ctrl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.http.post(
      'http://localhost:8080/api/auth/forgot-password',
      { identifiant: this.form.value.identifiant },
      { responseType: 'text' as const }
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Toujours afficher succès pour ne pas révéler si le compte existe
        this.sent.set(true);
      }
    });
  }
}