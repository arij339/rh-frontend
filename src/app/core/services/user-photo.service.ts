// =========================================================
// NOUVEAU FICHIER
// src/app/core/services/user-photo.service.ts
// =========================================================

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Service singleton partagé entre navbar, sidebar et profil.
 * Stocke la photoUrl de l'utilisateur connecté dans un signal global.
 * Quand la photo change dans profil.component, tous les composants
 * qui injectent ce service se mettent à jour automatiquement.
 */
@Injectable({ providedIn: 'root' })
export class UserPhotoService {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  /** Signal global : URL de la photo ou null */
  photoUrl = signal<string | null>(null);

  /** Charge la photo depuis le backend (à appeler au démarrage) */
  loadPhoto(): void {
    this.http.get<{ photoUrl: string | null }>(`${this.API}/employe/profil`).subscribe({
      next: (profil: any) => {
        this.setPhoto(profil.photoUrl ?? null);
      },
      error: () => {} // Silencieux si l'utilisateur n'est pas connecté
    });
  }

  /** Met à jour la photo en mémoire (appelé après upload réussi) */
  setPhoto(url: string | null): void {
    if (url && url.startsWith('/')) {
      this.photoUrl.set('http://localhost:8080' + url);
    } else {
      this.photoUrl.set(url);
    }
  }

  /** Efface la photo (appelé après suppression) */
  clearPhoto(): void {
    this.photoUrl.set(null);
  }
}