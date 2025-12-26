'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const res = await authService.login({ email, password });

      if (!res?.data?.token) {
        throw new Error('Token không tồn tại');
      }

      localStorage.setItem('token', res.data.token);

      alert('Đăng nhập thành công');
      router.push('/profile');
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Đăng nhập</h2>

          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full" onClick={onSubmit} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
