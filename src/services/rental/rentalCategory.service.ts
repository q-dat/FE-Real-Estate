import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/rentalCategory/rentalCategory.types';
import { fetchData } from '@/server/dataSource';

export const rentalCategoryService = {
  async getAll(): Promise<IRentalCategory[]> {
    // FE source (đang dùng): gọi route /api/* của chính FE
    const data = await fetchData<IRentalCategory[]>('/api/rental-categories');
    return Array.isArray(data) ? data : [];

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<IRentalCategory[]>('/api/rental-categories');
    // return Array.isArray(data) ? data : [];
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
