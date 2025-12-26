'use client';

import AdminBootLoading from '@/components/adminPage/AdminBootLoading';
import AdminNavbar from '@/components/adminPage/AdminNavbar';
import AdminSidebar from '@/components/adminPage/AdminSidebar';
import { useEffect, useState } from 'react';
import { Drawer } from 'react-daisyui';

type ServerStatus = 'booting' | 'ready';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('booting');

  useEffect(() => {
    let cancelled = false;

    const checkServer = async () => {
      try {
        const res = await fetch('/api/health', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Health check failed');

        if (!cancelled) {
          setServerStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setTimeout(checkServer, 1500);
        }
      }
    };

    checkServer();

    return () => {
      cancelled = true;
    };
  }, []);

  // 👉 Render loading tĩnh trước
  if (serverStatus !== 'ready') {
    return <AdminBootLoading />;
  }

  // 👉 Server đã sẵn sàng → render admin UI
  return (
    <Drawer open={isSidebarOpen} onClickOverlay={() => setIsSidebarOpen(false)} side={<AdminSidebar />}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar desktop */}
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
