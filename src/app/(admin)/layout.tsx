'use client';

import AdminNavbar from '@/components/adminPage/AdminNavbar';
import AdminSidebar from '@/components/adminPage/AdminSidebar';
import { useState } from 'react';
import { Drawer } from 'react-daisyui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Drawer open={isSidebarOpen} onClickOverlay={() => setIsSidebarOpen(false)} side={<AdminSidebar />}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar cố định trên Desktop */}
        <div className="hidden xl:block">
          <AdminSidebar />
        </div>

        <div className="flex flex-1 flex-col">
          {/* Top Navbar cho Admin: Chứa nút đóng mở Sidebar mobile, thông tin user */}
          <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 px-2 py-4">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </Drawer>
  );
}
