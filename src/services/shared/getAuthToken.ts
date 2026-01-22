import { ACCESS_TOKEN_KEY } from '@/app/(auth)';

export function getAuthToken(): string | null {
  return localStorage.getItem(`${ACCESS_TOKEN_KEY}`);
}
