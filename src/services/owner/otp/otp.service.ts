import { getServerApiUrl } from '@/hooks/useApiUrl';
import { adminFetch } from '@/services/shared/adminFetch.client';
import { OtpItem } from '@/types/auth/otp.types';

export const otpService = {
  getAll: async (): Promise<{ data: OtpItem[] }> => {
    const res = await adminFetch(getServerApiUrl('api/auth/owner/otps'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },
};
