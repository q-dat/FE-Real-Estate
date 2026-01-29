import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IPost } from '@/types/type/post/post';

export const postService = {
  async getAll(): Promise<IPost[]> {
    const res = await fetch(getServerApiUrl('api/posts'));
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.posts ?? []);
  },

  async create(formData: FormData): Promise<IPost> {
    const res = await fetch(getServerApiUrl('api/post'), {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Post create failed: ${res.status}`);
    }

    return res.json();
  },

  async update(id: string, formData: FormData): Promise<IPost> {
    const res = await fetch(getServerApiUrl(`api/post/${id}`), {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Post update failed: ${res.status}`);
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
