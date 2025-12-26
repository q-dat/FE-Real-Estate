'use client';
import { authService } from '@/services/auth.service';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    await authService.register({ email, password });
    alert('Đăng ký thành công');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Đăng ký</h2>

          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full" onClick={onSubmit}>
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
