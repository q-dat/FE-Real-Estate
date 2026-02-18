'use client';
import { useRouter } from 'next/navigation';
import { IPost } from '@/types/post/post.types';
import { NEWS_BASE_PATH } from '@/app/(user)/(site)/tin-tuc';
import slugify from 'slugify';
interface NavigateOptions {
  scroll?: boolean;
}

export function useNavigateToPostDetail() {
  const router = useRouter();

  const navigateToPostDetail = (post: IPost, options?: NavigateOptions): void => {
    const titleSlug = slugify(post.title, {
      lower: true,
      strict: true,
      trim: true,
      locale: 'vi',
    });
    // router.push(`${NEWS_BASE_PATH}/${titleSlug}/${post._id}`);
    router.push(`${NEWS_BASE_PATH}/${titleSlug}`);

    if (options?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { navigateToPostDetail };
}
