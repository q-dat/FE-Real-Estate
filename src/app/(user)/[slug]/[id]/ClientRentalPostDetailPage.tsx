'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FaBed, FaShower, FaRulerHorizontal, FaRulerVertical, FaTools, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Divider, Badge, Button } from 'react-daisyui';
import { IoShareSocial } from 'react-icons/io5';
import { GiHouse, GiPencilRuler, GiStarsStack } from 'react-icons/gi';
import { BsBuildingFillUp } from 'react-icons/bs';
import { SiGooglemaps } from 'react-icons/si';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { PropertyGallery } from '../../../../components/userPage/rental/detail/PropertyGallery';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';
import { useAdminRole } from '@/hooks/useAdminRole';
import AdminPostInternalSection from '@/components/userPage/rental/detail/AdminPostInternalSection';
import AuthorProfileCard from '../../../../components/userPage/rental/detail/AuthorProfileCard';
import CopyCodeBadgeBtn from '@/components/userPage/ui/btn/CopyCodeBadgeBtn';
import { slugify } from '@/lib/slugify';
import DownloadImagesBtn from '@/components/userPage/ui/btn/DownloadImagesBtn';
import CopyUrlBtn from '@/components/userPage/ui/btn/CopyUrlBtn';

interface Props {
  post: IRentalPostAdmin;
}

const getStatusColor = (type: IRentalPostAdmin['postType']) => {
  switch (type) {
    case 'highlight':
      return 'error';
    case 'vip1':
      return 'warning';
    case 'vip2':
      return 'accent';
    case 'vip3':
      return 'info';
    default:
      return 'ghost';
  }
};

const getStatusLabel = (status: IRentalPostAdmin['postType']): string => {
  const map: Record<string, string> = {
    basic: 'Tin thường',
    vip1: 'Vip 1',
    vip2: 'Vip 2',
    vip3: 'Vip 3',
    highlight: 'Nổi bật',
  };
  return map[status] || 'Tin đăng';
};

// SUB COMPONENTS

// New Modern Header Component
const PropertyHeader = ({ post }: { post: IRentalPostAdmin }) => {
  const slug = slugify(post.title);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}/${post._id}`;
  return (
    <div className="mb-6">
      {/* Top Meta: Badges & Code */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-1 xl:gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={getStatusColor(post.postType)} className="whitespace-nowrap border border-white px-3 py-4 font-medium text-white">
            {post.postType === 'highlight' && <GiStarsStack className="mr-1" />}
            {getStatusLabel(post.postType)}
          </Badge>

          {/* <span className="flex items-center text-xs text-neutral-400">
            <FaClock className="mr-1" />
            {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
          </span> */}
        </div>
        <div className="z-50 flex flex-row items-center justify-center gap-1 xl:gap-2">
          {/* Copy Code */}
          <CopyCodeBadgeBtn code={post.code} />
          {/* DownloadImages */}
          <DownloadImagesBtn images={post.images} filePrefix={post.code} />
          {/* Copy URL */}
          <CopyUrlBtn url={url} size="sm" />
          {/* Share */}
          <Button size="sm" shape="circle" className="text-blue-600 xl:hover:scale-125">
            <IoShareSocial size={20} />
          </Button>
          {/* Favorite */}
          <FavoriteBtn scaleOnHover={true} border={true} post={post} size={0} color="text-primary" />
        </div>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden text-2xl font-extrabold leading-tight text-slate-800 xl:block xl:text-3xl"
      >
        {post.title}
      </motion.h1>

      {/* Address */}
      <div className="flex w-full flex-wrap items-start justify-between gap-3 text-sm font-medium xl:text-xl">
        {/*  */}
        <p className="flex-1 break-words text-gray-600">
          <b className="mr-2 text-gray-800">Địa chỉ:</b>
          <span className="text-primary">{post?.address}</span>
        </p>

        {/*  */}
        <Link
          href="#map"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-primary-lighter bg-white px-2 py-0.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:text-primary"
        >
          <SiGooglemaps className="text-green-700" size={16} />
          Xem bản đồ
        </Link>
      </div>

      <Divider className="my-2" />

      {/* Price & Area Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-5 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Price - Highlighted */}
          <div className="flex w-full flex-col items-center xl:items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mức giá</span>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex items-baseline gap-1"
            >
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-5xl font-black text-transparent">{post.price}</span>
              <span className="text-xl font-bold text-red-500">{post.priceUnit}</span>
            </motion.div>
          </div>

          <div className="flex w-full flex-row items-start justify-between gap-10 xl:items-center">
            {/* Area - Secondary */}
            <div className="flex flex-col">
              <p className="whitespace-nowrap text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Diện tích:</span>
                {/* Ngang trước - Dài sau */}
                {post.width && post.length && (
                  <span className="px-1 font-bold text-black">
                    ({post.width} x {post.length})
                  </span>
                )}
              </p>

              <div className="flex items-baseline gap-1 text-slate-700">
                <span className="text-3xl font-bold">{post.area}</span>
                <span className="text-lg font-medium">m²</span>
              </div>
            </div>

            {/* Price per m2 (Optional calculation) */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đơn giá</span>
              <div className="text-lg font-semibold text-slate-600">
                {post.area > 0 && post.price > 0 ? `~ ${((post.price * (post.priceUnit === 'Tỷ' ? 1000 : 1)) / post.area).toFixed(1)} Tr/m²` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Specs Grid (Clean & Minimal)
const PropertySpecGrid = ({ post }: { post: IRentalPostAdmin }) => {
  const specs = [
    { icon: <BsBuildingFillUp size={20} className="text-primary" />, label: 'Số tầng', value: post?.floorNumber },
    { icon: <FaBed size={20} className="text-primary" />, label: 'Phòng ngủ', value: post?.bedroomNumber },
    { icon: <FaShower size={20} className="text-primary" />, label: 'WC/Toilet', value: post?.toiletNumber },
    { icon: <GiHouse size={20} className="text-primary" />, label: 'Loại BĐS', value: post?.propertyType },
    { icon: <FaRulerHorizontal size={20} className="text-primary" />, label: 'Chiều ngang', value: post?.width ? `${post.width}m` : null },
    { icon: <FaRulerVertical size={20} className="text-primary" />, label: 'Chiều dài', value: post?.length ? `${post.length}m` : null },
    { icon: <FaTools size={20} className="text-primary" />, label: 'Nội thất', value: post?.furnitureStatus },
    { icon: <GiPencilRuler size={20} className="text-primary" />, label: 'Pháp lý', value: post?.legalStatus },
  ];

  const validSpecs = specs.filter((s) => s.value && s.value !== '—' && s.value !== 0);

  if (validSpecs.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-bold text-slate-800">Thông tin chi tiết</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {validSpecs.map((spec, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50"
          >
            {spec.icon}
            <span className="text-xs text-slate-500">{spec.label}</span>
            <span className="line-clamp-1 text-center font-bold text-slate-800">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// MAIN PAGE
export default function ClientRentalPostDetailPage({ post }: Props) {
  const { isAdmin, loading } = useAdminRole();
  const imagesRental = useMemo(() => post?.images || [], [post?.images]);
  const youtubeId = post?.youtubeLink?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
  const encodedAddress = encodeURIComponent(`${post?.address}, ${post?.district}, ${post?.province}`);

  return (
    <main className="w-full bg-white px-2 pt-mobile-padding-top xl:pt-desktop-padding-top">
      <Breadcrumbs label={post.title} />
      <div className="text-black xl:px-desktop-padding">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* LEFT COLUMN (Main Content) - 8/12 */}
          <div className="flex flex-col gap-6 xl:col-span-8">
            {/* Gallery Wrapper */}
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="block text-2xl font-extrabold leading-tight text-slate-800 xl:hidden xl:text-3xl"
            >
              {post.title}
            </motion.h1>
            <div className="overflow-hidden">
              {imagesRental.length > 0 ? (
                <PropertyGallery images={imagesRental} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-neutral-100 text-neutral-400">Chưa có hình ảnh</div>
              )}
            </div>

            {/* Main Info Card */}
            <div className="rounded-none bg-white p-0 md:p-2 xl:rounded-xl">
              {/* NEW HEADER HERE */}
              <PropertyHeader post={post} />

              <Divider className="my-2" />

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Mô tả bất động sản</h2>
                <div
                  className="whitespace-pre-wrap break-words font-sans text-sm leading-5 text-slate-700 xl:text-base"
                  dangerouslySetInnerHTML={{ __html: post?.description?.replace(/\n/g, '<br />') || 'Đang cập nhật...' }}
                />
              </div>

              {/* Specs Grid */}
              <PropertySpecGrid post={post} />

              <Divider className="my-2" />

              {/* Amenities */}
              {post?.amenities && (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Tiện ích đi kèm</h2>
                  <div className="flex flex-wrap gap-2">
                    {post.amenities.split(/[.,\r?\n]+/).map(
                      (item, idx) =>
                        item.trim() && (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"
                          >
                            <FaCheckCircle className="text-xs" /> {item.trim()}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Video Section */}
              {youtubeId && (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Video giới thiệu</h2>
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={post?.videoTitle || 'Video BĐS'}
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Maps */}
              {post?.address && (
                <div id="map" className="bg-white">
                  <div className="p-2">
                    <h2 className="text-xl font-bold text-black">Vị trí trên bản đồ: </h2>
                    <span>{post?.address}</span>
                  </div>
                  <div className="my-4 overflow-hidden rounded-md">
                    <iframe
                      width="100%"
                      height="400"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN */}
          <aside className="xl:col-span-4">
            <div className="sticky top-24 flex flex-col gap-5">
              {/* Author Card */}
              <AuthorProfileCard author={post.author} />

              {/* Safety Card (Functional & Warning) */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 shadow-sm">
                <p className="text-sm font-bold text-amber-800">Lưu ý an toàn</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-700/80">
                  KHÔNG đóng phí đặt cọc khi chưa xem nhà. Kiểm tra kỹ giấy tờ pháp lý (Sổ đỏ/Sổ hồng) và CMND/CCCD chính chủ trước khi giao dịch.
                </p>
              </div>

              {/* Feedback*/}
              <div className="text-center">
                <button className="text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline">Báo cáo tin đăng sai sự thật</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Admin internal section */}
      {!loading && isAdmin && <AdminPostInternalSection adminNote={post.adminNote} adminImages={post.adminImages} />}
    </main>
  );
}
