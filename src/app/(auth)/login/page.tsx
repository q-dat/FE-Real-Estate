'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import LoginBootLoading from '@/components/auth/LoginBootLoading';

type Status = 'booting' | 'ready' | 'submitting';

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('booting');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        /* Check server health */
        const healthRes = await fetch('/api/health', { cache: 'no-store' });
        if (!healthRes.ok) throw new Error();
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

  const onSubmit = async () => {
    try {
      setStatus('submitting');

      const loginRes = await authService.login({ email, password });

      if (!loginRes.data?.token) {
        throw new Error('Token không tồn tại');
      }

      localStorage.setItem('token', loginRes.data.token);

      router.replace('/cms/admin/dashboard');
    } catch (error: unknown) {
      alert((error as Error).message || 'Đăng nhập thất bại');
      setStatus('ready');
    }
  };

  /* Boot UI */
  if (status === 'booting') {
    return <LoginBootLoading />;
  }

  /* Login UI */
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h2 className="text-xl font-semibold">Đăng nhập CMS</h2>

          <input
            className="input input-bordered w-full"
            placeholder="Email"
            value={email}
            disabled={status !== 'ready'}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu"
            value={password}
            disabled={status !== 'ready'}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full" onClick={onSubmit} disabled={status !== 'ready'}>
            {status === 'submitting' ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
