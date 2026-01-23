'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { LuHandshake } from 'react-icons/lu';
import { AiFillHeart } from 'react-icons/ai';
import { TbHomeSearch } from 'react-icons/tb';
import HeaderResponsive from './HeaderResponsive';
import { menuItems } from '@/constants/menuItems';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { images } from '../../../public/images';
import { IoPerson } from 'react-icons/io5';
import { MeResponse } from '@/types/type/auth/auth';
import { Avatar, Dropdown } from 'react-daisyui';
import { HiOutlineArrowRightOnRectangle, HiOutlineUserCircle } from 'react-icons/hi2';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { useLogout } from '@/hooks/useLogout';

interface HeaderProps {
  user: MeResponse['data'];
}

const CODE_REGEX = /^[A-Z0-9]{6,10}$/;

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onLogout = useLogout();
  const { favoriteCount } = useRentalFavorite();

  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 90;
      setScrolled(isScrolled);
      controls.start({
        height: isScrolled ? 90 : 110,
        transition: { duration: 0.25 },
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls]);

  const handleSearch = useCallback(() => {
    const value = keyword.trim().toUpperCase();
    if (!value) return;

    if (!CODE_REGEX.test(value)) {
      return;
    }

    router.push(`/post/${value}`);
    setKeyword('');
  }, [keyword, router]);

  return (
    <header>
      <HeaderResponsive user={user} onLogout={onLogout} />

      {/* Desktop Header */}
      <motion.nav
        className={clsx('fixed left-0 top-0 z-[999999] hidden w-full border-b shadow-sm xl:block', scrolled ? 'bg-primary' : 'bg-primary')}
        animate={controls}
      >
        <div
          className={clsx(
            'flex w-full flex-row items-center justify-between px-desktop-padding transition-all duration-300',
            scrolled ? 'h-[90px]' : 'h-[110px]'
          )}
        >
          {/* Logo */}
          <Link href={'/'}>
            <Image
              title="Nguồn Nhà Giá Rẻ"
              src={images.Logo}
              alt={'Logo'}
              width={60}
              height={60}
              className={clsx('font-black text-primary transition-all duration-300', scrolled ? 'w-[60px]' : 'w-[90px]')}
            ></Image>
          </Link>
          {/* Middle Navigation */}
          <div className="flex flex-col items-center justify-center gap-2">
            {/* Menu */}
            <div className={clsx('flex flex-row items-center', scrolled ? 'gap-4' : 'gap-1')}>
              {menuItems.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-sm px-2 py-px font-bold transition-all duration-200 hover:scale-105',
                      scrolled ? 'text-xs 2xl:text-base' : 'text-xs 2xl:text-base',
                      isActive ? 'bg-primary-lighter text-primary' : 'text-white'
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
            {/* Search + CTA */}
            <div className="flex w-full items-center justify-center gap-4">
              {/* Search */}
              <div className="flex w-full max-w-xl items-center rounded-full bg-white p-1 font-medium ring-1 ring-white/15 backdrop-blur-xl focus-within:bg-primary-lighter">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập mã bài đăng (VD: 2802A1E)"
                  className={clsx(
                    'flex-1 bg-transparent px-5 text-sm text-primary placeholder:text-primary focus:outline-none',
                    scrolled ? 'h-6' : 'h-10'
                  )}
                />
                <button
                  onClick={handleSearch}
                  className={clsx(
                    'rounded-full bg-primary px-8 text-[11px] font-semibold uppercase tracking-widest text-white hover:border hover:border-primary hover:bg-primary-lighter hover:text-black',
                    scrolled ? 'h-6' : 'h-10'
                  )}
                >
                  Tìm kiếm
                </button>
              </div>

              {/* CTA */}
              {/* COMPACT */}
              {scrolled && (
                <>
                  <Link
                    href="/tu-van-tim-nha"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary bg-white p-1 text-black transition-all duration-200 hover:scale-105"
                  >
                    <TbHomeSearch size={20} />
                    {/* <p className="text-sm font-medium uppercase">Tìm nhà</p> */}
                  </Link>

                  <Link
                    href="/lien-he-ky-gui"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white bg-primary p-1 text-white transition-all duration-200 hover:scale-105"
                  >
                    <LuHandshake size={20} />
                    {/* <p className="text-sm font-medium uppercase">Kí gửi</p> */}
                  </Link>
                </>
              )}
              {/* FULL */}
              {!scrolled && (
                <>
                  <Link
                    href="/tu-van-tim-nha"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary bg-white px-3 py-1 text-black"
                  >
                    <TbHomeSearch size={30} />
                    <div className="flex flex-col">
                      <p className="text-xs">Tư vấn</p>
                      <p className="text-xs font-medium uppercase">Tìm nhà</p>
                    </div>
                  </Link>

                  <Link
                    href="/lien-he-ky-gui"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white bg-primary px-3 py-1 text-white"
                  >
                    <LuHandshake size={30} />
                    <div className="flex flex-col">
                      <p className="text-xs">Liên hệ</p>
                      <p className="text-xs font-medium uppercase">Kí gửi</p>
                    </div>
                  </Link>
                </>
              )}
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
          <div className="flex items-end gap-1">
            {/* Auth */}
            {!user ? (
              <Link
                href="/auth"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white bg-primary text-white transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <IoPerson size={20} />
              </Link>
            ) : (
              <Dropdown vertical="bottom" end>
                <div tabIndex={0} className="cursor-pointer">
                  {scrolled ? (
                    /* COMPACT */
                    <div className="flex items-center gap-1 rounded-md text-white transition-all hover:scale-105">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border">
                        <Avatar src={user.profile?.avatar} size="sm" />
                      </div>
                    </div>
                  ) : (
                    /* FULL */
                    <div className="group flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-white/10">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/20">
                        <Avatar src={user.profile?.avatar} size="sm" />
                      </div>

                      <div className="flex min-w-0 flex-col leading-tight">
                        <p className="max-w-[140px] truncate text-xs font-semibold text-white">{user.profile?.displayName}</p>
                        <p className="max-w-[140px] truncate text-[10px] text-white/60">Tài khoản</p>
                      </div>
                    </div>
                  )}
                </div>
                <Dropdown.Menu className="mt-2 w-fit rounded-lg border bg-white p-1">
                  {/* Account info */}
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar src={user.profile?.avatar} size="xs" />
                    <div className="min-w-0 max-w-[160px]">
                      <p className="truncate text-xs font-semibold text-gray-800">{user.profile?.displayName}</p>
                      <p className="break-all text-[10px] leading-snug text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <Dropdown.Item href="/profile" className="w-[200px] whitespace-nowrap rounded-md text-sm text-black hover:bg-primary/10">
                    <HiOutlineUserCircle size={16} />
                    Tài khoản
                  </Dropdown.Item>

                  <Dropdown.Item href="/yeu-thich" className="w-[200px] whitespace-nowrap rounded-md text-sm text-black hover:bg-primary/10">
                    <AiFillHeart size={16} />
                    Yêu thích{' '}
                    <span>
                      {favoriteCount > 0 && (
                        <span className="ml-1 inline-block rounded-full bg-red-600 px-2 py-px text-[10px] font-semibold text-white">
                          {favoriteCount}
                        </span>
                      )}
                    </span>
                  </Dropdown.Item>

                  <div className="my-1 h-px bg-gray-100" />

                  <Dropdown.Item
                    onClick={onLogout}
                    className="w-[200px] whitespace-nowrap rounded-md text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <HiOutlineArrowRightOnRectangle size={16} />
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* Favorites */}
            {/* <Link
              href="/yeu-thich"
              className="border- relative flex h-[30px] w-[30px] items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-md"
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
            </Link> */}
          </div>
        </div>
      </motion.nav>
    </header>
  );
}
