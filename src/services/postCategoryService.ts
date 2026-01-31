import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/type/post/post-category';

interface ListResponse<T> {
  message?: string;
  postCategories: T;
}

interface SingleResponse<T> {
  message?: string;
  postCategory: T;
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
    const res = await request<ListResponse<IPostCategory[]>>(getServerApiUrl('api/post-categories'));
    return res.postCategories;
  },

  async create(payload: Pick<IPostCategory, 'name'>): Promise<IPostCategory> {
    const res = await request<SingleResponse<IPostCategory>>(getServerApiUrl('api/post-category'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.postCategory;
  },

  async update(id: string, payload: Pick<IPostCategory, 'name'>): Promise<IPostCategory> {
    const res = await request<SingleResponse<IPostCategory>>(getServerApiUrl(`api/post-category/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.postCategory;
  },

  async delete(id: string): Promise<void> {
    await request<void>(getServerApiUrl(`api/post-category/${id}`), { method: 'DELETE' });
  },
};
