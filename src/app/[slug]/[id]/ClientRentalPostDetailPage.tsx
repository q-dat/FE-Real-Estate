'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaListUl, FaExpand, FaOrcid, FaRulerCombined, FaPhone } from 'react-icons/fa';
import { Button, Card } from 'react-daisyui';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { IoPricetagsSharp } from 'react-icons/io5';
import { MdOutlineUpdate } from 'react-icons/md';
import { SiGooglemaps } from 'react-icons/si';
import { GiCutDiamond } from 'react-icons/gi';
import Link from 'next/link';
import { Space } from '@/components/userPage/ui/space/Space';
import { images } from '../../../../public/images';

interface Props {
  post: IRentalPostAdmin;
}

export default function ClientRentalPostDetailPage({ post }: Props) {
  const [showAll, setShowAll] = useState(false);

  const imagesRental = useMemo(() => post?.images || [], [post?.images]);
  const visibleImages = showAll ? imagesRental : imagesRental.slice(0, 5);
  const youtubeId = post?.youtubeLink?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
  const encodedAddress = encodeURIComponent(`${post?.address}, ${post?.district}, ${post?.province}`);

  return (
    <main className="pt-mobile-padding-top xl:pt-desktop-padding-top bg-white px-2 text-black xl:px-desktop-padding">
      <div className="grid w-full grid-cols-1 gap-10 xl:mt-10 xl:grid-cols-3">
        {/* Left */}
        <Card className="rounded-lg border border-neutral-200 p-3 shadow-sideBar xl:col-span-2">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-xl font-bold text-blue-800 xl:text-2xl"
          >
            {post?.title}
          </motion.h1>

          <div className="grid w-full grid-cols-2 items-center justify-center gap-4 md:grid-cols-4">
            {/* --- Giá --- */}
            <div className="col-span-full">
              <InfoChip
                className="text-2xl font-black text-price xl:text-xl"
                icon={<IoPricetagsSharp size={16} className="text-primary" />}
                label={`${post?.price} ${post?.priceUnit}`}
              />
            </div>

            {/* --- Các InfoChip còn lại --- */}
            {[
              { icon: <FaExpand size={16} className="text-primary" />, label: `${post?.area}m²` },
              { icon: <FaOrcid size={16} className="text-primary" />, label: `${post?.code}` },
              {
                icon: <MdOutlineUpdate size={18} className="text-primary" />,
                label: new Date(post?.postedAt || post?.createdAt).toLocaleDateString('vi-VN'),
              },
              { icon: <GiCutDiamond size={18} className="text-primary" />, label: getStatusLabel(post?.postType) },
            ].map((info, i) => (
              <div key={i} className={`flex w-full ${i % 2 === 0 ? 'justify-start xl:justify-center' : 'justify-end xl:justify-center'}`}>
                <InfoChip className="text-sm font-bold text-default" icon={info.icon} label={info.label} />
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="mt-5 flex w-full flex-wrap items-start justify-between gap-3 text-sm xl:text-base">
            {/*  */}
            <p className="flex-1 break-words text-gray-700">
              <b className="mr-2 text-gray-800">Địa chỉ:</b>
              {post?.address}
            </p>

            {/*  */}
            <Link
              href="#map"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-primary-lighter bg-white px-1 py-0.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <SiGooglemaps className="text-green-700" size={16} />
              Xem bản đồ
            </Link>
          </div>

          {/* Space */}
          <Space />

          {/* Images */}
          {imagesRental.length > 0 && (
            <section className="my-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {visibleImages.slice(0, 25).map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1 }}
                    className={`relative cursor-pointer overflow-hidden rounded-lg ${
                      index === 0 ? 'col-span-1 row-span-2 xl:col-span-3 xl:row-span-2' : ''
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${post?.title}-${index}`}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {/* <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                      <FaExpand className="text-xl text-white" />
                    </div> */}
                  </motion.div>
                ))}
              </motion.div>

              {imagesRental.length > 5 && !showAll && (
                <div className="mt-4 flex justify-center">
                  <Button
                    color="primary"
                    size="sm"
                    className="rounded-full text-sm font-semibold text-white shadow-sm hover:brightness-110"
                    onClick={() => setShowAll(true)}
                  >
                    Xem tất cả {Math.min(imagesRental.length, 25)} ảnh
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Des */}
          <div className="bg-neutral-50 p-2 leading-10">
            <h2 className="mb-3 text-xl font-bold text-black">Thông tin mô tả</h2>
            {/* Size */}
            {post?.length && post?.width && (
              <div className="inline-flex items-center">
                <FaRulerCombined className="mr-2 text-primary" size={16} />
                <p className="text-sm sm:text-base">
                  (Dài: {post?.length}m x Rộng: {post?.width}m) = <span className="font-semibold">{post?.area} m²</span>
                </p>
              </div>
            )}
            {/* Adress */}
            <div>
              <b>Khu vực:&nbsp;</b>
              <span className="font-normal text-blue-700">
                {post?.category.name}&nbsp;{post?.district}
              </span>
            </div>
            {/* Des */}
            <p className="whitespace-pre-line border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-800 sm:text-base">
              {post?.description || 'Chưa có mô tả'}
            </p>
          </div>

          {/*  Amenities */}
          {post?.amenities && (
            <div className="bg-white p-2 leading-10">
              <h2 className="text-xl font-bold text-black">Tiện ích</h2>
              <ul className="my-4 grid grid-cols-2 items-center justify-around gap-3 text-black xl:grid-cols-3 2xl:grid-cols-4">
                {post?.amenities
                  ?.split(/[.,\r?\n]+/) // tách theo dấu phẩy, dấu chấm hoặc xuống dòng
                  .map((a) => a.trim())
                  .filter(Boolean)
                  .map((a, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">{a}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Video */}
          {youtubeId && (
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="h-full w-full overflow-hidden"
            >
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={post?.videoTitle || post?.title}
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </motion.section>
          )}

          {/* Space */}
          <Space />

          {/* Post Type Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm"
          >
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
              <FaListUl className="text-primary" /> Đặc điểm tin đăng
            </h2>

            <div className="grid grid-cols-1 gap-3 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <MdOutlineUpdate className="text-primary" size={16} />
                <span>
                  <b>Ngày cập nhật:</b> {new Date(post?.updatedAt || post?.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MdOutlineUpdate className="text-primary" size={16} />
                <span>
                  <b>Ngày hết hạn:</b> {new Date(post?.expiredAt || 'Chưa xác định!').toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IoPricetagsSharp className="text-primary" size={16} />
                <span>
                  <b>Loại tin:&nbsp;</b>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      post?.postType === 'highlight'
                        ? 'bg-orange-100 text-orange-700'
                        : post?.postType === 'vip1'
                          ? 'bg-yellow-100 text-yellow-700'
                          : post?.postType === 'vip2'
                            ? 'bg-amber-100 text-amber-700'
                            : post?.postType === 'vip3'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                    } `}
                  >
                    {getStatusLabel(post?.postType)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaOrcid className="text-primary" size={16} />
                <span>
                  <b>Mã tin:</b> {post?.code}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm leading-relaxed text-blue-900">
              Bạn đang xem nội dung tin đăng <b className="text-blue-700">“{post?.title}”</b>. Mọi thông tin liên quan đến tin đăng này chỉ mang tính
              chất tham khảo. Nếu bạn có phản hồi (báo xấu, tin đã cho thuê, không liên lạc được,...), vui lòng thông báo để chúng tôi xử lý.
            </div>
          </motion.div>
          {/* Gg Map */}
          {post?.address && (
            <div id="map" className="bg-whit">
              <div className="p-2">
                <h2 className="text-xl font-bold text-black">Vị trí trên bản đồ: </h2>
                <span>{post?.address}</span>
              </div>
              <div className="my-4 overflow-hidden">
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
        </Card>
        {/* Right */}
        <div>
          {/* Contact */}
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-black">Liên hệ nhanh</h2>

            {/* ZaloLink */}
            {post?.zaloLink ? (
              <Button
                fullWidth
                className="gap-2 rounded-xl bg-white font-medium text-black shadow-md transition-all hover:scale-95 hover:brightness-105"
                onClick={() => window.open(`https://zalo.me/${post?.zaloLink}`, '_blank')}
              >
                <Image src={images.LogoZalo} width={25} height={25} alt="" /> Nhắn Zalo
              </Button>
            ) : (
              <p className="text-neutral-500">Chưa có thông tin liên hệ</p>
            )}

            {/* PhoneNumbers */}
            {post?.phoneNumbers &&
              (() => {
                const formatPhone = (phone?: string) => {
                  if (!phone) return '';
                  // 4 số đầu + . + các nhóm 3 số tiếp theo
                  return phone.replace(/^(\d{4})(\d+)/, (_, first, rest) => {
                    return `${first}.${rest.match(/.{1,3}/g)?.join('.')}`;
                  });
                };

                const formatted = formatPhone(post.phoneNumbers);

                return (
                  <a
                    href={`tel:${post.phoneNumbers}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-2xl font-bold text-white shadow-md transition-all hover:scale-95"
                  >
                    <FaPhone /> {formatted}
                  </a>
                );
              })()}
          </div>

          {/* Catalog */}
          <div className="bg-neutral-50 p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-black">
              <FaListUl /> Danh mục liên quan
            </h2>
            <ul className="space-y-2 text-neutral-700">
              {['Nhà cho thuê', 'Căn hộ mini'].map((cat, i) => (
                <motion.li key={i} whileHover={{ x: 5 }} className="cursor-pointer transition-colors hover:text-primary">
                  • {cat}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
function InfoChip({ icon, label, className }: { icon: React.ReactNode; label: string; className?: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.98 }} className="relative flex items-center gap-1 text-primary">
      <span className="flex-shrink-0">{icon}</span>
      <span className={`tracking-wide ${className}`}>{label}</span>

      {/* Light glow effect */}
      <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
function getStatusLabel(status: IRentalPostAdmin['postType']): string {
  switch (status) {
    case 'basic':
      return 'Tin thường';
    case 'vip1':
      return 'Vip 1';
    case 'vip2':
      return 'Vip 2';
    case 'vip3':
      return 'Vip 3';
    case 'highlight':
      return 'Nổi bật';
    default:
      return 'Không xác định';
  }
}
