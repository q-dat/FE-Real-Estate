'use client';
import { useEffect, useState } from 'react';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '@/components/orther/loading/LoadingSpinner';
import { CiSearch } from 'react-icons/ci';
import { IPost } from '@/types/post/post.types';
import { scrollToTopInstantly } from '@/utils/utils/scrollToTop.utils';
import { useNavigateToPostDetail } from '@/hooks/useNavigateToPostDetail';
import imageRepresent from '../../../../public/image-represent';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';

export default function ClientNewsPage({ news }: { news: IPost[] }) {
  const [loading, setLoading] = useState(true);
  // Handle Click Post To Post Detail
  const { navigateToPostDetail } = useNavigateToPostDetail();

  //  handleImageError
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  const getImageSrc = (id: string, image?: string): string => {
    if (!image) return fallbackSrc;
    if (isImageErrored(id)) return fallbackSrc;
    return image;
  };

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
  }, [news]);

  const featuredPost = news[0];
  const secondaryPosts = news.slice(1, 5);
  const remainingPosts = news.slice(5);
  if (!news) return null;

  return (
    <div className="py-[60px] pt-mobile-padding-top xl:pt-desktop-padding-top">
      <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
        <ul className="font-light">
          <li>
            <Link aria-label="Trang chủ" href="/">
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link aria-label="Tin Tức Bất Động Sản" href="">
              Tin Tức Bất Động Sản
            </Link>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="mt-5 space-y-8 px-2 xl:px-desktop-padding">
        {loading ? (
          <LoadingSpinner />
        ) : news.length === 0 ? (
          <div className="col-span-full flex w-full items-center justify-center p-2">
            <div className="max-w-xl rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center shadow-md">
              <div className="mb-5 flex justify-center text-secondary">
                <CiSearch className="text-6xl" />
              </div>
              {/* Tiêu đề */}
              <h2 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">
                Hiện tại chưa có bài viết trong mục <br />
                <span className="text-primary">Tin Tức Mới Nhất</span>
              </h2>

              {/* Nội dung */}
              <p className="mb-6 text-sm text-gray-600 md:text-base">
                Chúng tôi đang cập nhật những nội dung hữu ích nhất cho bạn.
                <br />
                Trong lúc chờ, bạn có thể khám phá thêm các <strong className="text-primary">thủ thuật & mẹo hay công nghệ</strong> tại trang dưới
                đây:
              </p>

              {/* Nút CTA */}
              <div className="flex flex-row items-center justify-center gap-3">
                <Link
                  href="/thu-thuat-va-meo-hay"
                  className="inline-block rounded-lg bg-primary p-3 text-xs font-bold uppercase text-white transition-all hover:bg-primary/80 md:text-base xl:px-5 xl:py-3 xl:text-sm"
                >
                  Xem Thủ Thuật & Mẹo Hay
                </Link>
                <Link
                  href="/"
                  className="inline-block rounded-lg border border-primary p-3 text-xs font-bold uppercase text-primary transition-all hover:bg-primary hover:text-white xl:px-5 xl:py-3 xl:text-sm"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Featured Section */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {/* Featured big */}
              <div
                className="group relative cursor-pointer overflow-hidden rounded border lg:col-span-2 xl:mb-5"
                onClick={() => navigateToPostDetail(featuredPost)}
              >
                <Image
                  src={getImageSrc(featuredPost._id, featuredPost.image)}
                  onError={() => handleImageError(featuredPost._id)}
                  alt={featuredPost?.title}
                  width={800}
                  height={500}
                  className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-105 lg:h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="rounded bg-primary px-2 py-1 text-xs">{featuredPost?.catalog.name}</span>
                  <h2 className="mt-2 text-2xl font-bold">{featuredPost?.title}</h2>
                  <p className="mt-1 text-sm">{new Date(featuredPost?.updatedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Side list */}
              <div className="mb-5 flex flex-col gap-3">
                {secondaryPosts.map((post) => (
                  <div key={post?._id} className="group flex cursor-pointer gap-3" onClick={() => navigateToPostDetail(post)}>
                    <Image
                      src={getImageSrc(post._id, post.image)}
                      onError={() => handleImageError(post._id)}
                      alt={post?.title}
                      width={120}
                      height={80}
                      className="h-[80px] w-[120px] flex-shrink-0 rounded border object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{post?.title}</h3>
                      <p className="mt-1 text-xs text-primary">
                        {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (<TimeAgo date={post?.updatedAt} />)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining posts grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {remainingPosts.map((post) => (
                <div
                  key={post?._id}
                  className="group cursor-pointer overflow-hidden rounded bg-white shadow-sm"
                  onClick={() => navigateToPostDetail(post)}
                >
                  <div className="overflow-hidden">
                    <Image
                      src={getImageSrc(post._id, post.image)}
                      onError={() => handleImageError(post._id)}
                      alt={post?.title}
                      width={300}
                      height={200}
                      className="h-[180px] w-full border object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{post?.title}</h4>
                    <p className="mt-2 text-xs text-primary">
                      {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (<TimeAgo date={post?.updatedAt} />)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
