'use client';

import { useState } from 'react';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';
import DeleteModal from '../DeleteModal';
import { IPost } from '@/types/type/post/post';
import { postService } from '@/services/postService';
import PostModal from './PostModal';
import { IPostCategory } from '@/types/type/post/post-category';

interface Props {
  posts: IPost[];
  categories: IPostCategory[];
}

export default function ClientPostAdminPage({ posts: initial, categories }: Props) {
  const [posts, setPosts] = useState<IPost[]>(initial);
  const [editingItem, setEditingItem] = useState<IPost | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await postService.getAll();
    setPosts(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await postService.delete(deletingId);
    await reload();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between rounded-md bg-white/80 shadow backdrop-blur">
        <div>
          <h1 className="text-xl font-bold">Quản lý bài viết</h1>
          <p className="text-sm text-gray-500">Tổng số: {posts.length}</p>
        </div>

        <Button
          size="sm"
          color="primary"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post._id}
            className="relative rounded-md border bg-white p-4 shadow hover:shadow-lg"
            onClick={() => {
              setEditingItem(post);
              setOpenModal(true);
            }}
          >
            <h3 className="line-clamp-2 font-semibold">{post.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{post.catalog?.name}</p>

            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(post);
                  setOpenModal(true);
                }}
              >
                Sửa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post._id);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </motion.div>

  {openModal && <PostModal open={openModal} editingItem={editingItem} onClose={() => setOpenModal(false)} reload={reload} categories={categories} />}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
