'use client';
import { createContext, useContext } from 'react';
import { MeResponse } from '@/types/auth/auth.types';

interface AdminAuthContextValue {
  user: MeResponse['data'];
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const useAdminAuth = (): AdminAuthContextValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
};

export const AdminAuthProvider = AdminAuthContext.Provider;
