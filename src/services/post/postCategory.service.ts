import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/post/post-category.types';
import { fetchData, resolvers } from '@/server/dataSource';

export interface PostCategoryPayload {
  name: string;
  description?: string;
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
    // GET linh động: FE data-layer (mặc định) hoặc BE
    const data = await fetchData('/api/post-categories', resolvers.postCategories());
    return (data as unknown as IPostCategory[]);
  },
  async getById(id: string): Promise<IPostCategory | null> {
    try {
      const data = await fetchData(`/api/post-category/${id}`, resolvers.postCategoryById(id));
      return ((data as { postCategory?: IPostCategory }).postCategory ?? null) as IPostCategory | null;
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
