import { notFound } from 'next/navigation';
import { realEstateProjectService } from '@/services/realEstateProjectService';
import ClientRealEstateProjectDetailPage from './ClientRealEstateProjectDetailPage';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RealEstateProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const project = await realEstateProjectService.getBySlug(slug);

  if (!project) notFound();

  return <ClientRealEstateProjectDetailPage project={project} />;
}
