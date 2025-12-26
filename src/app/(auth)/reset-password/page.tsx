'use client';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
      alert('OTP đặt lại mật khẩu đã được gửi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-semibold">Quên mật khẩu</h1>

          <p className="text-sm text-gray-500">Nhập email đã đăng ký để nhận mã đặt lại mật khẩu</p>

          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <button className="btn btn-primary w-full" disabled={loading || !email} onClick={onSubmit}>
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}
