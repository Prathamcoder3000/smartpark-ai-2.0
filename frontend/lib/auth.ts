import { api } from './api';

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

class AuthService {
  private static STORAGE_KEY = 'smartpark_auth_session';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Login failed.'
        };
      }

      const { user, token } = response.data;

      // Determine role: try checking if operator dashboard is accessible
      // To avoid synchronous blocking, let's see if operator list is accessible.
      // We can also check email pattern or check operator table on backend.
      // Let's check operator dashboard asynchronously or check if they are seeded.
      let role: 'operator' | 'driver' | 'admin' = 'driver';
      try {
        const opCheck = await fetch('http://localhost:8001/api/operator/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (opCheck.ok) {
          role = 'operator';
        }
      } catch {
        role = 'driver';
      }

      const appUser: User = {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          AuthService.STORAGE_KEY,
          JSON.stringify({
            authenticated: true,
            token,
            userId: appUser.id,
            email: appUser.email,
            name: appUser.name,
            role: appUser.role
          })
        );
      }

      return {
        success: true,
        user: appUser
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Invalid email or password.'
      };
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/signup', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Signup failed.'
        };
      }

      const { user, token } = response.data;

      const appUser: User = {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: 'driver' // Newly signed up users are drivers
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          AuthService.STORAGE_KEY,
          JSON.stringify({
            authenticated: true,
            token,
            userId: appUser.id,
            email: appUser.email,
            name: appUser.name,
            role: appUser.role
          })
        );
      }

      return {
        success: true,
        user: appUser
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Signup failed. Email might already be taken.'
      };
    }
  }

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
        name: session.name || 'SmartPark User',
        role: session.role || 'driver'
      };
    } catch {
      return null;
    }
  }

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

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.STORAGE_KEY);
    }
  }
}

export const authService = new AuthService();
