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
      <div class="rp-card">

        <!-- Header -->
        <div class="rp-header">
          <div class="rp-icon">🔑</div>
          <h2>Réinitialisation du mot de passe</h2>
          <p>Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        <!-- Token invalide -->
        <div class="error-state" *ngIf="tokenInvalid()">
          <div class="state-icon">❌</div>
          <h3>Lien invalide ou expiré</h3>
          <p>Ce lien de réinitialisation n'est plus valide.</p>
          <a routerLink="/forgot-password" class="btn btn-primary">
            Demander un nouveau lien
          </a>
        </div>

        <!-- Formulaire -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()"
              *ngIf="!tokenInvalid() && !success()">

          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="show['new'] ? 'text' : 'password'"
                     formControlName="newPassword"
                     placeholder="Minimum 8 caractères"
                     [class.error]="isInvalid('newPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['new'] = !show['new']">
                {{ show['new'] ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="error-msg" *ngIf="isInvalid('newPassword')">
              Minimum 8 caractères requis
            </span>

            <!-- Force mot de passe -->
            <div class="strength-bar" *ngIf="form.get('newPassword')?.value">
              <div class="strength-fill"
                   [style.width]="strength() + '%'"
                   [class]="strengthClass()">
              </div>
            </div>
            <span class="strength-label"
                  *ngIf="form.get('newPassword')?.value">
              {{ strengthLabel() }}
            </span>
          </div>

          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <div class="input-wrapper">
              <input [type]="show['confirm'] ? 'text' : 'password'"
                     formControlName="confirmPassword"
                     placeholder="Répétez le mot de passe"
                     [class.error]="mismatch()" />
              <button type="button" class="toggle-pass"
                      (click)="show['confirm'] = !show['confirm']">
                {{ show['confirm'] ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="error-msg" *ngIf="mismatch()">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <div class="error-alert" *ngIf="errorMsg()">
            ⚠️ {{ errorMsg() }}
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading() || mismatch()">
            <span *ngIf="!loading()">Réinitialiser le mot de passe</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>

        </form>

        <!-- Succès -->
        <div class="success-state" *ngIf="success()">
          <div class="state-icon">✅</div>
          <h3>Mot de passe réinitialisé !</h3>
          <p>Votre mot de passe a été changé avec succès.</p>
          <a routerLink="/login" class="btn btn-primary">
            Se connecter
          </a>
        </div>

        <a routerLink="/login" class="back-link"
           *ngIf="!success() && !tokenInvalid()">
          ← Retour à la connexion
        </a>

      </div>
    </div>
  `,
  styles: [`
    .rp-page {
      min-height: 100vh;
      background: linear-gradient(135deg,
        var(--primary-dark), var(--primary), var(--secondary));
      display: flex; align-items: center;
      justify-content: center; padding: 20px;
    }

    .rp-card {
      background: white; border-radius: 20px;
      padding: 40px; width: 100%; max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .rp-header {
      text-align: center; margin-bottom: 32px;
      .rp-icon  { font-size: 48px; margin-bottom: 16px; }
      h2 { font-size: 22px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 8px; }
      p  { color: var(--text-light); font-size: 13px; }
    }

    .error-state, .success-state {
      text-align: center; padding: 20px 0;

      .state-icon { font-size: 48px; margin-bottom: 16px; }

      h3 { font-size: 18px; font-weight: 700;
           margin-bottom: 12px; }

      p { color: var(--text-light); font-size: 14px;
          line-height: 1.6; margin-bottom: 24px; }

      .btn { display: inline-flex; }
    }

    .error-state h3  { color: var(--danger); }
    .success-state h3 { color: var(--success); }

    .input-wrapper {
      position: relative;
      input { padding-right: 44px !important; }
      .toggle-pass {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none;
        cursor: pointer; font-size: 16px;
      }
    }

    .strength-bar {
      height: 4px; background: var(--gray-mid);
      border-radius: 2px; margin-top: 8px; overflow: hidden;

      .strength-fill {
        height: 100%; border-radius: 2px;
        transition: width 0.3s, background 0.3s;
        &.weak   { background: var(--danger); }
        &.medium { background: var(--warning); }
        &.strong { background: var(--success); }
      }
    }

    .strength-label {
      font-size: 11px; font-weight: 600;
      margin-top: 4px; display: block;
    }

    .error-alert {
      background: #FFF5F5; border: 1px solid #FED7D7;
      color: var(--danger); padding: 12px; border-radius: 10px;
      margin-bottom: 16px; font-size: 13px;
    }

    .submit-btn {
      width: 100%; justify-content: center; padding: 14px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      box-shadow: 0 4px 16px rgba(11,110,126,0.3);
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
    if (s <= 25) return '🔴 Faible';
    if (s <= 50) return '🟡 Moyen';
    if (s <= 75) return '🟠 Bon';
    return '🟢 Très fort';
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

