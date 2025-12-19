'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPen, FaCheckCircle, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';

import { IRealEstateProject } from '@/types/type/realEstateProject/realEstateProject';
import { realEstateProjectService } from '@/services/realEstateProjectService';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import Zoom from '@/lib/Zoom';
import Image from 'next/image';

interface Props {
  open: boolean;
  editingItem: IRealEstateProject | null;
  onClose: () => void;
  reload: () => Promise<void>;
}

type MainTab = 'img' | 'general' | 'content' | 'pricing' | 'partner' | 'contact' | 'amenities';

type ContentTab = 'introduction' | 'description' | 'article';
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
export default function RealEstateProjectModal({ open, editingItem, onClose, reload }: Props) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<IRealEstateProject>();

  // State lưu FileList gốc (để đếm số lượng file mới upload)
  const [images, setImages] = useState<FileList | null>(null);
  const [thumbnails, setThumbnails] = useState<FileList | null>(null);

  // State lưu URL preview (để hiển thị ảnh)
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewThumbnails, setPreviewThumbnails] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [mainTab, setMainTab] = useState<MainTab>('img');
  const [contentTab, setContentTab] = useState<ContentTab>('introduction');

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingItem) {
      reset({});
      setPreviewImages([]);
      setPreviewThumbnails([]);
      setImages(null);
      setThumbnails(null);
      return;
    }

    reset(editingItem);

    setPreviewImages(editingItem.images ? [editingItem.images] : []);
    setPreviewThumbnails(editingItem.thumbnails || []);

    setImages(null);
    setThumbnails(null);
  }, [editingItem, reset]);

  const onSubmit = async (data: IRealEstateProject) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
          formData.append(key, value);
        }
      });

      if (editingItem?.images && !images) {
        formData.append('oldImages', editingItem.images);
      }

      if (images) {
        Array.from(images).forEach((f) => formData.append('images', f));
        editingItem?.images && formData.append('oldImages', editingItem.images);
      }

      if (editingItem?.thumbnails?.length && !thumbnails) {
        editingItem.thumbnails.forEach((t) => formData.append('oldThumbnails', t));
      }

      if (thumbnails) {
        Array.from(thumbnails).forEach((f) => formData.append('thumbnails', f));
        editingItem?.thumbnails?.forEach((t) => formData.append('oldThumbnails', t));
      }

      if (editingItem?._id) {
        await realEstateProjectService.update(editingItem._id, formData);
      } else {
        await realEstateProjectService.create(formData);
      }

      await reload();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (url: string) => setPreviewImages((prev) => prev.filter((u) => u !== url));
  const removeThumbnails = (url: string) => setPreviewThumbnails((prev) => prev.filter((u) => u !== url));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImages(files);
    if (files?.length) {
      setPreviewImages(Array.from(files).map((f) => URL.createObjectURL(f)));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setThumbnails(files);
    if (files?.length) {
      setPreviewThumbnails(Array.from(files).map((f) => URL.createObjectURL(f)));
    }
  };

  if (!open) return null;

  const classNameLabel = 'bg-white px-1 font-semibold text-slate-700 text-sm';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999999] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex h-[90vh] w-full flex-col overflow-hidden rounded-md bg-white shadow-2xl sm:max-w-5xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  editingItem ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}
              >
                {editingItem ? <FaPen /> : <FaPlus />}
              </div>
              <div>
                <h3 className="text-lg font-bold">{editingItem ? 'Cập nhật dự án' : 'Thêm dự án mới'}</h3>
                <p className="text-xs text-slate-500">Quản lý dự án bất động sản</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2">
              <MdClose size={22} />
            </button>
          </div>

          {/* Main Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-6 border-b">
              {[
                ['img', 'Hình ảnh'],
                ['general', 'Thông tin'],
                ['content', 'Nội dung'],
                ['pricing', 'Bảng giá'],
                ['partner', 'Đối tác'],
                ['contact', 'Liên hệ'],
                ['amenities', 'Tiện ích'],
              ].map(([key, label]) => {
                const active = mainTab === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMainTab(key as MainTab)}
                    className={`relative py-1 text-sm font-medium transition ${active ? 'text-primary' : 'text-slate-500 hover:text-slate-700'} `}
                  >
                    {label}

                    {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="real-estate-project-form" onSubmit={handleSubmit(onSubmit)}>
              {mainTab === 'img' && (
                <div>
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
              )}
              {mainTab === 'general' && (
                <div className="space-y-4">
                  <InputForm {...register('name')} label="Tên dự án" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('slug')} label="Slug SEO" bordered classNameLabel={classNameLabel} />
                  <InputForm
                    {...register('status')}
                    label="Trạng thái"
                    placeholder="0:Đang mở bán - 1:Sắp mở bán - 2:Đã bàn giao"
                    bordered
                    classNameLabel={classNameLabel}
                  />
                  <InputForm {...register('projectType')} label="Loại hình" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('area')} label="Diện tích" bordered classNameLabel={classNameLabel} />
                </div>
              )}

              {mainTab === 'content' && (
                <div className="space-y-4">
                  {/* Content Tabs */}
                  <div className="tabs-boxed tabs">
                    {[
                      ['introduction', 'Giới thiệu'],
                      ['description', 'Mô tả'],
                      ['article', 'Bài viết'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        className={`tab ${contentTab === key ? 'tab-active' : ''}`}
                        onClick={() => setContentTab(key as ContentTab)}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Editor */}
                  {contentTab === 'introduction' && (
                    <JoditEditorWrapper height={520} value={watch('introduction') || ''} onChange={(v) => setValue('introduction', v)} />
                  )}
                  {contentTab === 'description' && (
                    <JoditEditorWrapper height={520} value={watch('description') || ''} onChange={(v) => setValue('description', v)} />
                  )}
                  {contentTab === 'article' && (
                    <JoditEditorWrapper height={520} value={watch('article') || ''} onChange={(v) => setValue('article', v)} />
                  )}
                </div>
              )}

              {mainTab === 'pricing' && (
                <div className="space-y-4">
                  <LabelForm title={'Bảng giá'} />
                  <JoditEditorWrapper height={300} value={watch('pricing') || ''} onChange={(v) => setValue('pricing', v)} />
                </div>
              )}

              {mainTab === 'partner' && (
                <div className="space-y-4">
                  <InputForm {...register('investor')} label="Chủ đầu tư" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('partners')} label="Đối tác" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('province')} label="Tỉnh/Thành phố" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('district')} label="Quận/Huyện" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('ward')} label="Phường/Xã" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('address')} label="Địa chỉ cụ thể" bordered classNameLabel={classNameLabel} />
                </div>
              )}

              {mainTab === 'contact' && (
                <div className="space-y-4">
                  <InputForm {...register('hotline')} label="Hotline" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('email')} label="Email" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('zalo')} label="Zalo" bordered classNameLabel={classNameLabel} />
                  <TextareaForm {...register('message')} placeholder="Link Message" classNameLabel={classNameLabel} />
                </div>
              )}

              {mainTab === 'amenities' && (
                <div className="space-y-4">
                  <TextareaForm {...register('amenities')} placeholder="Tiện ích" classNameLabel={classNameLabel} />
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-2">
            <CancelBtn onClick={onClose} type="button" value="Hủy" />
            <Button
              size="sm"
              type="submit"
              form="real-estate-project-form"
              color="primary"
              className={`min-w-[120px] rounded-lg shadow-lg shadow-primary/30 ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
