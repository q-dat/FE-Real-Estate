'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth.service';
import LoginBootLoading from '@/components/auth/LoginBootLoading';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';
import clsx from 'clsx';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { ACCESS_TOKEN_KEY } from '..';

type Status = 'booting' | 'ready' | 'submitting';
type UserRole = 'user' | 'admin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('booting');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const isValidEmail = EMAIL_REGEX.test(email);
  const isValid = isValidEmail && password.length > 0;
  const isReady = status === 'ready';

  /* Boot check */
  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const healthRes = await fetch('/api/health', { cache: 'no-store' });
        if (!healthRes.ok) throw new Error();
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setTimeout(checkHealth, 1500);
      }
    };

    checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Submit */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !isValid) return;

    try {
      setStatus('submitting');

      const loginRes = await authService.login({ email, password });
      const token = loginRes.data?.token;
      if (!token) throw new Error('Token không tồn tại');

      localStorage.setItem(`${ACCESS_TOKEN_KEY}`, token);

      const meRes = await authService.me(token);
      const role = meRes.data.role as UserRole;

      if (role === 'user') {
        router.replace('/');
      } else {
        router.replace('/cms/admin/dashboard');
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Đăng nhập thất bại');
      setStatus('ready');
    }
  };

  if (status === 'booting') {
    return <LoginBootLoading />;
  }

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

              <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">Đăng Nhập</h1>

              <p className="text-sm font-medium text-gray-400">Chào mừng bạn quay lại</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled={!isReady}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="admin@company.com"
                  className={clsx(
                    'w-full rounded-xl border bg-black/20 px-12 py-3.5 text-sm text-white outline-none transition-all',
                    'border-white/10 focus:ring-4',
                    isValidEmail
                      ? 'focus:border-emerald-500/50 focus:ring-emerald-500/10'
                      : touched
                        ? 'border-red-500/40 focus:border-red-500 focus:ring-red-500/10'
                        : 'focus:border-emerald-500/50 focus:ring-emerald-500/10',
                    !isReady && 'opacity-60'
                  )}
                />
              </div>

              {/* Password */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  disabled={!isReady}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-12 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || status === 'submitting'}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3.5 font-bold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span className="relative z-10">Xác nhận</span>
                    <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {touched && !isValidEmail && <p className="mt-2 text-xs font-medium text-red-400">Email không đúng định dạng</p>}

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
