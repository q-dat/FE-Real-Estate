'use client';
import { useRouter } from 'next/navigation';
import { IPost } from '@/types/post/post.types';
import { NEWS_BASE_PATH } from '@/app/(user)/(site)/tin-tuc';
import { slugify } from '@/lib/slugify';
interface NavigateOptions {
  scroll?: boolean;
}

export function useNavigateToPostDetail() {
  const router = useRouter();

  const navigateToPostDetail = (post: IPost, options?: NavigateOptions): void => {
    const titleSlug = slugify(post.title);
    router.push(`${NEWS_BASE_PATH}/${titleSlug}/${post._id}`);
    if (options?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { navigateToPostDetail };
}
