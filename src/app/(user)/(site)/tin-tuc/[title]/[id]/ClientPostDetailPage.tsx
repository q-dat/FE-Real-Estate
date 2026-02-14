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
import { useNavigateToPostDetail } from '@/hooks/useNavigateToPostDetail';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';

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
            <span className="text-sm font-normal">&nbsp;{post.catalog.name}</span>
          </li>
          <li>
            <span className="text-xs text-blue-500">
              {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
              &nbsp;(
              <TimeAgo date={post.updatedAt} />)
            </span>
          </li>
        </ul>
      </div>

      <div className="px-2">
        <PostDetailContent post={post} catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />
        <div className="xl:px-desktop-padding">
          <RelatedPosts relatedPosts={relatedPosts} />
        </div>
        <div className="block xl:hidden">
          <CatalogSidebar catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />
        </div>
      </div>
    </div>
  );
}
