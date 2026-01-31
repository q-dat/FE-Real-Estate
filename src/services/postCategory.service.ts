import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/post/post-category.types';

export interface PostCategoryPayload {
  name: string;
  description?: string;
}

interface ApiResponse<T> {
  message?: string;
  postCategory: T;
  postCategories: T;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

export const postCategoryService = {
  async getAll(): Promise<IPostCategory[]> {
    const res = await request<{ postCategories: IPostCategory[] }>(getServerApiUrl('api/post-categories'));
    return res.postCategories;
  },
  async create(payload: PostCategoryPayload): Promise<IPostCategory> {
    return request<IPostCategory>(getServerApiUrl('api/post-category'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  async update(id: string, payload: PostCategoryPayload): Promise<IPostCategory> {
    return request<IPostCategory>(getServerApiUrl(`api/post-category/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  async delete(id: string): Promise<void> {
    await request<void>(getServerApiUrl(`api/post-category/${id}`), { method: 'DELETE' });
  },
};
