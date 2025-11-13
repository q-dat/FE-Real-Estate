import makeCacheKey from '@/helper/makeCacheKey';
import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

type PostCacheEntry = { data: IRentalPostAdmin[]; timestamp: number };
const postCache: Record<string, PostCacheEntry> = {};

type PostDetailCacheEntry = { data: IRentalPostAdmin; timestamp: number };
const postDetailCache: Record<string, PostDetailCacheEntry> = {};

const POST_CACHE_TTL = 60_000; // 1 phút

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
    const cacheKey = makeCacheKey(baseUrl, params);

    const now = Date.now();
    const cached = postCache[cacheKey];
    if (cached && now - cached.timestamp < POST_CACHE_TTL) {
      return cached.data;
    }

    let apiUrl = baseUrl;
    if (params && Object.keys(params).length > 0) {
      apiUrl += '?' + new URLSearchParams(params as Record<string, string>).toString();
    }

    // console.log('➡️ Fetch bài đăng:', apiUrl);

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Fetch bài đăng lỗi: ${res.status}`);

      const data = await res.json();
      const posts = data?.rentalPosts ?? data?.data ?? (Array.isArray(data) ? data : []);
      postCache[cacheKey] = { data: posts, timestamp: now };
      return posts;
    } catch (err) {
      console.error('Lỗi tải bài đăng:', err);
      return cached?.data ?? [];
    }
  },

  // GET BY ID
  getById: async (id: string): Promise<IRentalPostAdmin | null> => {
    try {
      const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);
      console.log('Fetching post detail:', apiUrl);

      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

      const data = await res.json();
      console.log('➡️ API Response (getById):', data);

      const post = data?.rentalPost || data?.data || data?.post || data || null;

      if (post) {
        postCache[apiUrl] = { data: [post], timestamp: Date.now() };
      } else {
        console.warn('⚠️ API không trả dữ liệu hợp lệ:', data);
      }

      return post;
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
