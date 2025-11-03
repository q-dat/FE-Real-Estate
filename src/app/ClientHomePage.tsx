'use client';
import React from 'react';
import Image from 'next/image';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { FaImage, FaExpand } from 'react-icons/fa';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
  posts: IRentalPostAdmin[];
}

export default function ClientHomePage({ posts }: Props) {
  return (
    <div className="p-2 xl:px-desktop-padding">
      <h1>Tìm kiếm chỗ thuê giá tốt</h1>
      <h2>Công cụ tìm kiếm phòng trọ, nhà nguyên căn, căn hộ cho thuê, mua bán nhà đất nhanh chóng, hiệu quả hơn!</h2>
      <h3 className="mb-4 text-xl font-bold">Tin nổi bật:</h3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          const totalImages = post.images?.length || 0;

          return (
            <article
              key={post._id}
              className="group relative overflow-hidden rounded-md border border-gray-100 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              <Link href="#" className="block">
                {/* Thumbnail */}
                <figure className="relative aspect-video overflow-hidden rounded-t-md">
                  <Image
                    src={thumbnail}
                    alt={post.title}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />

                  {totalImages > 0 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md text-xs text-white backdrop-blur-sm">
                      <FaImage size={14} /> {totalImages}
                    </span>
                  )}
                </figure>

                {/* Nội dung */}
                <aside className="space-y-2 p-3">
                  <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">{post.title}</h4>

                  <span className="block text-base font-bold text-primary">
                    {formatCurrency(post.price)} {post.priceUnit}
                  </span>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaExpand size={12} />
                    <span>{post.area} m²</span>
                  </div>

                  <p className="line-clamp-2 text-xs text-gray-500">
                    {post.district}, {post.province}
                  </p>
                </aside>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
