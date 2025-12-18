'use client';

import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPen } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

import InputForm from '@/components/userPage/ui/form/InputForm';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';

import { IRealEstateProject } from '@/types/type/realEstateProject/realEstateProject';
import { realEstateProjectService } from '@/services/realEstateProjectService';
import JoditEditorWrapper from '@/components/adminPage/JoditEditorWrapper';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';

interface Props {
  open: boolean;
  editingItem: IRealEstateProject | null;
  onClose: () => void;
  reload: () => Promise<void>;
}

type MainTab = 'general' | 'content' | 'pricing' | 'partner' | 'contact';

type ContentTab = 'introduction' | 'description' | 'article';

export default function RealEstateProjectModal({ open, editingItem, onClose, reload }: Props) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<IRealEstateProject>();

  const [mainTab, setMainTab] = useState<MainTab>('general');
  const [contentTab, setContentTab] = useState<ContentTab>('introduction');

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingItem) {
      reset({});
      setMainTab('general');
      setContentTab('introduction');
      return;
    }

    reset(editingItem);
    setMainTab('general');
    setContentTab('introduction');
  }, [editingItem, reset]);

  const onSubmit: SubmitHandler<IRealEstateProject> = async (data) => {
    if (editingItem?._id) {
      await realEstateProjectService.update(editingItem._id, data);
    } else {
      await realEstateProjectService.create(data);
    }
    await reload();
    onClose();
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
            <div className="tabs tabs-bordered">
              {[
                ['general', 'Thông tin'],
                ['content', 'Nội dung'],
                ['pricing', 'Bảng giá & Tiện ích'],
                ['partner', 'Đối tác'],
                ['contact', 'Liên hệ'],
              ].map(([key, label]) => (
                <button key={key} className={`tab ${mainTab === key ? 'tab-active' : ''}`} onClick={() => setMainTab(key as MainTab)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="real-estate-project-form" onSubmit={handleSubmit(onSubmit)}>
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
                  <JoditEditorWrapper height={300} value={watch('pricing') || ''} onChange={(v) => setValue('pricing', v)} />
                  <TextareaForm {...register('amenities')} placeholder="Tiện ích" classNameLabel={classNameLabel} />
                </div>
              )}

              {mainTab === 'partner' && (
                <div className="space-y-4">
                  <InputForm {...register('investor')} label="Chủ đầu tư" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('partners')} label="Đối tác" bordered classNameLabel={classNameLabel} />
                  <InputForm {...register('location')} label="Vị trí" bordered classNameLabel={classNameLabel} />
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
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-2">
            <CancelBtn onClick={onClose} type="button" value="Hủy" />
            <Button size='sm' type="submit" form="real-estate-project-form" color="primary">
              {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
