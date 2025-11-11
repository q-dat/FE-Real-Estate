'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoMdExpand } from 'react-icons/io';
import { MdLocationPin } from 'react-icons/md';
import { FaImage } from 'react-icons/fa6';
import { slugify } from '@/lib/slugify';
import { formatCurrency } from '@/utils/formatCurrency';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

interface RentalGridProps {
  posts: IRentalPostAdmin[];
  title?: string;
  slogan?: string;
}

export default function RentalGrid({ posts, title, slogan }: RentalGridProps) {
  return (
    <div className="px-2 py-8 xl:px-desktop-padding">
      {/* Optional: Tiêu đề + slogan */}
      {(title || slogan) && (
        <div className="mb-4 text-left">
          {title && <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h1>}

          {slogan && <p className="mt-1 text-sm font-medium text-gray-500 md:text-base">{slogan}</p>}

          <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-300 hover:scale-x-110"></div>
        </div>
      )}

      {/* Grid danh sách bài đăng */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          const totalImages = post.images?.length || 0;
          const slug = slugify(post.title);

          return (
            <Link
              key={post._id}
              href={`/${slug}/${post._id}`}
              className="group card relative overflow-hidden rounded-md bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">{post.title}</h4>

                <div className="mt-1 flex flex-row items-center justify-between gap-1">
                  <div className="text-base font-bold text-primary">
                    {formatCurrency(post.price)} {post.priceUnit}
                  </div>

                  <div className="inline-flex items-center text-sm text-gray-600">
                    <IoMdExpand />
                    <span>{post.area} m²</span>
                  </div>
                </div>

                <p className="mt-1 line-clamp-2 inline-flex items-center text-gray-500">
                  <MdLocationPin size={16} />
                  <span className="text-sm">
                    {post.district}, {post.province}
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
