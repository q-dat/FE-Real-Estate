'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';
import PostCategoryModal from './PostCategory.modal';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';
import { postService } from '@/services/post/post.service';
import { slugify } from '@/lib/slugify';
import Zoom from '@/lib/Zoom';
import { useEscClose } from '@/hooks/useEscClose';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import SubmitBtn from '@/components/userPage/ui/btn/SubmitBtn';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { Button, Select } from 'react-daisyui';

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

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="post-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key="post-modal"
              className="flex h-full max-h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-primary-lighter shadow-xl xl:max-h-[80vh]"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              {/* Header */}
              <div className="p-2">
                <h1 className="text-lg font-semibold">{editingItem ? 'Cập nhật bài viết' : 'Tạo bài viết'}</h1>
                <h2 className="mt-1 text-xs text-gray-500">Nhập thông tin cơ bản và nội dung bài viết</h2>
              </div>

              {/* Body */}
              <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 overflow-auto p-2 xl:flex-row">
                {/* Sidebar */}
                <div className="shrink-0 space-y-5 rounded-md bg-white p-1 xl:w-1/3 xl:overflow-y-auto xl:scrollbar-hide">
                  <div className="w-full">
                    <LabelForm title="Danh mục" />
                    <div className="flex gap-2">
                      <Select {...register('catalog')} className="flex-1 rounded-md border focus:outline-none" required>
                        <option value="">Chọn danh mục</option>
                        {categories.map((c) => (
                          <option className="font-bold" key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        type="button"
                        size="md"
                        className="rounded-md border bg-green-500 px-3 text-sm uppercase text-white hover:bg-green-700"
                        onClick={() => setOpenCategoryModal(true)}
                      >
                        Quản lý
                      </Button>
                    </div>
                  </div>
                  <div className="my-1 break-all text-xs leading-relaxed">
                    <span className="pr-1 font-bold text-black">Slug:</span>
                    <span className="rounded-md bg-primary p-1 font-light text-white">
                      {slugify(watch('title') || '') || 'Slug tự động tạo khi bạn đặt tiêu đề'}
                    </span>
                  </div>
                  <div>
                    <TextareaForm {...register('title')} required placeholder="Tiêu đề" />
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" {...register('published')} />
                      Xuất bản
                    </label>
                  </div>

                  <TextareaForm {...register('source')} placeholder="Nguồn bài viết" />

                  <div>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} />
                    {previewImage && (
                      <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border">
                        <Zoom>
                          <Image src={previewImage} alt="preview" fill unoptimized className="object-cover" />
                        </Zoom>
                      </div>
                    )}
                  </div>
                </div>
                {/* Content */}
                <div className="w-full">
                  <LabelForm className="rounded-t-md border border-primary-lighter bg-white uppercase" title="Nội dung bài viết" />
                  <JoditEditorWrapper height={500} value={content} onChange={setContent} />
                </div>
              </form>

              {/* Footer */}
              <div className="flex flex-row items-center justify-between border-t p-2">
                {editingItem && (
                  <div className="text-xs font-medium text-black">
                    <div>Ngày tạo: {new Date(editingItem.createdAt).toLocaleString()}</div>
                    <div>Cập nhật: {new Date(editingItem.updatedAt).toLocaleString()}</div>
                  </div>
                )}
                <div className="space-x-2">
                  <CancelBtn value="Hủy/Esc" onClick={onClose} />
                  <SubmitBtn type="submit" form="post-form" value={editingItem ? 'Lưu' : 'Tạo mới'} loading={isLoading} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
