import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/post/post-category.types';
import { fetchData } from '@/server/dataSource';

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
    // FE source (đang dùng): gọi route /api/* của chính FE
    const data = await fetchData<IPostCategory[]>('/api/post-categories');
    return data;

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<IPostCategory[]>('/api/post-categories');
    // return data;
  },
  async getById(id: string): Promise<IPostCategory | null> {
    try {
      // FE source (đang dùng)
      const data = await fetchData<{ postCategory?: IPostCategory }>(`/api/post-category/${id}`);
      return data.postCategory ?? null;

      // BE source (mở khi cần, comment FE bên trên)
      // const data = await getFromBe<{ postCategory?: IPostCategory }>(`/api/post-category/${id}`);
      // return data.postCategory ?? null;
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
