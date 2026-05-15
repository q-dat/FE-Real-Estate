import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { adminFetch } from '../shared/adminFetch.client';
import { getWithFallback } from '../shared/getWithFallback';

export type RentalPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RentalPostAdminListResponse = {
  message: string;
  count: number;
  visibleCount: number;
  pagination: RentalPaginationMeta;
  rentalPosts: IRentalPostAdmin[];
};

type CacheState = {
  list: IRentalPostAdmin[];
  byId: Map<string, IRentalPostAdmin>;
};

const EMPTY_PAGINATION: RentalPaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const cache: CacheState = {
  list: [],
  byId: new Map(),
};

const buildQueryString = (params?: Record<string, string | number | undefined>): string => {
  if (!params) return '';

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

const rentalPostAdminService = {
  async getMyPosts(params?: Record<string, string | number | undefined>): Promise<RentalPostAdminListResponse> {
    const apiUrl = `${getServerApiUrl('api/rental-posts/me')}${buildQueryString(params)}`;

    const res = await adminFetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Admin getMyPosts failed: ${res.status}`);
    }

    const data = (await res.json()) as Partial<RentalPostAdminListResponse>;

    const rentalPosts = Array.isArray(data.rentalPosts) ? data.rentalPosts : [];

    return {
      message: data.message ?? '',
      count: typeof data.count === 'number' ? data.count : rentalPosts.length,
      visibleCount: typeof data.visibleCount === 'number' ? data.visibleCount : rentalPosts.length,
      pagination: data.pagination ?? {
        ...EMPTY_PAGINATION,
        total: rentalPosts.length,
        totalPages: rentalPosts.length > 0 ? 1 : 0,
      },
      rentalPosts,
    };
  },

  async getAll(params?: Record<string, string | number>) {
    const hasFilter = params && Object.keys(params).length > 0;

    let apiUrl = getServerApiUrl('api/rental-admin-posts');

    if (hasFilter) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([k, v]) => {
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

    const list: IRentalPostAdmin[] = data.rentalPosts ?? [];

    if (!hasFilter) {
      cache.list = list;

      cache.byId.clear();
      list.forEach((item) => {
        if (item._id) cache.byId.set(item._id, item);
      });
    }

    return list;
  },

  async getByCode(code: string): Promise<IRentalPostAdmin | null> {
    if (!code) return null;

    const apiUrl = getServerApiUrl(`api/rental-admin-posts?code=${encodeURIComponent(code)}`);

    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      rentalPosts?: IRentalPostAdmin[];
    };

    return data.rentalPosts?.[0] ?? null;
  },

  async getById(id: string): Promise<IRentalPostAdmin | null> {
    const cachedItem = cache.byId.get(id);

    if (cachedItem) {
      return cachedItem;
    }

    try {
      const apiUrl = getServerApiUrl(`api/rental-admin-post/${id}`);

      const res = await fetch(apiUrl, {
        next: { revalidate: 60 },
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        rentalPost?: IRentalPostAdmin;
      };

      const item = data.rentalPost ?? null;

      if (item) {
        cache.byId.set(item._id, item);
      }

      return item;
    } catch (error) {
      console.error('GetById Error:', error);
      return null;
    }
  },

  async getFallback(id: string): Promise<IRentalPostAdmin | null> {
    return getWithFallback<IRentalPostAdmin>(id, this.getAll.bind(this), this.getById.bind(this));
  },

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

  async handlePostMutation() {
    this.resetLocalCache();

    try {
      await fetch('/api/revalidate/rental-admin-posts', { method: 'POST' });
    } catch (error) {
      console.warn('Revalidate trigger warning:', error);
    }
  },

  resetLocalCache() {
    cache.list = [];
    cache.byId.clear();
  },

  async importRentalPost(items: unknown[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Import data must be non-empty array');
    }

    const res = await fetch(getServerApiUrl('api/rental-admin-posts/import'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Import Error: ${res.status} - ${text}`);
    }

    await this.handlePostMutation();

    return res.json() as Promise<{
      success: number;
      updated: number;
      failed: number;
      errors: string[];
    }>;
  },
};

export { rentalPostAdminService };
