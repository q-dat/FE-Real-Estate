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

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const postCategoryService = {
  async getAll(): Promise<IPostCategory[]> {
    const res = await request<{ postCategories: IPostCategory[] }>(getServerApiUrl('api/post-categories'));
    return res.postCategories;
  },
  async getById(id: string): Promise<IPostCategory | null> {
    try {
      const res = await request<{ postCategory: IPostCategory }>(getServerApiUrl(`api/post-category/${id}`));
      return res.postCategory;
    } catch (error) {
      console.error('GetById Error:', error);
      return null;
    }
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
