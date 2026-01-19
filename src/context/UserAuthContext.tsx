'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MeResponse } from '@/types/type/auth/auth';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: MeResponse['data'] | null;
  loading: boolean;
  logout: () => void;
}

const UserAuthContext = createContext<AuthState | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me(token)
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return <UserAuthContext.Provider value={{ user, loading, logout }}>{children}</UserAuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
