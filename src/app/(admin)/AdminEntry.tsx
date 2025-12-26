'use client';

import { useEffect, useState } from 'react';
import AdminBootLoading from '@/components/adminPage/AdminBootLoading';
import AdminLayout from './layout';

type Status = 'booting' | 'ready' | 'error';

export default function AdminEntry({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('booting');

  useEffect(() => {
    let cancelled = false;

    const pingServer = async () => {
      try {
        const res = await fetch('/api/health', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Health check failed');

        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) {
          setTimeout(pingServer, 1500);
        }
      }
    };

    pingServer();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== 'ready') {
    return <AdminBootLoading />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
