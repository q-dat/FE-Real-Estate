import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { getWithFallback } from './shared/getWithFallback';

type CacheEntry = {
  data: IRentalPostAdmin[];
  timestamp: number;
};

const cache: CacheEntry = {
  data: [],
  timestamp: 0,
};

// --- Cleanup cache cũ (>5 phút) mỗi 1 phút ---
const CACHE_CLEANUP_INTERVAL = 60_000; // 1 phút
const CACHE_MAX_AGE = 5 * 60_000; // 5 phút
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (Date.now() - cache.timestamp > CACHE_MAX_AGE) {
      cache.data = [];
      cache.timestamp = 0;
    }
  }, CACHE_CLEANUP_INTERVAL);
}

export const rentalPostAdminService = {
  async getAll(params?: Record<string, string | number>): Promise<IRentalPostAdmin[]> {
    // Nếu cache còn hiệu lực 60s thì trả về cache
    if (cache.data.length > 0 && Date.now() - cache.timestamp < 60_000) {
      return cache.data;
    }

    const baseUrl = getServerApiUrl('api/rental-admin-posts');
    let apiUrl = baseUrl;

    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      apiUrl += '?' + queryString;
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }, // ISR 60s
    });

    if (!res.ok) throw new Error(`Fetch lỗi: ${res.status}`);

    const data = await res.json();
    cache.data = data?.rentalPosts ?? [];
    cache.timestamp = Date.now();

    return cache.data;
  },

  async getById(id: string): Promise<IRentalPostAdmin | null> {
    // Tìm trong cache trước
    const cached = cache.data.find((p) => p._id === id);
    if (cached) return cached;

    // Nếu không có trong cache thì gọi API riêng
    const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.rentalPost ?? null;
  },

  async getFallback(id: string): Promise<IRentalPostAdmin | null> {
    return getWithFallback<IRentalPostAdmin>(id, this.getAll, this.getById);
  },

  async create(data: FormData) {
    const res = await fetch(getServerApiUrl('api/rental-admin-post'), {
      method: 'POST',
      body: data,
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
    cache.data = []; // reset cache sau create
    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });
    return res.json();
  },

  async update(id: string, data: FormData) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'PUT',
      body: data,
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
    cache.data = []; // reset cache
    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
    cache.data = []; // reset cache
    await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });
    return res.json();
  },
};
