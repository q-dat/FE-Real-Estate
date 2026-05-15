import { slugify } from '@/lib/slugify';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { Metadata } from 'next';

const SITE_NAME = 'Nguồn Nhà Giá Rẻ';
const DEFAULT_SITE_URL = 'https://www.nguonnhagiare.vn';
const DEFAULT_IMAGE = '/images/default-thumbnail.jpg';

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

function toIsoDate(date?: Date | string): string | undefined {
  if (!date) return undefined;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function getPostCanonicalUrl(post: IRentalPostAdmin): string {
  const siteUrl = getSiteUrl();
  const slug = slugify(post.title || 'bat-dong-san');

  return `${siteUrl}/${slug}-${post._id}`;
}

function getAbsoluteImageUrl(image?: string): string {
  const siteUrl = getSiteUrl();
  const safeImage = image?.trim();

  if (!safeImage) return `${siteUrl}${DEFAULT_IMAGE}`;
  if (safeImage.startsWith('http://') || safeImage.startsWith('https://')) return safeImage;

  return `${siteUrl}${safeImage.startsWith('/') ? safeImage : `/${safeImage}`}`;
}

function formatPriceText(post: IRentalPostAdmin): string {
  if (!post.price || !post.priceUnit) return '';

  return `${post.price} ${post.priceUnit}`;
}

function formatAreaText(post: IRentalPostAdmin): string {
  if (!post.area) return '';

  return `${post.area}m²`;
}

function formatLocationText(post: IRentalPostAdmin): string {
  return [post.ward, post.district, post.province].filter(Boolean).join(', ');
}

function buildKeywords(post: IRentalPostAdmin): string[] {
  const categoryName = post.category?.name || '';
  const locationText = formatLocationText(post);
  const district = post.district || '';
  const province = post.province || '';
  const propertyType = post.propertyType || '';
  const locationType = post.locationType || '';

  const rawKeywords = [
    post.title,
    categoryName,
    propertyType,
    locationType,
    locationText,
    district ? `bất động sản ${district}` : '',
    province ? `nhà đất ${province}` : '',
    district ? `nhà đất ${district}` : '',
    'nguồn nhà giá rẻ',
    'bất động sản',
    'nhà đất',
  ].filter(Boolean);

  return normalizeKeywords(rawKeywords).slice(0, 12);
}

function buildMetaTitle(post: IRentalPostAdmin): string {
  const titleText = stripHtml(post.title || 'Bất động sản');
  const priceText = formatPriceText(post);
  const areaText = formatAreaText(post);
  const districtText = post.district || '';

  const compactParts = [titleText, priceText, areaText, districtText].filter(Boolean);
  const compactTitle = compactParts.join(' | ');

  return `${truncateText(compactTitle, 58)} | ${SITE_NAME}`;
}

function buildMetaDescription(post: IRentalPostAdmin): string {
  const cleanDescription = stripHtml(post.description);

  if (cleanDescription) {
    return truncateText(cleanDescription, 155);
  }

  const fallbackParts = [
    post.title,
    post.category?.name,
    post.area ? `Diện tích ${post.area}m²` : '',
    post.price && post.priceUnit ? `Giá ${post.price} ${post.priceUnit}` : '',
    formatLocationText(post),
  ].filter(Boolean);

  return truncateText(fallbackParts.join('. '), 155);
}

function getNoIndexMetadata(): Metadata {
  return {
    title: `Không tìm thấy bất động sản | ${SITE_NAME}`,
    description: 'Bất động sản không tồn tại, đã hết hạn hoặc đang tạm ẩn.',
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export function generateRentalPostMetadata(post: IRentalPostAdmin | null): Metadata {
  if (!post || post.status !== 'active') {
    return getNoIndexMetadata();
  }

  const canonicalUrl = getPostCanonicalUrl(post);
  const title = buildMetaTitle(post);
  const description = buildMetaDescription(post);
  const keywords = buildKeywords(post);

  const images =
    post.images?.length > 0
      ? post.images.slice(0, 6).map((image) => ({
          url: getAbsoluteImageUrl(image),
          width: 1200,
          height: 630,
          alt: post.title || SITE_NAME,
        }))
      : [
          {
            url: getAbsoluteImageUrl(),
            width: 1200,
            height: 630,
            alt: SITE_NAME,
          },
        ];

  const publishedTime = toIsoDate(post.postedAt || post.createdAt);
  const modifiedTime = toIsoDate(post.updatedAt) || publishedTime;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'vi_VN',
      images,
      publishedTime,
      modifiedTime,
      authors: [SITE_NAME],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((image) => image.url),
    },
    other: {
      author: SITE_NAME,
      publisher: SITE_NAME,
      classification: 'Bất động sản Việt Nam',
      area: 'Nhà đất và bất động sản',
      placename: formatLocationText(post) || 'Việt Nam',
      distribution: 'Global',
      referrer: 'no-referrer-when-downgrade',
    },
  };
}