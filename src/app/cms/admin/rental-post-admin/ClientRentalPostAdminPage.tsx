'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { FaImages, FaPlus, FaPen, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import RentalPostAdminModal from './RentalPostAdminModal';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { formatCurrency } from '@/utils/formatCurrency';
import DeleteModal from '../DeleteModal';

interface Props {
  posts: IRentalPostAdmin[];
  categories: { _id: string; name: string }[];
}

export default function ClientRentalPostAdminPage({ posts: initialPosts, categories }: Props) {
  const [posts, setPosts] = useState<IRentalPostAdmin[]>(initialPosts);
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);
  // Modal Xoá
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await rentalPostAdminService.getAll();
    setPosts(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await rentalPostAdminService.delete(deletingId);
    await reload();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-white px-2 pt-[70px] text-black scrollbar-hide xl:px-4 xl:pt-[140px]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-lg font-semibold xl:text-xl">
          <FaImages className="text-primary" /> Quản lý bài đăng
        </h1>
        <Button
          size="xs"
          color="success"
          className="flex items-center gap-1 rounded-md px-2 text-white"
          onClick={() => {
            setEditingPost(null);
            setOpenModal(true);
          }}
        >
          <FaPlus /> Thêm
        </Button>
      </div>

      {/* Danh sách */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          return (
            <div
              onClick={() => {
                setEditingPost(post);
                setOpenModal(true);
              }}
              key={post._id}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Ảnh */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={post.title}
                  width={400}
                  height={300}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {post.images?.length > 1 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur-md">
                    <FaImages className="text-white/90" />
                    <span>{post.images.length}</span>
                  </div>
                )}
              </div>

              {/* Nội dung */}
              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div className="space-y-1">
                  <h2 className="line-clamp-2 text-[15px] font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary">
                    {post.title}
                  </h2>

                  <p className="text-[13px] text-gray-500">
                    {post.area} m² • {post.district}, {post.province}
                  </p>

                  <p className="text-[15px] font-bold text-primary">
                    {formatCurrency(post.price)} {post.priceUnit}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-[2px] text-[11px] font-medium capitalize ${
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

                  <div className="flex gap-1.5">
                    {/* Update */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // chặn mở modal edit từ card

                        setEditingPost(post);
                        setOpenModal(true);
                      }}
                      className="rounded-full bg-blue-500 p-2 text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                    >
                      <FaPen size={12} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // chặn mở edit khi nhấn delete
                        handleDelete(post._id);
                      }}
                      className="rounded-full bg-rose-500 p-2 text-white shadow-md transition-all hover:bg-rose-600 hover:shadow-lg"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm / Sửa */}
      {openModal && (
        <RentalPostAdminModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingPost(null);
          }}
          editingPost={editingPost}
          categories={categories}
          reload={reload}
        />
      )}

      {/* Modal Xoá */}
      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
