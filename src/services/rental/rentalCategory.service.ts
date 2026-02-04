import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/rentalCategory/rentalCategory.types';

export const rentalCategoryService = {
  async getAll(): Promise<IRentalCategory[]> {
    const res = await fetch(getServerApiUrl('api/rental-categories'));
    if (!res.ok) throw new Error(`Fetch danh mục lỗi: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.rentalCategories ?? []);
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
