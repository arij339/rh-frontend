import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  // Soldes congés
  getSoldesConges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/conges/solde`);
  }

  // Mes demandes congés
  getMesConges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/conges`);
  }

  // Mes autorisations
  getMesAutorisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/sorties`);
  }

  // Mes réclamations
  getMesReclamations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/reclamations`);
  }

  // Mes avances
  getMesAvances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/avances`);
  }

  // Manager — en attente
  getCongesEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/conges/en-attente`);
  }

  getAutorisationsEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/sorties/en-attente`);
  }

  getAvancesEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/avances/en-attente`);
  }

  getEquipe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/equipe`);
  }

  // RH — statistiques
  getStatsConges(): Observable<any> {
    return this.http.get<any>(`${this.API}/rh/conges/en-attente`);
  }

  getStatsReclamations(): Observable<any> {
    return this.http.get<any>(
      `${this.API}/rh/reclamations/statistiques`);
  }

  getStatsAvances(): Observable<any> {
    return this.http.get<any>(`${this.API}/rh/avances/statistiques`);
  }

  getTousEmployes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/employes`);
  }

  getCongesEnAttenteRH(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/conges/en-attente`);
  }

  getReclamationsNouvelles(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/rh/reclamations/statut/NOUVELLE`);
  }

  getAvancesEnAttenteRH(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/avances/en-attente`);
  }
}