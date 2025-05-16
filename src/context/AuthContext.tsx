'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  // Add more fields as needed
}

interface ProfileUpdateData {
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
  setUser: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        const data = await api.getCurrentUser();
        if (data?.user) {
          setUser(data.user);
          setError(null);
        } else {
          // Clear user state if no user data
          setUser(null);
          api.removeToken();
        }
        break;
      } catch (error) {
        console.error('Auth check failed:', error);
        retries--;
        if (retries === 0) {
          // Clear user state on final retry failure
          setUser(null);
          api.removeToken();
          setError('Authentication failed. Please log in again.');
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setLoading(false);
      }
    }
  };

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await api.login(email, password);
      api.setToken(token);
      setUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await api.register(name, email, password);
      api.setToken(token);
      setUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const logout = () => {
    setUser(null);
    api.removeToken();
    router.push('/auth/login');
  };

  async function updateProfile(data: ProfileUpdateData) {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    setLoading(true);
    setError(null);
    try {
      await api.updatePassword(currentPassword, newPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      updateProfile,
      updatePassword,
      setUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 
