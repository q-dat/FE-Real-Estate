import {
  getAllRentalPostsAdmin,
  getRentalPostAdminById,
  getRentalPostAdminByCode,
  getAllRentalCategories,
  getAllRealEstateProjects,
  getRealEstateProjectById,
  getRealEstateProjectBySlug,
  getAllPosts,
  getPostById,
  getPostBySlug,
  getAllPostCategories,
  getPostCategoryById,
  getAllInteriors,
  getInteriorById,
  getAllInteriorCategories,
} from './queries';

export type ApiMode = 'fe' | 'be';

/**
 * Nguồn dữ liệu cho các GET.
 * - fe (mặc định): FE tự query DB qua data-layer (trùng logic route /api/* của FE).
 * - be: gọi HTTP sang BE. Response shape giống hệt fe.
 * Chuyển bằng env NEXT_PUBLIC_API_MODE=be (runtime) HOẶC bằng cách comment-block
 * trong từng service (thủ công, xem các ghi chú FE source / BE source).
 */
export function getApiMode(): ApiMode {
  return process.env.NEXT_PUBLIC_API_MODE === 'be' ? 'be' : 'fe';
}

const BE_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/**
 * Gọi API BE qua HTTP. Dùng khi muốn lấy data từ BE thay vì FE data-layer.
 * @param path đường dẫn tương đối, ví dụ '/api/rental-admin-posts'
 * @param token optional Authorization token (cho GET cần auth)
 */
export async function getFromBe<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BE_BASE}${path}`, { cache: 'no-store', headers });
  if (!res.ok) {
    throw new Error(`BE GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Dispatcher GET duy nhất cho mọi service.
 * @param path    đường dẫn API (chỉ dùng ở mode 'be', ví dụ '/api/rental-admin-posts')
 * @param resolver hàm FE data-layer trả về CÙNG envelope với BE (để 2 mode đồng nhất)
 */
export async function fetchData<T>(path: string, resolver: () => Promise<T>): Promise<T> {
  if (getApiMode() === 'be') {
    const res = await fetch(`${BE_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`BE GET ${path} failed: ${res.status}`);
    }
    return (await res.json()) as T;
  }
  return resolver();
}

// Resolver helpers (bọc envelope giống BE)

export const resolvers = {
  rentalPostsAdmin: (params: Record<string, string | number | undefined>) =>
    () => getAllRentalPostsAdmin(params),
  rentalPostAdminById: (id: string) =>
    () => getRentalPostAdminById(id).then((p) => ({ rentalPost: p })),
  rentalPostAdminByCode: (code: string) =>
    () => getRentalPostAdminByCode(code).then((p) => ({ rentalPosts: p ? [p] : [] })),

  rentalCategories: () => () => getAllRentalCategories(),

  realEstateProjects: (params: Record<string, string>) =>
    () => getAllRealEstateProjects(params),
  realEstateProjectById: (id: string) =>
    () => getRealEstateProjectById(id).then((p) => ({ project: p })),
  realEstateProjectBySlug: (slug: string) =>
    () => getRealEstateProjectBySlug(slug).then((p) => ({ project: p })),

  posts: (params: Record<string, string>) => () => getAllPosts(params),
  postById: (id: string) => () => getPostById(id).then((p) => ({ post: p })),
  postBySlug: (slug: string) => () => getPostBySlug(slug).then((p) => ({ post: p })),

  postCategories: () => () => getAllPostCategories(),
  postCategoryById: (id: string) =>
    () => getPostCategoryById(id).then((c) => ({ postCategory: c })),

  interiors: (params: Record<string, string>) =>
    () => getAllInteriors(params).then((list) => ({ interiors: list })),
  interiorById: (id: string) =>
    () => getInteriorById(id).then((i) => ({ interior: i })),

  interiorCategories: () => () => getAllInteriorCategories(),
};
