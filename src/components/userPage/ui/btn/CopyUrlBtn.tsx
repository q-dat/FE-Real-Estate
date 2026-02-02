'use client';
import { Toastify } from '@/helper/Toastify';
import { useState } from 'react';
import { Button, ButtonProps } from 'react-daisyui';
import { BiLink } from 'react-icons/bi';
import { TbCopyCheck } from 'react-icons/tb';

export interface CopyUrlBtnProps extends ButtonProps {
  url: string;
}

export default function CopyUrlBtn({ url, ...props }: CopyUrlBtnProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      Toastify('Đã sao chép liên kết vào clipboard', 200);
    } catch (error) {
      console.error('Copy URL failed', error);
      Toastify('Không thể sao chép liên kết', 400);
    }
  };

  return (
    <div className="w-fit xl:tooltip xl:tooltip-top xl:tooltip-primary" data-tip="Sao chép liên kết">
      <Button {...props} shape="circle" className="text-primary xl:hover:scale-125" onClick={handleCopy}>
        <span className="font-semibold">{copied ? <TbCopyCheck size={20} /> : <BiLink size={20} />}</span>
      </Button>
    </div>
  );
}
