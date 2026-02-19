export type SharePlatform = 'facebook' | 'zalo' | 'twitter' | 'linkedin' | 'reddit' | 'whatsapp' | 'telegram' | 'pinterest' | 'email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

const PREFIX_MAP: Record<SharePlatform, string> = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_SHARE_URL ?? '',
  zalo: process.env.NEXT_PUBLIC_ZALO_SHARE_URL ?? '',
  twitter: process.env.NEXT_PUBLIC_TWITTER_SHARE_URL ?? '',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_SHARE_URL ?? '',
  reddit: process.env.NEXT_PUBLIC_REDDIT_SHARE_URL ?? '',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_SHARE_URL ?? '',
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_SHARE_URL ?? '',
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_SHARE_URL ?? '',
  email: process.env.NEXT_PUBLIC_EMAIL_SHARE_URL ?? '',
};

export const buildFullUrl = (path: string): string => {
  return `${SITE_URL}${path}`;
};

export const buildShareLink = (platform: SharePlatform, path: string, title?: string): string => {
  const fullUrl = buildFullUrl(path);
  const encodedUrl = encodeURIComponent(fullUrl);
  const prefix = PREFIX_MAP[platform];

  if (!prefix) return fullUrl;

  // Email đặc biệt: body + title
  if (platform === 'email') {
    const encodedTitle = encodeURIComponent(title ?? '');
    return `${prefix}${encodedTitle}%20${encodedUrl}`;
  }

  // WhatsApp dùng text thay vì url param
  if (platform === 'whatsapp') {
    return `${prefix}${encodeURIComponent(`${title ?? ''} ${fullUrl}`)}`;
  }

  // Twitter thêm text
  if (platform === 'twitter') {
    const encodedTitle = encodeURIComponent(title ?? '');
    return `${prefix}${encodedUrl}&text=${encodedTitle}`;
  }

  return `${prefix}${encodedUrl}`;
};
