'use client';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import { FaPhoneAlt, FaFacebookF, FaInstagram, FaFacebookMessenger, FaViber, FaCheckCircle } from 'react-icons/fa';
import { IRentalAuthor } from '@/types/type/rentalAdmin/rentalAdmin';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import { images } from '../../../../../public/images';

interface Props {
  author?: IRentalAuthor;
}

export default function AuthorProfileCard({ author }: Props) {
  // 1. Validation Logic: Fail fast nếu không có dữ liệu
  if (!author || !author.profile) return null;

  const { profile } = author;

  // 2. Data Preparation: Xử lý dữ liệu trước khi render (Performance)
  const displayName = profile.displayName || 'Người đăng';
  const username = profile.username || 'user';
  const avatarUrl = profile.avatar || '/images/default-avatar.png'; // Fallback image

  // Memoize số điện thoại để tránh tính toán lại không cần thiết khi re-render
  const formattedPhone = useMemo(() => formatPhoneNumber(profile.phoneNumber), [profile.phoneNumber]);

  const hasSocials = profile.facebook || profile.instagram;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-start gap-2">
        <div className="relative shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="64px"
            />
          </div>
          <span className="absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" title="Online" />
        </div>

        <div className="flex flex-col pt-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-slate-800">{displayName}</h3>
            <FaCheckCircle className="text-sm text-blue-500" title="Đã xác thực" />
          </div>
          <p className="text-xs font-medium text-slate-400">@{username}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative rounded-xl bg-slate-50 p-3">
          <span className="absolute -top-2 left-4 select-none text-4xl leading-none text-slate-200">“</span>
          <p className="relative z-10 line-clamp-3 text-sm italic leading-relaxed text-slate-600">
            {profile.aboutMe || 'Xin chào, tôi sẵn sàng hỗ trợ bạn tìm được căn hộ ưng ý nhất.'}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {profile.phoneNumber && (
          <a
            href={`tel:${profile.phoneNumber}`}
            className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            <div className="animate-wiggle-more rounded-full bg-white/20 p-2">
              <FaPhoneAlt className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-wide">{formattedPhone}</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          {profile.zaloNumber && (
            <Button
              onClick={() => window.open(`https://zalo.me/${profile.zaloNumber}`, '_blank')}
              className="flex h-11 items-center gap-2 border-blue-100 bg-blue-50 font-semibold text-blue-700 hover:border-blue-200 hover:bg-blue-100"
            >
              <Image src={images.LogoZalo} width={25} height={25} alt="" /> Chat Zalo
            </Button>
          )}

          {profile.viberNumber ? (
            <Button
              onClick={() => window.open(`viber://chat?number=${profile.viberNumber}`, '_blank')}
              className="flex h-11 items-center gap-2 border-purple-100 bg-purple-50 font-semibold text-purple-700 hover:border-purple-200 hover:bg-purple-100"
            >
              <FaViber className="text-xl" />
              Viber
            </Button>
          ) : (
            profile.messenger && (
              <Button
                onClick={() => window.open(profile.messenger, '_blank')}
                className="flex h-11 items-center gap-2 border-blue-100 bg-blue-50 font-semibold text-blue-600 hover:border-blue-200 hover:bg-blue-100"
              >
                <FaFacebookMessenger className="text-xl" />
                Messenger
              </Button>
            )
          )}
        </div>
      </div>

      {/* --- FOOTER: Social Links --- */}
      {hasSocials && (
        <>
          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Socials</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="flex justify-center gap-4">
            {profile.facebook && (
              <SocialIconLink
                href={profile.facebook}
                icon={<FaFacebookF />}
                colorClass="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white"
                label="Facebook"
              />
            )}
            {profile.instagram && (
              <SocialIconLink
                href={profile.instagram}
                icon={<FaInstagram />}
                colorClass="text-pink-600 bg-pink-50 hover:bg-pink-600 hover:text-white"
                label="Instagram"
              />
            )}
            {profile.messenger && !profile.viberNumber && (
              <SocialIconLink
                href={profile.messenger}
                icon={<FaFacebookMessenger />}
                colorClass="text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white"
                label="Messenger"
              />
            )}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

const SocialIconLink = ({ href, icon, colorClass, label }: { href: string; icon: React.ReactNode; colorClass: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${colorClass}`}
  >
    {icon}
  </a>
);
