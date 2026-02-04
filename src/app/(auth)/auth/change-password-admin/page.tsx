'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth/auth.service';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';
import clsx from 'clsx';
import { requireAdminToken } from '@/services/shared/adminAuth.client';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = oldPassword.length > 0 && newPassword.length >= 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    const token = requireAdminToken();

    try {
      setLoading(true);
      await authService.changePassword(oldPassword, newPassword, token);
      alert('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center font-sans text-white">
           {/* Home/Back */}
      <Link
        href="/"
        className="absolute left-2 top-2 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:pl-3 hover:shadow-lg hover:shadow-primary/20"
      >
        <FiArrowLeft size={14} /> Trang chủ
      </Link>
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'circOut' }}
        className="z-10 w-full max-w-[420px] px-2"
      >
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-overlay shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          <div className="animate-border-flow pointer-events-none absolute -inset-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative p-6 pt-10">
            {/* Header */}
            <div className="mb-6 space-y-2 text-center">
              <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)]">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>

              <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Đổi mật khẩu
              </h1>

              <p className="text-sm font-medium text-gray-400">Cập nhật mật khẩu để bảo vệ tài khoản quản trị</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Old password */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Mật khẩu hiện tại"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-12 py-3.5 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                />
              </div>

              {/* New password */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (≥ 3 ký tự)"
                  disabled={loading}
                  className={clsx(
                    'w-full rounded-xl border bg-black/20 px-12 py-3.5 text-sm text-white outline-none transition-all',
                    'border-white/10 focus:ring-4 focus:ring-emerald-500/10',
                    newPassword.length > 0 && newPassword.length < 3
                      ? 'border-red-500/40 focus:border-red-500 focus:ring-red-500/10'
                      : 'focus:border-emerald-500/50',
                    loading && 'opacity-60'
                  )}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3.5 font-bold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span className="relative z-10">Cập nhật mật khẩu</span>
                    <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Admin Security Zone</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
