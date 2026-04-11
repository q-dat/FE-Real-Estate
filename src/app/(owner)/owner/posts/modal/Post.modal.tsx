'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FiX, FiImage, FiSettings, FiCheck } from 'react-icons/fi';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';
import PostCategoryModal from './PostCategory.modal';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';
import { postService } from '@/services/post/post.service';
import Zoom from '@/lib/Zoom';
import { useEscClose } from '@/hooks/useEscClose';
import { slugify } from '@/lib/slugify';

interface Props {
  open: boolean;
  editingItem: IPost | null;
  categories: IPostCategory[];
  onCategoriesChange: (categories: IPostCategory[]) => void;
  onClose: () => void;
  reload: () => Promise<void>;
}

interface PostFormData {
  title: string;
  slug: string;
  catalog: string;
  source?: string;
  published: boolean;
}

export default function PostModal({ open, editingItem, categories, onCategoriesChange, onClose, reload }: Props) {
  const { register, handleSubmit, reset, watch } = useForm<PostFormData>();
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const watchTitle = watch('title');
  const watchPublished = watch('published');

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingItem) {
      reset({
        title: '',
        slug: '',
        catalog: '',
        source: '',
        published: false,
      });
      setContent('');
      setImageFile(null);
      setPreviewImage(null);
      return;
    }

    reset({
      title: editingItem.title,
      slug: editingItem.slug ?? '',
      catalog: editingItem.catalog?._id ?? '',
      source: editingItem.source,
      published: editingItem.published,
    });

    setContent(editingItem.content);
    setPreviewImage(editingItem.image || null);
    setImageFile(null);
  }, [editingItem, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('catalog', data.catalog);
      formData.append('source', data.source || '');
      formData.append('published', String(data.published));
      formData.append('content', content);
      if (imageFile) formData.append('image', imageFile);

      if (editingItem?._id) {
        await postService.update(editingItem._id, formData);
      } else {
        await postService.create(formData);
      }

      await reload();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Luxury UI Classes
  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block';
  const inputClass =
    'w-full bg-neutral-50/50 border border-neutral-200/60 focus:border-neutral-900 focus:bg-white outline-none rounded-sm px-3.5 py-2.5 text-[13px] font-medium text-neutral-900 transition-all placeholder:text-neutral-300';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="post-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key="post-modal"
              className="flex h-[90vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm bg-[#FCFCFC] shadow-2xl ring-1 ring-white/20"
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            >
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/60 bg-white px-6 py-4">
                <div>
                  <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                    {editingItem ? 'Edit Article' : 'New Article'}
                  </span>
                  <h1 className="text-xl font-light tracking-tight text-neutral-900">{editingItem ? 'Biên tập bài viết' : 'Khởi tạo bài viết'}</h1>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-transparent bg-neutral-50 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* BODY */}
              <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden xl:flex-row">
                {/* Cột trái (Sidebar Meta) */}
                <div className="flex w-full shrink-0 flex-col gap-6 overflow-y-auto border-r border-neutral-200/60 bg-white/50 p-6 xl:w-[380px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar]:w-1.5">
                  {/* Category */}
                  <div>
                    <label className={labelClass}>
                      Danh mục phân loại <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        {...register('catalog', { required: true })}
                        className={`${inputClass} flex-1 cursor-pointer appearance-none font-semibold text-neutral-800`}
                      >
                        <option value="">-- CHỌN DANH MỤC --</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setOpenCategoryModal(true)}
                        className="flex items-center justify-center rounded-sm border border-neutral-200/60 bg-neutral-50 px-3 text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-white"
                        title="Quản lý danh mục"
                      >
                        <FiSettings size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <label className={labelClass}>
                      Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('title', { required: true })}
                      rows={3}
                      className={`${inputClass} mb-2 resize-none text-[14px] font-semibold leading-snug`}
                      placeholder="Nhập tiêu đề thu hút người đọc..."
                    />

                    <div className="rounded-sm border border-neutral-200/60 bg-neutral-50 p-2.5">
                      <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Permalink (Slug)</span>
                      <p className="break-all font-mono text-[11px] leading-relaxed text-neutral-600">
                        /{slugify(watchTitle || '') || 'slug-tu-dong-tao-khi-nhap-tieu-de'}
                      </p>
                    </div>
                  </div>

                  {/* Publish Status */}
                  <div className="flex items-center justify-between rounded-sm border border-neutral-200/60 bg-white p-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-widest text-neutral-800">Trạng thái xuất bản</span>
                      <span className="mt-0.5 block text-[10px] text-neutral-500">
                        {watchPublished ? 'Hiển thị công khai với độc giả' : 'Lưu ở chế độ bản nháp'}
                      </span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" {...register('published')} className="peer sr-only" />
                      <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>

                  {/* Source */}
                  <div>
                    <label className={labelClass}>Nguồn bài viết (Tùy chọn)</label>
                    <input type="text" {...register('source')} className={inputClass} placeholder="VD: Báo Thanh Niên, VNExpress..." />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={labelClass}>Ảnh đại diện (Thumbnail)</label>
                    <div className="group relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="flex items-center gap-3 rounded-sm border border-dashed border-neutral-300 bg-neutral-50 p-4 transition-colors group-hover:border-neutral-500 group-hover:bg-neutral-100">
                        <FiImage size={24} className="text-neutral-400" />
                        <div>
                          <p className="text-[12px] font-semibold text-neutral-700">Tải ảnh lên từ máy tính</p>
                          <p className="text-[10px] text-neutral-500">JPG, PNG hoặc WebP</p>
                        </div>
                      </div>
                    </div>

                    {previewImage && (
                      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-sm border border-neutral-200/60 bg-neutral-100 shadow-sm">
                        <Zoom>
                          <Image src={previewImage} alt="preview" fill unoptimized className="object-cover" />
                        </Zoom>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột phải (Content Editor) */}
                <div className="flex flex-1 flex-col overflow-y-auto bg-[#FCFCFC] p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar]:w-1.5">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Nội dung bài viết</label>
                  <div className="flex-1 overflow-hidden rounded-sm border border-neutral-200/60 bg-white shadow-sm">
                    {/* Giả sử JoditEditorWrapper tự set chiều cao theo container, nếu không bạn cần truyền height */}
                    <JoditEditorWrapper height={700} value={content} onChange={setContent} />
                  </div>
                </div>
              </form>

              {/* FOOTER */}
              <div className="flex shrink-0 items-center justify-between border-t border-neutral-200/60 bg-white px-6 py-4">
                <div className="hidden flex-col gap-0.5 sm:flex">
                  {editingItem && (
                    <>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                        Created: {new Date(editingItem.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                        Updated: {new Date(editingItem.updatedAt).toLocaleString('vi-VN')}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 flex-1 items-center justify-center rounded-sm border border-neutral-200 bg-transparent px-6 text-[11px] font-bold uppercase tracking-widest text-neutral-600 transition-all hover:bg-neutral-100 sm:flex-none"
                  >
                    Hủy thao tác
                  </button>
                  <button
                    type="submit"
                    form="post-form"
                    disabled={isLoading}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-neutral-900 px-8 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-primary hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    {isLoading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                    ) : (
                      <FiCheck size={14} />
                    )}
                    {editingItem ? 'Lưu thay đổi' : 'Tạo bài viết'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-MODAL CATEGORY */}
      {openCategoryModal && (
        <PostCategoryModal
          open={openCategoryModal}
          categories={categories}
          onClose={() => setOpenCategoryModal(false)}
          onChange={onCategoriesChange}
        />
      )}
    </>
  );
}
