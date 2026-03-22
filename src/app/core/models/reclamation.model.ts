export type TypeReclamation =
  | 'SALAIRE'
  | 'CONDITIONS_TRAVAIL'
  | 'MATERIEL_EQUIPEMENT'
  | 'RELATIONS_PROFESSIONNELLES'
  | 'AUTRE';

export type StatutReclamation =
  | 'NOUVELLE'
  | 'EN_COURS'
  | 'RESOLUE'
  | 'CLOTUREE';

export type NiveauUrgence = 'FAIBLE' | 'NORMALE' | 'URGENTE';

export interface Reclamation {
  id:                    number;
  numeroTicket:          string;
  employeId:             number;
  employeNom:            string;
  employePrenom:         string;
  employeMatricule:      string;
  typeReclamation:       TypeReclamation;
  objet:                 string;
  description:           string;
  niveauUrgence:         NiveauUrgence;
  anonyme:               boolean;
  documentUrl:           string | null;
  documentNom:           string | null;
  statut:                StatutReclamation;
  rhTraitantNom:         string | null;
  datePriseEnCharge:     string | null;
  dateResolution:        string | null;
  dateCloture:           string | null;
  reponseRH:             string | null;
  noteEvaluation:        number | null;
  commentaireEvaluation: string | null;
  dateEvaluation:        string | null;
  commentaires:          Commentaire[];
  createdAt:             string;
}

export interface Commentaire {
  id:         number;
  contenu:    string;
  auteurNom:  string;
  auteurRole: string;
  interne:    boolean;
  createdAt:  string;
}

export interface ReclamationRequest {
  typeReclamation: TypeReclamation;
  objet:           string;
  description:     string;
  niveauUrgence:   NiveauUrgence;
  anonyme:         boolean;
  documentUrl?:    string;
  documentNom?:    string;
}

export interface CommentaireRequest {
  contenu:  string;
  interne?: boolean;
}

export interface TraiterReclamationRequest {
  statut:    StatutReclamation;
  reponseRH: string;
}

export interface EvaluationRequest {
  note:        number;
  commentaire: string;
}