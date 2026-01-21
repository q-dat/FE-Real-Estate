'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MdLocationPin, MdArrowForward } from 'react-icons/md';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { formatCurrency } from '@/utils/formatCurrency';
import { slugify } from '@/lib/slugify';
import { usePrefetchRentalPost } from '@/hooks/usePrefetchRentalPost';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';
import imageRepresent from '../../../public/image-represent';
import { AiOutlineColumnWidth } from 'react-icons/ai';
import { useMemo } from 'react';
import { IoMdExpand } from 'react-icons/io';
import HerroBanner from '@/components/userPage/HerroBanner';

interface Props {
  salePosts: IRentalPostAdmin[];
  apartmentPosts: IRentalPostAdmin[];
  housePosts: IRentalPostAdmin[];
  businessSpacePosts: IRentalPostAdmin[];
}

interface PostCardProps {
  post: IRentalPostAdmin;
}

// SUB-COMPONENT: REFINED POST CARD
export const PostCard = ({ post }: PostCardProps) => {
  const { prefetchById } = usePrefetchRentalPost();

  const thumbnail = useMemo(() => post.images?.[0] || imageRepresent.Fallback, [post.images]);

  const slug = useMemo(() => slugify(post.title), [post.title]);

  const priceDisplay = useMemo(() => `${formatCurrency(post.price)} ${post.priceUnit}`, [post.price, post.priceUnit]);

  const pricePerM2 = useMemo(() => {
    if (typeof post.pricePerM2 !== 'number') return null;
    if (post.pricePerM2 <= 0) return null;
    return post.pricePerM2;
  }, [post.pricePerM2]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group relative flex flex-col overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl"
    >
      {/* Media */}
      <Link href={`/${slug}/${post._id}`} onClick={() => prefetchById(post._id)} className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={thumbnail}
          alt={post.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-1 top-1 z-10 flex flex-wrap gap-1">
          {post.propertyType && (
            <span className="bg-neutral-900/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              {post.propertyType}
            </span>
          )}
          {post.locationType && (
            <span className="bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neutral-800 backdrop-blur-sm">
              {post.locationType}
            </span>
          )}
        </div>

        <div className="absolute right-1 top-1 z-20">
          <FavoriteBtn post={post} />
        </div>

        {post.area && (
          <div className="absolute bottom-1 left-1 z-10">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 text-[10px] font-medium text-white ring-1 ring-white/20 backdrop-blur-md">
              <IoMdExpand size={12} />
              <span>{post.area} m²</span>
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2">
        <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          <MdLocationPin className="text-primary/70" />
          <span className="truncate">
            {post.district}, {post.province}
          </span>
        </div>

        <Link href={`/${slug}/${post._id}`} className="mb-3 block">
          <h4 className="line-clamp-2 min-h-[2.8rem] text-[15px] font-medium leading-relaxed text-neutral-900 transition-colors group-hover:text-primary xl:text-base">
            {post.title}
          </h4>
        </Link>

        {post.width && post.length ? (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-neutral-50 py-3">
            {post.width && post.length && (
              <div className="flex items-center gap-1.5 text-neutral-500">
                <AiOutlineColumnWidth size={14} className="text-neutral-300" />
                <span className="text-[11px] font-light italic">
                  {post.width} x {post.length}m
                </span>
              </div>
            )}

            {pricePerM2 !== null && <div className="text-[11px] font-medium text-neutral-400">~ {formatCurrency(pricePerM2)}/m²</div>}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-bold tracking-tight text-primary xl:text-xl">{priceDisplay}</div>
          </div>

          <Link
            href={`/${slug}/${post._id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
          >
            <MdArrowForward size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// MAIN PAGE COMPONENT
export default function ClientHomePage({ salePosts, apartmentPosts, housePosts, businessSpacePosts }: Props) {
  const sections = [
    { title: 'Bất động sản bán', subtitle: 'Sales Portfolio', link: '/bat-dong-san-ban', data: salePosts },
    { title: 'Căn hộ dịch vụ', subtitle: 'Luxury Apartments', link: '/can-ho', data: apartmentPosts },
    { title: 'Nhà nguyên căn', subtitle: 'Townhouses', link: '/nha-nguyen-can', data: housePosts },
    { title: 'Mặt bằng kinh doanh', subtitle: 'Commercial Space', link: '/mat-bang', data: businessSpacePosts },
  ];

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      {/* HERO SECTION */}
      <HerroBanner />
      {/* <LivingExperienceSection /> */}

      {/* QUICK NAV */}
      <section className="relative z-10 mx-auto mt-10 max-w-7xl px-2 xl:-mt-5 xl:px-desktop-padding">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:gap-4">
          {sections.map((s, i) => (
            <Link key={i} href={s.link} className="group rounded-sm bg-primary-lighter p-2 shadow-xl transition-all hover:-translate-y-2 xl:p-6">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{s.subtitle}</p>
              <p className="text-sm font-medium text-neutral-900 group-hover:underline">{s.title}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* DYNAMIC SECTIONS */}
      <div className="mx-auto max-w-[1600px] px-2 py-10 xl:px-desktop-padding xl:py-20">
        {sections.map((section) => {
          if (!section.data.length) return null;

          return (
            <div key={section.title} className="mb-24">
              {/* Header Section */}
              <div className="flex items-end justify-between border-b border-neutral-100 pb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">{section.subtitle}</span>
                  <h2 className="mt-2 text-3xl font-light tracking-tighter text-neutral-900 xl:text-4xl">{section.title}</h2>
                </div>
                <Link href={section.link} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Xem bộ sưu tập
                  <MdArrowForward className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {section.data.slice(0, 10).map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER CTA */}
      <section className="bg-neutral-900 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl px-2">
          <h3 className="mb-6 text-3xl font-light tracking-tighter xl:text-5xl">Bạn cần ký gửi bất động sản?</h3>
          <p className="mb-10 font-light text-neutral-400">
            Chúng tôi giúp tài sản của bạn tiếp cận hàng nghìn khách hàng tiềm năng mỗi ngày thông qua hệ thống marketing chuyên nghiệp.
          </p>
          <Link
            href="/lien-he-ky-gui"
            className="inline-block border border-white/20 bg-white/5 px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-neutral-900"
          >
            Bắt đầu ký gửi ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
