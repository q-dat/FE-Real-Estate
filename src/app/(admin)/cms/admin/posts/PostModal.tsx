'use client';

import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';

import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';

import { IPost } from '@/types/type/post/post';
import { IPostCategory } from '@/types/type/post/post-category';
import { postCategoryService } from '@/services/postCategoryService';
import { postService } from '@/services/postService';

interface Props {
  open: boolean;
  editingItem: IPost | null;
  onClose: () => void;
  reload: () => Promise<void>;
  categories: IPostCategory[];
}

interface PostFormData {
  title: string;
  catalog: string;
}

export default function PostModal({ open, editingItem, onClose, reload, categories }: Props) {
  const { register, handleSubmit, reset } = useForm<PostFormData>();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!editingItem) {
      reset({});
      setContent('');
      return;
    }

    reset({
      title: editingItem.title,
      catalog: editingItem.catalog._id,
    });
    setContent(editingItem.content);
  }, [editingItem, reset]);

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('catalog', data.catalog);
      formData.append('content', content);

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

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="w-full max-w-4xl rounded-md bg-white shadow-xl" initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="border-b p-4 font-semibold">{editingItem ? 'Cập nhật bài viết' : 'Tạo bài viết'}</div>

            <div className="space-y-4 p-4">
              <input {...register('title')} placeholder="Tiêu đề" className="w-full rounded border p-2" required />

              <select {...register('catalog')} className="w-full rounded border p-2" required>
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <JoditEditorWrapper height={400} value={content} onChange={setContent} />
            </div>

            <div className="flex justify-end gap-2 border-t p-3">
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
    </AnimatePresence>
  );
}
