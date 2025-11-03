import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';

// Bộ nhớ cache tạm runtime (server hoặc client)
type CacheEntry = { data: IRentalCategory[]; timestamp: number };
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export const rentalCategoryService = {
  // Xóa cache khi có thay đổi dữ liệu
  invalidateCache() {
    for (const key in cache) {
      delete cache[key];
    }
  },

  // GET ALL
  async getAll(): Promise<IRentalCategory[]> {
    const apiUrl = `${getServerApiUrl('api/rental-categories')}`;
    const now = Date.now();

    // Dùng cache nếu còn hạn
    const cached = cache[apiUrl];
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Không thể tải danh mục (${res.status} ${res.statusText})`);
      }

      const data = await res.json();

      let categories: IRentalCategory[] = [];
      if (Array.isArray(data)) {
        categories = data;
      } else if (data && Array.isArray(data.rentalCategories)) {
        categories = data.rentalCategories;
      } else {
        console.warn('Dữ liệu danh mục không hợp lệ:', data);
      }

      // Lưu cache mới
      cache[apiUrl] = { data: categories, timestamp: now };
      return categories;
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      return cache[apiUrl]?.data || []; // fallback cache nếu có
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
