export const revalidate = 18000; // 5 giờ 3600x5

import { slugify } from '@/lib/slugify';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { notFound, redirect } from 'next/navigation';
import ClientRentalPostDetailPage from './ClientRentalPostDetailPage';
import { generateRentalPostMetadata } from '@/metadata/id/rental-post.metadata';
import { StructuredData } from '@/metadata/structuredData';

// Đúng kiểu cho Next 15
type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

// Metadata động cho bài đăng
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const post = await rentalPostAdminService.getFallback(id);

  if (!post) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa. Khám phá thêm sản phẩm khác tại 7Teck.vn.',
      robots: 'noindex, nofollow',
    };
  }

  return generateRentalPostMetadata(post);
}
export default async function RentalPostPage({ params }: PageProps) {
  // Await params vì nó là Promise
  const { slug, id } = await params;

  const post = await rentalPostAdminService.getFallback(id);

  if (!post) notFound();
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: post.title,
    image: post.images[0],
    description: post.description || `${post.description} tại https://www.nguonnhagiare.vn/`,
    sku: post._id,
    brand: {
      '@type': 'Brand',
      name: 'NguonNhaGiare.vn',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/dien-thoai/${slugify(post.title)}/${post._id}`,
      priceCurrency: 'VND',
      price: post.price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };
  const correctSlug = slugify(post.title || '');
  if (slug !== correctSlug) {
    redirect(`/${correctSlug}/${id}`);
  }

  return (
    <>
      <StructuredData data={jsonLd} />
      <ClientRentalPostDetailPage post={post} />
    </>
  );
}
