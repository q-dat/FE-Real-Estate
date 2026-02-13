import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/post/post.types';
import { getWithFallback } from '../shared/getWithFallback';

// interface ListResponse<T> {
//   message?: string;
//   posts: T;
// }

interface SingleResponse<T> {
  message?: string;
  post: T;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
// Type Definitions ---
type CacheState = {
  list: IPost[];
  byId: Map<string, IPost>;
};

// Singleton Cache State ---
// Cache này sẽ tồn tại trong memory của server (nếu chạy server-side) hoặc browser (nếu client-side)
// Lưu ý: Với Server Components, cache này chỉ sống trong vòng đời của request hoặc lambda instance
const cache: CacheState = {
  list: [],
  byId: new Map(),
};
export const postService = {
  //  async getAll(): Promise<IPost[]> {
  //   const res = await request<ListResponse<IPost[]>>(getServerApiUrl('api/posts'));
  //   return res.posts;
  // },
  async getAll(params?: Record<string, string | number>) {
    const hasFilter = params && Object.keys(params).length > 0;

    let apiUrl = getServerApiUrl('api/posts');

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
      posts?: IPost[];
    };

    const list: IPost[] = data.posts ?? [];

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
  async getById(id: string): Promise<IPost | null> {
    try {
      const res = await request<SingleResponse<IPost>>(getServerApiUrl(`api/post/${id}`));
      return res.post;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  },
  async getFallback(id: string): Promise<IPost | null> {
    return getWithFallback<IPost>(id, this.getAll.bind(this), this.getById.bind(this));
  },

  async create(formData: FormData): Promise<IPost> {
    const res = await request<SingleResponse<IPost>>(getServerApiUrl('api/post'), {
      method: 'POST',
      body: formData,
    });
    return res.post;
  },

  async update(id: string, formData: FormData): Promise<IPost> {
    const res = await request<SingleResponse<IPost>>(getServerApiUrl(`api/post/${id}`), {
      method: 'PUT',
      body: formData,
    });
    return res.post;
  },

  async delete(id: string): Promise<void> {
    await request<void>(getServerApiUrl(`api/post/${id}`), { method: 'DELETE' });
  },
};
