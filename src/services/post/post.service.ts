import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/post/post.types';
import { getWithFallback } from '../shared/getWithFallback';
import { fetchData, resolvers } from '@/server/dataSource';

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

    // FE source (đang dùng)
    const data = await fetchData(
      '/api/posts',
      resolvers.posts((params ?? {}) as Record<string, string>)
    );
    const list: IPost[] = ((data as { posts?: IPost[] }).posts ?? []) as IPost[];

    // BE source (mở khi cần, comment FE bên trên)
    // let path = '/api/posts';
    // if (hasFilter) {
    //   const q = new URLSearchParams();
    //   Object.entries(params!).forEach(([k, v]) => {
    //     if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    //   });
    //   path += `?${q.toString()}`;
    // }
    // const data = await getFromBe<{ posts?: IPost[] }>(path);
    // const list: IPost[] = data.posts ?? [];

    if (!hasFilter) {
      cache.list = list;
      cache.byId.clear();
      list.forEach((item) => {
        if (item._id) cache.byId.set(item._id, item);
      });
    }

    return list;
  },
  async getById(id: string): Promise<IPost | null> {
    try {
      // FE source (đang dùng)
      const data = await fetchData(`/api/post/${id}`, resolvers.postById(id));
      return ((data as { post?: IPost }).post ?? null) as IPost | null;

      // BE source (mở khi cần, comment FE bên trên)
      // const data = await getFromBe<{ post?: IPost }>(`/api/post/${id}`);
      // return data.post ?? null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  },
  async getBySlug(slug: string): Promise<IPost | null> {
    try {
      // FE source (đang dùng)
      const data = await fetchData(`/api/post/slug/${slug}`, resolvers.postBySlug(slug));
      const post = ((data as { post?: IPost }).post ?? null) as IPost | null;

      // BE source (mở khi cần, comment FE bên trên)
      // const data = await getFromBe<{ post?: IPost }>(`/api/post/slug/${slug}`);
      // const post = data.post ?? null;

      if (post?._id) cache.byId.set(post._id, post);
      return post;
    } catch (error) {
      console.error('Error fetching post by Slug:', error);
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
