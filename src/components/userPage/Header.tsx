'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; // tiện cho xử lý class động
import { Button } from 'react-daisyui';
import { FiEdit } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import FilterBar from './filterBar/FilterBar';
import HeaderResponsive from './HeaderResponsive';
import { menuItems } from '@/constants/menuItems';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';

export default function Header() {
  const pathname = usePathname();
  const { favoriteCount } = useRentalFavorite();

  return (
    <header>
      {/* Header Responsive */}
      <HeaderResponsive />

      {/* Header Desktop */}
      <nav className="hidden xl:block">
        <div className="flex h-[15vh] w-full flex-row items-center justify-between border-b bg-white px-desktop-padding py-[10px] shadow-sm">
          {/* Logo */}
          <div className="pr-5">
            <p className="text-2xl font-black italic text-blue-600">LoGo</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* Navigation */}
            <div className="flex flex-row items-center gap-8">
              {menuItems.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-sm px-3 py-[6px] text-xl font-semibold transition-all duration-200',
                      isActive ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white' : 'text-black hover:bg-blue-100'
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
            <div>213</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Favorites */}
            <Link href="/yeu-thich" className="relative flex items-center">
              <AiFillHeart className="text-2xl text-red-500 transition hover:scale-110" />
              {favoriteCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white shadow">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {/* Đăng tin */}
            <Button className="rounded-md bg-red-600 text-sm font-medium text-white" size="sm">
              <FiEdit size="18px" /> Đăng tin
            </Button>
          </div>
        </div>
      </nav>

      {/* FilterBar */}
      <FilterBar />
    </header>
  );
}
