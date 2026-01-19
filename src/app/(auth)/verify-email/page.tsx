'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    // Ưu tiên lấy từ standard query param (?email=...)
    const emailParam = searchParams.get('email');

    // Nếu URL dạng cũ (verify-email=...) có thể parse thủ công nếu cần thiết,
    // nhưng chuẩn nhất là router.push(`/auth/verify?email=${email}`)
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return;

    setLoading(true);
    try {
      await authService.verifyEmail(email, otp);
      // Success: Chuyển hướng login
      router.push('/auth?tab=login');
    } catch (error: unknown) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  //
  useEffect(() => {
    if (!email) return;

    authService.verifyEmailStatus(email).then((res) => {
      if (res.emailVerified) {
        setEmailVerified(true);
        setCooldown(null);
        return;
      }

      if (res.otpExists && typeof res.expiresIn === 'number') {
        setCooldown(res.expiresIn);
      } else {
        setCooldown(null);
      }
    });
  }, [email]);
  useEffect(() => {
    if (cooldown === null || cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((s) => (s !== null ? s - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const onResend = async () => {
    try {
      setCooldown(120);
      await authService.resendVerifyEmail(email);
      alert('OTP mới đã được gửi.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] px-4">
      {/* Glass Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl"
      >
        {/* Top Glow */}
        <div className="absolute left-1/2 top-0 h-1 w-1/2 -translate-x-1/2 bg-cyan-500/50 blur-[20px]" />

        <div className="p-8 pt-10 text-center">
          {/* Icon Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]"
          >
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </motion.div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">Security Verification</h1>
          <p className="mb-8 text-sm text-gray-400">
            We sent a secure OTP code to <br />
            <span className="rounded border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 font-mono font-medium text-cyan-400">
              {email || 'your email'}
            </span>
          </p>

          <form onSubmit={onVerify} className="space-y-6">
            {/* OTP Input - Styled High-End */}
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

            {/* Action Button */}
            <button
              disabled={emailVerified || loading || otp.length < 6}
              className="group relative flex w-full transform items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 font-bold text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] transition-all duration-300 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="relative z-10">Confirm Identity</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </>
              )}
              {/* Shine Effect */}
              <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6">
            {emailVerified ? (
              <p className="text-xs text-success">Email đã được xác thực.</p>
            ) : cooldown !== null && cooldown > 0 ? (
              <p className="text-xs text-gray-500">
                Resend available in <span className="font-mono">{cooldown}s</span>
              </p>
            ) : (
              <button onClick={onResend} className="text-xs font-semibold text-cyan-400 hover:underline">
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
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

      <Suspense fallback={<div className="animate-pulse text-cyan-500">Initializing Secure Channel...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
