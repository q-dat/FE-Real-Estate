'use client';

import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '@/components/userPage/ui/form/InputForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';
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

  const [images, setImages] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [thumbnails, setThumbnails] = useState<FileList | null>(null);
  const [previewThumbnails, setPreviewThumbnails] = useState<string[]>([]);

  useEscClose(open, onClose);

  /* Khi mở modal để chỉnh sửa */
  useEffect(() => {
    if (!editingItem) {
      reset({
        name: '',
        description: '',
        status: '',
      });
      setPreviewImages([]);
      setPreviewThumbnails([]);
      return;
    }

    reset({
      name: editingItem.name,
      description: editingItem.description,
      status: editingItem.status,
    });

    setPreviewImages(editingItem.images ? [editingItem.images] : []);
    setPreviewThumbnails(editingItem.thumbnails || []);
  }, [editingItem, reset]);

  const removeImage = (url: string) => {
    setPreviewImages((prev) => prev.filter((u) => u !== url));
  };

  const removeThumbnails = (url: string) => {
    setPreviewThumbnails((prev) => prev.filter((u) => u !== url));
  };

  const onSubmit: SubmitHandler<IInterior> = async (data) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('status', data.status || '');

    if (editingItem?.images && !images) {
      formData.append('oldImages', editingItem.images);
    }

    if (images) {
      Array.from(images).forEach((f) => formData.append('images', f));
      if (editingItem?.images) formData.append('oldImages', editingItem.images);
    }

    if (editingItem?.thumbnails?.length && !thumbnails) {
      editingItem.thumbnails.forEach((t) => formData.append('oldThumbnails', t));
    }

    if (thumbnails) {
      Array.from(thumbnails).forEach((f) => formData.append('thumbnails', f));
      editingItem?.thumbnails?.forEach((t) => formData.append('oldThumbnails', t));
    }

    if (editingItem?._id) await interiorService.update(editingItem._id, formData);
    else await interiorService.create(formData);

    await reload();
    onClose();
  };

  const classNameLabel = 'bg-white px-2 font-medium';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full overflow-hidden rounded-md border-8 border-white bg-white shadow-xl xl:max-w-[600px]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex items-center justify-between border-b bg-white p-3">
              <div className="flex items-center gap-2 font-semibold">
                {editingItem ? <FaPen /> : <FaPlus />}
                <span>{editingItem ? 'Chỉnh sửa nội thất' : 'Thêm nội thất'}</span>
              </div>
              <Button className="bg-red-700 text-white" onClick={onClose}>
                <MdClose />
              </Button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-4 scrollbar-hide">
              <form id="interior-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <InputForm
                  {...register('name', { required: true })}
                  classNameLabel={classNameLabel}
                  label="Tên nội thất"
                  placeholder="Nhập tên nội thất"
                  bordered
                />

                <TextareaForm {...register('description')} placeholder="Mô tả" />
                <InputForm {...register('status')} classNameLabel={classNameLabel} label="Trạng thái" bordered />

                <div>
                  <LabelForm title="Ảnh chính" />
                  <input type="file" accept="image/*" onChange={(e) => setImages(e.target.files)} className="file-input file-input-bordered w-full" />

                  {previewImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {previewImages.map((url, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-md border">
                          <Zoom>
                            <Image src={url} alt="preview" fill unoptimized className="object-cover" />
                          </Zoom>
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 bg-black/60 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <LabelForm title="Thumbnails" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setThumbnails(e.target.files)}
                    className="file-input file-input-bordered w-full"
                  />

                  {previewThumbnails.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {previewThumbnails.map((url, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-md border">
                          <Zoom>
                            <Image src={url} alt="thumbnails" fill unoptimized className="object-cover" />
                          </Zoom>
                          <button
                            type="button"
                            onClick={() => removeThumbnails(url)}
                            className="absolute right-1 top-1 bg-black/60 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white p-3">
                <CancelBtn value="Hủy" onClick={onClose} type="button" />
                <Button form="interior-form" type="submit" color="primary" className="px-4">
                  {editingItem ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
