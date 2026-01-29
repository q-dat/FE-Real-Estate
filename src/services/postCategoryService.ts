import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPostCategory } from '@/types/type/post/post-category';

export const postCategoryService = {
  async getAll(): Promise<IPostCategory[]> {
    const res = await fetch(getServerApiUrl('api/post-categories'));
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.postCategories ?? []);
  },

  async create(payload: Partial<IPostCategory>) {
    const res = await fetch(getServerApiUrl('api/post-category'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Tạo danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },

  async update(id: string, payload: Partial<IPostCategory>) {
    const res = await fetch(getServerApiUrl(`api/post-category/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cập nhật danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/post-category/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
    }
    return res.json();
  },
};
