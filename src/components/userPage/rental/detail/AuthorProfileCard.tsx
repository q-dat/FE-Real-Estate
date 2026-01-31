'use client';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import { FaPhoneAlt, FaFacebookF, FaInstagram, FaFacebookMessenger, FaViber } from 'react-icons/fa';
import { IRentalAuthor } from '@/types/rentalAdmin/rentalAdmin.types';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber.utils';
import { images } from '../../../../../public/images';
import { HiCheckBadge } from 'react-icons/hi2';

interface Props {
  author?: IRentalAuthor;
}

export default function AuthorProfileCard({ author }: Props) {
  if (!author || !author.profile) return null;

  const { profile } = author;
  const displayName = profile.displayName || 'Người đăng';
  const username = profile.username || 'user';
  const avatarUrl = profile.avatar || '/images/default-avatar.png';

  const formattedPhone = useMemo(() => formatPhoneNumber(profile.phoneNumber), [profile.phoneNumber]);

  const secondaryAction = profile.viberNumber
    ? { type: 'viber', link: `viber://chat?number=${profile.viberNumber}`, icon: <FaViber />, label: 'Viber' }
    : profile.messenger
      ? { type: 'messenger', link: profile.messenger, icon: <FaFacebookMessenger />, label: 'Messenger' }
      : null;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      {/*  HEADER: Compact & Info */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-100 shadow-sm">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="48px" />
          </div>
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 ring-1 ring-white" />
        </div>

        {/* Info & Socials Inline */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-px truncate text-sm font-bold text-slate-900">
                {displayName}
                <HiCheckBadge size={14} className="shrink-0 text-blue-500" title="Đã xác thực" />
              </h3>
              <p className="truncate text-[11px] text-slate-400">@{username}</p>
            </div>

            {/* Mini Social Icons Row */}
            <div className="flex items-end gap-1.5">
              <span className="text-[10px] font-semibold">Theo dõi</span>
              {profile.facebook && <MiniSocialBtn href={profile.facebook} icon={<FaFacebookF />} color="text-blue-600 bg-blue-50" />}
              {profile.instagram && <MiniSocialBtn href={profile.instagram} icon={<FaInstagram />} color="text-pink-600 bg-pink-50" />}
            </div>
          </div>
        </div>
      </div>

      {/* BIO: Minimal Text */}
      {profile.aboutMe && (
        <div className="relative mt-2 rounded-xl bg-slate-50 p-2">
          <span className="absolute -top-2 left-4 select-none text-4xl leading-none text-slate-200">“</span>
          <p className="relative z-10 line-clamp-3 text-sm italic leading-relaxed text-slate-600">
            {profile.aboutMe || 'Xin chào, tôi sẵn sàng hỗ trợ bạn tìm được căn hộ ưng ý nhất.'}
          </p>
        </div>
      )}

      {/* ACTIONS: Dense Grid */}
      <div className="mt-2 flex flex-col gap-2">
        {/* Nút Gọi: Full Width */}
        {profile.phoneNumber && (
          <div className="tooltip tooltip-top tooltip-primary" data-tip="Bấm để gọi ngay">
            <a
              href={`tel:${profile.phoneNumber}`}
              className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-2.5 text-white shadow-blue-100 transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
            >
              <FaPhoneAlt className="animate-wiggle text-sm" />
              <span className="text-sm font-bold tracking-wide">{formattedPhone}</span>
            </a>
          </div>
        )}

        {/* Zalo & Secondary */}
        <div className="grid grid-cols-2 gap-2">
          {/* Zalo */}
          {profile.zaloNumber && (
            <Button
              size="sm"
              onClick={() => window.open(`https://zalo.me/${profile.zaloNumber}`, '_blank')}
              className="flex h-9 items-center gap-1.5 rounded-lg border-blue-100 bg-blue-50 px-2 text-xs font-bold text-blue-700 hover:border-blue-200 hover:bg-blue-100 focus:outline-none"
            >
              <div className="relative h-5 w-5 shrink-0">
                <Image src={images.LogoZalo} alt="Zalo" fill className="object-contain" />
              </div>
              Chat Zalo
            </Button>
          )}

          {/* Viber / Messenger */}
          {secondaryAction && (
            <Button
              size="sm"
              onClick={() => window.open(secondaryAction.link, '_blank')}
              className={`flex h-9 items-center gap-1.5 rounded-lg border-slate-100 bg-slate-50 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none`}
            >
              <span className={secondaryAction.type === 'viber' ? 'text-purple-600' : 'text-blue-600'}>{secondaryAction.icon}</span>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const MiniSocialBtn = ({ href, icon, color }: { href: string; icon: React.ReactNode; color: string }) => (
  <a
    href={href}
    target="_blank"
    className={`flex h-6 w-6 items-center justify-center rounded-md border border-primary-lighter text-xs transition-transform hover:-translate-y-0.5 ${color}`}
  >
    {icon}
  </a>
);
