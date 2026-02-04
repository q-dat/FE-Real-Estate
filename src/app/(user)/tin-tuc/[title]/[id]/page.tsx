import { postService } from '@/services/post/post.service';
import ClientPostDetailPage from './ClientPostDetailPage';

type PageProps = {
  params: Promise<{ title: string; id: string }>;
};
export default async function page({ params }: PageProps) {
  const { id } = await params;
  const post = await postService.getFallback(id);

  return (
    <ClientPostDetailPage
      post={post}
      //  relatedPosts={relatedPosts} catalogWithPosts={catalogWithPosts}
    />
  );
}
