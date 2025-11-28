'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { FaImage } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import { slugify } from '@/lib/slugify';
import { IoMdExpand } from 'react-icons/io';
import { MdLocationPin } from 'react-icons/md';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';
import { usePrefetchRentalPost } from '@/hooks/usePrefetchRentalPost';

interface Props {
  posts: IRentalPostAdmin[];
}

export default function ClientHomePage({ posts }: Props) {
  const { prefetchById } = usePrefetchRentalPost();

  return (
    <div className="px-2 xl:px-desktop-padding xl:pt-[140px]">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Mới nhất</h3>
        <Link href="/cho-thue-phong-tro" className="link link-primary text-sm font-bold">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          const totalImages = post.images?.length || 0;
          const slug = slugify(post.title);

          return (
            <Link
              key={post._id}
              onClick={() => prefetchById(post._id)}
              href={`/${slug}/${post._id}`}
              className="group card relative overflow-hidden rounded-md bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
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
                {/* FavoriteBtn */}
                <div className="absolute right-0 top-0">
                  <FavoriteBtn post={post} />
                </div>
              </figure>

              {/* Nội dung */}
              <div className="card-body p-3">
                <h4 className="line-clamp-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-primary">{post.title}</h4>
                <p className="h-px w-full bg-primary"></p>
                <div className="mt-1 flex flex-col items-start justify-between gap-1 xl:flex-row xl:items-center">
                  <div className="text-2xl font-bold text-primary">
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
