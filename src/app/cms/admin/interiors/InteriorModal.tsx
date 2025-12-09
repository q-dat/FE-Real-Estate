'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import Zoom from '@/lib/Zoom';
import { useEscClose } from '@/hooks/useEscClose';
import { interiorService } from '@/services/interiorsService';
import { IInterior } from '@/types/type/interiors/interiors';

interface Props {
  open: boolean;
  onClose: () => void;
  editingItem: IInterior | null;
  reload: () => Promise<void>;
}

export default function InteriorModal({ open, onClose, editingItem, reload }: Props) {
  const { register, handleSubmit, reset } = useForm<IInterior>();
  const [loading, setLoading] = useState(false);

  // File upload
  const [images, setImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEscClose(open, onClose);

  // Load data
  useEffect(() => {
    if (!editingItem) {
      reset({ name: '', description: '', status: '', images: [] });
      setPreviewUrls([]);
      return;
    }

    reset({
      name: editingItem.name,
      description: editingItem.description || '',
      status: editingItem.status || '',
      images: editingItem.images || [],
    });

    setPreviewUrls(editingItem.images || []);
  }, [editingItem, reset]);

  const removeImage = (url: string) => {
    setPreviewUrls((prev) => prev.filter((u) => u !== url));
  };

  const submitHandler: SubmitHandler<IInterior> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('status', data.status || '');

      // Giữ ảnh cũ
      previewUrls.forEach((existingUrl) => {
        formData.append('oldImages', existingUrl);
      });

      // Ảnh mới
      if (images) {
        Array.from(images).forEach((file) => {
          formData.append('images', file);
        });
      }

      if (editingItem?._id) {
        await interiorService.update(editingItem._id, formData);
      } else {
        await interiorService.create(formData);
      }

      await reload();
      onClose();
    } catch (err) {
      console.error('Interior submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full overflow-hidden rounded-md border-8 border-white bg-white shadow-xl xl:max-w-[70vw]"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            <div className="flex items-center justify-between border-b bg-white p-3">
              <h3 className="text-lg font-semibold">{editingItem ? 'Chỉnh sửa thiết kế' : 'Thêm thiết kế mới'}</h3>

              <Button onClick={onClose} className="rounded-md bg-red-700 px-2 py-1 text-sm font-semibold text-white hover:bg-red-800">
                <MdClose size={18} />
              </Button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-3">
              <form id="interior-form" onSubmit={handleSubmit(submitHandler)} className="grid gap-4 xl:grid-cols-2">
                <InputForm {...register('name', { required: true })} label="Tên thiết kế" placeholder="Nhập tên thiết kế" bordered required />

                <InputForm {...register('status')} label="Trạng thái" placeholder="Trạng thái (tùy chọn)" bordered />

                <div className="xl:col-span-2">
                  <TextareaForm {...register('description')} placeholder="Mô tả chi tiết..." />
                </div>

                {/* Upload Ảnh */}
                <div className="xl:col-span-2">
                  <LabelForm title="Ảnh thiết kế" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="file-input file-input-ghost file-input-primary w-full"
                  />

                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-8">
                      {previewUrls.map((url) => (
                        <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                          <Zoom>
                            <Image src={url} alt="preview" width={100} height={100} unoptimized className="h-full w-full object-cover" />
                          </Zoom>

                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t bg-white p-3">
              <CancelBtn value="Hủy" type="button" onClick={onClose} />
              <Button type="submit" form="interior-form" color="primary" disabled={loading} className="px-4 py-2">
                {loading ? 'Đang xử lý...' : editingItem ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
