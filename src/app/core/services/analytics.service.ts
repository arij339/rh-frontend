import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  /** Charge tout en parallèle — analytics global RH */
  getAnalyticsRH(): Observable<any> {
    return forkJoin({
      conges:        this.http.get<any[]>(`${this.API}/rh/conges`).pipe(catchError(() => of([]))),
      reclamations:  this.http.get<any[]>(`${this.API}/rh/reclamations`).pipe(catchError(() => of([]))),
      avances:       this.http.get<any[]>(`${this.API}/rh/avances`).pipe(catchError(() => of([]))),
      employes:      this.http.get<any[]>(`${this.API}/rh/employes`).pipe(catchError(() => of([]))),
      sorties:       this.http.get<any[]>(`${this.API}/rh/sorties`).pipe(catchError(() => of([]))),
      augmentations: this.http.get<any[]>(`${this.API}/rh/augmentations`).pipe(catchError(() => of([]))),
    });
  }

  /**
   * Rapport mensuel — utilise les endpoints /rapport?annee=X&mois=Y existants.
   * CORRECTION : /rh/conges/rapport remplace /rh/conges?annee=X&mois=Y
   * (le GET /rh/conges n'accepte pas de query params côté backend).
   */
  getRapportMensuel(annee: number, mois: number): Observable<any> {
    return forkJoin({
      conges:       this.http.get<any[]>(`${this.API}/rh/conges/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      reclamations: this.http.get<any[]>(`${this.API}/rh/reclamations/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      avances:      this.http.get<any[]>(`${this.API}/rh/avances/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      sorties:      this.http.get<any[]>(`${this.API}/rh/sorties/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
    });
  }

  getSortiesValidees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/sorties/statut/VALIDEE`).pipe(catchError(() => of([])));
  }

  /**
   * CORRECTION : appelle maintenant le vrai endpoint des soldes
   * au lieu d'ignorer le paramètre annee et de retourner /rh/employes.
   * Retourne la liste des soldes pour tous les employés (un appel par employé).
   * Utilise /rh/conges/soldes/{employeId} qui existe déjà.
   */
  getSoldeEmploye(employeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/conges/soldes/${employeId}`).pipe(catchError(() => of([])));
  }
}

