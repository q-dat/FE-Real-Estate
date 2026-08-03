import { cache as reactCache } from 'react';

import { getServerApiUrl } from '@/hooks/useApiUrl';
import { fetchData } from '@/server/dataSource';
import type { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import type { RentalPaginationMeta, RentalPostAdminListResponse } from '@/types/rentalAdmin/rentalPagination.types';

import { adminFetch } from '../shared/adminFetch.client';

type RentalListParams = Record<string, string | number | undefined>;

type CacheState = {
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
  byId: new Map<string, IRentalPostAdmin>(),
};

const buildQueryString = (params?: RentalListParams): string => {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

const normalizeListResponse = (data: Partial<RentalPostAdminListResponse>): RentalPostAdminListResponse => {
  const rentalPosts = Array.isArray(data.rentalPosts) ? data.rentalPosts : [];

  const count = typeof data.count === 'number' ? data.count : rentalPosts.length;

  const visibleCount = typeof data.visibleCount === 'number' ? data.visibleCount : rentalPosts.length;

  const pagination = data.pagination ?? {
    ...EMPTY_PAGINATION,
    total: count,
    totalPages: count > 0 ? 1 : 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    message: data.message ?? '',
    count,
    visibleCount,
    pagination,
    rentalPosts,
  };
};

const fetchRentalPostAdminList = async (params?: RentalListParams): Promise<RentalPostAdminListResponse> => {
  const queryString = buildQueryString(params);

  return fetchData<RentalPostAdminListResponse>(`/api/rental-admin-posts${queryString}`);
};

const fetchRentalPostById = async (id: string): Promise<IRentalPostAdmin | null> => {
  if (!id) {
    return null;
  }

  const cachedItem = cache.byId.get(id);

  if (cachedItem) {
    return cachedItem;
  }

  try {
    const data = await fetchData<{
      rentalPost?: IRentalPostAdmin;
    }>(`/api/rental-admin-post/${encodeURIComponent(id)}`);

    const item = data.rentalPost ?? null;

    if (item?._id) {
      cache.byId.set(item._id, item);
    }

    return item;
  } catch (error) {
    console.error('Get rental post by id error:', error);
    return null;
  }
};

const getDetailByIdCached = reactCache(async (id: string): Promise<IRentalPostAdmin | null> => {
  return fetchRentalPostById(id);
});

const rentalPostAdminService = {
  /**
   * Lấy đầy đủ response danh sách:
   * count, visibleCount, pagination và rentalPosts.
   */
  async getList(params?: RentalListParams): Promise<RentalPostAdminListResponse> {
    return fetchRentalPostAdminList(params);
  },

  /**
   * Giữ lại cho những nơi cũ chỉ cần mảng bài đăng.
   */
  async getAll(params?: RentalListParams): Promise<IRentalPostAdmin[]> {
    const data = await fetchRentalPostAdminList(params);
    const list = data.rentalPosts;

    const hasFilter = params !== undefined && Object.keys(params).length > 0;

    if (!hasFilter) {
      cache.byId.clear();

      list.forEach((item) => {
        if (item._id) {
          cache.byId.set(item._id, item);
        }
      });
    }

    return list;
  },

  async getMyPosts(params?: RentalListParams): Promise<RentalPostAdminListResponse> {
    const apiUrl = `${getServerApiUrl('api/rental-posts/me')}${buildQueryString(params)}`;

    const response = await adminFetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Admin getMyPosts failed: ${response.status}`);
    }

    const data = (await response.json()) as Partial<RentalPostAdminListResponse>;

    return normalizeListResponse(data);
  },

  async getByCode(code: string): Promise<IRentalPostAdmin | null> {
    if (!code) {
      return null;
    }

    try {
      const data = await fetchRentalPostAdminList({
        code,
        page: 1,
        limit: 1,
      });

      return data.rentalPosts[0] ?? null;
    } catch (error) {
      console.error('Get rental post by code error:', error);
      return null;
    }
  },

  async getById(id: string): Promise<IRentalPostAdmin | null> {
    return fetchRentalPostById(id);
  },

  getDetailById(id: string): Promise<IRentalPostAdmin | null> {
    return getDetailByIdCached(id);
  },

  async create(formData: FormData) {
    const response = await fetch(getServerApiUrl('api/rental-admin-post'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Create rental post error: ${response.status}`);
    }

    await this.handlePostMutation();

    return response.json();
  },

  async update(id: string, formData: FormData) {
    const response = await fetch(getServerApiUrl(`api/rental-admin-post/${encodeURIComponent(id)}`), {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Update rental post error: ${response.status}`);
    }

    await this.handlePostMutation();

    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(getServerApiUrl(`api/rental-admin-post/${encodeURIComponent(id)}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete rental post error: ${response.status}`);
    }

    await this.handlePostMutation();

    return response.json();
  },

  async handlePostMutation(): Promise<void> {
    this.resetLocalCache();

    try {
      await fetch('/api/revalidate/rental-admin-posts', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Revalidate rental posts warning:', error);
    }
  },

  resetLocalCache(): void {
    cache.byId.clear();
  },

  async importRentalPost(items: unknown[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Import data must be a non-empty array');
    }

    const response = await fetch(getServerApiUrl('api/rental-admin-posts/import'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(`Import rental posts error: ${response.status} - ${text}`);
    }

    await this.handlePostMutation();

    return response.json() as Promise<{
      success: number;
      updated: number;
      failed: number;
      errors: string[];
    }>;
  },
};

export { rentalPostAdminService };
