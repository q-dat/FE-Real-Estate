'use client';
import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu } from 'react-daisyui';
import { HiChevronDown } from 'react-icons/hi2';
import { IMenuItem, ISubMenuItem } from '@/configs/admin-menu.config';
import { PiDotDuotone } from 'react-icons/pi';
import { BsUniversalAccessCircle } from 'react-icons/bs';
import { FiArrowLeft } from 'react-icons/fi';

interface SidebarItemProps {
  item: IMenuItem;
  pathname: string;
  isExpanded: boolean;
  onSelect: () => void;
  isMobile: boolean;
}
interface AdminSidebarProps {
  menu: IMenuItem[];
  isExpanded: boolean;
  onClose: () => void;
}
interface SidebarContentProps {
  pathname: string;
  isExpanded: boolean;
  onSelect: () => void;
  menu: IMenuItem[];
  onClose: () => void;
  isMobile: boolean;
}

// Variants (3D perspective, stagger submenu)
const sidebarVariants: Variants = {
  open: {
    x: 0,
    rotateY: 0,
    width: 360,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
  closed: {
    x: '-100%',
    rotateY: -5, // 3D tilt close
    width: 0,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
  hoverOpen: { width: 288, x: 0, rotateY: 0 },
  hoverClosed: { width: 80, x: 0, rotateY: 0 },
};

const submenuVariants: Variants = {
  open: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.1 } }, // Stagger sequential
  closed: { opacity: 0, height: 0 },
};

const subItemVariants: Variants = {
  open: { opacity: 1, x: 0, scale: 1, rotateY: 0 }, // 3D fade-in
  closed: { opacity: 0, x: -10, scale: 0.95, rotateY: -5 },
};

// Sidebar Item (chỉ click toggle submenu, auto-open nếu active, no hover, width submenu bằng cha)
const SidebarItem = ({ item, pathname, isExpanded, onSelect }: SidebarItemProps) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasSubmenu = !!item.submenu?.length;
  const isActive = pathname === item.path || (hasSubmenu && item.submenu?.some((sub) => pathname === sub.path));

  const Icon = item.icon;

  // Auto-open nếu pathname match sub (accordian UX)
  useEffect(() => {
    if (hasSubmenu && item.submenu?.some((sub) => pathname === sub.path)) {
      setIsSubmenuOpen(true);
    }
  }, [pathname, hasSubmenu, item.submenu]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasSubmenu) {
      e.preventDefault();
      if (isExpanded) setIsSubmenuOpen((v) => !v); // Chỉ toggle trên click (mobile/desktop)
    } else {
      e.preventDefault();
      startTransition(() => {
        onSelect(); // Close sidebar
        router.push(item.path); // Smooth nav
      });
    }
  };

  return (
    <div className="relative mb-1 px-3">
      <Link
        href={hasSubmenu ? '#' : item.path}
        onClick={handleClick}
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
              {item.submenu?.map((sub: ISubMenuItem, index: number) => (
                <Link
                  key={sub.path}
                  href={sub.path}
                  onClick={onSelect}
                  className={`flex items-center gap-1 py-2 text-sm transition-all hover:translate-x-1 ${
                    pathname === sub.path ? 'font-semibold text-primary' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <PiDotDuotone className="text-white" /> {sub.title}
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
const SidebarContent = ({ pathname, isExpanded, onSelect, menu, isMobile }: SidebarContentProps) => (
  <div className="z-[999999] flex h-full flex-col overflow-hidden">
    {/* Logo Section */}
    <Link href="/" target="_blank" title="Về Trang Chủ">
      <div className="hidden h-24 items-center overflow-hidden px-2 xl:flex">
        <div className={`flex items-center gap-2 ${!isExpanded && 'mx-auto'}`}>
          <div className="relative hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_0_20px_rgba(var(--p),0.3)] xl:flex">
            {/* <div className="h-4 w-4 rotate-45 animate-ping rounded-sm bg-white" /> */}
            <BsUniversalAccessCircle size={35} className="animate-spin rounded-full bg-primary text-white" />
          </div>
          {isExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center text-[10px] text-white">
                <FiArrowLeft /> Trang chủ
              </div>
              <h1 className="whitespace-nowrap text-lg font-bold tracking-wider">
                <span className="text-primary">NGUONNHA</span>
                <span className="text-white">GIARE</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Online</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Link>

    {/* Navigation */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden pt-5 scrollbar-hide">
      <div className="mb-4 px-6 transition-opacity duration-300">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Menu</span>
      </div>
      {/* Menu */}
      <div className="flex-1 overflow-hidden overflow-y-auto pt-4 xl:pt-0">
        <Menu className="p-0">
          {menu.map((item) => (
            <SidebarItem key={item.path} item={item} pathname={pathname} isExpanded={isExpanded} onSelect={onSelect} isMobile={isMobile} />
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
export default function AdminSidebar({ menu, isExpanded, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsMobile(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveIsExpanded = isExpanded || isHoverExpanded;

  const handleSelect = () => {
    onClose();
    setIsHoverExpanded(false);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isExpanded ? 'open' : 'closed'}
        className="sticky top-0 h-screen w-[360px] bg-[#020617] xl:hidden"
        style={{ perspective: '1000px' }}
      >
        <SidebarContent pathname={pathname} isExpanded={isExpanded} onSelect={handleSelect} menu={menu} onClose={onClose} isMobile={isMobile} />
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={effectiveIsExpanded ? 'hoverOpen' : 'hoverClosed'}
        onMouseEnter={() => setIsHoverExpanded(true)}
        onMouseLeave={() => setIsHoverExpanded(false)}
        className="sticky top-0 hidden h-screen bg-[#020617] xl:block"
        style={{ perspective: '1000px' }}
      >
        <SidebarContent
          pathname={pathname}
          isExpanded={effectiveIsExpanded}
          onSelect={handleSelect}
          menu={menu}
          onClose={onClose}
          isMobile={isMobile}
        />
      </motion.aside>
    </>
  );
}
