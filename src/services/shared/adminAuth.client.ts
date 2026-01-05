'use client';
import { AuthSession } from "@/types/type/auth/auth";
import { getAuthToken } from "./getAuthToken";

export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';

  const token = getAuthToken();
  return token ?? '';
}

export function requireAdminToken(): string {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Missing admin token');
  }
  return token;
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const token = getAuthToken();
  const role = localStorage.getItem('role') as AuthSession['role'] | null;

  if (!token || !role) return null;

  return { token, role };
}
