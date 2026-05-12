export type StatutAugmentation =
  | 'EN_ATTENTE_MANAGER'
  | 'EN_ATTENTE_RH'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE';

export interface AugmentationSalaire {
  id:                        number;
  employeId:                 number;
  employeNom:                string;
  employePrenom:             string;
  employeMatricule:          string;
  employeDepartement:        string;
  employePoste:              string;
  salaireActuel:             number;
  montantDemande:            number;
  montantAccorde:            number | null;
  salaireApresAugmentation:  number | null;
  pourcentageAugmentation:   number | null;
  motif:                     string;
  statut:                    StatutAugmentation;
  managerNom:                string | null;
  avisManager:               boolean | null;
  commentaireManager:        string | null;
  dateAvisManager:           string | null;
  rhDecideurNom:             string | null;
  commentaireRH:             string | null;
  dateDecisionRH:            string | null;
  dateEffet:                 string | null;
  createdAt:                 string;
}

export interface AugmentationRequest {
  montantDemande: number;
  motif:          string;
}

export interface AvisManagerAugRequest {
  favorable:   boolean;
  commentaire: string;
}

export interface TraiterAugmentationRequest {
  approuve:        boolean;
  montantAccorde?: number;
  dateEffet?:      string;
  commentaire:     string;
}
