'use client';
import {
  HiBars3BottomLeft,
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import { Navbar, Button, Indicator, Dropdown, Avatar } from 'react-daisyui';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface AdminNavbarProps {
  title: string;
  onMenuClick: () => void;
}

export default function AdminNavbar({ title, onMenuClick }: AdminNavbarProps) {
  const router = useRouter();

  const onLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <Navbar className="sticky top-0 z-[999999] w-full border-b border-white/5 bg-[#020617] px-0 backdrop-blur-xl transition-all xl:px-6">
      {/* LEFT SECTION: Mobile Toggle & Context Info */}
      <Navbar.Start>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button shape="square" className="border-none text-slate-400 xl:hidden xl:hover:bg-primary/10 xl:hover:text-primary" onClick={onMenuClick}>
            <HiBars3BottomLeft size={24} />
          </Button>
        </motion.div>

        <div className="hidden flex-col md:flex">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-semibold uppercase tracking-tight text-white"
          >
            Quản Lý Danh Sách {title}
          </motion.h2>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-slate-500">
            <span className="h-1 w-1 rounded-full bg-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            <span className="text-slate-400">Xin Chào, đây là trang Danh Sách {title}</span>
          </div>
        </div>
      </Navbar.Start>

      {/* CENTER SECTION: Search Bar - International UI Standard */}
      <Navbar.Center className="hidden w-1/2 max-w-md lg:flex">
        <div className="group relative w-full">
          <HiOutlineMagnifyingGlass
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh (Ctrl + F)..."
            className="w-full rounded-2xl border border-white/5 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-primary/30 focus:bg-white/10 focus:ring-4 focus:ring-primary/5"
          />
          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500 group-focus-within:hidden md:flex">
            <span>⌘</span>
            <span>F</span>
          </div>
        </div>
      </Navbar.Center>

      {/* RIGHT SECTION: Notifications & Profile */}
      <Navbar.End>
        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button shape="circle" className="relative w-10 border-none text-slate-400 xl:hover:bg-white/5 xl:hover:text-primary">
            <Indicator>
              <HiOutlineBell size={22} />
              <span className="badge badge-primary badge-xs absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse border-none shadow-[0_0_8px_rgba(var(--p),0.6)]" />
            </Indicator>
          </Button>
        </motion.div>

        <div className="mx-1 h-6 w-[1px] bg-white/10" />

        {/* User Dropdown */}
        <Dropdown vertical="bottom" end>
          <Dropdown.Toggle className="flex w-fit items-center gap-3 rounded-2xl border-none transition-all xl:w-full xl:hover:bg-white/5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold leading-tight text-white">Admin</p>
              <p className="text-[10px] font-medium uppercase tracking-tighter text-primary/70">Administrator</p>
            </div>
            <div className="relative">
              <Avatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Man"
                size="xs"
                className="rounded-xl ring-2 ring-primary/20 transition-all xl:hover:ring-primary/50"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#020617] bg-green-500" />
            </div>
            <HiOutlineChevronDown size={12} className="text-slate-500" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="animate-in fade-in zoom-in mt-4 w-64 rounded-2xl border border-white/10 bg-[#0f172a]/95 p-2 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl duration-200">
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
              <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Man" size="xs" className="rounded-lg" />
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-white">Điểu Quốc Đạt</p>
                <p className="truncate text-[10px] text-slate-500">dat.pro@enterprise.com</p>
              </div>
            </div>

            <div className="space-y-1 px-1">
              <Dropdown.Item className="group rounded-lg py-2.5 text-sm text-slate-400 xl:hover:bg-primary/10 xl:hover:text-primary">
                <HiOutlineUserCircle size={18} />
                Thông tin hồ sơ
              </Dropdown.Item>

              <Dropdown.Item className="group rounded-lg py-2.5 text-sm text-slate-400 xl:hover:bg-primary/10 xl:hover:text-primary">
                <HiOutlineCog6Tooth size={18} />
                Cấu hình hệ thống
              </Dropdown.Item>

              <div className="my-2 h-px bg-white/5" />

              <Dropdown.Item
                onClick={onLogout}
                className="group rounded-lg py-2.5 text-sm font-semibold text-error/80 xl:hover:bg-error/10 xl:hover:text-error"
              >
                <HiOutlineArrowRightOnRectangle size={18} />
                Thoát ứng dụng
              </Dropdown.Item>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.End>
    </Navbar>
  );
}
