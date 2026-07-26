import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRealEstateProject } from '@/types/realEstateProject/realEstateProject.types';
import { fetchData, resolvers } from '@/server/dataSource';

export const realEstateProjectService = {
  async getAll(): Promise<IRealEstateProject[]> {
    const data = await fetchData('/api/real-estate-projects', resolvers.realEstateProjects({}));
    const list = ((data as { projects?: IRealEstateProject[] }).projects ?? []) as IRealEstateProject[];
    return list;
  },

  async getById(id: string): Promise<IRealEstateProject> {
    const data = await fetchData(`/api/real-estate-project/${id}`, resolvers.realEstateProjectById(id));
    const item = ((data as { project?: IRealEstateProject }).project ?? null) as IRealEstateProject | null;
    if (!item) throw new Error('Fetch project failed');
    return item;
  },

  async getBySlug(slug: string): Promise<IRealEstateProject | null> {
    const data = await fetchData(`/api/real-estate-project/slug/${slug}`, resolvers.realEstateProjectBySlug(slug));
    return ((data as { project?: IRealEstateProject }).project ?? null) as IRealEstateProject | null;
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
