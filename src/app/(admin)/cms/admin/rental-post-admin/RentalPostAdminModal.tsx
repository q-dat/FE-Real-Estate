'use client';
import { useEffect, useState } from 'react';
import { Button, Select } from 'react-daisyui';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { District, IRentalPostAdmin, Province, Ward } from '@/types/type/rentalAdmin/rentalAdmin';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import InputForm from '@/components/userPage/ui/form/InputForm';
import LabelForm from '@/components/userPage/ui/form/LabelForm';
// import CancelBtn from '@/components/userPage/ui/btn/CancelBtn'; // Loại bỏ
import TextareaForm from '@/components/userPage/ui/form/TextareaForm';
import { useEscClose } from '@/hooks/useEscClose';
import Zoom from '@/lib/Zoom';
import CancelBtn from '@/components/userPage/ui/btn/CancelBtn';
// import { FaPlus, FaPen } from 'react-icons/fa'; // Loại bỏ: Icons trong code nên được thay bằng `react-daisyui` hoặc được giữ lại một cách tối giản.

interface Props {
  open: boolean;
  onClose: () => void;
  editingPost: IRentalPostAdmin | null;
  categories: { _id: string; name: string }[];
  reload: () => Promise<void>;
}

export default function RentalPostAdminModal({ open, onClose, editingPost, categories, reload }: Props) {
  const { register, handleSubmit, reset, getValues, watch, setValue } = useForm<IRentalPostAdmin>();
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

  const [priceMultiplier, setPriceMultiplier] = useState<number>(1_000); // Mặc định Triệu (1_000), tối ưu UX cho trường hợp giá BDS

  // Tự động tính pricePerM2 = (price * multiplier) / area và cập nhật vào input pricePerM2
  const watchPrice = watch('price');
  const watchArea = watch('area');

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

  // Logic fetch địa chỉ (giữ nguyên, đảm bảo tính đúng đắn)
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

  // Load dữ liệu khi chỉnh sửa (giữ nguyên, logic sạch)
  useEffect(() => {
    if (!editingPost) return;

    reset({
      ...editingPost,
      category: typeof editingPost.category === 'object' ? editingPost.category._id : editingPost.category,
      postedAt: editingPost.postedAt ? new Date(editingPost.postedAt).toISOString().split('T')[0] : '',
      expiredAt: editingPost.expiredAt ? new Date(editingPost.expiredAt).toISOString().split('T')[0] : '',
    } as unknown as IRentalPostAdmin);

    setPreviewUrls(editingPost.images || []);
    setAdminPreviewUrls(editingPost.adminImages || []);
  }, [editingPost, reset]);

  // Đồng bộ hóa selectedProvince, selectedDistrict, selectedWard (giữ nguyên, logic sạch)
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

  const handleFormSubmit: SubmitHandler<IRentalPostAdmin> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (key === 'images' || key === 'adminImages') continue;
        // Bỏ qua các giá trị null/undefined để tránh lỗi FormData
        if (value !== undefined && value !== null) {
          // Ép kiểu tường minh để tránh `any` nếu cần, nhưng ở đây dùng `FormData` nên chấp nhận `String(value)`
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }

      // Xử lý ảnh: Thay thế logic cũ bằng cách dùng `previewUrls` và `adminPreviewUrls`
      // Logic này cần được kiểm tra kỹ với backend API để đảm bảo luồng cập nhật ảnh (xóa ảnh cũ, thêm ảnh mới)

      // Ảnh cũ còn lại (đã lọc các ảnh bị xóa trong `removeImage`)
      previewUrls.forEach((url) => {
        // Chỉ thêm ảnh cũ nếu không phải là FileList mới được chọn
        if (!images && (editingPost?.images || []).includes(url)) {
          formData.append('oldImages', url);
        }
      });
      adminPreviewUrls.forEach((url) => {
        if (!adminImages && (editingPost?.adminImages || []).includes(url)) {
          formData.append('oldAdminImages', url);
        }
      });

      // Ảnh mới
      if (images) Array.from(images).forEach((f) => formData.append('images', f));
      if (adminImages) Array.from(adminImages).forEach((f) => formData.append('adminImages', f));

      // Gọi API
      if (editingPost?._id) await rentalPostAdminService.update(editingPost._id, formData);
      else await rentalPostAdminService.create(formData);

      await reload();
      onClose();
    } catch (err) {
      console.error('Lỗi gửi form:', err);
      // Có thể thêm toast/notification ở đây
    } finally {
      setLoading(false);
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
          // Đóng modal khi click ra ngoài (đã comment out trong code gốc, giữ nguyên)
          // onClick={onClose}
        >
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            // Thay đổi `xl:max-w-[90vw]` thành `xl:max-w-6xl` hoặc `xl:w-[90vw]` để kiểm soát kích thước tốt hơn
            className="relative w-full overflow-hidden rounded-xl border-8 border-white bg-white shadow-2xl xl:w-[90vw] xl:max-w-7xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            {/* Header: Sticky và UI hiện đại */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-2 shadow-sm">
              <div className="flex flex-col text-lg font-bold text-gray-800 xl:text-xl">
                {/* Sử dụng class `text-primary` và fontWeight */}
                <h3 className="flex items-center gap-4">
                  {editingPost ? <span className="text-primary">📝</span> : <span className="text-primary">✨</span>}
                  {editingPost ? 'Cập nhật Bài đăng' : 'Tạo mới Bài đăng'}
                </h3>

                {/* Hàng dưới: mã bài đăng */}
                {editingPost?.code && (
                  <span className="mt-1 inline-block w-fit rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Mã tin: **{editingPost.code}**
                  </span>
                )}
              </div>
              <Button
                onClick={onClose}
                color="ghost"
                className="btn-circle text-gray-500 transition-colors duration-200 hover:bg-red-500 hover:text-white"
              >
                <MdClose size={24} />
              </Button>
            </div>

            {/* Form Container */}
            <div className="scrollbar-thumb-rounded-full relative max-h-[70vh] overflow-y-auto py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
              <form
                id="rental-post-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                // Chia cột, tối ưu padding
                className="grid gap-x-6 gap-y-6 xl:grid-cols-2 2xl:grid-cols-3"
              >
                {/* 1. THÔNG TIN CƠ BẢN (Col-span-full) */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm">
                  <h4 className="text-base font-bold text-gray-700">Thông tin Cơ bản</h4>
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="xl:col-span-2">
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
                    <Select
                      {...register('category', { required: true })}
                      // Cải thiện UI Select Category
                      className="select select-bordered w-full bg-primary text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none"
                    >
                      <option value="">DANH MỤC BÀI ĐĂNG</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name.toUpperCase()}
                        </option>
                      ))}
                    </Select>
                    <Select
                      defaultValue={'highlight'}
                      {...register('postType', { required: true })}
                      className="select select-bordered w-full focus:outline-none"
                    >
                      <option value="highlight" className="font-bold text-primary">
                        LOẠI TIN (Nổi bật)
                      </option>
                      <option value="basic">Cơ bản</option>
                      <option value="vip1">VIP 1</option>
                      <option value="vip2">VIP 2</option>
                      <option value="vip3">VIP 3</option>
                    </Select>
                  </div>
                  <TextareaForm {...register('description', { required: true })} placeholder="Mô tả chi tiết bài đăng..." rows={4} />
                </div>

                {/* 2. THÔNG TIN BẤT ĐỘNG SẢN (3 cột ở 2XL) */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Thông tin Bất động sản</h4>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('propertyType')}
                      label="Loại hình BĐS"
                      placeholder="Nhà phố, Căn hộ, ..."
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('locationType')}
                      label="Loại vị trí"
                      placeholder="Mặt tiền, Hẻm, ..."
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('direction')}
                      label="Hướng nhà"
                      placeholder="Đông, Tây, Nam, Bắc"
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('legalStatus')}
                      label="Pháp lý"
                      placeholder="Sổ hồng, Sổ đỏ, ..."
                      bordered
                    />
                    <div>
                      <Select {...register('furnitureStatus')} defaultValue="" className="select select-bordered w-full focus:outline-none">
                        <option value="">Nội thất (Không chọn)</option>
                        <option value="Đầy đủ nội thất">Đầy đủ nội thất</option>
                        <option value="Chưa có nội thất">Chưa có nội thất</option>
                        <option value="Nhà cũ cần cải tạo">Nhà cũ cần cải tạo</option>
                        <option value="Đất trống/ Nhà nát">Đất trống/ Nhà nát</option>
                      </Select>
                    </div>
                  </div>
                  <TextareaForm {...register('amenities')} placeholder="Tiện ích (máy lạnh, chỗ để xe, v.v...)" rows={3} />
                </div>

                {/* 3. THÔNG SỐ (2 cột) */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Diện tích và Kích thước</h4>
                  <div className="grid gap-4 xl:grid-cols-4">
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('area', { required: true })}
                      type="number"
                      label="Diện tích (m²)"
                      placeholder="Nhập diện tích"
                      bordered
                      required
                    />
                    <InputForm classNameLabel={classNameLabel} {...register('length')} label="Chiều dài (m)" placeholder="Nhập chiều dài" bordered />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('width')}
                      label="Chiều ngang (m)"
                      placeholder="Nhập chiều ngang"
                      bordered
                    />
                    <InputForm classNameLabel={classNameLabel} {...register('backSize')} label="Mặt hậu (m)" placeholder="Nhập mặt hậu" bordered />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('floorNumber', { valueAsNumber: true })}
                      type="number"
                      label="Số tầng"
                      min="0"
                      placeholder="Nhập số tầng"
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('bedroomNumber', { valueAsNumber: true })}
                      type="number"
                      label="Số phòng ngủ"
                      min="0"
                      placeholder="Nhập số phòng ngủ"
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('toiletNumber', { valueAsNumber: true })}
                      type="number"
                      label="Số toilet"
                      min="0"
                      placeholder="Nhập số toilet"
                      bordered
                    />
                  </div>
                </div>

                {/* 4. GIÁ CẢ */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Thông tin Giá</h4>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="flex items-end gap-4">
                      <InputForm
                        classNameLabel={`${classNameLabel}`}
                        {...register('price', { required: true, valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        label="Giá trị"
                        placeholder="Nhập giá"
                        bordered
                        required
                      />
                      <Select
                        value={priceMultiplier}
                        onChange={(e) => setPriceMultiplier(Number(e.target.value))}
                        className="select select-bordered w-1/3 bg-primary text-white focus:outline-none"
                      >
                        <option value={1}>Nghìn</option>
                        <option value={1_000}>Triệu</option>
                        <option value={1_000_000}>Tỷ</option>
                      </Select>
                    </div>
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('pricePerM2', { valueAsNumber: true })}
                      step={1}
                      type="number"
                      label="Giá/m² (Tự động)"
                      placeholder="Tự động tính"
                      bordered
                      readOnly
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('priceUnit', { required: true })}
                      label="Đơn vị giá"
                      placeholder="vd: /tháng, /tổng"
                      bordered
                      required
                    />
                  </div>
                </div>

                {/* 5. ĐỊA CHỈ */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Vị trí</h4>
                  <div className="grid gap-4 xl:grid-cols-3">
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
                          if (province) setValue('province', province.name, { shouldValidate: true });
                          else setValue('province', '', { shouldValidate: true });
                          setValue('district', '', { shouldValidate: true });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                        className="select select-bordered w-full focus:outline-none"
                      >
                        <option value="">Chọn Tỉnh / Thành phố</option>
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
                          if (district) setValue('district', district.name, { shouldValidate: true });
                          else setValue('district', '', { shouldValidate: true });
                          setValue('ward', '', { shouldValidate: true });
                        }}
                        disabled={!districts.length}
                        className="select select-bordered w-full focus:outline-none"
                      >
                        <option value="">Chọn Quận / Huyện</option>
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
                          if (ward) setValue('ward', ward.name, { shouldValidate: true });
                          else setValue('ward', '', { shouldValidate: true });
                        }}
                        disabled={!wards.length}
                        className="select select-bordered w-full focus:outline-none"
                      >
                        <option value="">Chọn Phường / Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <InputForm
                    classNameLabel={`${classNameLabel}`}
                    {...register('address', { required: true })}
                    label="Địa chỉ cụ thể"
                    placeholder="Nhập địa chỉ cụ thể (số nhà, đường...)"
                    bordered
                    required
                  />
                </div>

                {/* 6. THÔNG TIN LIÊN HỆ & MEDIA */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Liên hệ & Media</h4>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('phoneNumbers')}
                      label="Số điện thoại liên hệ"
                      placeholder="Nhập số điện thoại"
                      bordered
                    />
                    <InputForm classNameLabel={classNameLabel} {...register('zaloLink')} label="Link Zalo" placeholder="Nhập link Zalo" bordered />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('youtubeLink')}
                      label="Link Youtube"
                      placeholder="Nhập link Youtube"
                      bordered
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('videoTitle')}
                      label="Tiêu đề video"
                      placeholder="Nhập tiêu đề video"
                      bordered
                      className="xl:col-span-3"
                    />
                    <TextareaForm {...register('videoDescription')} placeholder="Mô tả video..." rows={3} className="xl:col-span-3" />
                  </div>
                </div>

                {/* 7. QUẢN LÝ NỘI BỘ (2 cột) */}
                <div className="col-span-full space-y-4 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Thông tin Nội bộ & Quản lý</h4>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('postedAt', { required: true })}
                      label="Ngày đăng tin"
                      type="date"
                      bordered
                      required
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('expiredAt', { required: true })}
                      label="Ngày hết hạn tin"
                      type="date"
                      bordered
                      required
                    />
                    <InputForm
                      classNameLabel={classNameLabel}
                      {...register('author')}
                      label="Người đăng tin"
                      placeholder="admin"
                      defaultValue="admin"
                      bordered
                    />
                  </div>
                  <TextareaForm {...register('adminNote')} placeholder="Ghi chú nội bộ cho admin..." rows={3} />
                </div>

                {/* 8. UPLOAD ẢNH (2 nhóm) */}
                <div className="col-span-full space-y-6 rounded-lg border border-gray-200 p-2 shadow-sm xl:col-span-2 2xl:col-span-3">
                  <h4 className="text-base font-bold text-gray-700">Quản lý Ảnh</h4>

                  {/* Ảnh Admin */}
                  <section className="space-y-3">
                    <LabelForm title="Ảnh nội bộ (Admin Images)" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setAdminImages(e.target.files)}
                      // Đổi `file-input-secondary` thành `file-input-info` hoặc màu khác phù hợp với admin
                      className="file-input file-input-bordered file-input-info w-full rounded-lg focus:outline-none"
                    />
                    {adminPreviewUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-10">
                        {adminPreviewUrls.map((url, i) => (
                          <div
                            key={url + i} // Dùng url + index để đảm bảo key duy nhất
                            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-100 shadow-md transition hover:border-primary"
                          >
                            <Zoom>
                              {/* Tối ưu Image component */}
                              <Image
                                src={url}
                                alt={`admin-preview-${i}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                unoptimized
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            </Zoom>
                            <button
                              type="button"
                              onClick={() => removeAdminImage(url)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-90 transition hover:bg-red-700 hover:opacity-100"
                            >
                              <MdClose size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Ảnh Minh họa */}
                  <section className="space-y-3">
                    <LabelForm title="Ảnh minh họa (Public Images)" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(e.target.files)}
                      // Giữ nguyên `file-input-primary` cho ảnh public
                      className="file-input file-input-bordered file-input-primary w-full rounded-lg focus:outline-none"
                    />
                    {previewUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-10">
                        {previewUrls.map((url, i) => (
                          <div
                            key={url + i}
                            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-100 shadow-md transition hover:border-primary"
                          >
                            <Zoom>
                              <Image
                                src={url}
                                alt={`public-preview-${i}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                unoptimized
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            </Zoom>
                            <button
                              type="button"
                              onClick={() => removeImage(url)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-90 transition hover:bg-red-700 hover:opacity-100"
                            >
                              <MdClose size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </form>
            </div>

            {/* Footer: Sticky và UI hiện đại */}
            <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-2 shadow-lg">
              <CancelBtn onClick={onClose} type="button" value="Hủy" />

              <Button
                color="primary"
                type="submit"
                form="rental-post-form"
                size="sm"
                disabled={loading}
                className="flex items-center gap-4 rounded-lg font-semibold"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
