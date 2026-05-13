import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Reclamation, ReclamationRequest,
  CommentaireRequest, TraiterReclamationRequest,
  EvaluationRequest
} from '../models/reclamation.model';

@Injectable({ providedIn: 'root' })
export class ReclamationService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  // ===== EMPLOYÉ =====
  creer(req: ReclamationRequest): Observable<Reclamation> {
    return this.http.post<Reclamation>(
      `${this.API}/employe/reclamations`, req);
  }

  getMesReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(
      `${this.API}/employe/reclamations`);
  }

  getDetail(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(
      `${this.API}/employe/reclamations/${id}`);
  }

  commenterEmploye(
    id: number, req: CommentaireRequest
  ): Observable<any> {
    return this.http.post(
      `${this.API}/employe/reclamations/${id}/commentaires`, req);
  }

  evaluer(
    id: number, req: EvaluationRequest
  ): Observable<Reclamation> {
    return this.http.post<Reclamation>(
      `${this.API}/employe/reclamations/${id}/evaluer`, req);
  }

  // ===== RH =====
  getToutesRH(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(
      `${this.API}/rh/reclamations`);
  }

  getDetailRH(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(
      `${this.API}/rh/reclamations/${id}`);
  }

  parStatut(statut: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(
      `${this.API}/rh/reclamations/statut/${statut}`);
  }

  prendreEnCharge(id: number): Observable<Reclamation> {
    return this.http.put<Reclamation>(
      `${this.API}/rh/reclamations/${id}/prendre-en-charge`, {});
  }

  traiter(
    id: number, req: TraiterReclamationRequest
  ): Observable<Reclamation> {
    return this.http.put<Reclamation>(
      `${this.API}/rh/reclamations/${id}/traiter`, req);
  }

  commenterRH(
    id: number, req: CommentaireRequest
  ): Observable<any> {
    return this.http.post(
      `${this.API}/rh/reclamations/${id}/commentaires`, req);
  }

  getStatistiques(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.API}/rh/reclamations/statistiques`);
  }
}


