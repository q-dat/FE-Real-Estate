import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/post/post.types';
import { getWithFallback } from '../shared/getWithFallback';

interface ListResponse<T> {
  message?: string;
  posts: T;
}

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

export const postService = {
  async getAll(): Promise<IPost[]> {
    const res = await request<ListResponse<IPost[]>>(getServerApiUrl('api/posts'));
    return res.posts;
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
