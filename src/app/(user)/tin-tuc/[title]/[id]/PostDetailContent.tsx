'use client';
import Link from 'next/link';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import CatalogSidebar from './CatalogSidebar';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';

interface PostDetailContentProps {
  post: IPost;
  catalogWithPosts?: {
    catalog: IPostCategory;
    posts: IPost[];
  }[];
  onSelectPost: (post: IPost) => void;
}

export default function PostDetailContent({ post, catalogWithPosts, onSelectPost }: PostDetailContentProps) {
  return (
    <div className="flex flex-col items-start justify-center gap-10 xl:flex-row">
      {/* Content */}
      <article className="mb-10 xl:w-[40vw]">
        <h1 className="py-5 text-3xl font-bold">{post.title}</h1>

        <p className="text-sm font-normal">Danh mục:&nbsp;{post.catalog.name}</p>

        <p className="text-xs text-blue-500">
          {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
          &nbsp;(
          <TimeAgo date={post.updatedAt} />)
        </p>

        <hr className="my-2" />

        <div className="text-base font-light text-default" dangerouslySetInnerHTML={{ __html: post.content }} />

        <hr className="my-2" />

        {post.source && (
          <div>
            <span>Nguồn:&nbsp;</span>
            <Link href={post.source} target="_blank" className="line-clamp-1 italic text-blue-500">
              {post.source}
            </Link>
          </div>
        )}
      </article>

      {/* Sidebar desktop */}
      <aside className="hidden xl:block xl:w-[30vw]">
        <CatalogSidebar catalogWithPosts={catalogWithPosts} onSelectPost={onSelectPost} />
      </aside>
    </div>
  );
}
