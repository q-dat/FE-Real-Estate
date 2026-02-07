'use client';
import Link from 'next/link';
import CatalogSidebar from './CatalogSidebar';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';
import { Space } from '@/components/userPage/ui/space/Space';

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
      <article className="mb-10 w-full xl:w-[45vw]">
        <h1 className="py-5 text-3xl font-bold">{post.title}</h1>
        <p className="text-sm font-normal">
          <span>Sự kiện:&nbsp;</span>
          <span className="text-primary">{post.catalog.name}</span>
        </p>{' '}
        <Space />
        <div className="relative overflow-hidden">
          <article
            className="prose-base xl:prose-lg prose max-w-none leading-relaxed [&_*]:max-w-full [&_img]:h-auto [&_img]:!max-w-full [&_img]:object-contain"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        <Space />
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
