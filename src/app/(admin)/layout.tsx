'use client';

import AdminBootLoading from '@/components/adminPage/AdminBootLoading';
import AdminNavbar from '@/components/adminPage/AdminNavbar';
import AdminSidebar from '@/components/adminPage/AdminSidebar';
import { useEffect, useState } from 'react';
import { Drawer } from 'react-daisyui';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

type Status = 'booting' | 'ready' | 'unauthorized';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('booting');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const res = await authService.me(token);

        if (res.data.role !== 'admin') {
          throw new Error('Not admin');
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

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === 'booting') {
    return <AdminBootLoading />;
  }

  if (status === 'unauthorized') {
    router.replace('/login');
    return null;
  }

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
