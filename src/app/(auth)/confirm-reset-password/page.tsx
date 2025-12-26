'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function ConfirmResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await authService.confirmResetPassword(email, otp, newPassword);
      alert('Đặt lại mật khẩu thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-semibold">Xác nhận đặt lại mật khẩu</h1>

          <p className="text-sm text-gray-500">Nhập mã OTP đã gửi về email và mật khẩu mới</p>

          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input
            className="input input-bordered w-full text-center tracking-widest"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full" disabled={loading || !email || !otp || !newPassword} onClick={onSubmit}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
