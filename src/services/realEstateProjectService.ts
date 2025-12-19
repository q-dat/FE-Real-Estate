import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRealEstateProject } from '@/types/type/realEstateProject/realEstateProject';

export const realEstateProjectService = {
  async getAll(): Promise<IRealEstateProject[]> {
    const res = await fetch(getServerApiUrl('api/real-estate-projects'), {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Fetch real estate projects failed');

    const data = await res.json();
    return Array.isArray(data?.projects) ? data.projects : [];
  },

  async getById(id: string): Promise<IRealEstateProject> {
    const res = await fetch(getServerApiUrl(`api/real-estate-project/${id}`), {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Fetch project failed');

    const data = await res.json();
    return data.project;
  },

  async getBySlug(slug: string): Promise<IRealEstateProject | null> {
    const res = await fetch(getServerApiUrl(`api/real-estate-project/slug/${slug}`), {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.project ?? null;
  },

  // =========================
  // MULTIPART (UPLOAD IMAGE)
  // =========================
  async create(payload: FormData) {
    const res = await fetch(getServerApiUrl('api/real-estate-project'), {
      method: 'POST',
      body: payload,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Tạo dự án thất bại: ${res.status} - ${err}`);
    }

    return res.json();
  },

  async update(id: string, payload: FormData) {
    const res = await fetch(getServerApiUrl(`api/real-estate-project/${id}`), {
      method: 'PUT',
      body: payload,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Cập nhật dự án thất bại: ${res.status} - ${err}`);
    }

    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(getServerApiUrl(`api/real-estate-project/${id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Xóa dự án thất bại: ${res.status} - ${err}`);
    }

    return res.json();
  },
};
