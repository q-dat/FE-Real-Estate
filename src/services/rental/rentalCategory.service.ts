import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/rentalCategory/rentalCategory.types';
import { fetchData, resolvers } from '@/server/dataSource';

export const rentalCategoryService = {
  async getAll(): Promise<IRentalCategory[]> {
    // GET linh động: FE data-layer (mặc định) hoặc BE
    const data = await fetchData('/api/rental-categories', resolvers.rentalCategories());
    const list = data as unknown as IRentalCategory[];
    return Array.isArray(list) ? list : ((list as { rentalCategories?: IRentalCategory[] }).rentalCategories ?? []);
  },

  async create(payload: Partial<IRentalCategory>) {
    const res = await fetch(getServerApiUrl('api/rental-category'), {
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

  async update(id: string, payload: Partial<IRentalCategory>) {
    const res = await fetch(getServerApiUrl(`api/rental-category/${id}`), {
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
    const res = await fetch(getServerApiUrl(`api/rental-category/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
    }
    return res.json();
  },
};
