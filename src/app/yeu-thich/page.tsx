'use client';
import { MdDelete } from 'react-icons/md';
import Link from 'next/link';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import Image from 'next/image';

export default function RentalFavoritesPage() {
  const { favorites, handleRemove } = useRentalFavorite();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Bài đăng yêu thích</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">Danh sách bài đăng yêu thích của bạn đang trống!</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-300 shadow-sm scrollbar-hide">
          <table className="w-full bg-white text-center">
            <thead className="border-b border-gray-300 bg-gray-100">
              <tr className="text-sm font-semibold text-gray-700">
                <th className="p-3">Hình ảnh</th>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Diện tích</th>
                <th className="p-3">Khu vực</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((item) => (
                <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    {item.images?.[0] ? (
                      <Zoom>
                        <Image src={item.images[0]} alt={item.title} width={100} height={100} className="rounded-lg object-cover" />
                      </Zoom>
                    ) : (
                      <div className="flex h-[100px] w-[100px] items-center justify-center text-sm text-gray-500">No Image</div>
                    )}
                  </td>
                  <td className="p-3 text-left">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <Link href={`/rental/${item._id}`} className="text-sm text-blue-600 hover:underline">
                      Xem chi tiết
                    </Link>
                  </td>
                  <td className="p-3 font-bold text-red-600">
                    {item.price.toLocaleString('vi-VN')} {item.priceUnit}
                  </td>
                  <td className="p-3">{item.area} m²</td>
                  <td className="p-3">
                    {item.district}, {item.province}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="flex items-center justify-center gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                    >
                      Xóa
                      <MdDelete className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
