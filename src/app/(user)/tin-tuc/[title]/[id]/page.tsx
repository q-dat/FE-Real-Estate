// export const revalidate = 18000;

// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
// import ClientPostDetailPage from './ClientPostDetailPage';

// import { postService } from '@/services/post.service';

// import { IPost } from '@/types/post/post.types';
// import { IPostCategory } from '@/types/post/post-category.types';
// import { postCategoryService } from '@/services/postCategory.service';

// type RouteParams = {
//   title: string;
//   id: string;
// };

// export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
//   const post = await postService.getPostById(params.id);

//   if (!post) {
//     return {
//       title: 'Bài viết không tồn tại',
//       description: 'Bài viết bạn tìm không tồn tại hoặc đã bị xóa',
//     };
//   }

//   const description = post.content.replace(/<[^>]+>/g, '').slice(0, 160);

//   return {
//     title: post.title,
//     description,
//     openGraph: {
//       title: post.title,
//       description,
//       images: post.image ? [post.image] : [],
//       type: 'article',
//     },
//   };
// }

// export default async function PostDetailPage({ params }: { params: RouteParams }) {
//   const post: IPost | null = await postService.getPostById(params.id);

//   if (!post) {
//     notFound();
//   }

//   /* Related posts (same category) */
//   const relatedPosts = (await postService.getAll()).filter((p) => p.catalog?.name === post.catalog.name && p._id !== post._id);

//   /* Categories */
//   const categories: IPostCategory[] = await postCategoryService.getAll();

//   const catalogWithPosts = await Promise.all(
//     categories
//       .filter((c) => c.name !== post.catalog.name)
//       .map(async (catalog) => ({
//         catalog,
//         posts: (await postService.getAll()).filter((p) => p.catalog?.name === catalog.name),
//       }))
//   );

//   /* JSON-LD */
//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Article',
//     headline: post.title,
//     image: post.image ? [post.image] : [],
//     datePublished: post.createdAt,
//     dateModified: post.updatedAt,
//     author: {
//       '@type': 'Organization',
//       name: '7Teck',
//     },
//     publisher: {
//       '@type': 'Organization',
//       name: '7Teck',
//       logo: {
//         '@type': 'ImageObject',
//         url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
//       },
//     },
//     description: post.content.replace(/<[^>]+>/g, '').slice(0, 160),
//     mainEntityOfPage: {
//       '@type': 'WebPage',
//       '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${params.title}/${post._id}`,
//     },
//   };

//   return (
//     <>
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
//       <ClientPostDetailPage post={post} relatedPosts={relatedPosts} catalogWithPosts={catalogWithPosts} />
//     </>
//   );
// }
