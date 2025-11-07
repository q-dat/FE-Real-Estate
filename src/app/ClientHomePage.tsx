'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { FaImage, FaExpand } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import { slugify } from '@/lib/slugify';

interface Props {
  posts: IRentalPostAdmin[];
}

export default function ClientHomePage({ posts }: Props) {
  return (
    <div className="px-2 py-8 xl:px-desktop-padding">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Tìm kiếm chỗ thuê giá tốt
        </h1>
        <p className="mt-2 text-gray-500">
          Khám phá phòng trọ, căn hộ, nhà nguyên căn với công cụ tìm kiếm nhanh, thông minh và hiện đại.
        </p>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Tin nổi bật</h3>
        <Link href="/tin-noi-bat" className="link link-primary text-sm">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          const totalImages = post.images?.length || 0;
          const slug = slugify(post.title);

          return (
            <Link
              key={post._id}
              href={`/${slug}/${post._id}`}
              className="card group relative overflow-hidden rounded-md bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Thumbnail */}
              <figure className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />

                {totalImages > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                    <FaImage size={12} /> {totalImages}
                  </div>
                )}
              </figure>

              {/* Nội dung */}
              <div className="card-body p-3">
                <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                  {post.title}
                </h4>

                <div className="mt-1 text-base font-bold text-primary">
                  {formatCurrency(post.price)} {post.priceUnit}
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <FaExpand size={12} />
                  <span>{post.area} m²</span>
                </div>

                <p className="line-clamp-2 mt-1 text-xs text-gray-500">
                  {post.district}, {post.province}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
