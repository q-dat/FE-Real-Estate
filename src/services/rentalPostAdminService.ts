import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { getWithFallback } from './shared/getWithFallback';

export const rentalPostAdminService = {
  async getAll(params?: Record<string, string | number>) {
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
      next: {
        tags: ['rental-admin-posts'],
      },
    });

    if (!res.ok) throw new Error(`Fetch lỗi: ${res.status}`);

    const data = await res.json();
    return data?.rentalPosts ?? [];
  },
  async getById(id: string) {
    const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);

    const res = await fetch(apiUrl, {
      next: {
        tags: [`rental-admin-post-${id}`, 'rental-admin-posts'],
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.rentalPost ?? null;
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

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });

    return res.json();
  },
  async update(id: string, data: FormData) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'PUT',
      body: data,
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });

    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });

    return res.json();
  },
};
