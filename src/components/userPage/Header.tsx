'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx'; // tiện cho xử lý class động
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
interface HeaderProps {
  user: MeResponse['data'];
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
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

  const onLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <header>
      <HeaderResponsive />

      {/* Desktop Header */}
      <motion.nav
        className={clsx('fixed left-0 top-0 z-[999999] hidden w-full border-b shadow-sm xl:block', scrolled ? 'bg-primary' : 'bg-primary')}
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
            <div className={clsx('flex flex-row items-center', scrolled ? 'gap-4' : 'gap-1')}>
              {menuItems.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={clsx(
                      'rounded-sm px-2 py-1 font-bold transition-all duration-200 hover:scale-105',
                      scrolled ? 'text-xs 2xl:text-base' : 'text-xs 2xl:text-base',
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
          <div className="flex items-end gap-1">
            {/* COMPACT */}
            {scrolled && (
              <>
                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary bg-white p-1 text-black transition-all duration-200 hover:scale-105"
                >
                  <TbHomeSearch size={24} />
                  <p className="text-sm font-bold uppercase">Tìm nhà</p>
                </Link>

                <Link
                  href="/lien-he-ky-gui"
                  className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white bg-primary p-1 text-white transition-all duration-200 hover:scale-105"
                >
                  <LuHandshake size={24} />
                  <p className="text-sm font-bold uppercase">Kí gửi</p>
                </Link>
              </>
            )}
            {/* FULL */}
            {!scrolled && (
              <>
                <Link
                  href="/tu-van-tim-nha"
                  className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary bg-white p-2 text-black"
                >
                  <TbHomeSearch size={30} />
                  <div className="flex flex-col">
                    <p className="text-xs">Tư vấn</p>
                    <p className="text-xs font-bold uppercase">Tìm nhà</p>
                  </div>
                </Link>

                <Link
                  href="/lien-he-ky-gui"
                  className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white bg-primary p-2 text-white"
                >
                  <LuHandshake size={30} />
                  <div className="flex flex-col">
                    <p className="text-xs">Liên hệ</p>
                    <p className="text-xs font-bold uppercase">Kí gửi</p>
                  </div>
                </Link>
              </>
            )}

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
                    <div className="flex items-center gap-1 rounded-md border border-white p-1 text-white transition-all hover:scale-105">
                      <div className="relative h-6 w-6 overflow-hidden rounded-md">
                        <Image
                          src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                          alt="User avatar"
                          fill
                          sizes="20px"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <p className="max-w-[70px] truncate text-xs font-bold uppercase leading-none">
                        {user.profile?.displayName?.split(' ').slice(-1)[0] || user.profile?.username}
                      </p>
                    </div>
                  ) : (
                    /* FULL */
                    <div className="flex items-center gap-1.5 rounded-md border border-white p-1 text-white transition-all hover:scale-105">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                          alt="User avatar"
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <p className="line-clamp-3 max-w-[90px] text-xs font-bold uppercase">{user.profile?.displayName || user.profile?.username}</p>
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
                  <Dropdown.Item href="/profile" className="w-[200px] whitespace-nowrap rounded-md text-sm hover:bg-primary/10">
                    <HiOutlineUserCircle size={16} />
                    Tài khoản
                  </Dropdown.Item>

                  <Dropdown.Item href="/yeu-thich" className="w-[200px] whitespace-nowrap rounded-md text-sm hover:bg-primary/10">
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
