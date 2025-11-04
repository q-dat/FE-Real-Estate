'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaPhone, FaMapMarkerAlt, FaRulerCombined, FaTags, FaArrowRight, FaListUl, FaExpand } from 'react-icons/fa';
import { Button, Card } from 'react-daisyui';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

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
    <main className="px-3 py-8 text-neutral xl:px-desktop-padding">
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
        {/* === CỘT TRÁI === */}
        <div className="space-y-10 xl:col-span-2">
          {/* --- TIÊU ĐỀ --- */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-extrabold tracking-tight text-black xl:text-5xl"
          >
            {post.title}
          </motion.h1>

          {/* --- GRID ẢNH --- */}
          {images.length > 0 && (
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="columns-2 gap-2 [column-fill:_balance] sm:columns-3 lg:columns-4"
              >
                {visibleImages.map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-2xl shadow-sm"
                  >
                    <Image
                      src={src}
                      alt={`${post.title}-${index}`}
                      width={800}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 hidden items-center justify-center bg-black/30 text-white opacity-0 transition-all hover:flex hover:opacity-100">
                      <FaExpand className="text-xl" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {images.length > 5 && !showAll && (
                <div className="mt-4 flex justify-center">
                  <Button color="primary" variant="outline" className="rounded-full px-6 text-sm font-medium" onClick={() => setShowAll(true)}>
                    Xem tất cả {images.length} ảnh
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* --- THÔNG TIN TỔNG QUAN --- */}
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-6 text-2xl font-bold text-black">Thông tin tổng quan</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              <InfoLine icon={<FaTags />} label="Giá thuê" value={`${post.price} ${post.priceUnit}`} />
              <InfoLine icon={<FaRulerCombined />} label="Diện tích" value={`${post.area} m²`} />
              <InfoLine icon={<FaMapMarkerAlt />} label="Địa chỉ" value={`${post.address}, ${post.district}, ${post.province}`} />
              <InfoLine label="Danh mục" value={post.category?.name} />
              <InfoLine label="Trạng thái" value={getStatusLabel(post.status)} />
              <InfoLine icon={<FaPhone />} label="Liên hệ" value={post.phoneNumbers ?? 'Không có'} />
            </div>
          </Card>

          {/* --- MÔ TẢ --- */}
          <Card className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-black">Mô tả chi tiết</h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700 xl:text-lg">{post.description || 'Chưa có mô tả'}</p>
          </Card>

          {/* --- TIỆN ÍCH --- */}
          {post.amenities && (
            <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-black">Tiện ích</h2>
              <ul className="grid grid-cols-1 gap-y-2 text-neutral-800 xl:grid-cols-2">
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
            </Card>
          )}

          {/* --- VIDEO --- */}
          {youtubeId && (
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl bg-black shadow-md"
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

          {/* --- GOOGLE MAP --- */}
          {post.address && (
            <Card className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-black">Vị trí trên bản đồ</h2>
              <div className="overflow-hidden rounded-xl shadow-md">
                <iframe
                  width="100%"
                  height="400"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
                ></iframe>
              </div>
            </Card>
          )}
        </div>

        {/* === CỘT PHẢI === */}
        <div className="space-y-6">
          {/* Liên hệ */}
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-black">Liên hệ nhanh</h2>
            {post.zaloLink ? (
              <Button
                color="primary"
                fullWidth
                className="gap-2 font-medium text-white"
                onClick={() => window.open(`https://zalo.me/${post.zaloLink}`, '_blank')}
              >
                Nhắn Zalo {post.zaloLink}
                <FaArrowRight />
              </Button>
            ) : (
              <p className="text-neutral-600">Chưa có thông tin liên hệ</p>
            )}
          </Card>

          {/* Danh mục liên quan */}
          <Card className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-black">
              <FaListUl /> Danh mục liên quan
            </h2>
            <ul className="space-y-2 text-neutral-700">
              {['Nhà cho thuê', 'Phòng trọ', 'Căn hộ mini'].map((cat, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} className="cursor-pointer transition-colors hover:text-primary">
                  • {cat}
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* === COMPONENT PHỤ === */
function InfoLine({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="mt-1 text-primary">{icon}</span>}
      <div>
        <span className="mr-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">{label}</span>
        <span className="text-neutral-800">{value}</span>
      </div>
    </div>
  );
}

function getStatusLabel(status: IRentalPostAdmin['status']): string {
  switch (status) {
    case 'active':
      return 'Đang hiển thị';
    case 'pending':
      return 'Chờ duyệt';
    case 'expired':
      return 'Hết hạn';
    case 'hidden':
      return 'Đã ẩn';
    default:
      return 'Không xác định';
  }
}
