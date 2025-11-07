'use client';
import React from 'react';
import Link from 'next/link';
import { menuItems } from '@/constants/menuItems';

export default function FooterFC() {
  return (
    <footer className="bg-white text-black">
      <div className="px-2 py-10 shadow-2xl shadow-black xl:px-desktop-padding">
        {/* Logo & giới thiệu */}
        <div className="flex flex-col items-center justify-between gap-8 border-b border-white/10 pb-8 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-primary">RentalHub</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-400">
              Nền tảng tìm kiếm & đăng tin thuê phòng, nhà, căn hộ hiện đại — giúp bạn kết nối nhanh chóng, an toàn và hiệu quả.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-300 md:justify-end">
            {menuItems.map((item) => (
              <Link key={item.link} href={item.link} className="transition-colors duration-300 hover:text-primary">
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Dòng bản quyền */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} RentalHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/chinh-sach-bao-mat" className="hover:text-primary">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan" className="hover:text-primary">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
