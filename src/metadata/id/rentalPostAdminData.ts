import { slugify } from '@/lib/slugify';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { Metadata } from 'next';

export function generateRentalPostMetadata(post: IRentalPostAdmin): Metadata {
  const slug = slugify(post.title);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';
  const url = `${siteUrl}/${slug}/${post._id}`;

  const title = `${post.title} - Cho Thuê ${post.area}m² tại ${post.province} - ${siteUrl}`;
  const description =
    post.description ||
    `Khám phá bất động sản cho thuê: ${post.title}, diện tích ${post.area}m², giá ${post.price.toLocaleString()} ${post.priceUnit} tại ${post.province}. Xem ngay trên ${siteUrl}`;

  // chuẩn hóa ảnh: prepend siteUrl nếu ảnh local
  const images = post.images?.length
    ? post.images.map((img) => ({
        url: img.startsWith('http') ? img : `${siteUrl}${img}`,
        width: 1200,
        height: 630,
        alt: `${post.title} - Cho thuê tại ${post.province}`,
      }))
    : [];

  return {
    title,
    description,
    keywords: [
      post.title,
      `cho thuê ${post.category.name}`,
      `bất động sản ${post.province}`,
      `${post.area}m² cho thuê`,
      siteUrl,
      'cho thuê nhanh',
      `${post.price.toLocaleString()} ${post.priceUnit}`,
    ],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteUrl,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
