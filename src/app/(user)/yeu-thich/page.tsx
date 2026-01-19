'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { MdDelete } from 'react-icons/md';
import { formatCurrency } from '@/utils/formatCurrency';

export default function RentalFavoritesPage() {
  const { favorites, handleRemove } = useRentalFavorite();

  if (favorites.length === 0)
    return (
      <div className="h-screen px-2 pt-mobile-padding-top text-center text-black xl:px-desktop-padding xl:pt-desktop-padding-top">
        <div className="my-10">
          <h1 className="text-2xl font-semibold">Bài đăng yêu thích</h1>
          <p className="text-gray-500">Bạn chưa có bài đăng nào trong danh sách yêu thích.</p>
          <Link href="/" className="btn btn-primary mt-4">
            Khám phá ngay
          </Link>
        </div>
      </div>
    );

  return (
    <div className="h-screen px-2 pt-mobile-padding-top text-black xl:px-desktop-padding xl:pt-desktop-padding-top">
      <h1 className="my-3 text-2xl font-semibold">Bài đăng yêu thích</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((item) => (
          <div key={item._id} className="relative rounded-md bg-base-100 shadow-md transition-all hover:-translate-y-2 hover:shadow-lg">
            <figure className="relative aspect-[4/3] overflow-hidden rounded-t-md">
              <Image
                src={`${item.image}`}
                alt={item.title}
                fill
                className="rounded-t-md object-cover transition-transform duration-500 hover:scale-110"
              />
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
              >
                <MdDelete size={18} />
              </button>
            </figure>

            <div className="card-body p-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{item.title}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-base font-bold text-primary">
                  {formatCurrency(item.price)} {item.priceUnit}
                </span>
                <span className="text-sm text-gray-500">{item.area} m²</span>
              </div>
              <p className="line-clamp-1 text-sm text-gray-600">
                {item.district}, {item.province}
              </p>
              <Link href={`/rental/${item._id}`} className="btn btn-outline btn-sm mt-2 hover:bg-primary hover:text-white">
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
