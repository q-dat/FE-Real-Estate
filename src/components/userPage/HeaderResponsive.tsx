'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiMenu, FiSearch, FiX } from 'react-icons/fi';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { menuItems } from '@/constants/menuItems.constants';
import Image from 'next/image';
import { images } from '../../../public/images';
import { AiFillHeart } from 'react-icons/ai';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { IoPerson } from 'react-icons/io5';
import { MeResponse } from '@/types/auth/auth.types';
import { HiOutlineArrowRightOnRectangle, HiOutlineChevronDown } from 'react-icons/hi2';
import { MdArrowForwardIos, MdLocationPin } from 'react-icons/md';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { formatCurrency } from '@/utils/formatCurrency.utils';

type SearchType = 'title' | 'code';

interface HeaderResponsiveProps {
  user: MeResponse['data'];
  onLogout: () => void;
  searchButtonLabel?: string;
  searchButtonClassName?: string;
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.04 + index * 0.03,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
};

const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 330,
      damping: 30,
      mass: 0.75,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.22,
      ease: 'easeInOut',
    },
  },
};

const searchPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -14,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.18,
      ease: 'easeInOut',
    },
  },
};

const getResultImage = (item: IRentalPostAdmin): string => {
  return item.images?.[0] || '/no-image.png';
};

const getResultHref = (item: IRentalPostAdmin): string => {
  if (item.code) return `/c/${item.code}`;
  return '/';
};

const getLocationText = (item: IRentalPostAdmin): string => {
  const parts = [item.district, item.province].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Đang cập nhật';
};

const getAreaText = (item: IRentalPostAdmin): string => {
  if (!item.area) return '';

  const dimension =
    item.frontageWidth && item.lotDepth ? ` · ${item.frontageWidth}x${item.lotDepth}` : '';

  return `${item.area}m²${dimension}`;
};

export default function HeaderResponsive({
  user,
  onLogout,
  searchButtonLabel = 'Tìm',
  searchButtonClassName,
}: HeaderResponsiveProps) {
  const router = useRouter();
  const { favoriteCount } = useRentalFavorite();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<IRentalPostAdmin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedKeyword = keyword.trim();
  const searchMinLength = searchType === 'code' ? 1 : 2;
  const canSearch = normalizedKeyword.length >= searchMinLength;

  const activeSearchLabel = useMemo(() => {
    return searchType === 'title' ? 'Tiêu đề' : 'Mã code';
  }, [searchType]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setSearchResults([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedKeyword) return;

    if (searchType === 'code' && searchResults.length === 1) {
      const item = searchResults[0];
      router.push(getResultHref(item));
      handleClearSearch();
      handleCloseSearch();
      return;
    }

    setShowDropdown(true);
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const timer = window.setTimeout(async () => {
      if (!canSearch) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        if (searchType === 'title') {
          const results = await rentalPostAdminService.getAll({
            title: normalizedKeyword,
            limit: 5,
          });

          setSearchResults(results || []);
          return;
        }

        const result = await rentalPostAdminService.getByCode(normalizedKeyword);
        setSearchResults(result ? [result] : []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canSearch, isSearchOpen, normalizedKeyword, searchType]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isSearchOpen) {
        handleCloseSearch();
        return;
      }

      if (isMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <header className="relative block xl:hidden">
      <div className="fixed left-0 top-0 z-[999999] w-full border-b border-white/15 bg-primary shadow-sm">
        <div className="flex h-[58px] items-center justify-between px-2">
          <Link href="/" className="flex h-[48px] w-[58px] items-center justify-start">
            <Image
              src={images.Logo}
              alt="Nguồn Nhà Giá Rẻ"
              width={54}
              height={54}
              priority
              className="h-[54px] w-[54px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenSearch}
              className={clsx(
                'inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:border-white/40 hover:bg-white/15',
                searchButtonClassName
              )}
            >
              <FiSearch size={15} />
              {searchButtonLabel}
            </button>

            <Link
              href="/yeu-thich"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/15"
            >
              <AiFillHeart
                size={19}
                className={clsx(favoriteCount > 0 ? 'text-red-300' : 'text-white')}
              />

              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-1 ring-white">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {!user ? (
              <Link
                href="/auth"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/15"
              >
                <IoPerson size={18} />
              </Link>
            ) : (
              <Link
                href="/profile"
                className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/30 bg-white/10"
              >
                <Image
                  src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                  alt="avatar"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/15"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-[999999] bg-black/45 px-2 pt-[66px] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={handleCloseSearch}
          >
            <motion.div
              variants={searchPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onMouseDown={(event) => event.stopPropagation()}
              className="mx-auto max-w-[720px] overflow-hidden rounded-xl border border-white/20 bg-white shadow-2xl"
            >
              <div className="border-b border-primary/10 bg-primary px-2 py-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                      Tìm kiếm bất động sản
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/65">
                      Tra nhanh theo tiêu đề hoặc mã bài đăng
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseSearch}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/15"
                  >
                    <FiX size={17} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex items-center rounded-lg border border-white/20 bg-white shadow-sm"
                >
                  <div className="relative shrink-0 border-r border-primary/10 px-2">
                    <select
                      value={searchType}
                      onChange={(event) => {
                        setSearchType(event.target.value as SearchType);
                        setKeyword('');
                        setSearchResults([]);
                        setShowDropdown(false);
                        searchInputRef.current?.focus();
                      }}
                      className="cursor-pointer appearance-none bg-transparent py-2.5 pr-5 text-[10px] font-black uppercase tracking-[0.14em] text-primary outline-none"
                    >
                      <option value="title">Tiêu đề</option>
                      <option value="code">Mã code</option>
                    </select>

                    <HiOutlineChevronDown
                      className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-primary/70"
                      size={12}
                    />
                  </div>

                  <input
                    ref={searchInputRef}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onFocus={() => {
                      if (canSearch) setShowDropdown(true);
                    }}
                    placeholder={searchType === 'title' ? 'Nhập tiêu đề căn nhà...' : 'Nhập mã bài...'}
                    className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-neutral-950 outline-none placeholder:text-neutral-400"
                  />

                  {keyword ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <FiX size={16} />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="mr-1 h-9 rounded-md bg-primary px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-primary/90"
                  >
                    Tìm
                  </button>
                </form>
              </div>

              <div className="bg-white">
                {showDropdown && canSearch ? (
                  <>
                    <div className="flex items-center justify-between border-b border-neutral-100 px-2 py-2">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
                        {activeSearchLabel}: {keyword}
                      </p>

                      {searchType === 'code' ? (
                        <span className="rounded-md border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary">
                          Code
                        </span>
                      ) : null}
                    </div>

                    {isSearching ? (
                      <div className="flex items-center gap-2 px-3 py-4 text-xs font-semibold text-neutral-500">
                        <span className="loading loading-spinner loading-xs text-primary" />
                        Đang tìm kiếm...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[58dvh] overflow-y-auto py-1 [scrollbar-width:thin]">
                        {searchResults.map((item) => (
                          <Link
                            key={item._id}
                            href={getResultHref(item)}
                            onClick={() => {
                              setShowDropdown(false);
                              setIsSearchOpen(false);
                              setKeyword('');
                            }}
                            className="group flex gap-2 border-b border-neutral-100 px-2 py-2 transition last:border-b-0 hover:bg-primary/5"
                          >
                            <div className="relative h-[72px] w-[92px] shrink-0 overflow-hidden rounded-lg bg-primary/5">
                              <Image
                                src={getResultImage(item)}
                                alt={item.title}
                                fill
                                unoptimized
                                sizes="92px"
                                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                              />

                              {item.code ? (
                                <div className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-black text-white">
                                  {item.code}
                                </div>
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="line-clamp-2 text-xs font-black leading-snug text-neutral-950 group-hover:text-primary">
                                {item.title}
                              </h4>

                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.propertyType ? (
                                  <span className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                                    {item.propertyType}
                                  </span>
                                ) : null}

                                {item.locationType ? (
                                  <span className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                                    {item.locationType}
                                  </span>
                                ) : null}

                                {getAreaText(item) ? (
                                  <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-600">
                                    {getAreaText(item)}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="shrink-0 text-xs font-black text-primary">
                                  {formatCurrency(item.price)} {item.priceUnit}
                                </span>

                                <span className="min-w-0 truncate text-[10px] font-medium text-neutral-500">
                                  {getLocationText(item)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-4 text-center text-xs font-semibold text-neutral-500">
                        Không tìm thấy kết quả phù hợp.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-4">
                    <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-3">
                      <p className="text-xs font-black text-primary">Gợi ý tìm kiếm</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                        Nhập tối thiểu hai ký tự khi tìm theo tiêu đề, hoặc một ký tự khi tìm theo mã bài.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[999999] bg-black/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-0 z-[999999] flex h-full w-[84vw] max-w-[340px] flex-col bg-white text-neutral-950 shadow-2xl"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b bg-primary border-neutral-200 px-3 py-3">
                <Link href="/" onClick={closeMenu} className="flex h-[44px] w-[58px] items-center">
                  <Image
                    src={images.Logo}
                    alt="Nguồn Nhà Giá Rẻ"
                    width={54}
                    height={54}
                    className="h-[54px] w-[54px] object-contain  rounded-full"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:bg-neutral-100"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="border-b border-neutral-200 bg-neutral-50/70 p-2">
                {!user ? (
                  <Link
                    href="/auth"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-2 py-2 text-primary shadow-sm transition hover:bg-primary/5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
                      <IoPerson size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black">Đăng nhập / Đăng ký</p>
                      <p className="text-[10px] font-semibold text-neutral-500">
                        Quản lý tài khoản và tin yêu thích
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block rounded-lg border border-neutral-200 bg-white p-2 shadow-sm transition hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                        <Image
                          src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                          alt="avatar"
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-neutral-950">
                          {user.profile?.displayName}
                        </p>
                        <p className="truncate text-[11px] font-medium text-neutral-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                          Quản lý tài khoản
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {user ? (
                <div className="border-b border-neutral-200 p-2">
                  <Link
                    href="/cms/admin/dashboard"
                    onClick={closeMenu}
                    className="block rounded-md border border-primary bg-primary px-2 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-primary/90"
                  >
                    Quản lý bài đăng
                  </Link>
                </div>
              ) : null}

              <motion.nav
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2 [scrollbar-width:thin]"
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {menuItems.map((item, index) => (
                  <motion.div key={item.link} custom={index} variants={textVariants}>
                    <Link
                      href={item.link}
                      onClick={closeMenu}
                      className="group flex items-center justify-between rounded-md border border-transparent px-2 py-2 text-sm font-bold text-neutral-700 transition hover:border-primary/10 hover:bg-primary/5 hover:text-primary"
                    >
                      <span>{item.title}</span>
                      <MdArrowForwardIos
                        size={12}
                        className="text-neutral-300 transition group-hover:text-primary"
                      />
                    </Link>
                  </motion.div>
                ))}

                <Link
                  href="/yeu-thich"
                  onClick={closeMenu}
                  className="mt-1 flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-2 py-2 text-sm font-bold text-neutral-800 transition hover:border-primary/15 hover:bg-primary/5 hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <AiFillHeart className={favoriteCount > 0 ? 'text-red-500' : 'text-neutral-400'} />
                    Bất động sản yêu thích
                  </span>

                  {favoriteCount > 0 ? (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                      {favoriteCount}
                    </span>
                  ) : null}
                </Link>
              </motion.nav>

              {user ? (
                <div className="border-t border-neutral-200 bg-neutral-50 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-black text-red-600 transition hover:bg-red-50"
                  >
                    <HiOutlineArrowRightOnRectangle size={18} />
                    Đăng xuất
                  </button>
                </div>
              ) : null}

              <div className="border-t border-neutral-200 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                © 2026 Nguonnhagiare.vn
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}