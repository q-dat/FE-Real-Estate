'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; // tiện cho xử lý class động
import { Button } from 'react-daisyui';
import { FiEdit } from 'react-icons/fi';
import FilterBar from './filterBar/FilterBar';

const menuItems = [
  { title: 'Cho thuê phòng trọ', link: '/phong-tro' },
  { title: 'Cho thuê nhà ở', link: '/nha-o' },
  { title: 'Cho thuê căn hộ', link: '/can-ho' },
  { title: 'Cho thuê mặt bằng', link: '/mat-bang' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header>
      <nav className="hidden xl:block">
        <div className="flex w-full flex-row items-center justify-between border-b bg-white px-[50px] py-[10px] shadow-sm">
          <div className="inline-flex items-center text-sm font-bold">
            {/* Logo */}
            <div className="pr-5">
              <p className="text-2xl font-black italic text-blue-600">Tìm Trọ Quốc Đạt</p>
            </div>
            {/* Navigation */}
            <div className="flex flex-row items-center">
              {menuItems.map((item) => {
                const isActive = pathname === item.link;

                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-lg px-3 py-[6px] text-sm transition-all duration-200',
                      isActive ? 'bg-red-600 font-semibold text-white shadow-sm hover:bg-red-600 hover:text-white' : 'text-black hover:bg-blue-100'
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Notification */}
          <div>
            <div>
              <Button className="rounded-md bg-red-600 text-sm font-medium text-white" size="sm">
                <FiEdit size="18px" /> Đăng tin
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* FilterBar */}
      <FilterBar />
    </header>
  );
}
