export type TypeSortie = 'PERSONNEL' | 'PROFESSIONNEL' | 'MEDICAL';

export type StatutAutorisation =
  | 'EN_ATTENTE_MANAGER'
  | 'EN_ATTENTE_RH'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE';

export interface AutorisationSortie {
  id:                   number;
  employeId:            number;
  employeNom:           string;
  employePrenom:        string;
  employeMatricule:     string;
  employeDepartement:   string;
  dateSortie:           string;
  heureSortie:          string;
  heureRetourPrevue:    string;
  heureRetourReelle:    string | null;
  typeSortie:           TypeSortie;
  motif:                string;
  dureePrevueMinutes:   number;
  dureeReelleMinutes:   number | null;
  dureePrevueFormatee:  string;
  dureeReelleFormatee:  string | null;
  statut:               StatutAutorisation;
  managerValideurNom:   string | null;
  dateValidation:       string | null;
  commentaireManager:   string | null;
  createdAt:            string;
}

export interface AutorisationRequest {
  dateSortie:         string;
  heureSortie:        string;
  heureRetourPrevue:  string;
  typeSortie:         TypeSortie;
  motif:              string;
}

export interface ValidationAutorisationRequest {
  approuve:    boolean;
  commentaire: string;
}

export interface PointageRetourRequest {
  heureRetourReelle: string;
}
