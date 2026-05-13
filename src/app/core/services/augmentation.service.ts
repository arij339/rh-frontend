import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AugmentationSalaire,
  AugmentationRequest,
  AvisManagerAugRequest,
  TraiterAugmentationRequest
} from '../models/augmentation.model';

@Injectable({ providedIn: 'root' })
export class AugmentationService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  // Employé
  creer(req: AugmentationRequest): Observable<AugmentationSalaire> {
    return this.http.post<AugmentationSalaire>(
      `${this.API}/employe/augmentations`, req);
  }

  mesDemandes(): Observable<AugmentationSalaire[]> {
    return this.http.get<AugmentationSalaire[]>(
      `${this.API}/employe/augmentations`);
  }

  annuler(id: number): Observable<AugmentationSalaire> {
    return this.http.put<AugmentationSalaire>(
      `${this.API}/employe/augmentations/${id}/annuler`, {});
  }

  simuler(montant: number): Observable<any> {
    return this.http.get<any>(
      `${this.API}/employe/augmentations/simuler?montant=${montant}`);
  }

  // Manager
  enAttenteManager(): Observable<AugmentationSalaire[]> {
    return this.http.get<AugmentationSalaire[]>(
      `${this.API}/manager/augmentations/en-attente`);
  }

  donnerAvis(
    id: number,
    req: AvisManagerAugRequest
  ): Observable<AugmentationSalaire> {
    return this.http.put<AugmentationSalaire>(
      `${this.API}/manager/augmentations/${id}/avis`, req);
  }

  // RH
  enAttenteRH(): Observable<AugmentationSalaire[]> {
    return this.http.get<AugmentationSalaire[]>(
      `${this.API}/rh/augmentations/en-attente`);
  }

  toutes(): Observable<AugmentationSalaire[]> {
    return this.http.get<AugmentationSalaire[]>(
      `${this.API}/rh/augmentations`);
  }

  traiter(
    id: number,
    req: TraiterAugmentationRequest
  ): Observable<AugmentationSalaire> {
    return this.http.put<AugmentationSalaire>(
      `${this.API}/rh/augmentations/${id}/traiter`, req);
  }

  statistiques(): Observable<any> {
    return this.http.get<any>(
      `${this.API}/rh/augmentations/statistiques`);
  }
}


