import Cookies from 'js-cookie';
import { API_URL } from '../config';

const TOKEN_KEY = 'token';

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token);
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to login');
  }

  return res.json();
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to register');
  }

  return res.json();
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    removeToken();
    return null;
  }

  return response.json();
}

export async function updateProfile(data: { name: string }) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const response = await fetch(`${API_URL}/auth/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }

  return response.json();
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to process forgot password request');
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to reset password');
  }
} 
