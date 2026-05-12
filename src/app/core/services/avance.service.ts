import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AvanceSalaire, AvanceRequest,
  SimulationRequest, SimulationResponse,
  TraiterAvanceRequest
} from '../models/avance.model';

@Injectable({ providedIn: 'root' })
export class AvanceService {

  private http = inject(HttpClient);
  private API  = '/api';

  // ===== EMPLOYÉ =====
  simuler(req: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(
      `${this.API}/employe/avances/simuler`, req);
  }

  creerDemande(req: AvanceRequest): Observable<AvanceSalaire> {
    return this.http.post<AvanceSalaire>(
      `${this.API}/employe/avances`, req);
  }

  getMesAvances(): Observable<AvanceSalaire[]> {
    return this.http.get<AvanceSalaire[]>(
      `${this.API}/employe/avances`);
  }

  annuler(id: number): Observable<AvanceSalaire> {
    return this.http.put<AvanceSalaire>(
      `${this.API}/employe/avances/${id}/annuler`, {});
  }

  // ===== RH =====
  getEnAttenteRH(): Observable<AvanceSalaire[]> {
    return this.http.get<AvanceSalaire[]>(
      `${this.API}/rh/avances/en-attente`);
  }

  getToutesAvances(): Observable<AvanceSalaire[]> {
    return this.http.get<AvanceSalaire[]>(
      `${this.API}/rh/avances`);
  }

  traiter(
    id: number, req: TraiterAvanceRequest
  ): Observable<AvanceSalaire> {
    return this.http.put<AvanceSalaire>(
      `${this.API}/rh/avances/${id}/traiter`, req);
  }

  enregistrerVersement(id: number): Observable<AvanceSalaire> {
    return this.http.put<AvanceSalaire>(
      `${this.API}/rh/avances/${id}/versement`, {});
  }

  enregistrerRemboursement(
    avanceId: number, echeanceId: number
  ): Observable<AvanceSalaire> {
    return this.http.put<AvanceSalaire>(
      `${this.API}/rh/avances/${avanceId}/remboursement/${echeanceId}`,
      {}
    );
  }

  getStatistiques(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.API}/rh/avances/statistiques`);
  }
}
