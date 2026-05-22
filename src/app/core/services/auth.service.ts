import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';


export interface LoginRequest {
  identifiant: string; // CIN ou email
  password:    string;
}

export interface AuthResponse {
  accessToken:        string;
  refreshToken:       string;
  role:               string;
  nom:                string;
  prenom:             string;
  email:              string;
  mustChangePassword: boolean;
  daysRemaining:      number;
  // 2FA
  requiresTwoFactor?: boolean;
  twoFactorToken?:    string;
}

export interface UserProfile {
  id:     number;
  nom:    string;
  prenom: string;
  email:  string;
  role:   string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private API = environment.apiUrl + '/api';

  private userSubject = new BehaviorSubject<UserProfile | null>(
    this.getUserFromStorage()
  );
  user$ = this.userSubject.asObservable();

  // ===== LOGIN =====
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/login`, request
    ).pipe(tap(response => {
      // Si la 2FA est requise, ne pas stocker les tokens (ils ne sont pas dans la réponse)
      if (response.requiresTwoFactor) return;

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Stocker mustChangePassword sans forcer redirect
      localStorage.setItem(
        'mustChangePassword',
        String(response.mustChangePassword)
      );

      // ✅ FIX: stocker les jours restants ET la date de connexion
      // pour calculer le décompte réel jour après jour
      localStorage.setItem(
        'daysRemainingAtLogin',
        String(response.daysRemaining ?? 7)
      );
      if (!localStorage.getItem('loginDate')) {
  localStorage.setItem('loginDate', new Date().toISOString());
}

      localStorage.setItem('user', JSON.stringify({
        nom:    response.nom,
        prenom: response.prenom,
        email:  response.email,
        role:   response.role
      }));

      this.userSubject.next({
        id:     0,
        nom:    response.nom,
        prenom: response.prenom,
        email:  response.email,
        role:   response.role
      });
    }));
  }

  // ===== LOGOUT =====
  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ===== GETTERS =====
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getCurrentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  getRole(): string {
    return this.getCurrentUser()?.role ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.getRole());
  }

  //  Info seulement — pas de redirect forcée
  getMustChangePassword(): boolean {
    return localStorage.getItem('mustChangePassword') === 'true';
  }

  // ✅ FIX: calcul dynamique basé sur la date de connexion
  getDaysRemaining(): number {
    const loginDateStr     = localStorage.getItem('loginDate');
    const daysAtLoginStr   = localStorage.getItem('daysRemainingAtLogin');
    const daysAtLogin      = parseInt(daysAtLoginStr ?? '7', 10);

    if (!loginDateStr) return daysAtLogin;

    const loginDate  = new Date(loginDateStr);
    const now        = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, daysAtLogin - daysPassed);
  }

  clearMustChangePassword(): void {
    localStorage.setItem('mustChangePassword', 'false');
    // Remettre à 7 et réinitialiser la date pour le prochain cycle
    localStorage.setItem('daysRemainingAtLogin', '7');
    localStorage.setItem('loginDate', new Date().toISOString());
  }

  // ===== CHANGE PASSWORD =====
  changePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(
      `${this.API}/auth/change-password`,
      { oldPassword, newPassword }, { responseType: 'text' }
    ).pipe(tap(() => {
      // Effacer le flag après changement
      this.clearMustChangePassword();
    }));
  }

  // ===== 2FA =====
  setup2FA(): Observable<{ qrCodeDataUrl: string; secret: string; otpAuthUri: string }> {
    return this.http.post<any>(`${this.API}/auth/2fa/setup`, {});
  }

  enable2FA(code: string): Observable<any> {
    return this.http.post(`${this.API}/auth/2fa/enable`, { code });
  }

  disable2FA(code: string): Observable<any> {
    return this.http.post(`${this.API}/auth/2fa/disable`, { code });
  }

  get2FAStatus(): Observable<{ twoFactorEnabled: boolean }> {
    return this.http.get<any>(`${this.API}/auth/2fa/status`);
  }

  verify2FA(twoFactorToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/2fa/verify`, { twoFactorToken, code })
      .pipe(tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('mustChangePassword', String(response.mustChangePassword));

        // ✅ FIX: même correction pour le flux 2FA
        localStorage.setItem('daysRemainingAtLogin', String(response.daysRemaining ?? 7));
        localStorage.setItem('loginDate', new Date().toISOString());

        localStorage.setItem('user', JSON.stringify({
          nom: response.nom, prenom: response.prenom,
          email: response.email, role: response.role
        }));
        this.userSubject.next({
          id: 0, nom: response.nom, prenom: response.prenom,
          email: response.email, role: response.role
        });
      }));
  }

  private getUserFromStorage(): UserProfile | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}