'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { LuHandshake } from 'react-icons/lu';
import { AiFillHeart } from 'react-icons/ai';
import { TbHomeSearch } from 'react-icons/tb';
import HeaderResponsive from './HeaderResponsive';
import { menuItems } from '@/constants/menuItems.constants';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { images } from '../../../public/images';
import { IoPerson } from 'react-icons/io5';
import { MeResponse } from '@/types/auth/auth.types';
import { Avatar, Dropdown } from 'react-daisyui';
import { HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiOutlineChevronDown } from 'react-icons/hi2';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { useLogout } from '@/hooks/useLogout';
import { formatCurrency } from '@/utils/formatCurrency.utils';
import { slugify } from '@/lib/slugify';
import { RentalSearchResult } from '@/types/rentalGridItem';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import type { SearchKind } from '@/types/rentalGridItem';

interface HeaderProps {
  user: MeResponse['data'];
}

// Tô đỏ cụm khớp (case-insensitive, giữ nguyên văn bản gốc).
function highlightMatch(text: string, phrase?: string): React.ReactNode {
  if (!phrase) return text;
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-red-600">{text.slice(idx, idx + phrase.length)}</span>
      {text.slice(idx + phrase.length)}
    </>
  );
}


function getFeatureTags(item: RentalSearchResult): string[] {
  const tags = [
    item.bedroomNumber && item.bedroomNumber > 0 ? `${item.bedroomNumber} phòng ngủ` : '',
    item.floorNumber && item.floorNumber > 0 ? `${item.floorNumber} tầng` : '',
    item.toiletNumber && item.toiletNumber > 0 ? `${item.toiletNumber} WC` : '',
  ].filter(Boolean);

  const matched = new Set(
    (item.matchedAttributes ?? []).map((attribute) => attribute.displayText.trim().toLowerCase())
  );

  return tags.filter((tag) => !matched.has(tag.toLowerCase()));
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onLogout = useLogout();
  const { favoriteCount } = useRentalFavorite();

  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);

  const [searchType, setSearchType] = useState<SearchKind>('title');
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { results: searchResults, isSearching, error: searchError, run: runSearch, reset: resetSearch } =
    useSearchSuggestions({ debounce: 450 });

  useEffect(() => {
    runSearch(keyword, searchType as SearchKind);
    if (keyword.trim().length >= 1) setShowDropdown(true);
    else { setShowDropdown(false); setActiveIndex(-1); }
  }, [keyword, searchType, runSearch]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setKeyword('');
    setShowDropdown(false);
    resetSearch();
    setActiveIndex(-1);
  };

  const goToDetail = (hit: RentalSearchResult) => {
    setShowDropdown(false);
    router.push(`/${slugify(hit.title)}-${hit._id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        e.preventDefault();
        goToDetail(searchResults[activeIndex]);
      } else if (keyword.trim().length >= 1) {
        setShowDropdown(false);
        router.push(`/tim-kiem?q=${encodeURIComponent(keyword.trim())}`);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'code' && searchResults.length === 1) {
      goToDetail(searchResults[0]);
      setKeyword('');
      return;
    }
    if (keyword.trim().length >= 1) {
      setShowDropdown(true);
      router.push(`/tim-kiem?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

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
            />
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
              {/* VÙNG CHỨA SEARCH & DROPDOWN */}
              <div ref={searchContainerRef} className="relative flex w-full max-w-xl items-center">
                <form
                  onSubmit={handleFormSubmit}
                  className="flex w-full items-center rounded-full bg-white p-1 font-medium ring-1 ring-white/15 backdrop-blur-xl focus-within:bg-primary-lighter"
                >
                  {/* BỘ LỌC TÌM KIẾM (TITLE HAY CODE) */}
                  <div className="relative flex items-center border-r border-primary/20 pl-4 pr-2">
                    <select
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value as SearchKind);
                        setKeyword('');
                        resetSearch();
                        setShowDropdown(false);
                      }}
                      className="cursor-pointer appearance-none bg-transparent py-1 pr-4 text-[11px] font-bold uppercase tracking-wider text-primary outline-none"
                    >
                      <option className="rounded-md p-1" value="title">
                        Tiêu đề
                      </option>
                      <option className="rounded-md p-1" value="code">
                        Mã Code
                      </option>
                    </select>
                    <HiOutlineChevronDown className="pointer-events-none absolute right-2 text-primary" size={12} />
                  </div>

                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (keyword.length >= 1) setShowDropdown(true);
                    }}
                    aria-label="Tìm kiếm bất động sản"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="header-search-list"
                    aria-autocomplete="list"
                    placeholder={searchType === 'title' ? 'Tìm theo tiêu đề, đường, quận hoặc nội dung' : 'Nhập mã bài (VD: NN123)...'}
                    className={clsx(
                      'flex-1 bg-transparent px-4 text-sm text-primary placeholder:text-primary/60 focus:outline-none',
                      scrolled ? 'h-6' : 'h-10'
                    )}
                  />

                  {/* Nút Clear X */}
                  {keyword && (
                    <button type="button" onClick={handleClearSearch} className="px-3 text-primary hover:text-black">
                      ✕
                    </button>
                  )}

                  <button
                    type="submit"
                    className={clsx(
                      'rounded-full bg-primary px-8 text-[11px] font-semibold uppercase tracking-widest text-white transition-all hover:border hover:border-primary hover:bg-primary-lighter hover:text-black',
                      scrolled ? 'h-6' : 'h-10'
                    )}
                  >
                    Enter
                  </button>
                </form>

                {/* DROPDOWN HIỂN THỊ KẾT QUẢ */}
                <AnimatePresence>
                  {showDropdown && keyword.length >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-[calc(100%+8px)] w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center p-6 text-sm text-neutral-500">
                          <span className="loading loading-spinner loading-sm mr-2 text-primary"></span>
                          Đang tìm kiếm {searchType === 'code' ? 'mã bài' : 'tiêu đề'}...
                        </div>
                      ) : searchError ? (
                        <div className="p-6 text-center text-sm text-red-500">
                          Có lỗi xảy ra, thử lại.
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div id="header-search-list" role="listbox" className="max-h-[60vh] overflow-y-auto overscroll-contain py-2">
                          <div className="flex items-center justify-between px-4 pb-2 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Kết quả cho {keyword}</span>
                            {searchType === 'code' && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">TÌM THEO MÃ</span>
                            )}
                          </div>
                          {searchResults.map((item) => (
                            <Link
                              key={item._id}
                              id={`header-search-opt-${item._id}`}
                              role="option"
                              aria-selected={activeIndex === searchResults.indexOf(item)}
                              href={`/${slugify(item.title)}-${item._id}`}
                              onMouseEnter={() => setActiveIndex(searchResults.indexOf(item))}
                              onClick={() => setShowDropdown(false)}
                              className={clsx(
                                'group flex items-center gap-4 border-b border-neutral-100 px-4 py-3 transition-colors last:border-0 hover:bg-neutral-50',
                                activeIndex === searchResults.indexOf(item) ? 'bg-primary-lighter' : ''
                              )}
                            >
                              <div className="relative h-[4.5rem] w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                                <Image
                                  src={item.images?.[0] || '/no-image.png'}
                                  alt={item.title}
                                  fill
                                  sizes="96px"
                                  className="object-cover transition-transform group-hover:scale-110"
                                />
                                {item.code ? (
                                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white">
                                    {item.code}
                                  </span>
                                ) : null}
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <h4 className="line-clamp-2 text-[13px] font-bold leading-tight text-neutral-900 transition-colors group-hover:text-primary">
                                  {highlightMatch(item.title, item.matchedPhrase)}
                                </h4>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.propertyType ? (
                                    <span className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                      {item.propertyType}
                                    </span>
                                  ) : null}
                                  {item.locationType ? (
                                    <span className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                      {item.locationType}
                                    </span>
                                  ) : null}
                                  {item.area > 0 ? (
                                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight text-neutral-600">
                                      {item.area}m²
                                    </span>
                                  ) : null}
                                </div>

                                {getFeatureTags(item).length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {getFeatureTags(item).map((tag) => (
                                      <span key={tag} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}

                                {item.matchedAttributes && item.matchedAttributes.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {item.matchedAttributes.map((attribute) => (
                                      <span
                                        key={`${attribute.type}-${attribute.displayText}`}
                                        className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-red-600"
                                      >
                                        {attribute.displayText}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}

                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-black tracking-tight text-red-600">
                                    {formatCurrency(item.price)} {item.priceUnit}
                                  </span>
                                  {(item.district || item.province) ? (
                                    <span className="min-w-0 truncate text-[10px] font-medium text-neutral-500">
                                      {[item.district, item.province].filter(Boolean).join(', ')}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-sm text-neutral-500">
                          Không tìm thấy {searchType === 'code' ? 'mã bài' : 'tiêu đề'} nào phù hợp.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              {scrolled && (
                <>
                  <Link
                    href="/tu-van-tim-nha"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary bg-white p-1 text-black transition-all duration-200 hover:scale-105"
                  >
                    <TbHomeSearch size={20} />
                  </Link>

                  <Link
                    href="/lien-he-ky-gui"
                    className="flex w-fit items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white bg-primary p-1 text-white transition-all duration-200 hover:scale-105"
                  >
                    <LuHandshake size={20} />
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
          </div>

          {/* ... (Phần Account/User Dropdown giữ nguyên như cũ) ... */}
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
                    <div className="flex items-center gap-1 rounded-md text-white transition-all hover:scale-105">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border">
                        <Avatar src={user.profile?.avatar} size="sm" />
                      </div>
                    </div>
                  ) : (
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
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar src={user.profile?.avatar} size="xs" />
                    <div className="min-w-0 max-w-[160px]">
                      <p className="truncate text-xs font-semibold text-gray-800">{user.profile?.displayName}</p>
                      <p className="break-all text-[10px] leading-snug text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Dropdown.Item href="/profile" className="w-[200px] whitespace-nowrap rounded-md text-sm text-black hover:bg-primary/10">
                    <HiOutlineUserCircle size={16} /> Tài khoản
                  </Dropdown.Item>
                  <Dropdown.Item href="/yeu-thich" className="w-[200px] whitespace-nowrap rounded-md text-sm text-black hover:bg-primary/10">
                    <AiFillHeart size={16} /> Yêu thích
                    {favoriteCount > 0 && (
                      <span className="ml-1 inline-block rounded-full bg-red-600 px-2 py-px text-[10px] font-semibold text-white">
                        {favoriteCount}
                      </span>
                    )}
                  </Dropdown.Item>
                  <div className="my-1 h-px bg-gray-100" />
                  <Dropdown.Item
                    onClick={onLogout}
                    className="w-[200px] whitespace-nowrap rounded-md text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <HiOutlineArrowRightOnRectangle size={16} /> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </motion.nav>
    </header>
  );
}