'use client';
import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import clsx from 'clsx';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { menuItems } from '@/constants/menuItems';
import Image from 'next/image';
import { images } from '../../../public/images';
import { AiFillHeart } from 'react-icons/ai';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { IoPerson, IoShieldCheckmarkSharp } from 'react-icons/io5';
import { MeResponse } from '@/types/type/auth/auth';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

// Biến variants cho chữ (menu items)
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.08,
      type: 'spring' as const,
      stiffness: 260,
      damping: 18,
    },
  }),
};

interface HeaderResponsiveProps {
  user: MeResponse['data'];
  onLogout: () => void;
}

export default function HeaderResponsive({ user, onLogout }: HeaderResponsiveProps) {
  const { favoriteCount } = useRentalFavorite();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const toggleMenu = () => setIsMenuOpen((p) => !p);

  // 🧠 Ẩn scroll khi menu mở
  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <header className="relative block xl:hidden">
      {/* Top Header */}
      <div className="fixed z-[999999] flex h-[60px] w-full items-center justify-between bg-primary px-4 shadow-sm">
        {/* <div className="select-none text-lg font-bold text-blue-600">nguonnhagiare.vn</div> */}
        <div>
          <Link href={'/'}>
            <Image
              src={images.Logo}
              alt={'Logo'}
              width={50}
              height={50}
              className={'w-[50px] font-black text-primary transition-all duration-300'}
            ></Image>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {/* Favorite */}
          <Link
            href="/yeu-thich"
            className="rounded-fulltransition-all relative flex items-center justify-center duration-200 hover:scale-105 hover:shadow-md"
          >
            <AiFillHeart
              size={24}
              className={clsx('transition-colors duration-200', favoriteCount > 0 ? 'text-red-600' : 'text-white xl:hover:text-red-500')}
            />

            {favoriteCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-600 text-xs font-semibold text-white shadow-md">
                {favoriteCount}
              </span>
            )}
          </Link>
          {/* Auth */}
          {!user ? (
            <Link href="/auth" className="flex items-center justify-center rounded-full transition-all">
              <IoPerson size={20} className="text-white" />
            </Link>
          ) : (
            <Link href="/profile" className="flex items-center gap-2 rounded-full transition-all">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                <Image
                  src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                  alt="avatar"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            </Link>
          )}

          {/* Menu Button */}
          <button onClick={toggleMenu}>
            <FiMenu size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* Overlay + Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay background */}
            <motion.div
              className="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
            />

            {/* Drawer Menu */}
            <motion.div
              className="fixed right-0 top-0 z-[999999] flex h-full w-3/4 max-w-[300px] flex-col bg-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{
                x: 0,
                transition: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 22,
                  mass: 0.8,
                },
              }}
              exit={{
                x: '100%',
                transition: { duration: 0.25, ease: 'easeInOut' },
              }}
            >
              {/* Header Drawer */}
              <div className="flex items-center justify-between border-b bg-primary p-4 text-white">
                <span className="flex items-center gap-0.5 whitespace-nowrap text-sm font-semibold">
                  Nguồn Nhà Giá Rẻ <IoShieldCheckmarkSharp className="text-green-400" />
                </span>
                <button onClick={toggleMenu}>
                  <FiX size={24} />
                </button>
              </div>

              {/* Navigation Links */}
              <motion.nav className="flex flex-col gap-3 text-base text-gray-700" initial="hidden" animate="visible" exit="hidden">
                {/* Account Section */}
                <div className="border-b p-2">
                  {!user ? (
                    <Link href="/auth" onClick={toggleMenu} className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-white">
                      <IoPerson size={20} />
                      <span className="text-sm font-semibold">Đăng nhập / Đăng ký</span>
                    </Link>
                  ) : (
                    <Link href="/profile" onClick={toggleMenu}>
                      <div className="flex items-start gap-3">
                        <div className="relative h-[60px] w-[60px] overflow-hidden rounded-full border">
                          <Image
                            src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                            alt="avatar"
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-red-700">@{user.profile?.username}</p>
                          <p className="truncate text-lg font-semibold text-gray-900">{user.profile?.displayName}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                          <p className="truncate py-1 text-end text-xs text-blue-700 underline">Quản lý tài khoản </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
                {/* Menu Items */}
                {menuItems.map((item, i) => (
                  <motion.div key={item.link} custom={i} variants={textVariants}>
                    <Link
                      href={item.link}
                      onClick={toggleMenu}
                      className={`group relative block rounded-lg px-2 py-2 transition ${
                        ''
                        // item.danger
                        //   ? 'text-red-600 hover:bg-red-50'
                        //   : 'hover:bg-blue-50 hover:text-blue-600'
                      } `}
                    >
                      {item.title}
                      {/* Hiệu ứng underline trượt */}
                      <span className="absolute bottom-0 left-2 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-[calc(100%-1rem)]"></span>
                    </Link>
                  </motion.div>
                ))}
                {/* User Account Section */}
                {user && (
                  <div className="border-t p-2 text-sm">
                    <button
                      onClick={() => {
                        onLogout();
                        toggleMenu();
                      }}
                      className="flex w-full items-center gap-2 rounded-md font-semibold text-red-600 hover:bg-red-50"
                    >
                      <HiOutlineArrowRightOnRectangle size={18} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </motion.nav>

              {/* Optional Footer */}
              <div className="mt-auto border-t p-4 text-sm text-gray-500">© 2025 Nguonnhagiare.vn</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
