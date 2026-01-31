'use client';
import Link from 'next/link';
import Image from 'next/image';
import { IoMdExpand } from 'react-icons/io';
import { MdLocationPin } from 'react-icons/md';
import { FaImage } from 'react-icons/fa6';
import { slugify } from '@/lib/slugify';
import { formatCurrency } from '@/utils/formatCurrency.utils';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';

interface RentalGridProps {
  posts: IRentalPostAdmin[];
  title?: string;
  basePath?: string;
  slogan?: string;
}

export default function RentalGrid({ posts }: RentalGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md">
          <p className="text-base font-semibold text-gray-900">Không có dữ liệu phù hợp</p>
          <p className="mt-2 text-sm text-gray-500">Hiện tại chưa có bài đăng nào. Vui lòng thử lại với bộ lọc khác hoặc quay lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Optional: Tiêu đề + slogan */}
      {/* {(title || slogan) && (
        <div className="mb-4 text-left">
          {title && <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>}
          {slogan && <p className="mt-1 text-sm font-medium text-gray-500 md:text-base">{slogan}</p>}
        </div>
      )} */}
      {/* Grid danh sách bài đăng */}
      <div className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4 xl:px-desktop-padding">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          const totalImages = post.images?.length || 0;
          const slug = slugify(post.title);

          return (
            <Link
              key={post._id}
              href={`/${slug}/${post._id}`}
              className="group card relative overflow-hidden rounded-md bg-base-100 shadow-md transition-all duration-300 xl:hover:-translate-y-2 xl:hover:shadow-xl"
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

                <div className="mt-1 flex flex-col items-start justify-between gap-1 xl:flex-row xl:items-center">
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
