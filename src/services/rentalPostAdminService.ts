import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

// Bộ nhớ tạm cache trong runtime server
type CacheEntry = { data: IRentalPostAdmin[]; timestamp: number };
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export const rentalPostAdminService = {
  
  // GET ALL
  getAll: async (): Promise<IRentalPostAdmin[]> => {
    const apiUrl = `${getServerApiUrl('api/rental-admin-posts')}`;
    const now = Date.now();

    // Nếu có cache còn hiệu lực
    const cached = cache[apiUrl];
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const data = await res.json();

      // Xử lý nhiều dạng phản hồi khác nhau từ BE
      let posts: IRentalPostAdmin[] = [];
      if (Array.isArray(data)) posts = data;
      else if (Array.isArray(data.rentalPosts)) posts = data.rentalPosts;
      else if (Array.isArray(data.data)) posts = data.data;
      else {
        console.warn('Dữ liệu rental-admin-posts không hợp lệ:', data);
        posts = [];
      }

      // Lưu cache
      cache[apiUrl] = { data: posts, timestamp: now };
      return posts;
    } catch (error) {
      console.error('Lỗi khi tải danh sách bài đăng:', error);
      return cache[apiUrl]?.data || []; // fallback cache nếu có
    }
  },

  
  // GET BY ID
  getById: async (id: string): Promise<IRentalPostAdmin | null> => {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-admin-post/${id}')}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
      const data = await res.json();

      if (data && typeof data === 'object' && (data.data || data.post)) {
        return data.data || data.post;
      }

      console.warn('Dữ liệu bài đăng không hợp lệ:', data);
      return null;
    } catch (error) {
      console.error('Lỗi khi tải bài đăng:', error);
      return null;
    }
  },

  
  // CREATE
  create: async (data: FormData) => {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-admin-post')}`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      throw error;
    }
  },

  
  // UPDATE
  update: async (id: string, data: FormData) => {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-admin-post/${id}')}`, {
        method: 'PUT',
        body: data,
      });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (error) {
      console.error('Lỗi khi cập nhật bài đăng:', error);
      throw error;
    }
  },

  
  // DELETE
  delete: async (id: string) => {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-admin-post/${id}')}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (error) {
      console.error('Lỗi khi xoá bài đăng:', error);
      throw error;
    }
  },
};
