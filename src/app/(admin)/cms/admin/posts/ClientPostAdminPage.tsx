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

export default function ClientPostAdminPage({ posts: initialPosts, categories }: Props) {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
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

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await postService.delete(deletingId);
    await reloadPosts();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  /* ---------------- render ---------------- */

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-md bg-white/80 p-4 shadow backdrop-blur">
        <div>
          <h1 className="text-xl font-bold">Quản lý bài viết</h1>
          <p className="text-sm text-gray-500">Tổng số: {posts.length}</p>
        </div>

        <Button size="sm" color="primary" onClick={openCreateModal}>
          Thêm mới
        </Button>
      </div>

      {/* List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-3"
      >
        {posts.map((post) => (
          <div
            key={post._id}
            className="relative cursor-pointer rounded-md border bg-white p-4 shadow transition hover:shadow-lg"
            onClick={() => openEditModal(post)}
          >
            {/* Title */}
            <h3 className="line-clamp-2 text-base font-semibold">{post.title}</h3>

            {/* Category */}
            <p className="mt-1 text-xs text-slate-500">
              Danh mục: {post.catalog?.name ?? '—'}
            </p>

            {/* Status */}
            <p className="mt-1 text-xs">
              Trạng thái:{' '}
              <span className={post.published ? 'text-green-600' : 'text-gray-400'}>
                {post.published ? 'Đã xuất bản' : 'Nháp'}
              </span>
            </p>

            {/* Meta */}
            <p className="mt-1 text-xs text-gray-400">
              Cập nhật: {new Date(post.updatedAt).toLocaleDateString()}
            </p>

            {/* Actions */}
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(post);
                }}
              >
                Sửa
              </button>

              <button
                className="text-xs text-red-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(post._id);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Modals */}
      {openModal && (
        <PostModal
          open={openModal}
          editingItem={editingPost}
          categories={categories}
          onClose={() => setOpenModal(false)}
          reload={reloadPosts}
        />
      )}

      <DeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
