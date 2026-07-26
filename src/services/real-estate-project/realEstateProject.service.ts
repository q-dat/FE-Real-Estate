import { getServerApiUrl } from '@/hooks/useApiUrl';
import { IRealEstateProject } from '@/types/realEstateProject/realEstateProject.types';
import { fetchData, resolvers } from '@/server/dataSource';

export const realEstateProjectService = {
  async getAll(): Promise<IRealEstateProject[]> {
    // FE source (đang dùng)
    const data = await fetchData('/api/real-estate-projects', resolvers.realEstateProjects({}));
    const list = ((data as { projects?: IRealEstateProject[] }).projects ?? []) as IRealEstateProject[];
    return list;

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<{ projects?: IRealEstateProject[] }>('/api/real-estate-projects');
    // return data.projects ?? [];
  },

  async getById(id: string): Promise<IRealEstateProject> {
    // FE source (đang dùng)
    const data = await fetchData(`/api/real-estate-project/${id}`, resolvers.realEstateProjectById(id));
    const item = ((data as { project?: IRealEstateProject }).project ?? null) as IRealEstateProject | null;

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<{ project?: IRealEstateProject }>(`/api/real-estate-project/${id}`);
    // const item = data.project ?? null;

    if (!item) throw new Error('Fetch project failed');
    return item;
  },

  async getBySlug(slug: string): Promise<IRealEstateProject | null> {
    // FE source (đang dùng)
    const data = await fetchData(`/api/real-estate-project/slug/${slug}`, resolvers.realEstateProjectBySlug(slug));
    return ((data as { project?: IRealEstateProject }).project ?? null) as IRealEstateProject | null;

    // BE source (mở khi cần, comment FE bên trên)
    // const data = await getFromBe<{ project?: IRealEstateProject }>(`/api/real-estate-project/slug/${slug}`);
    // return data.project ?? null;
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
