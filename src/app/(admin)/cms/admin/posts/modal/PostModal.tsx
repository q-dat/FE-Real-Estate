'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';

import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';

import { IPost } from '@/types/type/post/post';
import { IPostCategory } from '@/types/type/post/post-category';
import { postService } from '@/services/postService';
import PostCategoryModal from './PostCategoryModal';
import { slugify } from '@/lib/slugify';

interface Props {
  open: boolean;
  editingItem: IPost | null;
  categories: IPostCategory[];
  onClose: () => void;
  reload: () => Promise<void>;
}

interface PostFormData {
  title: string;
  slug: string;
  catalog: string;
  published: boolean;
}

export default function PostModal({ open, editingItem, categories, onClose, reload }: Props) {
  const { register, handleSubmit, reset, watch } = useForm<PostFormData>();
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [localCategories, setLocalCategories] = useState<IPostCategory[]>(categories);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

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

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('slug', data.slug.trim());
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
        <motion.div className="w-full max-w-5xl rounded-lg bg-white shadow-xl" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="border-b px-5 py-4 text-lg font-semibold">{editingItem ? 'Cập nhật bài viết' : 'Tạo bài viết'}</div>

            {/* Body */}
            <div className="grid grid-cols-1 gap-4 px-5 py-4 xl:grid-cols-2">
              {/* Title */}
              <div className="xl:col-span-2">
                <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
                <input {...register('title')} className="w-full rounded-md border px-3 py-2" required />
              </div>

              {/* Slug */}
              <p className="text-xs text-gray-400">Slug tự động: {slugify(watch('title') || '')}</p>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium">Danh mục</label>

                <div className="flex gap-2">
                  <select {...register('catalog')} className="flex-1 rounded-md border px-3 py-2" required>
                    <option value="">Chọn danh mục</option>
                    {localCategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <Button type="button" className="whitespace-nowrap" onClick={() => setOpenCategoryModal(true)}>
                    Quản lý
                  </Button>
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('published')} />
                <span className="text-sm">Xuất bản</span>
              </div>

              {/* Image */}
              <div>
                <label className="mb-1 block text-sm font-medium">Ảnh đại diện</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Meta  */}
              {editingItem && (
                <div className="text-xs text-gray-400 xl:col-span-2">
                  Tạo lúc: {new Date(editingItem.createdAt).toLocaleString()} · Cập nhật: {new Date(editingItem.updatedAt).toLocaleString()}
                </div>
              )}

              {/* Content */}
              <div className="xl:col-span-2">
                <label className="mb-1 block text-sm font-medium">Nội dung</label>
                <JoditEditorWrapper height={420} value={content} onChange={setContent} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-5 py-3">
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

      <PostCategoryModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        onUpdated={(cats) => {
          setLocalCategories(cats);

          // nếu đang chưa chọn catalog thì auto select category mới nhất
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
