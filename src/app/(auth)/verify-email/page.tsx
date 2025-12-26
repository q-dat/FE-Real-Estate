'use client';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await authService.verifyEmail(email, otp);
      alert('Xác thực email thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-semibold">Xác thực Email</h1>

          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input
            className="input input-bordered w-full text-center tracking-widest"
            placeholder="Nhập OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="btn btn-primary w-full" disabled={loading || !email || !otp} onClick={onSubmit}>
            Xác thực
          </button>
        </div>
      </div>
    </div>
  );
}
