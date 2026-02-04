import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IInteriorCategory } from '@/types/interiorsCategory/interiorsCategory.types';

export const interiorCategoryService = {
  async getAll(): Promise<IInteriorCategory[]> {
    const res = await fetch(getServerApiUrl('api/interior-categories'));
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.interiorCategories ?? []);
  },

  async create(payload: Partial<IInteriorCategory>) {
    const res = await fetch(getServerApiUrl('api/interior-category'), {
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

  async update(id: string, payload: Partial<IInteriorCategory>) {
    const res = await fetch(getServerApiUrl(`api/interior-category/${id}`), {
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
    const res = await fetch(getServerApiUrl(`api/interior-category/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
    }
    return res.json();
  },
};
