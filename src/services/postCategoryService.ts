import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/type/post/post-category';

/* ---------------- types ---------------- */

type CacheState = {
  list: IPostCategory[];
  byId: Map<string, IPostCategory>;
};

/* ---------------- cache ---------------- */

const cache: CacheState = {
  list: [],
  byId: new Map(),
};

/* ---------------- service ---------------- */

const postCategoryService = {
  /* ---------- queries ---------- */

  async getAll(): Promise<IPostCategory[]> {
    const apiUrl = getServerApiUrl('api/post-categories');

    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`PostCategory getAll failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      categories?: IPostCategory[];
    };

    const list = data.categories ?? [];

    cache.list = list;
    cache.byId.clear();
    list.forEach((c) => {
      if (c._id) cache.byId.set(c._id, c);
    });

    return list;
  },

  async getById(id: string): Promise<IPostCategory | null> {
    if (!id) return null;

    const cached = cache.byId.get(id);
    if (cached) return cached;

    const apiUrl = getServerApiUrl(`api/post-category/${id}`);

    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      category?: IPostCategory;
    };

    if (data.category?._id) {
      cache.byId.set(data.category._id, data.category);
    }

    return data.category ?? null;
  },

  /* ---------- mutations ---------- */

  async create(payload: { name: string }): Promise<IPostCategory> {
    const res = await fetch(getServerApiUrl('api/post-category'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`PostCategory create failed: ${res.status}`);
    }

    await this.handleMutation();
    return res.json();
  },

  async update(id: string, payload: { name: string }): Promise<IPostCategory> {
    const res = await fetch(getServerApiUrl(`api/post-category/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`PostCategory update failed: ${res.status}`);
    }

    await this.handleMutation();
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(getServerApiUrl(`api/post-category/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`PostCategory delete failed: ${res.status}`);
    }

    await this.handleMutation();
  },

  /* ---------- cache helpers ---------- */

  async handleMutation() {
    this.resetLocalCache();
    try {
      await fetch('/api/revalidate/post-categories', { method: 'POST' });
    } catch (e) {
      console.warn('PostCategory revalidate warning:', e);
    }
  },

  resetLocalCache() {
    cache.list = [];
    cache.byId.clear();
  },
};

export { postCategoryService };
