import { environment } from '../../../environments/environment';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface NotificationItem {
  id:          number;
  type:        string;
  titre:       string;
  message:     string;
  lien:        string | null;
  entiteType:  string | null;
  entiteId:    number | null;
  lu:          boolean;
  dateLecture: string | null;
  createdAt:   string;
  icon:        string;
  color:       string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private API = environment.apiUrl + '/api';

  // Signal pour le compteur badge
  nonLuesCount = signal(0);

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(
      `${this.API}/notifications`);
  }

  getNonLuesCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(
      `${this.API}/notifications/count`);
  }

  marquerLue(id: number): Observable<any> {
    return this.http.put(
      `${this.API}/notifications/${id}/lue`, {});
  }

  marquerToutesLues(): Observable<any> {
    return this.http.put(
      `${this.API}/notifications/toutes-lues`, {});
  }

  // Polling toutes les 30 secondes
  startPolling(): void {
    interval(30000).pipe(
      switchMap(() => this.getNonLuesCount())
    ).subscribe(data => {
      this.nonLuesCount.set(data.count);
    });

    // Charger immédiatement
    this.getNonLuesCount().subscribe(data => {
      this.nonLuesCount.set(data.count);
    });
  }
}


