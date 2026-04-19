import { slugify } from '@/lib/slugify';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { Metadata } from 'next';

// TỐI ƯU 1: Bỏ hàm split để giữ nguyên cụm từ khóa dài (long-tail keywords)
function normalizeKeywords(input: string[]): string[] {
  return Array.from(new Set(input.map((item) => item.toLowerCase().trim()).filter(Boolean)));
}

function buildKeywords(post: IRentalPostAdmin): string[] {
  const base: string[] = [post.title, `${post.district} ${post.province}`, post.category?.name].filter(Boolean) as string[];

  const categoryCode = post.category?.categoryCode;
  let rawKeywords: string[] = [];

  switch (categoryCode) {
    case 0:
      rawKeywords = [...base, 'mua bán nhà đất', 'bán nhà đất', `bán nhà ${post.district}`, `bất động sản bán ${post.province}`];
      break;
    case 1:
      rawKeywords = [...base, 'căn hộ cho thuê', 'thuê căn hộ', `cho thuê căn hộ ${post.district}`, `căn hộ cho thuê ${post.province}`];
      break;
    case 2:
      rawKeywords = [...base, 'nhà nguyên căn cho thuê', 'thuê nhà nguyên căn', `cho thuê nhà ${post.district}`, `nhà cho thuê ${post.province}`];
      break;
    case 3:
      rawKeywords = [...base, 'cho thuê mặt bằng', 'mặt bằng kinh doanh', `thuê mặt bằng ${post.district}`, `mặt bằng ${post.province}`];
      break;
    default:
      rawKeywords = [...base, 'bất động sản', 'nhà đất'];
  }

  return normalizeKeywords(rawKeywords);
}

export function generateRentalPostMetadata(post: IRentalPostAdmin): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';

  // TỐI ƯU 2: Sửa lại Canonical URL thành chuẩn định dạng nối ID bằng gạch ngang
  const slug = slugify(post.title || '');
  const canonicalUrl = `${siteUrl}/${slug}-${post._id}`;

  // Giới hạn từ khóa tối đa
  const keywords = buildKeywords(post).slice(0, 15);

  // TỐI ƯU 3: Rút gọn Title thông minh để tránh bị Google cắt cụt (Limit ~65 chars)
  // Ưu tiên: Title gốc > Giá > Diện tích > Quận
  const titleParts = [post.title, post.price ? `${post.price} ${post.priceUnit}` : null, post.area ? `${post.area}m²` : null].filter(Boolean);

  const title = titleParts.join(' | ');

  const description =
    post.description?.slice(0, 155) ||
    `${post.title}. ${post.category?.name || 'Bất động sản'} tại ${post.district}, ${post.province}. ${
      post.area ? `Diện tích ${post.area}m².` : ''
    } ${post.price ? `Giá: ${post.price} ${post.priceUnit}.` : ''} Liên hệ ngay!`;

  const images =
    post.images?.length > 0
      ? post.images.map((img) => ({
          url: img.startsWith('http') ? img : `${siteUrl}${img}`,
          width: 1200,
          height: 630,
          alt: post.title || 'Bất động sản Nguồn Nhà Giá Rẻ',
        }))
      : [
          {
            // Nên cung cấp 1 ảnh fallback mặc định nếu bài đăng không có ảnh
            url: `${siteUrl}/images/default-thumbnail.jpg`,
            width: 1200,
            height: 630,
            alt: 'Nguồn Nhà Giá Rẻ',
          },
        ];

  return {
    title,
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
      nocache: false, // Cho phép Google lưu cache
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Nguồn Nhà Giá Rẻ',
      type: 'article', // Bài viết cụ thể nên dùng 'article' tốt hơn 'website'
      locale: 'vi_VN',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
    // Giữ nguyên các tag hỗ trợ indexing local của bạn
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
