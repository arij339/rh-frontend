import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AbsencePrediction {
  employeId:   number;
  employeNom:  string;
  probabilite: number;
  risque:      'ELEVE' | 'MOYEN' | 'FAIBLE' | 'TRES_FAIBLE';
  facteurs:    string[];
  conseil:     string;
}

export interface AnomalyResult {
  employeId:       number;
  employeNom:      string;
  estAnomal:       boolean;
  scoreAnomalie:   number;
  niveau:          'CRITIQUE' | 'ALERTE' | 'ATTENTION' | 'NORMAL';
  anomalies:       { type: string; detail: string; severite: string }[];
  recommandation:  string;
}

@Injectable({ providedIn: 'root' })
export class MlService {
  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api/ml';

  getPredictionsAbsences(): Observable<any> {
    return this.http.get(`${this.API}/predictions/absences`);
  }

  getAnomalies(): Observable<any> {
    return this.http.get(`${this.API}/anomalies`);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.API}/health`);
  }
}