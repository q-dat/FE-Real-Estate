import { getServerApiUrl } from '@/hooks/useApiUrl';
import { adminFetch } from '../shared/adminFetch.client';

export type UserRole = 'user' | 'admin' | 'owner';

export interface UserItem {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
const apiUrl = getServerApiUrl('api/auth/owner');

export const userService = {
  getAll: async (): Promise<{ data: UserItem[] }> => {
    const res = await adminFetch(`${apiUrl}/users`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateRole: async (id: string, role: UserRole) => {
    const res = await adminFetch(`${apiUrl}/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateActive: async (id: string, isActive: boolean) => {
    const res = await adminFetch(`${apiUrl}/${id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
};
