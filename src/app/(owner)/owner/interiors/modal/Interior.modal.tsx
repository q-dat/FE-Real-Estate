'use client';

import { useEffect, useState } from 'react';
import { Button, Select } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen, FaCloudUploadAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';
import { interiorService } from '@/services/interior/interior.service';
import { IInterior } from '@/types/interiors/interiors.types';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';

interface Props {
  open: boolean;
  onClose: () => void;
  editingItem: IInterior | null;
  categories: { _id: string; name: string }[];
  reload: () => Promise<void>;
}

// --- 1. Cập nhật Component Upload để nhận và hiển thị số lượng file ---
const FileUploadArea = ({
  label,
  multiple = false,
  onChange,
  fileCount = 0, // Thêm prop này
}: {
  label: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileCount?: number;
}) => (
  <div className="form-control w-full">
    <label className="label pb-1 pt-0">
      <span className="label-text flex w-full justify-between font-semibold text-slate-700">
        {label}
        {fileCount > 0 && <span className="text-xs font-bold text-green-600">Đã chọn: {fileCount} ảnh</span>}
      </span>
    </label>
    <label
      className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
        fileCount > 0 ? 'border-green-500 bg-green-50/50' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <div className="flex flex-col items-center justify-center pb-6 pt-5">
        {fileCount > 0 ? (
          // Hiển thị khi đã chọn file
          <div className="animate-bounce-short text-center">
            <FaCheckCircle className="mx-auto mb-2 text-3xl text-green-500" />
            <p className="text-sm font-bold text-green-700">Đã chọn {fileCount} tệp tin</p>
            <p className="mt-1 text-xs text-green-600">Click để thay đổi</p>
          </div>
        ) : (
          // Hiển thị mặc định
          <>
            <FaCloudUploadAlt className="mb-2 text-3xl text-gray-400" />
            <p className="mb-1 text-sm text-gray-500">
              <span className="font-semibold">Click để tải ảnh</span>
            </p>
            <p className="text-xs text-gray-500">{multiple ? 'Chọn nhiều ảnh' : 'PNG, JPG (MAX. 2MB)'}</p>
          </>
        )}
      </div>
      <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={onChange} />
    </label>
  </div>
);

export default function InteriorModal({ open, onClose, editingItem, categories, reload }: Props) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<IInterior>();

  // State lưu FileList gốc (để đếm số lượng file mới upload)
  const [images, setImages] = useState<FileList | null>(null);
  const [thumbnails, setThumbnails] = useState<FileList | null>(null);

  // State lưu URL preview (để hiển thị ảnh)
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewThumbnails, setPreviewThumbnails] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingItem) {
      reset({ name: '', description: '', status: '' });
      setPreviewImages([]);
      setPreviewThumbnails([]);
      setImages(null); // Reset file input
      setThumbnails(null); // Reset file input
      return;
    }
    reset({
      ...editingItem,
      category: typeof editingItem.category === 'object' ? editingItem.category._id : editingItem.category,
    } as unknown as IInterior);

    setPreviewImages(editingItem.images ? [editingItem.images] : []);
    setPreviewThumbnails(editingItem.thumbnails || []);
    // Lưu ý: Khi edit, images/thumbnails là null vì chưa chọn file mới
    setImages(null);
    setThumbnails(null);
  }, [editingItem, reset]);

  const removeImage = (url: string) => setPreviewImages((prev) => prev.filter((u) => u !== url));
  const removeThumbnails = (url: string) => setPreviewThumbnails((prev) => prev.filter((u) => u !== url));

  // Hàm xử lý khi chọn file ảnh đại diện
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImages(files); // Lưu FileList để đếm và upload
    if (files && files.length > 0) {
      // Tạo preview url
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewImages(urls);
    }
  };

  // Hàm xử lý khi chọn file thumbnails
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setThumbnails(files); // Lưu FileList để đếm và upload
    if (files && files.length > 0) {
      // Tạo preview url
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewThumbnails(urls);
    }
  };

  const onSubmit: SubmitHandler<IInterior> = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      const categoryId = typeof data.category === 'string' ? data.category : data.category._id;

      formData.append('category', categoryId);
      formData.append('name', data.name);
      formData.append('status', data.status || '');
      formData.append('description', data.description || '');
      formData.append('content', data.content || '');

      if (editingItem?.images && !images) formData.append('oldImages', editingItem.images);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const classNameLabel = 'bg-white px-1 font-semibold text-slate-700 text-sm';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[90vh] w-full flex-col overflow-hidden rounded-md bg-white shadow-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-4xl"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${editingItem ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}
                >
                  {editingItem ? <FaPen /> : <FaPlus />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{editingItem ? 'Cập nhật thông tin' : 'Thêm thiết kế mới'}</h3>
                  <p className="text-xs text-slate-500">{editingItem ? 'Chỉnh sửa chi tiết bản ghi' : 'Điền thông tin để tạo mới'}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <MdClose size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              <form id="interior-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Column 1: Info */}
                <div className="space-y-4">
                  <InputForm
                    {...register('name', { required: true })}
                    classNameLabel={classNameLabel}
                    label="Tên nội thất"
                    placeholder="VD: Sofa da cao cấp..."
                    className="input-bordered input-primary w-full"
                    bordered
                  />

                  <div className="form-control w-full">
                    <label className="label pb-1 pt-0">
                      <span className="label-text font-semibold text-slate-700">Danh mục</span>
                    </label>
                    <Select
                      {...register('category', { required: true })}
                      className="select select-bordered w-full font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <TextareaForm
                    {...register('description')}
                    placeholder="Mô tả đặc điểm, chất liệu..."
                    className="textarea-bordered min-h-[120px] focus:border-primary"
                  />

                  <InputForm
                    {...register('status')}
                    classNameLabel={classNameLabel}
                    label="Trạng thái (Tag)"
                    placeholder="VD: Mới, Hot..."
                    bordered
                  />

                  <JoditEditorWrapper height={520} value={watch('content') || ''} onChange={(v) => setValue('content', v)} />
                </div>

                {/* Column 2: Images */}
                <div className="space-y-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  {/* --- Main Image Upload --- */}
                  <div>
                    <FileUploadArea
                      label="Ảnh đại diện (Cover)"
                      onChange={handleImageChange}
                      fileCount={images?.length || 0} // Truyền số lượng file vào đây
                    />
                    {previewImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {previewImages.map((url, i) => (
                          <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border bg-white shadow-sm">
                            <Zoom>
                              <Image src={url} alt="preview" fill unoptimized className="object-cover" />
                            </Zoom>
                            <button
                              type="button"
                              onClick={() => removeImage(url)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                            >
                              <FaTimes size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="divider my-0"></div>

                  {/* --- Thumbnails Upload --- */}
                  <div>
                    <FileUploadArea
                      label="Thư viện ảnh chi tiết"
                      multiple
                      onChange={handleThumbnailChange}
                      fileCount={thumbnails?.length || 0} // Truyền số lượng file vào đây
                    />
                    {previewThumbnails.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {previewThumbnails.map((url, i) => (
                          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border bg-white shadow-sm">
                            <Zoom>
                              <Image src={url} alt="thumb" fill unoptimized className="object-cover" />
                            </Zoom>
                            <button
                              type="button"
                              onClick={() => removeThumbnails(url)}
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                            >
                              <FaTimes size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
              <CancelBtn onClick={onClose} type="button" value="Hủy" />

              <Button
                size="sm"
                form="interior-form"
                type="submit"
                color="primary"
                className={`min-w-[120px] rounded-lg shadow-lg shadow-primary/30 ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
