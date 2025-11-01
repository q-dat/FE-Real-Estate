'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { FaImages, FaPlus, FaPen, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { rentalCategoryService } from '@/services/rentalCategoryService';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import RentalPostAdminModal from './RentalPostAdminModal';

export default function RentalPostAdminPage() {
  const [posts, setPosts] = useState<IRentalPostAdmin[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);

  const loadData = async () => {
    try {
      const data = await rentalPostAdminService.getAll();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    loadData();
    rentalCategoryService.getAll().then((cats) => setCategories(cats || []));
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá bài đăng này?')) {
      await rentalPostAdminService.delete(id);
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 text-black scrollbar-hide xl:p-4">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold xl:text-xl">
          <FaImages className="text-primary" /> Quản lý bài đăng
        </h1>
        <Button
          size="sm"
          color="primary"
          className="flex items-center gap-2 rounded-md px-3 py-1"
          onClick={() => {
            setEditingPost(null);
            setOpenModal(true);
          }}
        >
          <FaPlus /> Thêm mới
        </Button>
      </div>

      {/* DANH SÁCH */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {posts.map((post) => {
          const thumbnail = post.images?.[0] || '/no-image.png';
          return (
            <div
              key={post._id}
              className="group relative flex flex-col overflow-hidden rounded-md border border-primary/20 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Ảnh */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={post.title}
                  width={400}
                  height={250}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {post.images?.length > 1 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-primary/80 px-2 py-0.5 text-xs text-white">
                    <FaImages />
                    <span>{post.images.length}</span>
                  </div>
                )}
              </div>

              {/* Nội dung */}
              <div className="flex flex-1 flex-col justify-between p-3">
                <div className="space-y-0.5">
                  <h2 className="line-clamp-2 text-sm font-semibold">{post.title}</h2>
                  <p className="text-sm font-semibold text-primary">
                    {post.price.toLocaleString()} {post.priceUnit}
                  </p>
                  <p className="text-xs text-black/70">
                    {post.area} m² • {post.district}, {post.province}
                  </p>
                  <p className="text-xs italic text-black/50">{post.category?.name || '-'}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                      post.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : post.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : post.status === 'expired'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-black/10 text-black/70'
                    }`}
                  >
                    {post.status}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color="secondary"
                      className="flex items-center gap-1 rounded-md text-white"
                      onClick={() => {
                        setEditingPost(post);
                        setOpenModal(true);
                      }}
                    >
                      <FaPen /> Sửa
                    </Button>
                    <Button size="xs" color="error" className="flex items-center gap-1 rounded-md text-white" onClick={() => handleDelete(post._id)}>
                      <FaTrashAlt /> Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {openModal && (
        <RentalPostAdminModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingPost(null);
          }}
          editingPost={editingPost}
          categories={categories}
          reload={loadData}
        />
      )}
    </div>
  );
}
