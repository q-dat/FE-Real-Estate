'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';
import RentalCategoryModal from './RentalCategoryModal';
import DeleteModal from '../DeleteModal';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';
import { rentalCategoryService } from '@/services/rentalCategoryService';

interface Props {
  categories: IRentalCategory[];
}

export default function ClientRentalCategoryPage({ categories: initial }: Props) {
  const [items, setItems] = useState(initial);

  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IRentalCategory | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await rentalCategoryService.getAll();
    setItems(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    await rentalCategoryService.delete(deletingId);
    await reload();

    setDeletingId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="w-full">
      <div className="mb-5 mt-10 flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold xl:text-xl">Quản lý danh mục</h1>

        <Button
          size="sm"
          className="rounded-md bg-primary text-white"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          Thêm
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <motion.div
            key={it._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setEditingItem(it);
              setOpenModal(true);
            }}
            className="group flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:bg-primary hover:text-white"
          >
            <div>
              <h2 className="mb-1 text-base font-semibold">{it.name}</h2>
              {typeof it.categoryCode === 'number' && <p className="text-xs opacity-80">Mã: {it.categoryCode}</p>}
              {it.description && <p className="line-clamp-2 text-sm opacity-80">{it.description}</p>}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span>{new Date(it.createdAt).toLocaleDateString('vi-VN')}</span>

              <div className="flex gap-2">
                <Button
                  size="xs"
                  className="rounded-md bg-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(it);
                    setOpenModal(true);
                  }}
                >
                  Sửa
                </Button>

                <Button
                  size="xs"
                  className="rounded-md bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(it._id);
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {openModal && (
        <RentalCategoryModal
          open={openModal}
          editing={editingItem}
          reload={reload}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
        />
      )}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
