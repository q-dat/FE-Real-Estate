import { rentalCategoryService } from '@/services/rentalCategoryService';
import ClientCategoryPage from './ClientRentalCategoryPage';

export default async function CategoryPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientCategoryPage categories={Array.isArray(categories) ? categories : []} />;
}
