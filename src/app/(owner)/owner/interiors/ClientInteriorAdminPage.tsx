'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaImages } from 'react-icons/fa';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DeleteModal from '../../../../components/adminPage/modal/Delete.modal';
import { IInterior } from '@/types/interiors/interiors.types';
import { interiorService } from '@/services/interior/interior.service';
import InteriorModal from './modal/Interior.modal';

interface Props {
  interiors: IInterior[];
  categories: { _id: string; name: string }[];
}

export default function ClientInteriorAdminPage({ interiors: initialInteriors, categories }: Props) {
  const [interiors, setInteriors] = useState<IInterior[]>(initialInteriors);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IInterior | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await interiorService.getAll();
    setInteriors(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await interiorService.delete(deletingId);
    await reload();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFCFC]">
      {/* HEADER: Minimalist Luxury */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-neutral-200/60 bg-[#FCFCFC]/80 px-2 pb-5 pt-6 backdrop-blur-xl sm:px-6 md:flex-row md:items-end md:justify-between xl:px-8">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">Interior Catalog</span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 xl:text-3xl">
            Quản lý Nội thất
            <span className="ml-3 inline-flex items-center justify-center rounded-full bg-neutral-100 px-2.5 py-0.5 align-middle text-xs font-medium text-neutral-500">
              {interiors.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}
            className="group flex h-10 items-center gap-2 rounded-none bg-neutral-900 px-6 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-primary hover:shadow-primary/20"
          >
            <FaPlus size={12} className="transition-transform group-hover:rotate-90" />
            Thêm thiết kế
          </button>
        </div>
      </div>

      {/* BODY: Editorial Grid Layout */}
      <div className="p-2 sm:p-6 xl:p-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {interiors.map((it) => {
            const thumbnails = it.thumbnails?.[0] || it.images || '/no-image.png';
            const thumbCount = it.thumbnails?.length || 0;

            return (
              <motion.div
                key={it._id}
                layoutId={it._id}
                className="group relative flex flex-col overflow-hidden rounded-sm border border-neutral-200/60 bg-white shadow-sm transition-all duration-500 hover:border-neutral-300 hover:shadow-2xl hover:shadow-neutral-900/5"
              >
                {/* 1. Media Area */}
                <div
                  onClick={() => {
                    setEditingItem(it);
                    setOpenModal(true);
                  }}
                  className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-neutral-100"
                >
                  <Image
                    src={thumbnails}
                    alt={it.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />

                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    {it.status && (
                      <span className="bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-sm backdrop-blur-md">
                        {it.status}
                      </span>
                    )}
                  </div>

                  {/* Photo Count */}
                  {thumbCount > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 px-2 py-1 text-white backdrop-blur-md">
                      <FaImages size={10} className="opacity-80" />
                      <span className="text-[10px] font-medium">{thumbCount}</span>
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
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">REF: {it._id.slice(-6)}</span>
                  </div>

                  <h2
                    onClick={() => {
                      setEditingItem(it);
                      setOpenModal(true);
                    }}
                    className="mb-3 line-clamp-2 min-h-[2.75rem] cursor-pointer text-[15px] font-medium leading-snug tracking-tight text-neutral-900 transition-colors hover:text-primary"
                  >
                    {it.name}
                  </h2>

                  <p className="mb-4 line-clamp-2 text-[11px] font-medium text-neutral-500">
                    {it.description || 'Chưa có mô tả chi tiết cho thiết kế này.'}
                  </p>

                  <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-4">
                    <div>{/* Có thể map category name vào đây nếu backend trả về Object hoặc filter qua mảng categories */}</div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(it._id);
                        }}
                        className="group/btn flex h-8 w-8 items-center justify-center border border-transparent bg-neutral-50 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600"
                        title="Xóa thiết kế"
                      >
                        <FiTrash2 size={13} className="transition-transform group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* MODALS */}
      {openModal && (
        <InteriorModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          reload={reload}
          categories={categories}
        />
      )}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
