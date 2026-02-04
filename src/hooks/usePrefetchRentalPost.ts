'use client';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { useCallback, useRef } from 'react';

export function usePrefetchRentalPost() {
  // tránh prefetch nhiều lần cùng id
  const prefetched = useRef<Set<string>>(new Set());

  const prefetchById = useCallback(async (id: string) => {
    if (prefetched.current.has(id)) return;
    prefetched.current.add(id);

    try {
      await rentalPostAdminService.getById(id);
    } catch (error) {
      console.warn('Prefetch bài đăng lỗi:', error);
    }
  }, []);

  return { prefetchById };
}
