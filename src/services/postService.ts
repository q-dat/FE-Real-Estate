import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/type/post/post';

export const postService = {
  async getAll(): Promise<IPost[]> {
    const res = await fetch(getServerApiUrl('api/posts'));
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.posts ?? []);
  },

  async create(payload: Partial<IPost>) {
    const res = await fetch(getServerApiUrl('api/post'), {
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

  async update(id: string, payload: Partial<IPost>) {
    const res = await fetch(getServerApiUrl(`api/post/${id}`), {
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
    const res = await fetch(getServerApiUrl(`api/post/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
    }
    return res.json();
  },
};
