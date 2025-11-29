'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-daisyui';
import { FaTimes, FaPlus, FaPen } from 'react-icons/fa';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  editing: IRentalCategory | null;

  name: string;
  description: string;
  categoryCode: number | '';

  onChangeName: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeCategoryCode: (v: number | '') => void;

  onSave: () => Promise<void> | void;
}

export default function RentalCategoryModal({
  open,
  onClose,
  loading,
  editing,
  name,
  description,
  categoryCode,
  onChangeName,
  onChangeDescription,
  onChangeCategoryCode,
  onSave,
}: CategoryFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  useEscClose(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 px-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
          >
            <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-primary p-1 text-white hover:bg-gray-200">
              <FaTimes size={14} />
            </button>

            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
              {editing?._id ? <FaPen /> : <FaPlus />}
              {editing?._id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>

            <form id="rental-category-form" onSubmit={handleSubmit} className="space-y-3">
              <InputForm
                autoFocus
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Tên danh mục"
                classNameLabel="bg-white px-2 font-medium"
              />

              <InputForm
                type="number"
                value={categoryCode}
                onChange={(e) => {
                  const raw = e.target.value;
                  onChangeCategoryCode(raw === '' ? '' : Number(raw));
                }}
                placeholder="Mã danh mục (số)"
                classNameLabel="bg-white px-2 font-medium"
              />

              <TextareaForm value={description} onChange={(e) => onChangeDescription(e.target.value)} placeholder="Mô tả (tuỳ chọn)" rows={3} />

              <div className="mt-5 flex justify-end gap-2">
                <CancelBtn value="Hủy" type="button" onClick={onClose} />
                <Button color="primary" type="submit" size="sm" disabled={loading} className="flex items-center gap-2 rounded-md px-4 py-2">
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>{editing?._id ? 'Cập nhật' : 'Tạo mới'}</>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
