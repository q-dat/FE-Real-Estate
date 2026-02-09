import { getServerApiUrl } from '@/hooks/useApiUrl';
import { requireAdminToken } from '@/services/shared/adminAuth.client';

interface CrawlerStatusResponse {
  running: boolean;
  lastRunAt?: string;
}

interface StartCrawlerResponse {
  message: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = requireAdminToken();

  if (!token) {
    throw new Error('Unauthorized');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

export const crawlerService = {
  async getStatus(): Promise<CrawlerStatusResponse> {
    return request<CrawlerStatusResponse>(getServerApiUrl('api/crawler/status'));
  },

  async start(): Promise<StartCrawlerResponse> {
    return request<StartCrawlerResponse>(getServerApiUrl('api/crawler/start'), { method: 'POST' });
  },
};
