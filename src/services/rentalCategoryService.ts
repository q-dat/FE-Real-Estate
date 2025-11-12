import makeCacheKey from '@/helper/makeCacheKey';
import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';

// Bộ nhớ cache tạm runtime (server hoặc client)
type CategoryCacheEntry = { data: IRentalCategory[]; timestamp: number };
const categoryCache: Record<string, CategoryCacheEntry> = {};
const CATEGORY_CACHE_TTL = 60_000; // 1 phút

export const rentalCategoryService = {
  invalidateCache() {
    for (const key in categoryCache) delete categoryCache[key];
  },

  async getAll(params?: Record<string, string | number>): Promise<IRentalCategory[]> {
    const baseUrl = getServerApiUrl('api/rental-categories');
    const cacheKey = makeCacheKey(baseUrl, params);
    const now = Date.now();

    const cached = categoryCache[cacheKey];
    if (cached && now - cached.timestamp < CATEGORY_CACHE_TTL) {
      return cached.data;
    }

    // Build query đúng cách
    let apiUrl = baseUrl;
    if (params && Object.keys(params).length > 0) {
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      apiUrl += `?${query}`;
    }

    // console.log('➡️ Fetch danh mục:', apiUrl);

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Fetch danh mục lỗi: ${res.status}`);

      const data = await res.json();
      const categories = Array.isArray(data) ? data : (data?.rentalCategories ?? []);

      categoryCache[cacheKey] = { data: categories, timestamp: now };
      return categories;
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
      return cached?.data ?? [];
    }
  },
  // CREATE
  async create(data: FormData) {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-category')}`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Tạo danh mục thất bại: ${res.status} - ${errText}`);
      }

      const result = await res.json();
      this.invalidateCache(); // Xoá cache sau khi tạo
      return result;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      throw error;
    }
  },

  // UPDATE
  async update(id: string, data: FormData) {
    try {
      const res = await fetch(`${getServerApiUrl(`api/rental-category/${id}`)}`, {
        method: 'PUT',
        body: data,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cập nhật danh mục thất bại: ${res.status} - ${errText}`);
      }

      const result = await res.json();
      this.invalidateCache(); // Xoá cache sau khi cập nhật
      return result;
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      throw error;
    }
  },

  // DELETE
  async delete(id: string) {
    try {
      const res = await fetch(`${getServerApiUrl(`api/rental-category/${id}`)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
      }

      const result = await res.json();
      this.invalidateCache(); // Xoá cache sau khi xoá
      return result;
    } catch (error) {
      console.error('Lỗi khi xoá danh mục:', error);
      throw error;
    }
  },
};
