'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { requireAdminToken } from '@/services/shared/adminAuth.client';

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<File | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [instagram, setInstagram] = useState('');
  const [messenger, setMessenger] = useState('');
  const [facebook, setFacebook] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [zaloNumber, setZaloNumber] = useState('');
  const [viberNumber, setViberNumber] = useState('');

  const onSubmit = async () => {
    const token = requireAdminToken();

    await authService.updateProfile(
      {
        profile: {
          avatar: avatar ?? undefined,
          displayName,
          username,
          aboutMe,
          instagram,
          messenger,
          facebook,
          phoneNumber,
          zaloNumber,
          viberNumber,
        },
      },
      token
    );

    alert('Cập nhật profile thành công');
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body space-y-3">
          <h2 className="text-xl font-semibold">Hồ sơ cá nhân</h2>

          <input type="file" className="file-input file-input-bordered w-full" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />

          <input
            className="input input-bordered w-full"
            placeholder="Tên hiển thị"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <input className="input input-bordered w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Giới thiệu bản thân"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />

          <input className="input input-bordered w-full" placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />

          <input className="input input-bordered w-full" placeholder="Messenger" value={messenger} onChange={(e) => setMessenger(e.target.value)} />

          <input className="input input-bordered w-full" placeholder="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />

          <input
            className="input input-bordered w-full"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <input className="input input-bordered w-full" placeholder="Zalo" value={zaloNumber} onChange={(e) => setZaloNumber(e.target.value)} />

          <input className="input input-bordered w-full" placeholder="Viber" value={viberNumber} onChange={(e) => setViberNumber(e.target.value)} />

          <button className="btn btn-primary w-full" onClick={onSubmit}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
