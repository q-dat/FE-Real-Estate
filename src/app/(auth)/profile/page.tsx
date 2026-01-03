'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { authService } from '@/services/auth.service';
import { requireAdminToken } from '@/services/shared/adminAuth.client';
import { MeResponse } from '@/types/type/auth/auth';

// Định nghĩa kiểu dữ liệu cho Form để đảm bảo Type Safety
interface ProfileFormData {
  displayName: string;
  username: string;
  aboutMe: string;
  instagram: string;
  messenger: string;
  facebook: string;
  phoneNumber: string;
  zaloNumber: string;
  viberNumber: string;
}

const INITIAL_FORM_DATA: ProfileFormData = {
  displayName: '',
  username: '',
  aboutMe: '',
  instagram: '',
  messenger: '',
  facebook: '',
  phoneNumber: '',
  zaloNumber: '',
  viberNumber: '',
};

export default function ProfilePage() {
  // State quản lý logic
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State quản lý dữ liệu
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(''); // URL ảnh để hiển thị

  // Fetch dữ liệu user khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = requireAdminToken();
        if (!token) return;

        const data: MeResponse = await authService.me(token);
        const user = data.data.profile;

        // Map dữ liệu từ API vào Form
        setFormData({
          displayName: user.displayName || '',
          username: user.username || '',
          aboutMe: user.aboutMe || '',
          instagram: user.instagram || '',
          messenger: user.messenger || '',
          facebook: user.facebook || '',
          phoneNumber: user.phoneNumber || '',
          zaloNumber: user.zaloNumber || '',
          viberNumber: user.viberNumber || '',
        });

        // Nếu có avatar từ server (giả sử server trả về full url hoặc path)
        if (user.avatar) {
          setAvatarPreview(user.avatar);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Xử lý thay đổi input text
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn ảnh Avatar (Tạo preview URL blob)
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Revoke URL cũ để tránh memory leak
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Submit Form
  const onSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const token = requireAdminToken();

      await authService.updateProfile(
        {
          profile: {
            ...formData,
            avatar: avatarFile ?? undefined,
          },
        },
        token
      );

      // Có thể thay bằng Toast notification chuyên nghiệp hơn
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-base-content">Cài đặt hồ sơ</h1>
        <p className="text-base-content/60">Quản lý thông tin cá nhân và hiển thị công khai của bạn.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Left Column: Avatar & Quick Info */}
        <div className="xl:col-span-1">
          <div className="card sticky top-6 overflow-hidden border border-base-200 bg-base-100 shadow-xl">
            {/* Cover Decoration */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-secondary/20"></div>

            <div className="card-body z-10 -mt-16 items-center text-center">
              <div className="group relative">
                <div className="avatar">
                  <div className="w-32 overflow-hidden rounded-full shadow-2xl ring ring-primary ring-offset-2 ring-offset-base-100">
                    <img
                      src={avatarPreview || 'https://ui-avatars.com/api/?name=User&background=random'}
                      alt="Avatar"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Upload Overlay Button */}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-bold text-white">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>

              <h2 className="card-title mt-4 text-2xl">{formData.displayName || 'Chưa đặt tên'}</h2>
              <p className="text-sm text-base-content/70">@{formData.username || 'username'}</p>

              <div className="divider my-2"></div>

              <div className="w-full space-y-2">
                <button
                  className="btn btn-primary w-full shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
                  onClick={() => onSubmit()}
                  disabled={isSaving}
                >
                  {isSaving ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Form */}
        <div className="space-y-6 xl:col-span-2">
          {/* Section 1: Thông tin cơ bản */}
          <div className="card border border-base-200 bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4 border-b border-base-200 pb-2 text-lg">Thông tin cơ bản</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Tên hiển thị</span>
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className="input input-bordered w-full transition-all focus:input-primary"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Username</span>
                  </label>
                  <input
                    name="username"
                    type="text"
                    placeholder="VD: nguyenvana"
                    className="input input-bordered w-full transition-all focus:input-primary"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Giới thiệu (Bio)</span>
                  </label>
                  <textarea
                    name="aboutMe"
                    className="textarea textarea-bordered h-24 text-base transition-all focus:textarea-primary"
                    placeholder="Hãy viết gì đó về bạn..."
                    value={formData.aboutMe}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mạng xã hội */}
          <div className="card border border-base-200 bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4 border-b border-base-200 pb-2 text-lg">Mạng xã hội</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Facebook</span>
                  </label>
                  <input
                    name="facebook"
                    type="text"
                    placeholder="Link Facebook"
                    className="input input-bordered w-full hover:border-blue-400 focus:border-blue-600 focus:outline-none"
                    value={formData.facebook}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Instagram</span>
                  </label>
                  <input
                    name="instagram"
                    type="text"
                    placeholder="@username"
                    className="input input-bordered w-full hover:border-pink-400 focus:border-pink-600 focus:outline-none"
                    value={formData.instagram}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text">Messenger</span>
                  </label>
                  <input
                    name="messenger"
                    type="text"
                    placeholder="Link Messenger"
                    className="input input-bordered w-full hover:border-blue-400 focus:border-blue-500 focus:outline-none"
                    value={formData.messenger}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Liên hệ */}
          <div className="card border border-base-200 bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4 border-b border-base-200 pb-2 text-lg">Thông tin liên hệ</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Số điện thoại</span>
                  </label>
                  <input
                    name="phoneNumber"
                    type="text"
                    placeholder="0912..."
                    className="input input-bordered w-full"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Zalo</span>
                  </label>
                  <input
                    name="zaloNumber"
                    type="text"
                    placeholder="Số Zalo"
                    className="input input-bordered w-full"
                    value={formData.zaloNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Viber</span>
                  </label>
                  <input
                    name="viberNumber"
                    type="text"
                    placeholder="Số Viber"
                    className="input input-bordered w-full"
                    value={formData.viberNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
