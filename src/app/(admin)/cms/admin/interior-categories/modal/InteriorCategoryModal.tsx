'use client';
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-daisyui';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';
import { IInteriorCategory } from '@/types/interiorsCategory/interiorsCategory.types';
import { interiorCategoryService } from '@/services/interiorCategory.service';

export interface FormValues {
  name: string;
  description: string;
  categoryCode: number | '';
}

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  editing: IInteriorCategory | null;
}

export default function InteriorCategoryModal({ open, onClose, reload, editing }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      categoryCode: '',
    },
  });

  useEscClose(open, onClose);

  /* Reset form khi edit dữ liệu */
  useEffect(() => {
    if (!editing) {
      reset({
        name: '',
        description: '',
        categoryCode: '',
      });
      return;
    }

    reset({
      name: editing.name,
      description: editing.description || '',
      categoryCode: typeof editing.categoryCode === 'number' ? editing.categoryCode : '',
    });
  }, [editing, reset]);

  /* Submit form */
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const payload = {
      name: data.name,
      description: data.description || '',
      categoryCode: data.categoryCode === '' ? undefined : Number(data.categoryCode),
    };

    if (editing?._id) {
      await interiorCategoryService.update(editing._id, payload);
    } else {
      await interiorCategoryService.create(payload);
    }

    await reload();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 px-2 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-primary">{editing?._id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Name */}
              <div>
                <InputForm
                  placeholder="Tên danh mục"
                  {...register('name', {
                    required: 'Tên danh mục là bắt buộc',
                  })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Category Code */}
              <div>
                <InputForm
                  type="number"
                  placeholder="Mã danh mục"
                  {...register('categoryCode', {
                    validate: (v) => v === '' || !isNaN(Number(v)) || 'Mã danh mục phải là số',
                  })}
                />
                {errors.categoryCode && <p className="mt-1 text-xs text-red-500">{errors.categoryCode.message}</p>}
              </div>

              {/* Description */}
              <TextareaForm rows={3} placeholder="Mô tả" {...register('description')} />

              <div className="mt-4 flex justify-end gap-2">
                <CancelBtn onClick={onClose} type="button" value="Hủy" />

                <Button size="sm" color="primary" type="submit" disabled={isSubmitting} className="rounded-md px-4">
                  {isSubmitting ? 'Đang xử lý...' : editing?._id ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
