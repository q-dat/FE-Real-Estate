'use client';
import { AuthSession } from "@/types/type/auth/auth";
import { getAuthToken } from "./getAuthToken";

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const token = getAuthToken();
  const role = localStorage.getItem('role') as AuthSession['role'] | null;

  if (!token || !role) return null;

  return { token, role };
}
