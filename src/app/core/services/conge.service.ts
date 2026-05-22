import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CongeRequest, DemandeConge,
  SoldeConge, ValidationRequest
} from '../models/conge.model';

@Injectable({ providedIn: 'root' })
export class CongeService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  // ===== EMPLOYÉ =====
  creerDemande(req: CongeRequest): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(
      `${this.API}/employe/conges`, req);
  }

  getMesConges(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.API}/employe/conges`);
  }

  getSoldes(): Observable<SoldeConge[]> {
    return this.http.get<SoldeConge[]>(
      `${this.API}/employe/conges/solde`);
  }

  soumettre(id: number): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(
      `${this.API}/employe/conges/${id}/soumettre`, {});
  }

  annuler(id: number): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(
      `${this.API}/employe/conges/${id}/annuler`, {});
  }
  // ─── Pièce justificative ──────────────────────────────────────────
  uploadJustificatif(id: number, file: File): Observable<{ justificatifUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // On récupère le token fraîchement depuis localStorage à chaque upload
    // pour éviter un 401 si l'intercepteur ne peut pas re-cloner le FormData
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
    return this.http.post<{ justificatifUrl: string }>(
      `${this.API}/employe/conges/${id}/justificatif`,
      formData,
      { headers }
    );
  }
 
  deleteJustificatif(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/employe/conges/${id}/justificatif`);
  }

  // ===== MANAGER =====
  getEnAttenteManager(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.API}/manager/conges/en-attente`);
  }

  validerManager(
    id: number, req: ValidationRequest): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(
      `${this.API}/manager/conges/${id}/valider`, req);
  }

  getCalendrierEquipe(
    debut: string, fin: string): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.API}/manager/conges/calendrier?debut=${debut}&fin=${fin}`);
  }

  // ===== RH =====
  getEnAttenteRH(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.API}/rh/conges/en-attente`);
  }

  validerRH(
    id: number, req: ValidationRequest): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(
      `${this.API}/rh/conges/${id}/valider`, req);
  }

  getToutesConges(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.API}/rh/conges`);
  }

  getSoldesEmploye(
    employeId: number): Observable<SoldeConge[]> {
    return this.http.get<SoldeConge[]>(
      `${this.API}/rh/conges/soldes/${employeId}`);
  }

  ajusterSolde(
    employeId: number,
    params: any): Observable<any> {
    return this.http.put(
      `${this.API}/rh/conges/soldes/${employeId}`, null,
      { params });
  }
}