import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { getWithFallback } from './shared/getWithFallback';

// Type Definitions ---
type CacheState = {
  list: IRentalPostAdmin[];
  byId: Map<string, IRentalPostAdmin>;
};

// Singleton Cache State ---
// Cache này sẽ tồn tại trong memory của server (nếu chạy server-side) hoặc browser (nếu client-side)
// Lưu ý: Với Server Components, cache này chỉ sống trong vòng đời của request hoặc lambda instance
const cache: CacheState = {
  list: [],
  byId: new Map(),
};

const rentalPostAdminService = {
  /**
   * Lấy danh sách bài đăng.
   * - Logic: Luôn fetch "no-store" để lấy dữ liệu mới nhất từ DB.
   * - Sau khi lấy xong: Cập nhật vào RAM Cache để getById dùng lại.
   */
  async getAll(params?: Record<string, string | number>) {
    const hasFilter = params && Object.keys(params).length > 0;

    let apiUrl = getServerApiUrl('api/rental-admin-posts');

    if (hasFilter) {
      const query = new URLSearchParams();
      Object.entries(params!).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.set(k, String(v));
        }
      });
      apiUrl += `?${query.toString()}`;
    }

    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`GetAll failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      rentalPosts?: IRentalPostAdmin[];
    };

    console.log('API', apiUrl);

    const list: IRentalPostAdmin[] = data.rentalPosts ?? [];

    // Nếu không có filter (tức là lấy toàn bộ danh sách gốc), ta mới update Cache
    if (!hasFilter) {
      cache.list = list;

      // Update Map để truy xuất O(1)
      cache.byId.clear();
      list.forEach((item) => {
        if (item._id) cache.byId.set(item._id, item);
      });
    }

    return list;
  },

  /**
   * Lấy chi tiết bài đăng.
   * - Ưu tiên 1: Lấy ngay từ RAM Cache (nếu người dùng vừa vào trang List xong).
   * - Ưu tiên 2: Gọi API (nếu reload trang detail hoặc cache rỗng).
   */
  async getById(id: string): Promise<IRentalPostAdmin | null> {
    // 1. Check RAM Cache
    const cachedItem = cache.byId.get(id);
    if (cachedItem) {
      return cachedItem;
    }

    // 2. Nếu không có trong cache, gọi API
    try {
      const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);
      const res = await fetch(apiUrl, {
        next: { revalidate: 60 }, // Cache nhẹ 60s cho trường hợp gọi lẻ
      });

      if (!res.ok) return null;

      const data = await res.json();
      const item = data?.rentalPost ?? null;

      // Cập nhật ngược lại vào Cache nếu tìm thấy
      if (item) {
        cache.byId.set(item._id, item);
      }

      return item;
    } catch (error) {
      console.error('GetById Error:', error);
      return null;
    }
  },

  /**
   * Fallback pattern
   */
  async getFallback(id: string): Promise<IRentalPostAdmin | null> {
    return getWithFallback<IRentalPostAdmin>(id, this.getAll.bind(this), this.getById.bind(this));
  },

  // Mutations ---

  async create(formData: FormData) {
    const res = await fetch(getServerApiUrl('api/rental-admin-post'), {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Create Error: ${res.status}`);

    await this.handlePostMutation();
    return res.json();
  },

  async update(id: string, formData: FormData) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error(`Update Error: ${res.status}`);

    await this.handlePostMutation();
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/rental-admin-post/${id}`), {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Delete Error: ${res.status}`);

    await this.handlePostMutation();
    return res.json();
  },

  /**
   * Xóa cache local và gọi revalidate server
   */
  async handlePostMutation() {
    this.resetLocalCache();
    try {
      await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });
    } catch (e) {
      console.warn('Revalidate trigger warning:', e);
    }
  },

  resetLocalCache() {
    cache.list = [];
    cache.byId.clear();
  },
};

export { rentalPostAdminService };
