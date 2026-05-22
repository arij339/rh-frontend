import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  getSoldesConges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/conges/solde`);
  }
  getMesConges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/conges`);
  }
  getMesAutorisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/sorties`);
  }
  getMesReclamations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/reclamations`);
  }
  getMesAvances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/employe/avances`);
  }

  getCongesEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/conges/en-attente`);
  }
  getAutorisationsEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/sorties/en-attente`);
  }
  getAugmentationsEnAttenteManager(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/augmentations/en-attente`);
  }
  getEquipe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/manager/equipe`);
  }

  getStatsConges(): Observable<any> {
    return this.http.get<any>(`${this.API}/rh/conges/en-attente`);
  }
  getStatsReclamations(): Observable<any> {
    return this.http.get<any>(`${this.API}/rh/reclamations/statistiques`);
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
    return this.http.get<any[]>(`${this.API}/rh/reclamations/statut/NOUVELLE`);
  }
  getAvancesEnAttenteRH(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/avances/en-attente`);
  }
}
