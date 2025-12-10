'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FaPhone, FaBed, FaShower, FaHeart, FaRegHeart, FaRulerHorizontal, FaRulerVertical, FaTools, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Button, Divider, Badge } from 'react-daisyui';
import { IoShareSocial } from 'react-icons/io5';
import { GiHouse, GiPencilRuler, GiStarsStack } from 'react-icons/gi';
import { BsBuildingFillUp } from 'react-icons/bs';
import { SiGooglemaps } from 'react-icons/si';
import { images } from '../../../../public/images';

// Import Types & Components
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { PropertyGallery } from './PropertyGallery';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';

interface Props {
  post: IRentalPostAdmin;
}

// UTILS
const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '';
  return phone.replace(/^(\d{4})(\d+)/, (_, first, rest) => {
    const chunks = rest.match(/.{1,3}/g);
    return chunks ? `${first}.${chunks.join('.')}` : phone;
  });
};

const getStatusColor = (type: IRentalPostAdmin['postType']) => {
  switch (type) {
    case 'highlight':
      return 'error'; // Đỏ
    case 'vip1':
      return 'warning'; // Vàng
    case 'vip2':
      return 'accent'; // Cam/Xanh lơ
    case 'vip3':
      return 'info'; // Xanh dương
    default:
      return 'ghost'; // Xám
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

// 1. New Modern Header Component
const PropertyHeader = ({ post }: { post: IRentalPostAdmin }) => {
  return (
    <div className="mb-6">
      {/* Top Meta: Badges & Code */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={getStatusColor(post.postType)} className="whitespace-nowrap font-bold text-white shadow-sm">
            {post.postType === 'highlight' && <GiStarsStack className="mr-1" />}
            {getStatusLabel(post.postType)}
          </Badge>
          <Badge variant="outline" className="border-neutral-300 text-neutral-500">
            #{post.code}
          </Badge>
          <span className="flex items-center text-xs text-neutral-400">
            <FaClock className="mr-1" />
            {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="">
          <div className="flex flex-row items-center justify-center gap-2">
            {/* Share */}
            <Button size="sm" shape="circle" className="text-blue-600 hover:scale-125">
              <IoShareSocial size={20} />
            </Button>
            {/* Favorite */}
            <div className="w-full rounded-full border border-primary">
              <FavoriteBtn post={post} size={24} color="text-primary" />
            </div>
          </div>
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

// 2. Property Specs Grid (Clean & Minimal)
const PropertySpecGrid = ({ post }: { post: IRentalPostAdmin }) => {
  const specs = [
    { icon: <BsBuildingFillUp size={20} className="text-blue-500" />, label: 'Số tầng', value: post?.floorNumber },
    { icon: <FaBed size={20} className="text-blue-500" />, label: 'Phòng ngủ', value: post?.bedroomNumber },
    { icon: <FaShower size={20} className="text-blue-500" />, label: 'WC/Toilet', value: post?.toiletNumber },
    { icon: <GiHouse size={20} className="text-blue-500" />, label: 'Loại BĐS', value: post?.propertyType },
    { icon: <FaRulerHorizontal size={20} className="text-blue-500" />, label: 'Chiều ngang', value: post?.width ? `${post.width}m` : null },
    { icon: <FaRulerVertical size={20} className="text-blue-500" />, label: 'Chiều dài', value: post?.length ? `${post.length}m` : null },
    { icon: <FaTools size={20} className="text-blue-500" />, label: 'Nội thất', value: post?.furnitureStatus },
    { icon: <GiPencilRuler size={20} className="text-blue-500" />, label: 'Pháp lý', value: post?.legalStatus },
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
  const imagesRental = useMemo(() => post?.images || [], [post?.images]);
  const youtubeId = post?.youtubeLink?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
  const encodedAddress = encodeURIComponent(`${post?.address}, ${post?.district}, ${post?.province}`);

  const formattedPhone = useMemo(() => formatPhoneNumber(post?.phoneNumbers), [post?.phoneNumbers]);

  return (
    <main className="w-full px-2 pt-mobile-padding-top xl:pt-desktop-padding-top">
      <Breadcrumbs label={post.title} />
      <div className="bg-white text-black xl:px-desktop-padding">
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
                  className="whitespace-pre-line text-base leading-relaxed text-slate-700"
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

          {/* RIGHT COLUMN (Sidebar) - 4/12 */}
          <div className="xl:col-span-4">
            <div className="sticky top-mobile-padding-top flex flex-col gap-3 xl:top-desktop-padding-top">
              {/* Author/Contact Card */}
              <div className="space-y-3 rounded-2xl border border-blue-100 bg-white p-2 shadow-xl shadow-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {post.author?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Được đăng bởi</p>
                    <p className="text-lg font-bold text-slate-900">{post.author || 'Môi giới'}</p>
                  </div>
                </div>

                {/* Call Action - Formatted Phone */}
                {post?.phoneNumbers && (
                  <a
                    href={`tel:${post.phoneNumbers}`}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-3.5 text-white shadow-lg transition-all hover:shadow-green-500/30 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center rounded-full bg-white/20 p-1.5 transition-transform group-hover:rotate-12">
                      <FaPhone className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">{formattedPhone}</span>
                  </a>
                )}

                {/* Zalo Action */}
                {post?.zaloLink && (
                  <Button
                    fullWidth
                    className="gap-2 rounded-xl bg-white font-medium text-black shadow-md transition-all hover:scale-95 hover:brightness-105"
                    onClick={() => window.open(`https://zalo.me/${post?.zaloLink}`, '_blank')}
                  >
                    <Image src={images.LogoZalo} width={25} height={25} alt="" /> Chat Zalo
                  </Button>
                )}
              </div>

              {/* Safety/Note Card */}
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-1 font-bold">Lưu ý an toàn:</p>
                <p className="opacity-90">
                  <b>KHÔNG</b> đóng phí trước khi xem nhà. Hãy kiểm tra kỹ giấy tờ pháp lý và xác thực chính chủ trước khi giao dịch.
                </p>
              </div>

              {/* Feedback Section */}
              <div className="rounded-xl border border-base-200 bg-base-100 p-4 text-sm text-base-content">
                <p className="mb-2 font-semibold">Gửi phản hồi</p>
                <p className="mb-3 opacity-90">
                  Nếu cần hỗ trợ hoặc muốn báo cáo thông tin không chính xác, vui lòng liên hệ qua số điện thoại hoặc email dưới đây.
                </p>

                <div className="space-y-1">
                  <p className="font-medium">
                    Số điện thoại: <span className="opacity-80">...</span>
                  </p>
                  <p className="font-medium">
                    Email: <span className="opacity-80">...</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
