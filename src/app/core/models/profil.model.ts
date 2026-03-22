export interface ProfilEmploye {
  id:                      number;
  userId:                  number;
  nom:                     string;
  prenom:                  string;
  matricule:               string;
  poste:                   string;
  departement:             string;
  dateEmbauche:            string;
  dateNaissance:           string | null;
  lieuNaissance:           string | null;
  nationalite:             string | null;
  genre:                   string | null;
  situationFamiliale:      string | null;
  cin:                     string | null;
  numeroCnss:              string | null;
  telephone:               string | null;
  adresse:                 string | null;
  ville:                   string | null;
  codePostal:              string | null;
  photoUrl:                string | null;
  salaireBase:             number | null;
  contactUrgenceNom:       string | null;
  contactUrgenceTelephone: string | null;
  contactUrgenceRelation:  string | null;
  managerNom:              string | null;
  anciennete:              string | null;
  contrat:                 Contrat | null;
  historique:              HistoriqueItem[];
  email:                   string;
  role:                    string;
}

export interface Contrat {
  id:           number;
  typeContrat:  string;
  dateDebut:    string;
  dateFin:      string | null;
  posteContrat: string;
}

export interface HistoriqueItem {
  id:               number;
  typeEvenement:    string;
  posteAvant:       string;
  posteApres:       string;
  departementApres: string;
  commentaire:      string;
  dateDebut:        string;
}

export interface UpdateProfilRequest {
  telephone?:               string;
  adresse?:                 string;
  ville?:                   string;
  codePostal?:              string;
  dateNaissance?:           string;
  lieuNaissance?:           string;
  nationalite?:             string;
  genre?:                   string;
  situationFamiliale?:      string;
  cin?:                     string;
  numeroCnss?:              string;
  contactUrgenceNom?:       string;
  contactUrgenceTelephone?: string;
  contactUrgenceRelation?:  string;
}