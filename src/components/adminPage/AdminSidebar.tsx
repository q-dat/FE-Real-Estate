'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_MENU, IMenuItem } from '@/configs/admin-menu.config';
import { Menu } from 'react-daisyui';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-72 border-r bg-base-100 py-6">
      <div className="mb-10 px-6">
        <h2 className="text-2xl font-bold tracking-tight text-primary">CMS ADMIN</h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-base-content/50">Management System</p>
      </div>

      <Menu className="gap-1 px-2">
        {ADMIN_MENU.map((item: IMenuItem) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Menu.Item key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isActive ? 'bg-primary font-medium text-primary-content shadow-md' : 'hover:bg-base-200 active:scale-95'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </aside>
  );
}
