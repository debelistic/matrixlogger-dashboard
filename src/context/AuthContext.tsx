'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  // Add more fields as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from cookie on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const res = await api.getCurrentUser();
      if (res && res.user) setUser(res.user);
      setLoading(false);
    }
    loadUser();
  }, []);

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

  function logout() {
    api.removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 
