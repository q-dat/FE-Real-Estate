import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';

export const rentalCategoryService = {
  async getAll(params?: Record<string, string | number>): Promise<IRentalCategory[]> {
    const baseUrl = getServerApiUrl('api/rental-categories');

    let apiUrl = baseUrl;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [k, v]) => {
            acc[k] = String(v);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      apiUrl += `?${query}`;
    }

    const res = await fetch(apiUrl, {
      // Để Next tự revalidate theo page đang gọi
      // next: { revalidate: 3600 }, nếu muốn override
    });

    if (!res.ok) throw new Error(`Fetch danh mục lỗi: ${res.status}`);

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.rentalCategories ?? []);
  },

  async create(data: FormData) {
    const res = await fetch(getServerApiUrl('api/rental-category'), {
      method: 'POST',
      body: data,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Tạo danh mục thất bại: ${res.status} - ${errText}`);
    }

    return res.json();
  },

  async update(id: string, data: FormData) {
    const res = await fetch(getServerApiUrl(`api/rental-category/${id}`), {
      method: 'PUT',
      body: data,
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
