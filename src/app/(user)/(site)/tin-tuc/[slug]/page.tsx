import { postService } from '@/services/post/post.service';
import ClientPostDetailPage from './ClientPostDetailPage';

type PageProps = {
  params: Promise<{ slug: string; }>;
};
export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const post = await postService.getBySlug(slug);

  return <ClientPostDetailPage post={post} relatedPosts={[]} catalogWithPosts={[]} />;
}
