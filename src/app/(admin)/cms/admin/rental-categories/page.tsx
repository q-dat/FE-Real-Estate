export const revalidate = 0;

import { rentalCategoryService } from '@/services/rental/rentalCategory.service';
import ClientCategoryPage from './ClientRentalCategoryPage';

export default async function CategoryPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientCategoryPage categories={Array.isArray(categories) ? categories : []} />;
}
