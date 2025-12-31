'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { clsx } from 'clsx';
import { CyberBackground } from '@/components/auth/motion/CyberBackground';
import LoginBootLoading from '@/components/auth/LoginBootLoading';

type AuthTab = 'login' | 'register';
type Status = 'booting' | 'ready' | 'submitting';

export default function AuthPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>('booting');
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Boot logic (server health)
  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error();

        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) {
          setTimeout(checkHealth, 1500);
        }
      }
    };

    checkHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  // Submit handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== 'ready') return;
    if (!email || !password) return;

    try {
      setStatus('submitting');

      if (activeTab === 'login') {
        const res = await authService.login({ email, password });

        if (!res.data?.token) {
          throw new Error('Token không tồn tại');
        }

        localStorage.setItem('token', res.data.token);
        router.replace('/cms/admin/dashboard');
      } else {
        await authService.register({ email, password });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Authentication failed');
      setStatus('ready');
    }
  };

  // Boot UI
  if (status === 'booting') {
    return <LoginBootLoading />;
  }

  const isDisabled = status !== 'ready';
  const isSubmitting = status === 'submitting';

  // Auth UI
  return (
    <div className="relative flex min-h-screen items-center justify-center font-sans text-white">
      <CyberBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'circOut' }}
        className="z-10 w-full max-w-[420px] px-2"
      >
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          <div className="animate-border-flow pointer-events-none absolute -inset-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative p-5 pt-10">
            {/* Header */}
            <div className="mb-5 space-y-2 text-center">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]"
              >
                {activeTab === 'login' ? <ShieldCheck className="h-6 w-6 text-cyan-400" /> : <Zap className="h-6 w-6 text-purple-400" />}
              </motion.div>

              <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>

              <p className="text-sm font-medium text-gray-400">
                {activeTab === 'login' ? 'Enter your credentials to access.' : 'Start your digital journey today.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-white/5 p-1">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={isSubmitting}
                  className="relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50"
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg border border-white/10 bg-white/10 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className={clsx('relative z-10 capitalize', activeTab === tab ? 'text-white' : 'text-gray-500')}>{tab}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                {/* Email */}
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled={isDisabled}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@work-email.com"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-12 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-60"
                  />
                </div>

                {/* Password */}
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    disabled={isDisabled}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-12 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    disabled={isDisabled}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-white disabled:opacity-40"
                  >
                    {showPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={isDisabled}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 font-bold text-white transition-all hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span className="relative z-10">{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
