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
  const { register, handleSubmit, reset } = useForm<IRentalPostAdmin>();
  const [images, setImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const classNameLabel = 'bg-white px-2 font-medium';
  useEscClose(open, onClose);

  // Load dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (editingPost) {
      // Nếu đang chỉnh sửa
      reset({
        ...editingPost,
        category: typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
        postedAt: editingPost.postedAt ? new Date(editingPost.postedAt).toISOString().split('T')[0] : '',
        expiredAt: editingPost.expiredAt ? new Date(editingPost.expiredAt).toISOString().split('T')[0] : '',
      } as unknown as IRentalPostAdmin);

      // Giữ nguyên hình ảnh preview cũ
      setPreviewUrls(editingPost.images || []);
    } else {
      // Nếu là tạo mới
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + 1); // +1 ngày hết hạn

      reset({
        postedAt: today.toISOString().split('T')[0],
        expiredAt: future.toISOString().split('T')[0],
      } as unknown as IRentalPostAdmin);

      // Xóa preview cũ (reset state)
      setPreviewUrls([]);
    }
  }, [editingPost, reset]);

  const removeImage = (url: string) => setPreviewUrls((prev) => prev.filter((u) => u !== url));

  const handleFormSubmit: SubmitHandler<IRentalPostAdmin> = async (data) => {
    try {
      setLoading(true); // Bắt đầu loading

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

      // Gọi API
      if (editingPost?._id) await rentalPostAdminService.update(editingPost._id, formData);
      else await rentalPostAdminService.create(formData);

      await reload();
      onClose(); // Đóng modal sau khi thành công
    } catch (err) {
      console.error('Lỗi gửi form:', err);
    } finally {
      setLoading(false); // Dừng loading dù có lỗi
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
          onClick={onClose}
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
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-2">
              <div className="flex flex-col text-base font-semibold xl:text-lg">
                {/* Hàng trên: icon + tiêu đề */}
                <div className="flex items-center gap-2 text-gray-800">
                  {editingPost ? <FaPen className="text-primary" /> : <FaPlus className="text-primary" />}
                  <h3>{editingPost ? 'Chỉnh sửa bài đăng' : 'Thêm bài đăng mới'}</h3>
                </div>

                {/* Hàng dưới: mã bài đăng */}
                {editingPost?.code && (
                  <span className="mt-1 inline-block w-fit rounded-md bg-primary px-2 py-1 text-sm font-medium text-white shadow-sm">
                    Mã tin: {editingPost.code}
                  </span>
                )}
              </div>
              <Button
                onClick={onClose}
                className="flex items-center justify-center rounded-md bg-red-700 px-2 py-1 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <MdClose size={18} />
              </Button>
            </div>

            {/* Form */}
            <div className="relative max-h-[80vh] overflow-y-auto border-2 border-white scrollbar-hide">
              <form id="rental-post-form" onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 grid gap-x-1 gap-y-4 xl:grid-cols-2">
                <div className="col-span-full">
                  <InputForm
                    autoFocus
                    classNameLabel={`${classNameLabel}`}
                    {...register('title', { required: true })}
                    label="Tiêu đề"
                    placeholder="Nhập tiêu đề bài đăng"
                    bordered
                    required
                  />
                </div>
                <div className="col-span-full">
                  <Select
                    {...register('category', { required: true })}
                    className="select select-bordered w-full bg-primary text-center text-sm font-bold text-white hover:bg-white hover:text-primary focus:outline-none"
                  >
                    <option value="">-- DANH MỤC BÀI ĐĂNG --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <TextareaForm {...register('description', { required: true })} placeholder="Mô tả chi tiết bài đăng..." />
                <TextareaForm {...register('amenities')} placeholder="Tiện ích (máy lạnh, chỗ để xe, v.v...)" />
                {/* Loại Tin */}
                <div className="col-span-full">
                  <LabelForm title="Loại tin" />
                  <Select
                    defaultValue={'highlight'}
                    {...register('postType', { required: true })}
                    className="select select-bordered w-full focus:outline-none"
                  >
                    <option value="basic">Cơ bản</option>
                    <option value="vip1">VIP 1</option>
                    <option value="vip2">VIP 2</option>
                    <option value="vip3">VIP 3</option>
                    <option value="highlight">Nổi bật</option>
                  </Select>
                </div>

                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('price', { required: true, valueAsNumber: true })}
                  type="number"
                  label="Giá (VNĐ)"
                  placeholder="Nhập giá thuê"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('priceUnit', { required: true })}
                  label="Đơn vị giá"
                  placeholder="vd: /tháng, /m²"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('length')}
                  label="Chiều dài (m²)"
                  placeholder="Nhập chiều dài"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('width')}
                  label="Chiều rộng (m²)"
                  placeholder="Nhập chiều rộng"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('area', { required: true, valueAsNumber: true })}
                  type="number"
                  label="Diện tích (m²)"
                  placeholder="Nhập diện tích"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('phoneNumbers')}
                  label="Số điện thoại liên hệ"
                  placeholder="Nhập số điện thoại"
                  bordered
                />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('zaloLink')} label="Link Zalo" placeholder="Nhập link Zalo" bordered />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('youtubeLink')}
                  label="Link Youtube"
                  placeholder="Nhập link Youtube"
                  bordered
                />
                <div className="col-span-full">
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('videoTitle')}
                    label="Tiêu đề video"
                    placeholder="Nhập tiêu đề video"
                    bordered
                  />
                </div>
                <div className="col-span-full">
                  <TextareaForm {...register('videoDescription')} placeholder="Mô tả video..." />
                </div>
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('province', { required: true })}
                  label="Tỉnh / Thành phố"
                  placeholder="Nhập Tỉnh / Thành phố"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('district', { required: true })}
                  label="Quận / Huyện"
                  placeholder="Nhập Quận / Huyện"
                  bordered
                  required
                />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('ward')} label="Phường / Xã" placeholder="Nhập Phường / Xã" bordered />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('address', { required: true })}
                  label="Địa chỉ cụ thể"
                  placeholder="Nhập địa chỉ cụ thể"
                  bordered
                  required
                />
                <div className="col-span-full">
                  <TextareaForm {...register('adminNote')} placeholder="Ghi chú nội bộ cho admin..." />
                </div>
                <InputForm classNameLabel={`${classNameLabel}`} {...register('postedAt')} label="Ngày đăng tin" type="date" bordered required />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('expiredAt')} label="Ngày hết hạn tin" type="date" bordered required />
                <div className="col-span-full">
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('author')}
                    label="Người đăng tin"
                    placeholder="admin"
                    defaultValue="admin"
                    bordered
                  />
                </div>
                {/* Ảnh */}
                <div className="col-span-full mb-5">
                  <LabelForm title="Ảnh minh họa" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="file-input file-input-ghost file-input-primary w-full rounded-md focus:outline-none"
                  />
                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-10">
                      {previewUrls.map((url, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
                        >
                          <Image src={url} alt={`preview-${i}`} width={100} height={100} unoptimized className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-gray-200 bg-white p-3 shadow-inner">
                <CancelBtn value="Hủy" type="button" onClick={onClose} />
                <Button
                  color="primary"
                  type="submit"
                  form="rental-post-form"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-md px-4 py-2"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>{editingPost ? 'Cập nhật' : 'Tạo mới'}</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
