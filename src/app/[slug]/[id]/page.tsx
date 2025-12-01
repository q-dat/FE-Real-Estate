export const revalidate = 18000; // 5 giờ 3600x5

import { slugify } from '@/lib/slugify';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { notFound, redirect } from 'next/navigation';
import ClientRentalPostDetailPage from './ClientRentalPostDetailPage';
import { generateRentalPostMetadata } from '@/metadata/id/rentalPostAdminData';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';
import { Metadata } from 'next';

// Đúng kiểu cho Next 15
type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

// Metadata động cho bài đăng
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post: IRentalPostAdmin | null = await rentalPostAdminService.getFallback(id);

  if (!post) return { title: 'Bài đăng không tồn tại' };

  return generateRentalPostMetadata(post);
}
export default async function RentalPostPage({ params }: PageProps) {
  // Await params vì nó là Promise
  const { slug, id } = await params;

  const post = await rentalPostAdminService.getFallback(id);

  if (!post) notFound();

  const correctSlug = slugify(post.title || '');
  if (slug !== correctSlug) {
    redirect(`/${correctSlug}/${id}`);
  }

  return <ClientRentalPostDetailPage post={post} />;
}
