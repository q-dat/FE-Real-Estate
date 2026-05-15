import { slugify } from '@/lib/slugify';
import { IPost } from '@/types/post/post.types';
import { Metadata } from 'next';

const SITE_NAME = 'Nguồn Nhà Giá Rẻ';
const DEFAULT_SITE_URL = 'https://www.nguonnhagiare.vn';
const DEFAULT_IMAGE = '/images/news-default-thumbnail.jpg';

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function stripHtml(input?: string): string {
  return (input || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(input: string, maxLength: number): string {
  const safeInput = input.trim();

  if (safeInput.length <= maxLength) return safeInput;

  const sliced = safeInput.slice(0, maxLength).trim();
  const lastSpaceIndex = sliced.lastIndexOf(' ');
  const safeText = lastSpaceIndex > 80 ? sliced.slice(0, lastSpaceIndex) : sliced;

  return `${safeText}...`;
}

function normalizeKeywords(input: readonly string[]): string[] {
  return Array.from(new Set(input.map((item) => item.toLowerCase().trim()).filter((item) => item.length >= 2)));
}

function buildNewsKeywords(post: IPost): string[] {
  const catalogName = post.catalog?.name || '';

  const rawKeywords = [
    post.title,
    catalogName,
    'nguồn nhà giá rẻ',
    'tin tức bất động sản',
    'thị trường bất động sản',
    'kinh nghiệm mua nhà',
    'kiến thức nhà đất',
  ].filter(Boolean);

  return normalizeKeywords(rawKeywords).slice(0, 12);
}

function getPostCanonicalUrl(post: IPost): string {
  const siteUrl = getSiteUrl();
  const slug = post.slug || slugify(post.title || 'tin-tuc');

  return `${siteUrl}/tin-tuc/${slug}-${post._id}`;
}

function getAbsoluteImageUrl(image?: string): string {
  const siteUrl = getSiteUrl();
  const safeImage = image?.trim();

  if (!safeImage) return `${siteUrl}${DEFAULT_IMAGE}`;
  if (safeImage.startsWith('http://') || safeImage.startsWith('https://')) return safeImage;

  return `${siteUrl}${safeImage.startsWith('/') ? safeImage : `/${safeImage}`}`;
}

function toIsoDate(date?: Date | string): string | undefined {
  if (!date) return undefined;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

export function generateNewsPostMetadata(post: IPost): Metadata {
  const canonicalUrl = getPostCanonicalUrl(post);

  const titleText = stripHtml(post.title || 'Tin tức bất động sản');
  const metaTitle = `${truncateText(titleText, 58)} | ${SITE_NAME}`;

  const rawDescription = stripHtml(post.content || titleText);
  const description = truncateText(rawDescription || 'Cập nhật tin tức bất động sản, kinh nghiệm mua nhà và kiến thức nhà đất.', 155);

  const imageUrl = getAbsoluteImageUrl(post.image);
  const publishedTime = toIsoDate(post.createdAt);
  const modifiedTime = toIsoDate(post.updatedAt) || publishedTime;

  return {
    title: metaTitle,
    description,
    keywords: buildNewsKeywords(post),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: metaTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'vi_VN',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: titleText,
        },
      ],
      publishedTime,
      modifiedTime,
      authors: [SITE_NAME],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description,
      images: [imageUrl],
    },
    other: {
      author: SITE_NAME,
      publisher: SITE_NAME,
      classification: 'Tin tức Bất động sản',
    },
  };
}
