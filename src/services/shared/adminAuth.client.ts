'use client';
export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';

  const token = localStorage.getItem('token');
  return token ?? '';
}

export function requireAdminToken(): string {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Missing admin token');
  }
  return token;
}
