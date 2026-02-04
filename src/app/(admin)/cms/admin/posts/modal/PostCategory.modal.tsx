'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IPostCategory } from '@/types/post/post-category.types';
import { postCategoryService } from '@/services/post/postCategory.service';
import DeleteModal from '../../Delete.modal';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import SubmitBtn from '@/components/userPage/ui/btn/SubmitBtn';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import InputForm from '@/components/userPage/ui/form/InputForm';
import { FaDeleteLeft } from 'react-icons/fa6';

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
        await postCategoryService.update(editing._id, { name, description });
      } else {
        await postCategoryService.create({ name, description });
      }

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
    if (editing?._id === deletingId) resetForm();
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-primary-lighter shadow-xl"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-2">
              <div>
                <h1 className="text-xl font-medium">{editing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h1>
                <p className="text-xs text-gray-500">Click vào danh mục để chỉnh sửa</p>
              </div>
              <CancelBtn value="Đóng/Esc" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="grid flex-1 grid-cols-1 gap-2 overflow-hidden p-2 xl:grid-cols-2">
              {/* Form */}
              <div className="space-y-4 rounded-xl border bg-white p-2">
                <InputForm value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên danh mục" />

                <TextareaForm placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />

                <div className="flex gap-2">
                  <SubmitBtn loading={loading} onClick={submit} value={editing ? 'Lưu thay đổi' : 'Thêm'} />
                  {editing && <CancelBtn value="Hủy" onClick={resetForm} />}
                </div>
              </div>

              {/* List */}
              <div className="space-y-2 overflow-y-auto">
                {categories.map((c) => {
                  const active = editing?._id === c._id;

                  return (
                    <div
                      key={c._id}
                      onClick={() => {
                        setEditing(c);
                        setName(c.name);
                        setDescription(c.description ?? '');
                      }}
                      className={`group cursor-pointer rounded-lg border px-3 py-2 transition ${
                        active ? 'border-green-500 bg-green-50 text-black' : 'bg-primary text-white hover:bg-white hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{c.name}</div>
                          {c.description && <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">{c.description}</div>}
                        </div>

                        <button
                          className={`shrink-0 text-xs group-hover:text-red-500 ${active ? 'text-red-500' : 'text-white'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(c._id);
                            setConfirmOpen(true);
                          }}
                        >
                          <FaDeleteLeft size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </>
  );
}
