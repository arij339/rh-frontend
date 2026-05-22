import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  cin: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/></svg>`,
  mail: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  lock: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  eyeOn: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  alert: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  key: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  arrowRight: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, SafeHtmlPipe],
  template: `
<div class="page">

  <div class="card" [class.swapped]="loginMode() === 'cin'">

    <!-- ══ PANNEAU COLORÉ ══ -->
    <div class="panel-colored">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <!-- Contenu EMAIL -->
      <div class="panel-inner" [class.panel-hidden]="loginMode() === 'cin'">
        <img src="images/graiet_logo.jpeg" alt="GRAIET" class="logo-panel" />
        <div class="mode-badge">
          <span [innerHTML]="ic.mail | safeHtml"></span>
          Mode E-mail
        </div>
        <h2 class="panel-title">Connexion<br>sécurisée</h2>
        <p class="panel-sub">Utilisez votre adresse e-mail professionnelle</p>
        <button class="panel-switch-btn" (click)="switchMode('cin')">
          Utiliser le CIN
          <span [innerHTML]="ic.arrowRight | safeHtml"></span>
        </button>
      </div>

      <!-- Contenu CIN -->
      <div class="panel-inner" [class.panel-hidden]="loginMode() !== 'cin'">
        <img src="images/graiet_logo.jpeg" alt="GRAIET" class="logo-panel" />
        <div class="mode-badge mode-badge-cin">
          <span [innerHTML]="ic.cin | safeHtml"></span>
          Mode CIN
        </div>
        <h2 class="panel-title">Connexion<br>sécurisée</h2>
        <p class="panel-sub">Utilisez votre numéro de carte d'identité nationale</p>
        <button class="panel-switch-btn" (click)="switchMode('email')">
          <span [innerHTML]="ic.arrowLeft | safeHtml"></span>
          Utiliser l'e-mail
        </button>
      </div>
    </div>

    <!-- ══ PANNEAU FORMULAIRE ══ -->
    <div class="panel-form">
      <div class="form-wrap">

        <div class="form-header">
          <h1 class="form-title">Connexion</h1>
          <p class="form-sub">
            {{ loginMode() === 'cin' ? 'Entrez votre numéro CIN' : 'Entrez votre adresse e-mail' }}
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Identifiant -->
          <div class="field" [class.error]="isInvalid('identifiant')">
            <label>{{ loginMode() === 'cin' ? 'Numéro CIN' : 'Adresse e-mail' }}</label>
            <div class="input-box">
              <span class="field-icon"
                    [innerHTML]="(loginMode() === 'cin' ? ic.cin : ic.mail) | safeHtml"></span>
              <input
                [type]="loginMode() === 'email' ? 'email' : 'text'"
                formControlName="identifiant"
                [placeholder]="loginMode() === 'cin' ? 'Ex : 12345678' : 'votre@email.com'"
                autocomplete="username" />
            </div>
            <span class="field-err" *ngIf="isInvalid('identifiant')">
              {{ loginMode() === 'cin' ? 'CIN invalide (min. 6 caractères)' : 'Adresse e-mail invalide' }}
            </span>
          </div>

          <!-- Mot de passe -->
          <div class="field" [class.error]="isInvalid('password')">
            <div class="label-row">
              <label>Mot de passe</label>
              <a href="/forgot-password" class="link-forgot">Mot de passe oublié ?</a>
            </div>
            <div class="input-box">
              <span class="field-icon" [innerHTML]="ic.lock | safeHtml"></span>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password" />
              <button type="button" class="eye-btn"
                (click)="showPassword.set(!showPassword())"
                [innerHTML]="(showPassword() ? ic.eyeOff : ic.eyeOn) | safeHtml">
              </button>
            </div>
            <span class="field-err" *ngIf="isInvalid('password')">Mot de passe requis</span>
          </div>

          <!-- ── COMPTE VERROUILLÉ ── -->
          @if (isLocked()) {
            <div class="alert-locked">
              <div class="lock-icon">🔒</div>
              <div class="lock-body">
                <strong>Compte temporairement bloqué</strong>
                <p>
                  Trop de tentatives incorrectes. Réessayez dans
                  <span class="countdown">{{ formatCountdown() }}</span>
                </p>
                <div class="lock-bar">
                  <div class="lock-fill"
                       [style.width]="(remainingSeconds() / 1800 * 100) + '%'">
                  </div>
                </div>
                <small>Votre compte se déverrouillera automatiquement.</small>
              </div>
            </div>
          }

          <!-- ── TENTATIVES RESTANTES ── -->
          @if (!isLocked() && failedCount() > 0) {
            <div class="alert-attempts">
              <span>⚠️</span>
              <div>
                <strong>{{ failedCount() }} / 5 tentative(s) échouée(s)</strong>
                <div class="attempts-dots">
                  @for (i of [1,2,3,4,5]; track i) {
                    <span class="dot" [class.filled]="i <= failedCount()"></span>
                  }
                </div>
                @if (failedCount() >= 4) {
                  <small style="color:#c53030">
                    ⚠️ Encore 1 tentative avant blocage de 30 min !
                  </small>
                }
              </div>
            </div>
          }

          <!-- ── MOT DE PASSE TEMPORAIRE EXPIRÉ ── -->
          @if (tempPasswordExpired()) {
            <div class="alert-temp-expired">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <div class="ate-body">
                <strong>Compte bloqué — mot de passe temporaire expiré</strong>
                <span>Votre délai de 7 jours pour changer votre mot de passe est écoulé.
                Veuillez contacter votre administrateur pour débloquer votre compte.</span>
              </div>
            </div>
          }

          <!-- ── ERREUR SIMPLE ── -->
          @if (!isLocked() && !tempPasswordExpired() && errorMsg() && failedCount() === 0) {
            <div class="alert-error">
              <span [innerHTML]="ic.alert | safeHtml"></span>
              {{ errorMsg() }}
            </div>
          }

          <!-- Bouton soumettre -->
          <button type="submit" class="btn-submit"
                  [disabled]="loading() || isLocked()"
                  [class.btn-locked]="isLocked()">
            <span *ngIf="!loading()" class="btn-inner">
              Se connecter
              <span [innerHTML]="ic.arrowRight | safeHtml"></span>
            </span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>

          <!-- Hint mot de passe temporaire -->
          <div class="hint-pwd" *ngIf="showChangePwdHint()">
            <span [innerHTML]="ic.key | safeHtml"></span>
            <span>Mot de passe temporaire actif —
              <a href="/change-password">Changer maintenant</a>
            </span>
          </div>

        </form>

        <div class="card-footer">
          &copy; {{ currentYear }} GRAIET · RH Manager
        </div>

      </div>
    </div>

    <!-- ── 2FA STEP ── -->
    @if (twoFactorRequired()) {
      <div class="twofa-overlay">
        <div class="tfa-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/></svg>
        </div>
        <h3>Vérification en deux étapes</h3>
        <p>Ouvrez <strong>Google Authenticator</strong> et entrez le code à 6 chiffres.</p>
        <div class="tfa-input-wrap">
          <input type="text" inputmode="numeric" maxlength="6" placeholder="000 000"
                 class="tfa-input" [(ngModel)]="twoFactorCode" (keyup.enter)="onVerify2FA()" />
        </div>
        <div class="tfa-error" *ngIf="twoFaError()">{{ twoFaError() }}</div>
        <button class="btn-submit tfa-btn" (click)="onVerify2FA()" [disabled]="twoFaLoading()">
          <span *ngIf="!twoFaLoading()">Vérifier le code</span>
          <span *ngIf="twoFaLoading()" class="spinner"></span>
        </button>
        <button class="tfa-back" (click)="twoFactorRequired.set(false)">← Retour à la connexion</button>
      </div>
    }

  </div>
</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :host {
      --primary:      #00b4c8;
      --primary-dk:   #0093a8;
      --primary-lt:   #e0f8fb;
      --panel-from:   #00c6d4;
      --panel-to:     #0087b8;
      --text:         #0f172a;
      --text-muted:   #64748b;
      --bg-page:      #e8eef4;
      --border:       #e2e8f0;
      --red:          #ef4444;
      --red-bg:       #fef2f2;
      --amber:        #d97706;
      --amber-bg:     #fffbeb;
      --radius:       12px;
      --font:         'Plus Jakarta Sans', sans-serif;
      --font-display: 'Sora', sans-serif;
      --card-w:       820px;
      --cp:           41.5%;
      --dur:          0.65s;
      --ease:         cubic-bezier(0.77, 0, 0.175, 1);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── PAGE ── */
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-page);
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(0,180,200,0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(0,135,184,0.06) 0%, transparent 55%);
      font-family: var(--font);
      padding: 24px 16px;
    }

    /* ── CARTE ── */
    .card {
      position: relative;
      width: 100%;
      max-width: var(--card-w);
      min-height: 520px;
      border-radius: 24px;
      overflow: hidden;
      background: white;
      box-shadow:
        0 0 0 1px rgba(0,0,0,0.04),
        0 8px 40px rgba(0,0,0,0.10),
        0 2px 8px rgba(0,0,0,0.06);
      animation: cardRise 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes cardRise {
      from { opacity: 0; transform: translateY(28px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .panel-colored {
      position: absolute;
      top: 6px;
      bottom: 6px;
      left: 6px;
      width: calc(var(--cp) - 6px);
      border-radius: 18px;
      background: linear-gradient(145deg, var(--panel-from) 0%, var(--panel-to) 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      transition:
        left var(--dur) var(--ease),
        border-radius var(--dur) var(--ease);
    }

    .card.swapped .panel-colored {
      left: calc(100% - var(--cp));
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      filter: blur(1px);
      pointer-events: none;
    }
    .blob-1 { width: 220px; height: 220px; top: -60px;  right: -60px; }
    .blob-2 { width: 160px; height: 160px; bottom: -40px; left: -40px; }
    .blob-3 { width: 80px;  height: 80px;  top: 50%; right: 30px;
               transform: translateY(-50%); background: rgba(255,255,255,0.07); }

    .panel-inner {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 36px 28px;
      text-align: center;
      color: white;
      z-index: 2;
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .panel-hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.94);
    }

    .logo-panel {
      height: 50px;
      width: auto;
      max-width: 130px;
      object-fit: contain;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .panel-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.25;
      color: white;
      margin-bottom: 10px;
      letter-spacing: -0.4px;
    }

    .panel-sub {
      font-size: 12.5px;
      color: rgba(255,255,255,0.75);
      line-height: 1.55;
      margin-bottom: 26px;
    }

    .mode-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.32);
      color: white;
      border-radius: 50px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 16px;
      backdrop-filter: blur(4px);
    }
    .mode-badge-cin { background: rgba(255,255,255,0.22); }

    .panel-switch-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: rgba(255,255,255,0.92);
      border-radius: 50px;
      padding: 9px 20px;
      font-size: 12.5px;
      font-weight: 600;
      font-family: var(--font);
      cursor: pointer;
      transition: background 0.2s, transform 0.2s, color 0.2s;
      backdrop-filter: blur(4px);
      white-space: nowrap;
    }
    .panel-switch-btn:hover {
      background: rgba(255,255,255,0.28);
      color: white;
      transform: translateX(2px);
    }

    .panel-form {
      position: absolute;
      top: 0;
      bottom: 0;
      left: var(--cp);
      right: 0;
      background: white;
      display: flex;
      flex-direction: column;
      z-index: 1;
      transition:
        left var(--dur) var(--ease),
        right var(--dur) var(--ease);
    }

    .card.swapped .panel-form {
      left: 0;
      right: var(--cp);
    }

    .form-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 44px 44px 28px;
      height: 100%;
      overflow-y: auto;
    }

    /* ── EN-TÊTE ── */
    .form-header { margin-bottom: 26px; }
    .form-title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.5px;
      margin-bottom: 5px;
    }
    .form-sub { font-size: 13px; color: var(--text-muted); }

    /* ── CHAMPS ── */
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 16px;
    }
    label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .link-forgot {
      font-size: 12px;
      font-weight: 500;
      color: var(--primary);
      text-decoration: none;
      text-transform: none;
      letter-spacing: 0;
    }
    .link-forgot:hover { text-decoration: underline; }

    .input-box {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      background: #fafafa;
      transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
      overflow: hidden;
    }
    .input-box:focus-within {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 3px rgba(0,180,200,0.1);
    }
    .field.error .input-box { border-color: var(--red); background: var(--red-bg); }
    .field.error .input-box:focus-within { box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }

    .field-icon {
      padding: 0 10px 0 13px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      pointer-events: none;
    }
    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 11px 10px 11px 0;
      font-size: 14px;
      color: var(--text);
      background: transparent;
      font-family: var(--font);
    }
    input::placeholder { color: #cbd5e1; }

    .eye-btn {
      padding: 0 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }
    .eye-btn:hover { color: var(--primary); }
    .field-err { font-size: 11.5px; color: var(--red); font-weight: 500; }

    /* ── ALERTE ERREUR SIMPLE ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--red-bg);
      border: 1px solid #fecaca;
      color: var(--red);
      padding: 10px 13px;
      border-radius: var(--radius);
      margin-bottom: 16px;
      font-size: 13px;
      font-weight: 500;
    }

    /* ── MOT DE PASSE TEMPORAIRE EXPIRÉ ── */
    .alert-temp-expired {
      display: flex; align-items: flex-start; gap: 12px;
      background: #fff1f2; border: 1.5px solid #f43f5e;
      color: #be123c; padding: 14px 16px;
      border-radius: var(--radius); margin-bottom: 16px;
      animation: slideDown 0.3s ease;
    }
    .alert-temp-expired svg { flex-shrink: 0; margin-top: 2px; color: #f43f5e; }
    .ate-body { display: flex; flex-direction: column; gap: 4px; }
    .ate-body strong { font-size: 13.5px; font-weight: 700; color: #9f1239; }
    .ate-body span { font-size: 12.5px; line-height: 1.5; color: #be123c; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

    /* ── VERROUILLAGE ── */
    .alert-locked {
      display: flex;
      gap: 14px;
      background: #fff8e1;
      border: 1.5px solid #f59e0b;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      animation: shakeIn .4s ease;
    }
    .lock-icon {
      font-size: 28px;
      flex-shrink: 0;
      line-height: 1;
    }
    .lock-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lock-body strong {
      font-size: 14px;
      color: #92400e;
      display: block;
    }
    .lock-body p {
      font-size: 13px;
      color: #78350f;
      margin: 0;
    }
    .lock-body small {
      font-size: 11px;
      color: #a16207;
    }
    .countdown {
      display: inline-block;
      background: #f59e0b;
      color: white;
      font-weight: 700;
      font-size: 15px;
      padding: 2px 10px;
      border-radius: 6px;
      font-variant-numeric: tabular-nums;
      min-width: 52px;
      text-align: center;
      letter-spacing: 1px;
    }
    .lock-bar {
      height: 4px;
      background: #fde68a;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 4px;
    }
    .lock-fill {
      height: 100%;
      background: #f59e0b;
      border-radius: 2px;
      transition: width 1s linear;
    }

    /* ── TENTATIVES ── */
    .alert-attempts {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      background: #fff5f5;
      border: 1.5px solid #fc8181;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #742a2a;
    }
    .alert-attempts strong {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .attempts-dots {
      display: flex;
      gap: 5px;
      margin-bottom: 4px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fed7d7;
      border: 1.5px solid #fc8181;
      transition: background .2s;
    }
    .dot.filled {
      background: #e53e3e;
      border-color: #c53030;
    }

    /* ── BOUTON ── */
    .btn-submit {
      width: 100%;
      padding: 13px 20px;
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      background: linear-gradient(135deg, var(--panel-from) 0%, var(--panel-to) 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(0,180,200,0.3);
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
      margin-bottom: 14px;
      min-height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.2px;
    }
    .btn-inner { display: flex; align-items: center; gap: 8px; }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,180,200,0.4);
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Bouton bloqué */
    .btn-locked {
      opacity: .5 !important;
      cursor: not-allowed !important;
      background: linear-gradient(135deg, #94a3b8, #64748b) !important;
      box-shadow: none !important;
    }

    /* ── HINT ── */
    .hint-pwd {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: var(--amber-bg);
      border: 1px solid #fde68a;
      border-radius: var(--radius);
      padding: 10px 12px;
      font-size: 12.5px;
      color: #78350f;
      font-weight: 500;
      margin-bottom: 14px;
    }
    .hint-pwd a { color: var(--primary); font-weight: 700; text-decoration: none; }
    .hint-pwd a:hover { text-decoration: underline; }

    /* ── PIED ── */
    .card-footer {
      margin-top: auto;
      padding-top: 20px;
      text-align: center;
      font-size: 11.5px;
      color: #94a3b8;
      border-top: 1px solid var(--border);
    }

    /* ── SPINNER ── */
    .spinner {
      width: 18px; height: 18px;
      border-radius: 50%;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes shakeIn {
      0%  { transform: translateX(-6px); opacity: 0; }
      30% { transform: translateX(4px); }
      60% { transform: translateX(-2px); }
      100%{ transform: translateX(0); opacity: 1; }
    }

    /* ── 2FA OVERLAY ── */
    .twofa-overlay {
      position: absolute; inset: 0; background: white; border-radius: inherit;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px; padding: 40px 32px;
      text-align: center; z-index: 20; animation: fadeUp 0.25s ease both;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .tfa-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg,#eff6ff,#dbeafe);
      border: 1.5px solid #93c5fd; color: #2563eb;
      display: flex; align-items: center; justify-content: center;
    }
    .twofa-overlay h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
    .twofa-overlay p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0; max-width: 280px; }
    .tfa-input-wrap { width: 100%; max-width: 220px; }
    .tfa-input {
      width: 100%; text-align: center; font-size: 30px; font-weight: 700;
      letter-spacing: 14px; padding: 14px 10px; border-radius: 14px;
      border: 2px solid #e2e8f0; outline: none; color: #0f172a;
      transition: border-color 0.2s; box-sizing: border-box;
    }
    .tfa-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .tfa-error { color: #ef4444; font-size: 13px; font-weight: 500; }
    .tfa-btn { margin-top: 4px; }
    .tfa-back {
      background: none; border: none; color: #94a3b8; font-size: 13px;
      cursor: pointer; text-decoration: none; transition: color 0.2s;
    }
    .tfa-back:hover { color: #64748b; }

    /* ── RESPONSIVE ── */
    @media (max-width: 680px) {
      .card {
        display: flex;
        flex-direction: column;
        max-width: 420px;
        min-height: unset;
        overflow: visible;
      }
      .panel-colored {
        position: relative;
        top: unset; bottom: unset; left: unset;
        width: calc(100% - 12px);
        min-height: 170px;
        margin: 6px 6px 0;
        border-radius: 16px;
        transition: none;
      }
      .card.swapped .panel-colored {
        left: unset;
        width: calc(100% - 12px);
      }
      .panel-form {
        position: relative;
        top: unset; bottom: unset;
        left: unset; right: unset;
        width: 100%;
        transition: none;
      }
      .card.swapped .panel-form {
        left: unset; right: unset;
      }
      .form-wrap { padding: 28px 28px 20px; }
    }
  `]
})
export class LoginComponent implements OnDestroy, OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  ic = IC;

  loginMode            = signal<'cin' | 'email'>('email');
  loading              = signal(false);
  errorMsg             = signal('');
  showPassword         = signal(false);
  showChangePwdHint    = signal(false);
  isLocked             = signal(false);
  remainingSeconds     = signal(0);
  failedCount          = signal(0);
  tempPasswordExpired  = signal(false);
  currentYear          = new Date().getFullYear();

  twoFactorRequired = signal(false);
  twoFactorToken    = signal('');
  twoFactorCode     = '';
  twoFaLoading      = signal(false);
  twoFaError        = signal('');

  private lockTimer: any = null;

  form = this.fb.group({
    identifiant: ['', [Validators.required, Validators.minLength(6)]],
    password:    ['', Validators.required]
  });

  ngOnInit(): void {
    this.checkExistingLock();
  }

  ngOnDestroy(): void {
    if (this.lockTimer) clearInterval(this.lockTimer);
  }

  /** Formate mm:ss pour le compte à rebours */
  formatCountdown(): string {
    const s = this.remainingSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  /** Démarre le compte à rebours de 30 min */
  private startLockCountdown(minutes: number = 30): void {
    this.isLocked.set(true);
    this.remainingSeconds.set(minutes * 60);

    const unlockAt = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('loginLockedUntil', unlockAt.toString());

    this.lockTimer = setInterval(() => {
      const remaining = Math.max(0,
        Math.ceil((unlockAt - Date.now()) / 1000));
      this.remainingSeconds.set(remaining);

      if (remaining <= 0) {
        this.deverrouiller();
      }
    }, 1000);
  }

  /** Déverrouille le formulaire */
  private deverrouiller(): void {
    if (this.lockTimer) {
      clearInterval(this.lockTimer);
      this.lockTimer = null;
    }
    this.isLocked.set(false);
    this.remainingSeconds.set(0);
    this.failedCount.set(0);
    this.errorMsg.set('');
    localStorage.removeItem('loginLockedUntil');
  }

  /** Vérifie si un verrouillage actif existe au chargement */
  private checkExistingLock(): void {
    const lockedUntil = localStorage.getItem('loginLockedUntil');
    if (lockedUntil) {
      const remaining = Math.ceil((+lockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        this.isLocked.set(true);
        this.remainingSeconds.set(remaining);
        this.lockTimer = setInterval(() => {
          const r = Math.max(0,
            Math.ceil((+lockedUntil - Date.now()) / 1000));
          this.remainingSeconds.set(r);
          if (r <= 0) this.deverrouiller();
        }, 1000);
      } else {
        localStorage.removeItem('loginLockedUntil');
      }
    }
  }

  switchMode(mode: 'cin' | 'email'): void {
    if (mode === this.loginMode()) return;
    this.loginMode.set(mode);
    this.form.get('identifiant')?.reset();
    this.form.get('identifiant')?.setErrors(null);
    this.errorMsg.set('');
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.isLocked()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    this.showChangePwdHint.set(false);
    this.tempPasswordExpired.set(false);

    this.auth.login({
      identifiant: this.form.value.identifiant!,
      password:    this.form.value.password!
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.requiresTwoFactor) {
          this.twoFactorRequired.set(true);
          this.twoFactorToken.set(res.twoFactorToken ?? '');
          return;
        }
        if (res.mustChangePassword) this.showChangePwdHint.set(true);
        const role = res.role;
        if (role === 'ADMIN')      this.router.navigate(['/dashboard']);
        else if (role === 'RH')    this.router.navigate(['/dashboard']);
        else                       this.router.navigate(['/profil']);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg: string = err?.error?.message ?? 'Identifiant ou mot de passe incorrect.';

        // ── Mot de passe temporaire expiré — blocage admin requis ──
        if (err?.status === 423 && msg === 'TEMP_PASSWORD_EXPIRED') {
          this.tempPasswordExpired.set(true);
          return;
        }

        // ── Compte verrouillé (après 5 tentatives) ──
        if (err?.status === 423 || msg.toLowerCase().includes('verrouillé')) {
          this.failedCount.set(5);
          this.startLockCountdown(30);
          return;
        }

        // ── Tentatives restantes ──
        const match = msg.match(/(\d+)\s*tentative/);
        if (match) {
          this.failedCount.set(5 - parseInt(match[1]));
        }

        this.tempPasswordExpired.set(false);
        this.errorMsg.set(msg);
      }
    });
  }

  onVerify2FA(): void {
    if (!this.twoFactorCode || this.twoFactorCode.length < 6) {
      this.twoFaError.set('Entrez le code à 6 chiffres de votre application.');
      return;
    }
    this.twoFaLoading.set(true);
    this.twoFaError.set('');
    this.auth.verify2FA(this.twoFactorToken(), this.twoFactorCode).subscribe({
      next: (res) => {
        this.twoFaLoading.set(false);
        if (res.mustChangePassword) this.showChangePwdHint.set(true);
        const role = res.role;
        if (role === 'ADMIN' || role === 'RH') this.router.navigate(['/dashboard']);
        else this.router.navigate(['/profil']);
      },
      error: (err) => {
        this.twoFaLoading.set(false);
        this.twoFaError.set(err?.error?.message ?? 'Code incorrect.');
      }
    });
  }
}
