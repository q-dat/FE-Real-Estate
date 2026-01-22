'use client';
import { ACCESS_TOKEN_KEY } from '@/app/(auth)';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  return () => {
    localStorage.removeItem(`${ACCESS_TOKEN_KEY}`);
    router.replace('/login');
    window.location.reload();
  };
};
