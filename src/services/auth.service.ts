import { getServerApiUrl } from '@/hooks/useApiUrl';
import { LoginPayload, RegisterPayload, UpdateProfilePayload, AuthResponse, ProfileResponse, MeResponse } from '@/types/type/auth/auth';

const apiUrl = getServerApiUrl('api/auth');

export const authService = {
  me: async (token: string): Promise<MeResponse> => {
    const res = await fetch(`${apiUrl}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  verifyEmail: async (email: string, otp: string) => {
    const res = await fetch(`${apiUrl}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  resetPassword: async (email: string) => {
    const res = await fetch(`${apiUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  changePassword: async (oldPassword: string, newPassword: string, token: string) => {
    const res = await fetch(`${apiUrl}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
  updateProfile: async (payload: UpdateProfilePayload, token: string): Promise<ProfileResponse> => {
    const formData = new FormData();

    // avatar upload riêng
    if (payload.profile.avatar) {
      formData.append('avatar', payload.profile.avatar);
    }

    // profile fields
    const profile = payload.profile;

    if (profile.displayName) formData.append('displayName', profile.displayName);
    if (profile.username) formData.append('username', profile.username);
    if (profile.aboutMe) formData.append('aboutMe', profile.aboutMe);

    if (profile.instagram) formData.append('instagram', profile.instagram);
    if (profile.messenger) formData.append('messenger', profile.messenger);
    if (profile.facebook) formData.append('facebook', profile.facebook);

    if (profile.phoneNumber) formData.append('phoneNumber', profile.phoneNumber);
    if (profile.zaloNumber) formData.append('zaloNumber', profile.zaloNumber);
    if (profile.viberNumber) formData.append('viberNumber', profile.viberNumber);

    const res = await fetch(`${apiUrl}/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw await res.json();
    }

    return res.json();
  },
  confirmResetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${apiUrl}/confirm-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
};
