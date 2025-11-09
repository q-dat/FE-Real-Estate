'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaArrowRight, FaListUl, FaExpand, FaOrcid } from 'react-icons/fa';
import { Button, Card } from 'react-daisyui';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { IoPricetagsSharp } from 'react-icons/io5';
import { MdOutlineUpdate } from 'react-icons/md';
import { SiGooglemaps } from 'react-icons/si';
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
    <main className="bg-base-100 p-2 text-black xl:px-[10rem] xl:py-10">
      <div className="grid w-full grid-cols-1 gap-10 xl:grid-cols-3">
        {/* Left */}
        <Card className="rounded-lg border border-neutral-200 p-3 shadow-sideBar xl:col-span-2">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-2xl font-bold text-blue-800 xl:text-4xl"
          >
            {post?.title}
          </motion.h1>

          {/* Info */}
          <div className="flex flex-col items-start justify-center gap-4 px-2">
            <div className="flex flex-wrap items-end justify-between gap-5 xl:gap-20">
              {/* Price */}
              <p className="inline-flex items-center gap-1">
                <IoPricetagsSharp size={22} className="pt-1 text-primary" />
                <span className="text-3xl font-bold text-price">
                  {post?.price} {post?.priceUnit}
                </span>
              </p>
              {/* Area */}
              <p className="inline-flex items-center gap-1">
                <FaExpand size={18} className="text-primary" />
                <strong className="text-sm xl:text-sm">
                  {post?.area} m<sup>2</sup>
                </strong>
              </p>
              {/* iD */}
              <p className="inline-flex items-center gap-1">
                <FaOrcid size={18} className="text-primary" />
                <strong className="text-sm xl:text-sm">
                  <i>{post?.code}</i>
                </strong>
              </p>
              {/* PostedAt */}
              <p className="inline-flex items-center gap-1">
                <MdOutlineUpdate size={18} className="text-primary" />
                <span className="text-sm text-blue-700 xl:text-sm">{new Date(post?.postedAt || post?.createdAt).toLocaleDateString('vi-VN')}</span>
              </p>
            </div>
            {/* Address */}
            <div className="flex w-full flex-wrap items-center justify-between gap-2 text-sm xl:text-base">
              <p>
                <b className="mr-2 text-black">Địa chỉ:</b>
                <span className="font-normal">{post?.address}</span>
              </p>
              <Link
                href="#map"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 text-sm text-black underline-offset-2 transition-all duration-200 hover:text-blue-600 hover:underline"
              >
                <SiGooglemaps className="text-green-700" size={18} />
                Xem trên bản đồ!
              </Link>
            </div>
          </div>

          {/* Images */}
          {imagesRental.length > 0 && (
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="my-10 columns-2 gap-2 [column-fill:_balance] sm:columns-3 lg:columns-4"
              >
                {visibleImages.map((src, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.03 }} className="relative mb-2 cursor-pointer break-inside-avoid overflow-hidden">
                    <Image
                      src={src}
                      alt={`${post?.title}-${index}`}
                      width={800}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <FaExpand className="text-xl text-white" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {imagesRental.length > 5 && !showAll && (
                <div className="mt-4 flex justify-center">
                  <Button
                    color="primary"
                    className="rounded-full px-6 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                    onClick={() => setShowAll(true)}
                  >
                    Xem tất cả {imagesRental.length} ảnh
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Des */}
          <div className="bg-neutral-50 p-2 leading-10">
            <h2 className="text-xl font-bold text-black">Thông tin mô tả</h2>
            <p>
              <b>Khu vực:&nbsp;</b>
              <span className="font-normal text-blue-700">
                {post?.category.name}&nbsp;{post?.district}
              </span>
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-black xl:text-base">{post?.description || 'Chưa có mô tả'}</p>
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
          <div className="bg-white p-2">
            <h2 className="mb-4 text-xl font-bold text-black">Liên hệ nhanh</h2>
            {post?.zaloLink ? (
              <Button
                color="primary"
                fullWidth
                className="gap-2 rounded-xl font-medium text-white shadow-md hover:brightness-110"
                onClick={() => window.open(`https://zalo.me/${post?.zaloLink}`, '_blank')}
              >
                <Image src={images.LogoZalo} width={25} height={25} alt={''} /> Nhắn Zalo
              </Button>
            ) : (
              <p className="text-neutral-600">Chưa có thông tin liên hệ</p>
            )}
          </div>

          {/* Catalog */}
          <div className="bg-neutral-50 p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-black">
              <FaListUl /> Danh mục liên quan
            </h2>
            <ul className="space-y-2 text-neutral-700">
              {['Nhà cho thuê', 'Phòng trọ', 'Căn hộ mini'].map((cat, i) => (
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
