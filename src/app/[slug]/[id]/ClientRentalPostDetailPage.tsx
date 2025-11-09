'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaArrowRight, FaListUl, FaExpand, FaOrcid } from 'react-icons/fa';
import { Button, Card } from 'react-daisyui';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { IoPricetagsSharp } from 'react-icons/io5';
import { MdOutlineUpdate } from 'react-icons/md';

interface Props {
  post: IRentalPostAdmin;
}

export default function ClientRentalPostDetailPage({ post }: Props) {
  const [showAll, setShowAll] = useState(false);

  const images = useMemo(() => post.images || [], [post.images]);
  const visibleImages = showAll ? images : images.slice(0, 5);
  const youtubeId = post.youtubeLink?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
  const encodedAddress = encodeURIComponent(`${post.address}, ${post.district}, ${post.province}`);

  return (
    <main className="bg-base-100 p-2 text-black xl:px-desktop-padding xl:py-10">
      <div className="grid w-full grid-cols-1 gap-10 xl:grid-cols-3">
        {/*  */}
        <Card className="border border-neutral-200 p-3 shadow-sideBar xl:col-span-2">
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
          <div className="flex flex-col items-start justify-center gap-4">
            <div className="flex flex-wrap items-center justify-between gap-5 xl:gap-20">
              {/* Price */}
              <p className="inline-flex items-center gap-1">
                <IoPricetagsSharp size={18} />
                <span className="text-2xl font-bold text-price">
                  {post?.price} {post?.priceUnit}
                </span>
              </p>
              {/* Area */}
              <p className="inline-flex items-center gap-1">
                <FaExpand size={18} />
                <strong className="text-xs xl:text-base">
                  {post?.area} m<sup>2</sup>
                </strong>
              </p>
              {/* iD */}
              <p className="inline-flex items-center gap-1">
                <FaOrcid size={18} />
                <strong className="text-xs xl:text-base">
                  <i>{post?.code}</i>
                </strong>
              </p>
              {/* PostedAt */}
              <p className="inline-flex items-center gap-1">
                <MdOutlineUpdate size={18} />
                <strong className="text-xs xl:text-base">{new Date(post.postedAt || post.createdAt).toLocaleDateString('vi-VN')}</strong>
              </p>
            </div>
            {/* Address */}
            <div className="flex items-center justify-start gap-0.5 text-lg">
              <p className="text-black">
                <b> Địa chỉ: </b>
                <span className="font-medium text-gray-500">{post?.address}</span>
              </p>
            </div>
          </div>
          {/* Images */}
          {images.length > 0 && (
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
                      alt={`${post.title}-${index}`}
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

              {images.length > 5 && !showAll && (
                <div className="mt-4 flex justify-center">
                  <Button
                    color="primary"
                    className="rounded-full px-6 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                    onClick={() => setShowAll(true)}
                  >
                    Xem tất cả {images.length} ảnh
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Des */}
          <div className="bg-neutral-50 p-6">
            <h2 className="mb-6 text-2xl font-bold text-black">Mô tả chi tiết</h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700 xl:text-lg">{post.description || 'Chưa có mô tả'}</p>
          </div>

          {/*  Amenities */}
          {post.amenities && (
            <div className="bg-white p-6 shadow-md">
              <h2 className="mb-6 text-2xl font-bold text-black">Tiện ích</h2>
              <ul className="grid grid-cols-1 gap-y-2 text-black xl:grid-cols-2">
                {post.amenities
                  .split(/\r?\n/)
                  .filter((a) => a.trim())
                  .map((a, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      <span>{a}</span>
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
              className="overflow-hidden bg-black shadow-md"
            >
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={post.videoTitle || post.title}
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </motion.section>
          )}

          {/* Gg Map */}
          {post.address && (
            <div className="bg-white p-4 shadow-md">
              <h2 className="mb-4 text-2xl font-bold text-black">Vị trí trên bản đồ</h2>
              <div className="overflow-hidden rounded-xl shadow-sm">
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
        {/*  */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-black">Liên hệ nhanh</h2>
            {post.zaloLink ? (
              <Button
                color="primary"
                fullWidth
                className="gap-2 rounded-xl font-medium text-white shadow-md hover:brightness-110"
                onClick={() => window.open(`https://zalo.me/${post.zaloLink}`, '_blank')}
              >
                Nhắn Zalo {post.zaloLink}
                <FaArrowRight />
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
{
  /* <p>Loại Tin: {getStatusLabel(post.postType)}</p> */
}
