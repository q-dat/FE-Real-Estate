'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'react-daisyui';
import { HiChevronDown } from 'react-icons/hi2';
import { ADMIN_MENU, IMenuItem, ISubMenuItem } from '@/configs/admin-menu.config';

// Types
interface SidebarItemProps {
  item: IMenuItem;
  pathname: string;
  isExpanded: boolean;
  onSelect: () => void;
}

// Sidebar Item
const SidebarItem = ({ item, pathname, isExpanded, onSelect }: SidebarItemProps) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasSubmenu = !!item.submenu?.length;
  const isActive = pathname === item.path || (hasSubmenu && item.submenu?.some((sub) => pathname === sub.path));

  const Icon = item.icon;

  return (
    <div className="relative mb-1 px-3" onMouseEnter={() => isExpanded && setIsSubmenuOpen(true)} onMouseLeave={() => setIsSubmenuOpen(false)}>
      <Link
        href={hasSubmenu ? '#' : item.path}
        onClick={(e) => {
          if (hasSubmenu) {
            e.preventDefault();
            if (isExpanded) setIsSubmenuOpen((v) => !v);
          } else {
            onSelect(); // Thu nhỏ sidebar khi click vào link thường
          }
        }}
        className={`group relative flex h-12 items-center rounded-xl transition-all duration-300 ${
          isExpanded ? 'justify-between px-4' : 'justify-center px-0'
        } ${
          isActive ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(var(--p),0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`flex-shrink-0 text-xl transition-colors duration-300 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
          {isExpanded && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="whitespace-nowrap font-medium tracking-tight">
              {item.title}
            </motion.span>
          )}
        </div>

        {hasSubmenu && isExpanded && (
          <motion.div animate={{ rotate: isSubmenuOpen ? 180 : 0 }} className="text-xs">
            <HiChevronDown strokeWidth={2} />
          </motion.div>
        )}

        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/5"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </Link>

      {/* Submenu Area */}
      <AnimatePresence>
        {hasSubmenu && isSubmenuOpen && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
              {item.submenu?.map((sub: ISubMenuItem) => (
                <Link
                  key={sub.path}
                  href={sub.path}
                  onClick={onSelect}
                  className={`py-2 text-sm transition-all hover:translate-x-1 ${
                    pathname === sub.path ? 'font-semibold text-primary' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {sub.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Shared Content
const SidebarContent = ({ pathname, isExpanded, onSelect }: { pathname: string; isExpanded: boolean; onSelect: () => void }) => (
  <div className="z-[999999] flex h-full flex-col overflow-hidden">
    {/* Logo Section */}
    <div className="hidden h-24 items-center overflow-hidden px-4 xl:flex">
      <div className={`flex items-center gap-4 ${!isExpanded && 'mx-auto'}`}>
        <div className="relative hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--p),0.3)] xl:flex">
          <div className="h-4 w-4 rotate-45 animate-ping rounded-sm bg-white" />
        </div>
        {isExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="whitespace-nowrap text-lg font-bold tracking-wider text-white">NGUONNHAGIARE</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-[10px] font-bold uppercase text-slate-500">Online</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden pt-5 scrollbar-hide">
      <div className="mb-4 px-6 transition-opacity duration-300">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Menu</span>
      </div>
      {/* Menu */}
      <div className="flex-1 overflow-hidden overflow-y-auto pt-4 xl:pt-0">
        <Menu className="p-0">
          {ADMIN_MENU.map((item) => (
            <SidebarItem key={item.path} item={item} pathname={pathname} isExpanded={isExpanded} onSelect={onSelect} />
          ))}
        </Menu>
      </div>
    </div>
    {/* Footer Card */}
    <Link target="_blank" href="https://zalo.me/0333133050" className="p-2">
      <div
        className={`relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 ${!isExpanded && 'justify-center'}`}
      >
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary/20 p-0.5">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Man" alt="Avatar" className="h-full w-full rounded-full object-cover" />
        </div>
        {isExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="truncate text-xs font-bold uppercase text-white">Hỗ trợ kĩ thuật</p>
            <p className="whitespace-nowrap text-[10px] text-slate-500">0333.133.050 - Quốc Đạt</p>
          </motion.div>
        )}
      </div>
    </Link>
  </div>
);

// Main Sidebar
export default function AdminSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Mobile Sidebar – luôn expanded */}
      <aside className="sticky top-0 h-screen w-[360px] bg-[#020617] xl:hidden">
        <SidebarContent pathname={pathname} isExpanded={true} onSelect={() => {}} />
      </aside>

      {/* Desktop Sidebar – giữ nguyên logic cũ */}
      <motion.aside
        initial="collapsed"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={{
          collapsed: { width: 80 },
          expanded: { width: 288 },
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="sticky top-0 hidden h-screen bg-[#020617] xl:block"
      >
        <SidebarContent pathname={pathname} isExpanded={isExpanded} onSelect={() => setIsExpanded(false)} />
      </motion.aside>
    </>
  );
}
