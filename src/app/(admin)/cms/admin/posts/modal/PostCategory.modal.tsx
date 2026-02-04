'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { AnimatePresence, motion } from 'framer-motion';
import { IPostCategory } from '@/types/post/post-category.types';
import { postCategoryService } from '@/services/post/postCategory.service';
import DeleteModal from '../../Delete.modal';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';

interface Props {
  open: boolean;
  categories: IPostCategory[];
  onClose: () => void;
  onChange: (categories: IPostCategory[]) => void;
}

export default function PostCategoryModal({ open, categories, onClose, onChange }: Props) {
  const [editing, setEditing] = useState<IPostCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
  };

  const submit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editing) {
        await postCategoryService.update(editing._id, {
          name,
          description,
        });
      } else {
        await postCategoryService.create({
          name,
          description,
        });
      }

      // ⬇️ refetch danh sách
      const fresh = await postCategoryService.getAll();
      onChange(Array.isArray(fresh) ? fresh : []);

      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    await postCategoryService.delete(deletingId);

    const fresh = await postCategoryService.getAll();
    onChange(Array.isArray(fresh) ? fresh : []);

    setConfirmOpen(false);
    setDeletingId(null);
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
          >
            {/* Header */}
            <div className="border-b px-6 py-4 text-lg font-semibold">Quản lý danh mục</div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tên danh mục</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="Ví dụ: Tin tức"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Mô tả</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-md border px-3 py-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button color="primary" onClick={submit} loading={loading}>
                      {editing ? 'Cập nhật' : 'Thêm mới'}
                    </Button>

                    {editing && <Button onClick={resetForm}>Huỷ</Button>}
                  </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div key={c._id} className="flex items-start justify-between rounded-md border px-3 py-2 transition hover:bg-gray-50">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        {c.description && <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">{c.description}</div>}
                      </div>

                      <div className="ml-3 flex shrink-0 gap-2 text-xs">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => {
                            setEditing(c);
                            setName(c.name);
                            setDescription(c.description ?? '');
                          }}
                        >
                          Sửa
                        </button>

                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => {
                            setDeletingId(c._id);
                            setConfirmOpen(true);
                          }}
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* Footer */}
      <CancelBtn value="Đóng" onClick={onClose} />
      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </>
  );
}
