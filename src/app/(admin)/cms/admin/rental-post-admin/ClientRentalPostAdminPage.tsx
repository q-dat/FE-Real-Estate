'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { FaImages, FaPlus, FaPen, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';
import { IRentalAuthor, IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import RentalPostAdminModal from './RentalPostAdminModal';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { formatCurrency } from '@/utils/formatCurrency';
import DeleteModal from '../DeleteModal';
import { GiPadlock } from 'react-icons/gi';
import AdminInternalModal from './AdminInternalModal';
import { useAdminAuth } from '@/context/AdminAuthContext';
interface Props {
  posts: IRentalPostAdmin[];
  categories: { _id: string; name: string }[];
  categoryCode?: number;
}

export default function ClientRentalPostAdminPage({ posts: initialPosts, categories, categoryCode }: Props) {
  const { user } = useAdminAuth();
  const authorRef: IRentalAuthor = {
    _id: user.id,
  };
  const [posts, setPosts] = useState<IRentalPostAdmin[]>(initialPosts);
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);
  // Modal Xoá
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Modal Nội bộ Admin
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalPost, setInternalPost] = useState<IRentalPostAdmin | null>(null);

  useEffect(() => {
    if (initialPosts.length === 0) {
      console.log('RentalPostAdminPage: No initial posts, reloading...');
      reload();
    }
  }, [categoryCode]);

  // Hàm tải lại danh sách bài đăng
  const reload = async () => {
    // Tối ưu: Chỉ fetch lại dữ liệu cần thiết.
    // Nếu API có pagination/cache, cần xem xét thêm logic đó.
    const data: IRentalPostAdmin[] = await rentalPostAdminService.getMyPosts({ categoryCode });
    // Đảm bảo kiểu dữ liệu: TypeScript
    setPosts(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await rentalPostAdminService.delete(deletingId);
      await reload();
    } catch (error) {
      console.error('Lỗi xóa bài đăng:', error);
      // Có thể thêm toast/notification
    } finally {
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  return (
    // Tối ưu responsive: Bỏ scrollbar-hide, thay bằng scrollbar-thin để tốt hơn cho UX trên desktop
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4">
        <h1 className="flex items-center gap-3 text-xl font-bold text-gray-800 xl:text-2xl">Quản lý Bài đăng Cho thuê</h1>
        <Button
          size="sm"
          color="primary"
          className="flex items-center gap-2 rounded-lg font-semibold shadow-md transition xl:hover:shadow-lg"
          onClick={() => {
            setEditingPost(null);
            setOpenModal(true);
          }}
        >
          <FaPlus size={14} /> Thêm Bài đăng
        </Button>
      </div>

      {/* Danh sách */}
      {/* Cải thiện Grid Layout: Tăng mật độ thông tin trên màn hình lớn */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          // Xác định màu sắc/kiểu dáng cho postType
          const postTypeClass =
            post.postType === 'highlight'
              ? 'bg-red-500 text-white font-bold'
              : post.postType?.startsWith('vip')
                ? 'bg-yellow-500 text-black font-semibold'
                : 'bg-gray-100 text-gray-700';

          return (
            <div
              key={post._id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 xl:hover:shadow-xl"
            >
              {/* Ảnh - Giữ nguyên logic click để chỉnh sửa */}
              <div
                onClick={() => {
                  setEditingPost(post);
                  setOpenModal(true);
                }}
                className="relative aspect-[4/3] cursor-pointer overflow-hidden"
              >
                <Image
                  src={thumbnail}
                  alt={post.title}
                  width={400}
                  height={300}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badge Số ảnh và Loại tin */}
                <div className="absolute left-2 top-2 flex items-center gap-2">
                  {post.images && post.images.length > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      <FaImages size={10} />
                      {post.images.length}
                    </span>
                  )}
                  {post.postType && <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${postTypeClass}`}>{post.postType}</span>}
                </div>

                {/* Overlay Edit Button (Tùy chọn) */}
                <Button
                  size="sm"
                  color="primary"
                  className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <FaPen size={12} /> Sửa
                </Button>
              </div>

              {/* Nội dung */}
              <div className="flex flex-1 flex-col justify-between p-3">
                <div className="space-y-1">
                  <h2
                    onClick={() => {
                      setEditingPost(post);
                      setOpenModal(true);
                    }}
                    className="line-clamp-2 cursor-pointer text-base font-semibold text-gray-900 transition-colors duration-200 xl:hover:text-primary"
                  >
                    {post.title}
                  </h2>

                  {/* Thông tin phụ */}
                  <p className="text-xs text-gray-500">**Mã:** {post.code}</p>
                  <p className="text-sm text-gray-600">
                    {post.area} m² | {post.district}, {post.province}
                  </p>

                  <p className="text-base font-extrabold text-primary">
                    {formatCurrency(post.price)} {post.priceUnit}
                  </p>
                </div>

                {/* Status và Actions */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                  {/* Status Badge */}
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                      post.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : post.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : post.status === 'expired'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {post.status}
                  </span>
                  <div className="space-x-2">
                    {/* Nút xem nội bộ admin */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInternalPost(post);
                        setInternalOpen(true);
                      }}
                      className="btn-square bg-black text-white transition-colors duration-200 xl:hover:bg-primary"
                    >
                      <GiPadlock size={12} />
                    </Button>

                    {/* Nút Xóa riêng biệt */}
                    <Button
                      size="sm"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn mở modal chỉnh sửa
                        handleDelete(post._id);
                      }}
                      className="btn-square text-white transition-colors duration-200 xl:hover:bg-red-600"
                    >
                      <FaTrashAlt size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nội bộ Admin */}
      <AdminInternalModal open={internalOpen} onClose={() => setInternalOpen(false)} post={internalPost} reload={reload} />

      {/* Modal Chỉnh sửa / Thêm mới */}
      <RentalPostAdminModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editingPost={editingPost}
        categories={categories}
        reload={reload}
        authorId={authorRef}
      />

      {/* Modal Xóa */}
      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
