import {
  AdminUser,
  AuthResponse,
  AuthSession,
  IAuthService,
  LoginCredentials,
} from "./authTypes";

/**
 * Insha Collections Authentication Service
 * 
 * Architecture:
 * - Designed for AWS Cognito User Pool authentication.
 * - Communicates with server-side API routes (/api/auth/login, /api/auth/logout, /api/auth/session)
 *   to ensure credentials and tokens are never exposed or stored in localStorage.
 * - Cognito User Pool integration can be seamlessly activated by setting:
 *   - AWS_COGNITO_REGION
 *   - AWS_COGNITO_USER_POOL_ID
 *   - AWS_COGNITO_CLIENT_ID
 */
class AuthService implements IAuthService {
  private cachedUser: AdminUser | null = null;
  private cachedSession: AuthSession | null = null;

  /**
   * Log in user with username and password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = (await response.json()) as AuthResponse;

      if (data.success && data.user) {
        this.cachedUser = data.user;
        this.cachedSession = data.session || null;
      }

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication request failed";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Log out the current session and clear tokens.
   */
  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      this.cachedUser = null;
      this.cachedSession = null;
    }
  }

  /**
   * Retrieve currently authenticated admin user.
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    if (this.cachedUser) return this.cachedUser;

    const session = await this.getSession();
    return session ? session.user : null;
  }

  /**
   * Check and refresh current server-side session.
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        this.cachedUser = null;
        this.cachedSession = null;
        return null;
      }

      const data = await response.json();
      if (data.authenticated && data.session) {
        this.cachedUser = data.session.user;
        this.cachedSession = data.session;
        return data.session;
      }

      this.cachedUser = null;
      this.cachedSession = null;
      return null;
    } catch {
      this.cachedUser = null;
      this.cachedSession = null;
      return null;
    }
  }

  /**
   * Check if an active authenticated session exists.
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Request password reset / support.
   */
  async forgotPassword(username: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      return data;
    } catch {
      return {
        success: false,
        message: "Unable to process password reset request. Please contact technical support.",
      };
    }
  }
}

export const authService = new AuthService();
