'use client';
import { otpService } from '@/services/owner/otp/otp.service';
import { OtpItem } from '@/types/auth/otp.types';
import { useEffect, useState } from 'react';

export default function OwnerOtpPage() {
  const [data, setData] = useState<OtpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    otpService
      .getAll()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="w-screen border-4 border-white xl:w-full">
      <div className="overflow-x-auto rounded-md border border-primary">
        <table className="table table-zebra">
          <thead>
            <tr className="text-xs uppercase">
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Expires</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {data.map((otp) => (
              <tr key={otp._id}>
                <td className="font-medium">{otp.email}</td>

                <td>{otp.type}</td>

                <td>
                  {(() => {
                    if (otp.isUsed) {
                      return <span className="text-success">Used</span>;
                    }

                    if (new Date(otp.expiresAt) < new Date()) {
                      return <span className="text-error">Expired</span>;
                    }

                    return <span className="text-warning">Active</span>;
                  })()}
                </td>

                <td>{otp.attempts}</td>

                <td>{new Date(otp.expiresAt).toLocaleString()}</td>

                <td>{new Date(otp.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
