export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  role: "admin" | "superadmin" | "editor";
  createdAt?: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
  session?: AuthSession;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AdminUser | null>;
  getSession(): Promise<AuthSession | null>;
  isAuthenticated(): Promise<boolean>;
  forgotPassword(username: string): Promise<{ success: boolean; message: string }>;
}
