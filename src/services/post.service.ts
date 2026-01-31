import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/post/post.types';

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
