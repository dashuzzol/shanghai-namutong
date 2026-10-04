export interface AdminUser {
  username: string;
  role: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: AdminUser;
}

const TOKEN_KEY = 'cd_admin_auth_token';
const USER_KEY = 'cd_admin_auth_user';

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string, user: AdminUser): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also save in localStorage for persistence across browser tabs
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to clear admin session', e);
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getStoredAdminToken();
  return Boolean(token && token.trim().length > 0);
}

export async function loginAdmin(username: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      saveAdminSession(data.token, data.user || { username, role: 'admin' });
      return {
        success: true,
        user: data.user,
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid username or password. Please try again.',
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      message: 'Unable to connect to login server. Please try again.',
    };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getStoredAdminToken();
  if (!token) return false;

  try {
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        return true;
      }
    }

    // Token invalid or expired
    clearAdminSession();
    return false;
  } catch {
    // If offline or network error, trust active session token if present
    return true;
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredAdminToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearAdminSession();
}
