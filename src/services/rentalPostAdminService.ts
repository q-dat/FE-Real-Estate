import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

// Bộ nhớ cache tạm thời trong runtime server
type CacheEntry = { data: IRentalPostAdmin[]; timestamp: number };
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export const rentalPostAdminService = {
  // Helper: Invalidate cache khi có thay đổi dữ liệu
  invalidateCache() {
    for (const key in cache) {
      delete cache[key];
    }
  },

  // GET ALL
  async getAll(): Promise<IRentalPostAdmin[]> {
    const apiUrl = `${getServerApiUrl('api/rental-admin-posts')}`;
    const now = Date.now();

    const cached = cache[apiUrl];
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const res = await fetch(apiUrl, {
        cache: 'force-cache',
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const data = await res.json();

      let posts: IRentalPostAdmin[] = [];
      if (Array.isArray(data)) posts = data;
      else if (Array.isArray(data.rentalPosts)) posts = data.rentalPosts;
      else if (Array.isArray(data.data)) posts = data.data;
      else {
        console.warn('Dữ liệu rental-admin-posts không hợp lệ:', data);
      }

      cache[apiUrl] = { data: posts, timestamp: now };
      return posts;
    } catch (error) {
      console.error('Lỗi khi tải danh sách bài đăng:', error);
      return cache[apiUrl]?.data || [];
    }
  },

  // GET BY ID
  getById: async (id: string): Promise<IRentalPostAdmin | null> => {
    try {
      const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
      const data = await res.json();

      return data?.rentalPost || data?.data || data?.post || null;
    } catch (error) {
      console.error('Lỗi khi tải bài đăng:', error);
      return null;
    }
  },

  // CREATE
  async create(data: FormData) {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-admin-post')}`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const result = await res.json();
      this.invalidateCache(); // Xoá cache cũ ngay sau khi tạo
      return result;
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      throw error;
    }
  },

  // UPDATE
  async update(id: string, data: FormData) {
    try {
      const res = await fetch(`${getServerApiUrl(`api/rental-admin-post/${id}`)}`, {
        method: 'PUT',
        body: data,
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const result = await res.json();
      this.invalidateCache(); // Xoá cache sau khi cập nhật
      return result;
    } catch (error) {
      console.error('Lỗi khi cập nhật bài đăng:', error);
      throw error;
    }
  },

  // DELETE
  async delete(id: string) {
    try {
      const res = await fetch(`${getServerApiUrl(`api/rental-admin-post/${id}`)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const result = await res.json();
      this.invalidateCache(); // Xoá cache sau khi xoá
      return result;
    } catch (error) {
      console.error('Lỗi khi xoá bài đăng:', error);
      throw error;
    }
  },
};
