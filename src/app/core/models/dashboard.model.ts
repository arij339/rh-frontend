export interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: number;
}

export interface DashboardEmploye {
  soldesConges: SoldeConge[];
  prochaineConge?: any;
  autorisationsEnCours: number;
  reclamationsOuvertes: number;
  avanceEnCours?: any;
}

export interface DashboardManager {
  congesEnAttente: number;
  autorisationsEnAttente: number;
  effectifEquipe: number;
  congesEquipe: any[];
}

export interface DashboardRH {
  totalEmployes: number;
  congesEnAttente: number;
  reclamationsNouvelles: number;
  avancesEnAttente: number;
  congesParStatut: Record<string, number>;
  reclamationsParType: Record<string, number>;
}

export interface SoldeConge {
  typeConge: string;
  joursAcquis: number;
  joursConsommes: number;
  joursRestants: number;
}
