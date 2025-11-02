'use client';
import { useEffect, useState } from 'react';
import { Button, Select } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import InputForm from '@/components/userPage/ui/form/InputForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';

interface Props {
  open: boolean;
  onClose: () => void;
  editingPost: IRentalPostAdmin | null;
  categories: { _id: string; name: string }[];
  reload: () => Promise<void>;
}

export default function RentalPostAdminModal({ open, onClose, editingPost, categories, reload }: Props) {
  const [images, setImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { register, handleSubmit, reset } = useForm<IRentalPostAdmin>();

  // Hook ESC
  useEscClose(open, onClose);

  useEffect(() => {
    if (editingPost) {
      reset({
        ...editingPost,
        category: typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
      } as unknown as IRentalPostAdmin);
      setPreviewUrls(editingPost.images || []);
    } else {
      reset({});
      setPreviewUrls([]);
    }
  }, [editingPost, reset]);

  const removeImage = (url: string) => setPreviewUrls((prev) => prev.filter((u) => u !== url));

  const handleFormSubmit: SubmitHandler<IRentalPostAdmin> = async (data) => {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (key === 'images') continue;
        if (value !== undefined && value !== null) formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }

      if (editingPost?.images?.length && !images) editingPost.images.forEach((u) => formData.append('oldImages', u));
      if (images) {
        Array.from(images).forEach((f) => formData.append('images', f));
        editingPost?.images?.forEach((u) => formData.append('oldImages', u));
      }

      if (editingPost?._id) await rentalPostAdminService.update(editingPost._id, formData);
      else await rentalPostAdminService.create(formData);

      onClose();
      await reload();
    } catch (err) {
      console.error('Lỗi gửi form:', err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // bấm ngoài để đóng
        >
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full overflow-hidden rounded-md border-8 border-white bg-white shadow-xl xl:max-w-[80vw]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-2">
              <h3 className="flex items-center gap-2 text-base font-semibold xl:text-lg">
                {editingPost ? <FaPen /> : <FaPlus />}
                {editingPost ? 'Chỉnh sửa bài đăng' : 'Thêm bài đăng mới'}
              </h3>
              <Button
                onClick={onClose}
                className="flex items-center justify-center rounded-md bg-red-700 px-2 py-1 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <MdClose size={18} />
              </Button>
            </div>

            {/* FORM */}
            <div className="max-h-[80vh] overflow-y-auto border-2 border-white scrollbar-hide">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 grid gap-x-1 gap-y-4 xl:grid-cols-2">
                <div className="col-span-2">
                  <InputForm
                    classNameLabel="bg-white px-2 font-medium"
                    {...register('title', { required: true })}
                    label="Tiêu đề"
                    bordered
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Select {...register('category', { required: true })} className="select select-bordered w-full">
                    <option value="">-- Danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2">
                  <TextareaForm {...register('description', { required: true })} placeholder="Mô tả chi tiết" />
                </div>
                <div className="col-span-2">
                  <TextareaForm {...register('amenities')} placeholder="Tiện ích (máy lạnh, chỗ để xe,…)" />
                </div>
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('price', { required: true, valueAsNumber: true })}
                  type="number"
                  label="Giá (VNĐ)"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('priceUnit', { required: true })}
                  label="Đơn vị giá"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('area', { required: true, valueAsNumber: true })}
                  type="number"
                  label="Diện tích (m²)"
                  bordered
                  required
                />
                <InputForm classNameLabel="bg-white px-2 font-medium" {...register('phoneNumbers')} label="Số điện thoại liên hệ" bordered />
                <InputForm classNameLabel="bg-white px-2 font-medium" {...register('zaloLink')} label="Link Zalo" bordered />
                <InputForm classNameLabel="bg-white px-2 font-medium" {...register('youtubeLink')} label="Link Youtube" bordered />
                <div className="col-span-2">
                  <InputForm classNameLabel="bg-white px-2 font-medium" {...register('videoTitle')} label="Tiêu đề video" bordered />
                </div>
                <div className="col-span-2">
                  <TextareaForm {...register('videoDescription')} placeholder="Mô tả video" />
                </div>
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('province', { required: true })}
                  label="Tỉnh / Thành phố"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('district', { required: true })}
                  label="Quận / Huyện"
                  bordered
                  required
                />
                <InputForm classNameLabel="bg-white px-2 font-medium" {...register('ward')} label="Phường / Xã" bordered />
                <InputForm
                  classNameLabel="bg-white px-2 font-medium"
                  {...register('address', { required: true })}
                  label="Địa chỉ cụ thể"
                  bordered
                  required
                />
                <div className="col-span-2">
                  <TextareaForm {...register('adminNote')} placeholder="Ghi chú nội bộ cho admin" />
                </div>

                {editingPost && (
                  <InputForm
                    classNameLabel="bg-white px-2 font-medium"
                    label="Mã bài đăng"
                    value={editingPost.code}
                    readOnly
                    bordered
                    className="bg-black/5"
                  />
                )}
                <InputForm classNameLabel="bg-white px-2 font-medium" {...register('author')} label="Người đăng tin" bordered />

                {/* Ảnh */}
                <div className="col-span-full">
                  <LabelForm title="Ảnh minh họa" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="file-input file-input-bordered w-full rounded-md focus:outline-none"
                  />
                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-md">
                          <Image src={url} alt={`preview-${i}`} width={200} height={200} unoptimized className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-3 text-white opacity-0 transition group-hover:opacity-100"
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* FOOTER */}
            {/* Nút hành động */}
            <div className="col-span-full mt-4 flex justify-end gap-3">
              <CancelBtn value="Hủy" type="button" onClick={onClose} />
              <Button color="primary" type="submit" size="sm" className="rounded-md px-3 py-1">
                {editingPost ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
