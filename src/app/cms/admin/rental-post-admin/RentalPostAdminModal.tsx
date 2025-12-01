'use client';
import { useEffect, useState } from 'react';
import { Button, Select } from 'react-daisyui';
import Image from 'next/image';
import { FaPlus, FaPen } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import InputForm from '@/components/userPage/ui/form/InputForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';

interface Props {
  open: boolean;
  onClose: () => void;
  editingPost: IRentalPostAdmin | null;
  categories: { _id: string; name: string }[];
  reload: () => Promise<void>;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

export default function RentalPostAdminModal({ open, onClose, editingPost, categories, reload }: Props) {
  const { register, handleSubmit, reset, getValues } = useForm<IRentalPostAdmin>();
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

  const [priceMultiplier, setPriceMultiplier] = useState<number>(1);

  // Tự động tính pricePerM2 = (price * multiplier) / area và cập nhật vào input pricePerM2
  useEffect(() => {
    const { price, area } = getValues();
    if (!price || !area) return;
    const perM2 = (Number(price) * priceMultiplier) / Number(area);
    reset({ ...getValues(), pricePerM2: Math.round(perM2) });
  }, [priceMultiplier, getValues, reset]);

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

  const classNameLabel = 'bg-white px-2 font-medium';
  useEscClose(open, onClose);

  // Load dữ liệu khi chỉnh sửa
  // --- Khi editingPost thay đổi ---
  useEffect(() => {
    if (!editingPost) return;

    // Reset form cơ bản
    reset({
      ...editingPost,
      category: typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
      postedAt: editingPost.postedAt ? new Date(editingPost.postedAt).toISOString().split('T')[0] : '',
      expiredAt: editingPost.expiredAt ? new Date(editingPost.expiredAt).toISOString().split('T')[0] : '',
    } as unknown as IRentalPostAdmin);

    // Giữ hình ảnh
    setPreviewUrls(editingPost.images || []);
    setAdminPreviewUrls(editingPost.adminImages || []);
  }, [editingPost, reset]);

  // --- Khi provinces đã load và có editingPost ---
  useEffect(() => {
    if (!editingPost || provinces.length === 0) return;

    const province = provinces.find((p) => p.name === editingPost.province);
    if (province) {
      setSelectedProvince(String(province.code));
    }
  }, [editingPost, provinces]);

  // --- Khi districts đã load và có editingPost ---
  useEffect(() => {
    if (!editingPost || districts.length === 0) return;

    const district = districts.find((d) => d.name === editingPost.district);
    if (district) {
      setSelectedDistrict(String(district.code));
    }
  }, [editingPost, districts]);

  // --- Khi wards đã load và có editingPost ---
  useEffect(() => {
    if (!editingPost || wards.length === 0) return;

    const ward = wards.find((w) => w.name === editingPost.ward);
    if (ward) {
      setSelectedWard(String(ward.code));
    }
  }, [editingPost, wards]);

  const removeImage = (url: string) => setPreviewUrls((prev) => prev.filter((u) => u !== url));

  const handleFormSubmit: SubmitHandler<IRentalPostAdmin> = async (data) => {
    try {
      setLoading(true); // Bắt đầu loading

      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (key === 'images' || key === 'adminImages') continue;
        if (value !== undefined && value !== null) formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }

      if (editingPost?.images?.length && !images) editingPost.images.forEach((u) => formData.append('oldImages', u));
      if (editingPost?.adminImages?.length && !adminImages) editingPost.adminImages.forEach((u) => formData.append('oldAdminImages', u));

      if (images) {
        Array.from(images).forEach((f) => formData.append('images', f));
        editingPost?.images?.forEach((u) => formData.append('oldImages', u));
      }
      if (adminImages) {
        Array.from(adminImages).forEach((f) => formData.append('adminImages', f));
        editingPost?.adminImages?.forEach((u) => formData.append('oldAdminImages', u));
      }

      // Gọi API
      if (editingPost?._id) await rentalPostAdminService.update(editingPost._id, formData);
      else await rentalPostAdminService.create(formData);

      await reload();
      onClose(); // Đóng modal sau khi thành công
    } catch (err) {
      console.error('Lỗi gửi form:', err);
    } finally {
      setLoading(false); // Dừng loading dù có lỗi
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full overflow-hidden rounded-md border-8 border-white bg-white shadow-xl xl:max-w-[80vw]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-2">
              <div className="flex flex-col text-base font-semibold xl:text-lg">
                {/* Hàng trên: icon + tiêu đề */}
                <div className="flex items-center gap-2 text-gray-800">
                  {editingPost ? <FaPen className="text-primary" /> : <FaPlus className="text-primary" />}
                  <h3>{editingPost ? 'Chỉnh sửa bài đăng' : 'Thêm bài đăng mới'}</h3>
                </div>

                {/* Hàng dưới: mã bài đăng */}
                {editingPost?.code && (
                  <span className="mt-1 inline-block w-fit rounded-md bg-primary px-2 py-1 text-sm font-medium text-white shadow-sm">
                    Mã tin: {editingPost.code}
                  </span>
                )}
              </div>
              <Button
                onClick={onClose}
                className="flex items-center justify-center rounded-md bg-red-700 px-2 py-1 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <MdClose size={18} />
              </Button>
            </div>

            {/* Form */}
            <div className="relative max-h-[80vh] overflow-y-auto border-2 border-white scrollbar-hide">
              <form id="rental-post-form" onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 grid gap-x-1 gap-y-4 xl:grid-cols-2">
                <div className="col-span-full">
                  <InputForm
                    autoFocus
                    classNameLabel={`${classNameLabel}`}
                    {...register('title', { required: true })}
                    label="Tiêu đề"
                    placeholder="Nhập tiêu đề bài đăng"
                    bordered
                    required
                  />
                </div>
                <div className="col-span-full">
                  <Select
                    {...register('category', { required: true })}
                    className="select select-bordered w-full bg-primary text-center text-sm font-bold text-white hover:bg-white hover:text-primary focus:outline-none"
                  >
                    <option value="">-- DANH MỤC BÀI ĐĂNG --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <TextareaForm {...register('description', { required: true })} placeholder="Mô tả chi tiết bài đăng..." />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('propertyType')}
                  label="Loại hình BĐS"
                  placeholder="Nhà phố, Căn hộ, ..."
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('locationType')}
                  label="Loại vị trí"
                  placeholder="Mặt tiền, Hẻm, ..."
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('direction')}
                  label="Hướng nhà"
                  placeholder="Đông, Tây, Nam, Bắc"
                  bordered
                />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('backSize')} label="Mặt hậu (m²)" placeholder="Nhập mặt hậu" bordered />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('floorNumber', { valueAsNumber: true })}
                  type="number"
                  label="Số tầng"
                  min="0"
                  placeholder="Nhập số tầng"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('bedroomNumber', { valueAsNumber: true })}
                  type="number"
                  label="Số phòng ngủ"
                  min="0"
                  placeholder="Nhập số phòng ngủ"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('toiletNumber', { valueAsNumber: true })}
                  type="number"
                  label="Số toilet"
                  min="0"
                  placeholder="Nhập số toilet"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('legalStatus')}
                  label="Pháp lý"
                  placeholder="Sổ hồng, Sổ đỏ, ..."
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('furnitureStatus')}
                  label="Nội thất"
                  placeholder="Đầy đủ, Chưa có, ..."
                  bordered
                />

                <TextareaForm {...register('amenities')} placeholder="Tiện ích (máy lạnh, chỗ để xe, v.v...)" />
                {/* Loại Tin */}
                <div className="col-span-full">
                  <LabelForm title="Loại tin" />
                  <Select
                    defaultValue={'highlight'}
                    {...register('postType', { required: true })}
                    className="select select-bordered w-full focus:outline-none"
                  >
                    <option value="basic">Cơ bản</option>
                    <option value="vip1">VIP 1</option>
                    <option value="vip2">VIP 2</option>
                    <option value="vip3">VIP 3</option>
                    <option value="highlight">Nổi bật</option>
                  </Select>
                </div>
                <div className="col-span-full flex items-end gap-2">
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('price', { required: true, valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    label="Giá"
                    placeholder="Nhập giá"
                    bordered
                    required
                  />
                  <Select
                    value={priceMultiplier}
                    onChange={(e) => setPriceMultiplier(Number(e.target.value))}
                    className="select select-bordered w-1/2 bg-primary focus:outline-none text-white"
                  >
                    <option value={1}>Nghìn</option>
                    <option value={1_000}>Triệu</option>
                    <option value={1_000_000}>Tỷ</option>
                  </Select>
                </div>

                <InputForm
                  classNameLabel={classNameLabel}
                  {...register('pricePerM2', { valueAsNumber: true })}
                  step={0.1}
                  type="number"
                  label="Giá/m² (Tự động)"
                  placeholder="Tự động tính"
                  bordered
                  readOnly
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('priceUnit', { required: true })}
                  label="Đơn vị giá"
                  placeholder="vd: /tháng, /m²"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('length')}
                  label="Chiều ngang (m²)"
                  placeholder="Nhập chiều ngang"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('width')}
                  label="Chiều rộng (m²)"
                  placeholder="Nhập chiều rộng"
                  bordered
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('area', { required: true, valueAsNumber: true })}
                  type="number"
                  label="Diện tích (m²)"
                  placeholder="Nhập diện tích"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('phoneNumbers')}
                  label="Số điện thoại liên hệ"
                  placeholder="Nhập số điện thoại"
                  bordered
                />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('zaloLink')} label="Link Zalo" placeholder="Nhập link Zalo" bordered />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('youtubeLink')}
                  label="Link Youtube"
                  placeholder="Nhập link Youtube"
                  bordered
                />
                <div className="col-span-full">
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('videoTitle')}
                    label="Tiêu đề video"
                    placeholder="Nhập tiêu đề video"
                    bordered
                  />
                </div>
                <div className="col-span-full">
                  <TextareaForm {...register('videoDescription')} placeholder="Mô tả video..." />
                </div>
                {/* <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('province', { required: true })}
                  label="Tỉnh / Thành phố"
                  placeholder="Nhập Tỉnh / Thành phố"
                  bordered
                  required
                />
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('district', { required: true })}
                  label="Quận / Huyện"
                  placeholder="Nhập Quận / Huyện"
                  bordered
                  required
                />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('ward')} label="Phường / Xã" placeholder="Nhập Phường / Xã" bordered /> */}
                {/* Tỉnh / Thành phố */}
                <div>
                  <LabelForm title="Tỉnh / Thành phố" />
                  <Select
                    value={selectedProvince}
                    onChange={(e) => {
                      const code = e.target.value;
                      const province = provinces.find((p) => p.code === +code);
                      setSelectedProvince(code);
                      setSelectedDistrict('');
                      setSelectedWard('');
                      setDistricts([]);
                      setWards([]);
                      // Lưu tên tỉnh vào react-hook-form
                      if (province) reset({ ...getValues(), province: province.name });
                    }}
                    className="select select-bordered w-full focus:outline-none"
                  >
                    <option value="">-- Chọn Tỉnh / Thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Quận / Huyện */}
                <div>
                  <LabelForm title="Quận / Huyện" />
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => {
                      const code = e.target.value;
                      const district = districts.find((d) => d.code === +code);
                      setSelectedDistrict(code);
                      setSelectedWard('');
                      setWards([]);
                      if (district) reset({ ...getValues(), district: district.name });
                    }}
                    disabled={!districts.length}
                    className="select select-bordered w-full focus:outline-none"
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Phường / Xã */}
                <div>
                  <LabelForm title="Phường / Xã" />
                  <Select
                    value={selectedWard}
                    onChange={(e) => {
                      const code = e.target.value;
                      const ward = wards.find((w) => w.code === +code);
                      setSelectedWard(code);
                      if (ward) reset({ ...getValues(), ward: ward.name });
                    }}
                    disabled={!wards.length}
                    className="select select-bordered w-full focus:outline-none"
                  >
                    <option value="">-- Chọn Phường / Xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {/*  */}
                <InputForm
                  classNameLabel={`${classNameLabel}`}
                  {...register('address', { required: true })}
                  label="Địa chỉ cụ thể"
                  placeholder="Nhập địa chỉ cụ thể"
                  bordered
                  required
                />
                <div className="col-span-full">
                  <TextareaForm {...register('adminNote')} placeholder="Ghi chú nội bộ cho admin..." />
                </div>
                {/* Ảnh Admin */}
                <div className="col-span-full mb-5">
                  <LabelForm title="Ảnh admin" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setAdminImages(e.target.files)}
                    className="file-input file-input-ghost file-input-secondary w-full rounded-md focus:outline-none"
                  />
                  {adminPreviewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-10">
                      {adminPreviewUrls.map((url, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
                        >
                          <Zoom>
                            <Image src={url} alt={`preview-${i}`} width={100} height={100} unoptimized className="h-full w-full object-cover" />
                          </Zoom>
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <InputForm classNameLabel={`${classNameLabel}`} {...register('postedAt')} label="Ngày đăng tin" type="date" bordered required />
                <InputForm classNameLabel={`${classNameLabel}`} {...register('expiredAt')} label="Ngày hết hạn tin" type="date" bordered required />
                <div className="col-span-full">
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('author')}
                    label="Người đăng tin"
                    placeholder="admin"
                    defaultValue="admin"
                    bordered
                  />
                </div>
                {/* Ảnh */}
                <div className="col-span-full mb-5">
                  <LabelForm title="Ảnh minh họa" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="file-input file-input-ghost file-input-primary w-full rounded-md focus:outline-none"
                  />
                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-10">
                      {previewUrls.map((url, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
                        >
                          <Zoom>
                            <Image src={url} alt={`preview-${i}`} width={100} height={100} unoptimized className="h-full w-full object-cover" />
                          </Zoom>
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-gray-200 bg-white p-3 shadow-inner">
                <CancelBtn value="Hủy" type="button" onClick={onClose} />
                <Button
                  color="primary"
                  type="submit"
                  form="rental-post-form"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-md px-4 py-2"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>{editingPost ? 'Cập nhật' : 'Tạo mới'}</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
