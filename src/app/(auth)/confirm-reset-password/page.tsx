'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';

function ConfirmResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy email từ URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6 || !newPassword || loading) return;

    try {
      setLoading(true);
      await authService.confirmResetPassword(email, otp, newPassword);
      alert('Đặt lại mật khẩu thành công');
      router.replace('/auth?tab=login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl"
      >
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-1 w-1/2 -translate-x-1/2 bg-purple-500/50 blur-[20px]" />

        <div className="p-8 pt-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-tr from-purple-500/20 to-pink-600/20 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]"
          >
            <ShieldCheck className="h-8 w-8 text-purple-400" />
          </motion.div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">Xác nhận đặt lại mật khẩu</h1>

          <p className="mb-8 text-sm text-gray-400">
            Mã OTP đã được gửi tới <br />
            <span className="rounded border border-purple-500/20 bg-purple-950/30 px-2 py-0.5 font-mono font-medium text-purple-400">
              {email || 'your email'}
            </span>
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* OTP – giống Verify */}
            <div className="space-y-2 text-left">
              <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Enter 6-Digit Code</label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400">
                  <Lock size={18} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-center font-mono text-2xl font-bold tracking-[0.5em] text-white shadow-inner outline-none transition-all placeholder:tracking-[0.5em] placeholder:text-gray-700 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-12 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10"
              />
            </div>

            {/* Submit */}
            <button
              disabled={loading || otp.length < 6 || !newPassword}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 font-bold text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] transition-all hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="relative z-10">Xác nhận</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </>
              )}
              <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConfirmResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center font-sans text-white">
      <CyberBackground />
      <Suspense fallback={<div className="animate-pulse text-purple-500">Initializing Secure Channel...</div>}>
        <ConfirmResetContent />
      </Suspense>
    </div>
  );
}
