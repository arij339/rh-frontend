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
          <div class="fp-icon">🔑</div>
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
            🪪 CIN
          </button>
          <button class="mt-btn"
                  [class.active]="mode() === 'email'"
                  (click)="switchMode('email')">
            📧 Email
          </button>
        </div>

        <form [formGroup]="form"
              (ngSubmit)="onSubmit()"
              *ngIf="!sent()">

          <div class="form-group">
            <label>
              {{ mode() === 'cin'
                 ? 'Numéro CIN' : 'Adresse email' }}
            </label>
            <div class="input-wrapper">
              <input
                [type]="mode() === 'email' ? 'email' : 'text'"
                formControlName="identifiant"
                [placeholder]="mode() === 'cin'
                  ? 'Ex: 12345678'
                  : 'votre@email.com'"
                [class.error]="isInvalid('identifiant')" />
            </div>
            <span class="error-msg"
                  *ngIf="isInvalid('identifiant')">
              {{ mode() === 'cin'
                 ? 'CIN invalide'
                 : 'Email invalide' }}
            </span>
          </div>

          <div class="info-box">
            💡 Le lien de réinitialisation sera envoyé à
            l'adresse email associée à votre compte.
          </div>

          <div class="error-alert" *ngIf="errorMsg()">
            ⚠️ {{ errorMsg() }}
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading()">
            <span *ngIf="!loading()">Envoyer le lien</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>

        <!-- Succès -->
        <div class="success-state" *ngIf="sent()">
          <div class="ss-icon">✅</div>
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
          ← Retour à la connexion
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

    .fp-header {
      text-align: center; margin-bottom: 24px;
      .fp-icon { font-size: 48px; margin-bottom: 16px; }
      h2 { font-size: 22px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 8px; }
      p  { color: var(--text-light); font-size: 13px;
           line-height: 1.5; }
    }

    .mode-toggle {
      display: flex; gap: 4px; background: var(--gray-light);
      padding: 4px; border-radius: 10px; margin-bottom: 20px;
    }

    .mt-btn {
      flex: 1; padding: 10px;
      border: none; background: none;
      border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600;
      color: var(--text-light); transition: all 0.2s;

      &.active {
        background: var(--primary); color: white;
        box-shadow: 0 2px 8px rgba(11,110,126,0.3);
      }

      &:hover:not(.active) {
        background: white; color: var(--primary);
      }
    }

    .info-box {
      background: var(--accent);
      border: 1px solid var(--accent-mid);
      border-radius: 10px; padding: 12px 14px;
      font-size: 12px; color: var(--primary);
      margin-bottom: 16px; line-height: 1.5;
    }

    .error-alert {
      background: #FFF5F5; border: 1px solid #FED7D7;
      color: var(--danger); padding: 12px; border-radius: 10px;
      margin-bottom: 16px; font-size: 13px;
    }

    .submit-btn {
      width: 100%; justify-content: center; padding: 14px;
      background: linear-gradient(135deg,
        var(--primary), var(--secondary));
      box-shadow: 0 4px 16px rgba(11,110,126,0.3);
    }

    .success-state {
      text-align: center; padding: 20px 0;

      .ss-icon { font-size: 48px; margin-bottom: 16px; }

      h3 { font-size: 18px; font-weight: 700;
           color: var(--success); margin-bottom: 12px; }

      p { color: var(--text-light); font-size: 14px;
          line-height: 1.6; }

      .ss-note {
        margin-top: 8px; font-size: 13px;
        strong { color: var(--primary); }
      }
    }

    .back-link {
      display: block; text-align: center; margin-top: 20px;
      color: var(--primary); font-size: 13px;
      font-weight: 500; text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordComponent {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);

  mode    = signal<'cin' | 'email'>('cin');
  loading = signal(false);
  errorMsg = signal('');
  sent    = signal(false);

  form = this.fb.group({
    identifiant: ['', [Validators.required,
                       Validators.minLength(6)]]
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  switchMode(m: 'cin' | 'email'): void {
    this.mode.set(m);
    this.form.reset();
    // Adapter la validation selon le mode
    const ctrl = this.form.get('identifiant');
    if (m === 'email') {
      ctrl?.setValidators([
        Validators.required,
        Validators.email
      ]);
    } else {
      ctrl?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);
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

    // ✅ Envoyer identifiant (CIN ou email)
    this.http.post(
      'http://localhost:8080/api/auth/forgot-password',
      { identifiant: this.form.value.identifiant }
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        // ✅ Toujours afficher succès pour ne pas
        // révéler si le compte existe
        this.sent.set(true);
      }
    });
  }
}