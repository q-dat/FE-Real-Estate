export const revalidate = 0;

import { postService } from '@/services/postService';
import ClientPostAdminPage from './ClientPostAdminPage';
import { postCategoryService } from '@/services/postCategoryService';

export default async function PostAdminPage() {
  const posts = await postService.getAll();
  const categories = await postCategoryService.getAll();

  return <ClientPostAdminPage posts={Array.isArray(posts) ? posts : []} categories={categories} />;
}
