import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import ClientRentalPostDetailPage from '../../[slug]/[id]/ClientRentalPostDetailPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    code?: string;
  }>;
}

const CODE_REGEX = /^[A-Z0-9]{6,10}$/;

export default async function PostByCodePage({ params }: PageProps) {
  const { code } = await params;

  if (!code || !CODE_REGEX.test(code)) {
    notFound();
  }

  const post = await rentalPostAdminService.getByCode(code);

  if (!post) {
    notFound();
  }

  return <ClientRentalPostDetailPage post={post} />;
}
