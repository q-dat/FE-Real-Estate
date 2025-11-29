'use client';
import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaRegHeart } from 'react-icons/fa6';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { menuItems } from '@/constants/menuItems';

// 🧩 Biến variants cho chữ (menu items)
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

export default function HeaderResponsive() {
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
      <div className="fixed z-[99999] flex h-[60px] w-full items-center justify-between bg-white px-4 shadow-sm">
        <div className="select-none text-lg font-bold text-blue-600">nguonnhagiare.vn</div>

        <div className="flex items-center gap-3">
          <FaRegHeart size="20px" className="text-gray-700" />
          <button onClick={toggleMenu}>
            <FiMenu size="24px" className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Overlay + Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay background */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
            />

            {/* Drawer Menu */}
            <motion.div
              className="fixed right-0 top-0 z-50 flex h-full w-3/4 max-w-[300px] flex-col bg-white shadow-2xl"
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
              <div className="flex items-center justify-between border-b p-4">
                <span className="text-lg font-semibold text-gray-800">Menu</span>
                <button onClick={toggleMenu}>
                  <FiX size="24px" className="text-gray-700" />
                </button>
              </div>

              {/* Navigation Links */}
              <motion.nav className="flex flex-col gap-3 px-0 py-4 text-base text-gray-700" initial="hidden" animate="visible" exit="hidden">
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
              </motion.nav>

              {/* Optional Footer */}
              <div className="mt-auto border-t p-4 text-sm text-gray-500">© 2025 MyWebsite</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
