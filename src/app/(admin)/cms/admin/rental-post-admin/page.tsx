export const revalidate = 0;

import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { rentalCategoryService } from '@/services/rentalCategoryService';
import ClientRentalPostAdminPage from './ClientRentalPostAdminPage';

export default async function RentalPostAdminPage() {
  const posts = await rentalPostAdminService.getAll();
  const categories = await rentalCategoryService.getAll();

  return <ClientRentalPostAdminPage posts={Array.isArray(posts) ? posts : []} categories={Array.isArray(categories) ? categories : []} />;
}
