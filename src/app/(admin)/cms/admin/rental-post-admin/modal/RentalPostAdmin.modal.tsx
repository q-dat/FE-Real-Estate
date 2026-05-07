'use client';

import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  District,
  IRentalAuthor,
  IRentalPostAdmin,
  Province,
  Ward,
} from '@/types/rentalAdmin/rentalAdmin.types';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';

interface Props {
  open: boolean;
  onClose: () => void;
  editingPost: IRentalPostAdmin | null;
  categories: { _id: string; name: string }[];
  reload: () => Promise<void>;
  authorId: IRentalAuthor;
}

interface RentalPostFormData
  extends Omit<
    IRentalPostAdmin,
    'author' | 'category' | 'images' | 'adminImages' | 'postedAt' | 'expiredAt'
  > {
  author: string;
  category: string;
  postedAt: string;
  expiredAt: string;
}

type SectionTone = 'blue' | 'red' | 'amber' | 'purple' | 'rose' | 'slate';

const EXCLUDED_FIELDS = new Set(['images', 'adminImages']);

const getSectionToneClass = (tone: SectionTone): string => {
  const tones: Record<SectionTone, string> = {
    blue: 'border-blue-200 bg-blue-50/70 text-blue-800 before:bg-blue-500',
    red: 'border-red-200 bg-red-50/70 text-red-800 before:bg-red-500',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-800 before:bg-amber-500',
    purple: 'border-purple-200 bg-purple-50/70 text-purple-800 before:bg-purple-500',
    rose: 'border-rose-200 bg-rose-50/70 text-rose-800 before:bg-rose-500',
    slate: 'border-slate-200 bg-slate-50/80 text-slate-800 before:bg-slate-500',
  };

  return tones[tone];
};

export default function RentalPostAdminModal({
  open,
  onClose,
  editingPost,
  categories,
  reload,
  authorId,
}: Props) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<RentalPostFormData>();

  const [images, setImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [adminImages, setAdminImages] = useState<FileList | null>(null);
  const [adminPreviewUrls, setAdminPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

  const [priceMultiplier, setPriceMultiplier] = useState<number>(1_000);

  const watchPrice = watch('price');
  const watchArea = watch('area');

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingPost) {
      setValue('author', authorId._id, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [authorId._id, editingPost, setValue]);

  useEffect(() => {
    const priceNum = Number(watchPrice);
    const areaNum = Number(watchArea);

    if (!priceNum || !areaNum || priceNum <= 0 || areaNum <= 0) {
      setValue('pricePerM2', 0, { shouldValidate: true });
      return;
    }

    const perM2 = (priceNum * priceMultiplier) / areaNum;

    if (!Number.isNaN(perM2) && Number.isFinite(perM2)) {
      setValue('pricePerM2', Math.round(perM2), { shouldValidate: true });
    }
  }, [watchPrice, watchArea, priceMultiplier, setValue]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;

    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(console.error);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;

    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards || []))
      .catch(console.error);
  }, [selectedDistrict]);

  useEffect(() => {
    if (!editingPost) {
      reset({
        author: authorId._id,
        postType: 'highlight',
        status: 'active',
      } as RentalPostFormData);

      setPreviewUrls([]);
      setAdminPreviewUrls([]);
      setImages(null);
      setAdminImages(null);
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      return;
    }

    reset({
      ...editingPost,
      author: typeof editingPost.author === 'object' ? editingPost.author._id : editingPost.author,
      category:
        typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
      postedAt: editingPost.postedAt
        ? new Date(editingPost.postedAt).toISOString().split('T')[0]
        : '',
      expiredAt: editingPost.expiredAt
        ? new Date(editingPost.expiredAt).toISOString().split('T')[0]
        : '',
    });

    setPreviewUrls(editingPost.images || []);
    setAdminPreviewUrls(editingPost.adminImages || []);
  }, [authorId._id, editingPost, reset]);

  useEffect(() => {
    if (!editingPost || provinces.length === 0) return;

    const province = provinces.find((p) => p.name === editingPost.province);
    if (province) setSelectedProvince(String(province.code));
  }, [editingPost, provinces]);

  useEffect(() => {
    if (!editingPost || districts.length === 0) return;

    const district = districts.find((d) => d.name === editingPost.district);
    if (district) setSelectedDistrict(String(district.code));
  }, [editingPost, districts]);

  useEffect(() => {
    if (!editingPost || wards.length === 0) return;

    const ward = wards.find((w) => w.name === editingPost.ward);
    if (ward) setSelectedWard(String(ward.code));
  }, [editingPost, wards]);

  const removeImage = (url: string) => {
    setPreviewUrls((prev) => prev.filter((item) => item !== url));
  };

  const removeAdminImage = (url: string) => {
    setAdminPreviewUrls((prev) => prev.filter((item) => item !== url));
  };

  const handleFormSubmit: SubmitHandler<RentalPostFormData> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (EXCLUDED_FIELDS.has(key)) return;
        if (typeof value === 'object') {
          throw new Error(`INVALID_FORM_FIELD: ${key} must be primitive`);
        }

        formData.append(key, String(value));
      });

      if (editingPost) {
        if (previewUrls.length > 0) {
          formData.append('oldImages', JSON.stringify(previewUrls));
        }

        if (adminPreviewUrls.length > 0) {
          formData.append('oldAdminImages', JSON.stringify(adminPreviewUrls));
        }
      }

      if (images instanceof FileList) {
        Array.from(images).forEach((file) => formData.append('images', file));
      }

      if (adminImages instanceof FileList) {
        Array.from(adminImages).forEach((file) => formData.append('adminImages', file));
      }

      if (editingPost?._id) {
        await rentalPostAdminService.update(editingPost._id, formData);
      } else {
        await rentalPostAdminService.create(formData);
      }

      await reload();
      onClose();
    } catch (err) {
      console.error('Lỗi gửi form:', err);
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    'mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500';

  const inputClass =
    'w-full rounded-md border border-neutral-200 bg-white px-2 py-2 text-[13px] font-semibold text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400';

  const fileInputClass =
    'file-input file-input-bordered file-input-sm w-full rounded-md border-neutral-200 bg-white text-[13px] focus:outline-none';

  const sectionTitleClass =
    'mb-2 flex items-center justify-between border-b border-current/10 pb-2 text-xs font-black uppercase tracking-[0.16em]';

  const renderSectionClass = (tone: SectionTone) => {
    return `relative overflow-hidden rounded-lg border p-2 shadow-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${getSectionToneClass(tone)}`;
  };

  const PreviewImageGrid = ({
    urls,
    onRemove,
    isZoom,
  }: {
    urls: string[];
    onRemove: (url: string) => void;
    isZoom?: boolean;
  }) => {
    if (urls.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
          >
            {isZoom ? (
              <Zoom>
                <Image src={url} alt={`preview-${index}`} fill className="object-cover" unoptimized />
              </Zoom>
            ) : (
              <Image src={url} alt={`preview-${index}`} fill className="object-cover" unoptimized />
            )}

            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-red-600 text-white opacity-0 transition group-hover:opacity-100"
            >
              <MdClose size={12} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key="modal"
            onClick={(event) => event.stopPropagation()}
            className="relative flex h-[90dvh] w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-2xl"
            initial={{ scale: 0.98, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="z-10 flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-2 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-black tracking-tight text-neutral-950">
                    {editingPost ? 'Cập nhật bài đăng' : 'Tạo mới bài đăng'}
                  </h3>

                  {editingPost?.code && (
                    <span className="rounded-md border border-primary/10 bg-primary/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                      {editingPost.code}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs font-medium text-neutral-500">
                  Nhập liệu theo từng nhóm để dễ kiểm tra và quản lý.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:bg-neutral-100"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-neutral-100 p-2 [scrollbar-width:thin]">
              <form
                id="rental-post-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="flex flex-col gap-2"
              >
                <section className={renderSectionClass('blue')}>
                  <h4 className={sectionTitleClass}>
                    <span>Nhận diện & tiêu đề</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Thông tin hiển thị chính
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-4">
                    <div className="xl:col-span-3">
                      <label className={labelClass}>
                        Tiêu đề bài đăng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('title', { required: true })}
                        placeholder="Nhập tiêu đề..."
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Trạng thái</label>
                      <select className={inputClass} {...register('status')}>
                        <option value="active">Hiển thị</option>
                        <option value="hidden">Đã ẩn</option>
                      </select>
                    </div>

                    <div className="xl:col-span-4">
                      <label className={labelClass}>Ảnh hiển thị</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(event) => setImages(event.target.files)}
                        className={fileInputClass}
                      />
                      <PreviewImageGrid urls={previewUrls} onRemove={removeImage} isZoom />
                    </div>
                  </div>
                </section>

                <section className={renderSectionClass('red')}>
                  <h4 className={sectionTitleClass}>
                    <span>Giá & diện tích</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Dữ liệu định giá
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-6">
                    <div className="xl:col-span-2">
                      <label className={labelClass}>
                        Mức giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        className={inputClass}
                        {...register('price', { required: true, valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Đơn vị <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('priceUnit', { required: true })}
                        placeholder="Tỷ, Triệu..."
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>Giá / m² tự động</label>
                      <div className="flex">
                        <input
                          type="number"
                          className={`${inputClass} rounded-r-none border-r-0 font-black text-emerald-700`}
                          {...register('pricePerM2', { valueAsNumber: true })}
                          readOnly
                          placeholder="0"
                        />

                        <select
                          className={`${inputClass} w-[110px] rounded-l-none bg-primary/5 text-primary`}
                          value={priceMultiplier}
                          onChange={(event) => setPriceMultiplier(Number(event.target.value))}
                        >
                          <option value={1}>Nghìn</option>
                          <option value={1_000}>Triệu</option>
                          <option value={1_000_000}>Tỷ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Diện tích <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('area', { required: true })}
                        placeholder="m²"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Ngang</label>
                      <input
                        type="number"
                        step="any"
                        className={inputClass}
                        {...register('frontageWidth', { valueAsNumber: true })}
                        placeholder="m"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Dài</label>
                      <input
                        type="number"
                        step="any"
                        className={inputClass}
                        {...register('lotDepth', { valueAsNumber: true })}
                        placeholder="m"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Mặt hậu</label>
                      <input
                        type="number"
                        step="any"
                        className={inputClass}
                        {...register('backSize', { valueAsNumber: true })}
                        placeholder="m"
                      />
                    </div>
                  </div>
                </section>

                <section className={renderSectionClass('slate')}>
                  <h4 className={sectionTitleClass}>
                    <span>Danh mục & nội dung</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Phân loại và mô tả
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
                    <div>
                      <label className={labelClass}>
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`${inputClass} font-black text-primary`}
                        {...register('category', { required: true })}
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Loại tin</label>
                      <select
                        className={inputClass}
                        {...register('postType', { required: true })}
                        defaultValue="highlight"
                      >
                        <option value="highlight">Nổi bật</option>
                        <option value="vip1">VIP 1</option>
                        <option value="vip2">VIP 2</option>
                        <option value="vip3">VIP 3</option>
                        <option value="basic">Cơ bản</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Loại hình BĐS</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('propertyType')}
                        placeholder="Nhà phố, căn hộ..."
                      />
                    </div>

                    <div className="xl:col-span-3">
                      <label className={labelClass}>
                        Mô tả chi tiết <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        {...register('description', { required: true })}
                        rows={8}
                        placeholder="Nhập mô tả bài đăng..."
                      />
                    </div>
                  </div>
                </section>

                <section className={renderSectionClass('amber')}>
                  <h4 className={sectionTitleClass}>
                    <span>Thông số kỹ thuật</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Công năng và pháp lý
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-7">
                    <div>
                      <label className={labelClass}>Số tầng</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('floorNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Phòng ngủ</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('bedroomNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>WC</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('toiletNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Vị trí</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('locationType')}
                        placeholder="Mặt tiền, hẻm..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Hướng</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('direction')}
                        placeholder="Hướng nhà"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Pháp lý</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('legalStatus')}
                        placeholder="Sổ hồng..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Nội thất</label>
                      <select
                        className={inputClass}
                        {...register('furnitureStatus')}
                        defaultValue="default"
                      >
                        <option value="default">Chọn nội thất</option>
                        <option value="Đầy đủ nội thất">Đầy đủ nội thất</option>
                        <option value="Chưa có nội thất">Chưa có nội thất</option>
                        <option value="Nhà cũ cần cải tạo">Nhà cũ cần cải tạo</option>
                        <option value="Đất trống/ Nhà nát">Đất trống/ Nhà nát</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className={renderSectionClass('purple')}>
                  <h4 className={sectionTitleClass}>
                    <span>Địa chỉ tài sản</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Khu vực và vị trí
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-4">
                    <div>
                      <label className={labelClass}>Tỉnh / Thành</label>
                      <select
                        className={inputClass}
                        value={selectedProvince}
                        onChange={(event) => {
                          const code = event.target.value;
                          const province = provinces.find((item) => item.code === +code);

                          setSelectedProvince(code);
                          setSelectedDistrict('');
                          setSelectedWard('');
                          setDistricts([]);
                          setWards([]);

                          setValue('province', province ? province.name : '', {
                            shouldValidate: true,
                          });
                          setValue('district', '', { shouldValidate: true });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn tỉnh / thành</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Quận / Huyện</label>
                      <select
                        className={inputClass}
                        value={selectedDistrict}
                        disabled={!districts.length}
                        onChange={(event) => {
                          const code = event.target.value;
                          const district = districts.find((item) => item.code === +code);

                          setSelectedDistrict(code);
                          setSelectedWard('');
                          setWards([]);

                          setValue('district', district ? district.name : '', {
                            shouldValidate: true,
                          });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn quận / huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Phường / Xã</label>
                      <select
                        className={inputClass}
                        value={selectedWard}
                        disabled={!wards.length}
                        onChange={(event) => {
                          const code = event.target.value;
                          const ward = wards.find((item) => item.code === +code);

                          setSelectedWard(code);
                          setValue('ward', ward ? ward.name : '', {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <option value="">Chọn phường / xã</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('address', { required: true })}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                  </div>
                </section>

                <section className={renderSectionClass('rose')}>
                  <h4 className={sectionTitleClass}>
                    <span>Media & ghi chú nội bộ</span>
                    <span className="text-[10px] font-bold normal-case tracking-normal opacity-70">
                      Video, tiện ích, ngày đăng
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-4">
                    <div className="xl:col-span-4">
                      <label className={labelClass}>Ảnh nội bộ</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(event) => setAdminImages(event.target.files)}
                        className={fileInputClass}
                      />
                      <PreviewImageGrid urls={adminPreviewUrls} onRemove={removeAdminImage} />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>Link Youtube</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('youtubeLink')}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>Tiêu đề Video</label>
                      <input
                        type="text"
                        className={inputClass}
                        {...register('videoTitle')}
                        placeholder="Tiêu đề..."
                      />
                    </div>

                    <div className="xl:col-span-4">
                      <label className={labelClass}>Mô tả Video</label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        {...register('videoDescription')}
                        rows={6}
                        placeholder="Mô tả video..."
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>Tiện ích</label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        {...register('amenities')}
                        rows={6}
                        placeholder="Nhập tiện ích..."
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={`${labelClass} text-amber-700`}>
                        Ghi chú Admin
                      </label>
                      <textarea
                        className={`${inputClass} resize-none border-amber-200 bg-amber-50 text-amber-900 focus:border-amber-400 focus:ring-amber-100`}
                        {...register('adminNote')}
                        rows={6}
                        placeholder="Ghi chú hoa hồng, thông tin chủ nhà..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Ngày đăng</label>
                      <input type="date" className={inputClass} {...register('postedAt')} />
                    </div>

                    <div>
                      <label className={labelClass}>Ngày hết hạn</label>
                      <input type="date" className={inputClass} {...register('expiredAt')} />
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <div className="z-10 flex shrink-0 items-center justify-end gap-2 border-t border-neutral-200 bg-white px-2 py-2">
              <CancelBtn
                onClick={onClose}
                type="button"
                value="Hủy"
                className="min-w-[96px] rounded-md font-bold"
              />

              <Button
                color="success"
                size="sm"
                type="submit"
                form="rental-post-form"
                disabled={loading}
                className="min-w-[130px] rounded-md font-bold tracking-wide text-white shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>{editingPost ? 'Cập nhật' : 'Tạo mới BĐS'}</>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}