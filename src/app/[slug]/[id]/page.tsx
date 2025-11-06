export const revalidate = 60;

import { notFound, redirect } from 'next/navigation';
import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { slugify } from '@/lib/slugify';
import ClientRentalPostDetailPage from './ClientRentalPostDetailPage';

// Đúng kiểu cho Next 15
type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function RentalPostPage({ params }: PageProps) {
  // Await params vì nó là Promise
  const { slug, id } = await params;

  const post = await rentalPostAdminService.getById(id);
  if (!post) notFound();

  const correctSlug = slugify(post.title || '');
  if (slug !== correctSlug) {
    redirect(`/${correctSlug}/${id}`);
  }

  return <ClientRentalPostDetailPage post={post} />;
}
