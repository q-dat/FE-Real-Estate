'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/orther/loading/LoadingSpinner';
import CatalogSidebar from './CatalogSidebar';
import RelatedPosts from './RelatedPosts';
import PostDetailContent from './PostDetailContent';
import PostNotFound from './PostNotFound';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';
import { scrollToTopInstantly } from '@/utils/utils/scrollToTop.utils';
import { useNavigateToPostDetail } from '@/hooks/useNavigateToPostDetail';

interface ClientPostDetailPageProps {
  post: IPost | null;
  relatedPosts?: IPost[];
  catalogWithPosts?: {
    catalog: IPostCategory;
    posts: IPost[];
  }[];
}

export default function ClientPostDetailPage({ post, relatedPosts = [], catalogWithPosts }: ClientPostDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const { navigateToPostDetail } = useNavigateToPostDetail();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    scrollToTopInstantly();
    setMounted(true);
  }, [id]);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return <PostNotFound />;
  }

  return (
    <div className="py-[60px] pt-mobile-padding-top xl:pt-desktop-padding-top">
      <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
        <ul className="font-light">
          <li>
            <Link href="/">Trang Chủ</Link>
          </li>
          <li>
            <span>{post.title}</span>
          </li>
        </ul>
      </div>

      <div className="px-2">
        <PostDetailContent post={post} catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />

        <RelatedPosts relatedPosts={relatedPosts} />

        <div className="block xl:hidden">
          <CatalogSidebar catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />
        </div>
      </div>
    </div>
  );
}
