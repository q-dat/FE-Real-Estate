import { interiorService } from '@/services/interior.service';
import ClientInteriorDetailPage from './ClientInteriorDetailPage';
import { notFound } from 'next/navigation';

// Đúng kiểu cho Next 15
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InteriorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const interior = await interiorService.getFallback(id);

  if (!interior) {
    notFound();
  }

  return (
    <>
      <ClientInteriorDetailPage interior={interior} />
    </>
  );
}
