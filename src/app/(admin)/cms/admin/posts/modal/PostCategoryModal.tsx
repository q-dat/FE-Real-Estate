'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { AnimatePresence, motion } from 'framer-motion';
import { IPostCategory } from '@/types/type/post/post-category';
import { postCategoryService } from '@/services/postCategoryService';
import DeleteModal from '../../DeleteModal';

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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="w-full max-w-3xl rounded-lg bg-white shadow-xl" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}>
          <div className="border-b px-5 py-4 text-lg font-semibold">Quản lý danh mục</div>

          <div className="grid grid-cols-1 gap-4 px-5 py-4 xl:grid-cols-2">
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục"
                className="w-full rounded-md border px-3 py-2"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả"
                className="w-full rounded-md border px-3 py-2"
              />

              <div className="flex gap-2">
                <Button color="primary" onClick={submit} loading={loading}>
                  {editing ? 'Cập nhật' : 'Thêm mới'}
                </Button>

                {editing && <Button onClick={resetForm}>Huỷ</Button>}
              </div>
            </div>

            {/* ---------------------- list ---------------------- */}
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  {c.description && <div className="text-xs text-gray-500">{c.description}</div>}
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setDescription(c.description ?? '');
                    }}
                  >
                    Sửa
                  </button>

                  <button
                    className="text-red-600"
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

          <div className="flex justify-end border-t px-5 py-3">
            <Button onClick={onClose}>Đóng</Button>
          </div>

          <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
