import { getServerApiUrl } from '@/hooks/useApiUrl';
import { getWithFallback } from '../shared/getWithFallback';
import { IInterior } from '@/types/interiors/interiors.types';

// Cache Types ---
type CacheState = {
  list: IInterior[];
  byId: Map<string, IInterior>;
};

// RAM Cache ---
const cache: CacheState = {
  list: [],
  byId: new Map(),
};

const interiorService = {
  /**
   * Lấy toàn bộ danh sách thiết kế nội thất.
   * - fetch mode "no-store" để luôn lấy dữ liệu mới nhất.
   * - Nếu không có params: update RAM Cache.
   */
  async getAll(params?: Record<string, string | number>): Promise<IInterior[]> {
    const hasFilter = params && Object.keys(params).length > 0;

    let apiUrl = getServerApiUrl('api/interiors');

    if (hasFilter) {
      const query = new URLSearchParams();
      Object.entries(params!).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
      apiUrl += `?${query.toString()}`;
    }

    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`GetAll Failed: ${res.status}`);
    }

    const data = await res.json();
    const list: IInterior[] = data?.interiors ?? [];

    if (!hasFilter) {
      cache.list = list;

      cache.byId.clear();
      list.forEach((item) => {
        if (item._id) cache.byId.set(item._id, item);
      });
    }

    return list;
  },

  /**
   * Lấy chi tiết thiết kế nội thất.
   * - Ưu tiên lấy từ RAM Cache.
   * - Nếu không có, gọi API và lưu lại vào cache.
   */
  async getById(id: string): Promise<IInterior | null> {
    const cached = cache.byId.get(id);
    if (cached) {
      return cached;
    }

    try {
      const apiUrl = getServerApiUrl(`api/interior/${id}`);
      const res = await fetch(apiUrl, {
        next: { revalidate: 60 },
      });

      if (!res.ok) return null;

      const data = await res.json();
      const item: IInterior | null = data?.interior ?? null;

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
   * Fallback Pattern
   */
  async getFallback(id: string): Promise<IInterior | null> {
    return getWithFallback<IInterior>(id, this.getAll.bind(this), this.getById.bind(this));
  },

  // Mutations ----------------------------------

  async create(formData: FormData) {
    const res = await fetch(getServerApiUrl('api/interior'), {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Create Error: ${res.status}`);
    }

    // await this.handlePostMutation();
    return res.json();
  },

  async update(id: string, formData: FormData) {
    const res = await fetch(getServerApiUrl(`api/interior/${id}`), {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Update Error: ${res.status}`);
    }

    // await this.handlePostMutation();
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/interior/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Delete Error: ${res.status}`);
    }

    // await this.handlePostMutation();
    return res.json();
  },

  /**
   * Reset cache + Trigger revalidate route
   */
  //   async handlePostMutation() {
  //     this.resetLocalCache();
  //     try {
  //       await fetch('/api/revalidate/interiors', { method: 'POST' });
  //     } catch (error) {
  //       console.warn('Revalidate Warning:', error);
  //     }
  //   },

  resetLocalCache() {
    cache.list = [];
    cache.byId.clear();
  },
};

export { interiorService };
