'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen, FaTrashAlt, FaImages } from 'react-icons/fa';
import InteriorModal from './InteriorModal';
import DeleteModal from '../DeleteModal';
import { IInterior } from '@/types/type/interiors/interiors';
import { interiorService } from '@/services/interiorsService';

interface Props {
  items: IInterior[];
}

export default function ClientInteriorAdminPage({ items: initialItems }: Props) {
  const [items, setItems] = useState<IInterior[]>(initialItems);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IInterior | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await interiorService.getAll();
    setItems(Array.isArray(data) ? data : []);
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

  return (
    <div className="min-h-screen bg-white px-2 pt-mobile-padding-top text-black xl:px-4 xl:pt-desktop-padding-top">
      <div className="mb-5 mt-10 flex items-center justify-between border-b border-gray-200 pb-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-black xl:text-xl">
          <FaImages className="text-primary" /> Quản lý nội thất
        </h1>
        <Button
          size="sm"
          className="flex items-center gap-2 rounded-md bg-primary text-white"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          <FaPlus /> Thêm
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {items.map((it) => {
          const thumbnails = it.thumbnails?.[0] || it.images || '/no-image.png';
          return (
            <div
              onClick={() => {
                setEditingItem(it);
                setOpenModal(true);
              }}
              key={it._id}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={thumbnails}
                  alt={it.name}
                  width={400}
                  height={300}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {it.thumbnails && it.thumbnails.length > 1 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                    <FaImages />
                    <span>{it.thumbnails.length}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div className="space-y-1">
                  <h2 className="line-clamp-3 text-[15px] font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary">
                    {it.name}
                  </h2>

                  {it.status && <span className="text-[13px] capitalize text-gray-500">{it.status}</span>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(it);
                        setOpenModal(true);
                      }}
                      className="rounded-full bg-blue-500 p-2 text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                    >
                      <FaPen size={12} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(it._id);
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

      {openModal && (
        <InteriorModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          reload={reload}
        />
      )}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
