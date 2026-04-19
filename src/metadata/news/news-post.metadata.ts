import { slugify } from '@/lib/slugify';
import { IPost } from '@/types/post/post.types';
import { Metadata } from 'next';

// Hàm xử lý và chuẩn hóa mảng từ khóa
function normalizeKeywords(input: string[]): string[] {
  return Array.from(new Set(input.map((item) => item?.toLowerCase().trim()).filter(Boolean)));
}

// Hàm build từ khóa thông minh cho bài tin tức
function buildNewsKeywords(post: IPost): string[] {
  const base: string[] = [post.title, post.catalog, 'thị trường bất động sản', 'kinh nghiệm mua nhà', 'kiến thức nhà đất'].filter(
    Boolean
  ) as string[];

  // Nếu bài viết có gắn tags riêng từ Admin, đưa tags lên ưu tiên
  const tags = 'nguonnhagiare';
  //   post.tags && Array.isArray(post.tags) ? post.tags : [];

  const rawKeywords = [...tags, ...base];

  return normalizeKeywords(rawKeywords);
}

export function generateNewsPostMetadata(post: IPost): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';

  // 1. CHUẨN HÓA URL: Nối ID bằng gạch ngang, nằm trong thư mục /tin-tuc/
  const slug = post.slug || slugify(post.title || '');
  const canonicalUrl = `${siteUrl}/tin-tuc/${slug}-${post._id}`;

  // 2. GIỚI HẠN KEYWORDS: Max 15 từ khóa cụm (long-tail) để tránh bị coi là spam
  const keywords = buildNewsKeywords(post).slice(0, 15);

  // 3. TỐI ƯU TITLE: Giữ khoảng 60-65 ký tự
  // Bổ sung hậu tố tên thương hiệu để tăng nhận diện (Branding)
  const title = `${post.title} | Nguồn Nhà Giá Rẻ`;

  // 4. TỐI ƯU DESCRIPTION: Lấy excerpt hoặc cắt description, thêm lời kêu gọi hành động
  const rawDescription = post.content?.replace(/<[^>]*>?/gm, '') || '';
  const description =
    rawDescription.length > 155
      ? `${rawDescription.slice(0, 155)}...`
      : `${rawDescription} Đọc thêm tin tức thị trường và mẹo hay bất động sản tại Nguồn Nhà Giá Rẻ.`;

  // 5. TỐI ƯU HÌNH ẢNH (Thumbnail bài viết)
  const imageUrl = post.image || '';
  const images = imageUrl
    ? [
        {
          url: imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: post.title || 'Tin tức bất động sản',
        },
      ]
    : [
        {
          url: `${siteUrl}/images/news-default-thumbnail.jpg`, // Cần chuẩn bị 1 ảnh fallback
          width: 1200,
          height: 630,
          alt: 'Tin tức Nguồn Nhà Giá Rẻ',
        },
      ];

  // Các mốc thời gian phục vụ SEO báo chí/tin bài (Rất quan trọng)
  const publishedTime = post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
  const modifiedTime = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedTime;

  return {
    title,
    description,
    keywords,
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
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Nguồn Nhà Giá Rẻ',
      type: 'article', // Báo cho Google/Facebook đây là bài viết chuyên sâu
      locale: 'vi_VN',
      images,
      publishedTime, // Thời điểm đăng bài
      modifiedTime, // Thời điểm cập nhật bài
      authors: ['Nguồn Nhà Giá Rẻ'],
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
      classification: 'Tin tức Bất động sản',
      author: 'Nguồn Nhà Giá Rẻ',
      owner: 'Nguồn Nhà Giá Rẻ',
      distribution: 'Global',
    },
  };
}
