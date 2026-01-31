'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import {
  FiUser,
  FiInstagram,
  FiFacebook,
  FiCamera,
  FiSave,
  FiGrid,
  FiSettings,
  FiMail,
  FiLink,
  FiMessageSquare,
  FiSmartphone,
  FiShare2,
  FiArrowLeft, // [UPDATE] Import icon mũi tên
} from 'react-icons/fi';
import { SiZalo, SiViber, SiMessenger } from 'react-icons/si';
import { authService } from '@/services/auth.service';
import { getAdminToken, requireAdminToken } from '@/services/shared/adminAuth.client';
import { MeResponse } from '@/types/auth/auth.types';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface chuẩn mực, không dùng any
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

// const DEMO_POSTS = [
//   {},
//   {
//     id: '1',
//     title: '...',
//     description: '...',
//     image: '...',
//     date: '...',
//     tag: '...',
//   },
// ];

export default function AdvancedProfilePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'edit'>('feed');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userMeta, setUserMeta] = useState({ email: '', id: '' });
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    username: '',
    aboutMe: '',
    instagram: '',
    messenger: '',
    facebook: '',
    phoneNumber: '',
    zaloNumber: '',
    viberNumber: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAdminToken();

      // Guard: chưa login → redirect
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res: MeResponse = await authService.me(token);
        const { id, email, profile } = res.data;

        setUserMeta({ id, email });
        setFormData({
          displayName: profile.displayName || '',
          username: profile.username || '',
          aboutMe: profile.aboutMe || '',
          instagram: profile.instagram || '',
          messenger: profile.messenger || '',
          facebook: profile.facebook || '',
          phoneNumber: profile.phoneNumber || '',
          zaloNumber: profile.zaloNumber || '',
          viberNumber: profile.viberNumber || '',
        });

        if (profile.avatar) {
          setAvatarPreview(profile.avatar);
        }
      } catch {
        // Token hết hạn / invalid
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const token = requireAdminToken();
      await authService.updateProfile(
        {
          profile: { ...formData, avatar: avatarFile ?? undefined },
        },
        token
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      {/* Header Banner */}
      <div className="relative h-[180px] w-full bg-gradient-to-br from-blue-900/20 to-slate-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

        {/* Home/Back */}
        <Link
          href="/"
          className="absolute left-2 top-2 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:pl-3 hover:shadow-lg hover:shadow-primary/20"
        >
          <FiArrowLeft size={14} /> Trang chủ
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-2 xl:px-0">
        {/* Profile Header */}
        <div className="relative -mt-20 flex flex-col items-center xl:flex-row xl:items-end xl:gap-8">
          <div className="group avatar relative">
            <div className="w-40 overflow-hidden rounded-[2rem] shadow-2xl ring-[8px] ring-[#020617] transition-transform duration-500 group-hover:scale-[1.02]">
              <img src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.displayName}`} alt="Avatar" />
            </div>
            <label className="btn btn-circle btn-primary btn-sm absolute -bottom-2 -right-2 border-4 border-[#020617] shadow-xl">
              <FiCamera size={14} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          <div className="mt-6 flex-1 text-center xl:mb-4 xl:text-left">
            <h1 className="text-4xl font-black text-white">{formData.displayName || 'The Executive'}</h1>
            <div className="mt-2 flex flex-wrap justify-center gap-4 xl:justify-start">
              <span className="badge badge-primary badge-outline font-mono text-[10px] tracking-widest">@{formData.username || 'username'}</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FiMail size={12} /> {userMeta.email || 'email'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 flex rounded-2xl border border-white/5 bg-slate-900/80 p-1.5 backdrop-blur-md xl:mb-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`btn btn-sm h-10 rounded-xl border-none px-6 transition-all ${activeTab === 'feed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'btn-ghost text-slate-400'}`}
            >
              <FiGrid className="mr-2" /> Hoạt động
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`btn btn-sm h-10 rounded-xl border-none px-6 transition-all ${activeTab === 'edit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'btn-ghost text-slate-400'}`}
            >
              <FiSettings className="mr-2" /> Thiết lập
            </button>
          </div>
        </div>

        {/* Dynamic Layout Grid */}
        <div className="mt-12 grid grid-cols-1 gap-10 pb-32 xl:grid-cols-12">
          {/* Cột trái (Sidebar) - Chỉ hiện khi ở tab Feed */}
          {activeTab === 'feed' && (
            <div className="animate-in fade-in slide-in-from-left-5 duration-500 xl:col-span-4">
              <div className="rounded-lg border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-4">
                <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <FiShare2 /> Digital Connectivity
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: <FiFacebook className="text-blue-500" />, label: 'Facebook', value: formData.facebook },
                    { icon: <FiInstagram className="text-pink-500" />, label: 'Instagram', value: formData.instagram },
                    { icon: <SiMessenger className="text-indigo-400" />, label: 'Messenger', value: formData.messenger },
                    { icon: <SiZalo className="text-blue-400" />, label: 'Zalo Connect', value: formData.zaloNumber },
                  ].map((social, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 p-4 transition-all hover:border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">{social.icon}</div>
                        <span className="text-[11px] font-bold text-slate-300">{social.label}</span>
                      </div>
                      <span className="max-w-[120px] truncate text-[10px] italic text-slate-500">{social.value || 'None'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cột phải (Content) - Tự động giãn full width khi tab edit */}
          <div className={`${activeTab === 'feed' ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all duration-500`}>
            {activeTab === 'feed' ? (
              <div className="animate-in fade-in grid gap-6 duration-700">
                Chức năng bài viết cá nhân đang bảo trì...
                {/* {DEMO_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.05] md:flex-row"
                  >
                    <div className="h-48 w-full overflow-hidden md:w-1/3">
                      <img
                        src={post.image}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={post.title}
                      />
                    </div>
                    <div className="flex-1 p-8">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{post.tag}</span>
                        <time className="text-[10px] text-slate-500">{post.date}</time>
                      </div>
                      <h2 className="mb-2 text-xl font-bold text-white">{post.title}</h2>
                      <p className="mb-6 line-clamp-2 text-sm text-slate-400">{post.description}</p>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-primary">
                        Chi tiết <FiChevronRight />
                      </button>
                    </div>
                </div>
                ))} */}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-5 rounded-lg border border-white/5 bg-white/[0.02] p-4 backdrop-blur-3xl duration-700 md:p-12">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-3xl font-black text-white">Hồ sơ</h3>
                    <p className="mt-1 text-sm text-slate-500">Tùy chỉnh thông tin nhận diện cá nhân và các liên kết mạng xã hội.</p>
                  </div>
                  <Button
                    size="md"
                    onClick={onSave}
                    disabled={isSaving}
                    className="rounded-lg text-lg font-bold text-green-600 shadow-md shadow-primary/20 transition-transform hover:scale-[1.05]"
                  >
                    {isSaving ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        <FiSave /> Lưu hồ sơ
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                  {/* Tên & Username */}
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Tên hiển thị</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        placeholder="Tên của bạn"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Username/ID tài khoản</label>
                    <div className="relative">
                      <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        placeholder="nguonnhagiare.vn/..."
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Liên lạc */}
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Hotline</label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        placeholder="Nhập số điện thoại"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Zalo Connect</label>
                    <div className="relative">
                      <SiZalo className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                      <input
                        placeholder="Nhập số điện thoại"
                        name="zaloNumber"
                        value={formData.zaloNumber}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Viber Number</label>
                    <div className="relative">
                      <SiViber className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                      <input
                        placeholder="Nhập số điện thoại"
                        name="viberNumber"
                        value={formData.viberNumber}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Mạng xã hội */}
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Facebook ID</label>
                    <div className="relative">
                      <FiFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        placeholder="https://www.facebook.com/..."
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Messenger ID</label>
                    <div className="relative">
                      <SiMessenger className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                      <input
                        placeholder="https://www.messenger.com/t/..."
                        name="messenger"
                        value={formData.messenger}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Instagram ID</label>
                    <div className="relative">
                      <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        placeholder="https://www.instagram.com/..."
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="input w-full border-white/5 bg-overlay pl-12 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Bio Full-width */}
                  <div className="form-control md:col-span-2 lg:col-span-3">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500">Bio / Summary</label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-4 top-4 text-primary" />
                      <textarea
                        name="aboutMe"
                        value={formData.aboutMe}
                        onChange={handleInputChange}
                        className="textarea h-32 w-full border-white/5 bg-overlay pl-12 pt-3 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
