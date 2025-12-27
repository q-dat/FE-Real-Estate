'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer } from 'react-daisyui';

import AdminBootLoading from '@/components/adminPage/AdminBootLoading';
import AdminNavbar from '@/components/adminPage/AdminNavbar';
import AdminSidebar from '@/components/adminPage/AdminSidebar';
import { authService } from '@/services/auth.service';

type Status = 'booting' | 'ready' | 'unauthorized';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('booting');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        /* Check server health */
        const healthRes = await fetch('/api/health', { cache: 'no-store' });
        if (!healthRes.ok) throw new Error('Server not ready');

        /* Check Auth */
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const meRes = await authService.me(token);

        if (!['admin', 'super_admin'].includes(meRes.data.role)) {
          throw new Error('Forbidden');
        }

        if (!cancelled) {
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setStatus('unauthorized');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Loading */
  if (status === 'booting') {
    return <AdminBootLoading />;
  }

  /* Unauthorized */
  if (status === 'unauthorized') {
    router.replace('/login');
    return null;
  }

  /* Ready */
  return (
    <Drawer open={isSidebarOpen} onClickOverlay={() => setIsSidebarOpen(false)} side={<AdminSidebar />}>
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden xl:block">
          <AdminSidebar />
        </div>

        <div className="flex flex-1 flex-col">
          <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 px-2 py-4">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </Drawer>
  );
}
