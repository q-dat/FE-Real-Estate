'use client';
import Image from 'next/image';
import Link from 'next/link';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { FaImage } from 'react-icons/fa';
import { IoMdExpand } from 'react-icons/io';
import { MdLocationPin } from 'react-icons/md';
import { formatCurrency } from '@/utils/formatCurrency';
import { slugify } from '@/lib/slugify';
import FavoriteBtn from '@/components/userPage/ui/btn/FavoriteBtn';
import { usePrefetchRentalPost } from '@/hooks/usePrefetchRentalPost';
import imageRepresent from '../../public/image-represent';

interface Props {
  salePosts: IRentalPostAdmin[];
  apartmentPosts: IRentalPostAdmin[];
  housePosts: IRentalPostAdmin[];
  businessSpacePosts: IRentalPostAdmin[];
}

export default function ClientHomePage({ salePosts, apartmentPosts, housePosts, businessSpacePosts }: Props) {
  const { prefetchById } = usePrefetchRentalPost();

  const sections = [
    { title: 'Bất động sản bán', link: '/bat-dong-san-ban', data: salePosts },
    { title: 'Cho thuê căn hộ', link: '/can-ho', data: apartmentPosts },
    { title: 'Nhà nguyên căn cho thuê', link: '/nha-nguyen-can', data: housePosts },
    { title: 'Cho thuê mặt bằng - kinh doanh', link: '/mat-bang', data: businessSpacePosts },
  ];

  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      {sections.map((section) => {
        if (!section.data.length) return null;

        return (
          <div key={section.title} className="pb-8 xl:mt-10">
            {/* Header dạng trang tin */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 xl:text-3xl">{section.title}</h2>

              <Link href={section.link} className="text-sm font-semibold text-primary underline">
                Xem tất cả
              </Link>
            </div>

            {/* Grid kiểu bản tin BĐS */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-3 2xl:grid-cols-5">
              {section.data.map((post) => {
                const thumbnail = post.images?.[0] || `${imageRepresent.Fallback}`;
                const totalImages = post.images?.length || 0;
                const slug = slugify(post.title);

                return (
                  <Link
                    key={post._id}
                    onClick={() => prefetchById(post._id)}
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
                      {/* FavoriteBtn */}
                      <div className="absolute right-0 top-0">
                        <FavoriteBtn post={post} />
                      </div>
                    </figure>

                    {/* Nội dung */}
                    <div className="card-body p-2">
                      <h4 className="line-clamp-3 border-b border-primary pb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-primary">
                        {post.title}
                      </h4>
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
      })}
    </div>
  );
}
