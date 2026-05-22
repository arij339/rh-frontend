export type StatutAvance =
  | 'EN_ATTENTE_RH'
  | 'MODIFIEE_PAR_RH'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE'
  | 'EN_COURS'
  | 'SOLDEE';

export interface Echeance {
  id:               number;
  numeroMensualite: number;
  dateEcheance:     string;
  montantEcheance:  number;
  paye:             boolean;
  datePaiement:     string | null;
  montantPaye:      number | null;
}

export interface AvanceSalaire {
  id:                     number;
  employeId:              number;
  employeNom:             string;
  employePrenom:          string;
  employeMatricule:       string;
  employeDepartement:     string;
  salaireBase:            number;
  montantDemande:         number;
  montantAccorde:         number | null;
  montantRembourse:       number;
  montantRestant:         number | null;
  montantMaxAutorise:     number | null;
  motif:                  string;
  nombreMensualites:      number;
  mensualite:             number | null;
  dateDebutRemboursement: string | null;
  prochaineEcheance:      string | null;
  statut:                 StatutAvance;
  rhDecideurNom:          string | null;
  commentaireRH:          string | null;
  dateDecisionRH:         string | null;
  dateVersement:          string | null;
  echeancier:             Echeance[] | null;
  createdAt:              string;
}

export interface AvanceRequest {
  montantDemande:    number;
  motif:             string;
  nombreMensualites: number;
}

export interface SimulationRequest {
  montant:           number;
  nombreMensualites: number;
}

export interface SimEcheance {
  numero:       number;
  dateEcheance: string;
  montant:      number;
}

export interface SimulationResponse {
  montantDemande:         number;
  montantMaxAutorise:     number;
  salaireBase:            number;
  nombreMensualites:      number;
  mensualite:             number;
  dateDebutRemboursement: string;
  eligible:               boolean;
  raisonIneligibilite:    string | null;
  echeancier:             SimEcheance[];
}

export interface TraiterAvanceRequest {
  approuve:           boolean;
  montantAccorde?:    number;
  nombreMensualites?: number;
  dateVersement?:     string;
  commentaire:        string;
}
