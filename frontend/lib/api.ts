const BASE_URL = 'http://localhost:8001';

class ApiClient {
  private static AUTH_KEY = 'smartpark_auth_session';

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ApiClient.AUTH_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      return session.token || null;
    } catch {
      return null;
    }
  }

  public getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ApiClient.AUTH_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      return session.userId || null;
    } catch {
      return null;
    }
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${BASE_URL}${path}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (response.status === 401) {
        // Clear session on unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ApiClient.AUTH_KEY);
          // Redirect to login if on client-side
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
        throw new Error('Unauthorized');
      }

      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error?.message || `HTTP error ${response.status}`);
      }

      return json;
    } catch (err: any) {
      console.error(`API Error on ${method} ${path}:`, err);
      throw err;
    }
  }

  public get(path: string) {
    return this.request('GET', path);
  }

  public post(path: string, body?: any) {
    return this.request('POST', path, body);
  }

  public put(path: string, body?: any) {
    return this.request('PUT', path, body);
  }

  public delete(path: string) {
    return this.request('DELETE', path);
  }
}

export const api = new ApiClient();
