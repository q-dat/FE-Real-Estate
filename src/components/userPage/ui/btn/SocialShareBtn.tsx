'use client';

import { useState } from 'react';
import { Button } from 'react-daisyui';
import { IoShareSocial } from 'react-icons/io5';
import { buildShareLink, SharePlatform } from '@/lib/social-share';

interface Props {
  fullPath: string; // ví dụ: /slug/id
  title: string;
  size?: 'xs' | 'sm' | 'md';
}

const PLATFORMS: SharePlatform[] = [
  'facebook',
  'zalo',
  'twitter',
  'linkedin',
  'reddit',
  'whatsapp',
  'telegram',
  'pinterest',
  'email',
];

export default function SocialShareBtn({
  fullPath,
  title,
  size = 'sm',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={size}
        shape="circle"
        className="text-blue-600 transition-transform xl:hover:scale-125"
        onClick={() => setOpen(true)}
      >
        <IoShareSocial size={20} />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Chia sẻ bài viết
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <a
                  key={platform}
                  href={buildShareLink(platform, fullPath, title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-medium capitalize text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
