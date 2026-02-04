'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';
import { postService } from '@/services/post/post.service';
import PostCategoryModal from './PostCategory.modal';
import { slugify } from '@/lib/slugify';
import Zoom from '@/lib/Zoom';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { useEscClose } from '@/hooks/useEscClose';

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
  published: boolean;
}

export default function PostModal({ open, editingItem, categories, onCategoriesChange, onClose, reload }: Props) {
  const { register, handleSubmit, reset, watch } = useForm<PostFormData>();
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingItem) {
      // reset form
      reset({
        title: '',
        slug: '',
        catalog: '',
        published: false,
      });

      // reset content
      setContent('');

      // reset image
      setImageFile(null);
      setPreviewImage(null);

      return;
    }

    // set form values
    reset({
      title: editingItem.title,
      slug: editingItem.slug ?? '',
      catalog: editingItem.catalog?._id ?? '',
      published: editingItem.published,
    });

    // set content
    setContent(editingItem.content);

    // set image preview (chỉ preview, không set file)
    setPreviewImage(editingItem.image || null);
    setImageFile(null);
  }, [editingItem, reset]);

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('catalog', data.catalog);
      formData.append('published', String(data.published));
      formData.append('content', content);

      if (imageFile) {
        formData.append('image', imageFile);
      }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          exit={{ y: 40 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4 text-lg font-semibold">{editingItem ? 'Cập nhật bài viết' : 'Tạo bài viết'}</div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left */}
                <div className="space-y-4 xl:col-span-1">
                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
                    <input {...register('title')} className="w-full rounded-md border px-3 py-2" required />
                    <p className="mt-1 text-xs text-gray-400">Slug: {slugify(watch('title') || '')}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Danh mục</label>
                    <div className="flex gap-2">
                      <select {...register('catalog')} className="flex-1 rounded-md border px-3 py-2" required>
                        <option value="">Chọn danh mục</option>
                        {categories
                          .filter((c) => c._id)
                          .map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                      </select>

                      <Button type="button" size="sm" onClick={() => setOpenCategoryModal(true)}>
                        Quản lý
                      </Button>
                    </div>
                  </div>

                  {/* Published */}
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register('published')} />
                    Xuất bản
                  </label>

                  {/* Image */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Ảnh đại diện</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />

                    {previewImage && (
                      <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border">
                        <Zoom>
                          <Image src={previewImage} alt="preview" fill unoptimized className="object-cover" />
                        </Zoom>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  {editingItem && (
                    <div className="text-xs text-gray-400">
                      <div>Tạo: {new Date(editingItem.createdAt).toLocaleString()}</div>
                      <div>Cập nhật: {new Date(editingItem.updatedAt).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className="xl:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Nội dung</label>
                  <JoditEditorWrapper height={420} value={content} onChange={setContent} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <Button type="button" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" color="primary" loading={isLoading}>
                {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Category modal */}
      <PostCategoryModal
        open={openCategoryModal}
        categories={categories}
        onClose={() => setOpenCategoryModal(false)}
        onChange={(cats) => {
          onCategoriesChange(cats);

          if (!editingItem && cats.length > 0) {
            const latest = cats[cats.length - 1];
            reset((prev) => ({
              ...prev,
              catalog: latest._id,
            }));
          }
        }}
      />
    </AnimatePresence>
  );
}
