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
  private API    = '/api';

  private userSubject = new BehaviorSubject<UserProfile | null>(
    this.getUserFromStorage()
  );
  user$ = this.userSubject.asObservable();

  // ===== LOGIN =====
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/login`, request
    ).pipe(tap(response => {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // ✅ Stocker mustChangePassword sans forcer redirect
      localStorage.setItem(
        'mustChangePassword',
        String(response.mustChangePassword)
      );

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

  // ✅ Info seulement — pas de redirect forcée
  getMustChangePassword(): boolean {
    return localStorage.getItem('mustChangePassword') === 'true';
  }

  clearMustChangePassword(): void {
    localStorage.setItem('mustChangePassword', 'false');
  }

  // ===== CHANGE PASSWORD =====
  changePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(
      `${this.API}/auth/change-password`,
      { oldPassword, newPassword },{ responseType: 'text' }
    ).pipe(tap(() => {
      // ✅ Effacer le flag après changement
      this.clearMustChangePassword();
    }));
  }

  private getUserFromStorage(): UserProfile | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
