export const revalidate = 0;

import { interiorCategoryService } from '@/services/interiorCategory.service';
import ClientInteriorCategoryPage from './ClientInteriorCategoryPage';

export default async function InteriorCategoryPage() {
  const categories = await interiorCategoryService.getAll();

  return <ClientInteriorCategoryPage categories={Array.isArray(categories) ? categories : []} />;
}
