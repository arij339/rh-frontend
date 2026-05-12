export type TypeConge = 'ANNUEL' | 'MALADIE' | 'EXCEPTIONNEL' | 'SANS_SOLDE' | 'MATERNITE' | 'PATERNITE';

export type StatutConge =
  | 'BROUILLON'
  | 'EN_ATTENTE_MANAGER'
  | 'EN_ATTENTE_RH'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE';

export interface SoldeConge {
  typeConge:       TypeConge;
  annee:           number;
  joursAcquis:     number;
  joursConsommes:  number;
  joursReportes:   number;
  joursRestants:   number;
}

export interface DemandeConge {
  id:                  number;
  employeId:           number;
  employeNom:          string;
  employePrenom:       string;
  employeMatricule:    string;
  employeDepartement:  string;
  typeConge:           TypeConge;
  dateDebut:           string;
  dateFin:             string;
  joursOuvrables:      number;
  motif:               string;
  statut:              StatutConge;
  commentaireManager:  string;
  commentaireRH:       string;
  managerValideurNom:  string;
  rhValideurNom:       string;
  dateValidationManager: string;
  dateValidationRh:    string;
  createdAt:           string;
  fichierJustificatif: string | null;
}

export interface CongeRequest {
  typeConge:   TypeConge;
  dateDebut:   string;
  dateFin:     string;
  motif:       string;
  soumettre:   boolean;
}

export interface ValidationRequest {
  approuve:    boolean;
  commentaire: string;
}
