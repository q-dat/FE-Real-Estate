'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { requireAdminToken } from '@/services/shared/adminAuth.client';
import { MeResponse } from '@/types/type/auth/auth';

// --- Types & Constants ---
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

const INITIAL_FORM: ProfileFormData = {
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

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    const initData = async () => {
      try {
        const token = requireAdminToken();
        const res: MeResponse = await authService.me(token);
        const p = res.data.profile;

        setFormData({
          displayName: p.displayName || '',
          username: p.username || '',
          aboutMe: p.aboutMe || '',
          instagram: p.instagram || '',
          messenger: p.messenger || '',
          facebook: p.facebook || '',
          phoneNumber: p.phoneNumber || '',
          zaloNumber: p.zaloNumber || '',
          viberNumber: p.viberNumber || '',
        });

        if (p.avatar) setAvatarPreview(p.avatar);
      } catch (error) {
        console.error('Data sync failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const token = requireAdminToken();
      await authService.updateProfile({ profile: { ...formData, avatar: avatarFile ?? undefined } }, token);
      // Hiệu ứng Toast hoặc Modal có thể thêm ở đây
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="loading loading-ring loading-lg text-primary"
        ></motion.span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-base-200 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-base-content">Hồ sơ Quản trị</h1>
          <p className="mt-2 text-base-content/60">Cập nhật danh tính và các kênh liên lạc hệ thống của bạn.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={isSaving}
          className={`btn btn-primary px-8 shadow-lg ${isSaving ? 'loading' : ''}`}
        >
          Lưu thay đổi
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Left: Avatar Card */}
        <div className="xl:col-span-4">
          <motion.div variants={itemVariants} className="card overflow-hidden border border-base-200 bg-base-100 shadow-2xl">
            <div className="h-24 w-full bg-gradient-to-br from-primary to-accent opacity-80" />
            <div className="card-body -mt-12 items-center text-center">
              <div className="group relative">
                <div className="avatar">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-32 overflow-hidden rounded-2xl bg-base-300 shadow-xl ring ring-primary ring-offset-4 ring-offset-base-100"
                  >
                    <img src={avatarPreview || '/default-avatar.png'} alt="Profile" className="object-cover" />
                  </motion.div>
                </div>
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-all group-hover:opacity-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Thay đổi</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>

              <div className="mt-4 space-y-1">
                <h2 className="text-2xl font-bold">{formData.displayName || 'Anonymous'}</h2>
                <p className="font-mono text-sm text-primary">@{formData.username || 'username'}</p>
              </div>

              <div className="mt-6 w-full space-y-3">
                <div className="flex justify-between text-xs font-semibold uppercase opacity-50">
                  <span>Trạng thái</span>
                  <span className="text-success">Hoạt động</span>
                </div>
                <progress className="progress progress-primary w-full" value="100" max="100"></progress>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Form Details */}
        <div className="space-y-6 xl:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
              {/* Thông tin định danh */}
              <section className="card border border-base-200 bg-base-100 shadow-sm">
                <div className="card-body p-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-tighter text-base-content/50">Thông tin định danh</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="form-control w-full">
                      <label className="label text-xs font-bold uppercase">Họ và Tên</label>
                      <input
                        name="displayName"
                        className="input input-bordered font-medium transition-all focus:input-primary"
                        value={formData.displayName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label text-xs font-bold uppercase">Tên đăng nhập</label>
                      <input
                        name="username"
                        className="input input-bordered font-mono transition-all focus:input-primary"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                      <label className="label text-xs font-bold uppercase">Tiểu sử</label>
                      <textarea
                        name="aboutMe"
                        className="textarea textarea-bordered min-h-[100px] leading-relaxed focus:textarea-primary"
                        value={formData.aboutMe}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Kết nối mạng xã hội */}
              <section className="card border border-base-200 bg-base-100 shadow-sm">
                <div className="card-body p-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-tighter text-base-content/50">Mạng xã hội (Deep Links)</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {['facebook', 'instagram', 'messenger'].map((social) => (
                      <div key={social} className="form-control w-full">
                        <label className="label text-xs font-bold uppercase">{social}</label>
                        <input
                          name={social}
                          className="input input-sm input-bordered focus:input-secondary"
                          value={(formData as any)[social]}
                          onChange={handleInputChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Thông tin liên lạc nội bộ */}
              <section className="card border border-base-200 bg-base-100 shadow-sm">
                <div className="card-body p-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-tighter text-base-content/50">Liên lạc trực tiếp</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      { label: 'Số điện thoại', name: 'phoneNumber' },
                      { label: 'Zalo ID', name: 'zaloNumber' },
                      { label: 'Viber ID', name: 'viberNumber' },
                    ].map((item) => (
                      <div key={item.name} className="form-control w-full">
                        <label className="label text-xs font-bold uppercase">{item.label}</label>
                        <input
                          name={item.name}
                          className="input input-bordered font-medium focus:input-accent"
                          value={(formData as any)[item.name]}
                          onChange={handleInputChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
