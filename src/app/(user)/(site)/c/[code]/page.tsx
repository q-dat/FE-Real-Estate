import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { notFound, redirect } from 'next/navigation';
import { slugify } from '@/lib/slugify';

// export const dynamic = 'force-dynamic'; //cache dev
export const revalidate = 86400; //24h

interface PageProps {
  params: Promise<{
    code?: string;
  }>;
}

export default async function PostByCodePage({ params }: PageProps) {
  const { code } = await params;

  if (!code) {
    return notFound();
  }

  const post = await rentalPostAdminService.getByCode(code);

  if (!post || !post._id) {
    return notFound();
  }

  const correctSlug = slugify(post.title || '');
  const canonicalUrl = `/${correctSlug}-${post._id}`;

  // // Log ra terminal để chắc chắn code đã chạy đến đây và URL tạo ra chính xác
  // console.log('=== REDIRECTING TO ===', canonicalUrl);

  // Dùng redirect thay cho permanentRedirect để test
  redirect(canonicalUrl);
}
