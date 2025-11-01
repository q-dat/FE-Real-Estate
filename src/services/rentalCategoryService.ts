import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';

export const rentalCategoryService = {
  // GET ALL
  getAll: async (): Promise<IRentalCategory[]> => {
    try {
      const res = await fetch(`${getServerApiUrl('api/rental-categories')}`, { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`Không thể tải danh mục (${res.status} ${res.statusText})`);
      }

      const data = await res.json();

      // Chuẩn hóa dữ liệu — BE có thể trả { rentalCategories: [...] } hoặc trực tiếp là []
      if (Array.isArray(data)) {
        return data;
      }

      if (data && Array.isArray(data.rentalCategories)) {
        return data.rentalCategories;
      }

      console.warn('⚠️ Dữ liệu danh mục trả về không hợp lệ:', data);
      return [];
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      return [];
    }
  },

  // CREATE
  create: async (data: FormData) => {
    const res = await fetch(`${getServerApiUrl('api/rental-category')}`, {
      method: 'POST',
      body: data,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Tạo danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },

  // UPDATE
  update: async (id: string, data: FormData) => {
    const res = await fetch(`${getServerApiUrl(`api/rental-category/${id}`)}`, {
      method: 'PUT',
      body: data,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cập nhật danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },

  // DELETE
  delete: async (id: string) => {
    const res = await fetch(`${getServerApiUrl(`api/rental-category/${id}`)}`, { method: 'DELETE' });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Xoá danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },
};
