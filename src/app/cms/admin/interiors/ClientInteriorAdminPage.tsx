'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import { IInterior } from '@/types/type/interiors/interiors';
import DeleteModal from '../DeleteModal';
import InteriorModal from './InteriorModal';
import { interiorService } from '@/services/interiorsService';

interface Props {
  interiors: IInterior[];
}

export default function ClientInteriorAdminPage({ interiors }: Props) {
  const [items, setItems] = useState<IInterior[]>(interiors);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IInterior | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await interiorService.getAll();
    setItems(Array.isArray(data) ? data : []);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    await interiorService.delete(deletingId);
    await reload();
    setConfirmOpen(false);
    setDeletingId(null);
  }, [deletingId, reload]);

  return (
    <div className="min-h-screen bg-white px-2 pt-mobile-padding-top text-black xl:px-4 xl:pt-desktop-padding-top">
      <div className="mb-5 mt-10 flex items-center justify-between border-b border-gray-200 pb-3">
        <h1 className="text-lg font-semibold text-black xl:text-xl">Quản lý thiết kế nội thất</h1>

        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
          className="rounded-md bg-primary text-white"
        >
          Thêm
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const thumbnail = Array.isArray(item.images) ? item.images[0] : item.images;

          return (
            <div
              key={item._id}
              onClick={() => {
                setEditingItem(item);
                setOpenModal(true);
              }}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={thumbnail || '/no-image.png'}
                  alt={item.name}
                  width={400}
                  height={300}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <h2 className="line-clamp-4 text-[15px] font-semibold text-gray-900 group-hover:text-primary">{item.name}</h2>

                {item.description && <p className="line-clamp-3 text-[12px] text-gray-500">{item.description}</p>}

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] font-medium">{item.status || 'hidden'}</span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setOpenModal(true);
                      }}
                      className="rounded-full bg-blue-500 px-2 py-1 text-white"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="rounded-full bg-rose-500 px-2 py-1 text-white"
                    >
                      Xóa
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
