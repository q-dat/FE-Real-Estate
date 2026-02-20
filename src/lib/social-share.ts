export type SharePlatform =
  | 'facebook'
  | 'zalo'
  | 'twitter'
  | 'linkedin'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'pinterest'
  | 'email';

const getSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/+$/, '');

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
  const base = getSiteUrl();

  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${base}${normalizedPath}`;
};

export const buildShareLink = (
  platform: SharePlatform,
  path: string,
  title?: string
): string => {
  const fullUrl = buildFullUrl(path);
  const prefix = PREFIX_MAP[platform];

  if (!prefix) return fullUrl;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title ?? '');

  switch (platform) {
    case 'email':
      return `${prefix}${encodedTitle}%20${encodedUrl}`;

    case 'whatsapp':
      return `${prefix}${encodeURIComponent(
        `${title ?? ''} ${fullUrl}`
      )}`;

    case 'twitter':
      return `${prefix}${encodedUrl}&text=${encodedTitle}`;

    default:
      return `${prefix}${encodedUrl}`;
  }
};
