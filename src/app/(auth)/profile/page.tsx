'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zaloNumber, setZaloNumber] = useState('');

  const onSubmit = async () => {
    const token = localStorage.getItem('token') || '';

    await authService.updateProfile(
      {
        avatar: avatar || undefined,
        phoneNumber,
        zaloNumber,
      },
      token
    );

    alert('Cập nhật profile thành công');
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Hồ sơ cá nhân</h2>

          <input type="file" className="file-input file-input-bordered w-full" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />

          <input
            className="input input-bordered w-full"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <input className="input input-bordered w-full" placeholder="Zalo" value={zaloNumber} onChange={(e) => setZaloNumber(e.target.value)} />

          <button className="btn btn-primary w-full" onClick={onSubmit}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
