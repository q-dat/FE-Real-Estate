// Data source dispatcher cho các GET.
// Quan trọng: file này KHÔNG import mongoose / models / queries.
// Nó chỉ thực hiện HTTP fetch, nên an toàn khi bị bundle ra client.
// Nguồn thật sự (query DB) nằm ở các route handler src/app/api/* (chỉ chạy server).

export type ApiMode = 'fe' | 'be';

const BE_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

// Ưu tiên SITE_URL làm origin cho self-fetch trong FE mode (tránh loop 127.0.0.1).
function feBase(): string {
  if (typeof window === 'undefined') {
    // Server context: dùng SITE_URL nếu có, không thì relative.
    return SITE_URL ? SITE_URL.replace(/\/$/, '') : '';
  }
  return '';
}

export function getApiMode(): ApiMode {
  return process.env.NEXT_PUBLIC_API_MODE === 'be' ? 'be' : 'fe';
}

function buildUrl(path: string, mode: ApiMode): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (mode === 'be') {
    return `${BE_BASE.replace(/\/$/, '')}${clean}`;
  }
  const base = feBase();
  return base ? `${base}${clean}` : clean;
}

/**
 * Gọi API FE (route /api/* của chính FE, query DB ở server) hoặc BE.
 * @param path đường dẫn tương đối, ví dụ '/api/rental-admin-posts'
 */
export async function fetchData<T>(path: string, init?: RequestInit): Promise<T> {
  const mode = getApiMode();
  const url = buildUrl(path, mode);
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Gọi API BE qua HTTP. Dùng khi muốn lấy data từ BE thay vì FE.
 * @param path đường dẫn tương đối, ví dụ '/api/rental-admin-posts'
 * @param token optional Authorization token (cho GET cần auth)
 */
export async function getFromBe<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${BE_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) {
    throw new Error(`BE GET ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
