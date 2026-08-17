export interface User {
  id: string;
  email: string;
  name: string;
  role: 'operator' | 'driver' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreeToTerms?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Isolated Authentication Service abstraction.
 * This mock implementation simulates network latency and validates inputs locally.
 * Swap this out with real backend API calls (REST/GraphQL/Supabase/Firebase) seamlessly in future.
 */
class AuthService {
  private static STORAGE_KEY = 'smartpark_auth_session';

  /**
   * Mock login attempt
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const email = credentials.email.trim().toLowerCase();

    // Basic mock authentication rules
    if (credentials.password === 'error') {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
      };
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    const mockUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: email,
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'SmartPark User',
      role: 'operator',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        AuthService.STORAGE_KEY,
        JSON.stringify({
          authenticated: true,
          userId: mockUser.id,
          email: mockUser.email,
        })
      );
    }

    return {
      success: true,
      user: mockUser,
    };
  }

  /**
   * Mock signup attempt
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    // Simulate network latency (900ms)
    await new Promise((resolve) => setTimeout(resolve, 900));

    const email = credentials.email.trim().toLowerCase();

    if (email === 'existing@smartpark.ai') {
      return {
        success: false,
        error: 'An account with this email address already exists.',
      };
    }

    const mockUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: email,
      name: credentials.name.trim(),
      role: 'driver',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        AuthService.STORAGE_KEY,
        JSON.stringify({
          authenticated: true,
          userId: mockUser.id,
          email: mockUser.email,
        })
      );
    }

    return {
      success: true,
      user: mockUser,
    };
  }

  /**
   * Get current stored user session (if remembered)
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AuthService.STORAGE_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      if (!session.authenticated) return null;
      return {
        id: session.userId || 'demo-user',
        email: session.email || 'demo@smartpark.local',
        name: (session.email || 'demo@smartpark.local').split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'SmartPark User',
        role: 'operator',
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(AuthService.STORAGE_KEY);
      if (!stored) return false;
      const session = JSON.parse(stored);
      return !!session.authenticated;
    } catch {
      return false;
    }
  }

  /**
   * Logout user session
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.STORAGE_KEY);
    }
  }
}

export const authService = new AuthService();
