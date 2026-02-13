'use client';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { IPost } from '@/types/post/post.types';
import { NEWS_BASE_PATH } from '@/app/(user)/(site)/tin-tuc';

interface NavigateOptions {
  scroll?: boolean;
}

export function useNavigateToPostDetail() {
  const router = useRouter();

  const navigateToPostDetail = (post: IPost, options?: NavigateOptions): void => {
    const titleSlug = encodeURIComponent(slugify(post.title));
    router.push(`${NEWS_BASE_PATH}/${titleSlug}/${post._id}`);

    if (options?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { navigateToPostDetail };
}
