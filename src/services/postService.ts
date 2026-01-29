import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/type/post/post';

/* ---------------- types ---------------- */

type CacheState = {
  list: IPost[];
  byId: Map<string, IPost>;
};

/* ---------------- cache ---------------- */

const cache: CacheState = {
  list: [],
  byId: new Map(),
};

/* ---------------- service ---------------- */

const postService = {
  /* ---------- queries ---------- */

  async getAll(params?: Record<string, string | number>): Promise<IPost[]> {
    let apiUrl = getServerApiUrl('api/posts');
    const hasFilter = params && Object.keys(params).length > 0;

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
      throw new Error(`Post getAll failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      posts?: IPost[];
    };

    const list = data.posts ?? [];

    if (!hasFilter) {
      cache.list = list;
      cache.byId.clear();
      list.forEach((p) => {
        if (p._id) cache.byId.set(p._id, p);
      });
    }

    return list;
  },

  async getById(id: string): Promise<IPost | null> {
    if (!id) return null;

    const cached = cache.byId.get(id);
    if (cached) return cached;

    const apiUrl = getServerApiUrl(`api/post/${id}`);

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      post?: IPost;
    };

    if (data.post?._id) {
      cache.byId.set(data.post._id, data.post);
    }

    return data.post ?? null;
  },

  /* ---------- mutations ---------- */

  async create(formData: FormData): Promise<IPost> {
    const res = await fetch(getServerApiUrl('api/post'), {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Post create failed: ${res.status}`);
    }

    await this.handleMutation();
    return res.json();
  },

  async update(id: string, formData: FormData): Promise<IPost> {
    const res = await fetch(getServerApiUrl(`api/post/${id}`), {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Post update failed: ${res.status}`);
    }

    await this.handleMutation();
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(getServerApiUrl(`api/post/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Post delete failed: ${res.status}`);
    }

    await this.handleMutation();
  },

  /* ---------- cache helpers ---------- */

  async handleMutation() {
    this.resetLocalCache();
    try {
      await fetch('/api/revalidate/posts', { method: 'POST' });
    } catch (e) {
      console.warn('Post revalidate warning:', e);
    }
  },

  resetLocalCache() {
    cache.list = [];
    cache.byId.clear();
  },
};

export { postService };
