import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IInteriorCategory } from '@/types/interiorsCategory/interiorsCategory.types';
import { fetchData, resolvers } from '@/server/dataSource';

export const interiorCategoryService = {
  async getAll(): Promise<IInteriorCategory[]> {
    // GET linh động: FE data-layer (mặc định) hoặc BE
    const data = await fetchData('/api/interior-categories', resolvers.interiorCategories());
    return (data as unknown as IInteriorCategory[]);
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
