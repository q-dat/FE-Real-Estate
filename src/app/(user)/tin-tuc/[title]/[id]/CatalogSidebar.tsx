'use client';
import Image from 'next/image';
import { IPost } from '@/types/post/post.types';
import { IPostCategory } from '@/types/post/post-category.types';

interface CatalogSidebarProps {
  catalogWithPosts?: {
    catalog: IPostCategory;
    posts: IPost[];
  }[];
  onSelectPost: (post: IPost) => void;
}

export default function CatalogSidebar({ catalogWithPosts = [], onSelectPost }: CatalogSidebarProps) {
  return (
    <div className="w-full py-5">
      <div className="flex flex-col gap-5">
        {catalogWithPosts.map((item) => (
          <div key={item.catalog._id} className="rounded-lg bg-white p-2 shadow transition-all hover:shadow-md">
            {/* Catalog title */}
            <p className="mb-3 text-lg font-semibold uppercase text-primary">{item.catalog.name}</p>

            {/* Posts */}
            {item.posts.length === 0 ? (
              <p className="text-sm text-gray-500">Không có bài viết nào trong danh mục này.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {item.posts.slice(0, 4).map((p) => (
                  <button
                    key={p._id}
                    onClick={() => onSelectPost(p)}
                    className="group flex w-full gap-3 text-left transition-colors hover:text-primary"
                  >
                    {/* Image */}
                    <div className="h-full w-1/3 overflow-hidden rounded-md">
                      <Image
                        src={p.image || ''}
                        width={300}
                        height={300}
                        loading="lazy"
                        alt={p.title}
                        className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex w-full flex-col justify-between">
                      <p className="line-clamp-4 text-sm font-semibold text-black transition-colors group-hover:text-primary xl:text-base">
                        {p.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
