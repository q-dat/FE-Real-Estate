'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineColumnWidth } from 'react-icons/ai';
import { IoMdExpand } from 'react-icons/io';
import { MdArrowForward, MdHomeWork, MdLocationPin, MdOutlineApartment, MdOutlineBedroomParent, MdOutlineRealEstateAgent } from 'react-icons/md';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { formatCurrency } from '@/utils/formatCurrency.utils';
import { slugify } from '@/lib/slugify';
import { usePrefetchRentalPost } from '@/hooks/usePrefetchRentalPost';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';
import imageRepresent from '../../../../public/image-represent';
import HerroBanner from '@/components/userPage/HerroBanner';

interface Props {
  salePosts: IRentalPostAdmin[];
  apartmentPosts: IRentalPostAdmin[];
  housePosts: IRentalPostAdmin[];
  businessSpacePosts: IRentalPostAdmin[];
}

interface PostCardProps {
  post: IRentalPostAdmin;
  index?: number;
}

interface HomeSection {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  data: IRentalPostAdmin[];
}

const getFirstValidImage = (images?: string[]): string => {
  if (!images || images.length === 0) return imageRepresent.Fallback;
  return images[0] || imageRepresent.Fallback;
};

const getPostLocation = (post: IRentalPostAdmin): string => {
  const parts = [post.ward, post.district, post.province].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Đang cập nhật vị trí';
};

const getCompactLocation = (post: IRentalPostAdmin): string => {
  const parts = [post.district].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Đang cập nhật';
};

const getPricePerM2 = (post: IRentalPostAdmin): number | null => {
  if (typeof post.pricePerM2 !== 'number') return null;
  if (post.pricePerM2 <= 0) return null;
  return post.pricePerM2;
};

const CompactStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5">
      <span className="shrink-0 text-zinc-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
        <p className="truncate text-[11px] font-bold text-zinc-800">{value}</p>
      </div>
    </div>
  );
};

const SectionIcon = ({ index }: { index: number }) => {
  if (index === 0) return <MdOutlineRealEstateAgent size={18} />;
  if (index === 1) return <MdOutlineApartment size={18} />;
  if (index === 2) return <MdHomeWork size={18} />;
  return <MdLocationPin size={18} />;
};

export const PostCard = ({ post, index = 0 }: PostCardProps) => {
  const { prefetchById } = usePrefetchRentalPost();

  const thumbnail = useMemo(() => getFirstValidImage(post.images), [post.images]);
  const slug = useMemo(() => slugify(post.title), [post.title]);
  const detailHref = `/${slug}/${post._id}`;

  const priceDisplay = useMemo(() => {
    return `${formatCurrency(post.price)} ${post.priceUnit}`;
  }, [post.price, post.priceUnit]);

  const location = useMemo(() => getPostLocation(post), [post]);
  const compactLocation = useMemo(() => getCompactLocation(post), [post]);
  const pricePerM2 = useMemo(() => getPricePerM2(post), [post]);

  const dimensionText = useMemo(() => {
    if (!post.frontageWidth || !post.lotDepth) return null;
    return `${post.frontageWidth} x ${post.lotDepth}m`;
  }, [post.frontageWidth, post.lotDepth]);

  const roomText = useMemo(() => {
    const bedroom = post.bedroomNumber ? `${post.bedroomNumber} PN` : '';
    const toilet = post.toiletNumber ? `${post.toiletNumber} WC` : '';
    return [bedroom, toilet].filter(Boolean).join(' · ');
  }, [post.bedroomNumber, post.toiletNumber]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.02, 0.1) }}
      viewport={{ once: true, margin: '-60px' }}
      className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition duration-300 hover:border-zinc-300 hover:shadow-md"
    >
      <Link
        href={detailHref}
        onMouseEnter={() => prefetchById(post._id)}
        onClick={() => prefetchById(post._id)}
        className="relative block aspect-[1.22/1] w-full overflow-hidden bg-zinc-100 xl:aspect-[4/3] 2xl:aspect-[1.18/1]"
      >
        <Image
          src={thumbnail}
          alt={post.title}
          fill
          unoptimized
          sizes="(min-width: 1536px) 23vw, (min-width: 1280px) 31vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/10" />

        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-wrap gap-1.5">
          {post.propertyType ? (
            <span className="rounded-md border border-white/20 bg-zinc-950/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {post.propertyType}
            </span>
          ) : null}

          {post.locationType ? (
            <span className="rounded-md border border-white/20 bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-900 backdrop-blur-sm">
              {post.locationType}
            </span>
          ) : null}
        </div>

        <div className="absolute right-2 top-2 z-20 rounded-md bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <FavoriteBtn size={18} post={post} color="black" />
        </div>

        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
                <MdLocationPin className="shrink-0 text-white/80" />
                <span className="truncate">{compactLocation}</span>
              </p>

              <div className="inline-flex max-w-full rounded-md bg-white px-2 py-1.5 shadow-sm">
                <span className="truncate text-sm font-black tracking-tight text-zinc-950 xl:text-base">{priceDisplay}</span>
              </div>
            </div>

            {post.area ? (
              <div className="flex shrink-0 items-center gap-1 rounded-md border border-white/20 bg-zinc-950/55 px-2 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                <IoMdExpand size={13} />
                <span>{post.area} m²</span>
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 xl:p-3">
        <Link href={detailHref} onMouseEnter={() => prefetchById(post._id)} className="block">
          <h4 className="line-clamp-2 min-h-[2.65rem] break-words text-[14px] font-black leading-snug text-zinc-950 transition group-hover:text-zinc-700 xl:text-[15px]">
            {post.title}
          </h4>
        </Link>

        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5">
          <MdLocationPin className="mt-0.5 shrink-0 text-zinc-500" size={14} />
          <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-zinc-600">{location}</p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {post.area ? <CompactStat icon={<IoMdExpand size={14} />} label="Diện tích" value={`${post.area} m²`} /> : null}

          {dimensionText ? <CompactStat icon={<AiOutlineColumnWidth size={14} />} label="Ngang dài" value={dimensionText} /> : null}

          {roomText ? <CompactStat icon={<MdOutlineBedroomParent size={14} />} label="Công năng" value={roomText} /> : null}

          {post.floorNumber ? <CompactStat icon={<MdHomeWork size={14} />} label="Số tầng" value={`${post.floorNumber} tầng`} /> : null}
        </div>

        {pricePerM2 !== null ? (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">Đơn giá</span>
            <span className="truncate text-[11px] font-black text-zinc-800">~ {formatCurrency(pricePerM2)}/m²</span>
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          <Link
            href={detailHref}
            onMouseEnter={() => prefetchById(post._id)}
            className="flex items-center justify-between rounded-md border border-zinc-900 bg-primary px-2.5 py-2 text-white transition duration-300 hover:bg-primary/90"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.16em]">Xem chi tiết</span>
            <MdArrowForward size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default function ClientHomePage({ salePosts, apartmentPosts, housePosts, businessSpacePosts }: Props) {
  const sections: HomeSection[] = [
    {
      title: 'Bất động sản bán',
      subtitle: 'Sales Portfolio',
      description: 'Danh sách nhà đất được trình bày rõ vị trí, diện tích, công năng và mức giá.',
      link: '/bat-dong-san-ban',
      data: salePosts,
    },
    {
      title: 'Căn hộ dịch vụ',
      subtitle: 'Apartments',
      description: 'Các căn hộ dịch vụ được sắp xếp gọn, dễ đọc và dễ so sánh.',
      link: '/can-ho',
      data: apartmentPosts,
    },
    {
      title: 'Nhà nguyên căn',
      subtitle: 'Townhouses',
      description: 'Nhà nguyên căn với thông tin chính được ưu tiên hiển thị trực quan.',
      link: '/nha-nguyen-can',
      data: housePosts,
    },
    {
      title: 'Mặt bằng kinh doanh',
      subtitle: 'Commercial Space',
      description: 'Mặt bằng được hiển thị theo tiêu chí vị trí, diện tích và giá rõ ràng.',
      link: '/mat-bang',
      data: businessSpacePosts,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 pt-mobile-padding-top text-zinc-950 xl:pt-desktop-padding-top">
      <HerroBanner />

      <section className="relative z-10 mx-auto max-w-[1700px] px-2 pt-3 xl:-mt-6 xl:px-desktop-padding 2xl:px-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {sections.map((section, index) => (
              <Link
                key={section.title}
                href={section.link}
                className="group rounded-md border border-zinc-200 bg-white px-2 py-2 transition duration-300 hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
                  <SectionIcon index={index} />
                </div>

                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{section.subtitle}</p>

                <p className="line-clamp-2 text-sm font-black leading-snug text-zinc-950 group-hover:text-zinc-700">{section.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1700px] px-2 py-8 xl:px-desktop-padding xl:py-12 2xl:px-8">
        {sections.map((section) => {
          if (!section.data.length) return null;

          return (
            <section key={section.title} className="mb-10 xl:mb-14">
              <div className="mb-3 rounded-lg border border-zinc-200 bg-white px-3 py-3 shadow-sm xl:mb-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{section.subtitle}</p>

                    <h2 className="text-2xl font-black tracking-tight text-zinc-950 xl:text-3xl">{section.title}</h2>

                    <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500">{section.description}</p>
                  </div>

                  <Link
                    href={section.link}
                    className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-900 bg-zinc-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-zinc-800"
                  >
                    Xem bộ sưu tập
                    <MdArrowForward size={15} />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3 xl:gap-3 2xl:grid-cols-4">
                {section.data.slice(0, 12).map((post, index) => (
                  <PostCard key={post._id} post={post} index={index} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="px-2 pb-8 xl:px-desktop-padding xl:pb-12 2xl:px-8">
        <div className="mx-auto max-w-[1700px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-10 text-center text-white shadow-sm xl:px-4 xl:py-12">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">Nguồn Nhà Giá Rẻ</p>

            <h3 className="text-2xl font-black tracking-tight xl:text-4xl">Bạn cần ký gửi bất động sản?</h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400">
              Gửi thông tin nhà đất để được hỗ trợ trình bày nội dung rõ ràng, hình ảnh chỉn chu và phù hợp nhu cầu tìm kiếm.
            </p>

            <Link
              href="/lien-he-ky-gui"
              className="mt-6 inline-flex items-center justify-center rounded-md border border-white/15 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-zinc-200"
            >
              Bắt đầu ký gửi ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
