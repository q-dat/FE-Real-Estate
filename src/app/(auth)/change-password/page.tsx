'use client';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const token = localStorage.getItem('token') || '';

    try {
      setLoading(true);
      await authService.changePassword(oldPassword, newPassword, token);
      alert('Đổi mật khẩu thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-semibold">Đổi mật khẩu</h1>

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu hiện tại"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full" disabled={loading || !oldPassword || !newPassword} onClick={onSubmit}>
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}
