import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AutorisationSortie,
  AutorisationRequest,
  ValidationAutorisationRequest,
  PointageRetourRequest
} from '../models/autorisation.model';

@Injectable({ providedIn: 'root' })
export class AutorisationService {

  private http = inject(HttpClient);
  private API  = '/api';

  // ===== EMPLOYÉ =====
  creerDemande(req: AutorisationRequest): Observable<AutorisationSortie> {
    return this.http.post<AutorisationSortie>(
      `${this.API}/employe/sorties`, req);
  }

  getMesSorties(): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/employe/sorties`);
  }

  annuler(id: number): Observable<AutorisationSortie> {
    return this.http.put<AutorisationSortie>(
      `${this.API}/employe/sorties/${id}/annuler`, {});
  }

  pointerRetour(
    id: number,
    req: PointageRetourRequest
  ): Observable<AutorisationSortie> {
    return this.http.put<AutorisationSortie>(
      `${this.API}/employe/sorties/${id}/retour`, req);
  }

  // ===== MANAGER =====
  getEnAttenteManager(): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/manager/sorties/en-attente`);
  }

  getToutesEquipe(): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/manager/sorties/equipe`);
  }

  validerManager(
    id: number,
    req: ValidationAutorisationRequest
  ): Observable<AutorisationSortie> {
    return this.http.put<AutorisationSortie>(
      `${this.API}/manager/sorties/${id}/valider`, req);
  }

  // ===== RH =====
  getToutesSorties(): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/rh/sorties`);
  }

  getEnAttenteRH(): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/rh/sorties/en-attente`);
  }

  validerRH(
    id: number,
    req: ValidationAutorisationRequest
  ): Observable<AutorisationSortie> {
    return this.http.put<AutorisationSortie>(
      `${this.API}/rh/sorties/${id}/valider`, req);
  }

  getRapportMensuel(
    annee: number,
    mois: number
  ): Observable<AutorisationSortie[]> {
    return this.http.get<AutorisationSortie[]>(
      `${this.API}/rh/sorties/rapport?annee=${annee}&mois=${mois}`);
  }
}
