import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProfilEmploye, UpdateProfilRequest
} from '../models/profil.model';

@Injectable({ providedIn: 'root' })
export class ProfilService {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  // Mon profil
  getMonProfil(): Observable<ProfilEmploye> {
  return this.http.get<ProfilEmploye>(`${this.API}/employe/profil/complet`); // ← /complet
}

  updateMonProfil(
    req: UpdateProfilRequest
  ): Observable<ProfilEmploye> {
    return this.http.put<ProfilEmploye>(
      `${this.API}/employe/profil`, req);
  }

  // RH — profil complet
  getProfilComplet(id: number): Observable<ProfilEmploye> {
    return this.http.get<ProfilEmploye>(
      `${this.API}/rh/employes/${id}`);
  }

  updateProfilRH(
    id: number, req: any
  ): Observable<ProfilEmploye> {
    return this.http.put<ProfilEmploye>(
      `${this.API}/rh/employes/${id}`, req);
  }

  getHistorique(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/rh/employes/${id}/historique`);
  }

  getTousEmployes(): Observable<ProfilEmploye[]> {
    return this.http.get<ProfilEmploye[]>(
      `${this.API}/rh/employes`);
  }

  rechercherEmployes(keyword: string): Observable<ProfilEmploye[]> {
    return this.http.get<ProfilEmploye[]>(
      `${this.API}/rh/employes/search?keyword=${keyword}`);
  }

  // Notification settings
  updateNotifSettings(req: any): Observable<any> {
    return this.http.put(
      `${this.API}/auth/notification-settings`, req,
      { responseType: 'text' }
    );
  }

  // RGPD
  updateRgpdConsent(consent: boolean): Observable<any> {
    return this.http.put(
      `${this.API}/auth/rgpd-consent?consent=${consent}`, {});
  }

  requestDataDeletion(): Observable<any> {
    return this.http.post(
      `${this.API}/auth/rgpd-deletion`, {});
  }

  // ── Photo de profil ──────────────────────────────────────────────────────

  /**
   * Upload une nouvelle photo de profil.
   * Envoie le fichier en multipart/form-data.
   * @returns Observable avec { photoUrl: string }
   */
  uploadPhoto(file: File): Observable<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ photoUrl: string }>(
      `${this.API}/employe/photo`, formData
    );
  }

  /**
   * Supprime la photo de profil de l'employé connecté.
   */
  deletePhoto(): Observable<void> {
    return this.http.delete<void>(`${this.API}/employe/photo`);
  }
}