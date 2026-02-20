'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-daisyui';
import { IoShareSocial } from 'react-icons/io5';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaRedditAlien, FaWhatsapp, FaTelegramPlane, FaPinterestP, FaEnvelope, FaLink } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { buildShareLink, buildFullUrl, SharePlatform } from '@/lib/social-share';
import Link from 'next/link';
import { IoCloseCircle } from 'react-icons/io5';

interface Props {
  fullPath: string;
  title: string;
  size?: 'xs' | 'sm' | 'md';
}

interface PlatformConfig {
  key: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const PLATFORMS: PlatformConfig[] = [
  { key: 'facebook', label: 'Facebook', icon: <FaFacebookF />, color: 'bg-[#1877F2]' },
  { key: 'zalo', label: 'Zalo', icon: <SiZalo className="rounded-full border border-white p-px bg-white text-[#0068FF]"  />, color: 'bg-[#0068FF]' },
  { key: 'twitter', label: 'Twitter', icon: <FaTwitter />, color: 'bg-black' },
  { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedinIn />, color: 'bg-[#0A66C2]' },
  { key: 'reddit', label: 'Reddit', icon: <FaRedditAlien />, color: 'bg-[#FF4500]' },
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp />, color: 'bg-[#25D366]' },
  { key: 'telegram', label: 'Telegram', icon: <FaTelegramPlane />, color: 'bg-[#229ED9]' },
  { key: 'pinterest', label: 'Pinterest', icon: <FaPinterestP />, color: 'bg-[#E60023]' },
  { key: 'email', label: 'Email', icon: <FaEnvelope />, color: 'bg-slate-600' },
];

export default function SocialShareBtn({ fullPath, title, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const absoluteUrl = buildFullUrl(fullPath);

  const close = () => setOpen(false);

  // ESC + scroll lock
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open]);

  // click outside
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalRef.current?.contains(e.target as Node)) {
      close();
    }
  };

  // Web Share API (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title,
        url: absoluteUrl,
      });
      close();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const isNativeShareSupported = (): boolean => {
    if (typeof window === 'undefined') return false;

    return typeof window.navigator?.share === 'function';
  };

  return (
    <>
      <Button size={size} shape="circle" className="text-blue-600 transition-transform xl:hover:scale-125" onClick={() => setOpen(true)}>
        <IoShareSocial size={20} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999991] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm"
            onMouseDown={handleBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-md rounded-lg bg-white p-3 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Chia sẻ bài viết</h3>
                <button onClick={close} className="text-sm font-medium text-slate-400 hover:text-slate-700">
                  <IoCloseCircle size="25" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {PLATFORMS.map((platform) => (
                  <Link
                    key={platform.key}
                    href={buildShareLink(platform.key, fullPath, title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className={`flex flex-col items-center justify-center gap-1 rounded-md p-2 text-white shadow-md transition-transform duration-200 hover:scale-105 ${platform.color}`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-[8px] font-light">{platform.label}</span>
                  </Link>
                ))}

                {/* Copy Link */}
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center justify-center gap-2 rounded-md bg-slate-200 p-2 text-slate-800 shadow-md transition hover:bg-slate-300"
                >
                  <FaLink />
                  <span className="text-[8px] font-light">{copied ? 'Đã sao chép' : 'Copy link'}</span>
                </button>
              </div>

              {/* Native Share (mobile) */}
              {isNativeShareSupported() && (
                <Button
                  size="sm"
                  onClick={handleNativeShare}
                  className="mt-4 w-full rounded-xl bg-primary text-xs font-normal text-white hover:bg-primary/90 hover:opacity-90"
                >
                  Chia sẻ nhanh
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
