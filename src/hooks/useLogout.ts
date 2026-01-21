'use client';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  return () => {
    localStorage.removeItem('token');
    router.replace('/login');
    window.location.reload();
  };
};
