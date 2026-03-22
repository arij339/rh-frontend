import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-page">

      <!-- Left Panel -->
      <div class="login-left">
        <div class="brand">
          <div class="brand-icon">RH</div>
          <h1>RH Manager</h1>
          <p>Plateforme de gestion des ressources humaines</p>
        </div>
        <div class="features">
          <div class="feature" *ngFor="let f of features">
            <div class="feature-icon" [innerHTML]="f.icon"></div>
            <div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          </div>
        </div>
        <div class="wave"></div>
      </div>

      <!-- Right Panel -->
      <div class="login-right">
        <div class="login-card">

          <div class="login-header">
            <h2>Connexion</h2>
            <p>Bienvenue ! Veuillez vous identifier.</p>
          </div>

          <!-- Toggle CIN / Email -->
          <div class="login-toggle">
            <button class="lt-btn"
                    [class.active]="loginMode() === 'cin'"
                    (click)="loginMode.set('cin')">
              🪪 CIN
            </button>
            <button class="lt-btn"
                    [class.active]="loginMode() === 'email'"
                    (click)="loginMode.set('email')">
              📧 Email
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Identifiant (CIN ou Email) -->
            <div class="form-group">
              <label>
                {{ loginMode() === 'cin'
                   ? 'Numéro CIN' : 'Adresse email' }}
              </label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <!-- CIN icon -->
                  <svg *ngIf="loginMode() === 'cin'"
                       width="18" height="18" fill="none"
                       stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <circle cx="8" cy="12" r="2"/>
                    <path d="M14 10h4M14 14h4"/>
                  </svg>
                  <!-- Email icon -->
                  <svg *ngIf="loginMode() === 'email'"
                       width="18" height="18" fill="none"
                       stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input [type]="loginMode() === 'email'
                               ? 'email' : 'text'"
                       formControlName="identifiant"
                       [placeholder]="loginMode() === 'cin'
                         ? 'Ex: 12345678'
                         : 'votre@email.com'"
                       [class.error]="isInvalid('identifiant')" />
              </div>
              <span class="error-msg"
                    *ngIf="isInvalid('identifiant')">
                {{ loginMode() === 'cin'
                   ? 'CIN invalide (minimum 6 caractères)'
                   : 'Email invalide' }}
              </span>
            </div>

            <!-- Mot de passe -->
            <div class="form-group">
              <label>Mot de passe</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="18" height="18" fill="none"
                       stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input [type]="showPassword() ? 'text' : 'password'"
                       formControlName="password"
                       placeholder="••••••••"
                       [class.error]="isInvalid('password')" />
                <button type="button" class="toggle-pass"
        (click)="showPassword.set(!showPassword())">

  <!-- Eye (password caché) -->
  <svg *ngIf="!showPassword()" width="18" height="18"
       fill="none" stroke="currentColor" stroke-width="1.8"
       viewBox="0 0 24 24">
    <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>

  <!-- Eye-off (password visible) -->
  <svg *ngIf="showPassword()" width="18" height="18"
       fill="none" stroke="currentColor" stroke-width="1.8"
       viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7
             a21.77 21.77 0 0 1 5.06-5.94"/>
    <path d="M1 1l22 22"/>
    <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24"/>
    <path d="M14.47 14.47L9.53 9.53"/>
  </svg>

</button>
              </div>
              <span class="error-msg"
                    *ngIf="isInvalid('password')">
                Mot de passe requis
              </span>
            </div>

            <!-- Erreur -->
            <div class="error-alert" *ngIf="errorMsg()">
              ⚠️ {{ errorMsg() }}
            </div>

            <!-- Bouton connexion -->
            <button type="submit" class="btn btn-primary submit-btn"
                    [disabled]="loading()">
              <span *ngIf="!loading()">Se connecter</span>
              <span *ngIf="loading()" class="spinner"></span>
            </button>

            <!-- ✅ Bannière mustChangePassword — optionnelle -->
            <div class="change-pwd-hint" *ngIf="showChangePwdHint()">
              🔐 Nous vous recommandons de changer votre
              mot de passe temporaire.
              <a href="/change-password">Changer maintenant →</a>
            </div>

            <a href="/forgot-password" class="forgot-link">
              Mot de passe oublié ?
            </a>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex; min-height: 100vh;
    }

    /* ===== LEFT ===== */
    .login-left {
      flex: 1;
      background: linear-gradient(135deg,
        var(--primary-dark) 0%,
        var(--primary) 60%,
        var(--secondary) 100%);
      display: flex; flex-direction: column;
      justify-content: center; padding: 60px;
      position: relative; overflow: hidden;

      @media (max-width: 768px) { display: none; }
    }

    .brand {
      margin-bottom: 48px;

      .brand-icon {
        width: 60px; height: 60px;
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 16px;
        display: flex; align-items: center;
        justify-content: center;
        font-size: 22px; font-weight: 800; color: white;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
      }

      h1 {
        font-size: 36px; font-weight: 800;
        color: white; margin-bottom: 10px;
      }

      p { color: rgba(255,255,255,0.75); font-size: 16px; }
    }

    .features {
      display: flex; flex-direction: column; gap: 24px;
    }

    .feature {
      display: flex; align-items: flex-start; gap: 16px;

      .feature-icon {
        width: 44px; height: 44px;
        background: rgba(255,255,255,0.12);
        border-radius: 12px;
        display: flex; align-items: center;
        justify-content: center;
        color: var(--accent-mid); flex-shrink: 0;
      }

      h3 { color: white; font-size: 15px;
           font-weight: 600; margin-bottom: 4px; }
      p  { color: rgba(255,255,255,0.65);
           font-size: 13px; line-height: 1.5; }
    }

    .wave {
      position: absolute; bottom: -40px; right: -60px;
      width: 300px; height: 300px;
      background: rgba(255,255,255,0.04);
      border-radius: 50%; pointer-events: none;

      &::before {
        content: ''; position: absolute; inset: 40px;
        background: rgba(255,255,255,0.04);
        border-radius: 50%;
      }
    }

    /* ===== RIGHT ===== */
    .login-right {
      width: 480px;
      display: flex; align-items: center;
      justify-content: center;
      background: var(--gray-light); padding: 40px;

      @media (max-width: 768px) {
        width: 100%;
        background: linear-gradient(135deg,
          var(--primary-dark), var(--primary));
      }
    }

    .login-card {
      width: 100%; background: var(--white);
      border-radius: 20px; padding: 40px;
      box-shadow: 0 8px 40px rgba(11,110,126,0.12);
    }

    .login-header {
      margin-bottom: 24px; text-align: center;

      h2 { font-size: 26px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 8px; }
      p  { color: var(--text-light); }
    }

    // ===== TOGGLE CIN/EMAIL =====
    .login-toggle {
      display: flex; gap: 4px; background: var(--gray-light);
      padding: 4px; border-radius: 10px; margin-bottom: 24px;
    }

    .lt-btn {
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

    .input-wrapper {
      position: relative;

      .input-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%);
        color: var(--text-light); display: flex;
      }

      input {
        padding-left: 44px !important;
        padding-right: 44px !important;
      }

      .toggle-pass {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none;
        cursor: pointer; font-size: 16px;
      }
    }

    .error-alert {
      background: #FFF5F5; border: 1px solid #FED7D7;
      color: var(--danger); padding: 12px 16px;
      border-radius: 10px; margin-bottom: 16px; font-size: 13px;
    }

    .submit-btn {
      width: 100%; justify-content: center;
      padding: 14px; font-size: 16px; border-radius: 12px;
      margin-bottom: 16px;
      background: linear-gradient(135deg,
        var(--primary) 0%, var(--secondary) 100%);
      box-shadow: 0 4px 16px rgba(11,110,126,0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(11,110,126,0.4);
      }
    }

    // ✅ Bannière hint changement MDP
    .change-pwd-hint {
      background: #FEFCBF; border: 1px solid #ECC94B;
      border-radius: 10px; padding: 12px 16px;
      font-size: 13px; color: #744210;
      margin-bottom: 12px; text-align: center;

      a {
        color: var(--primary); font-weight: 700;
        text-decoration: none; margin-left: 4px;
        &:hover { text-decoration: underline; }
      }
    }

    .forgot-link {
      display: block; text-align: center;
      color: var(--primary); font-size: 13px;
      text-decoration: none; font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loginMode    = signal<'cin' | 'email'>('cin');
  loading      = signal(false);
  errorMsg     = signal('');
  showPassword = signal(false);

  // ✅ Afficher hint si mustChangePassword — pas de redirect forcée
  showChangePwdHint = signal(false);

  form = this.fb.group({
    identifiant: ['', [Validators.required, Validators.minLength(6)]],
    password:    ['', Validators.required]
  });

  features = [
    {
      title: 'Gestion des Congés',
      desc: 'Demandes, validations et suivi en temps réel',
      icon: `<svg width="22" height="22" fill="none"
                  stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
               <rect x="3" y="4" width="18" height="18" rx="2"/>
               <line x1="3" y1="10" x2="21" y2="10"/>
               <line x1="8" y1="2" x2="8" y2="6"/>
               <line x1="16" y1="2" x2="16" y2="6"/>
             </svg>`
    },
    {
      title: 'Autorisations de Sortie',
      desc: 'Workflow simplifié et rapide',
      icon: `<svg width="22" height="22" fill="none"
                  stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
               <circle cx="12" cy="12" r="10"/>
               <polyline points="12 6 12 12 16 14"/>
             </svg>`
    },
    {
      title: 'Réclamations & Avances',
      desc: 'Suivi complet avec tickets et échéancier',
      icon: `<svg width="22" height="22" fill="none"
                  stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
               <line x1="12" y1="1" x2="12" y2="23"/>
               <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
             </svg>`
    }
  ];

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.showChangePwdHint.set(false);

    this.auth.login({
      identifiant: this.form.value.identifiant!,
      password:    this.form.value.password!
    }).subscribe({
      next: (res) => {
        this.loading.set(false);

        // ✅ Pas de redirect forcée — juste un hint discret
        if (res.mustChangePassword) {
          this.showChangePwdHint.set(true);
        }

        // Toujours aller au dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.error?.message ?? 'Identifiant ou mot de passe incorrect.'
        );
      }
    });
  }
}