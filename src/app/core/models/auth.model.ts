export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  nom: string;
  prenom: string;
  email: string;
  mustChangePassword: boolean;
}

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}