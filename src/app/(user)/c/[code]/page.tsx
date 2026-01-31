import { rentalPostAdminService } from '@/services/rentalPostAdmin.service';
import ClientRentalPostDetailPage from '../../[slug]/[id]/ClientRentalPostDetailPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    code?: string;
  }>;
}

export default async function PostByCodePage({ params }: PageProps) {
  const { code } = await params;

  if (!code) {
    notFound();
  }

  const post = await rentalPostAdminService.getByCode(code);

  if (!post) {
    notFound();
  }

  return <ClientRentalPostDetailPage post={post} />;
}
