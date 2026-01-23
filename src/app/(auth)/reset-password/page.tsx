'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';
import clsx from 'clsx';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValidEmail = EMAIL_REGEX.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !isValidEmail) return;

    try {
      setLoading(true);
      await authService.resetPassword(email);

      // Flow chuẩn: sang confirm reset + gán email
      router.push(`/confirm-reset-password?email=${encodeURIComponent(email)}`);
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'circOut' }}
        className="z-10 w-full max-w-[420px] px-2"
      >
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-overlay shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          <div className="animate-border-flow pointer-events-none absolute -inset-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative p-5 pt-10">
            {/* Header */}
            <div className="mb-6 space-y-2 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 shadow-[0_0_30px_-5px_rgba(168,85,247,0.35)]"
              >
                <KeyRound className="h-6 w-6 text-purple-400" />
              </motion.div>

              <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Khôi phục mật khẩu
              </h1>

              <p className="text-sm font-medium text-gray-400">Nhập email đã đăng ký để nhận mã xác thực</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="name@work-email.com"
                  disabled={loading}
                  className={clsx(
                    'w-full rounded-xl border bg-black/20 px-12 py-3.5 text-sm text-white shadow-inner outline-none transition-all',
                    'border-white/10 focus:ring-4',
                    isValidEmail
                      ? 'focus:border-purple-500/50 focus:ring-purple-500/10'
                      : touched
                        ? 'border-red-500/40 focus:border-red-500 focus:ring-red-500/10'
                        : 'focus:border-purple-500/50 focus:ring-purple-500/10',
                    loading && 'opacity-60'
                  )}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isValidEmail}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 font-bold text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] transition-all duration-300 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span className="relative z-10">Gửi mã xác thực</span>
                    <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  </>
                )}
                <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            </form>

            {touched && !isValidEmail && <p className="pl-1 text-xs font-medium text-red-400">Email không đúng định dạng</p>}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Nguonnhagiare.vn</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
