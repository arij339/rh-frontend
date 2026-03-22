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

        <div class="cp-header">
          <div class="cp-icon">🔐</div>
          <h2>Changement de mot de passe</h2>
          <p>Votre mot de passe temporaire doit être changé avant de continuer.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Mot de passe actuel</label>
            <div class="input-wrapper">
              <input [type]="show['old'] ? 'text' : 'password'"
                     formControlName="oldPassword"
                     placeholder="Mot de passe temporaire"
                     [class.error]="isInvalid('oldPassword')" />
              <button type="button" class="toggle-pass"
                      (click)="show['old'] = !show['old']">
                {{ show['old'] ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="error-msg" *ngIf="isInvalid('oldPassword')">
              Champ obligatoire
            </span>
          </div>

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
              Minimum 8 caractères
            </span>

            <!-- Indicateur force mot de passe -->
            <div class="strength-bar" *ngIf="form.get('newPassword')?.value">
              <div class="strength-fill"
                   [style.width]="strength() + '%'"
                   [class]="strengthClass()">
              </div>
            </div>
            <span class="strength-label" *ngIf="form.get('newPassword')?.value">
              {{ strengthLabel() }}
            </span>
          </div>

          <div class="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="show['confirm'] ? 'text' : 'password'"
                     formControlName="confirmPassword"
                     placeholder="Répétez le mot de passe"
                     [class.error]="isInvalid('confirmPassword') || mismatch()" />
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

          <div class="success-alert" *ngIf="successMsg()">
            ✅ {{ successMsg() }}
          </div>

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="loading() || mismatch()">
            <span *ngIf="!loading()">Changer le mot de passe</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .cp-page {
      min-height: 100vh;
      background: linear-gradient(135deg,
        var(--primary-dark), var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .cp-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .cp-header {
      text-align: center;
      margin-bottom: 32px;

      .cp-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 22px;
        font-weight: 700;
        color: var(--primary-dark);
        margin-bottom: 8px;
      }

      p {
        color: var(--text-light);
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .input-wrapper {
      position: relative;

      input { padding-right: 44px !important; }

      .toggle-pass {
        position: absolute;
        right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
      }
    }

    .strength-bar {
      height: 4px;
      background: var(--gray-mid);
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;

      .strength-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s, background 0.3s;

        &.weak   { background: var(--danger); }
        &.medium { background: var(--warning); }
        &.strong { background: var(--success); }
      }
    }

    .strength-label {
      font-size: 11px;
      font-weight: 600;
      margin-top: 4px;
      display: block;
    }

    .error-alert {
      background: #FFF5F5;
      border: 1px solid #FED7D7;
      color: var(--danger);
      padding: 12px; border-radius: 10px;
      margin-bottom: 16px; font-size: 13px;
    }

    .success-alert {
      background: #F0FFF4;
      border: 1px solid #C6F6D5;
      color: var(--success);
      padding: 12px; border-radius: 10px;
      margin-bottom: 16px; font-size: 13px;
    }

    .submit-btn {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 15px;
      background: linear-gradient(135deg,
        var(--primary), var(--secondary));
      box-shadow: 0 4px 16px rgba(11,110,126,0.3);
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ChangePasswordComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    oldPassword:     ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  loading    = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  show: Record<string, boolean> = {
    old: false, new: false, confirm: false
  };

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
    if (pwd.length >= 8)               score += 25;
    if (/[A-Z]/.test(pwd))             score += 25;
    if (/[0-9]/.test(pwd))             score += 25;
    if (/[^A-Za-z0-9]/.test(pwd))      score += 25;
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