'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; // tiện cho xử lý class động
import { LuHandshake } from 'react-icons/lu';
import { AiFillHeart } from 'react-icons/ai';
import { TbHomeSearch } from 'react-icons/tb';
import HeaderResponsive from './HeaderResponsive';
import { menuItems, menuItems2 } from '@/constants/menuItems';
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
          <div className="w-[150px]">
            <p className="text-2xl font-black italic text-blue-600">LoGo</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            {/* Navigation */}
            <div className="flex flex-row items-center gap-10">
              {menuItems.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-sm px-3 py-1 text-lg font-bold transition-all duration-200',
                      isActive ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white' : 'text-black hover:bg-blue-100'
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
            <p className="h-px w-full bg-primary"></p>
            {/* Navigation */}
            <div className="flex flex-row items-center gap-10">
              {menuItems2.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link key={item.link} href={item.link} className="rounded-sm px-3 py-1 text-base font-normal transition-all duration-200">
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/tu-van-tim-nha"
              className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-primary bg-white p-2 text-black"
            >
              <TbHomeSearch size={30} />
              <div className="flex flex-col">
                <p className="text-xs">Tư vấn</p>
                <p className="text-sm font-bold uppercase">Tìm nhà</p>
              </div>
            </Link>

            <Link
              href="/tu-van-tim-nha"
              className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-primary bg-primary p-2 text-white"
            >
              <LuHandshake size={30} />
              <div className="flex flex-col">
                <p className="text-xs">Liên hệ</p>
                <p className="text-sm font-bold uppercase">Kí gửi</p>
              </div>
            </Link>

            {/* Favorites */}
            <Link
              href="/yeu-thich"
              className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full border border-red-300 bg-white transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <AiFillHeart
                size={30}
                className={clsx('transition-colors duration-200', favoriteCount > 0 ? 'text-red-600' : 'text-gray-400 hover:text-red-500')}
              />

              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white shadow-md">
                  {favoriteCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
