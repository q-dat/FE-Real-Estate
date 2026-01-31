'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import { rentalPostAdminService } from '@/services/rentalPostAdmin.service';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  post: IRentalPostAdmin | null;
  reload: () => Promise<void>;
}

export default function AdminInternalModal({ open, onClose, post, reload }: Props) {
  const { register, handleSubmit, reset } = useForm<Pick<IRentalPostAdmin, 'adminNote'>>();
  const [adminImages, setAdminImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEscClose(open, onClose);

  useEffect(() => {
    if (!post) return;

    reset({ adminNote: post.adminNote });
    setPreviewUrls(post.adminImages || []);
  }, [post, reset]);

  const removeImage = (url: string) => {
    setPreviewUrls((prev) => prev.filter((u) => u !== url));
  };

  const onSubmit = async (data: Pick<IRentalPostAdmin, 'adminNote'>) => {
    if (!post?._id) return;

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('adminNote', data.adminNote || '');

      previewUrls.forEach((url) => {
        formData.append('oldAdminImages', url);
      });

      if (adminImages) {
        Array.from(adminImages).forEach((file) => {
          formData.append('adminImages', file);
        });
      }

      await rentalPostAdminService.update(post._id, formData);
      await reload();
      onClose();
    } catch (err) {
      console.error('Admin internal update failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-overlay backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-[80vw] rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="text-lg font-bold text-gray-800">Thông tin nội bộ Admin</h3>
              <Button onClick={onClose} color="ghost" className="btn-circle">
                <MdClose size={20} />
              </Button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
              <div>
                <LabelForm title="Ghi chú nội bộ" />
                <TextareaForm {...register('adminNote')} rows={4} />
              </div>

              <div>
                <LabelForm title="Ảnh nội bộ (Admin Images)" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setAdminImages(e.target.files)}
                  className="file-input file-input-bordered file-input-info w-full"
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={url + i} className="relative aspect-square overflow-hidden rounded-lg border">
                      <Zoom>
                        <Image src={url} alt="admin-preview" fill unoptimized className="object-cover" />
                      </Zoom>
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t pt-3">
                <Button type="button" color="ghost" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" color="primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu nội bộ'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
