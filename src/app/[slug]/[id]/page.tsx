import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { slugify } from '@/lib/slugify';
import { notFound, redirect } from 'next/navigation';
import ClientRentalPostDetailPage from './ClientRentalPostDetailPage';

interface PageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default async function RentalPostPage({ params }: PageProps) {
  const { slug, id } = params;

  const post = await rentalPostAdminService.getById(id);
  if (!post) notFound();

  const correctSlug = slugify(post.title || '');
  if (slug !== correctSlug) {
    redirect(`/${correctSlug}/${id}`);
  }

  return <ClientRentalPostDetailPage post={post} />;
}
