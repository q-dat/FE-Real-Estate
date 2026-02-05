export const revalidate = 0;

import ClientRentalPostAdminPage from '@/app/(admin)/cms/admin/rental-post-admin/ClientRentalPostAdminPage';
import { rentalCategoryService } from '@/services/rental/rentalCategory.service';

export default async function RentalPostAdminPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientRentalPostAdminPage posts={[]} categories={Array.isArray(categories) ? categories : []} />;
}
