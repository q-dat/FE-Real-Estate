'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Drawer } from 'react-daisyui';
import { useEffect, useState, useMemo } from 'react';
import AdminBootLoading from '@/components/adminPage/AdminBootLoading';
import AdminNavbar from '@/components/adminPage/AdminNavbar';
import AdminSidebar from '@/components/adminPage/AdminSidebar';
import { authService } from '@/services/auth.service';
import { ADMIN_PAGE_TITLES } from '@/configs/adminPageTitles';
import { requireAdminToken } from '@/services/shared/adminAuth.client';
import { MeResponse } from '@/types/type/auth/auth';
import { AdminAuthProvider } from '@/context/AdminAuthContext';

type Status = 'booting' | 'ready' | 'unauthorized' | 'forbidden';

const ADMIN_ROLES = ['admin', 'owner'] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<Status>('booting');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<MeResponse['data'] | null>(null);

  const title = useMemo(() => {
    return ADMIN_PAGE_TITLES[pathname] || 'Admin Panel';
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const healthRes = await fetch('/api/health', { cache: 'no-store' });
        if (!healthRes.ok) throw new Error('Server not ready');

        const token = requireAdminToken();
        if (!token) {
          setStatus('unauthorized');
          return;
        }

        const meRes = await authService.me(token);
        const role = meRes.data.role;

        if (ADMIN_ROLES.includes(role as AdminRole)) {
          if (!cancelled) {
            setUser(meRes.data);
            setStatus('ready');
          }
          return;
        }

        if (!cancelled) setStatus('forbidden');
      } catch {
        if (!cancelled) setStatus('unauthorized');
      }
    };

    checkHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'booting') {
    return <AdminBootLoading />;
  }

  if (status === 'unauthorized') {
    router.replace('/login');
    return null;
  }

  if (status === 'forbidden') {
    router.replace('/');
    return null;
  }

  return (
    <AdminAuthProvider value={{ user: user! }}>
      <Drawer open={isSidebarOpen} onClickOverlay={() => setIsSidebarOpen(false)} side={<AdminSidebar />}>
        <div className="flex min-h-screen bg-slate-50">
          <div className="hidden xl:block">
            <AdminSidebar />
          </div>

          <div className="flex flex-1 flex-col">
            <AdminNavbar title={title} user={user!} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className="flex-1 px-2 py-4">
              <div className="w-full">{children}</div>
            </main>
          </div>
        </div>
      </Drawer>
    </AdminAuthProvider>
  );
}
