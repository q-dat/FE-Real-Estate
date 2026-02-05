export const revalidate = 0;

import ClientRentalCategoryPage from '@/app/(admin)/cms/admin/rental-categories/ClientRentalCategoryPage';
import { rentalCategoryService } from '@/services/rental/rentalCategory.service';

export default async function CategoryPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientRentalCategoryPage categories={Array.isArray(categories) ? categories : []} />;
}
