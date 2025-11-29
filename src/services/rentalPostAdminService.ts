import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { getWithFallback } from './shared/getWithFallback';

export const rentalPostAdminService = {
  async getAll(params?: Record<string, string | number>): Promise<IRentalPostAdmin[]> {
    const baseUrl = getServerApiUrl('api/rental-admin-posts');

    let apiUrl = baseUrl;
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      apiUrl += '?' + queryString;
    }

    // console.log('Final API URL:', apiUrl);

    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Fetch lỗi: ${res.status}`);

    const data = await res.json();
    return data?.rentalPosts ?? data?.data ?? (Array.isArray(data) ? data : []);
  },

  async getById(id: string): Promise<IRentalPostAdmin | null> {
    const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);

    const res = await fetch(apiUrl, {
      // Không dùng no-store → cho phép Next.js cache
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.rentalPost ?? data?.data ?? null;
  },

  async getFallback(id: string): Promise<IRentalPostAdmin | null> {
    return getWithFallback<IRentalPostAdmin>(
      id,
      () => this.getAll(),
      (postId) => this.getById(postId)
    );
  },

  async create(data: FormData) {
    const res = await fetch(getServerApiUrl('api/rental-admin-post'), {
      method: 'POST',
      body: data,
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    return res.json();
  },

  async update(id: string, data: FormData) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'PUT',
      body: data,
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    return res.json();
  },
};
