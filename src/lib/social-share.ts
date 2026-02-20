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

const appendUtm = (url: string, platform: SharePlatform): string => {
  const hasQuery = url.includes('?');
  const utm = `utm_source=${platform}&utm_medium=social&utm_campaign=share`;
  return `${url}${hasQuery ? '&' : '?'}${utm}`;
};

export const buildFullUrl = (pathOrUrl: string): string => {
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  const base = getSiteUrl();
  const normalizedPath = pathOrUrl.startsWith('/')
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${base}${normalizedPath}`;
};

export const buildShareLink = (
  platform: SharePlatform,
  pathOrUrl: string,
  title?: string
): string => {
  const fullUrl = buildFullUrl(pathOrUrl);
  const trackedUrl = appendUtm(fullUrl, platform);
  const prefix = PREFIX_MAP[platform];

  if (!prefix) return trackedUrl;

  const encodedUrl = encodeURIComponent(trackedUrl);
  const encodedTitle = encodeURIComponent(title ?? '');

  switch (platform) {
    case 'email':
      return `${prefix}${encodedTitle}%20${encodedUrl}`;

    case 'whatsapp':
      return `${prefix}${encodeURIComponent(
        `${title ?? ''} ${trackedUrl}`
      )}`;

    case 'twitter':
      return `${prefix}${encodedUrl}&text=${encodedTitle}`;

    default:
      return `${prefix}${encodedUrl}`;
  }
};
