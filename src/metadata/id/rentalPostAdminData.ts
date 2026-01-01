import { slugify } from '@/lib/slugify';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { Metadata } from 'next';

function normalizeKeywords(input: string[]): string[] {
  return Array.from(
    new Set(
      input.flatMap((item) =>
        item
          .toLowerCase()
          .split(/[\s,]+/)
          .map((word) => word.trim())
          .filter(Boolean)
      )
    )
  );
}

function buildKeywords(post: IRentalPostAdmin): string[] {
  const base: string[] = [
    post.title,
    post.district,
    post.province,
    post.area ? `${post.area}m2` : '',
    post.price ? post.price.toString() : '',
    post.priceUnit,
  ].filter(Boolean) as string[];

  const categoryCode = post.category?.categoryCode;

  let rawKeywords: string[] = [];

  switch (categoryCode) {
    // Mua bán nhà đất
    case 0:
      rawKeywords = [...base, 'mua ban nha dat', 'ban nha dat', `ban nha ${post.district}`, `bat dong san ban ${post.province}`];
      break;

    // Căn hộ cho thuê
    case 1:
      rawKeywords = [...base, 'can ho cho thue', 'thue can ho', `cho thue can ho ${post.district}`, `can ho cho thue ${post.province}`];
      break;

    // Nhà nguyên căn cho thuê
    case 2:
      rawKeywords = [...base, 'nha nguyen can cho thue', 'thue nha nguyen can', `cho thue nha ${post.district}`, `nha cho thue ${post.province}`];
      break;

    // Cho thuê mặt bằng
    case 3:
      rawKeywords = [...base, 'cho thue mat bang', 'mat bang kinh doanh', `thue mat bang ${post.district}`, `mat bang ${post.province}`];
      break;

    default:
      rawKeywords = [...base, 'bat dong san', 'nha dat'];
  }

  return normalizeKeywords(rawKeywords);
}

export function generateRentalPostMetadata(post: IRentalPostAdmin): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';

  const slug = slugify(post.title);
  const canonicalUrl = `${siteUrl}/${slug}/${post._id}`;

  const keywords = buildKeywords(post).slice(0, 16); // Giới hạn từ khóa tối đa

  const title = [
    post.title,
    post.area ? `${post.area}m²` : null,
    post.price ? `${post.price.toLocaleString()} ${post.priceUnit}` : null,
    `${post.district}, ${post.province}`,
  ]
    .filter(Boolean)
    .join(' | ');

  const description =
    post.description?.slice(0, 160) ||
    `${post.category?.name || 'Bất động sản'} tại ${post.district}, ${post.province}. ${
      post.area ? `Diện tích ${post.area}m².` : ''
    } ${post.price ? `Giá ${post.price.toLocaleString()} ${post.priceUnit}.` : ''}`;

  const images =
    post.images?.length > 0
      ? post.images.map((img) => ({
          url: img.startsWith('http') ? img : `${siteUrl}${img}`,
          width: 1200,
          height: 630,
          alt: post.title,
        }))
      : [];

  return {
    title,
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteUrl,
      type: 'website',
      locale: 'vi_VN',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
    other: {
      audience: 'general',
      'resource-type': 'document',
      classification: 'Bất động sản Việt Nam',
      area: 'Nhà đất và bất động sản',
      placename: 'Việt Nam',
      author: 'Nguồn Nhà Giá Rẻ',
      owner: 'Nguồn Nhà Giá Rẻ',
      distribution: 'Global',
      'revisit-after': '1 days',
      referrer: 'no-referrer-when-downgrade',
    },
  };
}
