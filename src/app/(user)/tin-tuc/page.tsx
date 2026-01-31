import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { postService } from '@/services/post.service';
import ClientNewsPage from './ClientNewsPage';

export default async function NewsPage() {
  const news = await postService.getAll();
  if (!news) {
    return <ErrorLoading />;
  }
  return <ClientNewsPage news={news} />;
}
