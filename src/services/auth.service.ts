import { getServerApiUrl } from '@/hooks/useApiUrl';
import { LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types/type/auth/auth';

const apiUrl = getServerApiUrl('api/auth');

export const authService = {
  register: async (payload: RegisterPayload) => {
    const res = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  login: async (payload: LoginPayload) => {
    const res = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateProfile: async (payload: UpdateProfilePayload, token: string) => {
    const formData = new FormData();

    if (payload.avatar) formData.append('avatar', payload.avatar);
    if (payload.phoneNumber) formData.append('phoneNumber', payload.phoneNumber);
    if (payload.zaloNumber) formData.append('zaloNumber', payload.zaloNumber);

    const res = await fetch(`${apiUrl}/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
};
