import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

type PostCacheEntry = { data: IRentalPostAdmin[]; timestamp: number };
const postCache: Record<string, PostCacheEntry> = {};

type PostDetailCacheEntry = { data: IRentalPostAdmin; timestamp: number };
const postDetailCache: Record<string, PostDetailCacheEntry> = {};

export const rentalPostAdminService = {
  invalidateCache() {
    for (const key in postCache) delete postCache[key];
    for (const key in postDetailCache) delete postDetailCache[key];
  },

  logCache() {
    console.log('[RentalPost Cache Snapshot]:', postCache);

    // Nếu bạn muốn log chi tiết từng key
    Object.entries(postCache).forEach(([key, entry]) => {
      console.log(`➡️ Cache Key: ${key}`);
      console.log(`   Timestamp: ${new Date(entry.timestamp).toLocaleTimeString()}`);
      console.log(`   Cached items: ${entry.data.length}`);
    });
  },

  async getAll(params?: Record<string, string | number>): Promise<IRentalPostAdmin[]> {
    const baseUrl = getServerApiUrl('api/rental-admin-posts');

    let apiUrl = baseUrl;
    if (params && Object.keys(params).length > 0) {
      apiUrl += '?' + new URLSearchParams(params as Record<string, string>).toString();
    }

    const res = await fetch(apiUrl, {
      // Nếu bạn muốn theo revalidate của page thì bỏ next:
      // next: { revalidate: 300 },  // tuỳ chỉnh nếu muốn
    });

    if (!res.ok) throw new Error(`Fetch bài đăng lỗi: ${res.status}`);

    const data = await res.json();
    return data?.rentalPosts ?? data?.data ?? (Array.isArray(data) ? data : []);
  },

  // DETAIL – để Next quản lý cache (Cách A)
  async getById(id: string): Promise<IRentalPostAdmin | null> {
    const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);

    const res = await fetch(apiUrl, {
      // Không dùng no-store
      // Next sẽ cache theo revalidate của page hoặc bạn có thể set riêng:
      // next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.rentalPost || data?.data || null;
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
