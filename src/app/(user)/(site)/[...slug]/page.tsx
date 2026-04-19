import { slugify } from '@/lib/slugify';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { notFound, permanentRedirect } from 'next/navigation';
import ClientRentalPostDetailPage from './ClientRentalPostDetailPage';
import { generateRentalPostMetadata } from '@/metadata/id/rental-post.metadata';
import { StructuredData } from '@/metadata/structuredData';

export const revalidate = 18000; // 5 giờ

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

// Hàm tiện ích nội bộ để bóc tách URL
const parseSlugArray = (slugArray: string[]) => {
  let rawSlug = '';
  let potentialId = '';
  let isUsingSlash = false;

  if (slugArray.length > 1) {
    // Xử lý URL cũ dạng: /slug/id
    rawSlug = slugArray[0];
    potentialId = slugArray[slugArray.length - 1];
    isUsingSlash = true;
  } else {
    // Xử lý URL mới chuẩn SEO dạng: /slug-id
    const parts = slugArray[0].split('-');
    potentialId = parts.pop() || '';
    rawSlug = parts.join('-');
  }

  return { rawSlug, potentialId, isUsingSlash };
};

// Metadata động
export async function generateMetadata({ params }: PageProps) {
  const { slug: slugArray } = await params;

  if (!slugArray || slugArray.length === 0) return {};

  const { potentialId } = parseSlugArray(slugArray);
  const isMongoId = /^[a-fA-F0-9]{24}$/.test(potentialId);

  if (!isMongoId) {
    return {
      title: 'Không tìm thấy bất động sản - NguonNhaGiare.vn',
      description: 'Bất động sản không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  const post = await rentalPostAdminService.getFallback(potentialId);

  if (!post) {
    return {
      title: 'Không tìm thấy bất động sản - NguonNhaGiare.vn',
      description: 'Bất động sản không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  return generateRentalPostMetadata(post);
}

// Render Page
export default async function RentalPostPage({ params }: PageProps) {
  const { slug: slugArray } = await params;

  if (!slugArray || slugArray.length === 0) {
    return notFound();
  }

  const { rawSlug, potentialId, isUsingSlash } = parseSlugArray(slugArray);
  const isMongoId = /^[a-fA-F0-9]{24}$/.test(potentialId);

  if (!isMongoId) {
    return notFound();
  }

  const post = await rentalPostAdminService.getFallback(potentialId);

  if (!post) {
    return notFound();
  }

  const correctSlug = slugify(post.title || '');

  // Self-healing URL & Redirect 301
  if (isUsingSlash || rawSlug !== correctSlug) {
    permanentRedirect(`/${correctSlug}-${post._id}`);
  }

  // Tối ưu hóa lại URL trong Schema JSON-LD
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${correctSlug}-${post._id}`;

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: post.title,
    image: post.images?.[0] || '',
    description: post.description || `${post.title} tại https://www.nguonnhagiare.vn/`,
    sku: post._id,
    brand: {
      '@type': 'Brand',
      name: 'NguonNhaGiare.vn',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'VND',
      price: post.price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <ClientRentalPostDetailPage post={post} />
    </>
  );
}
