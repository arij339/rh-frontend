import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private http = inject(HttpClient);
  private API  = '/api';

  // ===== USERS =====
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/admin/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.API}/admin/users`, user);
  }

  toggleStatus(userId: number): Observable<any> {
    return this.http.put(
      `${this.API}/admin/users/${userId}/toggle-status`, {});
  }

  unlockAccount(userId: number): Observable<any> {
    return this.http.put(
      `${this.API}/admin/users/${userId}/unlock`, {});
  }

  resetPassword(userId: number): Observable<any> {
    return this.http.put(
      `${this.API}/admin/users/${userId}/reset-password`, {});
  }

  // ===== EMPLOYÉS =====
  getAllEmployes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/employes`);
  }

  // ===== DEMANDES =====
  getTousConges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/conges`);
  }

  getToutesAutorisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/sorties`);
  }

  getToutesReclamations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/reclamations`);
  }

  getToutesAvances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/rh/avances`);
  }

  // ===== AUDIT =====
  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/admin/audit-logs`);
  }

  getUserAuditLogs(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/admin/audit-logs/user/${userId}`);
  }

  // ===== TOUT EN UNE FOIS =====
  loadAllData(): Observable<any> {
    return forkJoin({
      users:         this.getAllUsers(),
      employes:      this.getAllEmployes(),
      conges:        this.getTousConges(),
      autorisations: this.getToutesAutorisations(),
      reclamations:  this.getToutesReclamations(),
      avances:       this.getToutesAvances(),
      auditLogs:     this.getAuditLogs()
    });
  }
}
