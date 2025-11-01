'use client';
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-daisyui';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { useForm, SubmitHandler } from 'react-hook-form';
import { rentalCategoryService } from '@/services/rentalCategoryService';
import Image from 'next/image';

export default function RentalPostAdminPage() {
  const [posts, setPosts] = useState<IRentalPostAdmin[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { register, handleSubmit, reset } = useForm<IRentalPostAdmin>({
    defaultValues: editingPost ?? undefined,
  });

  // 🧩 Load danh sách
  const loadData = async () => {
    try {
      const data = await rentalPostAdminService.getAll();
      setPosts(data);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    loadData();
    rentalCategoryService.getAll().then(setCategories);
  }, []);

  // 🧩 Khi mở modal chỉnh sửa thì reset form
  useEffect(() => {
    if (editingPost) reset(editingPost);
  }, [editingPost, reset]);

  // 🧩 Preview ảnh local
  useEffect(() => {
    if (images) {
      const urls = Array.from(images).map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }
  }, [images]);

  // 🧩 Gửi form
  const handleFormSubmit: SubmitHandler<IRentalPostAdmin> = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
      }
    });
    if (images) Array.from(images).forEach((f) => formData.append('images', f));

    if (editingPost?._id) {
      await rentalPostAdminService.update(editingPost._id, formData);
    } else {
      await rentalPostAdminService.create(formData);
    }
    setOpenModal(false);
    setEditingPost(null);
    setImages(null);
    setPreviewUrls([]);
    await loadData();
  };

  // 🧩 Xoá bài
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá bài đăng này?')) {
      await rentalPostAdminService.delete(id);
      await loadData();
    }
  };

  // 🧩 Giao diện
  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-semibold">Quản lý bài đăng cho thuê</h1>
        <Button
          color="primary"
          onClick={() => {
            setEditingPost(null);
            reset({});
            setOpenModal(true);
          }}
        >
          + Thêm bài đăng
        </Button>
      </div>

      <Table className="w-full">
        <Table.Head>
          <span>Tiêu đề</span>
          <span>Giá</span>
          <span>Danh mục</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </Table.Head>
        <Table.Body>
          {posts.map((post) => (
            <Table.Row key={post._id}>
              <span className="max-w-[200px] truncate">{post.title}</span>
              <span>
                {post.price.toLocaleString()} {post.priceUnit}
              </span>
              <span>{post.category?.name}</span>
              <span className="capitalize">{post.status}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="info"
                  onClick={() => {
                    setEditingPost(post);
                    setOpenModal(true);
                  }}
                >
                  Sửa
                </Button>
                <Button size="sm" color="error" onClick={() => handleDelete(post._id!)}>
                  Xoá
                </Button>
              </div>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setOpenModal(false);
            setEditingPost(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-xl font-semibold">{editingPost ? 'Chỉnh sửa bài đăng' : 'Thêm bài đăng mới'}</h3>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
              {/* --- TITLE --- */}
              <input {...register('title', { required: true })} placeholder="Tiêu đề bài đăng" className="input input-bordered w-full rounded-lg" />

              {/* --- DESCRIPTION --- */}
              <textarea
                {...register('description', { required: true })}
                placeholder="Mô tả chi tiết"
                rows={3}
                className="textarea textarea-bordered w-full rounded-lg"
              />

              {/* --- PRICE / UNIT --- */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  {...register('price', { required: true, valueAsNumber: true })}
                  placeholder="Giá (VNĐ)"
                  className="input input-bordered rounded-lg"
                />
                <input
                  {...register('priceUnit', { required: true })}
                  placeholder="Đơn vị giá (VD: VNĐ/tháng)"
                  className="input input-bordered rounded-lg"
                />
              </div>

              {/* --- AREA / CATEGORY --- */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  {...register('area', { required: true, valueAsNumber: true })}
                  placeholder="Diện tích (m²)"
                  className="input input-bordered rounded-lg"
                />
                <select {...register('category', { required: true })} className="select select-bordered rounded-lg">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- LOCATION --- */}
              <div className="grid grid-cols-2 gap-4">
                <input {...register('province', { required: true })} placeholder="Tỉnh / Thành phố" className="input input-bordered rounded-lg" />
                <input {...register('district', { required: true })} placeholder="Quận / Huyện" className="input input-bordered rounded-lg" />
              </div>

              <input {...register('address', { required: true })} placeholder="Địa chỉ cụ thể" className="input input-bordered rounded-lg" />

              <input {...register('title', { required: true })} placeholder="Tiêu đề bài đăng" className="input input-bordered w-full rounded-lg" />
              <textarea
                {...register('description', { required: true })}
                placeholder="Mô tả chi tiết"
                rows={3}
                className="textarea textarea-bordered w-full rounded-lg"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  {...register('price', { required: true, valueAsNumber: true })}
                  placeholder="Giá (VNĐ)"
                  className="input input-bordered rounded-lg"
                />
                <input
                  {...register('priceUnit', { required: true })}
                  placeholder="Đơn vị giá (VD: VNĐ/tháng)"
                  className="input input-bordered rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  {...register('area', { required: true, valueAsNumber: true })}
                  placeholder="Diện tích (m²)"
                  className="input input-bordered rounded-lg"
                />
                <select {...register('category', { required: true })} className="select select-bordered rounded-lg">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <input {...register('address', { required: true })} placeholder="Địa chỉ cụ thể" className="input input-bordered rounded-lg" />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh minh họa</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="file-input file-input-bordered w-full rounded-lg"
                />
                {previewUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                          src={url}
                          alt={`preview-${idx}`}
                          width={200}
                          height={200}
                          unoptimized
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select {...register('status')} className="select select-bordered rounded-lg">
                <option value="active">Hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="expired">Hết hạn</option>
                <option value="hidden">Ẩn</option>
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(false);
                    setEditingPost(null);
                  }}
                  className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {editingPost ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
