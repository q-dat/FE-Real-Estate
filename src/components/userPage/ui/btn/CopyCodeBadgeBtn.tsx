'use client';
import { useState } from 'react';
import { Badge } from 'react-daisyui';
import { Toastify } from '@/helper/Toastify';
import { copyToClipboard } from '@/lib/clipboard';

interface CopyCodeBadgeBtnProps {
  code: string;
}

export default function CopyCodeBadgeBtn({ code }: CopyCodeBadgeBtnProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      Toastify('Đã sao chép mã bài đăng vào clipboard', 200);
    } else {
      Toastify('Không thể sao chép mã bài đăng', 400);
    }
  };

  return (
    <div className="w-fit xl:tooltip xl:tooltip-top xl:tooltip-primary" data-tip="Sao chép mã bài đăng">
      <Badge
        className="text-md cursor-pointer whitespace-nowrap border border-primary p-4 font-medium text-primary transition xl:hover:scale-110"
        onClick={handleCopy}
      >
        {copied ? 'Đã sao chép' : `#${code}`}
      </Badge>
    </div>
  );
}
