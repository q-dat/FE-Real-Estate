'use client';
import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { District, IRentalAuthor, IRentalPostAdmin, Province, Ward } from '@/types/rentalAdmin/rentalAdmin.types';
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

interface RentalPostFormData extends Omit<IRentalPostAdmin, 'author' | 'category' | 'images' | 'adminImages' | 'postedAt' | 'expiredAt'> {
  author: string;
  category: string;
  postedAt: string;
  expiredAt: string;
}

const EXCLUDED_FIELDS = new Set(['images', 'adminImages']);

export default function RentalPostAdminModal({ open, onClose, editingPost, categories, reload, authorId }: Props) {
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
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1_000); // Mặc định Triệu (1_000)

  const watchPrice = watch('price');
  const watchArea = watch('area');

  useEffect(() => {
    if (!editingPost) {
      setValue('author', authorId._id, { shouldDirty: false, shouldValidate: true });
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
    if (!isNaN(perM2) && isFinite(perM2)) {
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

  useEscClose(open, onClose);

  useEffect(() => {
    if (!editingPost) return;
    reset({
      ...editingPost,
      author: typeof editingPost.author === 'object' ? editingPost.author._id : editingPost.author,
      category: typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
      postedAt: editingPost.postedAt ? new Date(editingPost.postedAt).toISOString().split('T')[0] : '',
      expiredAt: editingPost.expiredAt ? new Date(editingPost.expiredAt).toISOString().split('T')[0] : '',
    });
    setPreviewUrls(editingPost.images || []);
    setAdminPreviewUrls(editingPost.adminImages || []);
  }, [editingPost, reset]);

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

  const removeImage = (url: string) => setPreviewUrls((prev) => prev.filter((u) => u !== url));
  const removeAdminImage = (url: string) => setAdminPreviewUrls((prev) => prev.filter((u) => u !== url));

  const handleFormSubmit: SubmitHandler<RentalPostFormData> = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (EXCLUDED_FIELDS.has(key)) return;
        if (typeof value === 'object') throw new Error(`INVALID_FORM_FIELD: ${key} must be primitive`);
        formData.append(key, String(value));
      });

      if (editingPost) {
        previewUrls.forEach((url) => {
          if (editingPost.images?.includes(url)) formData.append('oldImages', JSON.stringify(previewUrls));
        });
        adminPreviewUrls.forEach((url) => {
          if (editingPost.adminImages?.includes(url)) formData.append('oldAdminImages', JSON.stringify(adminPreviewUrls));
        });
      }

      if (images instanceof FileList) {
        Array.from(images).forEach((file) => formData.append('images', file));
      }
      if (adminImages instanceof FileList) {
        Array.from(adminImages).forEach((file) => formData.append('adminImages', file));
      }

      if (editingPost?._id) await rentalPostAdminService.update(editingPost._id, formData);
      else await rentalPostAdminService.create(formData);

      await reload();
      onClose();
    } catch (err) {
      console.error('Lỗi gửi form:', err);
    } finally {
      setLoading(false);
    }
  };

  // Base Classes for Luxury UI
  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-base-content/60 mb-1.5 block';
  const inputClass =
    'w-full bg-white/60 dark:bg-black/10 border border-base-content/10 focus:border-primary focus:bg-base-100 dark:focus:bg-base-100 outline-none hover:border-primary/40 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-base-content transition-all placeholder:text-base-content/30 shadow-sm focus:ring-0';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Cố định chiều cao Modal h-[90vh] để không tràn Viewport */}
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-base-100 shadow-2xl ring-1 ring-white/20"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {/* Header */}
            <div className="z-10 flex flex-shrink-0 items-center justify-between border-b border-base-content/5 bg-base-100/95 px-6 py-5 sm:px-8">
              <div className="flex flex-col">
                <h3 className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">
                  {editingPost ? <span className="text-primary">📝</span> : <span className="text-primary">✨</span>}
                  {editingPost ? 'Cập nhật Bài đăng' : 'Tạo mới Bài đăng'}
                </h3>
                {editingPost?.code && (
                  <span className="mt-1.5 inline-block w-fit rounded-lg bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    Mã tin: {editingPost.code}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm bg-base-200/50 hover:bg-base-300">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto bg-base-200/20 p-4 sm:p-6 lg:p-8 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:w-2">
              <form id="rental-post-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 lg:gap-8">
                {/* 1. Nhận diện & Cơ bản (Blue/Slate) */}
                <div className="relative overflow-hidden rounded-3xl border border-blue-500/10 bg-blue-500/5 p-6 shadow-sm transition-colors hover:border-blue-500/20">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500/30"></div>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-blue-600/80">Nhận diện & Tiêu đề</h4>
                  <div className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="w-full">
                      <label className={labelClass}>
                        Tiêu đề bài đăng <span className="text-error">*</span>
                      </label>
                      <input type="text" className={inputClass} {...register('title', { required: true })} placeholder="Nhập tiêu đề..." autoFocus />
                    </div>
                    {/* Public Images */}
                    <div className="w-full">
                      <label className={labelClass}>Ảnh hiển thị (Public)</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setImages(e.target.files)}
                        className="file-input file-input-bordered file-input-primary file-input-sm w-full bg-white/60 focus:outline-none"
                      />
                      {previewUrls.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {previewUrls.map((url, i) => (
                            <div key={url + i} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                              <Image src={url} alt={`preview-${i}`} fill style={{ objectFit: 'cover' }} unoptimized />
                              <button
                                type="button"
                                onClick={() => removeImage(url)}
                                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                              >
                                <MdClose size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className={labelClass}>
                          Danh mục <span className="text-error">*</span>
                        </label>
                        <select className={`${inputClass} font-bold text-primary`} {...register('category', { required: true })}>
                          <option value="">-- CHỌN DANH MỤC --</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Loại Tin (Gói hiển thị)</label>
                        <select className={inputClass} {...register('postType', { required: true })} defaultValue="highlight">
                          <option value="highlight">Nổi bật (Highlight)</option>
                          <option value="vip1">VIP 1</option>
                          <option value="vip2">VIP 2</option>
                          <option value="vip3">VIP 3</option>
                          <option value="basic">Cơ bản</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Loại hình BĐS</label>
                        <input type="text" className={inputClass} {...register('propertyType')} placeholder="Nhà phố, Căn hộ..." />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Mô tả chi tiết <span className="text-error">*</span>
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        {...register('description', { required: true })}
                        rows={10}
                        placeholder="Viết mô tả thu hút khách hàng..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Giá & Diện tích (Emerald) */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-6 shadow-sm transition-colors hover:border-emerald-500/20">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500/30"></div>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-emerald-600/80">Giá cả & Diện tích</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Mức giá <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          className={`${inputClass}`}
                          {...register('price', { required: true, valueAsNumber: true })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Đơn vị giá <span className="text-error">*</span>
                      </label>
                      <input type="text" className={inputClass} {...register('priceUnit', { required: true })} placeholder="VD: /tháng" />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Diện tích (m²) <span className="text-error">*</span>
                      </label>
                      <input type="text" className={inputClass} {...register('area', { required: true })} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Giá / m² (Tự động)</label>

                      <div className="flex items-center">
                        <input
                          type="number"
                          className={`${inputClass} rounded-r-none border-none bg-transparent font-black text-emerald-600`}
                          {...register('pricePerM2', { valueAsNumber: true })}
                          readOnly
                          placeholder="0"
                        />
                        <select
                          className={`${inputClass} w-1/3 rounded-l-none bg-primary/10 text-primary`}
                          value={priceMultiplier}
                          onChange={(e) => setPriceMultiplier(Number(e.target.value))}
                        >
                          <option value={1}>Nghìn</option>
                          <option value={1_000}>Triệu</option>
                          <option value={1_000_000}>Tỷ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Kỹ thuật & Chi tiết (Amber) */}
                <div className="relative overflow-hidden rounded-3xl border border-amber-500/10 bg-amber-500/5 p-6 shadow-sm transition-colors hover:border-amber-500/20">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500/30"></div>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-amber-600/80">Thông số Kỹ thuật</h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <div>
                      <label className={labelClass}>Số Tầng</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('floorNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="Nhập số tầng..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phòng Ngủ</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('bedroomNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="Nhập số phòng ngủ..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Wc</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('toiletNumber', { valueAsNumber: true })}
                        min="0"
                        placeholder="Nhập số phòng vệ sinh..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Ngang (m)</label>
                      <input type="number" className={inputClass} {...register('frontageWidth')} placeholder="Nhập chiều ngang (m)..." />
                    </div>
                    <div>
                      <label className={labelClass}>Dài (m)</label>
                      <input type="number" className={inputClass} {...register('lotDepth')} placeholder="Nhập chiều dài (m)..." />
                    </div>
                    <div>
                      <label className={labelClass}>Mặt Hậu (m)</label>
                      <input type="number" className={inputClass} {...register('backSize')} placeholder="Nhập mặt hậu (m)..." />
                    </div>
                    <div>
                      <label className={labelClass}>Vị trí (Loại)</label>
                      <input type="text" className={inputClass} {...register('locationType')} placeholder="Nhập loại vị trí (Mặt tiền, Hẻm)..." />
                    </div>
                    <div>
                      <label className={labelClass}>Hướng nhà</label>
                      <input type="text" className={inputClass} {...register('direction')} placeholder="Nhập hướng nhà..." />
                    </div>
                    <div>
                      <label className={labelClass}>Pháp lý</label>
                      <input type="text" className={inputClass} {...register('legalStatus')} placeholder="Nhập pháp lý (Sổ hồng, Sổ đỏ)..." />
                    </div>
                    <div>
                      <label className={labelClass}>Nội thất</label>
                      <select className={inputClass} {...register('furnitureStatus')} defaultValue="default">
                        <option value="default">Chọn tình trạng nội thất</option>
                        <option value="Đầy đủ nội thất">Đầy đủ nội thất</option>
                        <option value="Chưa có nội thất">Chưa có nội thất</option>
                        <option value="Nhà cũ cần cải tạo">Nhà cũ cần cải tạo</option>
                        <option value="Đất trống/ Nhà nát">Đất trống/ Nhà nát</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Vị trí (Purple) */}
                <div className="relative overflow-hidden rounded-3xl border border-purple-500/10 bg-purple-500/5 p-6 shadow-sm transition-colors hover:border-purple-500/20">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-500/30"></div>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-purple-600/80">Địa chỉ Tài sản</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelClass}>Tỉnh / Thành phố</label>
                      <select
                        className={inputClass}
                        value={selectedProvince}
                        onChange={(e) => {
                          const code = e.target.value;
                          const province = provinces.find((p) => p.code === +code);
                          setSelectedProvince(code);
                          setSelectedDistrict('');
                          setSelectedWard('');
                          setDistricts([]);
                          setWards([]);
                          setValue('province', province ? province.name : '', { shouldValidate: true });
                          setValue('district', '', { shouldValidate: true });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn Tỉnh / Thành</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
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
                        onChange={(e) => {
                          const code = e.target.value;
                          const district = districts.find((d) => d.code === +code);
                          setSelectedDistrict(code);
                          setSelectedWard('');
                          setWards([]);
                          setValue('district', district ? district.name : '', { shouldValidate: true });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn Quận / Huyện</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
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
                        onChange={(e) => {
                          const code = e.target.value;
                          const ward = wards.find((w) => w.code === +code);
                          setSelectedWard(code);
                          setValue('ward', ward ? ward.name : '', { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn Phường / Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Địa chỉ cụ thể <span className="text-error">*</span>
                      </label>
                      <input type="text" className={inputClass} {...register('address', { required: true })} placeholder="Số nhà, Tên đường..." />
                    </div>
                  </div>
                </div>

                {/* 5. Media & Khác (Rose) */}
                <div className="relative overflow-hidden rounded-3xl border border-rose-500/10 bg-rose-500/5 p-6 shadow-sm transition-colors hover:border-rose-500/20">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-rose-500/30"></div>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-rose-600/80">Media & Ghi chú Nội bộ</h4>

                  {/* Admin Images */}
                  <div className="mb-4">
                    <label className={labelClass}>Ảnh nội bộ (Sổ, Giấy tờ...)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setAdminImages(e.target.files)}
                      className="file-input file-input-bordered file-input-secondary file-input-sm w-full bg-white/60 focus:outline-none"
                    />
                    {adminPreviewUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {adminPreviewUrls.map((url, i) => (
                          <div key={url + i} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <Image src={url} alt={`admin-preview-${i}`} fill style={{ objectFit: 'cover' }} unoptimized />
                            <button
                              type="button"
                              onClick={() => removeAdminImage(url)}
                              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <MdClose size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Link Youtube</label>
                      <input type="text" className={inputClass} {...register('youtubeLink')} placeholder="https://..." />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Tiêu đề Video</label>
                      <input type="text" className={inputClass} {...register('videoTitle')} placeholder="Tiêu đề..." />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className={labelClass}>Mô tả Video</label>
                      <textarea className={`${inputClass} resize-none`} {...register('videoDescription')} rows={10} placeholder="Mô tả video..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Tiện ích (Amenities)</label>
                      <textarea className={`${inputClass} resize-none`} {...register('amenities')} rows={10} placeholder="Nhập tiện ích..." />
                    </div>
                    <div>
                      <label className={`${labelClass} text-warning/80`}>Ghi chú Admin (Không hiển thị)</label>
                      <textarea
                        className={`${inputClass} resize-none border-warning/20 bg-warning/5 text-warning-content focus:border-warning/50`}
                        {...register('adminNote')}
                        rows={10}
                        placeholder="Ghi chú hoa hồng, thông tin chủ nhà..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Ngày Đăng <span className="text-error">*</span>
                      </label>
                      <input type="date" className={inputClass} {...register('postedAt', { required: false })} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Ngày Hết Hạn <span className="text-error">*</span>
                      </label>
                      <input type="date" className={inputClass} {...register('expiredAt', { required: false })} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="z-10 flex flex-shrink-0 items-center justify-end gap-4 border-t border-base-content/5 bg-base-100/95 px-6 py-5 backdrop-blur-md sm:px-8">
              <CancelBtn onClick={onClose} type="button" value="Hủy thao tác" className="min-w-[120px] rounded-xl font-bold" />
              <Button
                color="success"
                size="sm"
                type="submit"
                form="rental-post-form"
                disabled={loading}
                className="min-w-[150px] rounded-xl font-bold tracking-wide text-white shadow-lg shadow-primary/30 transition-shadow hover:shadow-primary/50"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
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
