'use client';
import { useEffect, useState } from 'react';
import { FaImages, FaPlus } from 'react-icons/fa';
import { FiEdit3, FiTrash2, FiLock, FiUploadCloud } from 'react-icons/fi';
import Image from 'next/image';
import { IRentalAuthor, IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import RentalPostAdminModal from './modal/RentalPostAdmin.modal';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { formatCurrency } from '@/utils/formatCurrency.utils';
import DeleteModal from '../../../../../components/adminPage/modal/Delete.modal';
import AdminInternalModal from './modal/AdminInternal.modal';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ImportRentalPostModal from './modal/ImportRentalPost.modal';

interface Props {
  posts: IRentalPostAdmin[];
  categories: { _id: string; name: string }[];
  categoryCode?: number;
}

export default function ClientRentalPostAdminPage({ posts: initialPosts, categories, categoryCode }: Props) {
  const { user } = useAdminAuth();
  const authorRef: IRentalAuthor = { _id: user.id };

  const [posts, setPosts] = useState<IRentalPostAdmin[]>(initialPosts);
  const [importOpen, setImportOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalPost, setInternalPost] = useState<IRentalPostAdmin | null>(null);

  useEffect(() => {
    if (initialPosts.length === 0) reload();
  }, [categoryCode]);

  const reload = async () => {
    const data: IRentalPostAdmin[] = await rentalPostAdminService.getMyPosts({ categoryCode });
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
    } finally {
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFCFC]">
      {/* HEADER: Minimalist Luxury */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-neutral-200/60 bg-[#FCFCFC]/80 px-2 pb-5 pt-6 backdrop-blur-xl sm:px-6 md:flex-row md:items-end md:justify-between xl:px-8">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">Portfolio</span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 xl:text-3xl">
            Quản lý Tài sản
            <span className="ml-3 inline-flex items-center justify-center rounded-full bg-neutral-100 px-2.5 py-0.5 align-middle text-xs font-medium text-neutral-500">
              {posts.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportOpen(true)}
            className="group flex h-10 items-center gap-2 rounded-none border border-neutral-300 bg-transparent px-5 text-[11px] font-bold uppercase tracking-widest text-neutral-600 transition-all hover:border-neutral-900 hover:text-neutral-900"
          >
            <FiUploadCloud size={14} className="transition-transform group-hover:-translate-y-0.5" />
            Đồng bộ JSON
          </button>
          <button
            onClick={() => {
              setEditingPost(null);
              setOpenModal(true);
            }}
            className="group flex h-10 items-center gap-2 rounded-none bg-neutral-900 px-6 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-primary hover:shadow-primary/20"
          >
            <FaPlus size={12} className="transition-transform group-hover:rotate-90" />
            Tạo tài sản
          </button>
        </div>
      </div>

      {/* BODY: Editorial Grid Layout */}
      <div className="p-2 sm:p-6 xl:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {posts.map((post) => {
            const thumbnail = post.images?.[0] || '/no-image.png';

            // Xử lý Badge Status Luxury
            const isHighlight = post.postType === 'highlight';
            const isVip = post.postType?.startsWith('vip');

            return (
              <div
                key={post._id}
                className="group relative flex flex-col overflow-hidden rounded-sm border border-neutral-200/60 bg-white shadow-sm transition-all duration-500 hover:border-neutral-300 hover:shadow-2xl hover:shadow-neutral-900/5"
              >
                {/* 1. Media Area */}
                <div
                  onClick={() => {
                    setEditingPost(post);
                    setOpenModal(true);
                  }}
                  className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-neutral-100"
                >
                  <Image
                    src={thumbnail}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />

                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    {post.postType && (
                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm backdrop-blur-md ${
                          isHighlight ? 'bg-black/80 text-white' : isVip ? 'bg-white/90 text-neutral-900' : 'bg-neutral-500/80 text-white'
                        }`}
                      >
                        {post.postType}
                      </span>
                    )}
                    {post.status && (
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md ${
                          post.status === 'active'
                            ? 'bg-emerald-500/90 text-white'
                            : post.status === 'pending'
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-red-500/90 text-white'
                        }`}
                      >
                        <span className="h-1 w-1 animate-pulse rounded-full bg-white"></span>
                        {post.status}
                      </span>
                    )}
                  </div>

                  {/* Photo Count */}
                  {post.images && post.images.length > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 px-2 py-1 text-white backdrop-blur-md">
                      <FaImages size={10} className="opacity-80" />
                      <span className="text-[10px] font-medium">{post.images.length}</span>
                    </div>
                  )}

                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                    <span className="flex translate-y-4 transform items-center gap-2 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-900 transition-transform duration-500 group-hover:translate-y-0">
                      <FiEdit3 size={14} /> Chỉnh sửa
                    </span>
                  </div>
                </div>

                {/* 2. Content Area */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">REF: {post.code || 'N/A'}</span>
                    <span className="text-[10px] font-medium text-neutral-500">{post.area} m²</span>
                  </div>

                  <h2
                    onClick={() => {
                      setEditingPost(post);
                      setOpenModal(true);
                    }}
                    className="mb-3 line-clamp-2 min-h-[2.75rem] cursor-pointer text-[15px] font-medium leading-snug tracking-tight text-neutral-900 transition-colors hover:text-primary"
                  >
                    {post.title}
                  </h2>

                  <p className="mb-4 truncate text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {post.district}, {post.province}
                  </p>

                  <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-4">
                    <div>
                      <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-widest text-neutral-400">Mức giá</span>
                      <div className="text-xl font-light tracking-tighter text-neutral-900">
                        <span className="font-medium">{formatCurrency(post.price)}</span> {post.priceUnit}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInternalPost(post);
                          setInternalOpen(true);
                        }}
                        className="group/btn flex h-8 w-8 items-center justify-center border border-neutral-200 bg-transparent text-neutral-500 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                        title="Tài liệu nội bộ"
                      >
                        <FiLock size={13} className="transition-transform group-hover/btn:scale-110" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post._id);
                        }}
                        className="group/btn flex h-8 w-8 items-center justify-center border border-transparent bg-neutral-50 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600"
                        title="Xóa tài sản"
                      >
                        <FiTrash2 size={13} className="transition-transform group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      <ImportRentalPostModal open={importOpen} onClose={() => setImportOpen(false)} reload={reload} authorId={authorRef} />
      <AdminInternalModal open={internalOpen} onClose={() => setInternalOpen(false)} post={internalPost} reload={reload} />
      <RentalPostAdminModal
        key={editingPost?._id ?? 'create'}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        categories={categories}
        reload={reload}
        authorId={authorRef}
      />
      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
