export const revalidate = 0;

import { rentalCategoryService } from '@/services/rental/rentalCategory.service';
import ClientRentalPostAdminPage from './ClientRentalPostAdminPage';

export default async function RentalPostAdminPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientRentalPostAdminPage posts={[]} categories={Array.isArray(categories) ? categories : []} />;
}
