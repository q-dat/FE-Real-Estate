'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; // tiện cho xử lý class động
import { LuHandshake } from 'react-icons/lu';
import { AiFillHeart } from 'react-icons/ai';
import { TbHomeSearch } from 'react-icons/tb';
import HeaderResponsive from './HeaderResponsive';
import { menuItems } from '@/constants/menuItems';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { images } from '../../../public/images';

export default function Header() {
  const pathname = usePathname();
  const { favoriteCount } = useRentalFavorite();

  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 90) {
        setScrolled(true);
        controls.start({ height: 70, transition: { duration: 0.25 } });
      } else {
        setScrolled(false);
        controls.start({ height: 100, transition: { duration: 0.25 } });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls]);

  return (
    <header>
      <HeaderResponsive />

      {/* Desktop Header */}
      <motion.nav
        className={clsx('fixed left-0 top-0 z-[99999] hidden w-full border-b shadow-sm xl:block', scrolled ? 'bg-primary' : 'bg-primary')}
        animate={controls}
      >
        <div
          className={clsx(
            'flex w-full flex-row items-center justify-between px-desktop-padding transition-all duration-300',
            scrolled ? 'h-[70px]' : 'h-[100px]'
          )}
        >
          {/* Logo */}
          {/* <p className={clsx('font-black text-primary transition-all duration-300', scrolled ? 'text-2xl text-white' : 'text-2xl')}>
            Nguonnhagiare.vn
          </p> */}
          <Link href={'/'}>
            <Image
              src={images.Logo}
              alt={'Logo'}
              width={60}
              height={60}
              className={clsx('font-black text-primary transition-all duration-300', scrolled ? 'w-[60px]' : 'w-[90px]')}
            ></Image>
          </Link>
          {/* Middle Navigation */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className={clsx('flex flex-row items-center', scrolled ? 'gap-5' : 'gap-2')}>
              {menuItems.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-sm px-2 py-1 font-bold transition-all duration-200 hover:scale-105',
                      scrolled ? 'text-sm' : 'text-sm',
                      isActive ? 'bg-primary-lighter text-primary' : 'text-white'
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>

            {/* Middle line + menu2 hidden when scrolled */}
            {/* {!scrolled && <p className="h-px w-full bg-primary" />}

            {!scrolled && (
              <div className="flex flex-row items-center gap-10">
                {menuItems2.map((item) => (
                  <Link key={item.link} href={item.link} className="rounded-sm px-3 py-1 text-base font-normal transition-all duration-200">
                    {item.title}
                  </Link>
                ))}
              </div>
            )} */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* ======================  
                LOGIC HIỂN THỊ BUTTON  
                ====================== */}

            {/* Khi scroll xuống → HIỆN nút lớn KHÔNG có chữ nhỏ */}
            {scrolled && (
              <>
                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-primary bg-white p-1 text-black transition-all duration-200 hover:scale-105"
                >
                  <TbHomeSearch size={30} />
                  <p className="text-base font-bold uppercase">Tìm nhà</p>
                </Link>

                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-white bg-primary p-1 text-white transition-all duration-200 hover:scale-105"
                >
                  <LuHandshake size={30} />
                  <p className="text-base font-bold uppercase">Kí gửi</p>
                </Link>
              </>
            )}

            {/* Khi chưa scroll → HIỆN version đầy đủ (có chữ nhỏ) */}
            {!scrolled && (
              <>
                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-primary bg-white p-2 text-black"
                >
                  <TbHomeSearch size={30} />
                  <div className="flex flex-col">
                    <p className="text-xs">Tư vấn</p>
                    <p className="text-xs font-bold uppercase">Tìm nhà</p>
                  </div>
                </Link>

                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-[120px] items-center justify-center gap-1 rounded-md border border-primary bg-primary p-2 text-white"
                >
                  <LuHandshake size={30} />
                  <div className="flex flex-col">
                    <p className="text-xs">Liên hệ</p>
                    <p className="text-xs font-bold uppercase">Kí gửi</p>
                  </div>
                </Link>
              </>
            )}

            {/* Favorites */}
            <Link
              href="/yeu-thich"
              className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full border border-red-300 bg-white transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <AiFillHeart
                size={20}
                className={clsx('transition-colors duration-200', favoriteCount > 0 ? 'text-red-600' : 'text-gray-400 hover:text-red-500')}
              />

              {favoriteCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-600 text-xs font-semibold text-white shadow-md">
                  {favoriteCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.nav>
    </header>
  );
}
