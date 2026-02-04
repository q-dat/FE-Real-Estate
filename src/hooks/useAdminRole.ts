'use client';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth/auth.service';
import { requireAdminToken } from '@/services/shared/adminAuth.client';

type AdminRole = 'admin' | 'owner';

export function useAdminRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkRole = async () => {
      try {
        const token = requireAdminToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const meRes = await authService.me(token);
        const role = meRes.data.role as AdminRole;

        if (!cancelled) {
          setIsAdmin(role === 'admin' || role === 'owner');
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkRole();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, loading };
}
