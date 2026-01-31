'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';
import DeleteModal from '../DeleteModal';
import PostModal from './modal/PostModal';
import { IPost } from '@/types/type/post/post';
import { IPostCategory } from '@/types/type/post/post-category';
import { postService } from '@/services/postService';

interface Props {
  posts: IPost[];
  categories: IPostCategory[];
}

export default function ClientPostAdminPage({ posts: initialPosts, categories: initialCategories }: Props) {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [categories, setCategories] = useState<IPostCategory[]>(initialCategories);

  const [editingPost, setEditingPost] = useState<IPost | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reloadPosts = async () => {
    const data = await postService.getAll();
    setPosts(Array.isArray(data) ? data : []);
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setOpenModal(true);
  };

  const openEditModal = (post: IPost) => {
    setEditingPost(post);
    setOpenModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await postService.delete(deletingId);
    await reloadPosts();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-white/80 px-5 py-4 shadow backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold">Quản lý bài viết</h1>
          <p className="text-sm text-gray-500">Tổng số: {posts.length}</p>
        </div>

        <Button size="sm" color="primary" onClick={openCreateModal}>
          Thêm mới
        </Button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => openEditModal(post)}
            className="group relative flex gap-4 rounded-lg border bg-white p-4 transition hover:border-primary/40 hover:shadow-md"
          >
            {/* Thumbnail */}
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
              {post.image ? (
                <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="line-clamp-2 text-base font-medium">{post.title}</h3>

                {post.slug && <p className="mt-0.5 text-xs text-gray-400">/{post.slug}</p>}

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>
                    Danh mục: <span className="font-medium text-gray-700">{post.catalog?.name ?? '—'}</span>
                  </span>

                  <span>
                    Trạng thái:{' '}
                    <span className={post.published ? 'font-medium text-green-600' : 'text-gray-400'}>{post.published ? 'Đã xuất bản' : 'Nháp'}</span>
                  </span>
                </div>
              </div>

              {/* Meta time */}
              <div className="mt-2 text-xs text-gray-400">
                Tạo: {new Date(post.createdAt).toLocaleDateString()} · Cập nhật: {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-3 top-3 flex gap-2 text-xs opacity-100 xl:opacity-0 xl:transition xl:group-hover:opacity-100">
              <button
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(post);
                }}
              >
                Sửa
              </button>

              <button
                className="text-red-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(post._id);
                  setConfirmOpen(true);
                }}
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {openModal && (
        <PostModal
          open={openModal}
          editingItem={editingPost}
          categories={categories}
          onCategoriesChange={setCategories}
          onClose={() => setOpenModal(false)}
          reload={reloadPosts}
        />
      )}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
