'use client';
import { useState } from 'react';
import { Button, Badge } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen, FaTrashAlt, FaImages, FaLayerGroup } from 'react-icons/fa';
import { motion } from 'framer-motion';
import DeleteModal from '../DeleteModal';
import { IInterior } from '@/types/type/interiors/interiors';
import { interiorService } from '@/services/interiorsService';
import InteriorModal from './InteriorModal';

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
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      {/* Header Sticky & Glassmorphism */}
      <div className="sticky top-0 z-30 mb-8 mt-4 flex items-center justify-between rounded-md border border-white/50 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-xl transition-all">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800 xl:text-2xl">
            <FaLayerGroup className="text-primary" /> Quản lý nội thất
          </h1>
          <p className="text-sm text-slate-500">Tổng số: {interiors.length} mẫu thiết kế</p>
        </div>

        <Button
          size="sm"
          color="primary"
          className="gap-2 rounded-xl shadow-lg shadow-primary/30 hover:scale-105"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          <FaPlus /> <span className="hidden sm:inline">Thêm mới</span>
        </Button>
      </div>

      {/* Grid Layout with Animation */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        {interiors.map((it) => {
          const thumbnails = it.thumbnails?.[0] || it.images || '/no-image.png';
          const thumbCount = it.thumbnails?.length || 0;

          return (
            <motion.div
              variants={itemAnim}
              key={it._id}
              layoutId={it._id}
              onClick={() => {
                setEditingItem(it);
                setOpenModal(true);
              }}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <Image
                  src={thumbnails}
                  alt={it.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />

                {/* Overlay Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {it.status && (
                    <Badge color="ghost" size="sm" className="bg-white/90 text-xs font-semibold shadow-sm backdrop-blur-md">
                      {it.status}
                    </Badge>
                  )}
                </div>

                {thumbCount > 1 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <FaImages /> {thumbCount}
                  </div>
                )}

                {/* Quick Actions (Show on Hover) */}
                <div className="absolute bottom-3 right-3 flex translate-y-10 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(it);
                      setOpenModal(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <FaPen size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(it._id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-lg hover:bg-red-50"
                    title="Xóa"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-1 flex-col p-4">
                <h2 className="mb-1 line-clamp-1 text-base font-bold text-slate-800 transition-colors group-hover:text-primary">{it.name}</h2>

                {/* Category Name (Assumed from population or mapping) */}
                <p className="line-clamp-2 text-xs text-slate-500">{it.description || 'Chưa có mô tả'}</p>

                <div className="mt-auto flex items-center justify-between border-t border-dashed border-gray-100 pt-3 text-xs text-slate-400">
                  <span>ID: ...{it._id.slice(-6)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

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
