'use client';

import { requireAdminToken } from "./adminAuth.client";

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (typeof window === 'undefined') {
    throw new Error('adminFetch must be called on client side');
  }

  const token = requireAdminToken();

  if (!token) {
    throw new Error('Missing admin token');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
