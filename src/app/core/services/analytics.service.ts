import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  /** Charge tout en parallèle — analytics global RH */
  getAnalyticsRH(): Observable<any> {
    return forkJoin({
      conges:         this.http.get<any[]>(`${this.API}/rh/conges`).pipe(catchError(() => of([]))),
      reclamations:   this.http.get<any[]>(`${this.API}/rh/reclamations`).pipe(catchError(() => of([]))),
      avances:        this.http.get<any[]>(`${this.API}/rh/avances`).pipe(catchError(() => of([]))),
      employes:       this.http.get<any[]>(`${this.API}/rh/employes`).pipe(catchError(() => of([]))),
      sorties:        this.http.get<any[]>(`${this.API}/rh/sorties`).pipe(catchError(() => of([]))),
      augmentations:  this.http.get<any[]>(`${this.API}/rh/augmentations`).pipe(catchError(() => of([]))),
    });
  }

  getRapportMensuel(annee: number, mois: number): Observable<any> {
    return forkJoin({
      conges:       this.http.get<any[]>(`${this.API}/rh/conges?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      reclamations: this.http.get<any[]>(`${this.API}/rh/reclamations/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      avances:      this.http.get<any[]>(`${this.API}/rh/avances/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
      sorties:      this.http.get<any[]>(`${this.API}/rh/sorties/rapport?annee=${annee}&mois=${mois}`).pipe(catchError(() => of([]))),
    });
  }

  getSortiesValidees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/sorties/statut/VALIDEE`).pipe(catchError(() => of([])));
  }

  /** Soldes de tous les employés pour une année */
  getSoldesEmployes(annee: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/employes`).pipe(catchError(() => of([])));
  }
}