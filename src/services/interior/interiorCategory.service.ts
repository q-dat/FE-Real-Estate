import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IInteriorCategory } from '@/types/interiorsCategory/interiorsCategory.types';
import { fetchData } from '@/server/dataSource';

export const interiorCategoryService = {
  async getAll(): Promise<IInteriorCategory[]> {
    // FE source (đang dùng): gọi route /api/* của chính FE
    const data = await fetchData<IInteriorCategory[]>('/api/interior-categories');
    return data;

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<IInteriorCategory[]>('/api/interior-categories');
    // return data;
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
