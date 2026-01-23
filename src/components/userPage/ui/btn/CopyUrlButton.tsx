'use client';
import { useState } from 'react';
import { Button, ButtonProps } from 'react-daisyui';
import { BiLink } from 'react-icons/bi';
import { TbCopyCheck } from 'react-icons/tb';

export interface CopyUrlButtonProps extends ButtonProps {
  url: string;
}

export default function CopyUrlButton({ url, ...props }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy URL failed', error);
    }
  };

  return (
    <Button {...props} shape="circle" className="text-primary xl:hover:scale-125" onClick={handleCopy}>
      <span className="font-semibold">{copied ? <TbCopyCheck size={20} /> : <BiLink size={20} />}</span>
    </Button>
  );
}
